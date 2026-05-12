import { useState, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'

const statusColors = {
  confirmed: '#43a047',
  debated: '#ffb300',
  contested: '#e53935'
}
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


  export default function WorldMap({ currentYear, selectedCategories, selectedEntities, onEventSelect }) {
  const [cities, setCities] = useState([])
  const [events, setEvents] = useState([])
  const [viewState, setViewState] = useState({
    longitude: 20, latitude: 25, zoom: 2.5
     })
  const [hoveredEvent, setHoveredEvent] = useState(null)

  const fontSize = viewState.zoom < 3 ? 0 : Math.max(6, Math.min(18, (viewState.zoom - 2) * 4))

  useEffect(() => {
    async function fetchCities() {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .lte('active_from', currentYear)
        .or(`active_to.is.null,active_to.gte.${currentYear}`)
      if (error) console.error('Cities error:', error)
      else setCities(data)
    }
    fetchCities()
  }, [currentYear])

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*, entities(name, colour)')
        .lte('year', currentYear)
        .or(`year_end.is.null,year_end.gte.${currentYear}`)
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['none'])
        .in('entity_id', selectedEntities.length > 0 ? selectedEntities : [0])
      if (error) console.error('Events error:', error)
      else setEvents(data)
    }
    fetchEvents()
  }, [currentYear])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        style={{ width: '100vw', height: 'calc(100vh - 400px)', marginTop: 400 }}
        mapStyle={`https://tiles.stadiamaps.com/styles/stamen_watercolor.json?api_key=${import.meta.env.VITE_STADIA_API_KEY}`}
      >
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
              opacity: viewState.zoom < 3 ? 0 : 1,
            }}>
              {city.historical_name || city.modern_name}
            </div>
          </Marker>
        ))}

{events.map(event => (
  <Marker
    key={event.id}
    longitude={event.longitude}
    latitude={event.latitude}
    onClick={() => onEventSelect && onEventSelect(event)}
  >
    <div
      onMouseEnter={() => setHoveredEvent(event)}
      onMouseLeave={() => setHoveredEvent(null)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <div style={{
        fontSize: viewState.zoom < 3 ? 10 : Math.max(10, Math.min(20, viewState.zoom * 3)),
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
        userSelect: 'none',
        lineHeight: 1
      }}>
        {categoryIcons[event.category] || '📍'}
      </div>

      {hoveredEvent?.id === event.id && (
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
          {event.title}
          <div style={{
            fontSize: 10, color: '#c8a96e', marginTop: 2
          }}>
            {event.year}{event.year_end ? `–${event.year_end}` : ''}
          </div>
        </div>
      )}
    </div>
  </Marker>
))}
      </Map>
    </div>
  )
}