import { useState, useEffect, useRef } from 'react'

const SPEEDS = [
  { label: 'Slow', value: 1500 },
  { label: 'Normal', value: 800 },
  { label: 'Fast', value: 300 },
]

export default function Timeline({ currentYear, onYearChange }) {
  const [playing, setPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const intervalRef = useRef(null)

  const decrease = () => onYearChange(Math.max(1400, currentYear - 1))
  const increase = () => onYearChange(Math.min(1600, currentYear + 1))

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onYearChange(prev => {
          if (prev >= 1600) {
            setPlaying(false)
            return 1600
          }
          return prev + 1
        })
      }, SPEEDS[speedIndex].value)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speedIndex])

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

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Speed buttons */}
        {SPEEDS.map((speed, idx) => (
          <button
            key={speed.label}
            onClick={() => setSpeedIndex(idx)}
            style={{
              padding: '3px 8px',
              background: speedIndex === idx ? '#3a2a0a' : '#fff8ee',
              color: speedIndex === idx ? '#fff' : '#5a3e1b',
              border: '1px solid #c8a96e',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontSize: 10,
              cursor: 'pointer',
              flexShrink: 0
            }}>
            {speed.label}
          </button>
        ))}

        {/* Year back/forward/play */}
        <button onClick={decrease} style={btnStyle}>‹</button>
        <button onClick={increase} style={btnStyle}>›</button>
        <button onClick={() => setPlaying(p => !p)} style={{
          ...btnStyle,
          width: 42,
          background: playing ? '#8b1a1a' : '#2a6e2a',
          fontSize: 14
        }}>
          {playing ? '■' : '▶'}
        </button>
      </div>
    </div>
  )
}