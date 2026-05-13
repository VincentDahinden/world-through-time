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
        position: 'fixed', top: 290, left: 0, right: 0,
        height: 50, background: '#f5edd8',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        borderBottom: '2px solid #8b6914',
borderLeft: '2px solid #8b6914',
borderRight: '2px solid #8b6914',
boxShadow: 'inset 0 -5px 0 -3px #c8a96e, inset 5px 0 0 -3px #c8a96e, inset -5px 0 0 -3px #c8a96e',
        fontFamily: 'Georgia, serif',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 6, zIndex: 15,
        overflowX: 'auto'
      }}>
        <button
          onClick={() => onCategoryChange(
            allSelected ? [] : categories.map(c => c.name)
          )}
          style={{
            padding: '3px 10px', flexShrink: 0,
            background: allSelected ? '#3a2a0a' : '#fff8ee',
            color: allSelected ? '#fff' : '#5a3e1b',
            border: '1px solid #c8a96e', borderRadius: 4,
            fontFamily: 'Georgia, serif', fontSize: 10,
            cursor: 'pointer'
          }}>
          {allSelected ? 'All ✓' : 'All'}
        </button>
  
        {categories.map(cat => {
          const active = selectedCategories.includes(cat.name)
          return (
            <button key={cat.name} onClick={() => toggleCategory(cat.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '3px 8px', flexShrink: 0,
                background: active ? '#3a2a0a' : '#fff8ee',
                color: active ? '#fff' : '#5a3e1b',
                border: '1px solid #c8a96e', borderRadius: 4,
                fontFamily: 'Georgia, serif', fontSize: 10,
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    )
  }