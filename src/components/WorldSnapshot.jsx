import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Map, { Marker } from 'react-map-gl/maplibre'

const entityColors = {
  1: '#C0622A', 2: '#3A6FA8', 3: '#8A4CAF', 4: '#2A9A4A',
  5: '#A07830', 6: '#9B1B30', 7: '#1B4B8A', 8: '#00827F',
  9: '#6B2D8B', 10: '#B8860B',
}

export default function WorldSnapshot({ currentYear, visible }) {
  const [snapshots, setSnapshots] = useState([])
  const [hoveredEntity, setHoveredEntity] = useState(null)

  useEffect(() => {
    if (!visible) return

    async function fetchSnapshot() {
      const { data: rulers } = await supabase
        .from('rulers')
        .select('*, entities(id, name, short_name, territory_lat, territory_lng)')
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)

      if (!rulers) return

      const seen = new Set()
      const uniqueRulers = rulers.filter(r => {
        if (seen.has(r.entity_id)) return false
        seen.add(r.entity_id)
        return true
      })

      const results = await Promise.all(
        uniqueRulers
          .filter(r => r.entities?.territory_lat && r.entities?.territory_lng)
          .map(async ruler => {
            const { data: events } = await supabase
              .from('events')
              .select('title, category')
              .eq('entity_id', ruler.entity_id)
              .lte('year', currentYear)
              .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 5},year.lte.${currentYear})`)
              .limit(1)

            return {
              ruler,
              entity: ruler.entities,
              topEvent: events?.[0] || null,
            }
          })
      )

      setSnapshots(results)
    }

    fetchSnapshot()
  }, [currentYear, visible])

  if (!visible) return null

  const parchment = '#fdf6e3'
  const dark = '#3a2a0a'
  const gold = '#c8a96e'
  const mid = '#7a6040'

  return (
    <>
      {snapshots.map(({ ruler, entity, topEvent }) => {
        const isHovered = hoveredEntity === entity.id
        const color = entityColors[entity.id] || '#999'

        return (
          <Marker
            key={`snapshot-${entity.id}`}
            longitude={entity.territory_lng}
            latitude={entity.territory_lat}
            style={{ zIndex: isHovered ? 9999 : 10 }}
          >
            <div
              onMouseEnter={() => setHoveredEntity(entity.id)}
              onMouseLeave={() => setHoveredEntity(null)}
              style={{
                background: isHovered ? parchment : 'rgba(253,246,227,0.92)',
                border: `2px solid ${gold}`,
                borderRadius: 8,
                padding: isHovered ? '8px 10px' : '4px 8px',
                boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.25)',
                cursor: 'default',
                transition: 'all 0.2s ease',
                width: isHovered ? 220 : 'auto',
                fontFamily: "'Cinzel', serif",
                zIndex: isHovered ? 9999 : 10,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {ruler.coat_of_arms_url && (
                  <img
                    src={ruler.coat_of_arms_url}
                    alt=""
                    style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                  />
                )}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 'bold',
                    color, whiteSpace: 'nowrap',
                    letterSpacing: 0.3,
                  }}>
                    {entity.short_name}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#7a6040',
                    fontFamily: 'Georgia, serif',
                    whiteSpace: 'nowrap',
                  }}>
                    {ruler.name}
                  </div>
                </div>
              </div>

              {isHovered && (
                <div style={{ marginTop: 8, borderTop: `1px solid ${gold}`, paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {ruler.portrait_url && (
                      <img
                        src={ruler.portrait_url}
                        alt={ruler.name}
                        style={{
                          width: 48, height: 48,
                          objectFit: 'cover', objectPosition: 'top',
                          borderRadius: '50%',
                          border: `1px solid ${gold}`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: 16, color: dark, fontWeight: 'bold', lineHeight: 1.2 }}>
                        {ruler.name}
                      </div>
                      <div style={{ fontSize: 13, color: mid, fontFamily: 'Georgia, serif' }}>
                        {ruler.title}
                      </div>
                    </div>
                  </div>

                  {topEvent && (
                    <div style={{
                      fontSize: 13, color: mid,
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                      borderLeft: `2px solid ${color}`,
                      paddingLeft: 6,
                    }}>
                      {topEvent.title}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Marker>
        )
      })}
    </>
  )
}