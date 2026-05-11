export default function Timeline({ currentYear, onYearChange }) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#f5e6c8', borderTop: '2px solid #8b6914',
        padding: '12px 24px', fontFamily: 'Georgia, serif', zIndex: 10
      }}>
        <div style={{ textAlign: 'center', fontSize: 22,
          fontWeight: 'bold', color: '#3a2a0a', marginBottom: 8 }}>
          {currentYear}
        </div>
        <input type="range" min="1400" max="1600"
          value={currentYear}
          onChange={e => onYearChange(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between',
          fontSize: 12, color: '#7a6040', marginTop: 4 }}>
          <span>1400</span>
          <span>1500</span>
          <span>1600</span>
        </div>
      </div>
    )
  }