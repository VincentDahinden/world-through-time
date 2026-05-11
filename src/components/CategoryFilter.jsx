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
        position: 'fixed', right: 0, bottom: 50,
        width: 305, height: 260,
        boxsizing: 'border-box',
        background: '#f0e6cc',
        borderLeft: '2px solid #c8a96e',
        borderTop: '2px solid #c8a96e',
        fontFamily: 'Georgia, serif',
        padding: '10px 12px',
        overflowY: 'auto',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 8
        }}>
          <div style={{
            fontSize: 10, fontWeight: 'bold', color: '#3a2a0a',
            letterSpacing: 1, textTransform: 'uppercase'
          }}>
            Categories
          </div>
          <button
            onClick={() => onCategoryChange(
              allSelected ? [] : categories.map(c => c.name)
            )}
            style={{
              padding: '2px 8px',
              background: allSelected ? '#3a2a0a' : '#fff8ee',
              color: allSelected ? '#fff' : '#5a3e1b',
              border: '1px solid #c8a96e', borderRadius: 4,
              fontFamily: 'Georgia, serif', fontSize: 10,
              cursor: 'pointer'
            }}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
  
        {/* Category buttons — wrapped horizontal */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {categories.map(cat => {
            const active = selectedCategories.includes(cat.name)
            return (
              <button key={cat.name} onClick={() => toggleCategory(cat.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 7px',
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
      </div>
    )
  }