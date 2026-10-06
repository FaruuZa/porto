# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Rekan developer, komunitas open-source/indie game, recruiter, dan tech peers yang mengeksplorasi personal branding, karya kreatif, serta kapabilitas teknis Faza dalam membangun sistem perangkat lunak.

## Product Purpose
Portofolio web personal yang berfungsi sebagai showcase eksperimental dan identitas developer indie. Bertujuan menampilkan karya sistem nyata (full-stack web, mobile sync, relasional database) dan kredensial akademik dengan pengalaman interaktif atmosferik yang khas tanpa mengorbankan kecepatan loading dan keterbacaan.

## Positioning
Menggabungkan kapabilitas rekayasa perangkat lunak nyata dengan sentuhan narasi visual indie psychological-RPG dan sketchbook doodle (terinspirasi dari White Space dan Black Space Omori)—menghadirkan identitas developer yang unik dan memorable dibandingkan portofolio template korporat konvensional.

## Operating Context
Diakses melalui browser modern (desktop & mobile). Dijalankan melalui Vite dev server atau static build (pratinjau VPS port 8000). Pengunjung mengeksplorasi ringkasan proyek, berinteraksi dengan elemen atmosferik, memeriksa spesifikasi teknis/kredensial, dan mengakses tautan kontak/repositori.

## Capabilities and Constraints
- Tech Stack: Vite + React 18 + TypeScript + Tailwind CSS.
- Fitur Interaktif: White Space / Black Space theme switcher, interaktif Omori hanging lightbulb, stats sheet profil pengembang, sintetis audio sound effect (Web Audio API), dialog box monokrom.
- Batasan Kinerja: Tanpa library 3D/canvas berat; rendering berbasis DOM dan CSS murni; bundling optimal (~100KB) yang ramah performa GPU/RAM.
- Workflow Desain: Code-first (`"buildPath": "code"`).

## Brand Commitments
- Nama: Faza / Portfolio Developer — Omori White Space & Sketchbook Edition.
- Arah Seni & Referensi: Estetika murni Omori (White Space hanging lightbulb, kotak dialog monokrom, notebook sketchbook hand-drawn doodle, dan anomali Black Space).
- Nada & Suara: Introspektif, berkarakter, tenang, namun presisi dan transparan mengenai rincian sistem dan metrik rekayasa perangkat lunak.

## Evidence on Hand
- Data proyek di `src/data/portfolioData.ts`: Qlinica (ERP Klinik & Attendance Mobile), RahmatBakery (Multi-Channel Retail Ordering), dll.
- Kredensial Akademik: D4 Teknik Informatika Politeknik Negeri Jember (Semester 5), IPK 3.72, CEFR B1.
- Implementasi Web Audio API di `src/utils/audio.ts`.

## Product Principles
1. **Substance Over Gimmick**: Elemen atmosferik dan doodle memperkaya pengalaman menjelajah, mendampingi bukti nyata kualitas arsitektur kode.
2. **Atmospheric Yet Non-Intrusive**: Interaktivitas dan audio harus menghormati kenyamanan pengguna (tidak ada autoplay yang mengagetkan; mudah dinavigasi).
3. **High Performance & Lean Footprint**: Cepat dimuat di berbagai koneksi tanpa beban komputasi berat.
4. **Authentic Craft**: Mengedepankan sentuhan tangan (*hand-drawn feel*) yang selaras dengan nilai craftsmanship software engineering.

## Accessibility & Inclusion
Memastikan rasio kontras teks tetap terbaca tajam pada White Space (kertas sketsa) dan Black Space (tinta gelap), tipografi jelas (`Plus Jakarta Sans` & `Space Mono`), tata letak adaptif dan ramah pembaca layar.
