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
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '10px 300px 10px 215px',
        background: '#f5e6c8', borderTop: '2px solid #8b6914',
        fontFamily: 'Georgia, serif', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  
          {/* Slider + labels */}
          <div style={{ flex: 1 }}>
            <div style={{
              textAlign: 'center', fontSize: 20,
              fontWeight: 'bold', color: '#3a2a0a', marginBottom: 4
            }}>
              {currentYear}
            </div>
            <input type="range" min="1400" max="1600"
              value={currentYear}
              onChange={e => onYearChange(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: '#7a6040', marginTop: 2
            }}>
              <span>1400</span>
              <span>1500</span>
              <span>1600</span>
            </div>
          </div>
  
          {/* Both buttons grouped on the right */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={decrease} style={btnStyle}>‹</button>
            <button onClick={increase} style={btnStyle}>›</button>
          </div>
  
        </div>
      </div>
    )
  }
