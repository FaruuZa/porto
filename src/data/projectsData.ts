import { ProjectItem } from '../types';

export type ProjectDetail = ProjectItem;

/**
 * Clean separated project data structure prepared for Sanity CMS integration.
 * Only Qlinica and RahmatBakery are featured; default empty links for others.
 */
export const PROJECTS_DATA: ProjectDetail[] = [
  {
    id: "qlinica",
    slug: "qlinica-clinical-erp-attendance",
    title: {
      en: "Qlinica — Clinical ERP & Attendance Ecosystem",
      id: "Qlinica — ERP Klinik & Presensi Digital Terpadu",
    },
    date: "2024",
    shortDescription: {
      en: "Integrated clinical management web app synchronized in real-time with mobile attendance.",
      id: "Ekosistem manajemen klinik web terpadu yang tersinkronisasi langsung dengan aplikasi presensi mobile.",
    },
    description: {
      en: "Integrated clinical management web ecosystem synchronized directly with a mobile attendance app. Automates outpatient registration, centralized queueing, specialist scheduling, and pharmacy inventory control.",
      id: "Ekosistem manajemen klinik terpadu berbasis web yang tersinkronisasi langsung dengan aplikasi presensi mobile. Mengotomatisasi alur pendaftaran pasien rawat jalan, sistem antrean terpusat, jadwal dokter spesialis, serta inventaris modul apotek dan resep obat.",
    },
    techStack: ["Laravel", "Flutter", "PostgreSQL", "REST API", "Tailwind CSS"],
    links: {
      demo: "https://qlinica.demo.app",
      repo: "https://github.com/faza/qlinica-clinical-erp",
    },
    featured: true,
    category: "Full-Stack Ecosystem",
  },
  {
    id: "rahmat-bakery",
    slug: "rahmat-bakery-multichannel-commerce",
    title: {
      en: "RahmatBakery — Multi-Channel Retail Ordering",
      id: "RahmatBakery — Platform Pemesanan Multi-Channel",
    },
    date: "2024",
    shortDescription: {
      en: "Synchronized web & native Android retail platform for product catalog and order tracking.",
      id: "Platform pemesanan toko roti multi-platform dengan katalog web dan aplikasi Android.",
    },
    description: {
      en: "Multi-platform bakery ordering platform (web & mobile). Customers browse catalogs and reserve orders, while shop administrators monitor order workflows and sales reports through an integrated backend.",
      id: "Platform pemesanan toko kue multi-platform (web & mobile). Memungkinkan pelanggan memilih katalog dan melakukan reservasi transaksi pesanan, sementara pemilik toko memantau dashboard status order dan laporan penjualan secara berkala.",
    },
    techStack: ["PHP", "Kotlin", "PostgreSQL", "Android SDK"],
    links: {
      repo: "https://github.com/faza/rahmat-bakery-system",
    },
    featured: true,
    category: "Web & Mobile App",
  },
  {
    id: "card-clash-inferior-gambit",
    slug: "card-clash-inferior-gambit",
    title: {
      en: "Card Clash: Inferior Gambit (Prototype)",
      id: "Card Clash: Inferior Gambit (Prototipe)",
    },
    date: "2024",
    shortDescription: {
      en: "Simultaneous RPS card battle prototype where being inferior triggers tide-turning effects.",
      id: "Eksperimen card battle simultan batu-gunting-kertas dengan mekanik pembalik kekalahan.",
    },
    description: {
      en: "An experimental card battle game prototype. Players simultaneously choose cards revealed at the same time to determine Superior, Neutral, or Inferior state. Uniquely, losing a clash triggers powerful comeback card effects.",
      id: "Eksperimen game card battle yang dibikin saat eksplorasi logika. Kedua pemain memilih kartu bersamaan lalu di-reveal serentak untuk menentukan status Superior, Neutral, atau Inferior. Menariknya, status inferior justru memicu efek pembalik keadaan yang kuat.",
    },
    techStack: ["Game Logic Design", "Simultaneous RPS", "TypeScript", "Interactive Web"],
    links: {},
    featured: false,
    category: "Interactive Web",
  },
  {
    id: "kitchen-shell",
    slug: "kitchenshell-pos-barcode-checkout",
    title: {
      en: "KitchenShell POS — Desktop Barcode Checkout",
      id: "KitchenShell POS — Kasir Barcode Desktop",
    },
    date: "2023",
    shortDescription: {
      en: "High-speed desktop Point of Sale software with instant barcode scanning and relational inventory.",
      id: "Aplikasi desktop kasir Point of Sale cepat dengan pemindai barcode instan dan otomasi stok MySQL.",
    },
    description: {
      en: "High-speed desktop Point of Sale (POS) software equipped with barcode card scan integration to accelerate queue throughput and automate real-time inventory management with relational MySQL storage.",
      id: "Aplikasi desktop kasir Point of Sale (POS) cepat yang dilengkapi integrasi pemindaian kartu barcode untuk mempercepat proses antrean kasir serta otomasi pencatatan inventaris barang berbasis basis data MySQL.",
    },
    techStack: ["Java", "MySQL", "Java Swing", "Barcode Driver"],
    links: {},
    featured: false,
    category: "Desktop POS Application",
  },
  {
    id: "omori-engine",
    slug: "omori-white-space-interactive-portfolio",
    title: {
      en: "White Space Portfolio Engine & Soundscape",
      id: "White Space Engine & Audio Procedural",
    },
    date: "2024",
    shortDescription: {
      en: "Atmospheric portfolio interface inspired by Omori aesthetics with custom procedural Web Audio API.",
      id: "Antarmuka portofolio atmosferik berakar dari estetika Omori dengan synthesizer Web Audio API.",
    },
    description: {
      en: "Personal interactive portfolio engine themed after Omori White Space & Black Space. Employs zero-asset procedural audio generation, physics pendulums, and retro keyboard controls.",
      id: "Sistem antarmuka portofolio bertema Omori White Space & Black Space dengan Web Audio API Procedural Synthesizer, physical pendulum physics, keyboard arcade navigation, dan dynamic aesthetic glitch system.",
    },
    techStack: ["React 18", "TypeScript", "Tailwind CSS", "Web Audio API", "Vite"],
    links: {},
    featured: false,
    category: "Interactive Web",
  },
  {
    id: "eduquest-lms",
    slug: "eduquest-gamified-learning-portal",
    title: {
      en: "EduQuest — Gamified Student Evaluation Portal",
      id: "EduQuest — Portal Evaluasi Mahasiswa Gamifikasi",
    },
    date: "2023",
    shortDescription: {
      en: "Gamified learning management system with timed quizzes, badges, and automated grade visualization.",
      id: "Sistem manajemen pembelajaran (LMS) gamifikasi dengan kuis berbatas waktu dan rekap nilai otomatis.",
    },
    description: {
      en: "Gamified learning management system designed to boost student engagement in assignment delivery, timed interactive quizzes, and automated statistical progress tracking.",
      id: "Sistem manajemen pembelajaran (LMS) berbasis gamifikasi untuk meningkatkan keterlibatan mahasiswa dalam pengumpulan tugas, kuis interaktif berbatas waktu, dan pemantauan capaian nilai otomatis.",
    },
    techStack: ["Laravel", "Vue.js", "MySQL", "Chart.js"],
    links: {},
    featured: false,
    category: "Full-Stack Ecosystem",
  },
  {
    id: "arsip-digital",
    slug: "arsip-digital-surat-dokumen",
    title: {
      en: "E-Arsip — Document Archiving & Disposition",
      id: "E-Arsip — Manajemen Arsip & Disposisi Surat",
    },
    date: "2023",
    shortDescription: {
      en: "Government correspondence archiving system with automatic registration and disposition tracking.",
      id: "Sistem kearsipan surat masuk dan disposisi berjenjang instansi dengan penomoran surat otomatis.",
    },
    description: {
      en: "Digital document archiving and multi-tiered disposition management system for public institutions, featuring automated numbering, secure storage, and staff tracking.",
      id: "Sistem informasi kearsipan surat masuk dan disposisi surat keluar untuk instansi, dilengkapi penomoran surat otomatis, enkripsi berkas dokumen digital, dan pelacakan riwayat disposisi pegawai.",
    },
    techStack: ["PHP", "Bootstrap", "MySQL", "FPDF"],
    links: {},
    featured: false,
    category: "System Architecture",
  },
];

// Top featured projects for landing slider (Qlinica & RahmatBakery)
export const FEATURED_PROJECTS = PROJECTS_DATA.filter((p) => p.featured);
