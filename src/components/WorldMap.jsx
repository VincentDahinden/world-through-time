import { useState, useEffect, useMemo } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'
import WorldSnapshot from './WorldSnapshot'

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
  'Society & Demographics':    '##00695c',
  'Science & Knowledge':       '#283593',
  'Culture & Arts':            '#e65100',
  'Power & Succession':        '#4a148c',
  'Environment & Ecology':     '#558b2f',
  'Collapse & Transformation': '#c62828',
}

const relationConfig = {
  war:               { color: '#c62828', width: 3,   dash: null,   icon: '⚔️',  pulse: 'fast'   },
  truce:             { color: '#e65100', width: 2,   dash: [4, 3], icon: '🕊️',  pulse: 'slow'   },
  rivalry:           { color: '#b71c1c', width: 1.5, dash: [2, 4], icon: '⚡',   pulse: null     },
  alliance:          { color: '#1565c0', width: 2.5, dash: null,   icon: '🤝',  pulse: null     },
  marriage_alliance: { color: '#6a1b9a', width: 2,   dash: null,   icon: '⚭',   pulse: 'gentle' },
  vassalage:         { color: '#4e342e', width: 1.5, dash: [2, 4], icon: '👑',  pulse: null     },
  peace:             { color: '#c8a96e', width: 1.5, dash: null,   icon: '☮️',  pulse: null     },
}

// Render order: bottom to top
const renderOrder = ['peace', 'vassalage', 'rivalry', 'truce', 'alliance', 'marriage_alliance', 'war']

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

    const lat = group.reduce((s, e) => s + e.latitude, 0) / group.length
    const lng = group.reduce((s, e) => s + e.longitude, 0) / group.length

    const catCount = {}
    group.forEach(e => { catCount[e.category] = (catCount[e.category] || 0) + 1 })
    const dominantCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0][0]

    clusters.push({ lat, lng, events: group, dominantCat })
  })

  return clusters
}

// Generate a curved arc between two points, offset perpendicularly by offsetIndex
function buildArcCoords(lat1, lng1, lat2, lng2, offsetIndex, steps = 60) {
  const dlat = lat2 - lat1
  const dlng = lng2 - lng1
  const len = Math.sqrt(dlat * dlat + dlng * dlng) || 1

  // Perpendicular unit vector
  const perpLat = -dlng / len
  const perpLng =  dlat / len

  // Base curve height + fan offset
  const baseCurve   = len * 0.5          // scales with distance
  const fanSpacing  = len * 0.25         // spacing between parallel arcs
  const totalOffset = baseCurve + offsetIndex * fanSpacing

  const coords = []
  for (let i = 0; i <= steps; i++) {
    const t   = i / steps
    const lat = lat1 + dlat * t + perpLat * Math.sin(Math.PI * t) * totalOffset
    const lng = lng1 + dlng * t + perpLng * Math.sin(Math.PI * t) * totalOffset
    coords.push([lng, lat])
  }
  return coords
}

export default function WorldMap({ currentYear, selectedCategories, selectedEntities, onEventSelect, selectedEvent }) {
  const [cities, setCities]             = useState([])
const [events, setEvents]             = useState([])
const [hoveredEvent, setHoveredEvent] = useState(null)
const [hoveredRelation, setHoveredRelation] = useState(null)
const [selectedRelation, setSelectedRelation] = useState(null)
const [hoveredCluster, setHoveredCluster] = useState(null)
  const [viewState, setViewState]       = useState({ longitude: 20, latitude: 25, zoom: 2.5 })
  const [entityRulers, setEntityRulers] = useState([])
  const [entityCoords, setEntityCoords] = useState({})
  const [relations, setRelations]       = useState([])
  

  // ── Fetch entity territory coords once ──────────────────────────────────
  useEffect(() => {
    async function fetchEntityCoords() {
      const { data } = await supabase
        .from('entities')
        .select('id, territory_lat, territory_lng')
      if (data) {
        const map = {}
        data.forEach(e => { map[e.id] = { lat: e.territory_lat, lng: e.territory_lng } })
        data.forEach(e => { map[e.id] = { lat: e.territory_lat, lng: e.territory_lng } })
        setEntityCoords(map)
      }
    }
    fetchEntityCoords()
  }, [])

  // ── Fetch active relations at currentYear ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('relations')
        .select('*')
        .lte('year_start', currentYear)
        .gte('year_end', currentYear)
      if (error) console.error('Relations error:', error)
        else {
          console.log('relations data:', data)
          setRelations(data || [])
        }
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear])

  // ── Build arc geometry for every active relation ─────────────────────────
  const relationArcs = useMemo(() => {
    // Group by canonical entity pair so we can fan them
    const pairGroups = {}
    relations.forEach(rel => {
      const key = [
        Math.min(rel.entity_id_1, rel.entity_id_2),
        Math.max(rel.entity_id_1, rel.entity_id_2),
      ].join('-')
      if (!pairGroups[key]) pairGroups[key] = []
      pairGroups[key].push(rel)
    })

    const arcs = []

    Object.values(pairGroups).forEach(group => {
      // Sort by render order so fanning is consistent
      group.sort((a, b) => renderOrder.indexOf(a.relation_type) - renderOrder.indexOf(b.relation_type))

      const n = group.length
      group.forEach((rel, idx) => {
        const c1 = entityCoords[rel.entity_id_1]
        const c2 = entityCoords[rel.entity_id_2]
        if (!c1 || !c2) return

        // Centre the fan around zero: −1, 0, +1 for 3 arcs; −0.5, +0.5 for 2 etc.
        const offsetIndex = idx - (n - 1) / 2

        const coords = buildArcCoords(c1.lat, c1.lng, c2.lat, c2.lng, offsetIndex)

        // Midpoint for the icon marker
        const mid = coords[Math.floor(coords.length / 2)]

        arcs.push({ rel, coords, midLng: mid[0], midLat: mid[1] })
      })
    })

    // Sort full list by render order so layers stack correctly
    arcs.sort((a, b) => renderOrder.indexOf(a.rel.relation_type) - renderOrder.indexOf(b.rel.relation_type))

    return arcs
  }, [relations, entityCoords])

  // ── Existing fetches ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('rulers')
        .select('entity_id, name, reign_start, reign_end, coat_of_arms_url, entities(territory_lat, territory_lng, name)')
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .not('entity_id', 'is', null)
      if (error) console.error('Rulers error:', error)
      else {
        const unique = Object.values(
          (data || []).reduce((acc, r) => {
            if (!acc[r.entity_id]) acc[r.entity_id] = r
            return acc
          }, {})
        )
        setEntityRulers(unique)
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear])

  const fontSize       = viewState.zoom < 4 ? 0 : Math.max(6, Math.min(18, (viewState.zoom - 2) * 4))
  const showIndividual = viewState.zoom >= 5
  const clusterRadius  = viewState.zoom < 3 ? 5 : showIndividual ? 0.3 : 4

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
        .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 1},year.lte.${currentYear})`)
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['none'])
        .in('entity_id', selectedEntities.length > 0 ? selectedEntities : [0])
      if (error) console.error('Events error:', error)
      else setEvents(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear, selectedCategories, selectedEntities])

  // ── Military event arc (existing) ────────────────────────────────────────
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

    const entityRuler = entityRulers.find(r => r.entity_id === selectedEvent.entity_id)
    const originLat   = selectedEvent.latitude_2  ?? entityRuler?.entities?.territory_lat
    const originLng   = selectedEvent.longitude_2 ?? entityRuler?.entities?.territory_lng

    if (!originLat || !originLng) return null
    const steps  = 100
    const coords = []
    for (let i = 0; i <= arcProgress; i++) {
      const t     = i / steps
      const lat   = originLat + (selectedEvent.latitude  - originLat) * t
      const lng   = originLng + (selectedEvent.longitude - originLng) * t
      const curve = Math.sin(Math.PI * t) * 0.8
      coords.push([lng, lat + curve])
    }
    if (coords.length < 2) return null
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }],
    }
  }, [selectedEvent, arcProgress])

  const clusters = clusterEvents(
    events.filter(e => e.longitude && e.latitude),
    clusterRadius
  )

  // ── CSS keyframes for pulsing icons ──────────────────────────────────────
  const pulseStyles = `
    @keyframes pulse-fast   { 0%,100% { opacity:1; transform:scale(1);    } 50% { opacity:0.5; transform:scale(1.3); } }
    @keyframes pulse-slow   { 0%,100% { opacity:1; transform:scale(1);    } 50% { opacity:0.6; transform:scale(1.2); } }
    @keyframes pulse-gentle { 0%,100% { opacity:1; transform:scale(1);    } 50% { opacity:0.7; transform:scale(1.1); } }
    .rel-icon-fast    { animation: pulse-fast   1s ease-in-out infinite; }
    .rel-icon-slow    { animation: pulse-slow   2s ease-in-out infinite; }
    .rel-icon-gentle  { animation: pulse-gentle 3s ease-in-out infinite; }
  `

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <style>{pulseStyles}</style>

      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        style={{ width: '100vw', height: 'calc(100vh - 345px)', marginTop: 345 }}
        mapStyle={`https://api.maptiler.com/maps/aquarelle/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
      >
        {/* ── Relation arcs ───────────────────────────────────────────── */}
        {relationArcs.map(arc => {
          const cfg = relationConfig[arc.rel.relation_type] || relationConfig.peace
          const geojson = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: arc.coords },
            }],
          }
          const paintProps = {
            'line-color':   cfg.color,
            'line-width':   cfg.width,
            'line-opacity': 0.75,
            ...(cfg.dash ? { 'line-dasharray': cfg.dash } : {}),
          }
          return (
            <Source key={`rel-src-${arc.rel.id}`} id={`rel-src-${arc.rel.id}`} type="geojson" data={geojson}>
              <Layer id={`rel-line-${arc.rel.id}`} type="line" paint={paintProps} />
            </Source>
          )
        })}

        {/* ── Relation midpoint icons + hover tooltips ─────────────────── */}
        {relationArcs.map(arc => {
          const cfg       = relationConfig[arc.rel.relation_type] || relationConfig.peace
          const isHovered = hoveredRelation?.id === arc.rel.id
          const iconClass = cfg.pulse ? `rel-icon-${cfg.pulse}` : ''

          return (
            <Marker key={`rel-icon-${arc.rel.id}`} longitude={arc.midLng} latitude={arc.midLat}>
              
              <div
  onMouseEnter={() => setHoveredRelation(arc.rel)}
  onMouseLeave={() => setHoveredRelation(null)}
  onClick={() => {
    const rel = relations.find(r => r.id === arc.rel.id)
    console.log('clicked relation', rel)
    setSelectedRelation(rel)
  }}
  style={{ position: 'relative', cursor: 'pointer', lineHeight: 1 }}
>
  <span className={iconClass} style={{ fontSize: 16, display: 'block' }}>
    {cfg.icon}
  </span>
  {isHovered && (
  <div style={{
    position: 'absolute',
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(58,42,10,0.95)',
    color: '#f5e6c8',
    fontFamily: "'Cinzel', serif",
    fontSize: 11,
    padding: '5px 10px',
    borderRadius: 5,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 500,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  }}>
    {arc.rel.name || arc.rel.relation_type}
  </div>
)}      
              </div>
            </Marker>
          )
        })}

        {/* ── City labels ─────────────────────────────────────────────── */}
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

        {/* ── Event clusters / individual markers ─────────────────────── */}
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
                    width: size, height: size, borderRadius: '50%',
                    background: color, border: '2px solid #c8a96e',
                    color: '#f5e6c8', fontFamily: 'Georgia, serif',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)', opacity: 0.85,
                  }}>
                    {cluster.events.length}
                  </div>

                  {hoveredCluster === i && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(58,42,10,0.92)', color: '#f5e6c8',
                      fontFamily: 'Georgia, serif', fontSize: 11,
                      padding: '6px 10px', borderRadius: 5,
                      whiteSpace: 'nowrap', pointerEvents: 'none',
                      zIndex: 100, marginBottom: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      {cluster.events.map(ev => (
                        <div key={ev.id}>
                          <span style={{ marginRight: 5 }}>{categoryIcons[ev.category] || '📍'}</span>
                          {ev.title}
                          <span style={{ color: '#c8a96e', marginLeft: 5, fontSize: 10 }}>{ev.year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Marker>
            )
          }

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
                  userSelect: 'none', lineHeight: 1,
                }}
              >
                {categoryIcons[event.category] || '📍'}
              </div>
            </Marker>
          ))
        })}

        {/* ── Ruler / coat of arms markers ────────────────────────────── */}
        {viewState.zoom > 3 && entityRulers.map(ruler => (
          ruler.entities?.territory_lat && ruler.entities?.territory_lng && (
            <Marker
              key={`coa-${ruler.entity_id}`}
              longitude={ruler.entities.territory_lng}
              latitude={ruler.entities.territory_lat}
            >
              <div style={{
                background: 'rgba(253,246,227,0.92)',
                border: '1px solid #c8a96e', borderRadius: 6,
                padding: '4px 8px',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                fontFamily: "'Cinzel', serif",
              }}>
                {ruler.coat_of_arms_url && (
                  <img src={ruler.coat_of_arms_url} alt={ruler.entities.name}
                    style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#3a2a0a', whiteSpace: 'nowrap' }}>
                    {ruler.name}
                  </div>
                  <div style={{ fontSize: 9, color: '#7a6040', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }}>
                    {ruler.reign_start}–{ruler.reign_end}
                  </div>
                </div>
              </div>
            </Marker>
          )
        ))}

        {/* ── Hover tooltip ────────────────────────────────────────────── */}
        {hoveredEvent && (
          <Marker longitude={hoveredEvent.longitude} latitude={hoveredEvent.latitude}>
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(58,42,10,0.92)', color: '#f5e6c8',
              fontFamily: 'Georgia, serif', fontSize: 11,
              padding: '5px 9px', borderRadius: 5,
              whiteSpace: 'nowrap', pointerEvents: 'none',
              zIndex: 100, marginBottom: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}>
              {hoveredEvent.title}
              <div style={{ fontSize: 10, color: '#c8a96e', marginTop: 2 }}>
                {hoveredEvent.year}{hoveredEvent.year_end ? `–${hoveredEvent.year_end}` : ''}
              </div>
            </div>
          </Marker>
        )}

        {/* ── Military event arc (existing) ───────────────────────────── */}
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

        <WorldSnapshot currentYear={currentYear} visible={viewState.zoom < 3} />
      </Map>
      
{selectedRelation && (() => {
        const cfg = relationConfig[selectedRelation.relation_type] || relationConfig.peace
        return (
          <div style={{
            position: 'fixed', top: 450, right: 20, width: 360,
            background: '#fdf6e3',
            border: `2px solid ${cfg.color}`,
            borderRadius: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            zIndex: 9999,
            fontFamily: "'Cinzel', serif",
            overflow: 'hidden',
          }}>
            <div style={{
              background: cfg.color,
              padding: '10px 14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>
                  {selectedRelation.relation_type.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', lineHeight: 1.3 }}>
                  {selectedRelation.name}
                </div>
                <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontFamily: 'Georgia, serif' }}>
                  {selectedRelation.year_start} – {selectedRelation.year_end}
                </div>
              </div>
              <button
                onClick={() => setSelectedRelation(null)}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#fff', fontSize: 18, cursor: 'pointer',
                  lineHeight: 1, padding: 0, marginLeft: 8, flexShrink: 0,
                }}
              >✕</button>
            </div>
            <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
  <span style={{ fontSize: 25 }}>{cfg.icon}</span>
  <div>
    <div style={{ fontSize: 17, color: '#a08050', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>
      {selectedRelation.relation_type.replace(/_/g, ' ')}
    </div>
    <div style={{ fontSize: 17, color: '#7a6040', fontFamily: 'Georgia, serif' }}>
      {selectedRelation.year_start} – {selectedRelation.year_end}
    </div>
  </div>
</div>
<div style={{
  fontSize: 20, color: '#3a2a0a', lineHeight: 1.8,
  fontFamily: "'IM Fell English', serif", fontStyle: 'italic',
  marginBottom: 10,
}}>
  {selectedRelation.description}
</div>
{selectedRelation.notes && (
  <div style={{
    fontSize: 12, color: '#5a4a2a', lineHeight: 1.6,
    fontFamily: 'Georgia, serif', borderTop: '1px solid #e8d8b0',
    paddingTop: 10, marginTop: 4,
  }}>
    {selectedRelation.notes}
  </div>
)}
              {selectedRelation.wikipedia_url && (
                <a href={selectedRelation.wikipedia_url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-block', marginTop: 12, fontSize: 13,
                    color: '#8a4caf', textDecoration: 'none',
                    borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif',
                  }}>
                  Read more on Wikipedia →
                </a>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}