import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const entityColors = {
  'Ottoman Empire':           '#C0622A',
  'Ming Dynasty':             '#3A6FA8',
  'Crown of Castile / Spain': '#8A4CAF',
  'Aztec Empire':             '#2A9A4A',
  'New Spain':                '#A07830',
}

export default function RulerBox({ currentYear }) {
  const [rulers, setRulers] = useState([])

  useEffect(() => {
    async function fetchRulers() {
      const { data, error } = await supabase
        .from('rulers')
        .select('*, entities(name)')
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
      if (error) console.error('Rulers error:', error)
      else setRulers(data)
    }
    fetchRulers()
  }, [currentYear])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'rgba(253, 246, 227, 0.95)',
      borderBottom: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', flexWrap: 'wrap',
      gap: 8, padding: '8px 16px', zIndex: 10
    }}>
      {rulers.map(ruler => (
        <div key={ruler.id} style={{
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entityColors[ruler.entities?.name] || '#999'
          }} />
          <span style={{ fontSize: 11, color: '#5a3e1b' }}>
            {ruler.entities?.name}:
          </span>
          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#2a1a0a' }}>
            {ruler.name}
          </span>
        </div>
      ))}
    </div>
  )
}