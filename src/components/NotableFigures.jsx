import { useState, useEffect } from 'react'
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

export default function NotableFigures({ currentYear, entityId, onSelectPerson }) {
  const [open, setOpen] = useState(false)
  const [people, setPeople] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!open) return
    async function fetch() {
      const { data } = await supabase
        .from('notable_people')
        .select('*')
        .lte('active_from', currentYear)
        .gte('active_to', currentYear)
        .order('category')
      setPeople(data || [])
    }
    fetch()
  }, [open, currentYear])

  // Reset when year changes
  useEffect(() => {
    setSelected(null)
    setPeople([])
    if (open) setOpen(false)
  }, [currentYear])

  const parchment = '#fdf6e3'
  const dark = '#3a2a0a'
  const gold = '#c8a96e'
  const mid = '#7a6040'

  // Group by category
  const grouped = people.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          marginTop: 6,
          padding: '3px 10px',
          background: open ? dark : 'transparent',
          color: open ? '#f5e6c8' : mid,
          border: `1px solid ${gold}`,
          borderRadius: 4,
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}
      >
        ✦ Notable Figures
      </button>

      {/* Floating panel */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 410,
          left: 20,
          width: 280,
          maxHeight: 'calc(100vh - 100px)',
          background: parchment,
          border: `2px solid ${gold}`,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          overflowY: 'auto',
          fontFamily: "'Cinzel', serif",
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px',
            background: dark,
            borderRadius: '8px 8px 0 0',
            position: 'sticky', top: 0, zIndex: 1,
          }}>
            <div>
              <div style={{ fontSize: 9, color: gold, textTransform: 'uppercase', letterSpacing: 2 }}>
                Notable Figures
              </div>
              <div style={{ fontSize: 16, color: '#f5e6c8', fontWeight: 'bold' }}>
                {currentYear}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none',
                color: gold, fontSize: 18, cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Person detail view */}
          {selected && (
            <div style={{ padding: '12px 14px', borderBottom: `1px solid ${gold}` }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                {selected.portrait_url && (
                  <img
                    src={selected.portrait_url}
                    alt={selected.name}
                    style={{
                      width: 60, height: 70,
                      objectFit: 'cover', objectPosition: 'top',
                      borderRadius: 4,
                      border: `1px solid ${gold}`,
                      flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: dark, lineHeight: 1.2 }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', marginTop: 2 }}>
                    {selected.title}
                  </div>
                  <div style={{ fontSize: 10, color: mid, fontFamily: 'Georgia, serif', marginTop: 2 }}>
                    {selected.birth_year}–{selected.death_year}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 11, color: dark, lineHeight: 1.7,
                fontFamily: "'IM Fell English', serif",
                maxHeight: 140, overflowY: 'auto',
              }}>
                {selected.description}
              </div>
              {selected.wikipedia_url && (
                <a href={selected.wikipedia_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 10, color: '#8a4caf', textDecoration: 'none', borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif', display: 'inline-block', marginTop: 6 }}>
                  Read more on Wikipedia →
                </a>
              )}
              <button
                onClick={() => setSelected(null)}
                style={{
                  display: 'block', marginTop: 8,
                  fontSize: 10, color: mid,
                  background: 'transparent', border: `1px solid ${gold}`,
                  borderRadius: 4, padding: '2px 8px',
                  cursor: 'pointer', fontFamily: "'Cinzel', serif",
                }}
              >
                ← Back to list
              </button>
            </div>
          )}

          {/* People list grouped by category */}
          {!selected && (
            <div style={{ padding: '8px 0' }}>
              {people.length === 0 && (
                <div style={{ padding: '16px', color: mid, fontSize: 11, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  No notable figures recorded for this year.
                </div>
              )}
              {Object.entries(grouped).map(([category, persons]) => (
                <div key={category}>
                  <div style={{
                    padding: '4px 14px',
                    fontSize: 9, color: mid,
                    textTransform: 'uppercase', letterSpacing: 1.5,
                    background: '#f0e6cc',
                    borderTop: `1px solid ${gold}33`,
                  }}>
                    {categoryIcons[category]} {category}
                  </div>
                  {persons.map(person => (
                    <div
                      key={person.id}
                      onClick={() => setSelected(person)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${gold}22`,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0e6cc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {person.portrait_url ? (
                        <img
                          src={person.portrait_url}
                          alt={person.name}
                          style={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            objectFit: 'cover', objectPosition: 'top',
                            border: `1px solid ${gold}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 28, height: 28,
                          borderRadius: '50%',
                          background: dark,
                          border: `1px solid ${gold}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, flexShrink: 0,
                        }}>
                          👤
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 12, color: dark, fontWeight: 'bold' }}>
                          {person.name}
                        </div>
                        <div style={{ fontSize: 10, color: mid, fontFamily: 'Georgia, serif' }}>
                          {person.title} · {person.active_from}–{person.active_to}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}