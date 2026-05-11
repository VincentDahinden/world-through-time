import { useState } from 'react'
import WorldMap from './components/WorldMap'
import Timeline from './components/Timeline'
import DetailsPanel from './components/DetailsPanel'
import CategoryFilter from './components/CategoryFilter'

const ALL_CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorldMap
        currentYear={currentYear}
        selectedCategories={selectedCategories}
        onEventSelect={setSelectedEvent}
      />
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
      />
      <Timeline
        currentYear={currentYear}
        onYearChange={setCurrentYear}
      />
      <DetailsPanel
        selectedEvent={selectedEvent}
        currentYear={currentYear}
      />
    </div>
  )
}

export default App