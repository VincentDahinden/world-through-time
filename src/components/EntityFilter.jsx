const entities = [
    { id: 1, name: 'Ottoman Empire',           short: 'Ottoman',   colour: '#C0622A' },
    { id: 2, name: 'Ming Dynasty',             short: 'Ming',      colour: '#3A6FA8' },
    { id: 3, name: 'Crown of Castile / Spain', short: 'Castile',   colour: '#8A4CAF' },
    { id: 4, name: 'Aztec Empire',             short: 'Aztec',     colour: '#2A9A4A' },
    { id: 5, name: 'New Spain',                short: 'New Spain', colour: '#A07830' },
    { id: 6, name: 'Kingdom of England',       short: 'England',   colour: '#9B1B30' },
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
        position: 'fixed', top: 35, left: 0, right: 0,
        height: 40, background: '#3a2a0a',
        borderBottom: '2px solid #c8a96e',
        fontFamily: 'Georgia, serif',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 8, zIndex: 20
      }}>
        <span style={{
          fontSize: 10, color: '#f5e6c8', letterSpacing: 1,
          textTransform: 'uppercase', marginRight: 8, whiteSpace: 'nowrap'
        }}>
          Civilisations
        </span>
  
        {entities.map(entity => {
          const active = selectedEntities.includes(entity.id)
          return (
            <button key={entity.id} onClick={() => toggleEntity(entity.id)}
              style={{
                padding: '3px 12px',
                background: active ? entity.colour : 'transparent',
                color: active ? '#fff' : entity.colour,
                border: `1px solid ${entity.colour}`,
                borderRadius: 4,
                fontFamily: 'Georgia, serif', fontSize: 11,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontWeight: 'bold'
              }}>
              {entity.short}
            </button>
          )
        })}
  
        <button
          onClick={() => onEntityChange(
            allSelected ? [] : entities.map(e => e.id)
          )}
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            background: 'transparent',
            color: '#f5e6c8',
            border: '1px solid #c8a96e', borderRadius: 4,
            fontFamily: 'Georgia, serif', fontSize: 10,
            cursor: 'pointer'
          }}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
    )
  }