import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Chart as Chart$1, CategoryScale, LinearScale, BarElement, BarController, LineElement, LineController, PointElement, Tooltip } from "chart.js";
import { Chart } from "react-chartjs-2";
Chart$1.register(CategoryScale, LinearScale, BarElement, BarController, LineElement, LineController, PointElement, Tooltip);
const DANGER_MM = 8;
const KL_LAT = 3.139;
const KL_LON = 101.6869;
const MOCK_RAIN = [
  0,
  0,
  0.2,
  0.8,
  2.1,
  3.4,
  5.2,
  7.8,
  11.2,
  13.5,
  9.4,
  6.2,
  4.1,
  2.8,
  1.5,
  0.8,
  0.3,
  0,
  0.1,
  1.2,
  3.5,
  6.8,
  10.2,
  8.5
];
function RainfallChart({ theme }) {
  const [precip, setPrecip] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${KL_LAT}&longitude=${KL_LON}&hourly=precipitation&past_days=1&forecast_days=1&timezone=Asia%2FKuala_Lumpur`
    ).then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.json();
    }).then((json) => {
      const times = json.hourly.time;
      const rain = json.hourly.precipitation;
      const nowH = (/* @__PURE__ */ new Date()).getHours();
      let mid = times.findIndex((t, i) => i > 20 && new Date(t).getHours() === nowH);
      if (mid < 0) mid = 24;
      const s = Math.max(0, mid - 12);
      setLabels(
        times.slice(s, s + 24).map((t) => `${new Date(t).getHours().toString().padStart(2, "0")}:00`)
      );
      setPrecip(rain.slice(s, s + 24));
      setIsLive(true);
    }).catch(() => {
      const h = (/* @__PURE__ */ new Date()).getHours();
      setLabels(
        Array.from(
          { length: 24 },
          (_, i) => `${((h - 12 + i + 24) % 24).toString().padStart(2, "0")}:00`
        )
      );
      setPrecip(MOCK_RAIN);
    }).finally(() => setLoading(false));
  }, []);
  const dark = theme === "dark";
  const textColor = dark ? "#c5c5d3" : "#444651";
  const gridColor = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  if (loading) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--on-surface-variant)",
          fontSize: 13
        },
        children: "Memuatkan data hujan semasa…"
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            fontSize: 11,
            fontWeight: 700,
            color: "var(--on-surface-variant)",
            letterSpacing: "0.08em"
          },
          children: "TABURAN HUJAN 24 JAM"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: `badge ${isLive ? "badge-success" : "badge-gray"}`, style: { fontSize: 9 }, children: isLive ? "● LANGSUNG" : "SIMULASI" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { height: 160 }, children: /* @__PURE__ */ jsx(
      Chart,
      {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              type: "bar",
              label: "Hujan",
              data: precip,
              backgroundColor: precip.map(
                (v) => v >= DANGER_MM ? "rgba(248,113,113,0.80)" : "rgba(34,211,238,0.55)"
              ),
              borderColor: precip.map((v) => v >= DANGER_MM ? "#f87171" : "#22d3ee"),
              borderWidth: 1,
              borderRadius: 2
            },
            {
              type: "line",
              label: `Had Bahaya`,
              data: Array(labels.length).fill(DANGER_MM),
              borderColor: "rgba(248,113,113,0.60)",
              borderDash: [4, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ctx.datasetIndex === 0 ? `${ctx.raw} mm/j` : `Had bahaya: ${ctx.raw} mm/j`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: textColor,
                font: { size: 9 },
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 8
              },
              grid: { color: gridColor }
            },
            y: {
              ticks: { color: textColor, font: { size: 9 } },
              grid: { color: gridColor },
              beginAtZero: true
            }
          }
        }
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 14, marginTop: 6, fontSize: 10, color: "var(--on-surface-variant)" }, children: [
      /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "rgba(34,211,238,0.55)"
            }
          }
        ),
        " ",
        "Normal"
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "rgba(248,113,113,0.80)"
            }
          }
        ),
        " ",
        "Melebihi had (",
        DANGER_MM,
        "mm/j)"
      ] })
    ] })
  ] });
}
const SHELTER_COORDS = {
  s1: [101.575, 3.21],
  // Sungai Buloh
  s2: [101.447, 3.045],
  // Klang
  s3: [102.62, 3.505],
  // Kg. Sentosa, Pahang
  s4: [101.735, 3.248],
  // Gombak, KL
  s5: [102.582, 3.465]
  // Bera, Pahang
};
const AID_COORDS = {
  a1: [102.62, 3.505],
  // Kg. Sentosa
  a2: [101.45, 3.048],
  // Kg. Baru Klang
  a3: [101.533, 3.058],
  // Taman Maju
  a4: [101.727, 3.14],
  // Kg. Pandan
  a5: [101.775, 3.085]
  // Bandar Sg. Long
};
const FLOOD_ZONES = [
  {
    id: "fz-klang-core",
    activatesAt: 0,
    color: "#ba1a1a",
    maxOpacity: 0.62,
    label: "Kawasan Kritikal – Sg. Klang",
    coords: [[
      [101.4, 3.04],
      [101.44, 3.09],
      [101.53, 3.11],
      [101.6, 3.08],
      [101.58, 3],
      [101.5, 2.97],
      [101.42, 2.99],
      [101.4, 3.04]
    ]]
  },
  {
    id: "fz-klang-high",
    activatesAt: 5,
    color: "#f97316",
    maxOpacity: 0.48,
    label: "Risiko Tinggi – Lembah Klang",
    coords: [[
      [101.35, 2.97],
      [101.4, 3.04],
      [101.53, 3.11],
      [101.68, 3.15],
      [101.7, 3.04],
      [101.6, 2.92],
      [101.44, 2.9],
      [101.35, 2.97]
    ]]
  },
  {
    id: "fz-pahang-core",
    activatesAt: 2,
    color: "#ba1a1a",
    maxOpacity: 0.58,
    label: "Kawasan Kritikal – Sg. Pahang",
    coords: [[
      [102.52, 3.4],
      [102.56, 3.5],
      [102.68, 3.52],
      [102.74, 3.44],
      [102.7, 3.35],
      [102.58, 3.31],
      [102.52, 3.4]
    ]]
  },
  {
    id: "fz-selangor-north",
    activatesAt: 9,
    color: "#eab308",
    maxOpacity: 0.38,
    label: "Risiko Sederhana – Selangor Utara",
    coords: [[
      [101.55, 3.11],
      [101.58, 3.22],
      [101.7, 3.26],
      [101.78, 3.19],
      [101.74, 3.09],
      [101.64, 3.05],
      [101.55, 3.11]
    ]]
  },
  {
    id: "fz-pahang-ext",
    activatesAt: 11,
    color: "#eab308",
    maxOpacity: 0.32,
    label: "Risiko Sederhana – Pahang Tengah",
    coords: [[
      [102.44, 3.35],
      [102.52, 3.52],
      [102.74, 3.58],
      [102.84, 3.48],
      [102.78, 3.3],
      [102.58, 3.26],
      [102.44, 3.35]
    ]]
  }
];
function calcOpacity(zone, t) {
  if (t < zone.activatesAt) return 0;
  const progress = Math.min((t - zone.activatesAt) / Math.max(1, 22 - zone.activatesAt), 1);
  return progress * zone.maxOpacity;
}
const MAP_CENTER = [101.95, 3.28];
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
function MapView({ shelters, aidRequests, mini = false, theme: _theme = "light", userLocation }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [timeStep, setTimeStep] = useState(0);
  const [showFlood, setShowFlood] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showAid, setShowAid] = useState(true);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTimeStep((t) => {
        if (t >= 23) {
          setPlaying(false);
          return 23;
        }
        return t + 1;
      });
    }, 600);
    return () => clearInterval(id);
  }, [playing]);
  useEffect(() => {
    if (!containerRef.current) return;
    let isMounted = true;
    const init = async () => {
      const mgl = await import("maplibre-gl");
      if (!isMounted || !containerRef.current) return;
      const map = new mgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: MAP_CENTER,
        zoom: mini ? 8.8 : 7.8,
        interactive: !mini,
        attributionControl: false
      });
      mapRef.current = map;
      if (!mini) {
        map.addControl(new mgl.NavigationControl({ showCompass: false }), "top-right");
      }
      map.on("load", () => {
        if (!isMounted) return;
        map.addSource("flood-zones", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: FLOOD_ZONES.map((z) => ({
              type: "Feature",
              id: z.id,
              properties: { zoneId: z.id, color: z.color },
              geometry: { type: "Polygon", coordinates: z.coords }
            }))
          }
        });
        FLOOD_ZONES.forEach((z) => {
          map.addLayer({
            id: `${z.id}-fill`,
            type: "fill",
            source: "flood-zones",
            filter: ["==", ["get", "zoneId"], z.id],
            paint: { "fill-color": z.color, "fill-opacity": 0 }
          });
          map.addLayer({
            id: `${z.id}-border`,
            type: "line",
            source: "flood-zones",
            filter: ["==", ["get", "zoneId"], z.id],
            paint: {
              "line-color": z.color,
              "line-width": 1.5,
              "line-opacity": 0,
              "line-dasharray": [3, 2]
            }
          });
        });
        const shelterFeatures = shelters.filter((s) => SHELTER_COORDS[s.id]).map((s) => {
          const pct = Math.round(s.occupied / s.capacity * 100);
          return {
            type: "Feature",
            properties: {
              id: s.id,
              name: s.name,
              capacity: s.capacity,
              occupied: s.occupied,
              pct,
              roadStatus: s.roadStatus,
              contact: s.contact,
              pinColor: pct >= 100 ? "#ba1a1a" : pct >= 75 ? "#b45309" : "#006e2d"
            },
            geometry: { type: "Point", coordinates: SHELTER_COORDS[s.id] }
          };
        });
        map.addSource("shelters", {
          type: "geojson",
          data: { type: "FeatureCollection", features: shelterFeatures },
          cluster: true,
          clusterMaxZoom: 10,
          clusterRadius: 50
        });
        map.addLayer({
          id: "shelter-cluster",
          type: "circle",
          source: "shelters",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#00236f",
            "circle-radius": 20,
            "circle-opacity": 0.9,
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2
          }
        });
        map.addLayer({
          id: "shelter-cluster-count",
          type: "symbol",
          source: "shelters",
          filter: ["has", "point_count"],
          layout: { "text-field": "{point_count_abbreviated}", "text-size": 13 },
          paint: { "text-color": "#fff" }
        });
        map.addLayer({
          id: "shelter-point",
          type: "circle",
          source: "shelters",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 13,
            "circle-color": ["get", "pinColor"],
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
            "circle-opacity": 0.92
          }
        });
        map.addLayer({
          id: "shelter-pct",
          type: "symbol",
          source: "shelters",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["concat", ["to-string", ["get", "pct"]], "%"],
            "text-size": 9,
            "text-offset": [0, 1.9],
            "text-anchor": "top"
          },
          paint: { "text-color": "#191c1e", "text-halo-color": "#fff", "text-halo-width": 1.5 }
        });
        map.on("click", "shelter-point", (e) => {
          const p = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates.slice();
          const statusColor = p.roadStatus === "safe" ? "#006e2d" : p.roadStatus === "caution" ? "#b45309" : "#ba1a1a";
          const statusIcon = p.roadStatus === "safe" ? "✅" : p.roadStatus === "caution" ? "⚠️" : "🚫";
          const statusLabel = p.roadStatus === "safe" ? "Selamat" : p.roadStatus === "caution" ? "Berhati-hati" : "Ditutup";
          new mgl.Popup({ maxWidth: "260px", offset: 16 }).setLngLat(coords).setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px 2px">
                <div style="font-weight:700;font-size:14px;color:#00236f;margin-bottom:6px">${p.name}</div>
                <div style="font-size:13px;margin-bottom:4px">
                  👥 ${p.occupied}/${p.capacity}
                  <strong style="color:${p.pct >= 100 ? "#ba1a1a" : p.pct >= 75 ? "#b45309" : "#006e2d"}"> (${p.pct}%)</strong>
                </div>
                <div style="font-size:13px;color:${statusColor};margin-bottom:4px">${statusIcon} ${statusLabel}</div>
                <div style="font-size:12px;color:#757682">📞 ${p.contact}</div>
              </div>
            `).addTo(map);
        });
        map.on("mouseenter", "shelter-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "shelter-point", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", "shelter-cluster", (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["shelter-cluster"] });
          const clusterId = features[0].properties.cluster_id;
          map.getSource("shelters").getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: features[0].geometry.coordinates, zoom });
          });
        });
        map.on("mouseenter", "shelter-cluster", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "shelter-cluster", () => {
          map.getCanvas().style.cursor = "";
        });
        const aidFeatures = aidRequests.filter((r) => AID_COORDS[r.id]).map((r) => ({
          type: "Feature",
          properties: {
            id: r.id,
            kampung: r.kampung,
            displaced: r.displaced,
            status: r.status,
            priority: r.priority,
            pinColor: r.priority === "high" ? "#ba1a1a" : r.priority === "medium" ? "#b45309" : "#006e2d"
          },
          geometry: { type: "Point", coordinates: AID_COORDS[r.id] }
        }));
        map.addSource("aid", {
          type: "geojson",
          data: { type: "FeatureCollection", features: aidFeatures }
        });
        map.addLayer({
          id: "aid-point",
          type: "circle",
          source: "aid",
          paint: {
            "circle-radius": 10,
            "circle-color": ["get", "pinColor"],
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1.5,
            "circle-opacity": 0.85
          }
        });
        map.addLayer({
          id: "aid-symbol",
          type: "symbol",
          source: "aid",
          layout: { "text-field": "📦", "text-size": 12, "text-offset": [0, 0.1], "text-anchor": "center" }
        });
        map.on("click", "aid-point", (e) => {
          const p = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates.slice();
          const statusMap = { pending: "Menunggu", assigned: "Ditugaskan", delivered: "Dihantar" };
          const priMap = { high: "🔴 Tinggi", medium: "🟡 Sederhana", low: "🟢 Rendah" };
          new mgl.Popup({ maxWidth: "240px", offset: 14 }).setLngLat(coords).setHTML(`
              <div style="font-family:Inter,sans-serif;padding:4px 2px">
                <div style="font-weight:700;font-size:14px;margin-bottom:6px">📍 ${p.kampung}</div>
                <div style="font-size:13px;margin-bottom:3px">👥 ${p.displaced} orang terlantar</div>
                <div style="font-size:12px;margin-bottom:2px">Status: <strong>${statusMap[p.status]}</strong></div>
                <div style="font-size:12px">Keutamaan: <strong>${priMap[p.priority]}</strong></div>
              </div>
            `).addTo(map);
        });
        map.on("mouseenter", "aid-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "aid-point", () => {
          map.getCanvas().style.cursor = "";
        });
        map.addSource("user-location", {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "Point", coordinates: [0, 0] }, properties: {} }
        });
        map.addLayer({
          id: "user-loc-halo",
          type: "circle",
          source: "user-location",
          paint: { "circle-radius": 20, "circle-color": "#22d3ee", "circle-opacity": 0 }
        });
        map.addLayer({
          id: "user-loc-dot",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 9,
            "circle-color": "#22d3ee",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2.5,
            "circle-opacity": 0
          }
        });
        setLoaded(true);
      });
    };
    init().catch(console.error);
    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    FLOOD_ZONES.forEach((z) => {
      const opacity = showFlood ? calcOpacity(z, timeStep) : 0;
      if (map.getLayer(`${z.id}-fill`)) {
        map.setPaintProperty(`${z.id}-fill`, "fill-opacity", opacity);
        map.setPaintProperty(`${z.id}-border`, "line-opacity", opacity > 0 ? Math.min(opacity * 1.4, 0.8) : 0);
      }
    });
  }, [timeStep, showFlood, loaded]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const vis = showShelters ? "visible" : "none";
    ["shelter-cluster", "shelter-cluster-count", "shelter-point", "shelter-pct"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
  }, [showShelters, loaded]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const vis = showAid ? "visible" : "none";
    ["aid-point", "aid-symbol"].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
  }, [showAid, loaded]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    if (!userLocation) return;
    map.getSource("user-location")?.setData({
      type: "Feature",
      geometry: { type: "Point", coordinates: userLocation },
      properties: {}
    });
    if (map.getLayer("user-loc-halo")) {
      map.setPaintProperty("user-loc-halo", "circle-opacity", 0.22);
      map.setPaintProperty("user-loc-dot", "circle-opacity", 0.95);
    }
    map.easeTo({ center: userLocation, zoom: mini ? 11 : 10.5, duration: 900 });
  }, [userLocation, loaded, mini]);
  const hourLabel = (h) => {
    const suffix = h < 12 ? "PG" : h < 18 ? "PTG" : "MLM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:00${suffix} (+${h}j)`;
  };
  if (mini) {
    return /* @__PURE__ */ jsx("div", { ref: containerRef, style: { height: 190, width: "100%" } });
  }
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx("div", { ref: containerRef, style: { height: "min(calc(100dvh - 310px), 480px)", minHeight: 300, width: "100%" } }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          padding: "10px 16px 8px",
          background: "var(--surface)",
          borderTop: "1px solid var(--outline-variant)"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: 11, fontWeight: 700, color: "var(--on-surface-variant)", letterSpacing: "0.06em" }, children: "ANIMASI PERKEMBANGAN BANJIR" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--primary)" }, children: hourLabel(timeStep) })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setPlaying(false);
                  setTimeStep(0);
                },
                style: { background: "var(--surface-container)", border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer", color: "var(--on-surface)", fontSize: 13 },
                title: "Reset",
                children: "⏮"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setPlaying((p) => !p),
                style: { background: playing ? "var(--primary)" : "var(--surface-container)", border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer", color: playing ? "#fff" : "var(--on-surface)", fontSize: 13 },
                title: playing ? "Jeda" : "Main",
                children: playing ? "⏸" : "▶"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: 0,
                max: 23,
                value: timeStep,
                onChange: (e) => {
                  setPlaying(false);
                  setTimeStep(Number(e.target.value));
                },
                style: { flex: 1, accentColor: "var(--primary)", cursor: "pointer" }
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setTimeStep((t) => Math.min(23, t + 1)),
                style: { background: "var(--surface-container)", border: "none", borderRadius: 4, width: 28, height: 28, cursor: "pointer", color: "var(--on-surface)", fontSize: 13 },
                children: "⏭"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 2, padding: "0 36px 0 68px", fontSize: 9, color: "var(--outline)" }, children: [0, 6, 12, 18, 23].map((h) => /* @__PURE__ */ jsxs("span", { children: [
            h,
            "j"
          ] }, h)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          padding: "8px 16px 10px",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          borderTop: "1px solid var(--outline-variant)"
        },
        children: [
          [
            { label: "🌊 Banjir", active: showFlood, toggle: () => setShowFlood((v) => !v) },
            { label: "🏠 Pemindahan", active: showShelters, toggle: () => setShowShelters((v) => !v) },
            { label: "📦 Bantuan", active: showAid, toggle: () => setShowAid((v) => !v) }
          ].map((btn) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: btn.toggle,
              style: {
                padding: "5px 12px",
                borderRadius: 20,
                border: "1.5px solid var(--primary)",
                background: btn.active ? "var(--primary)" : "transparent",
                color: btn.active ? "var(--on-primary)" : "var(--primary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              },
              children: btn.label
            },
            btn.label
          )),
          /* @__PURE__ */ jsx("div", { style: { marginLeft: "auto", display: "flex", gap: 10, fontSize: 10, color: "var(--on-surface-variant)", alignItems: "center" }, children: [
            { color: "#ba1a1a", label: "Kritikal" },
            { color: "#f97316", label: "Tinggi" },
            { color: "#eab308", label: "Sederhana" }
          ].map((l) => /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsx("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: l.color, opacity: 0.75 } }),
            l.label
          ] }, l.label)) })
        ]
      }
    )
  ] });
}
const initialShelters = [{
  id: "s1",
  name: "Dewan Komuniti Sg. Buloh",
  location: "Sungai Buloh, Selangor",
  capacity: 200,
  occupied: 147,
  facilities: ["Air bersih", "Tandas", "Dapur", "WiFi"],
  roadStatus: "safe",
  contact: "03-6140 7890",
  lat: 3.21,
  lng: 101.575
}, {
  id: "s2",
  name: "Sekolah Kebangsaan Klang",
  location: "Klang, Selangor",
  capacity: 300,
  occupied: 289,
  facilities: ["Air bersih", "Tandas", "Katil"],
  roadStatus: "caution",
  contact: "03-3372 1234",
  lat: 3.045,
  lng: 101.447
}, {
  id: "s3",
  name: "Balai Raya Kg. Sentosa",
  location: "Kg. Sentosa, Pahang",
  capacity: 120,
  occupied: 34,
  facilities: ["Air bersih", "Tandas", "Surau"],
  roadStatus: "safe",
  contact: "09-5561 8800",
  lat: 3.505,
  lng: 102.62
}, {
  id: "s4",
  name: "Pusat Peranginan Gombak",
  location: "Gombak, KL",
  capacity: 150,
  occupied: 150,
  facilities: ["Air bersih", "Tandas", "Dapur", "Katil", "WiFi"],
  roadStatus: "closed",
  contact: "03-6189 2000",
  lat: 3.248,
  lng: 101.735
}, {
  id: "s5",
  name: "Sekolah Menengah Bera",
  location: "Bera, Pahang",
  capacity: 250,
  occupied: 78,
  facilities: ["Air bersih", "Tandas", "Dapur"],
  roadStatus: "safe",
  contact: "09-2553 4567",
  lat: 3.465,
  lng: 102.582
}];
const initialAidRequests = [{
  id: "a1",
  kampung: "Kg. Sentosa",
  displaced: 50,
  items: ["Air mineral", "Lampin bayi", "Ubat-ubatan", "Makanan kering"],
  status: "assigned",
  assignedNgo: "Mercy Malaysia",
  timestamp: "2m lepas",
  priority: "high"
}, {
  id: "a2",
  kampung: "Kg. Baru Klang",
  displaced: 23,
  items: ["Selimut", "Makanan kering", "Air mineral"],
  status: "pending",
  timestamp: "15m lepas",
  priority: "high"
}, {
  id: "a3",
  kampung: "Taman Maju",
  displaced: 87,
  items: ["Makanan masak", "Ubat-ubatan", "Pakaian dewasa"],
  status: "assigned",
  assignedNgo: "Yayasan Budi",
  timestamp: "32m lepas",
  priority: "medium"
}, {
  id: "a4",
  kampung: "Kg. Pandan",
  displaced: 12,
  items: ["Air mineral", "Susu formula"],
  status: "delivered",
  assignedNgo: "Aman Malaysia",
  timestamp: "1j lepas",
  priority: "low"
}, {
  id: "a5",
  kampung: "Bandar Sg. Long",
  displaced: 34,
  items: ["Peralatan kebersihan", "Makanan kering", "Selimut"],
  status: "pending",
  timestamp: "2j lepas",
  priority: "medium"
}];
const initialVolunteers = [{
  id: "v1",
  name: "Ahmad Faizal",
  skill: "Perubatan",
  assignedTo: "Titik Agihan A – Sg. Buloh",
  status: "assigned"
}, {
  id: "v2",
  name: "Siti Hajar",
  skill: "Logistik",
  assignedTo: "Titik Agihan B – Klang",
  status: "active"
}, {
  id: "v3",
  name: "Rajan Kumar",
  skill: "Pemandu",
  assignedTo: "Titik Agihan A – Sg. Buloh",
  status: "assigned"
}, {
  id: "v4",
  name: "Nur Aina",
  skill: "Pengurus Data",
  assignedTo: "Titik Agihan C – Gombak",
  status: "assigned"
}, {
  id: "v5",
  name: "Ismail Bakar",
  skill: "Pemandu Bot",
  assignedTo: "Titik Agihan D – Bera",
  status: "active"
}, {
  id: "v6",
  name: "Priya Nair",
  skill: "Kaunseling",
  assignedTo: "Titik Agihan B – Klang",
  status: "assigned"
}, {
  id: "v7",
  name: "Zulaikha Mohd",
  skill: "Logistik",
  assignedTo: "Titik Agihan C – Gombak",
  status: "assigned"
}, {
  id: "v8",
  name: "Lee Wen Xin",
  skill: "Masakan",
  assignedTo: "Titik Agihan A – Sg. Buloh",
  status: "active"
}, {
  id: "v9",
  name: "Hafizuddin",
  skill: "Pemandu",
  assignedTo: "Titik Agihan D – Bera",
  status: "assigned"
}, {
  id: "v10",
  name: "Maryam Idris",
  skill: "Perubatan",
  assignedTo: "Titik Agihan E – Sentosa",
  status: "assigned"
}];
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function formatGovDate(dateStr) {
  if (!dateStr) return "Terkini";
  try {
    return new Date(dateStr).toLocaleString("ms-MY", {
      dateStyle: "short",
      timeStyle: "short"
    });
  } catch {
    return dateStr;
  }
}
const distributionPoints = ["Titik Agihan A – Dewan Sg. Buloh", "Titik Agihan B – SK Klang", "Titik Agihan C – Balai Raya Gombak", "Titik Agihan D – Balai Raya Bera", "Titik Agihan E – Kg. Sentosa"];
const initialAlerts = [{
  id: "al1",
  type: "verified",
  title: "Paras Air Sungai Klang Meningkat",
  content: "Jabatan Pengairan dan Saliran mengesahkan paras air telah mencapai tahap waspada di Km 14. Kawasan rendah di Klang diminta berwaspada.",
  source: "JPS Malaysia",
  timestamp: "5m lepas",
  shared: 234
}, {
  id: "al2",
  type: "misinformation",
  title: 'SALAH: "Empangan Temenggor Akan Dibuka"',
  content: "Dakwaan empangan akan dibuka dalam masa 2 jam adalah PALSU. TNB mengesahkan tiada operasi pelepasan air dalam masa terdekat.",
  source: "Semak Kenyataan: TNB Bhd",
  timestamp: "23m lepas",
  shared: 89
}, {
  id: "al3",
  type: "warning",
  title: "Jalan FT050 Ditutup – Banjir",
  content: "JPJ mengesahkan jalan persekutuan FT050 dari Bandar Baru Klang ke Meru ditutup akibat banjir. Guna laluan alternatif via Persiaran Raja Muda Musa.",
  source: "JPJ Selangor",
  timestamp: "41m lepas",
  shared: 567
}, {
  id: "al4",
  type: "verified",
  title: "Bekalan Elektrik Dipulihkan – Subang",
  content: "TNB mengesahkan bekalan elektrik di kawasan Subang Jaya telah dipulihkan sepenuhnya. Penduduk diminta periksa keselamatan wiring terlebih dahulu.",
  source: "TNB Bhd",
  timestamp: "1j 15m lepas",
  shared: 142
}, {
  id: "al5",
  type: "warning",
  title: "Amaran Cuaca Buruk – Selangor & Pahang",
  content: "MetMalaysia mengeluarkan amaran hujan lebat berterusan untuk Selangor, Pahang dan Terengganu sehingga 72 jam akan datang. Sediakan kit kecemasan.",
  source: "MetMalaysia",
  timestamp: "2j lepas",
  shared: 1203
}];
const T = {
  ms: {
    appName: "MY Bantu",
    appSubtitle: "Pusat Ketahanan Banjir Komuniti",
    dashboard: "Papan Pemuka",
    shelters: "Pusat Pemindahan",
    aid: "Bantuan",
    volunteers: "Sukarelawan",
    alerts: "Amaran",
    settings: "Tetapan",
    offlineMode: "MOD LUAR TALIAN",
    lastSync: "Kemas kini terakhir",
    displaced: "Mangsa Banjir",
    residents: "orang terlantar",
    activeShelters: "Pusat Aktif",
    volunteerActive: "Sukarelawan",
    aidRequests: "Permohonan Bantuan",
    reportDisplaced: "Laporkan Mangsa",
    requestAid: "Minta Bantuan",
    coordinateVol: "Koordinasi Sukarelawan",
    shareShelter: "Kongsi Maklumat Tempat Perlindungan",
    newRequest: "+ Permohonan Baharu",
    sosEmergency: "SOS KECEMASAN",
    searchLocation: "Cari lokasi...",
    capacity: "Kapasiti",
    occupied: "Penghuni",
    roadStatus: "Status Jalan",
    safe: "SELAMAT",
    caution: "BERHATI-HATI",
    closed: "DITUTUP",
    full: "PENUH",
    facilities: "Kemudahan",
    getDirections: "Dapatkan Arah",
    shareInfo: "Kongsi",
    step: "Langkah",
    of: "daripada",
    next: "Seterusnya →",
    back: "← Kembali",
    submit: "Hantar Permohonan",
    kampungName: "Nama Kampung / Kawasan",
    kampungPlaceholder: "Masukkan nama kampung",
    displacedCount: "Bilangan Orang Terlantar",
    displacedPlaceholder: "Masukkan bilangan",
    aidItems: "Barangan Bantuan Diperlukan",
    additionalNotes: "Nota Tambahan",
    notesPlaceholder: "Maklumat tambahan (keadaan kecemasan, keperluan khas, dll.)",
    submitting: "Menghantar...",
    submitted: "Permohonan Dihantar!",
    submittedDesc: "Permohonan anda telah direkodkan dan akan diproses segera.",
    viewBoard: "Lihat Papan Permohonan",
    yourTask: "TUGAS ANDA",
    taskClaimed: "Dituntut",
    slideCheckIn: "LERET UNTUK DAFTAR MASUK",
    distributionCoord: "KOORDINASI AGIHAN",
    volunteers10: "Sukarelawan (10/10)",
    highPriority: "KEUTAMAAN TINGGI",
    urgentTasks: "TUGAS MENDESAK",
    claimTask: "Tuntut Tugas",
    taskMap: "Peta Tugas",
    findNearest: "Cari tugas berhampiran lokasi anda semasa",
    language: "BAHASA",
    connectivity: "SAMBUNGAN",
    lowDataMode: "Mod Data Rendah",
    autoSync: "Penyegerakan Automatik",
    displayMode: "MOD PAPARAN",
    darkMode: "Mod Gelap",
    lightMode: "Mod Cerah",
    appVersion: "Versi Aplikasi",
    clearCache: "Kosongkan Cache",
    localCopy: "Salinan Tempatan Sahaja",
    pending: "Menunggu",
    assigned: "Ditugaskan",
    delivered: "Dihantar",
    details: "Butiran",
    viewMap: "Lihat Peta Langsung",
    activeRequests: "Permohonan Aktif Berdekatan",
    share: "Kongsi",
    verify: "Sahkan",
    verified: "DISAHKAN",
    warning: "AMARAN",
    misinformation: "MAKLUMAT PALSU",
    contact: "Hubungi",
    slots: "Slot",
    available: "Tersedia",
    assign: "Tugaskan",
    quickActions: "TINDAKAN PANTAS",
    recentActivity: "AKTIVITI TERKINI",
    floodStatus: "Status Banjir Semasa",
    alertLevel: "Tahap Amaran",
    danger: "BAHAYA",
    viewAllShelters: "Lihat Semua Pusat Pemindahan",
    map: "Peta",
    mapSubtitle: "Selangor & Pahang · Data masa nyata"
  },
  en: {
    appName: "MY Bantu",
    appSubtitle: "Community Flood Resilience Hub",
    dashboard: "Dashboard",
    shelters: "Shelters",
    aid: "Aid",
    volunteers: "Volunteers",
    alerts: "Alerts",
    settings: "Settings",
    offlineMode: "OFFLINE MODE",
    lastSync: "Last synced",
    displaced: "Flood Displaced",
    residents: "residents displaced",
    activeShelters: "Active Shelters",
    volunteerActive: "Volunteers",
    aidRequests: "Aid Requests",
    reportDisplaced: "Report Displaced",
    requestAid: "Request Aid",
    coordinateVol: "Coordinate Volunteers",
    shareShelter: "Share Shelter Info",
    newRequest: "+ New Request",
    sosEmergency: "SOS EMERGENCY",
    searchLocation: "Search location...",
    capacity: "Capacity",
    occupied: "Occupied",
    roadStatus: "Road Status",
    safe: "SAFE",
    caution: "CAUTION",
    closed: "CLOSED",
    full: "FULL",
    facilities: "Facilities",
    getDirections: "Get Directions",
    shareInfo: "Share",
    step: "Step",
    of: "of",
    next: "Next →",
    back: "← Back",
    submit: "Submit Request",
    kampungName: "Village / Area Name",
    kampungPlaceholder: "Enter village name",
    displacedCount: "Number of Displaced Residents",
    displacedPlaceholder: "Enter number",
    aidItems: "Aid Items Needed",
    additionalNotes: "Additional Notes",
    notesPlaceholder: "Additional info (emergency conditions, special needs, etc.)",
    submitting: "Submitting...",
    submitted: "Request Submitted!",
    submittedDesc: "Your request has been recorded and will be processed immediately.",
    viewBoard: "View Request Board",
    yourTask: "YOUR TASK",
    taskClaimed: "Claimed",
    slideCheckIn: "SLIDE TO CHECK IN",
    distributionCoord: "DISTRIBUTION COORDINATION",
    volunteers10: "Volunteers (10/10)",
    highPriority: "HIGH PRIORITY",
    urgentTasks: "URGENT TASKS",
    claimTask: "Claim Task",
    taskMap: "Task Map",
    findNearest: "Find tasks near your current location",
    language: "LANGUAGE",
    connectivity: "CONNECTIVITY",
    lowDataMode: "Low Data Mode",
    autoSync: "Auto Synchronization",
    displayMode: "DISPLAY MODE",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    appVersion: "App Version",
    clearCache: "Clear Cache",
    localCopy: "Local Copy Only",
    pending: "Pending",
    assigned: "Assigned",
    delivered: "Delivered",
    details: "Details",
    viewMap: "View Live Map",
    activeRequests: "Active Requests Nearby",
    share: "Share",
    verify: "Verify",
    verified: "VERIFIED",
    warning: "WARNING",
    misinformation: "MISINFORMATION",
    contact: "Contact",
    slots: "Slots",
    available: "Available",
    assign: "Assign",
    quickActions: "QUICK ACTIONS",
    recentActivity: "RECENT ACTIVITY",
    floodStatus: "Current Flood Status",
    alertLevel: "Alert Level",
    danger: "DANGER",
    viewAllShelters: "View All Shelters",
    map: "Map",
    mapSubtitle: "Selangor & Pahang · Live data"
  }
};
function Icon({
  name,
  size = 24,
  className = "",
  style
}) {
  const paths = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    shelter: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    aid: "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
    package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
    volunteer: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    wifi_off: "M1 1l22 22 M16.72 11.06A10.94 10.94 0 0119 12.55 M5 12.55a10.94 10.94 0 015.17-2.39 M10.71 5.05A16 16 0 0122.56 9 M1.42 9a15.91 15.91 0 014.7-2.88 M8.53 16.11a6 6 0 016.95 0 M12 20h.01",
    wifi: "M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    check_circle: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
    x_circle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
    map_pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4z",
    plus: "M12 5v14 M5 12h14",
    arrow_right: "M5 12h14 M12 5l7 7-7 7",
    arrow_left: "M19 12H5 M12 19l-7-7 7-7",
    share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8 M16 6l-4-4-4 4 M12 2v13",
    phone: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.06a16 16 0 006.03 6.03l1.42-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    navigation: "M3 11l19-9-9 19-2-8-8-2z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    check: "M20 6L9 17l-5-5",
    cloud_off: "M22.61 16.95A5 5 0 0018 10h-1.26A8 8 0 101 16.29 M1 1l22 22",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z",
    moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    menu: "M3 12h18 M3 6h18 M3 18h18",
    info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01",
    truck: "M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    task: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    map: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16"
  };
  return /* @__PURE__ */ jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style, children: /* @__PURE__ */ jsx("path", { d: paths[name] || paths["info"] }) });
}
function AppTopBar({
  isOffline,
  t,
  theme,
  setTheme,
  setScreen,
  screen
}) {
  return /* @__PURE__ */ jsxs("div", { className: "app-top-bar", children: [
    /* @__PURE__ */ jsxs("div", { className: "app-top-bar-logo", children: [
      /* @__PURE__ */ jsx("span", { style: {
        fontSize: 20
      }, children: "🌊" }),
      /* @__PURE__ */ jsx("span", { children: t.appName }),
      isOffline && /* @__PURE__ */ jsx("span", { className: "offline-chip", children: t.offlineMode })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "app-top-bar-actions", children: [
      /* @__PURE__ */ jsx("button", { className: "top-bar-icon-btn", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), "aria-label": "Toggle theme", children: /* @__PURE__ */ jsx(Icon, { name: theme === "dark" ? "sun" : "moon", size: 18 }) }),
      /* @__PURE__ */ jsx("button", { className: `top-bar-icon-btn${screen === "settings" ? " active" : ""}`, onClick: () => setScreen("settings"), "aria-label": "Settings", children: /* @__PURE__ */ jsx(Icon, { name: "settings", size: 18 }) })
    ] })
  ] });
}
function AppTopTabs({
  screen,
  setScreen,
  t,
  alertCount
}) {
  const tabs = [{
    id: "dashboard",
    label: t.dashboard
  }, {
    id: "shelters",
    label: t.shelters
  }, {
    id: "aid",
    label: t.aid
  }, {
    id: "volunteers",
    label: t.volunteers
  }, {
    id: "alerts",
    label: t.alerts,
    notif: alertCount > 0
  }, {
    id: "map",
    label: t.map
  }];
  return /* @__PURE__ */ jsx("div", { className: "top-tabs", children: tabs.map((tab) => /* @__PURE__ */ jsxs("button", { className: `top-tab${screen === tab.id ? " active" : ""}`, onClick: () => setScreen(tab.id), children: [
    tab.label,
    tab.notif && /* @__PURE__ */ jsx("span", { className: "tab-notif-dot" })
  ] }, tab.id)) });
}
function SideNav({
  screen,
  setScreen,
  t,
  theme,
  setTheme,
  alertCount
}) {
  const navItems = [{
    id: "dashboard",
    label: t.dashboard,
    icon: "home"
  }, {
    id: "shelters",
    label: t.shelters,
    icon: "shelter"
  }, {
    id: "aid",
    label: t.aid,
    icon: "package"
  }, {
    id: "volunteers",
    label: t.volunteers,
    icon: "volunteer"
  }, {
    id: "alerts",
    label: t.alerts,
    icon: "bell",
    notif: alertCount > 0
  }, {
    id: "map",
    label: t.map,
    icon: "map"
  }];
  return /* @__PURE__ */ jsxs("nav", { className: "side-nav", "aria-label": "Main navigation", children: [
    /* @__PURE__ */ jsxs("div", { className: "side-nav-brand", children: [
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 17,
        fontWeight: 700,
        color: "var(--primary)",
        display: "flex",
        alignItems: "center",
        gap: 8
      }, children: [
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: 20
        }, children: "🌊" }),
        " ",
        t.appName
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        color: "var(--on-surface-variant)",
        marginTop: 3
      }, children: t.appSubtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "side-nav-section", children: navItems.map((item) => /* @__PURE__ */ jsxs("button", { className: `side-nav-item ${screen === item.id ? "active" : ""}`, onClick: () => setScreen(item.id), children: [
      /* @__PURE__ */ jsx(Icon, { name: item.icon, size: 18 }),
      item.label,
      item.notif && /* @__PURE__ */ jsx("span", { style: {
        marginLeft: "auto",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#ba1a1a",
        flexShrink: 0
      } })
    ] }, item.id)) }),
    /* @__PURE__ */ jsxs("div", { className: "side-nav-footer", children: [
      /* @__PURE__ */ jsxs("button", { className: `side-nav-item ${screen === "settings" ? "active" : ""}`, onClick: () => setScreen("settings"), children: [
        /* @__PURE__ */ jsx(Icon, { name: "settings", size: 18 }),
        t.settings
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "side-nav-item", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), children: [
        /* @__PURE__ */ jsx(Icon, { name: theme === "dark" ? "sun" : "moon", size: 18 }),
        theme === "dark" ? t.lightMode : t.darkMode
      ] })
    ] })
  ] });
}
function DashboardScreen({
  t,
  shelters,
  aidRequests,
  volunteers,
  setScreen,
  totalDisplaced,
  theme
}) {
  const activeShelters = shelters.filter((s) => s.occupied < s.capacity).length;
  const activeVols = volunteers.filter((v) => v.status !== "available").length;
  const pendingAid = aidRequests.filter((r) => r.status === "pending").length;
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      background: "linear-gradient(135deg, #00236f 0%, #1e3a8a 100%)",
      padding: "20px 16px",
      color: "white"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16
      }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 12,
            fontWeight: 600,
            opacity: 0.8,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4
          }, children: t.floodStatus }),
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.1
          }, children: [
            "Monsoon Timur",
            /* @__PURE__ */ jsx("br", {}),
            "2024/25"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          textAlign: "right"
        }, children: [
          /* @__PURE__ */ jsx("div", { className: "badge badge-danger", style: {
            fontSize: 12,
            padding: "5px 12px",
            marginBottom: 6
          }, children: t.danger }),
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 11,
            opacity: 0.7
          }, children: "Tahap Amaran 3" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginTop: 8
      }, children: [{
        label: t.displaced,
        value: totalDisplaced.toLocaleString(),
        sub: t.residents,
        color: "#fca5a5"
      }, {
        label: t.activeShelters,
        value: `${activeShelters}/${shelters.length}`,
        sub: "pusat aktif",
        color: "#86efac"
      }, {
        label: t.volunteerActive,
        value: `${activeVols}/${volunteers.length}`,
        sub: "sedang bertugas",
        color: "#93c5fd"
      }, {
        label: t.aidRequests,
        value: `${pendingAid}`,
        sub: "menunggu tindak balas",
        color: "#fcd34d"
      }].map((stat) => /* @__PURE__ */ jsxs("div", { style: {
        background: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "12px 14px"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 11,
          opacity: 0.75,
          marginBottom: 2
        }, children: stat.label }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 24,
          fontWeight: 700,
          color: stat.color
        }, children: stat.value }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 11,
          opacity: 0.65
        }, children: stat.sub })
      ] }, stat.label)) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "14px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: /* @__PURE__ */ jsx(RainfallChart, { theme }) }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "14px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: /* @__PURE__ */ jsxs("button", { className: "btn btn-danger sos-pulse", style: {
      gap: 10,
      fontSize: 16,
      letterSpacing: "0.05em"
    }, onClick: () => alert("SOS Kecemasan dihantar! Pihak berkuasa akan dihubungi."), children: [
      /* @__PURE__ */ jsx(Icon, { name: "alert", size: 20 }),
      t.sosEmergency
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "16px 16px 8px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--on-surface-variant)",
        letterSpacing: "0.08em",
        marginBottom: 12
      }, children: t.quickActions }),
      /* @__PURE__ */ jsx("div", { style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }, children: [{
        label: t.reportDisplaced,
        icon: "users",
        color: "#dce1ff",
        iconColor: "#00236f",
        action: "aid"
      }, {
        label: t.requestAid,
        icon: "package",
        color: "#dcfce7",
        iconColor: "#006e2d",
        action: "aid"
      }, {
        label: t.coordinateVol,
        icon: "volunteer",
        color: "#fef3c7",
        iconColor: "#b45309",
        action: "volunteers"
      }, {
        label: t.shareShelter,
        icon: "shelter",
        color: "#fce7f3",
        iconColor: "#9d174d",
        action: "shelters"
      }].map((qa) => /* @__PURE__ */ jsxs("button", { onClick: () => setScreen(qa.action), style: {
        background: qa.color,
        border: "none",
        borderRadius: 10,
        padding: "14px 12px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "transform 0.1s"
      }, onMouseDown: (e) => e.currentTarget.style.transform = "scale(0.97)", onMouseUp: (e) => e.currentTarget.style.transform = "scale(1)", children: [
        /* @__PURE__ */ jsx(Icon, { name: qa.icon, size: 22, className: "", style: {
          color: qa.iconColor
        } }),
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: 13,
          fontWeight: 600,
          color: "#191c1e",
          lineHeight: 1.3
        }, children: qa.label })
      ] }, qa.label)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divider", style: {
      marginTop: 8
    } }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "16px 16px 8px"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 11,
          fontWeight: 700,
          color: "var(--on-surface-variant)",
          letterSpacing: "0.08em"
        }, children: t.viewAllShelters.toUpperCase() }),
        /* @__PURE__ */ jsx("button", { onClick: () => setScreen("shelters"), style: {
          fontSize: 13,
          color: "var(--primary)",
          fontWeight: 600,
          background: "none",
          border: "none",
          cursor: "pointer"
        }, children: "Lihat Semua →" })
      ] }),
      shelters.slice(0, 2).map((s) => {
        const pct = Math.round(s.occupied / s.capacity * 100);
        const isFull = pct >= 100;
        return /* @__PURE__ */ jsx("div", { className: "card", style: {
          marginBottom: 10,
          borderTop: `4px solid ${isFull ? "#ba1a1a" : pct > 75 ? "#b45309" : "#006e2d"}`
        }, children: /* @__PURE__ */ jsxs("div", { style: {
          padding: "12px 14px"
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 6
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontSize: 15,
              fontWeight: 700,
              color: "var(--on-surface)",
              flex: 1,
              paddingRight: 8
            }, children: s.name }),
            /* @__PURE__ */ jsx("span", { className: `badge ${isFull ? "badge-danger" : pct > 75 ? "badge-warning" : "badge-success"}`, children: isFull ? t.full : `${pct}%` })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "var(--on-surface-variant)",
            fontSize: 13,
            marginBottom: 10
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 13 }),
            s.location
          ] }),
          /* @__PURE__ */ jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsx("div", { className: "progress-fill", style: {
            width: `${Math.min(pct, 100)}%`,
            background: isFull ? "#ba1a1a" : pct > 75 ? "#b45309" : "#006e2d"
          } }) }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--on-surface-variant)",
            marginTop: 6
          }, children: [
            /* @__PURE__ */ jsxs("span", { children: [
              s.occupied,
              " / ",
              s.capacity,
              " ",
              t.occupied
            ] }),
            /* @__PURE__ */ jsxs("span", { style: {
              color: s.roadStatus === "safe" ? "#006e2d" : s.roadStatus === "caution" ? "#b45309" : "#ba1a1a",
              fontWeight: 600
            }, children: [
              "🛣 ",
              s.roadStatus === "safe" ? t.safe : s.roadStatus === "caution" ? t.caution : t.closed
            ] })
          ] })
        ] }) }, s.id);
      })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divider" }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "16px 16px 8px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--on-surface-variant)",
        letterSpacing: "0.08em",
        marginBottom: 12
      }, children: t.recentActivity }),
      aidRequests.slice(0, 3).map((r) => /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--outline-variant)"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 40,
          height: 40,
          borderRadius: 10,
          background: r.status === "delivered" ? "#dcfce7" : r.status === "assigned" ? "#dce1ff" : "#fef3c7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }, children: /* @__PURE__ */ jsx(Icon, { name: r.status === "delivered" ? "check_circle" : r.status === "assigned" ? "truck" : "package", size: 18, style: {
          color: r.status === "delivered" ? "#006e2d" : r.status === "assigned" ? "#00236f" : "#b45309"
        } }) }),
        /* @__PURE__ */ jsxs("div", { style: {
          flex: 1
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 14,
            fontWeight: 600
          }, children: [
            r.kampung,
            " – ",
            r.displaced,
            " orang"
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 12,
            color: "var(--on-surface-variant)"
          }, children: [
            r.timestamp,
            " · ",
            r.assignedNgo || "Menunggu NGO"
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: `badge ${r.status === "delivered" ? "badge-success" : r.status === "assigned" ? "badge-info" : "badge-warning"}`, children: r.status === "delivered" ? t.delivered : r.status === "assigned" ? t.assigned : t.pending })
      ] }, r.id))
    ] })
  ] });
}
function SheltersScreen({
  t,
  shelters,
  theme
}) {
  const [search, setSearch] = useState("");
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const sheltersWithDist = userLoc ? [...shelters].map((s) => ({
    ...s,
    distKm: haversineKm(userLoc[1], userLoc[0], s.lat, s.lng)
  })).sort((a, b) => a.distKm - b.distKm) : shelters.map((s) => ({
    ...s,
    distKm: null
  }));
  const nearestId = userLoc ? sheltersWithDist.find((s) => s.roadStatus !== "closed" && s.occupied < s.capacity)?.id ?? null : null;
  const filtered = sheltersWithDist.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase()));
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocError("Geolokasi tidak disokong pada peranti ini");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLoc([pos.coords.longitude, pos.coords.latitude]);
      setLocLoading(false);
    }, () => {
      setLocError("Akses lokasi ditolak atau tamat masa");
      setLocLoading(false);
    }, {
      timeout: 1e4,
      enableHighAccuracy: false
    });
  };
  const handleShare = (s) => {
    const pct = Math.round(s.occupied / s.capacity * 100);
    const text = `🏠 *${s.name}*
📍 ${s.location}
👥 Kapasiti: ${s.occupied}/${s.capacity} (${pct}%)
🛣️ Status Jalan: ${s.roadStatus === "safe" ? "SELAMAT" : s.roadStatus === "caution" ? "BERHATI-HATI" : "DITUTUP"}
📞 ${s.contact}

Info dari MY Bantu Resilience Hub`;
    if (navigator.share) {
      navigator.share({
        title: s.name,
        text
      });
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Maklumat disalin ke clipboard!"));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)",
      position: "sticky",
      top: 0,
      zIndex: 30
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 20,
          fontWeight: 700,
          color: "var(--primary)"
        }, children: "Pusat Pemindahan" }),
        /* @__PURE__ */ jsxs("button", { onClick: handleLocate, disabled: locLoading, style: {
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "7px 12px",
          borderRadius: 20,
          border: `1.5px solid ${userLoc ? "var(--primary)" : "var(--outline-variant)"}`,
          background: userLoc ? "var(--primary)" : "transparent",
          color: userLoc ? "var(--on-primary)" : "var(--on-surface-variant)",
          fontSize: 12,
          fontWeight: 600,
          cursor: locLoading ? "wait" : "pointer",
          fontFamily: "Inter, sans-serif",
          whiteSpace: "nowrap"
        }, children: [
          locLoading ? "⌛" : "📍",
          locLoading ? "Mencari..." : userLoc ? "Lokasi Aktif" : "Cari Terdekat"
        ] })
      ] }),
      /* @__PURE__ */ jsx("input", { className: "input-field", style: {
        height: 44
      }, placeholder: t.searchLocation, value: search, onChange: (e) => setSearch(e.target.value) }),
      locError && /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        color: "var(--danger)",
        marginTop: 6
      }, children: locError })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "relative"
    }, children: [
      /* @__PURE__ */ jsx(MapView, { shelters, aidRequests: [], mini: true, theme, userLocation: userLoc }),
      /* @__PURE__ */ jsxs("div", { style: {
        position: "absolute",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.65)",
        borderRadius: 20,
        padding: "4px 12px",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        pointerEvents: "none"
      }, children: [
        shelters.length,
        " Pusat Aktif"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "shelter-grid", style: {
      padding: "12px 16px"
    }, children: filtered.map((s) => {
      const pct = Math.round(s.occupied / s.capacity * 100);
      const isFull = pct >= 100;
      const isNearest = s.id === nearestId;
      const statusColor = s.roadStatus === "safe" ? "var(--success)" : s.roadStatus === "caution" ? "var(--warning)" : "var(--danger)";
      const topColor = isFull ? "var(--danger)" : pct > 75 ? "var(--warning)" : "var(--success)";
      return /* @__PURE__ */ jsx("div", { className: "card", style: {
        marginBottom: 12,
        borderTop: `4px solid ${topColor}`,
        cursor: "pointer",
        boxShadow: isNearest ? "0 0 0 2px var(--primary)" : void 0
      }, onClick: () => setSelectedShelter(s), children: /* @__PURE__ */ jsxs("div", { style: {
        padding: "14px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            flex: 1,
            paddingRight: 8
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontSize: 16,
              fontWeight: 700
            }, children: s.name }),
            isNearest && /* @__PURE__ */ jsx("div", { style: {
              fontSize: 10,
              fontWeight: 700,
              color: "var(--primary)",
              marginTop: 2,
              letterSpacing: "0.05em"
            }, children: "📍 TERDEKAT" })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4
          }, children: [
            s.distKm !== null && /* @__PURE__ */ jsx("span", { className: "badge badge-info", style: {
              fontSize: 10
            }, children: s.distKm < 1 ? `${Math.round(s.distKm * 1e3)} m` : `${s.distKm.toFixed(1)} km` }),
            /* @__PURE__ */ jsx("span", { className: `badge ${isFull ? "badge-danger" : pct > 75 ? "badge-warning" : "badge-success"}`, children: isFull ? t.full : `${pct}%` })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: 4,
          color: "var(--on-surface-variant)",
          fontSize: 13,
          marginBottom: 12
        }, children: [
          /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 13 }),
          s.location
        ] }),
        /* @__PURE__ */ jsx("div", { className: "progress-bar", style: {
          marginBottom: 6
        }, children: /* @__PURE__ */ jsx("div", { className: "progress-fill", style: {
          width: `${Math.min(pct, 100)}%`,
          background: topColor
        } }) }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--on-surface-variant)",
          marginBottom: 12
        }, children: [
          /* @__PURE__ */ jsxs("span", { children: [
            s.occupied,
            " / ",
            s.capacity,
            " ",
            t.occupied
          ] }),
          /* @__PURE__ */ jsxs("span", { style: {
            color: statusColor,
            fontWeight: 700
          }, children: [
            s.roadStatus === "safe" ? "✅" : s.roadStatus === "caution" ? "⚠️" : "🚫",
            " ",
            s.roadStatus === "safe" ? t.safe : s.roadStatus === "caution" ? t.caution : t.closed
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12
        }, children: s.facilities.map((f) => /* @__PURE__ */ jsx("span", { className: "badge badge-gray", style: {
          fontSize: 11
        }, children: f }, f)) }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          gap: 8
        }, children: [
          /* @__PURE__ */ jsxs("button", { className: "btn btn-primary btn-sm", style: {
            flex: 1
          }, onClick: (e) => {
            e.stopPropagation();
            handleShare(s);
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "share", size: 14 }),
            " ",
            t.shareInfo
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "btn btn-secondary btn-sm", style: {
            flex: 1
          }, onClick: (e) => {
            e.stopPropagation();
            alert(`📞 ${s.contact}`);
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "phone", size: 14 }),
            " ",
            t.contact
          ] })
        ] })
      ] }) }, s.id);
    }) }),
    selectedShelter && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: () => setSelectedShelter(null), children: /* @__PURE__ */ jsxs("div", { className: "modal-sheet", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("div", { className: "modal-handle" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 4
      }, children: selectedShelter.name }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "var(--on-surface-variant)",
        fontSize: 14,
        marginBottom: 16
      }, children: [
        /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 14 }),
        selectedShelter.location
      ] }),
      [{
        label: "Kapasiti",
        value: `${selectedShelter.capacity} orang`
      }, {
        label: "Penghuni Semasa",
        value: `${selectedShelter.occupied} orang`
      }, {
        label: "Status Jalan",
        value: selectedShelter.roadStatus === "safe" ? "✅ Selamat" : selectedShelter.roadStatus === "caution" ? "⚠️ Berhati-hati" : "🚫 Ditutup"
      }, {
        label: "Hubungi",
        value: selectedShelter.contact
      }].map((row) => /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--outline-variant)"
      }, children: [
        /* @__PURE__ */ jsx("span", { style: {
          color: "var(--on-surface-variant)",
          fontSize: 14
        }, children: row.label }),
        /* @__PURE__ */ jsx("span", { style: {
          fontWeight: 600,
          fontSize: 14
        }, children: row.value })
      ] }, row.label)),
      /* @__PURE__ */ jsxs("div", { style: {
        marginTop: 12,
        marginBottom: 16
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 13,
          fontWeight: 600,
          color: "var(--on-surface-variant)",
          marginBottom: 8
        }, children: "KEMUDAHAN" }),
        /* @__PURE__ */ jsx("div", { style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 8
        }, children: selectedShelter.facilities.map((f) => /* @__PURE__ */ jsx("span", { className: "badge badge-info", children: f }, f)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        gap: 10
      }, children: [
        /* @__PURE__ */ jsxs("button", { className: "btn btn-primary", style: {
          flex: 1
        }, onClick: () => handleShare(selectedShelter), children: [
          /* @__PURE__ */ jsx(Icon, { name: "share", size: 16 }),
          " Kongsi Maklumat"
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-outline btn-sm", onClick: () => setSelectedShelter(null), children: "Tutup" })
      ] })
    ] }) })
  ] });
}
const AID_ITEMS = ["Air mineral", "Makanan kering", "Makanan masak", "Susu formula", "Lampin bayi", "Pakaian dewasa", "Pakaian kanak-kanak", "Ubat-ubatan", "Selimut", "Peralatan kebersihan", "Peralatan tidur", "Charger & bateri", "Buku & alat tulis", "Lain-lain"];
function AidScreen({
  t,
  aidRequests,
  setAidRequests,
  totalDisplaced,
  setTotalDisplaced,
  theme
}) {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    kampung: "",
    displaced: "",
    selectedItems: [],
    notes: ""
  });
  const toggleItem = (item) => {
    setForm((f) => ({
      ...f,
      selectedItems: f.selectedItems.includes(item) ? f.selectedItems.filter((i) => i !== item) : [...f.selectedItems, item]
    }));
  };
  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newReq = {
      id: `a${Date.now()}`,
      kampung: form.kampung || "Kawasan Tidak Diketahui",
      displaced: parseInt(form.displaced) || 0,
      items: form.selectedItems,
      status: "pending",
      timestamp: "Baru sahaja",
      priority: parseInt(form.displaced) > 30 ? "high" : "medium"
    };
    setAidRequests([newReq, ...aidRequests]);
    setTotalDisplaced(totalDisplaced + (parseInt(form.displaced) || 0));
    setSubmitting(false);
    setSubmitted(true);
  };
  const resetForm = () => {
    setShowForm(false);
    setStep(1);
    setSubmitted(false);
    setForm({
      kampung: "",
      displaced: "",
      selectedItems: [],
      notes: ""
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px 10px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 2
      }, children: "Papan Permohonan Bantuan" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 14,
        color: "var(--on-surface-variant)"
      }, children: "Keperluan komuniti masa nyata di sekitar anda." })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      position: "relative"
    }, children: [
      /* @__PURE__ */ jsx(MapView, { shelters: [], aidRequests, mini: true, theme }),
      /* @__PURE__ */ jsxs("div", { style: {
        position: "absolute",
        bottom: 10,
        right: 10,
        background: "rgba(186,26,26,0.85)",
        borderRadius: 20,
        padding: "4px 12px",
        color: "white",
        fontSize: 12,
        fontWeight: 700,
        pointerEvents: "none"
      }, children: [
        aidRequests.filter((r) => r.status !== "delivered").length,
        " ",
        t.activeRequests
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "12px 16px",
      background: "var(--surface)",
      display: "flex",
      gap: 12,
      borderBottom: "1px solid var(--outline-variant)"
    }, children: [{
      label: "Menunggu",
      val: aidRequests.filter((r) => r.status === "pending").length,
      color: "#b45309",
      bg: "#fef3c7"
    }, {
      label: "Ditugaskan",
      val: aidRequests.filter((r) => r.status === "assigned").length,
      color: "#00236f",
      bg: "#dce1ff"
    }, {
      label: "Dihantar",
      val: aidRequests.filter((r) => r.status === "delivered").length,
      color: "#006e2d",
      bg: "#dcfce7"
    }].map((s) => /* @__PURE__ */ jsxs("div", { style: {
      flex: 1,
      textAlign: "center",
      background: s.bg,
      borderRadius: 8,
      padding: "8px 4px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: s.color
      }, children: s.val }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        color: s.color,
        fontWeight: 500
      }, children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "12px 16px"
    }, children: aidRequests.map((r) => /* @__PURE__ */ jsx("div", { className: "card", style: {
      marginBottom: 12,
      borderLeft: `4px solid ${r.priority === "high" ? "#ba1a1a" : r.priority === "medium" ? "#b45309" : "#006e2d"}`
    }, children: /* @__PURE__ */ jsxs("div", { style: {
      padding: "12px 14px"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6
      }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: `badge ${r.status === "delivered" ? "badge-success" : r.status === "assigned" ? "badge-info" : "badge-warning"}`, style: {
            marginRight: 6
          }, children: r.status === "delivered" ? t.delivered : r.status === "assigned" ? t.assigned : t.pending }),
          /* @__PURE__ */ jsxs("span", { style: {
            fontSize: 12,
            color: "var(--on-surface-variant)"
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 11, style: {
              display: "inline"
            } }),
            " ",
            r.kampung
          ] })
        ] }),
        r.priority === "high" && /* @__PURE__ */ jsx("span", { className: "badge badge-danger", children: t.highPriority })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 17,
        fontWeight: 700,
        marginBottom: 4
      }, children: [
        "👥 ",
        r.displaced,
        " ",
        t.residents
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 5,
        marginBottom: 10
      }, children: r.items.map((i) => /* @__PURE__ */ jsx("span", { className: "badge badge-gray", style: {
        fontSize: 11
      }, children: i }, i)) }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 12,
          color: "var(--on-surface-variant)"
        }, children: r.assignedNgo ? /* @__PURE__ */ jsxs("span", { children: [
          "NGO: ",
          /* @__PURE__ */ jsx("strong", { style: {
            color: "var(--secondary)"
          }, children: r.assignedNgo })
        ] }) : "Menunggu NGO..." }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 12,
          color: "var(--on-surface-variant)"
        }, children: r.timestamp })
      ] })
    ] }) }, r.id)) }),
    /* @__PURE__ */ jsxs("button", { className: "fab fab-wide", onClick: () => setShowForm(true), children: [
      /* @__PURE__ */ jsx(Icon, { name: "plus", size: 20 }),
      " ",
      t.newRequest
    ] }),
    showForm && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: submitted ? resetForm : void 0, children: /* @__PURE__ */ jsxs("div", { className: "modal-sheet", onClick: (e) => e.stopPropagation(), style: {
      maxHeight: "95dvh"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "modal-handle" }),
      submitted ? /* @__PURE__ */ jsxs("div", { style: {
        textAlign: "center",
        padding: "20px 0"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 56,
          marginBottom: 16
        }, children: "✅" }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 22,
          fontWeight: 700,
          color: "var(--primary)",
          marginBottom: 10
        }, children: t.submitted }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 15,
          color: "var(--on-surface-variant)",
          marginBottom: 28,
          lineHeight: 1.5
        }, children: t.submittedDesc }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: resetForm, children: t.viewBoard })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 20,
            fontWeight: 700,
            color: "var(--primary)"
          }, children: "Minta Bantuan" }),
          /* @__PURE__ */ jsx("button", { onClick: resetForm, style: {
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--on-surface-variant)"
          }, children: /* @__PURE__ */ jsx(Icon, { name: "x_circle", size: 22 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          fontSize: 13,
          color: "var(--on-surface-variant)",
          marginBottom: 12
        }, children: [
          t.step,
          " ",
          step,
          " ",
          t.of,
          " 3"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "step-dots", children: [1, 2, 3].map((n) => /* @__PURE__ */ jsx("div", { className: `step-dot ${step === n ? "active" : ""}` }, n)) }),
        step === 1 && /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          flexDirection: "column",
          gap: 16
        }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: t.kampungName }),
            /* @__PURE__ */ jsx("input", { className: "input-field", placeholder: t.kampungPlaceholder, value: form.kampung, onChange: (e) => setForm((f) => ({
              ...f,
              kampung: e.target.value
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: t.displacedCount }),
            /* @__PURE__ */ jsx("input", { className: "input-field", type: "number", inputMode: "numeric", placeholder: t.displacedPlaceholder, value: form.displaced, onChange: (e) => setForm((f) => ({
              ...f,
              displaced: e.target.value
            })) })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: () => setStep(2), disabled: !form.kampung, children: t.next })
        ] }),
        step === 2 && /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          flexDirection: "column",
          gap: 14
        }, children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 14,
            fontWeight: 600,
            color: "var(--on-surface)"
          }, children: t.aidItems }),
          /* @__PURE__ */ jsx("div", { style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8
          }, children: AID_ITEMS.map((item) => {
            const selected = form.selectedItems.includes(item);
            return /* @__PURE__ */ jsxs("button", { onClick: () => toggleItem(item), style: {
              padding: "10px 12px",
              borderRadius: 6,
              border: `2px solid ${selected ? "var(--primary)" : "var(--outline-variant)"}`,
              background: selected ? "#dce1ff" : "var(--surface)",
              fontSize: 13,
              fontWeight: selected ? 600 : 400,
              color: selected ? "var(--primary)" : "var(--on-surface)",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 6
            }, children: [
              selected && /* @__PURE__ */ jsx(Icon, { name: "check", size: 14 }),
              item
            ] }, item);
          }) }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            gap: 10
          }, children: [
            /* @__PURE__ */ jsx("button", { className: "btn btn-secondary", onClick: () => setStep(1), style: {
              flex: 1
            }, children: t.back }),
            /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: () => setStep(3), disabled: form.selectedItems.length === 0, style: {
              flex: 2
            }, children: t.next })
          ] })
        ] }),
        step === 3 && /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          flexDirection: "column",
          gap: 14
        }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: t.additionalNotes }),
            /* @__PURE__ */ jsx("textarea", { className: "input-field", placeholder: t.notesPlaceholder, value: form.notes, onChange: (e) => setForm((f) => ({
              ...f,
              notes: e.target.value
            })) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "card", style: {
            padding: 12
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontSize: 12,
              fontWeight: 700,
              color: "var(--on-surface-variant)",
              marginBottom: 8,
              letterSpacing: "0.05em"
            }, children: "RINGKASAN PERMOHONAN" }),
            /* @__PURE__ */ jsxs("div", { style: {
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontSize: 14
            }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                "📍 ",
                /* @__PURE__ */ jsx("strong", { children: form.kampung })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "👥 ",
                /* @__PURE__ */ jsx("strong", { children: form.displaced }),
                " orang terlantar"
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "📦 ",
                form.selectedItems.join(", ")
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            gap: 10
          }, children: [
            /* @__PURE__ */ jsx("button", { className: "btn btn-secondary", onClick: () => setStep(2), style: {
              flex: 1
            }, children: t.back }),
            /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: handleSubmit, disabled: submitting, style: {
              flex: 2
            }, children: submitting ? t.submitting : t.submit })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
function VolunteersScreen({
  t,
  volunteers,
  setVolunteers
}) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [claimedTaskIds, setClaimedTaskIds] = useState([]);
  const [detailTask, setDetailTask] = useState(null);
  const activeVols = volunteers.filter((v) => v.status !== "available");
  const urgentTasks = [{
    id: "t1",
    title: "Pengedaran Makanan – Pusat Klang",
    location: "SK Klang, Klang",
    volunteers: 5,
    needed: 5,
    priority: true,
    image: "🥘"
  }, {
    id: "t2",
    title: "Sokongan Am – Logistik",
    location: "Dewan Rakyat Hulu Langat",
    volunteers: 2,
    needed: 4,
    priority: false,
    image: "📦"
  }];
  const handleAssign = (vol, point) => {
    setVolunteers(volunteers.map((v) => v.id === vol.id ? {
      ...v,
      assignedTo: point,
      status: "assigned"
    } : v));
    setAssignModal(null);
  };
  const handleClaimTask = (taskId) => {
    setClaimedTaskIds((prev) => prev.includes(taskId) ? prev : [...prev, taskId]);
  };
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px 10px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 2
      }, children: "Tugas Sukarelawan" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 14,
        color: "var(--on-surface-variant)"
      }, children: "Tuntut tugas mendesak untuk menyokong operasi banjir." })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px",
      background: "#dce1ff",
      borderBottom: "1px solid #b6c4ff"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#00164e",
        letterSpacing: "0.08em",
        marginBottom: 8
      }, children: t.yourTask }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 15,
            fontWeight: 700,
            color: "#00236f"
          }, children: "Pengedaran Makanan" }),
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 12,
            color: "#264191",
            marginTop: 2
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 11, style: {
              display: "inline"
            } }),
            " SK Klang, Community Hall A"
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "badge badge-success", children: t.taskClaimed })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setCheckedIn((c) => !c), style: {
        width: "100%",
        height: 52,
        borderRadius: 26,
        border: "none",
        cursor: "pointer",
        background: checkedIn ? "#006e2d" : "#00236f",
        color: "white",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.08em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      }, children: [
        /* @__PURE__ */ jsx(Icon, { name: checkedIn ? "check" : "navigation", size: 16 }),
        checkedIn ? "✓ TELAH DAFTAR MASUK" : t.slideCheckIn
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px 0"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 11,
          fontWeight: 700,
          color: "var(--on-surface-variant)",
          letterSpacing: "0.08em"
        }, children: t.distributionCoord }),
        /* @__PURE__ */ jsxs("span", { className: "badge badge-success", children: [
          activeVols.length,
          "/10 ",
          t.volunteers
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "card", style: {
        marginBottom: 14,
        borderTop: "4px solid #ba1a1a"
      }, children: /* @__PURE__ */ jsxs("div", { style: {
        padding: "12px 14px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6
        }, children: [
          /* @__PURE__ */ jsx("span", { className: "badge badge-danger", children: t.highPriority }),
          /* @__PURE__ */ jsxs("span", { style: {
            fontSize: 12,
            color: "var(--on-surface-variant)"
          }, children: [
            activeVols.length,
            "/10 Sukarelawan"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 2
        }, children: "Agihan Kit Banjir" }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 13,
          color: "var(--on-surface-variant)",
          marginBottom: 12
        }, children: "Pusat Pengagihan A, Dewan Komuniti" }),
        /* @__PURE__ */ jsx("div", { style: {
          display: "flex",
          flexDirection: "column",
          gap: 6
        }, children: volunteers.map((v, i) => /* @__PURE__ */ jsx("div", { className: `volunteer-slot ${v.assignedTo ? "filled" : ""}`, onClick: () => !v.assignedTo && setAssignModal({
          vol: v
        }), children: v.assignedTo ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "avatar", style: {
            background: ["#00236f", "#006e2d", "#b45309", "#9d174d", "#1e40af"][i % 5]
          }, children: v.name.split(" ").map((n) => n[0]).join("").slice(0, 2) }),
          /* @__PURE__ */ jsxs("div", { style: {
            flex: 1
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              fontSize: 13,
              fontWeight: 600
            }, children: v.name }),
            /* @__PURE__ */ jsxs("div", { style: {
              fontSize: 11,
              color: "var(--on-surface-variant)"
            }, children: [
              v.skill,
              " · ",
              v.assignedTo?.split(" – ")[0]
            ] })
          ] }),
          /* @__PURE__ */ jsx(Icon, { name: "check_circle", size: 18, style: {
            color: "var(--secondary)"
          } })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--surface-container)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, children: /* @__PURE__ */ jsx(Icon, { name: "plus", size: 18, style: {
            color: "var(--outline)"
          } }) }),
          /* @__PURE__ */ jsx("span", { style: {
            fontSize: 13,
            color: "var(--outline)",
            flex: 1
          }, children: "Slot Kosong – Ketik untuk Tugaskan" }),
          /* @__PURE__ */ jsx(Icon, { name: "plus", size: 18, style: {
            color: "var(--outline)"
          } })
        ] }) }, v.id)) }),
        /* @__PURE__ */ jsxs("button", { className: "btn btn-primary", style: {
          marginTop: 14
        }, onClick: () => alert("Membuka panel koordinasi agihan. Sila gunakan sistem koordinasi lapangan untuk mengurus penugasan sukarelawan."), children: [
          /* @__PURE__ */ jsx(Icon, { name: "navigation", size: 16 }),
          " Urus Koordinasi"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divider" }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--on-surface-variant)",
        letterSpacing: "0.08em",
        marginBottom: 12
      }, children: t.urgentTasks }),
      urgentTasks.map((task) => /* @__PURE__ */ jsxs("div", { className: "card", style: {
        marginBottom: 12
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          height: 100,
          background: "linear-gradient(135deg, #1a3a5e, #2d5f8e)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48
        }, children: task.image }),
        /* @__PURE__ */ jsxs("div", { style: {
          padding: "12px 14px"
        }, children: [
          task.priority && /* @__PURE__ */ jsx("span", { className: "badge badge-danger", style: {
            marginBottom: 6,
            display: "inline-block"
          }, children: t.highPriority }),
          /* @__PURE__ */ jsx("div", { style: {
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 4
          }, children: task.title }),
          /* @__PURE__ */ jsxs("div", { style: {
            fontSize: 13,
            color: "var(--on-surface-variant)",
            marginBottom: 10
          }, children: [
            /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 13, style: {
              display: "inline"
            } }),
            " ",
            task.location
          ] }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            gap: 10
          }, children: [
            claimedTaskIds.includes(task.id) ? /* @__PURE__ */ jsxs("button", { className: "btn btn-secondary btn-sm", style: {
              flex: 1
            }, disabled: true, children: [
              /* @__PURE__ */ jsx(Icon, { name: "check_circle", size: 14 }),
              " ",
              t.taskClaimed
            ] }) : /* @__PURE__ */ jsxs("button", { className: "btn btn-primary btn-sm", style: {
              flex: 1
            }, onClick: () => handleClaimTask(task.id), children: [
              /* @__PURE__ */ jsx(Icon, { name: "check", size: 14 }),
              " ",
              t.claimTask
            ] }),
            /* @__PURE__ */ jsx("button", { className: "btn btn-secondary btn-sm", onClick: () => setDetailTask(task), children: t.details })
          ] })
        ] })
      ] }, task.id))
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "0 16px 16px"
    }, children: /* @__PURE__ */ jsx("div", { className: "card map-bg", style: {
      height: 120,
      display: "flex",
      alignItems: "flex-end",
      padding: "12px"
    }, children: /* @__PURE__ */ jsxs("div", { style: {
      background: "rgba(0,0,0,0.6)",
      borderRadius: 8,
      padding: "8px 14px",
      color: "white",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10
    }, children: [
      /* @__PURE__ */ jsx(Icon, { name: "map", size: 18 }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontWeight: 700,
          fontSize: 14
        }, children: t.taskMap }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 12,
          opacity: 0.8
        }, children: t.findNearest })
      ] })
    ] }) }) }),
    detailTask && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: () => setDetailTask(null), children: /* @__PURE__ */ jsxs("div", { className: "modal-sheet", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("div", { className: "modal-handle" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 8
      }, children: detailTask.title }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "var(--on-surface-variant)",
        fontSize: 14,
        marginBottom: 16
      }, children: [
        /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 14 }),
        detailTask.location
      ] }),
      [{
        label: "Sukarelawan Diperlukan",
        value: `${detailTask.needed} orang`
      }, {
        label: "Sukarelawan Ditugaskan",
        value: `${detailTask.volunteers} orang`
      }, {
        label: "Keutamaan",
        value: detailTask.priority ? "🔴 Tinggi" : "🟡 Sederhana"
      }].map((row) => /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--outline-variant)"
      }, children: [
        /* @__PURE__ */ jsx("span", { style: {
          color: "var(--on-surface-variant)",
          fontSize: 14
        }, children: row.label }),
        /* @__PURE__ */ jsx("span", { style: {
          fontWeight: 600,
          fontSize: 14
        }, children: row.value })
      ] }, row.label)),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        gap: 10,
        marginTop: 16
      }, children: [
        !claimedTaskIds.includes(detailTask.id) ? /* @__PURE__ */ jsxs("button", { className: "btn btn-primary", style: {
          flex: 1
        }, onClick: () => {
          handleClaimTask(detailTask.id);
          setDetailTask(null);
        }, children: [
          /* @__PURE__ */ jsx(Icon, { name: "check", size: 16 }),
          " ",
          t.claimTask
        ] }) : /* @__PURE__ */ jsxs("button", { className: "btn btn-secondary", style: {
          flex: 1
        }, disabled: true, children: [
          /* @__PURE__ */ jsx(Icon, { name: "check_circle", size: 16 }),
          " ",
          t.taskClaimed
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-outline btn-sm", onClick: () => setDetailTask(null), children: "Tutup" })
      ] })
    ] }) }),
    assignModal && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: () => setAssignModal(null), children: /* @__PURE__ */ jsxs("div", { className: "modal-sheet", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("div", { className: "modal-handle" }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 18,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 16
      }, children: "Tugaskan Titik Agihan" }),
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 14,
        color: "var(--on-surface-variant)",
        marginBottom: 16
      }, children: [
        "Pilih titik agihan untuk ",
        /* @__PURE__ */ jsx("strong", { children: assignModal.vol.name }),
        ":"
      ] }),
      distributionPoints.map((pt) => /* @__PURE__ */ jsxs("button", { onClick: () => handleAssign(assignModal.vol, pt), style: {
        width: "100%",
        padding: "14px 16px",
        marginBottom: 8,
        borderRadius: 8,
        border: "1.5px solid var(--outline-variant)",
        background: "var(--surface)",
        color: "var(--on-surface)",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 10
      }, children: [
        /* @__PURE__ */ jsx(Icon, { name: "map_pin", size: 16, style: {
          color: "var(--primary)"
        } }),
        pt
      ] }, pt))
    ] }) })
  ] });
}
function AlertsScreen({
  t,
  alerts
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
    fetch("https://api.data.gov.my/weather/warning", {
      signal: controller.signal
    }).then((r) => {
      if (!r.ok) throw new Error("bad");
      return r.json();
    }).then((raw) => {
      const items = Array.isArray(raw) ? raw : raw.data ?? raw.results ?? [];
      if (items.length === 0) throw new Error("empty");
      const mapped = items.slice(0, 6).map((item, i) => ({
        id: `gov-${i}`,
        type: "warning",
        title: item.title_ms ?? item.title ?? item.warning_title ?? "Amaran Cuaca",
        content: item.text_ms ?? item.description ?? item.warning_desc ?? "Sila berhati-hati.",
        source: "MetMalaysia · data.gov.my",
        timestamp: formatGovDate(item.date_start ?? item.issued_date ?? item.date),
        shared: 0
      }));
      setLiveAlerts(mapped);
      setIsLive(true);
    }).catch(() => {
    }).finally(() => {
      clearTimeout(timeout);
      setFetchingLive(false);
    });
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);
  const handleShare = (alert2) => {
    const prefix = alert2.type === "verified" ? "✅ DISAHKAN" : alert2.type === "misinformation" ? "❌ MAKLUMAT PALSU" : "⚠️ AMARAN";
    const text = `${prefix}

*${alert2.title}*

${alert2.content}

Sumber: ${alert2.source}

— MY Bantu Resilience Hub`;
    if (navigator.share) {
      navigator.share({
        title: alert2.title,
        text
      });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(alert2.id);
        setTimeout(() => setCopiedId(null), 2e3);
      });
    }
  };
  const filterOptions = [{
    key: "all",
    label: "Semua",
    color: "var(--primary)"
  }, {
    key: "verified",
    label: "✅ Disahkan",
    color: "var(--success)"
  }, {
    key: "warning",
    label: "⚠️ Amaran",
    color: "var(--warning)"
  }, {
    key: "misinformation",
    label: "❌ Palsu",
    color: "var(--danger)"
  }];
  const allAlerts = [...liveAlerts, ...alerts];
  const displayedAlerts = activeFilter === "all" ? allAlerts : allAlerts.filter((a) => a.type === activeFilter);
  const typeConfig = {
    verified: {
      color: "var(--success)",
      bgRgba: "rgba(74,222,128,0.15)",
      label: t.verified,
      icon: "check_circle",
      badgeHex: "#16a34a"
    },
    warning: {
      color: "var(--warning)",
      bgRgba: "rgba(251,146,60,0.15)",
      label: t.warning,
      icon: "alert",
      badgeHex: "#d97706"
    },
    misinformation: {
      color: "var(--danger)",
      bgRgba: "rgba(248,113,113,0.15)",
      label: t.misinformation,
      icon: "x_circle",
      badgeHex: "#dc2626"
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px 10px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 20,
          fontWeight: 700,
          color: "var(--primary)",
          marginBottom: 2
        }, children: "Suapan Amaran" }),
        /* @__PURE__ */ jsx("span", { className: `badge ${isLive ? "badge-success" : "badge-gray"}`, style: {
          fontSize: 9,
          marginTop: 4,
          flexShrink: 0
        }, children: fetchingLive ? "⌛ Memuatkan" : isLive ? "● LANGSUNG" : "SIMULASI" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 13,
        color: "var(--on-surface-variant)"
      }, children: isLive ? `${liveAlerts.length} amaran langsung · MetMalaysia` : "Maklumat disahkan dari sumber rasmi." })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      gap: 8,
      padding: "12px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)",
      overflowX: "auto"
    }, children: filterOptions.map((f) => /* @__PURE__ */ jsxs("button", { onClick: () => setActiveFilter(f.key), style: {
      flexShrink: 0,
      padding: "6px 14px",
      borderRadius: 20,
      border: `1.5px solid ${f.color}`,
      background: activeFilter === f.key ? f.color : "transparent",
      color: activeFilter === f.key ? "white" : f.color,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6
    }, children: [
      f.label,
      /* @__PURE__ */ jsx("span", { style: {
        background: activeFilter === f.key ? "rgba(255,255,255,0.3)" : f.color,
        color: "white",
        borderRadius: 10,
        padding: "1px 7px",
        fontSize: 11
      }, children: f.key === "all" ? alerts.length : alerts.filter((a) => a.type === f.key).length })
    ] }, f.key)) }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "12px 16px"
    }, children: displayedAlerts.map((alertItem) => {
      const cfg = typeConfig[alertItem.type];
      return /* @__PURE__ */ jsxs("div", { className: "mymet-alert-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "mymet-alert-header", children: [
          /* @__PURE__ */ jsx("div", { className: "mymet-icon-circle", style: {
            background: cfg.bgRgba
          }, children: /* @__PURE__ */ jsx(Icon, { name: cfg.icon, size: 20, style: {
            color: cfg.color
          } }) }),
          /* @__PURE__ */ jsxs("div", { style: {
            flex: 1,
            minWidth: 0
          }, children: [
            /* @__PURE__ */ jsx("div", { className: "mymet-alert-title", children: alertItem.title }),
            /* @__PURE__ */ jsxs("div", { className: "mymet-alert-issued", children: [
              "Dikeluarkan: ",
              alertItem.timestamp
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "mymet-share-btn", onClick: () => handleShare(alertItem), "aria-label": "Share", title: copiedId === alertItem.id ? "Disalin!" : "Kongsi", style: {
            color: copiedId === alertItem.id ? "var(--success)" : void 0
          }, children: /* @__PURE__ */ jsx(Icon, { name: copiedId === alertItem.id ? "check" : "share", size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mymet-notice-strip", style: {
          borderLeftColor: cfg.color
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "mymet-notice-meta", children: [
            /* @__PURE__ */ jsx("span", { className: "mymet-notice-label", style: {
              background: cfg.badgeHex
            }, children: cfg.label }),
            /* @__PURE__ */ jsx("span", { className: "mymet-notice-time", children: alertItem.timestamp })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mymet-notice-content", children: alertItem.content }),
          /* @__PURE__ */ jsxs("div", { className: "mymet-notice-footer", children: [
            /* @__PURE__ */ jsxs("span", { className: "mymet-notice-source", children: [
              "Sumber: ",
              alertItem.source,
              " · ",
              alertItem.shared,
              " dikongsi"
            ] }),
            alertItem.type !== "verified" && /* @__PURE__ */ jsxs("button", { className: "btn btn-secondary btn-sm", style: {
              flexShrink: 0
            }, onClick: () => {
              if (alertItem.type === "misinformation") window.open("https://sebenarnya.my", "_blank");
              else window.open("https://www.met.gov.my", "_blank");
            }, children: [
              /* @__PURE__ */ jsx(Icon, { name: "info", size: 13 }),
              " Semak"
            ] })
          ] })
        ] })
      ] }, alertItem.id);
    }) })
  ] });
}
function SettingsScreen({
  t,
  theme,
  setTheme,
  lang,
  setLang,
  isOffline,
  setIsOffline,
  lowData,
  setLowData,
  autoSync,
  setAutoSync
}) {
  const Section = ({
    title,
    children
  }) => /* @__PURE__ */ jsxs("div", { style: {
    marginBottom: 8
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--on-surface-variant)",
      letterSpacing: "0.1em",
      padding: "14px 16px 8px"
    }, children: title }),
    /* @__PURE__ */ jsx("div", { style: {
      background: "var(--surface)",
      borderTop: "1px solid var(--outline-variant)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children })
  ] });
  const Row = ({
    label,
    children,
    sub
  }) => /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid var(--outline-variant)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 16,
        color: "var(--on-surface)"
      }, children: label }),
      sub && /* @__PURE__ */ jsx("div", { style: {
        fontSize: 12,
        color: "var(--outline)",
        marginTop: 2
      }, children: sub })
    ] }),
    children
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "screen", children: [
    /* @__PURE__ */ jsx("div", { style: {
      padding: "14px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)"
    }, children: /* @__PURE__ */ jsx("div", { style: {
      fontSize: 20,
      fontWeight: 700,
      color: "var(--primary)"
    }, children: "Tetapan" }) }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)",
      marginBottom: 8
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "avatar", style: {
        width: 56,
        height: 56,
        background: "#00236f",
        fontSize: 20
      }, children: "KK" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 18,
          fontWeight: 700
        }, children: "Ketua Kampung" }),
        /* @__PURE__ */ jsx("div", { style: {
          fontSize: 13,
          color: "var(--on-surface-variant)"
        }, children: "Kg. Sentosa, Pahang" }),
        /* @__PURE__ */ jsx("div", { className: "badge badge-success", style: {
          marginTop: 4
        }, children: "Penyelaras Komuniti" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Section, { title: t.language, children: [{
      code: "ms",
      label: "Bahasa Malaysia"
    }, {
      code: "en",
      label: "English"
    }].map((l) => /* @__PURE__ */ jsxs("div", { className: "list-item", style: {
      cursor: "pointer",
      justifyContent: "space-between"
    }, onClick: () => setLang(l.code), children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }, children: [
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: 20
        }, children: "🌐" }),
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: 16,
          fontWeight: lang === l.code ? 600 : 400
        }, children: l.label })
      ] }),
      lang === l.code && /* @__PURE__ */ jsx(Icon, { name: "check", size: 20, style: {
        color: "var(--primary)"
      } })
    ] }, l.code)) }),
    /* @__PURE__ */ jsx(Section, { title: t.displayMode, children: /* @__PURE__ */ jsx(Row, { label: t.darkMode, sub: theme === "dark" ? "Mod gelap aktif" : "Mod cerah aktif", children: /* @__PURE__ */ jsxs("label", { className: "toggle", children: [
      /* @__PURE__ */ jsx("input", { type: "checkbox", checked: theme === "dark", onChange: (e) => setTheme(e.target.checked ? "dark" : "light") }),
      /* @__PURE__ */ jsx("span", { className: "toggle-slider" })
    ] }) }) }),
    /* @__PURE__ */ jsxs(Section, { title: t.connectivity, children: [
      /* @__PURE__ */ jsx(Row, { label: t.lowDataMode, sub: "Kurangkan penggunaan data dalam kawasan capaian lemah", children: /* @__PURE__ */ jsxs("label", { className: "toggle", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: lowData, onChange: (e) => setLowData(e.target.checked) }),
        /* @__PURE__ */ jsx("span", { className: "toggle-slider" })
      ] }) }),
      /* @__PURE__ */ jsx(Row, { label: t.autoSync, sub: "Segerak data apabila sambungan dipulihkan", children: /* @__PURE__ */ jsxs("label", { className: "toggle", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: autoSync, onChange: (e) => setAutoSync(e.target.checked) }),
        /* @__PURE__ */ jsx("span", { className: "toggle-slider" })
      ] }) }),
      /* @__PURE__ */ jsx(Row, { label: "Simulasi Mod Luar Talian", sub: "Aktifkan untuk menguji ciri offline", children: /* @__PURE__ */ jsxs("label", { className: "toggle", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: isOffline, onChange: (e) => setIsOffline(e.target.checked) }),
        /* @__PURE__ */ jsx("span", { className: "toggle-slider" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Section, { title: "MAKLUMAT APLIKASI", children: [
      /* @__PURE__ */ jsx(Row, { label: t.appVersion, children: /* @__PURE__ */ jsx("span", { style: {
        fontSize: 14,
        color: "var(--outline)"
      }, children: "v2.1.4 (Build 241)" }) }),
      /* @__PURE__ */ jsxs("div", { className: "list-item", style: {
        cursor: "pointer",
        justifyContent: "space-between"
      }, onClick: () => alert("Cache dikosongkan!"), children: [
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: 16,
          color: "#ba1a1a"
        }, children: t.clearCache }),
        /* @__PURE__ */ jsx(Icon, { name: "refresh", size: 18, style: {
          color: "#ba1a1a"
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "16px",
      textAlign: "center",
      color: "var(--outline)",
      fontSize: 12,
      lineHeight: 1.6
    }, children: [
      "MY Bantu – Pusat Ketahanan Banjir Komuniti",
      /* @__PURE__ */ jsx("br", {}),
      "Dibangunkan untuk komuniti Malaysia",
      /* @__PURE__ */ jsx("br", {}),
      "Bekerjasama dengan NADMA, Mercy Malaysia & JBPM"
    ] })
  ] });
}
function MapScreen({
  t,
  shelters,
  aidRequests,
  theme
}) {
  return /* @__PURE__ */ jsxs("div", { className: "screen map-screen", style: {
    display: "flex",
    flexDirection: "column"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "14px 16px 10px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--outline-variant)",
      flexShrink: 0
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        fontSize: 20,
        fontWeight: 700,
        color: "var(--primary)",
        marginBottom: 2
      }, children: [
        t.map,
        " Risiko Banjir"
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 14,
        color: "var(--on-surface-variant)"
      }, children: t.mapSubtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      flex: 1,
      minHeight: 0
    }, children: /* @__PURE__ */ jsx(MapView, { shelters, aidRequests, theme }) })
  ] });
}
function App() {
  const [screen, setScreen] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("ms");
  const [isOffline, setIsOffline] = useState(false);
  const [lowData, setLowData] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [shelters] = useState(initialShelters);
  const [aidRequests, setAidRequests] = useState(initialAidRequests);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [alerts] = useState(initialAlerts);
  const [totalDisplaced, setTotalDisplaced] = useState(50);
  const t = T[lang];
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const pendingAlerts = alerts.filter((a) => a.type === "warning" || a.type === "misinformation").length;
  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return /* @__PURE__ */ jsx(DashboardScreen, { t, shelters, aidRequests, volunteers, setScreen, totalDisplaced, theme });
      case "shelters":
        return /* @__PURE__ */ jsx(SheltersScreen, { t, shelters, theme });
      case "aid":
        return /* @__PURE__ */ jsx(AidScreen, { t, aidRequests, setAidRequests, totalDisplaced, setTotalDisplaced, theme });
      case "volunteers":
        return /* @__PURE__ */ jsx(VolunteersScreen, { t, volunteers, setVolunteers });
      case "alerts":
        return /* @__PURE__ */ jsx(AlertsScreen, { t, alerts });
      case "map":
        return /* @__PURE__ */ jsx(MapScreen, { t, shelters, aidRequests, theme });
      case "settings":
        return /* @__PURE__ */ jsx(SettingsScreen, { t, theme, setTheme, lang, setLang, isOffline, setIsOffline, lowData, setLowData, autoSync, setAutoSync });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "app-shell", children: [
    /* @__PURE__ */ jsx(AppTopBar, { isOffline, t, theme, setTheme, setScreen, screen }),
    /* @__PURE__ */ jsx(AppTopTabs, { screen, setScreen, t, alertCount: pendingAlerts }),
    /* @__PURE__ */ jsxs("div", { className: "app-body", children: [
      /* @__PURE__ */ jsx(SideNav, { screen, setScreen, t, theme, setTheme, alertCount: pendingAlerts }),
      renderScreen()
    ] })
  ] });
}
export {
  App as component
};
