import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import WorldMap from './components/WorldMap'
import Timeline from './components/Timeline'
import RulerPanel, { EventPopup, DynasticBar } from './components/DetailsPanel'
import AmbientAudio from './components/AmbientAudio'

const ALL_CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

const ALL_ENTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function App() {
  const { t, i18n } = useTranslation()
  const [currentYear, setCurrentYear]               = useState(1500)
  const [selectedEvent, setSelectedEvent]           = useState(null)
  const [activeEntityId, setActiveEntityId]         = useState(6)
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)
  const [selectedEntities, setSelectedEntities]     = useState(ALL_ENTITIES)
  const [yearRange, setYearRange]                   = useState({ min: 43, max: 1815 })

  const language = i18n.language?.startsWith('fr') ? 'fr' : 'en'

  const toggleLanguage = () => {
    const next = language === 'en' ? 'fr' : 'en'
    i18n.changeLanguage(next)
  }

  useEffect(() => {
    async function fetchYearRange() {
      const { data, error } = await supabase.from('events').select('year, year_end')
      if (error) return
      const years = data.flatMap(e => [e.year, e.year_end].filter(Boolean))
      setYearRange({ min: Math.min(...years), max: Math.max(...years) })
      setCurrentYear(1500)
    }
    fetchYearRange()
  }, [])

  const handleEventSelect = (event) => {
    setSelectedEvent(event)
    if (event?.entity_id) setActiveEntityId(event.entity_id)
  }

  const handleEventClose = () => {
    setSelectedEvent(null)
    window.speechSynthesis.cancel()
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
        height: 35, display: 'flex', alignItems: 'center',
        background: '#3a2a0a',
      }}>
        {/* Language toggle — left side */}
        <button
          onClick={toggleLanguage}
          style={{
            marginLeft: 14,
            padding: '3px 10px',
            background: 'transparent',
            border: '1px solid #c8a96e',
            borderRadius: 4,
            color: '#c8a96e',
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            cursor: 'pointer',
            letterSpacing: 1,
            flexShrink: 0,
          }}
        >
          {language === 'en' ? 'FR' : 'EN'}
        </button>

        {/* Title — centred */}
        <span style={{
          fontFamily: 'Cinzel decorative, serif', fontSize: 16, fontWeight: 'bold',
          color: '#f5e6c8', letterSpacing: 2, textTransform: 'uppercase',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)', flex: 1, textAlign: 'center',
        }}>
          {t('appTitle')}
        </span>

        {/* Spacer — keeps title centred */}
        <div style={{ width: 60, flexShrink: 0 }} />
      </div>

      {/* Ruler strip */}
      <RulerPanel
        activeEntityId={activeEntityId}
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        selectedEntities={selectedEntities}
        onEntityChange={setSelectedEntities}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        language={language}
      />

      <DynasticBar activeEntityId={activeEntityId} currentYear={currentYear} />

      {/* Event popup */}
      <EventPopup selectedEvent={selectedEvent} onClose={handleEventClose} language={language} />

      {/* Map */}
      <WorldMap
        currentYear={currentYear}
        selectedCategories={selectedCategories}
        selectedEntities={selectedEntities}
        onEventSelect={handleEventSelect}
        selectedEvent={selectedEvent}
      />

      <AmbientAudio currentYear={currentYear} activeEntityId={activeEntityId} />

      <Timeline
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        minYear={yearRange.min}
        maxYear={yearRange.max}
      />

    </div>
  )
}

export default App