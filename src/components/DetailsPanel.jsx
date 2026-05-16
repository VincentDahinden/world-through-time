import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import NotableFigures from './NotableFigures'

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

function BiographyToggle({ biography, rulerName, entityColor }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          border: '1px solid #c8a96e',
          borderRadius: 4,
          padding: '2px 8px',
          cursor: 'pointer',
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          color: '#7a6040',
          letterSpacing: 0.5,
          marginTop: 6,
        }}
      >
        ▼ Biography
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: 410,
          left: 20,
          width: 300,
          maxHeight: 'calc(100vh - 430px)',
          background: '#fdf6e3',
          border: '2px solid #c8a96e',
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Cinzel', serif",
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px',
            background: '#3a2a0a',
            borderRadius: '8px 8px 0 0',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 9, color: '#c8a96e', textTransform: 'uppercase', letterSpacing: 2 }}>
                Biography
              </div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#2a1a0a', fontFamily: "'Cinzel', serif", flex: 1, textAlign: 'center' }}>
                      {ruler.name}
                    </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none',
                color: '#c8a96e', fontSize: 18, cursor: 'pointer',
                lineHeight: 1,
              }}
            >✕</button>
          </div>

          <div style={{
            padding: '14px 16px',
            fontSize: 15,
            color: '#3a2a0a',
            lineHeight: 1.8,
            fontFamily: "'IM Fell English', serif",
            fontStyle: 'italic',
            overflowY: 'auto',
          }}>
            {biography}
          </div>
        </div>
      )}
    </>
  )
}

function DynasticTimeline({ rulers, currentRuler, entityColor }) {
  if (!rulers || rulers.length === 0 || !currentRuler) return null
  const dynastyRulers = rulers.filter(r => r.dynasty === currentRuler.dynasty)
  if (dynastyRulers.length === 0) return null
  const minYear = Math.min(...dynastyRulers.map(r => r.reign_start))
  const maxYear = Math.max(...dynastyRulers.map(r => r.reign_end))
  const totalSpan = maxYear - minYear

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 10, color: '#a08050', marginBottom: 4,
        textTransform: 'uppercase', letterSpacing: 1,
        fontFamily: "'Cinzel', serif"
      }}>
        {currentRuler.dynasty} ({minYear}–{maxYear})
      </div>
      <div style={{
        position: 'relative', height: 20,
        background: '#e8d8b0', borderRadius: 4, overflow: 'hidden'
      }}>
        {dynastyRulers.map(ruler => {
          const left = ((ruler.reign_start - minYear) / totalSpan) * 100
          const width = ((ruler.reign_end - ruler.reign_start) / totalSpan) * 100
          const isCurrent = ruler.id === currentRuler.id
          const isDisputed = ruler.status === 'disputed'
          return (
            <div key={ruler.id}
              title={`${ruler.name} (${ruler.reign_start}–${ruler.reign_end})`}
              style={{
                position: 'absolute',
                left: `${left}%`, width: `${width}%`, height: '100%',
                background: isCurrent ? entityColor : isDisputed ? '#c8a96e' : `${entityColor}66`,
                borderRight: '1px solid #fff', boxSizing: 'border-box'
              }}
            />
          )
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: '#a08050', marginTop: 2,
        fontFamily: 'Georgia, serif'
      }}>
        <span>{minYear}</span>
        <span>{Math.round((minYear + maxYear) / 2)}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  )
}

function useEntityRulers(entityId) {
  const [rulers, setRulers] = useState([])
  useEffect(() => {
    if (!entityId) return
    async function fetchRulers() {
      const { data } = await supabase
        .from('rulers').select('*')
        .eq('entity_id', entityId)
        .order('reign_start', { ascending: true })
      setRulers(data || [])
    }
    fetchRulers()
  }, [entityId])
  return rulers
}

function useCurrentRuler(entityId, currentYear) {
  const [ruler, setRuler] = useState(null)
  useEffect(() => {
    if (!entityId || !currentYear) return
    async function fetchRuler() {
      const { data } = await supabase
        .from('rulers').select('*, entities(name)')
        .eq('entity_id', entityId)
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .limit(1).single()
      setRuler(data)
    }
    fetchRuler()
  }, [entityId, currentYear])
  return ruler
}

export default function DetailsPanel({ selectedEvent, currentYear, onYearChange, onEventSelect }) {
  const [activeEntityId, setActiveEntityId] = useState(selectedEvent?.entity_id)

  useEffect(() => {
    if (selectedEvent?.entity_id) setActiveEntityId(selectedEvent.entity_id)
  }, [selectedEvent])

  const ruler = useCurrentRuler(activeEntityId, currentYear)
  const allRulers = useEntityRulers(activeEntityId)

  const currentIndex = allRulers.findIndex(r => r.id === ruler?.id)
  const prevRuler = currentIndex > 0 ? allRulers[currentIndex - 1] : null
  const nextRuler = currentIndex < allRulers.length - 1 ? allRulers[currentIndex + 1] : null

  const [narrating, setNarrating] = useState(false)
  const utteranceRef = useRef(null)

  useEffect(() => {
    if (!selectedEvent?.description) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(selectedEvent.description)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google UK English Male') || v.name.includes('Arthur'))
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => {
      setNarrating(true)
      window.dispatchEvent(new CustomEvent('narration', { detail: { active: true } }))
    }
    utterance.onend = () => {
      setNarrating(false)
      window.dispatchEvent(new CustomEvent('narration', { detail: { active: false } }))
    }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    return () => window.speechSynthesis.cancel()
  }, [selectedEvent])

  const handleSilence = () => {
    window.speechSynthesis.cancel()
    setNarrating(false)
    window.dispatchEvent(new CustomEvent('narration', { detail: { active: false } }))
  }

  const outerStyle = {
    position: 'fixed', top: 75, left: 0, right: 0,
    height: 255,
    backgroundColor: '#fdf6e3',
    borderLeft: '2px solid #c8a96e',
    borderRight: '2px solid #c8a96e',
    borderBottom: '2px solid #c8a96e',
    zIndex: 15,
    boxSizing: 'border-box'
  }

  const innerStyle = {
    position: 'absolute',
    top: 4, left: 4, right: 4, bottom: 4,
    border: '1px solid #8b6914',
    pointerEvents: 'none',
    zIndex: 14
  }

  const scrollStyle = {
    display: 'flex', alignItems: 'flex-start',
    gap: 20, padding: '8px 20px',
    overflowX: 'auto', height: '100%'
  }

  if (!selectedEvent) return (
    <div style={{
      ...outerStyle,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={innerStyle} />
      <span style={{
        fontFamily: 'Georgia, serif', color: '#a08050',
        fontSize: 13, letterSpacing: 1
      }}>
        Click a marker on the map to explore history
      </span>
    </div>
  )

  const st = statusConfig[selectedEvent.status] || statusConfig.confirmed
  const entityName = selectedEvent.entities?.name
  const entityColor = entityColors[entityName] || '#999'

  return (
    <div style={outerStyle}>
      <div style={innerStyle} />
      <div style={scrollStyle}>

        {/* Ruler column */}
        <div style={{ flexShrink: 0, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entityColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#a08050', fontFamily: "'Cinzel', serif", letterSpacing: 0.5 }}>
              {entityName}
            </span>
          </div>

          {ruler && (
            <div style={{
              background: '#f0e6cc', borderRadius: 6,
              padding: '8px 12px', marginBottom: 8,
              borderLeft: `3px solid ${entityColor}`
            }}>
              <div style={{ fontSize: 10, color: '#a08050', marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Current Ruler
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ruler.coat_of_arms_url && (
                  <img
                    src={ruler.coat_of_arms_url}
                    alt={ruler.dynasty}
                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                      onClick={() => { console.log('prev clicked', prevRuler); if (prevRuler) onYearChange(prevRuler.reign_end) }}
                      disabled={!prevRuler}
                      title={prevRuler ? prevRuler.name : ''}
                      style={{
                        background: 'transparent', border: 'none',
                        color: prevRuler ? '#3a2a0a' : '#e8d8b0',
                        fontSize: 16, cursor: prevRuler ? 'pointer' : 'default',
                        padding: 0, lineHeight: 1, flexShrink: 0,
                      }}
                    >‹</button>
                    <div 
                      onClick={() => console.log('name clicked')}
                      style={{ fontSize: 14, fontWeight: 'bold', color: '#2a1a0a', fontFamily: "'Cinzel', serif", flex: 1, cursor: 'pointer' }}>
                      {ruler.name}
                    </div>
                    <button
                      onClick={() => { if (nextRuler) onYearChange(nextRuler.reign_start + 1) }}
                      disabled={!nextRuler}
                      title={nextRuler ? nextRuler.name : ''}
                      style={{
                        background: 'transparent', border: 'none',
                        color: nextRuler ? '#3a2a0a' : '#e8d8b0',
                        fontSize: 16, cursor: nextRuler ? 'pointer' : 'default',
                        padding: 0, lineHeight: 1, flexShrink: 0,
                      }}
                    >›</button>
                  </div>
                  <div style={{ fontSize: 11, color: '#7a6040', fontFamily: 'Georgia, serif' }}>
                    {ruler.title} · {ruler.reign_start}–{ruler.reign_end}
                  </div>
                  {ruler.dynasty && (
                    <div style={{ fontSize: 11, color: entityColor, marginTop: 2, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                      {ruler.dynasty}
                    </div>
                  )}
                  {ruler.biography && (
                    <BiographyToggle biography={ruler.biography} rulerName={ruler.name} entityColor={entityColor} />
                  )}
                </div>
              </div>
            </div>
          )}

          <DynasticTimeline rulers={allRulers} currentRuler={ruler} entityColor={entityColor} />
          <NotableFigures currentYear={currentYear} entityId={selectedEvent?.entity_id} />
        </div>

        {/* Portrait column */}
        {ruler?.portrait_url && (
          <div style={{ flexShrink: 0, width: 130, alignSelf: 'stretch', overflow: 'hidden', borderRadius: 4 }}>
            <img
              src={ruler.portrait_url}
              alt={ruler.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
                filter: 'sepia(20%)',
              }}
            />
          </div>
        )}

        <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Event details column */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#a08050', fontFamily: "'Cinzel', serif", letterSpacing: 0.5 }}>
              {selectedEvent.category}
            </span>
            <span style={{ background: st.bg, color: st.color, borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'Georgia, serif' }}>
              {st.label}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2a1a0a', marginBottom: 4, lineHeight: 1.3, fontFamily: "'Cinzel', serif" }}>
            {selectedEvent.title}
          </div>
          <div style={{ fontSize: 12, color: '#7a6040', marginBottom: 8, fontFamily: 'Georgia, serif' }}>
            {selectedEvent.year}{selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}{' · '}{selectedEvent.location_name}
          </div>
          {selectedEvent.image_url && (
            <img
              src={selectedEvent.image_url}
              alt={selectedEvent.title}
              style={{
                width: 150,
                height: 130,
                objectFit: 'contain',
                borderRadius: 4,
                border: '1px solid #c8a96e',
                filter: 'sepia(15%)',
                float: 'right',
                marginLeft: 8,
              }}
            />
          )}
        </div>

        <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

        {/* Description column */}
        <div style={{
          fontSize: 12, color: '#3a2a0a', lineHeight: 1.7,
          flex: 2, minWidth: 300, overflowY: 'auto', maxHeight: 220,
          fontFamily: "'IM Fell English', serif"
        }}>
          {selectedEvent.description}

          {narrating && (
            <button
              onClick={handleSilence}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginBottom: 8,
                background: 'transparent',
                border: '1px solid #c8a96e',
                borderRadius: 4,
                padding: '2px 8px',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 10,
                color: '#7a6040',
              }}
            >
              🔇 Silence narrator
            </button>
          )}

          {selectedEvent.wikipedia_url && (
            <a href={selectedEvent.wikipedia_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#8a4caf', textDecoration: 'none', borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif' }}>
              Read more on Wikipedia →
            </a>
          )}
        </div>

      </div>
    </div>
  )
}