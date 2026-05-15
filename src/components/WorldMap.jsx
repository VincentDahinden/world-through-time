import { useState, useEffect, useMemo } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'

const categoryIcons = {
  'Governance & Law':          '⚖️',
  'Military & Conflict':       '⚔️',
  'Built Environment':         '🏛️',
  'Religion & Belief':         '✝️',
  'Economy & Trade':           '💰',
  'Society & Demographics':    '👥',
  'Science & Knowledge':       '🔭',
  'Culture & Arts':            '🎨',
  'Power & Succession':        '👑',
  'Environment & Ecology':     '🌿',
  'Collapse & Transformation': '💥',
}

const categoryColors = {
  'Governance & Law':          '#1565c0',
  'Military & Conflict':       '#b71c1c',
  'Built Environment':         '#4e342e',
  'Religion & Belief':         '#6a1b9a',
  'Economy & Trade':           '#2e7d32',
  'Society & Demographics':    '#00695c',
  'Science & Knowledge':       '#283593',
  'Culture & Arts':            '#e65100',
  'Power & Succession':        '#4a148c',
  'Environment & Ecology':     '#558b2f',
  'Collapse & Transformation': '#c62828',
}

// Simple clustering — group events within a degree radius
function clusterEvents(events, radius) {
  const clusters = []
  const used = new Set()

  events.forEach((event, i) => {
    if (used.has(i)) return
    const group = [event]
    used.add(i)

    events.forEach((other, j) => {
      if (used.has(j)) return
      const dlat = Math.abs(event.latitude - other.latitude)
      const dlng = Math.abs(event.longitude - other.longitude)
      if (dlat < radius && dlng < radius) {
        group.push(other)
        used.add(j)
      }
    })

    // Cluster centre = average position
    const lat = group.reduce((s, e) => s + e.latitude, 0) / group.length
    const lng = group.reduce((s, e) => s + e.longitude, 0) / group.length

    // Dominant category
    const catCount = {}
    group.forEach(e => { catCount[e.category] = (catCount[e.category] || 0) + 1 })
    const dominantCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0][0]

    clusters.push({ lat, lng, events: group, dominantCat })
  })

  return clusters
}

export default function WorldMap({ currentYear, selectedCategories, selectedEntities, onEventSelect, selectedEvent, onZoomChange }) {
  const [cities, setCities] = useState([])
  const [events, setEvents] = useState([])
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [hoveredCluster, setHoveredCluster] = useState(null)
  const [viewState, setViewState] = useState({
    longitude: 20, latitude: 25, zoom: 2.5
  })
  const [entityRulers, setEntityRulers] = useState([])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('rulers')
        .select('entity_id, coat_of_arms_url, entities(territory_lat, territory_lng, name)')
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .not('coat_of_arms_url', 'is', null)
      if (error) console.error('Rulers error:', error)
        else {
          const unique = Object.values(
            (data || []).reduce((acc, r) => {
              if (!acc[r.entity_id]) acc[r.entity_id] = r
              return acc
            }, {})
          )
          console.log('entityRulers:', unique)
          setEntityRulers(unique)
        }
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear])

  const fontSize = viewState.zoom < 4 ? 0 : Math.max(6, Math.min(18, (viewState.zoom - 2) * 4))
  const showIndividual = viewState.zoom >= 5
const clusterRadius = viewState.zoom < 3 ? 5 : showIndividual ? 0.3 : 4

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .lte('active_from', currentYear)
        .or(`active_to.is.null,active_to.gte.${currentYear}`)
      if (error) console.error('Cities error:', error)
      else setCities(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, entities!events_entity_id_fkey(name, colour)')
        .lte('year', currentYear)
        .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 3},year.lte.${currentYear})`)
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['none'])
        .in('entity_id', selectedEntities.length > 0 ? selectedEntities : [0])
      if (error) console.error('Events error:', error)
      else setEvents(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear, selectedCategories, selectedEntities])

  // Build arc GeoJSON when event has two coordinate pairs
  const [arcProgress, setArcProgress] = useState(0)

  useEffect(() => {
    if (!selectedEvent?.latitude_2) return
    setArcProgress(0)
    let step = 0
    const interval = setInterval(() => {
      step += 2
      setArcProgress(step)
      if (step >= 100) clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [selectedEvent])

  const arcGeoJSON = useMemo(() => {
    if (!selectedEvent?.latitude) return null
    if (selectedEvent.category !== 'Military & Conflict') return null

    // Use explicit origin if set, otherwise fall back to entity territory
    const entityRuler = entityRulers.find(r => r.entity_id === selectedEvent.entity_id)
    const originLat = selectedEvent.latitude_2 ?? entityRuler?.entities?.territory_lat
    const originLng = selectedEvent.longitude_2 ?? entityRuler?.entities?.territory_lng

    if (!originLat || !originLng) return null
    const steps = 100
    const coords = []
    for (let i = 0; i <= arcProgress; i++) {
      const t = i / steps
      const lat = originLat + (selectedEvent.latitude - originLat) * t
      const lng = originLng + (selectedEvent.longitude - originLng) * t
      const curve = Math.sin(Math.PI * t) * 0.8
      coords.push([lng, lat + curve])
    }
    if (coords.length < 2) return null
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords }
      }]
    }
  }, [selectedEvent, arcProgress])

  const clusters = clusterEvents(
    events.filter(e => e.longitude && e.latitude),
    clusterRadius
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={e => { setViewState(e.viewState); onZoomChange(e.viewState.zoom) }}
        style={{ width: '100vw', height: 'calc(100vh - 410px)', marginTop: 410 }}
        mapStyle={`https://api.maptiler.com/maps/aquarelle/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
      >
        {/* City labels */}
        {cities.map(city => (
          <Marker key={city.id} longitude={city.longitude} latitude={city.latitude}>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: `${fontSize}px`,
              color: '#3a2a0a',
              textShadow: '1px 1px 2px #fff, -1px -1px 2px #fff',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              cursor: 'default',
              pointerEvents: 'none',
              letterSpacing: '0.5px',
              opacity: viewState.zoom < 4 ? 0 : 1,
            }}>
              {city.historical_name || city.modern_name}
            </div>
          </Marker>
        ))}

        {/* Clusters or individual markers */}
        {clusters.map((cluster, i) => {
          const isCluster = cluster.events.length > 1 && !showIndividual

          if (isCluster) {
            const color = cluster.events.every(e => e.category === cluster.events[0].category)
              ? categoryColors[cluster.dominantCat] || '#3a2a0a'
              : '#3a2a0a'
            const size = Math.min(14 + cluster.events.length * 2, 32)
          
            return (
              <Marker key={`cluster-${i}`} longitude={cluster.lng} latitude={cluster.lat}>
                <div
                  onMouseEnter={() => setHoveredCluster(i)}
                  onMouseLeave={() => setHoveredCluster(null)}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid #c8a96e',
                    color: '#f5e6c8',
                    fontFamily: 'Georgia, serif',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    opacity: 0.85
                  }}>
                    {cluster.events.length}
                  </div>
          
                  {hoveredCluster === i && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(58, 42, 10, 0.92)',
                      color: '#f5e6c8',
                      fontFamily: 'Georgia, serif',
                      fontSize: 11,
                      padding: '6px 10px',
                      borderRadius: 5,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 100,
                      marginBottom: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      {cluster.events.map(ev => (
                        <div key={ev.id}>
                          <span style={{ marginRight: 5 }}>
                            {categoryIcons[ev.category] || '📍'}
                          </span>
                          {ev.title}
                          <span style={{ color: '#c8a96e', marginLeft: 5, fontSize: 10 }}>
                            {ev.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Marker>
            )
          }

          // Show individual event markers
          return cluster.events.map(event => (
            <Marker
              key={event.id}
              longitude={event.longitude}
              latitude={event.latitude}
              onClick={() => onEventSelect && onEventSelect(event)}
            >
              <div
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{
                  fontSize: Math.max(10, Math.min(20, viewState.zoom * 3)),
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                  userSelect: 'none',
                  lineHeight: 1
                }}
              >
                {categoryIcons[event.category] || '📍'}
              </div>
            </Marker>
          ))
        })}

{entityRulers.map(ruler => (
          ruler.entities?.territory_lat && ruler.entities?.territory_lng && (
            <Marker
              key={`coa-${ruler.entity_id}`}
              longitude={ruler.entities.territory_lng}
              latitude={ruler.entities.territory_lat}
            >
              <div style={{
                width: 23, height: 23,
                background: 'rgba(253,246,227,0.85)',
                border: '1px solid #c8a96e',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
              }}>
                <img
                  src={ruler.coat_of_arms_url}
                  alt={ruler.entities.name}
                  style={{ width: 18, height: 18, objectFit: 'contain' }}
                />
              </div>
            </Marker>
          )
        ))}

              {/* Hover tooltip */}
        {hoveredEvent && (
          <Marker longitude={hoveredEvent.longitude} latitude={hoveredEvent.latitude}>
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(58, 42, 10, 0.92)',
              color: '#f5e6c8',
              fontFamily: 'Georgia, serif',
              fontSize: 11,
              padding: '5px 9px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 100,
              marginBottom: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              {hoveredEvent.title}
              <div style={{ fontSize: 10, color: '#c8a96e', marginTop: 2 }}>
                {hoveredEvent.year}{hoveredEvent.year_end ? `–${hoveredEvent.year_end}` : ''}
              </div>
            </div>
          </Marker>
        )}
      {arcGeoJSON && (
          <Source id="arc" type="geojson" data={arcGeoJSON}>
            <Layer
              id="arc-line"
              type="line"
              paint={{
                'line-color': '#9B1B30',
                'line-width': 2,
                'line-dasharray': [2, 1],
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  )
}