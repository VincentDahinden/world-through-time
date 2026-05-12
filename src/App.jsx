import { useState } from 'react'
import WorldMap from './components/WorldMap'
import Timeline from './components/Timeline'
import DetailsPanel from './components/DetailsPanel'
import CategoryFilter from './components/CategoryFilter'
import EntityFilter from './components/EntityFilter'

const ALL_CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

const ALL_ENTITIES = [1, 2, 3, 4, 5]

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)
  const [selectedEntities, setSelectedEntities] = useState(ALL_ENTITIES)

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorldMap
        currentYear={currentYear}
        selectedCategories={selectedCategories}
        selectedEntities={selectedEntities}
        onEventSelect={setSelectedEvent}
      />
      <EntityFilter
        selectedEntities={selectedEntities}
        onEntityChange={setSelectedEntities}
      />
      <Timeline
        currentYear={currentYear}
        onYearChange={setCurrentYear}
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