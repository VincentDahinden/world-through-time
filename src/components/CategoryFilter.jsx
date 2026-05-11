const categories = [
    { name: 'Governance & Law',       icon: '⚖️' },
    { name: 'Military & Conflict',    icon: '⚔️' },
    { name: 'Built Environment',      icon: '🏛️' },
    { name: 'Religion & Belief',      icon: '✝️' },
    { name: 'Economy & Trade',        icon: '⚖️' },
    { name: 'Society & Demographics', icon: '👥' },
    { name: 'Science & Knowledge',    icon: '🔭' },
    { name: 'Culture & Arts',         icon: '🎨' },
    { name: 'Power & Succession',     icon: '👑' },
    { name: 'Environment & Ecology',  icon: '🌿' },
    { name: 'Collapse & Transformation', icon: '💥' },
  ]
  
  export default function CategoryFilter({ selectedCategories, onCategoryChange }) {
    const toggleCategory = (name) => {
      if (selectedCategories.includes(name)) {
        onCategoryChange(selectedCategories.filter(c => c !== name))
      } else {
        onCategoryChange([...selectedCategories, name])
      }
    }
  
    const allSelected = selectedCategories.length === categories.length
  
    return (
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 60,
        width: 200, background: 'rgba(253, 246, 227, 0.95)',
        borderRight: '2px solid #c8a96e',
        fontFamily: 'Georgia, serif',
        overflowY: 'auto', padding: 12, zIndex: 10
      }}>
        <div style={{
          fontSize: 11, fontWeight: 'bold', color: '#3a2a0a',
          letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase'
        }}>
          Categories
        </div>
  
        {/* Select all / none */}
        <button
          onClick={() => onCategoryChange(
            allSelected ? [] : categories.map(c => c.name)
          )}
          style={{
            width: '100%', padding: '5px 0',
            background: allSelected ? '#3a2a0a' : '#fff8ee',
            color: allSelected ? '#fff' : '#5a3e1b',
            border: '1px solid #c8a96e', borderRadius: 6,
            fontFamily: 'Georgia, serif', fontSize: 11,
            cursor: 'pointer', marginBottom: 10
          }}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
  
        {/* Category buttons */}
        {categories.map(cat => {
          const active = selectedCategories.includes(cat.name)
          return (
            <button key={cat.name} onClick={() => toggleCategory(cat.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', padding: '6px 8px', marginBottom: 4,
                background: active ? '#3a2a0a' : '#fff8ee',
                color: active ? '#fff' : '#5a3e1b',
                border: '1px solid #c8a96e', borderRadius: 6,
                fontFamily: 'Georgia, serif', fontSize: 11,
                cursor: 'pointer', textAlign: 'left'
              }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    )
  }