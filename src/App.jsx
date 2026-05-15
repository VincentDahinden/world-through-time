import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import WorldMap from './components/WorldMap'
import Timeline from './components/Timeline'
import DetailsPanel from './components/DetailsPanel'
import CategoryFilter from './components/CategoryFilter'
import EntityFilter from './components/EntityFilter'
import AmbientAudio from './components/AmbientAudio'


const ALL_CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

const ALL_ENTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)
  const [selectedEntities, setSelectedEntities] = useState(ALL_ENTITIES)
  const [yearRange, setYearRange] = useState({ min: 43, max: 1815 })
  

  useEffect(() => {
    async function fetchYearRange() {
      const { data, error } = await supabase
        .from('events')
        .select('year, year_end')
      if (error) return
      const years = data.flatMap(e => [e.year, e.year_end].filter(Boolean))
      const min = Math.min(...years)
      const max = Math.max(...years)
      setYearRange({ min, max })
      setCurrentYear(1500)
    }
    fetchYearRange()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 30, padding: '0 16px',
        height: 35, display: 'flex', alignItems: 'center',
        background: '#3a2a0a', pointerEvents: 'none'
      }}>
        <span style={{
          fontFamily: 'Cinzel decorative, serif',
          fontSize: 16, fontWeight: 'bold',
          color: '#f5e6c8', letterSpacing: 2,
          textTransform: 'uppercase',
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          flex: 1, textAlign: 'center'
        }}>
          The World Through Time
        </span>
      </div>

      <WorldMap
        currentYear={currentYear}
        selectedCategories={selectedCategories}
        selectedEntities={selectedEntities}
        onEventSelect={setSelectedEvent}
        selectedEvent={selectedEvent}
      />


        <AmbientAudio currentYear={currentYear} selectedEvent={selectedEvent} />
      
            <EntityFilter
        selectedEntities={selectedEntities}
        onEntityChange={setSelectedEntities}
      />
      <Timeline
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        minYear={yearRange.min}
        maxYear={yearRange.max}
      />
      <DetailsPanel
        selectedEvent={selectedEvent}
        currentYear={currentYear}
      />
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
      />
    </div>
  )
}

export default App