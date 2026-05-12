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
    <>
      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        style={{ width: '100%', height: 'calc(100vh - 400px)', marginTop: 400 }}
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
    <div style={{
      fontSize: viewState.zoom < 3 ? 10 : Math.max(10, Math.min(20, viewState.zoom * 3)),
cursor: 'pointer',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
      userSelect: 'none',
      lineHeight: 1
    }}>
      {categoryIcons[event.category] || '📍'}
    </div>
  </Marker>
))}
      </Map>
    </>
  )
}