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
      position: 'fixed', right: 0, top: 0, bottom: 60,
      width: 280, background: '#fdf6e3',
      borderLeft: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      color: '#a08050', fontSize: 13, textAlign: 'center'
    }}>
      Click a marker to explore history
    </div>
  )

  const st = statusConfig[selectedEvent.status] || statusConfig.confirmed
  const entityName = selectedEvent.entities?.name
  const entityColor = entityColors[entityName] || '#999'

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 60,
      width: 280, background: '#fdf6e3',
      borderLeft: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      overflowY: 'auto', padding: 20, zIndex: 10
    }}>

      {/* Entity */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: entityColor, flexShrink: 0
        }} />
        <span style={{ fontSize: 11, color: '#a08050' }}>{entityName}</span>
      </div>

      {/* Ruler */}
      {ruler && (
        <div style={{
          background: '#f5ede0', borderRadius: 6,
          padding: '8px 12px', marginBottom: 14,
          borderLeft: `3px solid ${entityColor}`
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
        </div>
      )}

      {/* Category */}
      <div style={{ fontSize: 11, color: '#a08050', marginBottom: 6 }}>
        {selectedEvent.category}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 16, fontWeight: 'bold',
        color: '#2a1a0a', marginBottom: 8, lineHeight: 1.3
      }}>
        {selectedEvent.title}
      </div>

      {/* Year and location */}
      <div style={{ fontSize: 13, color: '#7a6040', marginBottom: 12 }}>
        {selectedEvent.year}
        {selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}
        {' · '}
        {selectedEvent.location_name}
      </div>

      {/* Status badge */}
      <div style={{
        display: 'inline-block',
        background: st.bg, color: st.color,
        borderRadius: 4, padding: '2px 8px',
        fontSize: 11, marginBottom: 14
      }}>
        {st.label}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13, color: '#3a2a0a',
        lineHeight: 1.7, borderTop: '1px solid #e8d8b0', paddingTop: 12
      }}>
        {selectedEvent.description}
      </div>
    </div>
  )
}