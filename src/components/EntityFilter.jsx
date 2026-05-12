const entities = [
    { id: 1, name: 'Ottoman Empire',           short: 'Ottoman',   colour: '#C0622A' },
    { id: 2, name: 'Ming Dynasty',             short: 'Ming',      colour: '#3A6FA8' },
    { id: 3, name: 'Crown of Castile / Spain', short: 'Castile',   colour: '#8A4CAF' },
    { id: 4, name: 'Aztec Empire',             short: 'Aztec',     colour: '#2A9A4A' },
    { id: 5, name: 'New Spain',                short: 'New Spain', colour: '#A07830' },
  ]
  
  export default function EntityFilter({ selectedEntities, onEntityChange }) {
    const toggleEntity = (id) => {
      if (selectedEntities.includes(id)) {
        onEntityChange(selectedEntities.filter(e => e !== id))
      } else {
        onEntityChange([...selectedEntities, id])
      }
    }
  
    const allSelected = selectedEntities.length === entities.length
  
    return (
      <div style={{
        position: 'fixed', right: 0, top: 0,
        width: 305, background: '#f0e6cc',
        borderLeft: '2px solid #c8a96e',
        borderBottom: '2px solid #c8a96e',
        fontFamily: 'Georgia, serif',
        padding: '10px 12px', zIndex: 11
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 8
        }}>
          <div style={{
            fontSize: 10, fontWeight: 'bold', color: '#3a2a0a',
            letterSpacing: 1, textTransform: 'uppercase'
          }}>
            Civilisations
          </div>
          <button
            onClick={() => onEntityChange(
              allSelected ? [] : entities.map(e => e.id)
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
  
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {entities.map(entity => {
            const active = selectedEntities.includes(entity.id)
            return (
              <button key={entity.id} onClick={() => toggleEntity(entity.id)}
                style={{
                  padding: '3px 10px',
                  background: active ? entity.colour : '#fff8ee',
                  color: active ? '#fff' : entity.colour,
                  border: `1px solid ${entity.colour}`,
                  borderRadius: 4,
                  fontFamily: 'Georgia, serif', fontSize: 10,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontWeight: 'bold'
                }}>
                {entity.short}
              </button>
            )
          })}
        </div>
      </div>
    )
  }