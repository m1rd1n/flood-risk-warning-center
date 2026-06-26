import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, LineElement, LineController, PointElement, Tooltip)

const DANGER_MM = 8
const KL_LAT = 3.139
const KL_LON = 101.6869

// Realistic monsoon fallback shaped around peak hours
const MOCK_RAIN = [
  0, 0, 0.2, 0.8, 2.1, 3.4, 5.2, 7.8, 11.2, 13.5, 9.4, 6.2,
  4.1, 2.8, 1.5, 0.8, 0.3, 0, 0.1, 1.2, 3.5, 6.8, 10.2, 8.5,
]

export function RainfallChart({ theme }: { theme: 'light' | 'dark' }) {
  const [precip, setPrecip] = useState<number[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${KL_LAT}&longitude=${KL_LON}` +
        `&hourly=precipitation&past_days=1&forecast_days=1&timezone=Asia%2FKuala_Lumpur`,
    )
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then(json => {
        const times: string[] = json.hourly.time
        const rain: number[] = json.hourly.precipitation
        const nowH = new Date().getHours()
        // Find the index in the data closest to current hour (past half)
        let mid = times.findIndex((t, i) => i > 20 && new Date(t).getHours() === nowH)
        if (mid < 0) mid = 24
        const s = Math.max(0, mid - 12)
        setLabels(
          times.slice(s, s + 24).map(t => `${new Date(t).getHours().toString().padStart(2, '0')}:00`),
        )
        setPrecip(rain.slice(s, s + 24))
        setIsLive(true)
      })
      .catch(() => {
        const h = new Date().getHours()
        setLabels(
          Array.from({ length: 24 }, (_, i) =>
            `${((h - 12 + i + 24) % 24).toString().padStart(2, '0')}:00`,
          ),
        )
        setPrecip(MOCK_RAIN)
      })
      .finally(() => setLoading(false))
  }, [])

  const dark = theme === 'dark'
  const textColor = dark ? '#c5c5d3' : '#444651'
  const gridColor = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  if (loading) {
    return (
      <div
        style={{
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--on-surface-variant)',
          fontSize: 13,
        }}
      >
        Memuatkan data hujan semasa…
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--on-surface-variant)',
            letterSpacing: '0.08em',
          }}
        >
          TABURAN HUJAN 24 JAM
        </span>
        <span className={`badge ${isLive ? 'badge-success' : 'badge-gray'}`} style={{ fontSize: 9 }}>
          {isLive ? '● LANGSUNG' : 'SIMULASI'}
        </span>
      </div>

      <div style={{ height: 160 }}>
        <Chart type='bar'
          data={{
            labels,
            datasets: [
              {
                type: 'bar' as const,
                label: 'Hujan',
                data: precip,
                backgroundColor: precip.map(v =>
                  v >= DANGER_MM ? 'rgba(248,113,113,0.80)' : 'rgba(34,211,238,0.55)',
                ),
                borderColor: precip.map(v => (v >= DANGER_MM ? '#f87171' : '#22d3ee')),
                borderWidth: 1,
                borderRadius: 2,
              },
              {
                type: 'line' as const,
                label: `Had Bahaya`,
                data: Array(labels.length).fill(DANGER_MM),
                borderColor: 'rgba(248,113,113,0.60)',
                borderDash: [4, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: any) =>
                    ctx.datasetIndex === 0
                      ? `${ctx.raw} mm/j`
                      : `Had bahaya: ${ctx.raw} mm/j`,
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  font: { size: 9 },
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 8,
                },
                grid: { color: gridColor },
              },
              y: {
                ticks: { color: textColor, font: { size: 9 } },
                grid: { color: gridColor },
                beginAtZero: true,
              },
            },
          } as any}
        />
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 10, color: 'var(--on-surface-variant)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'rgba(34,211,238,0.55)',
            }}
          />{' '}
          Normal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              background: 'rgba(248,113,113,0.80)',
            }}
          />{' '}
          Melebihi had ({DANGER_MM}mm/j)
        </span>
      </div>
    </div>
  )
}
