export default function Timeline({ currentYear, onYearChange }) {
    const decrease = () => onYearChange(Math.max(1400, currentYear - 1))
    const increase = () => onYearChange(Math.min(1600, currentYear + 1))
  
    const btnStyle = {
      background: '#3a2a0a', color: '#f5e6c8',
      border: 'none', borderRadius: 6,
      width: 32, height: 32, fontSize: 18,
      cursor: 'pointer', flexShrink: 0
    }
  
    return (
      <div style={{
        position: 'fixed', top: 340, left: 0, right: 0,
        height: 60, background: '#f5e6c8',
        borderBottom: '2px solid #8b6914',
        padding: '0 24px', fontFamily: 'Georgia, serif',
        display: 'flex', alignItems: 'center', gap: 12, zIndex: 15
      }}>
        <div style={{
          fontSize: 20, fontWeight: 'bold',
          color: '#3a2a0a', whiteSpace: 'nowrap', minWidth: 50
        }}>
          {currentYear}
        </div>
  
        <input type="range" min="1400" max="1600"
          value={currentYear}
          onChange={e => onYearChange(Number(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />
  
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={decrease} style={btnStyle}>‹</button>
          <button onClick={increase} style={btnStyle}>›</button>
        </div>
      </div>
    )
  }