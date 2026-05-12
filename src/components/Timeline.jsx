import { useState, useEffect, useRef } from 'react'

const SPEEDS = [
  { label: 'Slow', value: 1500 },
  { label: 'Normal', value: 800 },
  { label: 'Fast', value: 300 },
]

export default function Timeline({ currentYear, onYearChange, minYear = 43, maxYear = 1815 }) {
  const [playing, setPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const intervalRef = useRef(null)

  const decrease = () => onYearChange(Math.max(minYear, currentYear - 1))
  const increase = () => onYearChange(Math.min(maxYear, currentYear + 1))

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onYearChange(prev => {
          if (prev >= maxYear) {
            setPlaying(false)
            return maxYear
          }
          return prev + 1
        })
      }, SPEEDS[speedIndex].value)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speedIndex, maxYear])

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
      display: 'flex', alignItems: 'center', gap: 8, zIndex: 15
    }}>

      {/* Min year */}
      <div style={{
        fontSize: 13, color: '#7a6040',
        whiteSpace: 'nowrap', flexShrink: 0, minWidth: 35,
        textAlign: 'right'
      }}>
        {minYear}
      </div>

      {/* Slider */}
      <input type="range"
        min={minYear} max={maxYear}
        value={currentYear}
        onChange={e => onYearChange(Number(e.target.value))}
        style={{ flex: 1, cursor: 'pointer' }}
      />

      {/* Max year */}
      <div style={{
        fontSize: 13, color: '#7a6040',
        whiteSpace: 'nowrap', flexShrink: 0, minWidth: 35
      }}>
        {maxYear}
      </div>

      {/* Current year — centred above slider */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        fontSize: 22, fontWeight: 'bold',
        color: '#3a2a0a', pointerEvents: 'none'
      }}>
        {currentYear}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {SPEEDS.map((speed, idx) => (
          <button key={speed.label} onClick={() => setSpeedIndex(idx)} style={{
            padding: '3px 8px',
            background: speedIndex === idx ? '#3a2a0a' : '#fff8ee',
            color: speedIndex === idx ? '#fff' : '#5a3e1b',
            border: '1px solid #c8a96e', borderRadius: 4,
            fontFamily: 'Georgia, serif', fontSize: 10,
            cursor: 'pointer', flexShrink: 0
          }}>
            {speed.label}
          </button>
        ))}
        <button onClick={decrease} style={btnStyle}>‹</button>
        <button onClick={increase} style={btnStyle}>›</button>
        <button onClick={() => setPlaying(p => !p)} style={{
          ...btnStyle, width: 42,
          background: playing ? '#8b1a1a' : '#2a6e2a',
          fontSize: 14
        }}>
          {playing ? '■' : '▶'}
        </button>
      </div>

    </div>
  )
}