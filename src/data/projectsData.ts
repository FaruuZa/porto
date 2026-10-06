export interface ProjectDetail {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  type: string;
  category: 'Full-Stack Ecosystem' | 'Web & Mobile App' | 'Desktop POS Application' | 'Interactive Web' | 'System Architecture';
  quote: string;
  flavorQuote?: string;
  description: string;
  techStack: string[];
  features: string[];
  stats: { label: string; value: string }[];
  links?: {
    demo?: string;
    github?: string;
    docs?: string;
  };
  featured: boolean;
  year?: string;
  badge?: string;
}

/**
 * Clean separated project data structure prepared for CMS integration / headless API endpoints.
 */
export const PROJECTS_DATA: ProjectDetail[] = [
  {
    id: "qlinica",
    slug: "qlinica-clinical-erp-attendance",
    title: "Qlinica — Clinical ERP & Digital Attendance Ecosystem",
    tagline: "Integrated Web & Mobile Clinical Management with Real-time Sync",
    type: "Full-Stack Ecosystem",
    category: "Full-Stack Ecosystem",
    quote: "\"A lifeline between medical staff and patients. It feels sturdy and dependable.\"",
    flavorQuote: "\"A lifeline between medical staff and patients. It feels sturdy and dependable.\"",
    description: "Ekosistem manajemen klinik terpadu berbasis web yang tersinkronisasi langsung dengan aplikasi presensi mobile. Mengotomatisasi alur pendaftaran pasien rawat jalan, sistem antrean terpusat, jadwal dokter spesialis, serta inventaris modul apotek dan resep obat.",
    techStack: ["Laravel", "Flutter", "PostgreSQL", "REST API", "Tailwind CSS"],
    features: [
      "Pendaftaran Pasien Online & Antrean Terpusat",
      "Sinkronisasi Presensi Karyawan & Medis Mobile",
      "Jadwal Dokter Dinamis & Manajemen Janji Temu",
      "Modul Apotek & Kontrol Stok Obat Terintegrasi"
    ],
    stats: [
      { label: "Sync Latency", value: "< 250ms" },
      { label: "Architecture", value: "RESTful + Relational" },
      { label: "Target", value: "Web & Android" }
    ],
    links: {
      github: "https://github.com/faza/qlinica-clinical-erp",
      demo: "https://qlinica.demo.app"
    },
    featured: true,
    year: "2024",
    badge: "FEATURED"
  },
  {
    id: "rahmat-bakery",
    slug: "rahmat-bakery-multichannel-commerce",
    title: "RahmatBakery — Multi-Channel Ordering Platform",
    tagline: "Synchronized Web & Mobile Retail Commerce",
    type: "Web & Mobile App",
    category: "Web & Mobile App",
    quote: "\"Freshly baked code. Warms the inventory and eases transactions.\"",
    flavorQuote: "\"Freshly baked code. Warms the inventory and eases transactions.\"",
    description: "Platform pemesanan toko kue multi-platform (web & mobile). Memungkinkan pelanggan memilih katalog dan melakukan reservasi transaksi pesanan, sementara pemilik toko memantau dashboard status order dan laporan penjualan secara berkala.",
    techStack: ["PHP", "Kotlin", "PostgreSQL", "Android SDK"],
    features: [
      "Katalog Produk & Keranjang Pesanan Interaktif",
      "Aplikasi Android Native Pelanggan dengan Kotlin",
      "Dashboard Admin Manajemen Status Pesanan",
      "Skema Relasional Database Multi-Table PostgreSQL"
    ],
    stats: [
      { label: "Platform", value: "Web & Mobile" },
      { label: "DB Engine", value: "PostgreSQL" },
      { label: "Integration", value: "API Backend" }
    ],
    links: {
      github: "https://github.com/faza/rahmat-bakery-system"
    },
    featured: true,
    year: "2024",
    badge: "MOBILE & WEB"
  },
  {
    id: "kitchen-shell",
    slug: "kitchenshell-pos-barcode-checkout",
    title: "KitchenShell POS — Desktop Barcode Checkout",
    tagline: "High-Speed Desktop Point of Sale & Inventory Tracker",
    type: "Desktop POS Application",
    category: "Desktop POS Application",
    quote: "\"An automated register with instant barcode recognition. No more manual mistakes.\"",
    flavorQuote: "\"An automated register with instant barcode recognition. No more manual mistakes.\"",
    description: "Aplikasi desktop kasir Point of Sale (POS) cepat yang dilengkapi integrasi pemindaian kartu barcode untuk mempercepat proses antrean kasir serta otomasi pencatatan inventaris barang berbasis basis data MySQL.",
    techStack: ["Java", "MySQL", "Java Swing / Desktop", "Barcode Scanner Driver"],
    features: [
      "Pemindaian Kartu Barcode Kasir Instan",
      "Kalkulasi Transaksi Cepat & Struk Penjualan",
      "Manajemen Stok Barang & Peringatan Stok Rendah",
      "Laporan Rekapitulasi Kasir Harian"
    ],
    stats: [
      { label: "Speed", value: "Instant Barcode Scan" },
      { label: "Target", value: "Desktop Environment" },
      { label: "Storage", value: "MySQL Relational" }
    ],
    links: {
      github: "https://github.com/faza/kitchenshell-pos"
    },
    featured: true,
    year: "2023",
    badge: "DESKTOP ENGINE"
  },
  {
    id: "omori-engine",
    slug: "omori-white-space-interactive-portfolio",
    title: "White Space Portfolio Engine & Soundscape",
    tagline: "Atmospheric Psychological RPG Web Interface",
    type: "Interactive Web",
    category: "Interactive Web",
    quote: "\"A monochrome safe haven. Waiting for something to happen?\"",
    flavorQuote: "\"A monochrome safe haven. Waiting for something to happen?\"",
    description: "Sistem antarmuka portofolio bertema Omori White Space & Black Space dengan Web Audio API Procedural Synthesizer, physical pendulum physics, keyboard arcade navigation, dan dynamic aesthetic glitch system.",
    techStack: ["React 18", "TypeScript", "Tailwind CSS", "Web Audio API", "Vite"],
    features: [
      "Web Audio API Synthesizer (Zero-Asset Click & Horror Drones)",
      "Interactive Ceiling Pendulum Physics Simulator",
      "Arcade WASD Keyboard Navigation & Snapping",
      "Black Space Psychological Glitch Mode"
    ],
    stats: [
      { label: "Sound", value: "Procedural Web Audio" },
      { label: "Control", value: "WASD + Touch" },
      { label: "Framework", value: "React + TS" }
    ],
    links: {
      github: "https://github.com/faza/omori-portfolio-engine",
      demo: "#"
    },
    featured: true,
    year: "2024",
    badge: "AUDIO & ENGINE"
  },
  {
    id: "eduquest-lms",
    slug: "eduquest-gamified-learning-portal",
    title: "EduQuest — Gamified Student Evaluation Portal",
    tagline: "Progressive Web Application for Academic Milestones",
    type: "Full-Stack Ecosystem",
    category: "Full-Stack Ecosystem",
    quote: "\"Level up your learning. Quests, badges, and real-time grading.\"",
    flavorQuote: "\"Level up your learning. Quests, badges, and real-time grading.\"",
    description: "Sistem manajemen pembelajaran (LMS) berbasis gamifikasi untuk meningkatkan keterlibatan mahasiswa dalam pengumpulan tugas, kuis interaktif berbatas waktu, dan pemantauan capaian nilai otomatis.",
    techStack: ["Laravel", "Vue.js", "MySQL", "Chart.js"],
    features: [
      "Sistem Gamifikasi Poin & Milestone Akademik",
      "Auto-Grading Kuis & Tugas Berbatas Waktu",
      "Visualisasi Statistik Nilai Mahasiswa",
      "Export Rekap Nilai ke Excel & PDF"
    ],
    stats: [
      { label: "Role", value: "Admin & Mahasiswa" },
      { label: "DB", value: "MySQL" },
      { label: "Stack", value: "Laravel + Vue" }
    ],
    links: {
      github: "https://github.com/faza/eduquest-lms"
    },
    featured: false,
    year: "2023",
    badge: "ACADEMIC"
  },
  {
    id: "arsip-digital",
    slug: "arsip-digital-surat-dokumen",
    title: "E-Arsip — Document Archiving & Disposition",
    tagline: "High Security Document Management & Tracking",
    type: "System Architecture",
    category: "System Architecture",
    quote: "\"No document lost to the void. Organized and indexed.\"",
    flavorQuote: "\"No document lost to the void. Organized and indexed.\"",
    description: "Sistem informasi kearsipan surat masuk dan disposisi surat keluar untuk instansi, dilengkapi penomoran surat otomatis, enkripsi berkas dokumen digital, dan pelacakan riwayat disposisi pegawai.",
    techStack: ["PHP", "Bootstrap", "MySQL", "FPDF"],
    features: [
      "Penomoran Surat Masuk & Keluar Otomatis",
      "Alur Disposisi Bertingkat Antar Pejabat",
      "Pencarian Cepat dengan Full-text Search",
      "Backup & Restore Database Terjadwal"
    ],
    stats: [
      { label: "Security", value: "Role-Based Access" },
      { label: "Storage", value: "Encrypted PDFs" },
      { label: "Performance", value: "Instant Search" }
    ],
    links: {
      github: "https://github.com/faza/arsip-digital"
    },
    featured: false,
    year: "2023",
    badge: "ARCHIVE"
  }
];

// Helper export: Top 3-4 featured projects for the main horizontal slider
export const FEATURED_PROJECTS = PROJECTS_DATA.filter((p) => p.featured).slice(0, 4);
