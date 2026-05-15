import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const entityColors = {
  1: '#C0622A', 2: '#3A6FA8', 3: '#8A4CAF', 4: '#2A9A4A',
  5: '#A07830', 6: '#9B1B30', 7: '#1B4B8A', 8: '#00827F',
  9: '#6B2D8B', 10: '#B8860B',
}

export default function WorldSnapshot({ currentYear, visible }) {
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visible) return
    setLoading(true)

    async function fetchSnapshot() {
      // Get all active rulers at currentYear
      const { data: rulers } = await supabase
        .from('rulers')
        .select('*, entities(id, name, short_name)')
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)

      if (!rulers) { setLoading(false); return }

      // Deduplicate by entity
      const seen = new Set()
      const uniqueRulers = rulers.filter(r => {
        if (seen.has(r.entity_id)) return false
        seen.add(r.entity_id)
        return true
      })

      // For each entity, get the most significant event this year
      const results = await Promise.all(uniqueRulers.map(async ruler => {
        const { data: events } = await supabase
          .from('events')
          .select('title, year, category, significance')
          .eq('entity_id', ruler.entity_id)
          .lte('year', currentYear)
          .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 5},year.lte.${currentYear})`)
          .order('significance', { ascending: true })
          .limit(1)

        return {
          ruler,
          entity: ruler.entities,
          topEvent: events?.[0] || null,
        }
      }))

      setSnapshots(results)
      setLoading(false)
    }

    fetchSnapshot()
  }, [currentYear, visible])

  if (!visible) return null

  const parchment = '#fdf6e3'
  const dark = '#3a2a0a'
  const gold = '#c8a96e'
  const mid = '#7a6040'

  return (
    <div style={{
      position: 'fixed',
      top: 410,
      right: 20,
      width: 280,
      maxHeight: 'calc(100vh - 430px)',
      background: 'rgba(253,246,227,0.96)',
      border: `2px solid ${gold}`,
      borderRadius: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      zIndex: 40,
      overflowY: 'auto',
      fontFamily: "'Cinzel', serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${gold}`,
        background: dark,
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{ fontSize: 9, color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>
          The World in
        </div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#f5e6c8' }}>
          {currentYear}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '8px 0' }}>
        {loading ? (
          <div style={{ padding: '20px 16px', color: mid, fontSize: 11, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Consulting the chronicles…
          </div>
        ) : (
          snapshots.map(({ ruler, entity, topEvent }) => (
            <div key={entity.id} style={{
              padding: '8px 16px',
              borderBottom: `1px solid ${gold}33`,
            }}>
              {/* Entity name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: entityColors[entity.id] || '#999',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 20, color: entityColors[entity.id] || '#999', fontWeight: 'bold', letterSpacing: 0.5 }}>
                  {entity.name}
                </span>
              </div>

              {/* Ruler */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                {ruler.coat_of_arms_url && (
                  <img src={ruler.coat_of_arms_url} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                )}
                {ruler.portrait_url && (
                  <img src={ruler.portrait_url} alt={ruler.name} style={{ width: 24, height: 24, objectFit: 'cover', objectPosition: 'top', borderRadius: '50%', border: `1px solid ${gold}` }} />
                )}
                <div>
                  <div style={{ fontSize: 20, color: dark, fontWeight: 'bold' }}>{ruler.name}</div>
                  <div style={{ fontSize: 17, color: mid, fontFamily: 'Georgia, serif' }}>{ruler.title} · {ruler.dynasty}</div>
                </div>
              </div>

              {/* Top event */}
              {topEvent && (
                <div style={{
                  fontSize: 18, color: mid,
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  paddingLeft: 8,
                  borderLeft: `2px solid ${entityColors[entity.id]}44`,
                }}>
                  {topEvent.title}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}