import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { RainfallChart } from '../components/RainfallChart'
import { MapView } from '../components/MapView'

export const Route = createFileRoute('/')({
  component: App,
})

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen = 'dashboard' | 'shelters' | 'aid' | 'volunteers' | 'alerts' | 'map' | 'settings'
type Theme = 'light' | 'dark'
type Lang = 'ms' | 'en'

interface Shelter {
  id: string
  name: string
  location: string
  capacity: number
  occupied: number
  facilities: string[]
  roadStatus: 'safe' | 'caution' | 'closed'
  contact: string
  lat: number
  lng: number
}

interface AidRequest {
  id: string
  kampung: string
  displaced: number
  items: string[]
  status: 'pending' | 'assigned' | 'delivered'
  assignedNgo?: string
  timestamp: string
  priority: 'high' | 'medium' | 'low'
}

interface Volunteer {
  id: string
  name: string
  skill: string
  assignedTo?: string
  status: 'available' | 'assigned' | 'active'
}

interface AlertItem {
  id: string
  type: 'verified' | 'warning' | 'misinformation'
  title: string
  content: string
  source: string
  timestamp: string
  shared: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialShelters: Shelter[] = [
  { id: 's1', name: 'Dewan Komuniti Sg. Buloh', location: 'Sungai Buloh, Selangor', capacity: 200, occupied: 147, facilities: ['Air bersih', 'Tandas', 'Dapur', 'WiFi'], roadStatus: 'safe', contact: '03-6140 7890', lat: 3.210, lng: 101.575 },
  { id: 's2', name: 'Sekolah Kebangsaan Klang', location: 'Klang, Selangor', capacity: 300, occupied: 289, facilities: ['Air bersih', 'Tandas', 'Katil'], roadStatus: 'caution', contact: '03-3372 1234', lat: 3.045, lng: 101.447 },
  { id: 's3', name: 'Balai Raya Kg. Sentosa', location: 'Kg. Sentosa, Pahang', capacity: 120, occupied: 34, facilities: ['Air bersih', 'Tandas', 'Surau'], roadStatus: 'safe', contact: '09-5561 8800', lat: 3.505, lng: 102.620 },
  { id: 's4', name: 'Pusat Peranginan Gombak', location: 'Gombak, KL', capacity: 150, occupied: 150, facilities: ['Air bersih', 'Tandas', 'Dapur', 'Katil', 'WiFi'], roadStatus: 'closed', contact: '03-6189 2000', lat: 3.248, lng: 101.735 },
  { id: 's5', name: 'Sekolah Menengah Bera', location: 'Bera, Pahang', capacity: 250, occupied: 78, facilities: ['Air bersih', 'Tandas', 'Dapur'], roadStatus: 'safe', contact: '09-2553 4567', lat: 3.465, lng: 102.582 },
]

const initialAidRequests: AidRequest[] = [
  { id: 'a1', kampung: 'Kg. Sentosa', displaced: 50, items: ['Air mineral', 'Lampin bayi', 'Ubat-ubatan', 'Makanan kering'], status: 'assigned', assignedNgo: 'Mercy Malaysia', timestamp: '2m lepas', priority: 'high' },
  { id: 'a2', kampung: 'Kg. Baru Klang', displaced: 23, items: ['Selimut', 'Makanan kering', 'Air mineral'], status: 'pending', timestamp: '15m lepas', priority: 'high' },
  { id: 'a3', kampung: 'Taman Maju', displaced: 87, items: ['Makanan masak', 'Ubat-ubatan', 'Pakaian dewasa'], status: 'assigned', assignedNgo: 'Yayasan Budi', timestamp: '32m lepas', priority: 'medium' },
  { id: 'a4', kampung: 'Kg. Pandan', displaced: 12, items: ['Air mineral', 'Susu formula'], status: 'delivered', assignedNgo: 'Aman Malaysia', timestamp: '1j lepas', priority: 'low' },
  { id: 'a5', kampung: 'Bandar Sg. Long', displaced: 34, items: ['Peralatan kebersihan', 'Makanan kering', 'Selimut'], status: 'pending', timestamp: '2j lepas', priority: 'medium' },
]

const initialVolunteers: Volunteer[] = [
  { id: 'v1', name: 'Ahmad Faizal', skill: 'Perubatan', assignedTo: 'Titik Agihan A – Sg. Buloh', status: 'assigned' },
  { id: 'v2', name: 'Siti Hajar', skill: 'Logistik', assignedTo: 'Titik Agihan B – Klang', status: 'active' },
  { id: 'v3', name: 'Rajan Kumar', skill: 'Pemandu', assignedTo: 'Titik Agihan A – Sg. Buloh', status: 'assigned' },
  { id: 'v4', name: 'Nur Aina', skill: 'Pengurus Data', assignedTo: 'Titik Agihan C – Gombak', status: 'assigned' },
  { id: 'v5', name: 'Ismail Bakar', skill: 'Pemandu Bot', assignedTo: 'Titik Agihan D – Bera', status: 'active' },
  { id: 'v6', name: 'Priya Nair', skill: 'Kaunseling', assignedTo: 'Titik Agihan B – Klang', status: 'assigned' },
  { id: 'v7', name: 'Zulaikha Mohd', skill: 'Logistik', assignedTo: 'Titik Agihan C – Gombak', status: 'assigned' },
  { id: 'v8', name: 'Lee Wen Xin', skill: 'Masakan', assignedTo: 'Titik Agihan A – Sg. Buloh', status: 'active' },
  { id: 'v9', name: 'Hafizuddin', skill: 'Pemandu', assignedTo: 'Titik Agihan D – Bera', status: 'assigned' },
  { id: 'v10', name: 'Maryam Idris', skill: 'Perubatan', assignedTo: 'Titik Agihan E – Sentosa', status: 'assigned' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatGovDate(dateStr?: string): string {
  if (!dateStr) return 'Terkini'
  try {
    return new Date(dateStr).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return dateStr
  }
}

const distributionPoints = [
  'Titik Agihan A – Dewan Sg. Buloh',
  'Titik Agihan B – SK Klang',
  'Titik Agihan C – Balai Raya Gombak',
  'Titik Agihan D – Balai Raya Bera',
  'Titik Agihan E – Kg. Sentosa',
]

const initialAlerts: AlertItem[] = [
  { id: 'al1', type: 'verified', title: 'Paras Air Sungai Klang Meningkat', content: 'Jabatan Pengairan dan Saliran mengesahkan paras air telah mencapai tahap waspada di Km 14. Kawasan rendah di Klang diminta berwaspada.', source: 'JPS Malaysia', timestamp: '5m lepas', shared: 234 },
  { id: 'al2', type: 'misinformation', title: 'SALAH: "Empangan Temenggor Akan Dibuka"', content: 'Dakwaan empangan akan dibuka dalam masa 2 jam adalah PALSU. TNB mengesahkan tiada operasi pelepasan air dalam masa terdekat.', source: 'Semak Kenyataan: TNB Bhd', timestamp: '23m lepas', shared: 89 },
  { id: 'al3', type: 'warning', title: 'Jalan FT050 Ditutup – Banjir', content: 'JPJ mengesahkan jalan persekutuan FT050 dari Bandar Baru Klang ke Meru ditutup akibat banjir. Guna laluan alternatif via Persiaran Raja Muda Musa.', source: 'JPJ Selangor', timestamp: '41m lepas', shared: 567 },
  { id: 'al4', type: 'verified', title: 'Bekalan Elektrik Dipulihkan – Subang', content: 'TNB mengesahkan bekalan elektrik di kawasan Subang Jaya telah dipulihkan sepenuhnya. Penduduk diminta periksa keselamatan wiring terlebih dahulu.', source: 'TNB Bhd', timestamp: '1j 15m lepas', shared: 142 },
  { id: 'al5', type: 'warning', title: 'Amaran Cuaca Buruk – Selangor & Pahang', content: 'MetMalaysia mengeluarkan amaran hujan lebat berterusan untuk Selangor, Pahang dan Terengganu sehingga 72 jam akan datang. Sediakan kit kecemasan.', source: 'MetMalaysia', timestamp: '2j lepas', shared: 1203 },
]

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  ms: {
    appName: 'MY Bantu',
    appSubtitle: 'Pusat Ketahanan Banjir Komuniti',
    dashboard: 'Papan Pemuka',
    shelters: 'Pusat Pemindahan',
    aid: 'Bantuan',
    volunteers: 'Sukarelawan',
    alerts: 'Amaran',
    settings: 'Tetapan',
    offlineMode: 'MOD LUAR TALIAN',
    lastSync: 'Kemas kini terakhir',
    displaced: 'Mangsa Banjir',
    residents: 'orang terlantar',
    activeShelters: 'Pusat Aktif',
    volunteerActive: 'Sukarelawan',
    aidRequests: 'Permohonan Bantuan',
    reportDisplaced: 'Laporkan Mangsa',
    requestAid: 'Minta Bantuan',
    coordinateVol: 'Koordinasi Sukarelawan',
    shareShelter: 'Kongsi Maklumat Tempat Perlindungan',
    newRequest: '+ Permohonan Baharu',
    sosEmergency: 'SOS KECEMASAN',
    searchLocation: 'Cari lokasi...',
    capacity: 'Kapasiti',
    occupied: 'Penghuni',
    roadStatus: 'Status Jalan',
    safe: 'SELAMAT',
    caution: 'BERHATI-HATI',
    closed: 'DITUTUP',
    full: 'PENUH',
    facilities: 'Kemudahan',
    getDirections: 'Dapatkan Arah',
    shareInfo: 'Kongsi',
    step: 'Langkah',
    of: 'daripada',
    next: 'Seterusnya →',
    back: '← Kembali',
    submit: 'Hantar Permohonan',
    kampungName: 'Nama Kampung / Kawasan',
    kampungPlaceholder: 'Masukkan nama kampung',
    displacedCount: 'Bilangan Orang Terlantar',
    displacedPlaceholder: 'Masukkan bilangan',
    aidItems: 'Barangan Bantuan Diperlukan',
    additionalNotes: 'Nota Tambahan',
    notesPlaceholder: 'Maklumat tambahan (keadaan kecemasan, keperluan khas, dll.)',
    submitting: 'Menghantar...',
    submitted: 'Permohonan Dihantar!',
    submittedDesc: 'Permohonan anda telah direkodkan dan akan diproses segera.',
    viewBoard: 'Lihat Papan Permohonan',
    yourTask: 'TUGAS ANDA',
    taskClaimed: 'Dituntut',
    slideCheckIn: 'LERET UNTUK DAFTAR MASUK',
    distributionCoord: 'KOORDINASI AGIHAN',
    volunteers10: 'Sukarelawan (10/10)',
    highPriority: 'KEUTAMAAN TINGGI',
    urgentTasks: 'TUGAS MENDESAK',
    claimTask: 'Tuntut Tugas',
    taskMap: 'Peta Tugas',
    findNearest: 'Cari tugas berhampiran lokasi anda semasa',
    language: 'BAHASA',
    connectivity: 'SAMBUNGAN',
    lowDataMode: 'Mod Data Rendah',
    autoSync: 'Penyegerakan Automatik',
    displayMode: 'MOD PAPARAN',
    darkMode: 'Mod Gelap',
    lightMode: 'Mod Cerah',
    appVersion: 'Versi Aplikasi',
    clearCache: 'Kosongkan Cache',
    localCopy: 'Salinan Tempatan Sahaja',
    pending: 'Menunggu',
    assigned: 'Ditugaskan',
    delivered: 'Dihantar',
    details: 'Butiran',
    viewMap: 'Lihat Peta Langsung',
    activeRequests: 'Permohonan Aktif Berdekatan',
    share: 'Kongsi',
    verify: 'Sahkan',
    verified: 'DISAHKAN',
    warning: 'AMARAN',
    misinformation: 'MAKLUMAT PALSU',
    contact: 'Hubungi',
    slots: 'Slot',
    available: 'Tersedia',
    assign: 'Tugaskan',
    quickActions: 'TINDAKAN PANTAS',
    recentActivity: 'AKTIVITI TERKINI',
    floodStatus: 'Status Banjir Semasa',
    alertLevel: 'Tahap Amaran',
    danger: 'BAHAYA',
    viewAllShelters: 'Lihat Semua Pusat Pemindahan',
    map: 'Peta',
    mapSubtitle: 'Selangor & Pahang · Data masa nyata',
  },
  en: {
    appName: 'MY Bantu',
    appSubtitle: 'Community Flood Resilience Hub',
    dashboard: 'Dashboard',
    shelters: 'Shelters',
    aid: 'Aid',
    volunteers: 'Volunteers',
    alerts: 'Alerts',
    settings: 'Settings',
    offlineMode: 'OFFLINE MODE',
    lastSync: 'Last synced',
    displaced: 'Flood Displaced',
    residents: 'residents displaced',
    activeShelters: 'Active Shelters',
    volunteerActive: 'Volunteers',
    aidRequests: 'Aid Requests',
    reportDisplaced: 'Report Displaced',
    requestAid: 'Request Aid',
    coordinateVol: 'Coordinate Volunteers',
    shareShelter: 'Share Shelter Info',
    newRequest: '+ New Request',
    sosEmergency: 'SOS EMERGENCY',
    searchLocation: 'Search location...',
    capacity: 'Capacity',
    occupied: 'Occupied',
    roadStatus: 'Road Status',
    safe: 'SAFE',
    caution: 'CAUTION',
    closed: 'CLOSED',
    full: 'FULL',
    facilities: 'Facilities',
    getDirections: 'Get Directions',
    shareInfo: 'Share',
    step: 'Step',
    of: 'of',
    next: 'Next →',
    back: '← Back',
    submit: 'Submit Request',
    kampungName: 'Village / Area Name',
    kampungPlaceholder: 'Enter village name',
    displacedCount: 'Number of Displaced Residents',
    displacedPlaceholder: 'Enter number',
    aidItems: 'Aid Items Needed',
    additionalNotes: 'Additional Notes',
    notesPlaceholder: 'Additional info (emergency conditions, special needs, etc.)',
    submitting: 'Submitting...',
    submitted: 'Request Submitted!',
    submittedDesc: 'Your request has been recorded and will be processed immediately.',
    viewBoard: 'View Request Board',
    yourTask: 'YOUR TASK',
    taskClaimed: 'Claimed',
    slideCheckIn: 'SLIDE TO CHECK IN',
    distributionCoord: 'DISTRIBUTION COORDINATION',
    volunteers10: 'Volunteers (10/10)',
    highPriority: 'HIGH PRIORITY',
    urgentTasks: 'URGENT TASKS',
    claimTask: 'Claim Task',
    taskMap: 'Task Map',
    findNearest: 'Find tasks near your current location',
    language: 'LANGUAGE',
    connectivity: 'CONNECTIVITY',
    lowDataMode: 'Low Data Mode',
    autoSync: 'Auto Synchronization',
    displayMode: 'DISPLAY MODE',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    appVersion: 'App Version',
    clearCache: 'Clear Cache',
    localCopy: 'Local Copy Only',
    pending: 'Pending',
    assigned: 'Assigned',
    delivered: 'Delivered',
    details: 'Details',
    viewMap: 'View Live Map',
    activeRequests: 'Active Requests Nearby',
    share: 'Share',
    verify: 'Verify',
    verified: 'VERIFIED',
    warning: 'WARNING',
    misinformation: 'MISINFORMATION',
    contact: 'Contact',
    slots: 'Slots',
    available: 'Available',
    assign: 'Assign',
    quickActions: 'QUICK ACTIONS',
    recentActivity: 'RECENT ACTIVITY',
    floodStatus: 'Current Flood Status',
    alertLevel: 'Alert Level',
    danger: 'DANGER',
    viewAllShelters: 'View All Shelters',
    map: 'Map',
    mapSubtitle: 'Selangor & Pahang · Live data',
  },
}

// ─── Icon Components ──────────────────────────────────────────────────────────

function Icon({ name, size = 24, className = '', style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const paths: Record<string, string> = {
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    shelter: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    aid: 'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16',
    package: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
    volunteer: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    wifi_off: 'M1 1l22 22 M16.72 11.06A10.94 10.94 0 0119 12.55 M5 12.55a10.94 10.94 0 015.17-2.39 M10.71 5.05A16 16 0 0122.56 9 M1.42 9a15.91 15.91 0 014.7-2.88 M8.53 16.11a6 6 0 016.95 0 M12 20h.01',
    wifi: 'M5 12.55a11 11 0 0114.08 0 M1.42 9a16 16 0 0121.16 0 M8.53 16.11a6 6 0 016.95 0 M12 20h.01',
    alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    check_circle: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
    x_circle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6',
    map_pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4z',
    plus: 'M12 5v14 M5 12h14',
    arrow_right: 'M5 12h14 M12 5l7 7-7 7',
    arrow_left: 'M19 12H5 M12 19l-7-7 7-7',
    share: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8 M16 6l-4-4-4 4 M12 2v13',
    phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.06a16 16 0 006.03 6.03l1.42-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    navigation: 'M3 11l19-9-9 19-2-8-8-2z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    check: 'M20 6L9 17l-5-5',
    cloud_off: 'M22.61 16.95A5 5 0 0018 10h-1.26A8 8 0 101 16.29 M1 1l22 22',
    refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
    sun: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z',
    moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
    menu: 'M3 12h18 M3 6h18 M3 18h18',
    info: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
    truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    task: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d={paths[name] || paths['info']} />
    </svg>
  )
}

// ─── Shared Components ────────────────────────────────────────────────────────

function AppTopBar({ isOffline, t, theme, setTheme, setScreen, screen }: {
  isOffline: boolean
  t: typeof T.ms
  theme: Theme
  setTheme: (t: Theme) => void
  setScreen: (s: Screen) => void
  screen: Screen
}) {
  return (
    <div className="app-top-bar">
      <div className="app-top-bar-logo">
        <span style={{ fontSize: 20 }}>🌊</span>
        <span>{t.appName}</span>
        {isOffline && <span className="offline-chip">{t.offlineMode}</span>}
      </div>
      <div className="app-top-bar-actions">
        <button
          className="top-bar-icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <button
          className={`top-bar-icon-btn${screen === 'settings' ? ' active' : ''}`}
          onClick={() => setScreen('settings')}
          aria-label="Settings"
        >
          <Icon name="settings" size={18} />
        </button>
      </div>
    </div>
  )
}

function AppTopTabs({ screen, setScreen, t, alertCount }: {
  screen: Screen
  setScreen: (s: Screen) => void
  t: typeof T.ms
  alertCount: number
}) {
  const tabs: { id: Screen; label: string; notif?: boolean }[] = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'shelters', label: t.shelters },
    { id: 'aid', label: t.aid },
    { id: 'volunteers', label: t.volunteers },
    { id: 'alerts', label: t.alerts, notif: alertCount > 0 },
    { id: 'map', label: t.map },
  ]
  return (
    <div className="top-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`top-tab${screen === tab.id ? ' active' : ''}`}
          onClick={() => setScreen(tab.id)}
        >
          {tab.label}
          {tab.notif && <span className="tab-notif-dot" />}
        </button>
      ))}
    </div>
  )
}

// ─── Side Navigation (desktop) ───────────────────────────────────────────────

function SideNav({ screen, setScreen, t, theme, setTheme, alertCount }: {
  screen: Screen
  setScreen: (s: Screen) => void
  t: typeof T.ms
  theme: Theme
  setTheme: (t: Theme) => void
  alertCount: number
}) {
  const navItems: { id: Screen; label: string; icon: string; notif?: boolean }[] = [
    { id: 'dashboard', label: t.dashboard, icon: 'home' },
    { id: 'shelters', label: t.shelters, icon: 'shelter' },
    { id: 'aid', label: t.aid, icon: 'package' },
    { id: 'volunteers', label: t.volunteers, icon: 'volunteer' },
    { id: 'alerts', label: t.alerts, icon: 'bell', notif: alertCount > 0 },
    { id: 'map', label: t.map, icon: 'map' },
  ]

  return (
    <nav className="side-nav" aria-label="Main navigation">
      {/* Brand */}
      <div className="side-nav-brand">
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌊</span> {t.appName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 3 }}>{t.appSubtitle}</div>
      </div>

      {/* Nav items */}
      <div className="side-nav-section">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`side-nav-item ${screen === item.id ? 'active' : ''}`}
            onClick={() => setScreen(item.id)}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
            {item.notif && (
              <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#ba1a1a', flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>

      {/* Footer: Settings + theme toggle */}
      <div className="side-nav-footer">
        <button
          className={`side-nav-item ${screen === 'settings' ? 'active' : ''}`}
          onClick={() => setScreen('settings')}
        >
          <Icon name="settings" size={18} />
          {t.settings}
        </button>
        <button className="side-nav-item" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          {theme === 'dark' ? t.lightMode : t.darkMode}
        </button>
      </div>
    </nav>
  )
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen({
  t, shelters, aidRequests, volunteers, setScreen, totalDisplaced, theme,
}: {
  t: typeof T.ms
  shelters: Shelter[]
  aidRequests: AidRequest[]
  volunteers: Volunteer[]
  setScreen: (s: Screen) => void
  totalDisplaced: number
  theme: Theme
}) {
  const activeShelters = shelters.filter(s => s.occupied < s.capacity).length
  const activeVols = volunteers.filter(v => v.status !== 'available').length
  const pendingAid = aidRequests.filter(r => r.status === 'pending').length

  return (
    <div className="screen">
      {/* Flood Status Hero */}
      <div style={{ background: 'linear-gradient(135deg, #00236f 0%, #1e3a8a 100%)', padding: '20px 16px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {t.floodStatus}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>Monsoon Timur<br />2024/25</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="badge badge-danger" style={{ fontSize: 12, padding: '5px 12px', marginBottom: 6 }}>{t.danger}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Tahap Amaran 3</div>
          </div>
        </div>

        {/* Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          {[
            { label: t.displaced, value: totalDisplaced.toLocaleString(), sub: t.residents, color: '#fca5a5' },
            { label: t.activeShelters, value: `${activeShelters}/${shelters.length}`, sub: 'pusat aktif', color: '#86efac' },
            { label: t.volunteerActive, value: `${activeVols}/${volunteers.length}`, sub: 'sedang bertugas', color: '#93c5fd' },
            { label: t.aidRequests, value: `${pendingAid}`, sub: 'menunggu tindak balas', color: '#fcd34d' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rainfall Chart */}
      <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <RainfallChart theme={theme} />
      </div>

      {/* SOS Button */}
      <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <button
          className="btn btn-danger sos-pulse"
          style={{ gap: 10, fontSize: 16, letterSpacing: '0.05em' }}
          onClick={() => alert('SOS Kecemasan dihantar! Pihak berkuasa akan dihubungi.')}
        >
          <Icon name="alert" size={20} />
          {t.sosEmergency}
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.08em', marginBottom: 12 }}>
          {t.quickActions}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: t.reportDisplaced, icon: 'users', color: '#dce1ff', iconColor: '#00236f', action: 'aid' as Screen },
            { label: t.requestAid, icon: 'package', color: '#dcfce7', iconColor: '#006e2d', action: 'aid' as Screen },
            { label: t.coordinateVol, icon: 'volunteer', color: '#fef3c7', iconColor: '#b45309', action: 'volunteers' as Screen },
            { label: t.shareShelter, icon: 'shelter', color: '#fce7f3', iconColor: '#9d174d', action: 'shelters' as Screen },
          ].map(qa => (
            <button
              key={qa.label}
              onClick={() => setScreen(qa.action)}
              style={{
                background: qa.color, border: 'none', borderRadius: 10, padding: '14px 12px',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Icon name={qa.icon} size={22} className="" style={{ color: qa.iconColor }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#191c1e', lineHeight: 1.3 }}>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" style={{ marginTop: 8 }} />

      {/* Recent Shelters */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.08em' }}>
            {t.viewAllShelters.toUpperCase()}
          </div>
          <button
            onClick={() => setScreen('shelters')}
            style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Lihat Semua →
          </button>
        </div>
        {shelters.slice(0, 2).map(s => {
          const pct = Math.round((s.occupied / s.capacity) * 100)
          const isFull = pct >= 100
          return (
            <div key={s.id} className="card" style={{ marginBottom: 10, borderTop: `4px solid ${isFull ? '#ba1a1a' : pct > 75 ? '#b45309' : '#006e2d'}` }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)', flex: 1, paddingRight: 8 }}>{s.name}</div>
                  <span className={`badge ${isFull ? 'badge-danger' : pct > 75 ? 'badge-warning' : 'badge-success'}`}>
                    {isFull ? t.full : `${pct}%`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 10 }}>
                  <Icon name="map_pin" size={13} />{s.location}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: isFull ? '#ba1a1a' : pct > 75 ? '#b45309' : '#006e2d' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 6 }}>
                  <span>{s.occupied} / {s.capacity} {t.occupied}</span>
                  <span style={{ color: s.roadStatus === 'safe' ? '#006e2d' : s.roadStatus === 'caution' ? '#b45309' : '#ba1a1a', fontWeight: 600 }}>
                    🛣 {s.roadStatus === 'safe' ? t.safe : s.roadStatus === 'caution' ? t.caution : t.closed}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="divider" />
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.08em', marginBottom: 12 }}>
          {t.recentActivity}
        </div>
        {aidRequests.slice(0, 3).map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: r.status === 'delivered' ? '#dcfce7' : r.status === 'assigned' ? '#dce1ff' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={r.status === 'delivered' ? 'check_circle' : r.status === 'assigned' ? 'truck' : 'package'} size={18}
                style={{ color: r.status === 'delivered' ? '#006e2d' : r.status === 'assigned' ? '#00236f' : '#b45309' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.kampung} – {r.displaced} orang</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{r.timestamp} · {r.assignedNgo || 'Menunggu NGO'}</div>
            </div>
            <span className={`badge ${r.status === 'delivered' ? 'badge-success' : r.status === 'assigned' ? 'badge-info' : 'badge-warning'}`}>
              {r.status === 'delivered' ? t.delivered : r.status === 'assigned' ? t.assigned : t.pending}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shelters Screen ──────────────────────────────────────────────────────────

function SheltersScreen({ t, shelters, theme }: { t: typeof T.ms; shelters: Shelter[]; theme: Theme }) {
  const [search, setSearch] = useState('')
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null)
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  // Sort by distance when userLoc is set
  const sheltersWithDist = userLoc
    ? [...shelters]
        .map(s => ({ ...s, distKm: haversineKm(userLoc[1], userLoc[0], s.lat, s.lng) }))
        .sort((a, b) => a.distKm - b.distKm)
    : shelters.map(s => ({ ...s, distKm: null as number | null }))

  const nearestId = userLoc
    ? sheltersWithDist.find(s => s.roadStatus !== 'closed' && s.occupied < s.capacity)?.id ?? null
    : null

  const filtered = sheltersWithDist.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  )

  const handleLocate = () => {
    if (!navigator.geolocation) { setLocError('Geolokasi tidak disokong pada peranti ini'); return }
    setLocLoading(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLoc([pos.coords.longitude, pos.coords.latitude]); setLocLoading(false) },
      () => { setLocError('Akses lokasi ditolak atau tamat masa'); setLocLoading(false) },
      { timeout: 10000, enableHighAccuracy: false }
    )
  }

  const handleShare = (s: Shelter) => {
    const pct = Math.round((s.occupied / s.capacity) * 100)
    const text = `🏠 *${s.name}*\n📍 ${s.location}\n👥 Kapasiti: ${s.occupied}/${s.capacity} (${pct}%)\n🛣️ Status Jalan: ${s.roadStatus === 'safe' ? 'SELAMAT' : s.roadStatus === 'caution' ? 'BERHATI-HATI' : 'DITUTUP'}\n📞 ${s.contact}\n\nInfo dari MY Bantu Resilience Hub`
    if (navigator.share) {
      navigator.share({ title: s.name, text })
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Maklumat disalin ke clipboard!'))
    }
  }

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Pusat Pemindahan</div>
          <button
            onClick={handleLocate}
            disabled={locLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 20,
              border: `1.5px solid ${userLoc ? 'var(--primary)' : 'var(--outline-variant)'}`,
              background: userLoc ? 'var(--primary)' : 'transparent',
              color: userLoc ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              fontSize: 12, fontWeight: 600, cursor: locLoading ? 'wait' : 'pointer',
              fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            }}
          >
            {locLoading ? '⌛' : '📍'}
            {locLoading ? 'Mencari...' : userLoc ? 'Lokasi Aktif' : 'Cari Terdekat'}
          </button>
        </div>
        <input
          className="input-field"
          style={{ height: 44 }}
          placeholder={t.searchLocation}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {locError && (
          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6 }}>{locError}</div>
        )}
      </div>

      {/* Live mini-map */}
      <div style={{ position: 'relative' }}>
        <MapView shelters={shelters} aidRequests={[]} mini theme={theme} userLocation={userLoc} />
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: '4px 12px', color: 'white', fontSize: 12, fontWeight: 700, pointerEvents: 'none' }}>
          {shelters.length} Pusat Aktif
        </div>
      </div>

      <div className="shelter-grid" style={{ padding: '12px 16px' }}>
        {filtered.map(s => {
          const pct = Math.round((s.occupied / s.capacity) * 100)
          const isFull = pct >= 100
          const isNearest = s.id === nearestId
          const statusColor = s.roadStatus === 'safe' ? 'var(--success)' : s.roadStatus === 'caution' ? 'var(--warning)' : 'var(--danger)'
          const topColor = isFull ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)'
          return (
            <div
              key={s.id}
              className="card"
              style={{
                marginBottom: 12,
                borderTop: `4px solid ${topColor}`,
                cursor: 'pointer',
                boxShadow: isNearest ? '0 0 0 2px var(--primary)' : undefined,
              }}
              onClick={() => setSelectedShelter(s)}
            >
              <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                    {isNearest && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', marginTop: 2, letterSpacing: '0.05em' }}>
                        📍 TERDEKAT
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {s.distKm !== null && (
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {s.distKm < 1 ? `${Math.round(s.distKm * 1000)} m` : `${s.distKm.toFixed(1)} km`}
                      </span>
                    )}
                    <span className={`badge ${isFull ? 'badge-danger' : pct > 75 ? 'badge-warning' : 'badge-success'}`}>
                      {isFull ? t.full : `${pct}%`}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 12 }}>
                  <Icon name="map_pin" size={13} />{s.location}
                </div>
                <div className="progress-bar" style={{ marginBottom: 6 }}>
                  <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: topColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                  <span>{s.occupied} / {s.capacity} {t.occupied}</span>
                  <span style={{ color: statusColor, fontWeight: 700 }}>
                    {s.roadStatus === 'safe' ? '✅' : s.roadStatus === 'caution' ? '⚠️' : '🚫'} {s.roadStatus === 'safe' ? t.safe : s.roadStatus === 'caution' ? t.caution : t.closed}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {s.facilities.map(f => (
                    <span key={f} className="badge badge-gray" style={{ fontSize: 11 }}>{f}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); handleShare(s) }}>
                    <Icon name="share" size={14} /> {t.shareInfo}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); alert(`📞 ${s.contact}`) }}
                  >
                    <Icon name="phone" size={14} /> {t.contact}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedShelter && (
        <div className="modal-overlay" onClick={() => setSelectedShelter(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>{selectedShelter.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 16 }}>
              <Icon name="map_pin" size={14} />{selectedShelter.location}
            </div>
            {[
              { label: 'Kapasiti', value: `${selectedShelter.capacity} orang` },
              { label: 'Penghuni Semasa', value: `${selectedShelter.occupied} orang` },
              { label: 'Status Jalan', value: selectedShelter.roadStatus === 'safe' ? '✅ Selamat' : selectedShelter.roadStatus === 'caution' ? '⚠️ Berhati-hati' : '🚫 Ditutup' },
              { label: 'Hubungi', value: selectedShelter.contact },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 8 }}>KEMUDAHAN</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedShelter.facilities.map(f => <span key={f} className="badge badge-info">{f}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleShare(selectedShelter)}>
                <Icon name="share" size={16} /> Kongsi Maklumat
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedShelter(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Aid Request Screen ───────────────────────────────────────────────────────

const AID_ITEMS = [
  'Air mineral', 'Makanan kering', 'Makanan masak', 'Susu formula', 'Lampin bayi',
  'Pakaian dewasa', 'Pakaian kanak-kanak', 'Ubat-ubatan', 'Selimut', 'Peralatan kebersihan',
  'Peralatan tidur', 'Charger & bateri', 'Buku & alat tulis', 'Lain-lain',
]

function AidScreen({ t, aidRequests, setAidRequests, totalDisplaced, setTotalDisplaced, theme }: {
  t: typeof T.ms
  aidRequests: AidRequest[]
  setAidRequests: (r: AidRequest[]) => void
  totalDisplaced: number
  setTotalDisplaced: (n: number) => void
  theme: Theme
}) {
  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ kampung: '', displaced: '', selectedItems: [] as string[], notes: '' })

  const toggleItem = (item: string) => {
    setForm(f => ({
      ...f,
      selectedItems: f.selectedItems.includes(item)
        ? f.selectedItems.filter(i => i !== item)
        : [...f.selectedItems, item],
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    const newReq: AidRequest = {
      id: `a${Date.now()}`,
      kampung: form.kampung || 'Kawasan Tidak Diketahui',
      displaced: parseInt(form.displaced) || 0,
      items: form.selectedItems,
      status: 'pending',
      timestamp: 'Baru sahaja',
      priority: parseInt(form.displaced) > 30 ? 'high' : 'medium',
    }
    setAidRequests([newReq, ...aidRequests])
    setTotalDisplaced(totalDisplaced + (parseInt(form.displaced) || 0))
    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setStep(1)
    setSubmitted(false)
    setForm({ kampung: '', displaced: '', selectedItems: [], notes: '' })
  }

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>Papan Permohonan Bantuan</div>
        <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Keperluan komuniti masa nyata di sekitar anda.</div>
      </div>

      {/* Live mini-map */}
      <div style={{ position: 'relative' }}>
        <MapView shelters={[]} aidRequests={aidRequests} mini theme={theme} />
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(186,26,26,0.85)', borderRadius: 20, padding: '4px 12px', color: 'white', fontSize: 12, fontWeight: 700, pointerEvents: 'none' }}>
          {aidRequests.filter(r => r.status !== 'delivered').length} {t.activeRequests}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ padding: '12px 16px', background: 'var(--surface)', display: 'flex', gap: 12, borderBottom: '1px solid var(--outline-variant)' }}>
        {[
          { label: 'Menunggu', val: aidRequests.filter(r => r.status === 'pending').length, color: '#b45309', bg: '#fef3c7' },
          { label: 'Ditugaskan', val: aidRequests.filter(r => r.status === 'assigned').length, color: '#00236f', bg: '#dce1ff' },
          { label: 'Dihantar', val: aidRequests.filter(r => r.status === 'delivered').length, color: '#006e2d', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', background: s.bg, borderRadius: 8, padding: '8px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {aidRequests.map(r => (
          <div key={r.id} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${r.priority === 'high' ? '#ba1a1a' : r.priority === 'medium' ? '#b45309' : '#006e2d'}` }}>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <span className={`badge ${r.status === 'delivered' ? 'badge-success' : r.status === 'assigned' ? 'badge-info' : 'badge-warning'}`} style={{ marginRight: 6 }}>
                    {r.status === 'delivered' ? t.delivered : r.status === 'assigned' ? t.assigned : t.pending}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    <Icon name="map_pin" size={11} style={{ display: 'inline' }} /> {r.kampung}
                  </span>
                </div>
                {r.priority === 'high' && <span className="badge badge-danger">{t.highPriority}</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
                👥 {r.displaced} {t.residents}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {r.items.map(i => <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>{i}</span>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  {r.assignedNgo ? (
                    <span>NGO: <strong style={{ color: 'var(--secondary)' }}>{r.assignedNgo}</strong></span>
                  ) : 'Menunggu NGO...'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{r.timestamp}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="fab fab-wide" onClick={() => setShowForm(true)}>
        <Icon name="plus" size={20} /> {t.newRequest}
      </button>

      {/* Request Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={submitted ? resetForm : undefined}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '95dvh' }}>
            <div className="modal-handle" />

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>{t.submitted}</div>
                <div style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 28, lineHeight: 1.5 }}>{t.submittedDesc}</div>
                <button className="btn btn-primary" onClick={resetForm}>{t.viewBoard}</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Minta Bantuan</div>
                  <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                    <Icon name="x_circle" size={22} />
                  </button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                  {t.step} {step} {t.of} 3
                </div>
                <div className="step-dots">
                  {[1, 2, 3].map(n => <div key={n} className={`step-dot ${step === n ? 'active' : ''}`} />)}
                </div>

                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="label">{t.kampungName}</label>
                      <input className="input-field" placeholder={t.kampungPlaceholder} value={form.kampung} onChange={e => setForm(f => ({ ...f, kampung: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">{t.displacedCount}</label>
                      <input className="input-field" type="number" inputMode="numeric" placeholder={t.displacedPlaceholder} value={form.displaced} onChange={e => setForm(f => ({ ...f, displaced: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!form.kampung}>
                      {t.next}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{t.aidItems}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {AID_ITEMS.map(item => {
                        const selected = form.selectedItems.includes(item)
                        return (
                          <button
                            key={item}
                            onClick={() => toggleItem(item)}
                            style={{
                              padding: '10px 12px', borderRadius: 6, border: `2px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                              background: selected ? '#dce1ff' : 'var(--surface)', fontSize: 13, fontWeight: selected ? 600 : 400,
                              color: selected ? 'var(--primary)' : 'var(--on-surface)', cursor: 'pointer', textAlign: 'left',
                              display: 'flex', alignItems: 'center', gap: 6,
                            }}
                          >
                            {selected && <Icon name="check" size={14} />}
                            {item}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>{t.back}</button>
                      <button className="btn btn-primary" onClick={() => setStep(3)} disabled={form.selectedItems.length === 0} style={{ flex: 2 }}>{t.next}</button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label className="label">{t.additionalNotes}</label>
                      <textarea className="input-field" placeholder={t.notesPlaceholder} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                    <div className="card" style={{ padding: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: 8, letterSpacing: '0.05em' }}>RINGKASAN PERMOHONAN</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
                        <div>📍 <strong>{form.kampung}</strong></div>
                        <div>👥 <strong>{form.displaced}</strong> orang terlantar</div>
                        <div>📦 {form.selectedItems.join(', ')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>{t.back}</button>
                      <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ flex: 2 }}>
                        {submitting ? t.submitting : t.submit}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Volunteers Screen ────────────────────────────────────────────────────────

function VolunteersScreen({ t, volunteers, setVolunteers }: {
  t: typeof T.ms
  volunteers: Volunteer[]
  setVolunteers: (v: Volunteer[]) => void
}) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [assignModal, setAssignModal] = useState<{ vol: Volunteer } | null>(null)
  const [claimedTaskIds, setClaimedTaskIds] = useState<string[]>([])
  const [detailTask, setDetailTask] = useState<typeof urgentTasks[0] | null>(null)

  const activeVols = volunteers.filter(v => v.status !== 'available')

  const urgentTasks = [
    { id: 't1', title: 'Pengedaran Makanan – Pusat Klang', location: 'SK Klang, Klang', volunteers: 5, needed: 5, priority: true, image: '🥘' },
    { id: 't2', title: 'Sokongan Am – Logistik', location: 'Dewan Rakyat Hulu Langat', volunteers: 2, needed: 4, priority: false, image: '📦' },
  ]

  const handleAssign = (vol: Volunteer, point: string) => {
    setVolunteers(volunteers.map(v => v.id === vol.id ? { ...v, assignedTo: point, status: 'assigned' } : v))
    setAssignModal(null)
  }

  const handleClaimTask = (taskId: string) => {
    setClaimedTaskIds(prev => prev.includes(taskId) ? prev : [...prev, taskId])
  }

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>Tugas Sukarelawan</div>
        <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Tuntut tugas mendesak untuk menyokong operasi banjir.</div>
      </div>

      {/* My Task */}
      <div style={{ padding: '14px 16px', background: '#dce1ff', borderBottom: '1px solid #b6c4ff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#00164e', letterSpacing: '0.08em', marginBottom: 8 }}>{t.yourTask}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#00236f' }}>Pengedaran Makanan</div>
            <div style={{ fontSize: 12, color: '#264191', marginTop: 2 }}>
              <Icon name="map_pin" size={11} style={{ display: 'inline' }} /> SK Klang, Community Hall A
            </div>
          </div>
          <span className="badge badge-success">{t.taskClaimed}</span>
        </div>
        <button
          onClick={() => setCheckedIn(c => !c)}
          style={{
            width: '100%', height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
            background: checkedIn ? '#006e2d' : '#00236f', color: 'white', fontWeight: 700,
            fontSize: 13, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Icon name={checkedIn ? 'check' : 'navigation'} size={16} />
          {checkedIn ? '✓ TELAH DAFTAR MASUK' : t.slideCheckIn}
        </button>
      </div>

      {/* Distribution Coordination */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.08em' }}>{t.distributionCoord}</div>
          <span className="badge badge-success">{activeVols.length}/10 {t.volunteers}</span>
        </div>

        {/* Priority task with volunteer slots */}
        <div className="card" style={{ marginBottom: 14, borderTop: '4px solid #ba1a1a' }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="badge badge-danger">{t.highPriority}</span>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{activeVols.length}/10 Sukarelawan</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>Agihan Kit Banjir</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 12 }}>Pusat Pengagihan A, Dewan Komuniti</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {volunteers.map((v, i) => (
                <div key={v.id} className={`volunteer-slot ${v.assignedTo ? 'filled' : ''}`} onClick={() => !v.assignedTo && setAssignModal({ vol: v })}>
                  {v.assignedTo ? (
                    <>
                      <div className="avatar" style={{ background: ['#00236f','#006e2d','#b45309','#9d174d','#1e40af'][i % 5] }}>
                        {v.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{v.skill} · {v.assignedTo?.split(' – ')[0]}</div>
                      </div>
                      <Icon name="check_circle" size={18} style={{ color: 'var(--secondary)' }} />
                    </>
                  ) : (
                    <>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="plus" size={18} style={{ color: 'var(--outline)' }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--outline)', flex: 1 }}>Slot Kosong – Ketik untuk Tugaskan</span>
                      <Icon name="plus" size={18} style={{ color: 'var(--outline)' }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => alert('Membuka panel koordinasi agihan. Sila gunakan sistem koordinasi lapangan untuk mengurus penugasan sukarelawan.')}>
              <Icon name="navigation" size={16} /> Urus Koordinasi
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Tasks */}
      <div className="divider" />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.08em', marginBottom: 12 }}>{t.urgentTasks}</div>
        {urgentTasks.map(task => (
          <div key={task.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ height: 100, background: 'linear-gradient(135deg, #1a3a5e, #2d5f8e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              {task.image}
            </div>
            <div style={{ padding: '12px 14px' }}>
              {task.priority && <span className="badge badge-danger" style={{ marginBottom: 6, display: 'inline-block' }}>{t.highPriority}</span>}
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{task.title}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 10 }}>
                <Icon name="map_pin" size={13} style={{ display: 'inline' }} /> {task.location}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {claimedTaskIds.includes(task.id) ? (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
                    <Icon name="check_circle" size={14} /> {t.taskClaimed}
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleClaimTask(task.id)}>
                    <Icon name="check" size={14} /> {t.claimTask}
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => setDetailTask(task)}>
                  {t.details}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Map */}
      <div style={{ padding: '0 16px 16px' }}>
        <div className="card map-bg" style={{ height: 120, display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
          <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '8px 14px', color: 'white', width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="map" size={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.taskMap}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{t.findNearest}</div>
            </div>
          </div>
        </div>
      </div>

      {detailTask && (
        <div className="modal-overlay" onClick={() => setDetailTask(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>{detailTask.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 16 }}>
              <Icon name="map_pin" size={14} />{detailTask.location}
            </div>
            {[
              { label: 'Sukarelawan Diperlukan', value: `${detailTask.needed} orang` },
              { label: 'Sukarelawan Ditugaskan', value: `${detailTask.volunteers} orang` },
              { label: 'Keutamaan', value: detailTask.priority ? '🔴 Tinggi' : '🟡 Sederhana' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' }}>
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {!claimedTaskIds.includes(detailTask.id) ? (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { handleClaimTask(detailTask.id); setDetailTask(null) }}>
                  <Icon name="check" size={16} /> {t.claimTask}
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ flex: 1 }} disabled>
                  <Icon name="check_circle" size={16} /> {t.taskClaimed}
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={() => setDetailTask(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>
              Tugaskan Titik Agihan
            </div>
            <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
              Pilih titik agihan untuk <strong>{assignModal.vol.name}</strong>:
            </div>
            {distributionPoints.map(pt => (
              <button
                key={pt}
                onClick={() => handleAssign(assignModal.vol, pt)}
                style={{
                  width: '100%', padding: '14px 16px', marginBottom: 8, borderRadius: 8,
                  border: '1.5px solid var(--outline-variant)', background: 'var(--surface)',
                  color: 'var(--on-surface)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Icon name="map_pin" size={16} style={{ color: 'var(--primary)' }} />
                {pt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Alerts Screen ────────────────────────────────────────────────────────────

function AlertsScreen({ t, alerts }: { t: typeof T.ms; alerts: AlertItem[] }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'warning' | 'misinformation'>('all')
  const [liveAlerts, setLiveAlerts] = useState<AlertItem[]>([])
  const [isLive, setIsLive] = useState(false)
  const [fetchingLive, setFetchingLive] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch real MetMalaysia warnings from data.gov.my
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    fetch('https://api.data.gov.my/weather/warning', { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('bad'); return r.json() })
      .then(raw => {
        const items: any[] = Array.isArray(raw) ? raw : raw.data ?? raw.results ?? []
        if (items.length === 0) throw new Error('empty')
        const mapped: AlertItem[] = items.slice(0, 6).map((item: any, i: number) => ({
          id: `gov-${i}`,
          type: 'warning' as const,
          title: item.title_ms ?? item.title ?? item.warning_title ?? 'Amaran Cuaca',
          content: item.text_ms ?? item.description ?? item.warning_desc ?? 'Sila berhati-hati.',
          source: 'MetMalaysia · data.gov.my',
          timestamp: formatGovDate(item.date_start ?? item.issued_date ?? item.date),
          shared: 0,
        }))
        setLiveAlerts(mapped)
        setIsLive(true)
      })
      .catch(() => { /* silently fall back to mock */ })
      .finally(() => { clearTimeout(timeout); setFetchingLive(false) })

    return () => { controller.abort(); clearTimeout(timeout) }
  }, [])

  const handleShare = (alert: AlertItem) => {
    const prefix = alert.type === 'verified' ? '✅ DISAHKAN' : alert.type === 'misinformation' ? '❌ MAKLUMAT PALSU' : '⚠️ AMARAN'
    const text = `${prefix}\n\n*${alert.title}*\n\n${alert.content}\n\nSumber: ${alert.source}\n\n— MY Bantu Resilience Hub`
    if (navigator.share) {
      navigator.share({ title: alert.title, text })
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(alert.id)
        setTimeout(() => setCopiedId(null), 2000)
      })
    }
  }

  const filterOptions: { key: 'all' | 'verified' | 'warning' | 'misinformation'; label: string; color: string }[] = [
    { key: 'all', label: 'Semua', color: 'var(--primary)' },
    { key: 'verified', label: '✅ Disahkan', color: 'var(--success)' },
    { key: 'warning', label: '⚠️ Amaran', color: 'var(--warning)' },
    { key: 'misinformation', label: '❌ Palsu', color: 'var(--danger)' },
  ]

  // Live alerts first, then mock
  const allAlerts = [...liveAlerts, ...alerts]
  const displayedAlerts = activeFilter === 'all' ? allAlerts : allAlerts.filter(a => a.type === activeFilter)

  const typeConfig = {
    verified: { color: 'var(--success)', bgRgba: 'rgba(74,222,128,0.15)', label: t.verified, icon: 'check_circle', badgeHex: '#16a34a' },
    warning: { color: 'var(--warning)', bgRgba: 'rgba(251,146,60,0.15)', label: t.warning, icon: 'alert', badgeHex: '#d97706' },
    misinformation: { color: 'var(--danger)', bgRgba: 'rgba(248,113,113,0.15)', label: t.misinformation, icon: 'x_circle', badgeHex: '#dc2626' },
  }

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>Suapan Amaran</div>
          <span className={`badge ${isLive ? 'badge-success' : 'badge-gray'}`} style={{ fontSize: 9, marginTop: 4, flexShrink: 0 }}>
            {fetchingLive ? '⌛ Memuatkan' : isLive ? '● LANGSUNG' : 'SIMULASI'}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
          {isLive ? `${liveAlerts.length} amaran langsung · MetMalaysia` : 'Maklumat disahkan dari sumber rasmi.'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', overflowX: 'auto' }}>
        {filterOptions.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20,
              border: `1.5px solid ${f.color}`,
              background: activeFilter === f.key ? f.color : 'transparent',
              color: activeFilter === f.key ? 'white' : f.color,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {f.label}
            <span style={{ background: activeFilter === f.key ? 'rgba(255,255,255,0.3)' : f.color, color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
              {f.key === 'all' ? alerts.length : alerts.filter(a => a.type === f.key).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {displayedAlerts.map(alertItem => {
          const cfg = typeConfig[alertItem.type]
          return (
            <div key={alertItem.id} className="mymet-alert-card">
              {/* Header row: icon + title + share button */}
              <div className="mymet-alert-header">
                <div className="mymet-icon-circle" style={{ background: cfg.bgRgba }}>
                  <Icon name={cfg.icon} size={20} style={{ color: cfg.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mymet-alert-title">{alertItem.title}</div>
                  <div className="mymet-alert-issued">Dikeluarkan: {alertItem.timestamp}</div>
                </div>
                <button
                  className="mymet-share-btn"
                  onClick={() => handleShare(alertItem)}
                  aria-label="Share"
                  title={copiedId === alertItem.id ? 'Disalin!' : 'Kongsi'}
                  style={{ color: copiedId === alertItem.id ? 'var(--success)' : undefined }}
                >
                  <Icon name={copiedId === alertItem.id ? 'check' : 'share'} size={16} />
                </button>
              </div>

              {/* Notice strip: badge + time + content + source */}
              <div className="mymet-notice-strip" style={{ borderLeftColor: cfg.color }}>
                <div className="mymet-notice-meta">
                  <span className="mymet-notice-label" style={{ background: cfg.badgeHex }}>
                    {cfg.label}
                  </span>
                  <span className="mymet-notice-time">{alertItem.timestamp}</span>
                </div>
                <p className="mymet-notice-content">{alertItem.content}</p>
                <div className="mymet-notice-footer">
                  <span className="mymet-notice-source">
                    Sumber: {alertItem.source} · {alertItem.shared} dikongsi
                  </span>
                  {alertItem.type !== 'verified' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0 }}
                      onClick={() => {
                        if (alertItem.type === 'misinformation') window.open('https://sebenarnya.my', '_blank')
                        else window.open('https://www.met.gov.my', '_blank')
                      }}
                    >
                      <Icon name="info" size={13} /> Semak
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({ t, theme, setTheme, lang, setLang, isOffline, setIsOffline, lowData, setLowData, autoSync, setAutoSync }: {
  t: typeof T.ms
  theme: Theme
  setTheme: (t: Theme) => void
  lang: Lang
  setLang: (l: Lang) => void
  isOffline: boolean
  setIsOffline: (v: boolean) => void
  lowData: boolean
  setLowData: (v: boolean) => void
  autoSync: boolean
  setAutoSync: (v: boolean) => void
}) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: '0.1em', padding: '14px 16px 8px' }}>{title}</div>
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
        {children}
      </div>
    </div>
  )

  const Row = ({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
      <div>
        <div style={{ fontSize: 16, color: 'var(--on-surface)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  return (
    <div className="screen">
      <div style={{ padding: '14px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>Tetapan</div>
      </div>

      {/* Profile */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', marginBottom: 8 }}>
        <div className="avatar" style={{ width: 56, height: 56, background: '#00236f', fontSize: 20 }}>KK</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Ketua Kampung</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Kg. Sentosa, Pahang</div>
          <div className="badge badge-success" style={{ marginTop: 4 }}>Penyelaras Komuniti</div>
        </div>
      </div>

      <Section title={t.language}>
        {[{ code: 'ms' as Lang, label: 'Bahasa Malaysia' }, { code: 'en' as Lang, label: 'English' }].map(l => (
          <div
            key={l.code}
            className="list-item"
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            onClick={() => setLang(l.code)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <span style={{ fontSize: 16, fontWeight: lang === l.code ? 600 : 400 }}>{l.label}</span>
            </div>
            {lang === l.code && <Icon name="check" size={20} style={{ color: 'var(--primary)' }} />}
          </div>
        ))}
      </Section>

      <Section title={t.displayMode}>
        <Row label={t.darkMode} sub={theme === 'dark' ? 'Mod gelap aktif' : 'Mod cerah aktif'}>
          <label className="toggle">
            <input type="checkbox" checked={theme === 'dark'} onChange={e => setTheme(e.target.checked ? 'dark' : 'light')} />
            <span className="toggle-slider" />
          </label>
        </Row>
      </Section>

      <Section title={t.connectivity}>
        <Row label={t.lowDataMode} sub="Kurangkan penggunaan data dalam kawasan capaian lemah">
          <label className="toggle">
            <input type="checkbox" checked={lowData} onChange={e => setLowData(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
        <Row label={t.autoSync} sub="Segerak data apabila sambungan dipulihkan">
          <label className="toggle">
            <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
        <Row label="Simulasi Mod Luar Talian" sub="Aktifkan untuk menguji ciri offline">
          <label className="toggle">
            <input type="checkbox" checked={isOffline} onChange={e => setIsOffline(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
      </Section>

      <Section title="MAKLUMAT APLIKASI">
        <Row label={t.appVersion}>
          <span style={{ fontSize: 14, color: 'var(--outline)' }}>v2.1.4 (Build 241)</span>
        </Row>
        <div className="list-item" style={{ cursor: 'pointer', justifyContent: 'space-between' }} onClick={() => alert('Cache dikosongkan!')}>
          <span style={{ fontSize: 16, color: '#ba1a1a' }}>{t.clearCache}</span>
          <Icon name="refresh" size={18} style={{ color: '#ba1a1a' }} />
        </div>
      </Section>

      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--outline)', fontSize: 12, lineHeight: 1.6 }}>
        MY Bantu – Pusat Ketahanan Banjir Komuniti<br />
        Dibangunkan untuk komuniti Malaysia<br />
        Bekerjasama dengan NADMA, Mercy Malaysia & JBPM
      </div>
    </div>
  )
}

// ─── Map Screen ───────────────────────────────────────────────────────────────

function MapScreen({ t, shelters, aidRequests, theme }: {
  t: typeof T.ms
  shelters: Shelter[]
  aidRequests: AidRequest[]
  theme: Theme
}) {
  return (
    <div className="screen map-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
          {t.map} Risiko Banjir
        </div>
        <div style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{t.mapSubtitle}</div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapView shelters={shelters} aidRequests={aidRequests} theme={theme} />
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [theme, setTheme] = useState<Theme>('dark')
  const [lang, setLang] = useState<Lang>('ms')
  const [isOffline, setIsOffline] = useState(false)
  const [lowData, setLowData] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [shelters] = useState(initialShelters)
  const [aidRequests, setAidRequests] = useState(initialAidRequests)
  const [volunteers, setVolunteers] = useState(initialVolunteers)
  const [alerts] = useState(initialAlerts)
  const [totalDisplaced, setTotalDisplaced] = useState(50)

  const t = T[lang]

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const pendingAlerts = alerts.filter(a => a.type === 'warning' || a.type === 'misinformation').length

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <DashboardScreen t={t} shelters={shelters} aidRequests={aidRequests} volunteers={volunteers} setScreen={setScreen} totalDisplaced={totalDisplaced} theme={theme} />
      case 'shelters':
        return <SheltersScreen t={t} shelters={shelters} theme={theme} />
      case 'aid':
        return <AidScreen t={t} aidRequests={aidRequests} setAidRequests={setAidRequests} totalDisplaced={totalDisplaced} setTotalDisplaced={setTotalDisplaced} theme={theme} />
      case 'volunteers':
        return <VolunteersScreen t={t} volunteers={volunteers} setVolunteers={setVolunteers} />
      case 'alerts':
        return <AlertsScreen t={t} alerts={alerts} />
      case 'map':
        return <MapScreen t={t} shelters={shelters} aidRequests={aidRequests} theme={theme} />
      case 'settings':
        return <SettingsScreen t={t} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} isOffline={isOffline} setIsOffline={setIsOffline} lowData={lowData} setLowData={setLowData} autoSync={autoSync} setAutoSync={setAutoSync} />
      default:
        return null
    }
  }

  return (
    <div className="app-shell">
      {/* Mobile/tablet: top bar + top tabs (hidden on desktop — SideNav takes over) */}
      <AppTopBar
        isOffline={isOffline}
        t={t}
        theme={theme}
        setTheme={setTheme}
        setScreen={setScreen}
        screen={screen}
      />
      <AppTopTabs screen={screen} setScreen={setScreen} t={t} alertCount={pendingAlerts} />

      {/* app-body: column on mobile, row on desktop */}
      <div className="app-body">
        <SideNav
          screen={screen}
          setScreen={setScreen}
          t={t}
          theme={theme}
          setTheme={setTheme}
          alertCount={pendingAlerts}
        />
        {renderScreen()}
      </div>
    </div>
  )
}
