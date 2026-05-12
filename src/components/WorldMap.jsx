import { useState, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
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

export default function WorldMap({ currentYear, selectedCategories, selectedEntities, onEventSelect }) {
  const [cities, setCities] = useState([])
  const [events, setEvents] = useState([])
  const [hoveredEvent, setHoveredEvent] = useState(null)
const [hoveredCluster, setHoveredCluster] = useState(null)
  const [viewState, setViewState] = useState({
    longitude: 20, latitude: 25, zoom: 2.5
  })

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
        .select('*, entities(name, colour)')
        .lte('year', currentYear)
        .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 3},year.lte.${currentYear})`)
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['none'])
        .in('entity_id', selectedEntities.length > 0 ? selectedEntities : [0])
      if (error) console.error('Events error:', error)
      else setEvents(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear, selectedCategories, selectedEntities])

  const clusters = clusterEvents(
    events.filter(e => e.longitude && e.latitude),
    clusterRadius
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
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
      </Map>
    </div>
  )
}