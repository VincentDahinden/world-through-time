import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#2e7d32', bg: '#e8f5e9' },
  debated:   { label: 'Debated',   color: '#f57f17', bg: '#fff8e1' },
  contested: { label: 'Contested', color: '#c62828', bg: '#fce4ec' },
}

const entityColors = {
  'Ottoman Empire':           '#C0622A',
  'Ming Dynasty':             '#3A6FA8',
  'Crown of Castile / Spain': '#8A4CAF',
  'Aztec Empire':             '#2A9A4A',
  'New Spain':                '#A07830',
}

function useCurrentRuler(entityId, currentYear) {
  const [ruler, setRuler] = useState(null)

  useEffect(() => {
    if (!entityId || !currentYear) return
    async function fetchRuler() {
      const { data } = await supabase
        .from('rulers')
        .select('*, entities(name)')
        .eq('entity_id', entityId)
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .limit(1)
        .single()
      setRuler(data)
    }
    fetchRuler()
  }, [entityId, currentYear])

  return ruler
}

export default function DetailsPanel({ selectedEvent, currentYear }) {
  const ruler = useCurrentRuler(selectedEvent?.entity_id, currentYear)

  if (!selectedEvent) return (
    <div style={{
      position: 'fixed', top: 40, left: 0, right: 0,
      height: 250, background: '#fdf6e3',
      borderBottom: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      color: '#a08050', fontSize: 13, zIndex: 15
    }}>
      Click a marker on the map to explore history
    </div>
  )

  const st = statusConfig[selectedEvent.status] || statusConfig.confirmed
  const entityName = selectedEvent.entities?.name
  const entityColor = entityColors[entityName] || '#999'

  return (
    <div style={{
      position: 'fixed', top: 75, left: 0, right: 0,
      height: 255, background: '#fdf6e3',
      borderBottom: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', alignItems: 'flex-start',
      gap: 24, padding: '12px 24px',
      overflowX: 'auto', zIndex: 15
    }}>

      {/* Ruler block */}
      {ruler && (
        <div style={{
          background: '#f0e6cc', borderRadius: 6,
          padding: '8px 12px', flexShrink: 0,
          borderLeft: `3px solid ${entityColor}`,
          minWidth: 160
        }}>
          <div style={{ fontSize: 10, color: '#a08050', marginBottom: 2 }}>
            Current Ruler
          </div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#2a1a0a' }}>
            {ruler.name}
          </div>
          <div style={{ fontSize: 11, color: '#7a6040' }}>
            {ruler.title} · {ruler.reign_start}–{ruler.reign_end}
          </div>
          <div style={{ fontSize: 11, color: entityColor, marginTop: 2 }}>
            {entityName}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

      {/* Event details */}
      <div style={{ flex: 1, minWidth: 300 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#a08050' }}>{selectedEvent.category}</span>
          <span style={{
            background: st.bg, color: st.color,
            borderRadius: 4, padding: '1px 6px', fontSize: 10
          }}>{st.label}</span>
        </div>
        <div style={{
          fontSize: 15, fontWeight: 'bold',
          color: '#2a1a0a', marginBottom: 4, lineHeight: 1.3
        }}>
          {selectedEvent.title}
        </div>
        <div style={{ fontSize: 12, color: '#7a6040' }}>
          {selectedEvent.year}
          {selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}
          {' · '}{selectedEvent.location_name}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

     {/* Description + Wikipedia link */}
<div style={{
  fontSize: 12, color: '#3a2a0a',
  lineHeight: 1.6, flex: 2, minWidth: 300,
  overflowY: 'auto', maxHeight: 106
}}>
  {selectedEvent.description}
  {selectedEvent.wikipedia_url && (
    <a href={selectedEvent.wikipedia_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block', marginTop: 8,
        fontSize: 11, color: '#8a4caf',
        textDecoration: 'none',
        borderBottom: '1px solid #8a4caf'
      }}>
      Read more on Wikipedia
    </a>
  )}
</div>

    </div>
  )
}