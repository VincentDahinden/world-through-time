import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import NotableFigures from './NotableFigures'
import FamilyPanel from './FamilyPanel'

// ── Constants ────────────────────────────────────────────────────────────
const STRIP_HEIGHT = 310
const PADDING      = 10
const PORTRAIT_W   = 160
const GAP          = 8
const MARGIN       = 8

const CONTENT_H    = STRIP_HEIGHT - PADDING * 2
const DYNASTY_H    = 44
const RULER_BOX_H  = CONTENT_H - DYNASTY_H - MARGIN
const DYNASTY_W    = 240 + GAP + PORTRAIT_W

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

// Category i18n keys map
const categoryKeys = {
  'Governance & Law':          'governance',
  'Military & Conflict':       'military',
  'Built Environment':         'builtEnv',
  'Religion & Belief':         'religion',
  'Economy & Trade':           'economy',
  'Society & Demographics':    'society',
  'Science & Knowledge':       'science',
  'Culture & Arts':            'culture',
  'Power & Succession':        'power',
  'Environment & Ecology':     'environment',
  'Collapse & Transformation': 'collapse',
}

const categories = [
  { name: 'Governance & Law',          icon: '⚖️' },
  { name: 'Military & Conflict',       icon: '⚔️' },
  { name: 'Built Environment',         icon: '🏛️' },
  { name: 'Religion & Belief',         icon: '✝️' },
  { name: 'Economy & Trade',           icon: '💰' },
  { name: 'Society & Demographics',    icon: '👥' },
  { name: 'Science & Knowledge',       icon: '🔭' },
  { name: 'Culture & Arts',            icon: '🎨' },
  { name: 'Power & Succession',        icon: '👑' },
  { name: 'Environment & Ecology',     icon: '🌿' },
  { name: 'Collapse & Transformation', icon: '💥' },
]

const dividerStyle = {
  width: 1, background: '#e8d8b0',
  alignSelf: 'stretch', flexShrink: 0,
}

const sectionHeaderStyle = {
  fontSize: 10, color: '#3a2a0a', fontWeight: 'bold',
  textTransform: 'uppercase', letterSpacing: 1.5,
  fontFamily: "'Cinzel', serif", marginBottom: 8,
}

// ── Helper: pick localised field with English fallback ───────────────────
function loc(obj, field, lang) {
  if (!obj) return null
  if (lang === 'fr') return obj[`${field}_fr`] || obj[field] || null
  return obj[field] || null
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
    <div style={{ paddingTop: 4 }}>
      <div style={{ fontSize: 9, color: '#3a2a0a', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Cinzel', serif" }}>
        {currentRuler.dynasty} ({minYear}–{maxYear})
      </div>
      <div style={{ position: 'relative', height: 14, background: '#e8d8b0', borderRadius: 3, overflow: 'hidden' }}>
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
    supabase.from('rulers')
      .select('id, name, reign_start, reign_end, dynasty, status, entity_id')
      .eq('entity_id', entityId).eq('is_ruler', true)
      .order('reign_start', { ascending: true })
      .then(({ data }) => setRulers(data || []))
  }, [entityId])
  return rulers
}

function useCurrentRuler(entityId, currentYear) {
  const [ruler, setRuler] = useState(null)
  useEffect(() => {
    if (!entityId || !currentYear) return
    supabase.from('rulers')
      .select('*, entities!rulers_entity_id_fkey(name)')
      .eq('entity_id', entityId).eq('is_ruler', true)
      .lte('reign_start', currentYear).gte('reign_end', currentYear)
      .order('reign_start', { ascending: false }).limit(1).single()
      .then(({ data }) => setRuler(data))
  }, [entityId, currentYear])
  return ruler
}

function useAdjacentRulers(ruler, entityId) {
  const [prevRuler, setPrevRuler] = useState(null)
  const [nextRuler, setNextRuler] = useState(null)
  useEffect(() => {
    if (!ruler || !entityId) { setPrevRuler(null); setNextRuler(null); return }
    supabase.from('rulers').select('id, name, reign_start, reign_end')
      .eq('entity_id', entityId).eq('is_ruler', true)
      .lt('reign_start', ruler.reign_start)
      .order('reign_start', { ascending: false }).limit(1).single()
      .then(({ data }) => setPrevRuler(data || null))
    supabase.from('rulers').select('id, name, reign_start, reign_end')
      .eq('entity_id', entityId).eq('is_ruler', true)
      .gt('reign_start', ruler.reign_start)
      .order('reign_start', { ascending: true }).limit(1).single()
      .then(({ data }) => setNextRuler(data || null))
  }, [ruler?.id, entityId])
  return { prevRuler, nextRuler }
}

// ── RulerPanel ───────────────────────────────────────────────────────────
export default function RulerPanel({
  activeEntityId, currentYear, onYearChange,
  selectedEntities, onEntityChange,
  selectedCategories, onCategoryChange,
  language = 'en',
}) {
  const { t } = useTranslation()
  const ruler                    = useCurrentRuler(activeEntityId, currentYear)
  const allRulers                = useEntityRulers(activeEntityId)
  const { prevRuler, nextRuler } = useAdjacentRulers(ruler, activeEntityId)

  const entityName  = ruler?.entities?.name || ''
  const entityColor = entityColors[entityName] || '#999'
  const [deathPopup, setDeathPopup] = useState(false)

  // Language-aware data fields
  const biography  = loc(ruler, 'biography', language)
  const deathNotes = loc(ruler, 'death_notes', language)

  const allEntitiesSelected   = selectedEntities.length === entities.length
  const allCategoriesSelected = selectedCategories.length === categories.length

  const toggleEntity   = (id)   => onEntityChange(selectedEntities.includes(id) ? selectedEntities.filter(e => e !== id) : [...selectedEntities, id])
  const toggleCategory = (name) => onCategoryChange(selectedCategories.includes(name) ? selectedCategories.filter(c => c !== name) : [...selectedCategories, name])

  const btnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    padding: '5px 10px', cursor: 'pointer',
    background: 'transparent', border: '1px solid #c8a96e',
    borderRadius: 4, fontFamily: "'Cinzel', serif",
    fontSize: 11, color: '#3a2a0a', letterSpacing: 0.5,
  }

  return (
    <div style={{
      position: 'fixed', top: 35, left: 0, right: 0,
      height: STRIP_HEIGHT,
      backgroundColor: '#fdf6e3',
      borderBottom: '2px solid #c8a96e',
      zIndex: 15, boxSizing: 'border-box',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>

        <div style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, border: '1px solid #8b6914', pointerEvents: 'none', zIndex: 14 }} />

        <div style={{ display: 'flex', height: '100%', padding: `${PADDING}px 16px`, boxSizing: 'border-box', overflow: 'hidden', gap: 0 }}>

          {/* ── SECTION 1: Ruler info + portrait ── */}
          <div style={{ flexShrink: 0, display: 'flex', gap: GAP, alignItems: 'flex-start', paddingRight: GAP }}>

            <div style={{ position: 'relative', width: 240, height: CONTENT_H }}>

              {/* Ruler content box */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: RULER_BOX_H,
                background: '#f0e6cc', borderRadius: 6,
                borderLeft: `3px solid ${entityColor}`,
                overflowY: 'auto', boxSizing: 'border-box',
                padding: '10px 12px',
              }}>
                {/* Entity name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${entityColor}44` }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: entityColor, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#3a2a0a', fontFamily: "'Cinzel', serif", letterSpacing: 0.5, fontWeight: 'bold' }}>
                    {entityName || t('clickMarker')}
                  </span>
                </div>

                {ruler ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {ruler.coat_of_arms_url && (
                        <img src={ruler.coat_of_arms_url} alt={ruler.dynasty}
                          style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
                      )}
                      <div style={{ fontSize: 9, color: '#3a2a0a', fontFamily: "'Cinzel', serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        {t('currentRuler')}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 28px', alignItems: 'center', marginBottom: 6 }}>
                      <button onClick={() => { if (prevRuler) onYearChange(prevRuler.reign_start + 1) }}
                        disabled={!prevRuler} title={prevRuler?.name}
                        style={{ background: 'transparent', border: 'none', color: prevRuler ? '#3a2a0a' : '#e8d8b0', fontSize: 22, cursor: prevRuler ? 'pointer' : 'default', padding: 0, lineHeight: 1 }}>‹</button>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#2a1a0a', fontFamily: "'Cinzel', serif", textAlign: 'center', lineHeight: 1.2 }}>
                        {ruler.name}
                      </div>
                      <button onClick={() => { if (nextRuler) onYearChange(nextRuler.reign_start + 1) }}
                        disabled={!nextRuler} title={nextRuler?.name}
                        style={{ background: 'transparent', border: 'none', color: nextRuler ? '#3a2a0a' : '#e8d8b0', fontSize: 22, cursor: nextRuler ? 'pointer' : 'default', padding: 0, lineHeight: 1, textAlign: 'right' }}>›</button>
                    </div>

                    <div style={{ fontSize: 13, color: '#3a2a0a', fontFamily: 'Georgia, serif', textAlign: 'center', marginBottom: 4 }}>
                      {ruler.title} · {ruler.reign_start}–{ruler.reign_end}
                    </div>

                    {ruler.dynasty && (
                      <div style={{ fontSize: 13, color: '#2a1a0a', fontWeight: 'bold', fontStyle: 'italic', fontFamily: 'Georgia, serif', textAlign: 'center', marginBottom: 12 }}>
                        {ruler.dynasty}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, display: 'flex' }}>
                      <FamilyPanel rulerId={ruler.id} rulerName={ruler.name} onYearChange={onYearChange} language={language} t={t} />
                      </div>
                      {deathNotes && (
                        <div style={{ flex: 1, display: 'flex' }}>
                          <button onClick={() => setDeathPopup(d => !d)} style={{ ...btnStyle, flex: 1 }}>
                            ✝ {t('death')}
                          </button>
                        </div>
                      )}
                    </div>

                    {deathPopup && deathNotes && (
                      <div style={{ position: 'fixed', top: 420, left: 20, width: 300, background: '#fdf6e3', border: '2px solid #c8a96e', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 9999, fontFamily: "'Cinzel', serif", overflow: 'hidden' }}>
                        <div style={{ background: '#3a2a0a', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 9, color: '#c8a96e', textTransform: 'uppercase', letterSpacing: 2 }}>{t('causeOfDeath')}</div>
                            <div style={{ fontSize: 13, color: '#f5e6c8', fontWeight: 'bold' }}>✝ {ruler.name}</div>
                          </div>
                          <button onClick={() => setDeathPopup(false)} style={{ background: 'transparent', border: 'none', color: '#c8a96e', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                        </div>
                        <div style={{ padding: '12px 14px', fontSize: 13, color: '#3a2a0a', lineHeight: 1.75, fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}>
                          {deathNotes}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: '#a08050', fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: 8 }}>
                    {t('noRuler')}
                  </div>
                )}
              </div>

              {/* Dynasty bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: DYNASTY_W, height: DYNASTY_H, background: '#fdf6e3' }}>
                <DynasticTimeline rulers={allRulers} currentRuler={ruler} entityColor={entityColor} />
              </div>
            </div>

            {/* Portrait */}
            <div style={{ flexShrink: 0, width: PORTRAIT_W, height: RULER_BOX_H, overflow: 'hidden', borderRadius: 4, background: '#e8d8b0' }}>
              {ruler?.portrait_url ? (
                <img src={ruler.portrait_url} alt={ruler?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', filter: 'sepia(20%)' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 32, opacity: 0.3 }}>👑</span>
                </div>
              )}
            </div>
          </div>

          <div style={dividerStyle} />

          {/* ── SECTION 2: Biography ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            <div style={sectionHeaderStyle}>{t('biography')}</div>
            {biography ? (
              <div style={{ fontSize: 15, color: '#3a2a0a', lineHeight: 1.75, fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}>
                {biography}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: '#a08050', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                {t('noBiography')}
              </div>
            )}
          </div>

          <div style={dividerStyle} />

          {/* ── SECTION 3: Notable Figures ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px' }}>
            <div style={sectionHeaderStyle}>{t('notableFigures')}</div>
            <NotableFigures currentYear={currentYear} entityId={activeEntityId} />
          </div>

          <div style={dividerStyle} />

          {/* ── SECTION 4: Categories ── */}
          <div style={{ flexShrink: 0, width: 180, overflowY: 'auto', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ ...sectionHeaderStyle, fontSize: 13, marginBottom: 0 }}>{t('categories')}</div>
              <button onClick={() => onCategoryChange(allCategoriesSelected ? [] : categories.map(c => c.name))}
                style={{ background: 'transparent', border: '1px solid #c8a96e', borderRadius: 3, padding: '2px 6px', cursor: 'pointer', fontSize: 9, color: '#3a2a0a', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {allCategoriesSelected ? t('none') : t('all')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {categories.map(cat => {
                const active = selectedCategories.includes(cat.name)
                const key    = categoryKeys[cat.name]
                return (
                  <button key={cat.name} onClick={() => toggleCategory(cat.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? '#3a2a0a22' : 'transparent', border: `1px solid ${active ? '#c8a96e' : '#e8d8b0'}`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <span style={{ fontSize: 11, flexShrink: 0 }}>{cat.icon}</span>
                    <span style={{ fontSize: 12, fontFamily: 'Georgia, serif', color: active ? '#2a1a0a' : '#a08050', fontWeight: active ? 'bold' : 'normal', lineHeight: 1.2 }}>
                      {t(`categories_list.${key}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={dividerStyle} />

          {/* ── SECTION 5: Civilisations ── */}
          <div style={{ flexShrink: 0, width: 180, overflowY: 'auto', padding: '0 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ ...sectionHeaderStyle, fontSize: 13, marginBottom: 0 }}>{t('civilisations')}</div>
              <button onClick={() => onEntityChange(allEntitiesSelected ? [] : entities.map(e => e.id))}
                style={{ background: 'transparent', border: '1px solid #c8a96e', borderRadius: 3, padding: '2px 6px', cursor: 'pointer', fontSize: 9, color: '#3a2a0a', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>
                {allEntitiesSelected ? t('none') : t('all')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {entities.map(entity => {
                const active = selectedEntities.includes(entity.id)
                return (
                  <button key={entity.id} onClick={() => toggleEntity(entity.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? `${entity.colour}22` : 'transparent', border: `1px solid ${active ? entity.colour : '#e8d8b0'}`, borderRadius: 4, padding: '3px 8px', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: entity.colour, flexShrink: 0, opacity: active ? 1 : 0.35 }} />
                    <span style={{ fontSize: 11, fontFamily: 'Georgia, serif', color: active ? '#2a1a0a' : '#a08050', fontWeight: active ? 'bold' : 'normal' }}>
                      {entity.short}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── DynasticBar — no longer needed ───────────────────────────────────────
export function DynasticBar() { return null }

// ── EventPopup ───────────────────────────────────────────────────────────
export function EventPopup({ selectedEvent, onClose, language = 'en' }) {
  const { t } = useTranslation()
  const [narrating, setNarrating] = useState(false)
  const utteranceRef = useRef(null)

  // Language-aware event fields
  const title       = loc(selectedEvent, 'title', language)
  const description = loc(selectedEvent, 'description', language)
  const wikiUrl     = loc(selectedEvent, 'wikipedia_url', language)

  useEffect(() => {
    if (!description) return
    window.speechSynthesis.cancel()
    setNarrating(false)
    const utterance  = new SpeechSynthesisUtterance(description)
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
  }, [selectedEvent, language])

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
    <div style={{ position: 'fixed', top: 450, left: 20, width: 380, maxHeight: 'calc(100vh - 460px)', background: '#fdf6e3', border: `2px solid ${entityColor}`, borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.35)', zIndex: 50, display: 'flex', flexDirection: 'column', fontFamily: "'Cinzel', serif", overflow: 'hidden' }}>
      <div style={{ background: entityColor, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Georgia, serif' }}>{selectedEvent.category}</span>
            <span style={{ background: st.bg, color: st.color, borderRadius: 3, padding: '1px 5px', fontSize: 9, fontFamily: 'Georgia, serif' }}>{st.label}</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontFamily: 'Georgia, serif' }}>
            {selectedEvent.year}{selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}{selectedEvent.location_name ? ` · ${selectedEvent.location_name}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, flexShrink: 0 }}>
          <button onClick={toggleNarration} title={narrating ? t('narrator.silence') : t('narrator.read')}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 0 }}>
            {narrating ? '🔇' : '🔊'}
          </button>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>✕</button>
        </div>
      </div>
      <div style={{ padding: '12px 14px', overflowY: 'auto', flex: 1 }}>
        {selectedEvent.image_url && (
          <img src={selectedEvent.image_url} alt={title}
            style={{ width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 4, border: '1px solid #c8a96e', filter: 'sepia(15%)', marginBottom: 10 }} />
        )}
        <div style={{ fontSize: 20, color: '#3a2a0a', lineHeight: 1.75, fontFamily: "'IM Fell English', serif", fontStyle: 'italic' }}>
          {description}
        </div>
        {wikiUrl && (
          <a href={wikiUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#8a4caf', textDecoration: 'none', borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif' }}>
            {t('readMore')}
          </a>
        )}
      </div>
    </div>
  )
}