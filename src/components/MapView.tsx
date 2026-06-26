import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

// ── Minimal prop types (matches index.tsx data shapes) ────────────────────────

interface ShelterPin {
  id: string
  name: string
  capacity: number
  occupied: number
  roadStatus: 'safe' | 'caution' | 'closed'
  contact: string
}

interface AidPin {
  id: string
  kampung: string
  displaced: number
  status: 'pending' | 'assigned' | 'delivered'
  priority: 'high' | 'medium' | 'low'
}

export interface MapViewProps {
  shelters: ShelterPin[]
  aidRequests: AidPin[]
  mini?: boolean
  theme?: 'light' | 'dark'
  userLocation?: [number, number] | null  // [lng, lat]
}

// ── Static coordinate lookups (by mock data ID) ───────────────────────────────

const SHELTER_COORDS: Record<string, [number, number]> = {
  s1: [101.575, 3.21],   // Sungai Buloh
  s2: [101.447, 3.045],  // Klang
  s3: [102.62, 3.505],   // Kg. Sentosa, Pahang
  s4: [101.735, 3.248],  // Gombak, KL
  s5: [102.582, 3.465],  // Bera, Pahang
}

const AID_COORDS: Record<string, [number, number]> = {
  a1: [102.62, 3.505],   // Kg. Sentosa
  a2: [101.45, 3.048],   // Kg. Baru Klang
  a3: [101.533, 3.058],  // Taman Maju
  a4: [101.727, 3.14],   // Kg. Pandan
  a5: [101.775, 3.085],  // Bandar Sg. Long
}

// ── Simulated flood zones (real Malaysian river corridors) ────────────────────
// Each zone has an activation hour (when flooding starts) and a max opacity.
// The time slider (0-23h) drives fill-opacity interpolation.

const FLOOD_ZONES = [
  {
    id: 'fz-klang-core',
    activatesAt: 0,
    color: '#ba1a1a',
    maxOpacity: 0.62,
    label: 'Kawasan Kritikal – Sg. Klang',
    coords: [[
      [101.40, 3.04], [101.44, 3.09], [101.53, 3.11],
      [101.60, 3.08], [101.58, 3.00], [101.50, 2.97],
      [101.42, 2.99], [101.40, 3.04],
    ]] as number[][][],
  },
  {
    id: 'fz-klang-high',
    activatesAt: 5,
    color: '#f97316',
    maxOpacity: 0.48,
    label: 'Risiko Tinggi – Lembah Klang',
    coords: [[
      [101.35, 2.97], [101.40, 3.04], [101.53, 3.11],
      [101.68, 3.15], [101.70, 3.04], [101.60, 2.92],
      [101.44, 2.90], [101.35, 2.97],
    ]] as number[][][],
  },
  {
    id: 'fz-pahang-core',
    activatesAt: 2,
    color: '#ba1a1a',
    maxOpacity: 0.58,
    label: 'Kawasan Kritikal – Sg. Pahang',
    coords: [[
      [102.52, 3.40], [102.56, 3.50], [102.68, 3.52],
      [102.74, 3.44], [102.70, 3.35], [102.58, 3.31],
      [102.52, 3.40],
    ]] as number[][][],
  },
  {
    id: 'fz-selangor-north',
    activatesAt: 9,
    color: '#eab308',
    maxOpacity: 0.38,
    label: 'Risiko Sederhana – Selangor Utara',
    coords: [[
      [101.55, 3.11], [101.58, 3.22], [101.70, 3.26],
      [101.78, 3.19], [101.74, 3.09], [101.64, 3.05],
      [101.55, 3.11],
    ]] as number[][][],
  },
  {
    id: 'fz-pahang-ext',
    activatesAt: 11,
    color: '#eab308',
    maxOpacity: 0.32,
    label: 'Risiko Sederhana – Pahang Tengah',
    coords: [[
      [102.44, 3.35], [102.52, 3.52], [102.74, 3.58],
      [102.84, 3.48], [102.78, 3.30], [102.58, 3.26],
      [102.44, 3.35],
    ]] as number[][][],
  },
]

function calcOpacity(zone: (typeof FLOOD_ZONES)[0], t: number): number {
  if (t < zone.activatesAt) return 0
  const progress = Math.min((t - zone.activatesAt) / Math.max(1, 22 - zone.activatesAt), 1)
  return progress * zone.maxOpacity
}

const MAP_CENTER: [number, number] = [101.95, 3.28]
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// ── Component ─────────────────────────────────────────────────────────────────

export function MapView({ shelters, aidRequests, mini = false, theme: _theme = 'light', userLocation }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [timeStep, setTimeStep] = useState(0)
  const [showFlood, setShowFlood] = useState(true)
  const [showShelters, setShowShelters] = useState(true)
  const [showAid, setShowAid] = useState(true)
  const [playing, setPlaying] = useState(false)

  // Auto-play animation
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setTimeStep(t => {
        if (t >= 23) { setPlaying(false); return 23 }
        return t + 1
      })
    }, 600)
    return () => clearInterval(id)
  }, [playing])

  // Initialise MapLibre (dynamic import — safe for SSR)
  useEffect(() => {
    if (!containerRef.current) return
    let isMounted = true

    const init = async () => {
      const mgl = await import('maplibre-gl')
      if (!isMounted || !containerRef.current) return

      const map = new mgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: MAP_CENTER,
        zoom: mini ? 8.8 : 7.8,
        interactive: !mini,
        attributionControl: false,
      })

      mapRef.current = map

      if (!mini) {
        map.addControl(new mgl.NavigationControl({ showCompass: false }), 'top-right')
      }

      map.on('load', () => {
        if (!isMounted) return

        // ── Flood zone polygons ──────────────────────────────────────
        map.addSource('flood-zones', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: FLOOD_ZONES.map(z => ({
              type: 'Feature',
              id: z.id,
              properties: { zoneId: z.id, color: z.color },
              geometry: { type: 'Polygon', coordinates: z.coords },
            })),
          },
        })

        FLOOD_ZONES.forEach(z => {
          map.addLayer({
            id: `${z.id}-fill`,
            type: 'fill',
            source: 'flood-zones',
            filter: ['==', ['get', 'zoneId'], z.id],
            paint: { 'fill-color': z.color, 'fill-opacity': 0 },
          })
          map.addLayer({
            id: `${z.id}-border`,
            type: 'line',
            source: 'flood-zones',
            filter: ['==', ['get', 'zoneId'], z.id],
            paint: {
              'line-color': z.color,
              'line-width': 1.5,
              'line-opacity': 0,
              'line-dasharray': [3, 2],
            },
          })
        })

        // ── Shelter source (with clustering) ─────────────────────────
        const shelterFeatures = shelters
          .filter(s => SHELTER_COORDS[s.id])
          .map(s => {
            const pct = Math.round((s.occupied / s.capacity) * 100)
            return {
              type: 'Feature' as const,
              properties: {
                id: s.id,
                name: s.name,
                capacity: s.capacity,
                occupied: s.occupied,
                pct,
                roadStatus: s.roadStatus,
                contact: s.contact,
                pinColor: pct >= 100 ? '#ba1a1a' : pct >= 75 ? '#b45309' : '#006e2d',
              },
              geometry: { type: 'Point' as const, coordinates: SHELTER_COORDS[s.id] },
            }
          })

        map.addSource('shelters', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: shelterFeatures },
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50,
        })

        // Cluster bubble
        map.addLayer({
          id: 'shelter-cluster',
          type: 'circle',
          source: 'shelters',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#00236f',
            'circle-radius': 20,
            'circle-opacity': 0.9,
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
          },
        })
        map.addLayer({
          id: 'shelter-cluster-count',
          type: 'symbol',
          source: 'shelters',
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 13 },
          paint: { 'text-color': '#fff' },
        })

        // Individual shelter dot
        map.addLayer({
          id: 'shelter-point',
          type: 'circle',
          source: 'shelters',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 13,
            'circle-color': ['get', 'pinColor'],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
            'circle-opacity': 0.92,
          },
        })
        map.addLayer({
          id: 'shelter-pct',
          type: 'symbol',
          source: 'shelters',
          filter: ['!', ['has', 'point_count']],
          layout: {
            'text-field': ['concat', ['to-string', ['get', 'pct']], '%'],
            'text-size': 9,
            'text-offset': [0, 1.9],
            'text-anchor': 'top',
          },
          paint: { 'text-color': '#191c1e', 'text-halo-color': '#fff', 'text-halo-width': 1.5 },
        })

        // Shelter popup on click
        map.on('click', 'shelter-point', (e: any) => {
          const p = e.features[0].properties
          const coords = e.features[0].geometry.coordinates.slice() as [number, number]
          const statusColor = p.roadStatus === 'safe' ? '#006e2d' : p.roadStatus === 'caution' ? '#b45309' : '#ba1a1a'
          const statusIcon = p.roadStatus === 'safe' ? '✅' : p.roadStatus === 'caution' ? '⚠️' : '🚫'
          const statusLabel = p.roadStatus === 'safe' ? 'Selamat' : p.roadStatus === 'caution' ? 'Berhati-hati' : 'Ditutup'

          new mgl.Popup({ maxWidth: '260px', offset: 16 })
            .setLngLat(coords)
            .setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px 2px">
                <div style="font-weight:700;font-size:14px;color:#00236f;margin-bottom:6px">${p.name}</div>
                <div style="font-size:13px;margin-bottom:4px">
                  👥 ${p.occupied}/${p.capacity}
                  <strong style="color:${p.pct>=100?'#ba1a1a':p.pct>=75?'#b45309':'#006e2d'}"> (${p.pct}%)</strong>
                </div>
                <div style="font-size:13px;color:${statusColor};margin-bottom:4px">${statusIcon} ${statusLabel}</div>
                <div style="font-size:12px;color:#757682">📞 ${p.contact}</div>
              </div>
            `)
            .addTo(map)
        })
        map.on('mouseenter', 'shelter-point', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'shelter-point', () => { map.getCanvas().style.cursor = '' })

        // Cluster expand on click
        map.on('click', 'shelter-cluster', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['shelter-cluster'] })
          const clusterId = features[0].properties.cluster_id
          ;(map.getSource('shelters') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return
            map.easeTo({ center: features[0].geometry.coordinates as [number, number], zoom })
          })
        })
        map.on('mouseenter', 'shelter-cluster', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'shelter-cluster', () => { map.getCanvas().style.cursor = '' })

        // ── Aid request pins ─────────────────────────────────────────
        const aidFeatures = aidRequests
          .filter(r => AID_COORDS[r.id])
          .map(r => ({
            type: 'Feature' as const,
            properties: {
              id: r.id,
              kampung: r.kampung,
              displaced: r.displaced,
              status: r.status,
              priority: r.priority,
              pinColor: r.priority === 'high' ? '#ba1a1a' : r.priority === 'medium' ? '#b45309' : '#006e2d',
            },
            geometry: { type: 'Point' as const, coordinates: AID_COORDS[r.id] },
          }))

        map.addSource('aid', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: aidFeatures },
        })

        map.addLayer({
          id: 'aid-point',
          type: 'circle',
          source: 'aid',
          paint: {
            'circle-radius': 10,
            'circle-color': ['get', 'pinColor'],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1.5,
            'circle-opacity': 0.85,
          },
        })
        map.addLayer({
          id: 'aid-symbol',
          type: 'symbol',
          source: 'aid',
          layout: { 'text-field': '📦', 'text-size': 12, 'text-offset': [0, 0.1], 'text-anchor': 'center' },
        })

        map.on('click', 'aid-point', (e: any) => {
          const p = e.features[0].properties
          const coords = e.features[0].geometry.coordinates.slice() as [number, number]
          const statusMap: Record<string, string> = { pending: 'Menunggu', assigned: 'Ditugaskan', delivered: 'Dihantar' }
          const priMap: Record<string, string> = { high: '🔴 Tinggi', medium: '🟡 Sederhana', low: '🟢 Rendah' }
          new mgl.Popup({ maxWidth: '240px', offset: 14 })
            .setLngLat(coords)
            .setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px 2px">
                <div style="font-weight:700;font-size:14px;margin-bottom:6px">📍 ${p.kampung}</div>
                <div style="font-size:13px;margin-bottom:3px">👥 ${p.displaced} orang terlantar</div>
                <div style="font-size:12px;margin-bottom:2px">Status: <strong>${statusMap[p.status]}</strong></div>
                <div style="font-size:12px">Keutamaan: <strong>${priMap[p.priority]}</strong></div>
              </div>
            `)
            .addTo(map)
        })
        map.on('mouseenter', 'aid-point', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'aid-point', () => { map.getCanvas().style.cursor = '' })

        // ── User location marker (shown when geolocation is active) ────────
        map.addSource('user-location', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} },
        })
        map.addLayer({
          id: 'user-loc-halo',
          type: 'circle',
          source: 'user-location',
          paint: { 'circle-radius': 20, 'circle-color': '#22d3ee', 'circle-opacity': 0 },
        })
        map.addLayer({
          id: 'user-loc-dot',
          type: 'circle',
          source: 'user-location',
          paint: {
            'circle-radius': 9,
            'circle-color': '#22d3ee',
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2.5,
            'circle-opacity': 0,
          },
        })

        setLoaded(true)
      })
    }

    init().catch(console.error)

    return () => {
      isMounted = false
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync flood opacity to time slider ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    FLOOD_ZONES.forEach(z => {
      const opacity = showFlood ? calcOpacity(z, timeStep) : 0
      if (map.getLayer(`${z.id}-fill`)) {
        map.setPaintProperty(`${z.id}-fill`, 'fill-opacity', opacity)
        map.setPaintProperty(`${z.id}-border`, 'line-opacity', opacity > 0 ? Math.min(opacity * 1.4, 0.8) : 0)
      }
    })
  }, [timeStep, showFlood, loaded])

  // ── Sync shelter layer visibility ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    const vis = showShelters ? 'visible' : 'none'
    ;['shelter-cluster', 'shelter-cluster-count', 'shelter-point', 'shelter-pct'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis)
    })
  }, [showShelters, loaded])

  // ── Sync aid layer visibility ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    const vis = showAid ? 'visible' : 'none'
    ;['aid-point', 'aid-symbol'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis)
    })
  }, [showAid, loaded])

  // ── Sync user location marker ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    if (!userLocation) return
    ;(map.getSource('user-location') as any)?.setData({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: userLocation },
      properties: {},
    })
    if (map.getLayer('user-loc-halo')) {
      map.setPaintProperty('user-loc-halo', 'circle-opacity', 0.22)
      map.setPaintProperty('user-loc-dot', 'circle-opacity', 0.95)
    }
    map.easeTo({ center: userLocation, zoom: mini ? 11 : 10.5, duration: 900 })
  }, [userLocation, loaded, mini])

  const hourLabel = (h: number) => {
    const suffix = h < 12 ? 'PG' : h < 18 ? 'PTG' : 'MLM'
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:00${suffix} (+${h}j)`
  }

  // ── Mini-map render (no controls) ────────────────────────────────────────────
  if (mini) {
    return <div ref={containerRef} style={{ height: 190, width: '100%' }} />
  }

  // ── Full map render ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Map canvas */}
      <div ref={containerRef} style={{ height: 'min(calc(100dvh - 310px), 480px)', minHeight: 300, width: '100%' }} />

      {/* Time slider */}
      <div
        style={{
          padding: '10px 16px 8px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--outline-variant)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.06em' }}>
            ANIMASI PERKEMBANGAN BANJIR
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
            {hourLabel(timeStep)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setPlaying(false); setTimeStep(0) }}
            style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 4, width: 28, height: 28, cursor: 'pointer', color: 'var(--on-surface)', fontSize: 13 }}
            title="Reset"
          >⏮</button>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ background: playing ? 'var(--primary)' : 'var(--surface-container)', border: 'none', borderRadius: 4, width: 28, height: 28, cursor: 'pointer', color: playing ? '#fff' : 'var(--on-surface)', fontSize: 13 }}
            title={playing ? 'Jeda' : 'Main'}
          >{playing ? '⏸' : '▶'}</button>
          <input
            type="range"
            min={0}
            max={23}
            value={timeStep}
            onChange={e => { setPlaying(false); setTimeStep(Number(e.target.value)) }}
            style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <button
            onClick={() => setTimeStep(t => Math.min(23, t + 1))}
            style={{ background: 'var(--surface-container)', border: 'none', borderRadius: 4, width: 28, height: 28, cursor: 'pointer', color: 'var(--on-surface)', fontSize: 13 }}
          >⏭</button>
        </div>
        {/* Hour tick marks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, padding: '0 36px 0 68px', fontSize: 9, color: 'var(--outline)' }}>
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}j</span>)}
        </div>
      </div>

      {/* Layer toggles + legend */}
      <div
        style={{
          padding: '8px 16px 10px',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          borderTop: '1px solid var(--outline-variant)',
        }}
      >
        {([
          { label: '🌊 Banjir', active: showFlood, toggle: () => setShowFlood(v => !v) },
          { label: '🏠 Pemindahan', active: showShelters, toggle: () => setShowShelters(v => !v) },
          { label: '📦 Bantuan', active: showAid, toggle: () => setShowAid(v => !v) },
        ] as const).map(btn => (
          <button
            key={btn.label}
            onClick={btn.toggle}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: '1.5px solid var(--primary)',
              background: btn.active ? 'var(--primary)' : 'transparent',
              color: btn.active ? 'var(--on-primary)' : 'var(--primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 10, color: 'var(--on-surface-variant)', alignItems: 'center' }}>
          {[
            { color: '#ba1a1a', label: 'Kritikal' },
            { color: '#f97316', label: 'Tinggi' },
            { color: '#eab308', label: 'Sederhana' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: l.color, opacity: 0.75 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
