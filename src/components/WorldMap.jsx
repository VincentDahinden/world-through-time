import { useState, useEffect, useRef } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'

const statusColors = {
  confirmed: '#43a047',
  debated: '#ffb300',
  contested: '#e53935'
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
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [viewState, setViewState] = useState({
    longitude: 20, latitude: 25, zoom: 2.5
  })
  const mapRef = useRef(null)

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
  }, [currentYear, selectedCategories, selectedEntities])

  // Convert events to GeoJSON for clustering
  const geojson = {
    type: 'FeatureCollection',
    features: events
      .filter(e => e.longitude && e.latitude)
      .map(e => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] },
        properties: {
          id: e.id,
          title: e.title,
          year: e.year,
          year_end: e.year_end,
          category: e.category,
          status: e.status,
          icon: categoryIcons[e.category] || '📍',
          color: statusColors[e.status] || '#43a047',
          categoryColor: categoryColors[e.category] || '#3a2a0a',
        }
      }))
  }

  const handleMapClick = (e) => {
    const map = mapRef.current?.getMap()
    if (!map) return

    // Click on cluster — zoom in
    const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
    if (clusterFeatures.length > 0) {
      const clusterId = clusterFeatures[0].properties.cluster_id
      const source = map.getSource('events')
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        setViewState(v => ({
          ...v,
          longitude: clusterFeatures[0].geometry.coordinates[0],
          latitude: clusterFeatures[0].geometry.coordinates[1],
          zoom: zoom + 0.5
        }))
      })
      return
    }

    // Click on individual event
    const eventFeatures = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (eventFeatures.length > 0) {
      const props = eventFeatures[0].properties
      const found = events.find(ev => ev.id === props.id)
      if (found) onEventSelect && onEventSelect(found)
    }
  }

  const handleMouseMove = (e) => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
    if (features.length > 0) {
      const props = features[0].properties
      const found = events.find(ev => ev.id === props.id)
      if (found) setHoveredEvent(found)
    } else {
      setHoveredEvent(null)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        style={{ width: '100vw', height: 'calc(100vh - 410px)', marginTop: 410 }}
        mapStyle={`https://api.maptiler.com/maps/aquarelle/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
        interactiveLayerIds={['clusters', 'unclustered-point']}
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
              opacity: viewState.zoom < 3 ? 0 : 1,
            }}>
              {city.historical_name || city.modern_name}
            </div>
          </Marker>
        ))}

        {/* Clustered event source */}
        <Source
          id="events"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={5}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            source="events"
            filter={['has', 'point_count']}
            paint={{
                'circle-color': '#3a2a0a',
                'circle-radius': [
                  'step', ['get', 'point_count'],
                  14, 3, 20, 8, 26
                ],
                'circle-opacity': 0.75,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#c8a96e'
              }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            source="events"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-size': 12,
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
            }}
            paint={{ 'text-color': '#f5e6c8' }}
          />

          {/* Individual event icons */}
          <Layer
            id="unclustered-point"
            type="symbol"
            source="events"
            filter={['!', ['has', 'point_count']]}
            layout={{
              'text-field': ['get', 'icon'],
              'text-size': [
                'interpolate', ['linear'], ['zoom'],
                2, 10, 4, 14, 6, 18
              ],
              'text-allow-overlap': true,
              'text-ignore-placement': true
            }}
          />
        </Source>

        {/* Hover tooltip */}
        {hoveredEvent && (
          <Marker
            longitude={hoveredEvent.longitude}
            latitude={hoveredEvent.latitude}
          >
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