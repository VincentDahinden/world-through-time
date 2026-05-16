import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import NotableFigures from './NotableFigures'

// ── Constants ────────────────────────────────────────────────────────────
const STRIP_HEIGHT   = 310
const PADDING        = 10
const CONTENT_HEIGHT = STRIP_HEIGHT - PADDING * 2  // 290px

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
  'Kingdom of England':       '#9B1B30',
  'Kingdom of France':        '#1B4B8A',
  'Safavid Empire':           '#00827F',
  'Roman Britain':            '#6B2D8B',
  'Anglo-Saxon England':      '#B8860B',
}

const entities = [
  { id: 1,  name: 'Ottoman Empire',           short: 'Ottoman',      colour: '#C0622A' },
  { id: 2,  name: 'Ming Dynasty',             short: 'Ming',         colour: '#3A6FA8' },
  { id: 3,  name: 'Crown of Castile / Spain', short: 'Castile',      colour: '#8A4CAF' },
  { id: 4,  name: 'Aztec Empire',             short: 'Aztec',        colour: '#2A9A4A' },
  { id: 5,  name: 'New Spain',                short: 'New Spain',    colour: '#A07830' },
  { id: 6,  name: 'Kingdom of England',       short: 'England',      colour: '#9B1B30' },
  { id: 7,  name: 'Kingdom of France',        short: 'France',       colour: '#1B4B8A' },
  { id: 8,  name: 'Safavid Empire',           short: 'Persia',       colour: '#00827F' },
  { id: 9,  name: 'Roman Britain',            short: 'Rome/Britain', colour: '#6B2D8B' },
  { id: 10, name: 'Anglo-Saxon England',      short: 'Anglo-Saxon',  colour: '#B8860B' },
]

// ── Shared column style ───────────────────────────────────────────────────
const colStyle = (width, extra = {}) => ({
  flexShrink: 0,
  width,
  height: CONTENT_HEIGHT,
  overflowY: 'auto',
  boxSizing: 'border-box',
  ...extra,
})

const dividerStyle = {
  width: 1, background: '#e8d8b0',
  alignSelf: 'stretch', flexShrink: 0,
}

const colHeaderStyle = {
  fontSize: 9, color: '#a08050',
  textTransform: 'uppercase', letterSpacing: 1,
  fontFamily: "'Cinzel', serif", marginBottom: 6,
}

// ── Dynastic timeline bar ────────────────────────────────────────────────
function DynasticTimeline({ rulers, currentRuler, entityColor }) {
  if (!rulers || rulers.length === 0 || !currentRuler) return null
  const dynastyRulers = rulers.filter(r => r.dynasty === currentRuler.dynasty)
  if (dynastyRulers.length === 0) return null
  const minYear   = Math.min(...dynastyRulers.map(r => r.reign_start))
  const maxYear   = Math.max(...dynastyRulers.map(r => r.reign_end))
  const totalSpan = maxYear - minYear
  return (
    <div>
      <div style={{ fontSize: 9, color: '#a08050', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>
        {currentRuler.dynasty} ({minYear}–{maxYear})
      </div>
      <div style={{ position: 'relative', height: 16, background: '#e8d8b0', borderRadius: 4, overflow: 'hidden' }}>
        {dynastyRulers.map(r => {
          const left  = ((r.reign_start - minYear) / totalSpan) * 100
          const width = ((r.reign_end - r.reign_start) / totalSpan) * 100
          return (
            <div key={r.id}
              title={`${r.name} (${r.reign_start}–${r.reign_end})`}
              style={{
                position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%',
                background: r.id === currentRuler.id ? entityColor : r.status === 'disputed' ? '#c8a96e' : `${entityColor}66`,
                borderRight: '1px solid #fff', boxSizing: 'border-box',
              }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#a08050', marginTop: 2, fontFamily: 'Georgia, serif' }}>
        <span>{minYear}</span><span>{Math.round((minYear + maxYear) / 2)}</span><span>{maxYear}</span>
      </div>
    </div>
  )
}

// ── Hooks ────────────────────────────────────────────────────────────────
function useEntityRulers(entityId) {
  const [rulers, setRulers] = useState([])
  useEffect(() => {
    if (!entityId) return
    supabase.from('rulers').select('*').eq('entity_id', entityId)
      .order('reign_start', { ascending: true })
      .then(({ data }) => setRulers(data || []))
  }, [entityId])
  return rulers
}

function useCurrentRuler(entityId, currentYear) {
  const [ruler, setRuler] = useState(null)
  useEffect(() => {
    if (!entityId || !currentYear) return
    supabase.from('rulers').select('*, entities(name)')
      .eq('entity_id', entityId)
      .lte('reign_start', currentYear)
      .gte('reign_end', currentYear)
      .limit(1).single()
      .then(({ data }) => setRuler(data))
  }, [entityId, currentYear])
  return ruler
}

// ── RulerPanel — 5-column horizontal strip ───────────────────────────────
export default function RulerPanel({ activeEntityId, currentYear, onYearChange, selectedEntities, onEntityChange }) {
  const ruler     = useCurrentRuler(activeEntityId, currentYear)
  const allRulers = useEntityRulers(activeEntityId)

  const currentIndex = allRulers.findIndex(r => r.id === ruler?.id)
  const prevRuler    = currentIndex > 0 ? allRulers[currentIndex - 1] : null
  const nextRuler    = currentIndex < allRulers.length - 1 ? allRulers[currentIndex + 1] : null

  const entityName  = ruler?.entities?.name || ''
  const entityColor = entityColors[entityName] || '#999'

  const allSelected = selectedEntities.length === entities.length
  const toggleEntity = (id) => {
    onEntityChange(selectedEntities.includes(id)
      ? selectedEntities.filter(e => e !== id)
      : [...selectedEntities, id]
    )
  }

  const sectionHeader = {
    fontSize: 10, color: '#3a2a0a', fontWeight: 'bold',
    textTransform: 'uppercase', letterSpacing: 1.5,
    fontFamily: "'Cinzel', serif", marginBottom: 8,
  }

  const DYNASTY_HEIGHT = 44
  const DYNASTY_BOTTOM = 8
  const DYNASTY_WIDTH  = 380
  const CONTENT_TOP_H  = STRIP_HEIGHT - PADDING - DYNASTY_HEIGHT - DYNASTY_BOTTOM - 12

  // outer strip — position: fixed
  // inner wrapper — position: relative (anchors the absolute dynasty bar)
  return (
    <div style={{
      position: 'fixed', top: 35, left: 0, right: 0,
      height: STRIP_HEIGHT,
      backgroundColor: '#fdf6e3',
      borderBottom: '2px solid #c8a96e',
      zIndex: 15, boxSizing: 'border-box',
    }}>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        {/* Decorative inner border */}
        <div style={{
          position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
          border: '1px solid #8b6914', pointerEvents: 'none', zIndex: 14,
        }} />

        {/* Dynasty bar — fixed position independent of strip */}
        {ruler && (
          <div style={{
            position: 'fixed',
            top: 35 + STRIP_HEIGHT - 52,
            left: 16,
            width: 380,
            zIndex: 9999,
            background: 'red',
            height: 44,
          }}>
            <DynasticTimeline rulers={allRulers} currentRuler={ruler} entityColor={entityColor} />
          </div>
        )}

        {/* Main content row */}
        <div style={{
          display: 'flex',
          padding: `${PADDING}px 16px 0 16px`,
          height: CONTENT_TOP_H,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>

          {/* ── SECTION 1: Ruler info + portrait ── */}
          <div style={{ flex: 1, display: 'flex', gap: 10, overflow: 'hidden', paddingRight: 12 }}>

            {/* Ruler info */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: entityColor, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#3a2a0a', fontFamily: "'Cinzel', serif", letterSpacing: 0.5, fontWeight: 'bold' }}>
                  {entityName || 'Click a marker to explore'}
                </span>
              </div>

              {ruler ? (
                <div style={{ background: '#f0e6cc', borderRadius: 6, padding: '8px 10px', borderLeft: `3px solid ${entityColor}` }}>
                  <div style={sectionHeader}>Current Ruler</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ruler.coat_of_arms_url && (
                      <img src={ruler.coat_of_arms_url} alt={ruler.dynasty}
                        style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button onClick={() => { if (prevRuler) onYearChange(prevRuler.reign_start + 1) }}
                          disabled={!prevRuler} title={prevRuler?.name}
                          style={{ background: 'transparent', border: 'none', color: prevRuler ? '#3a2a0a' : '#e8d8b0', fontSize: 18, cursor: prevRuler ? 'pointer' : 'default', padding: 0, lineHeight: 1, flexShrink: 0 }}>‹</button>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#2a1a0a', fontFamily: "'Cinzel', serif", flex: 1, lineHeight: 1.2 }}>{ruler.name}</div>
                        <button onClick={() => { if (nextRuler) onYearChange(nextRuler.reign_start + 1) }}
                          disabled={!nextRuler} title={nextRuler?.name}
                          style={{ background: 'transparent', border: 'none', color: nextRuler ? '#3a2a0a' : '#e8d8b0', fontSize: 18, cursor: nextRuler ? 'pointer' : 'default', padding: 0, lineHeight: 1, flexShrink: 0 }}>›</button>
                      </div>
                      <div style={{ fontSize: 13, color: '#7a6040', fontFamily: 'Georgia, serif', marginTop: 3 }}>
                        {ruler.title} · {ruler.reign_start}–{ruler.reign_end}
                      </div>
                      {ruler.dynasty && (
                        <div style={{ fontSize: 13, color: entityColor, marginTop: 3, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{ruler.dynasty}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#a08050', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: 8 }}>
                  No ruler recorded for this year.
                </div>
              )}
            </div>

            {/* Portrait */}
            <div style={{ flexShrink: 0, width: 100, height: 200, overflow: 'hidden', borderRadius: 4, background: '#e8d8b0' }}>
              {ruler?.portrait_url ? (
                <img src={ruler.portrait_url} alt={ruler?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', filter: 'sepia(20%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, opacity: 0.3 }}>👑</span>
                </div>
              )}
            </div>

          </div>{/* end section 1 */}

          <div style={dividerStyle} />

          {/* ── SECTION 2: Biography ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            <div style={sectionHeader}>Biography</div>
            {ruler?.biography ? (
              <div style={{ fontSize: 13, color: '#3a2a0a', lineHeight: 1.75, fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}>
                {ruler.biography}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#a08050', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                No biography recorded.
              </div>
            )}
          </div>{/* end section 2 */}

          <div style={dividerStyle} />

          {/* ── SECTION 3: Notable Figures ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            <div style={sectionHeader}>Notable Figures</div>
            <NotableFigures currentYear={currentYear} entityId={activeEntityId} />
          </div>{/* end section 3 */}

          <div style={dividerStyle} />

          {/* ── SECTION 4: Civilisations ── */}
          <div style={{ flexShrink: 0, width: 200, overflowY: 'auto', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ ...sectionHeader, fontSize: 13 }}>Civilisations</div>
              <button
                onClick={() => onEntityChange(allSelected ? [] : entities.map(e => e.id))}
                style={{
                  background: 'transparent', border: '1px solid #c8a96e',
                  borderRadius: 3, padding: '2px 6px', cursor: 'pointer',
                  fontSize: 9, color: '#3a2a0a', fontFamily: 'Georgia, serif', fontWeight: 'bold',
                }}>
                {allSelected ? 'None' : 'All'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {entities.map(entity => {
                const active = selectedEntities.includes(entity.id)
                return (
                  <button key={entity.id} onClick={() => toggleEntity(entity.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: active ? `${entity.colour}22` : 'transparent',
                      border: `1px solid ${active ? entity.colour : '#e8d8b0'}`,
                      borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
                      textAlign: 'left', width: '100%',
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: entity.colour, flexShrink: 0, opacity: active ? 1 : 0.35 }} />
                    <span style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: active ? '#2a1a0a' : '#a08050', fontWeight: active ? 'bold' : 'normal' }}>
                      {entity.short}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>{/* end section 4 */}

        </div>{/* end main content row */}

      </div>{/* end position: relative wrapper */}

    </div>// end fixed strip
  )
}

// ── DynasticBar — rendered independently in App.jsx ─────────────────────
export function DynasticBar({ activeEntityId, currentYear }) {
  const ruler     = useCurrentRuler(activeEntityId, currentYear)
  const allRulers = useEntityRulers(activeEntityId)
  const entityName  = ruler?.entities?.name || ''
  const entityColor = entityColors[entityName] || '#999'
  if (!ruler) return null
  return (
    <div style={{
      position: 'fixed',
      top: 35 + 310 - 110,
      left: 16,
      width: 435,
      zIndex: 9999,
    }}>
      <DynasticTimeline rulers={allRulers} currentRuler={ruler} entityColor={entityColor} />
    </div>
  )
}

// ── DynasticBar — fixed position, rendered from App.jsx ─────────────────


// ── EventPopup — floating on map when event clicked ──────────────────────
export function EventPopup({ selectedEvent, onClose }) {
  const [narrating, setNarrating] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    if (!selectedEvent?.description) return
    window.speechSynthesis.cancel()
    setNarrating(false)

    const utterance  = new SpeechSynthesisUtterance(selectedEvent.description)
    utterance.rate   = 0.9
    utterance.pitch  = 1
    utterance.volume = 1
    const voices     = window.speechSynthesis.getVoices()
    const preferred  = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google UK English Male') || v.name.includes('Arthur'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => { setNarrating(true);  window.dispatchEvent(new CustomEvent('narration', { detail: { active: true } })) }
    utterance.onend   = () => { setNarrating(false); window.dispatchEvent(new CustomEvent('narration', { detail: { active: false } })) }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    return () => window.speechSynthesis.cancel()
  }, [selectedEvent])

  const toggleNarration = () => {
    if (narrating) {
      window.speechSynthesis.cancel()
      setNarrating(false)
      window.dispatchEvent(new CustomEvent('narration', { detail: { active: false } }))
    } else {
      if (utteranceRef.current) window.speechSynthesis.speak(utteranceRef.current)
    }
  }

  if (!selectedEvent) return null

  const st          = statusConfig[selectedEvent.status] || statusConfig.confirmed
  const entityName  = selectedEvent.entities?.name
  const entityColor = entityColors[entityName] || '#999'

  return (
    <div style={{
      position: 'fixed', top: 450, left: 20, width: 380,
      maxHeight: 'calc(100vh - 460px)',
      background: '#fdf6e3', border: `2px solid ${entityColor}`,
      borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      zIndex: 50, display: 'flex', flexDirection: 'column',
      fontFamily: "'Cinzel', serif", overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: entityColor, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Georgia, serif' }}>{selectedEvent.category}</span>
            <span style={{ background: st.bg, color: st.color, borderRadius: 3, padding: '1px 5px', fontSize: 9, fontFamily: 'Georgia, serif' }}>{st.label}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', lineHeight: 1.3 }}>{selectedEvent.title}</div>
          <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontFamily: 'Georgia, serif' }}>
            {selectedEvent.year}{selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}{selectedEvent.location_name ? ` · ${selectedEvent.location_name}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
          <button onClick={toggleNarration} title={narrating ? 'Silence narrator' : 'Read aloud'}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 0 }}>
            {narrating ? '🔇' : '🔊'}
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1 }}>
        {selectedEvent.image_url && (
          <img src={selectedEvent.image_url} alt={selectedEvent.title}
            style={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4, border: '1px solid #c8a96e', filter: 'sepia(15%)', marginBottom: 10 }} />
        )}
        <div style={{ fontSize: 20, color: '#3a2a0a', lineHeight: 1.75, fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}>
          {selectedEvent.description}
        </div>
        {selectedEvent.wikipedia_url && (
          <a href={selectedEvent.wikipedia_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#8a4caf', textDecoration: 'none', borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif' }}>
            Read more on Wikipedia →
          </a>
        )}
      </div>
    </div>
  )
}