/* =============================================
   KESELAMATAN DEO — SCRIPT
   Parallax, Scroll Animations & Effects Engine
   ============================================= */

// 1. Script untuk Mountain Parallax
const text = document.getElementById('layer-text');
const moon = document.getElementById('layer-moon');
const mountainBack = document.getElementById('layer-mountain-back');
const mountainMid = document.getElementById('layer-mountain-mid');
const mountainFront = document.getElementById('layer-mountain-front');

// Referensi global untuk animatedPath agar tidak dideklarasi ulang di banyak scope
let globalAnimatedPath = null;

// --- rAF THROTTLE: Memastikan scroll handler hanya berjalan 1x per frame (60fps) ---
let scrollTicking = false;

function onScrollUpdate() {
  // Dapatkan nilai seberapa jauh pengguna sudah men-scroll ke bawah
  let value = window.scrollY;

  // Batasi kalkulasi parallax hanya saat hero section terlihat untuk menghemat performa
  if (value <= window.innerHeight) {
    // Elemen teks bergerak ke bawah PALING CEPAT
    text.style.transform = `translateY(${value * 1.2}px)`;

    // Bulan bergerak ke bawah cukup cepat
    moon.style.transform = `translate(-50%, ${value * 0.8}px)`; // transformX -50% untuk center align

    // Gunung belakang bergerak lambat
    mountainBack.style.transform = `translateY(${value * 0.4}px)`;

    // Gunung tengah bergerak sangat lambat
    mountainMid.style.transform = `translateY(${value * 0.2}px)`;

    // Gunung depan tidak diberi efek (tetap di posisinya) agar menjadi pondasi dasar
    // mountainFront.style.transform = `translateY(0)`; 
  }

  // --- LOGIKA 3D SPIRAL SCROLL ---
  const spiralSection = document.getElementById('spiral-section');
  const spiralContainer = document.getElementById('spiral-container');

  if (spiralSection && spiralContainer) {
    const rect = spiralSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Cek apakah section spiral (350vh) sedang di-scroll oleh user
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Hitung progres scroll dari 0 (awal) ke 1 (akhir section)
      const scrollProgress = Math.abs(rect.top) / (rect.height - windowHeight);

      // Putar kontainer berdasarkan persentase scroll (540 derajat = 1.5 putaran)
      const rotation = scrollProgress * 540;
      spiralContainer.style.transform = `rotateY(${-rotation}deg)`;
    }
    else if (rect.top > 0) {
      // Posisi sebelum mencapai section
      spiralContainer.style.transform = `rotateY(0deg)`;
    }
    else if (rect.bottom < windowHeight) {
      // Posisi saat sudah melewati section
      spiralContainer.style.transform = `rotateY(-540deg)`;
    }
  }

  // --- LOGIKA FEY-STYLE SCROLL (STICKY SEQUENCE) ---
  const feySection = document.getElementById('fey-section');

  if (feySection) {
    const rect = feySection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Jumlah langkah/konten (ada 3 div: indeks 0, 1, 2)
    const totalSteps = 3;

    // Cek apakah user sedang men-scroll di dalam fey-section (400vh)
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Hitung progres scroll fey-section dari 0 ke 1
      const scrollProgress = Math.abs(rect.top) / (rect.height - windowHeight);

      // Tentukan index aktif berdasarkan progress (0.0-0.33, 0.34-0.66, dst)
      let activeIndex = Math.floor(scrollProgress * totalSteps);

      // Pastikan index tidak melebihi batas maksimal (2)
      if (activeIndex >= totalSteps) activeIndex = totalSteps - 1;

      // Update kelas CSS untuk Teks dan Visual agar berganti berurutan
      for (let i = 0; i < totalSteps; i++) {
        const textStep = document.getElementById(`fey-text-${i}`);
        const visualStep = document.getElementById(`fey-visual-${i}`);

        if (i === activeIndex) {
          // Konten saat ini: Muncul di tengah dan terlihat jelas
          textStep.className = 'fey-text-step active';
          visualStep.className = 'fey-visual-step active';
        } else if (i < activeIndex) {
          // Konten yang sudah dilewati: Hilang bergerak ke atas
          textStep.className = 'fey-text-step exit-up';
          visualStep.className = 'fey-visual-step'; // gambar memudar
        } else {
          // Konten yang belum dicapai: Bersiap di bawah (default class)
          textStep.className = 'fey-text-step';
          visualStep.className = 'fey-visual-step'; // gambar memudar
        }
      }
    }
  }

  // --- LOGIKA ZOOM THROUGH SCROLL ---
  const zoomSection = document.getElementById('zoom-section');
  const zoomFront = document.getElementById('zoom-front');
  const zoomBg = document.getElementById('zoom-bg');

  if (zoomSection && zoomFront && zoomBg) {
    const rect = zoomSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Cek apakah ada di dalam area scroll zoom-section (300vh)
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Hitung progress scroll dari 0.0 ke 1.0
      const scrollProgress = Math.abs(rect.top) / (rect.height - windowHeight);

      // 1. LAYER DEPAN: Di-zoom membesar secara ekstrem (Skala dari 1 ke 40)
      // Menggunakan easing buatan agar di awal terasa lambat, di akhir terasa cepat
      const easeInExpo = scrollProgress === 0 ? 0 : Math.pow(2, 10 * scrollProgress - 10);
      const frontScale = 1 + (easeInExpo * 40);
      zoomFront.style.transform = `scale(${frontScale})`;

      // Supaya mulus, saat mendekati akhir (progress > 80%), hilangkan layer depan perlahan
      if (scrollProgress > 0.8) {
        // Math: ubah 0.8 -> 1.0 menjadi 1.0 -> 0.0 (opacity)
        const fadeOut = 1 - ((scrollProgress - 0.8) * 5);
        zoomFront.style.opacity = fadeOut;
      } else {
        zoomFront.style.opacity = 1;
      }

      // 2. LAYER BELAKANG: Di-zoom pelan mendekat (Skala 0.8 ke 1) dan Opacity naik
      const bgScale = 0.8 + (scrollProgress * 0.2);
      // Background muncul lebih awal (mencapai opacity 1 di progress 40%)
      const bgOpacity = Math.min(scrollProgress * 2.5, 1);

      zoomBg.style.transform = `scale(${bgScale})`;
      zoomBg.style.opacity = bgOpacity;
    }
    else if (rect.top > 0) {
      // Reset saat belum sampai ke section
      zoomFront.style.transform = `scale(1)`;
      zoomFront.style.opacity = 1;
      zoomBg.style.transform = `scale(0.8)`;
      zoomBg.style.opacity = 0;
    }
  }

  // --- LOGIKA HORIZONTAL SCROLL ---
  const horizontalSection = document.getElementById('horizontal-section');
  const horizontalTrack = document.getElementById('horizontal-track');

  if (horizontalSection && horizontalTrack) {
    const rect = horizontalSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Cek apakah ada di dalam area scroll horizontal-section (400vh)
    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      // Hitung progress scroll vertikal dari 0.0 ke 1.0
      const scrollProgress = Math.abs(rect.top) / (rect.height - windowHeight);

      // Kita memiliki 4 panel (total 400vw). 
      // Maksimal pergeseran adalah untuk menyembunyikan 3 panel sebelumnya, 
      // yaitu sejauh 300vw ke arah kiri (negatif).
      const maxTranslateX = 300;

      // Terapkan pergeseran
      horizontalTrack.style.transform = `translateX(-${scrollProgress * maxTranslateX}vw)`;
    }
    else if (rect.top > 0) {
      // Reset posisi sebelum sampai ke section
      horizontalTrack.style.transform = `translateX(0vw)`;
    }
    else if (rect.bottom < windowHeight) {
      // Posisi akhir setelah melewati section
      horizontalTrack.style.transform = `translateX(-300vw)`;
    }
  }

  // --- LOGIKA PROGRESS SCROLL BAR ---
  // Menghitung berapa persen halaman yang sudah di-scroll
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = window.scrollY / docHeight;
  document.getElementById('progress-bar').style.transform = `scaleX(${scrollPercent})`;

  // --- LOGIKA TEXT REVEAL EFFECT ---
  const revealSection = document.getElementById('text-reveal-section');
  if (revealSection) {
    const rect = revealSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Jika user sedang berada di dalam section Text Reveal (300vh)
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      // Kalkulasi progress kemunculan dari 0 ke 1
      // Menggunakan perhitungan sticky standar: -rect.top / sisa tinggi scroll
      let progress = -rect.top / (rect.height - windowHeight);
      // Pastikan progress berada di rentang 0 hingga 1
      progress = Math.max(0, Math.min(1, progress));

      const words = document.querySelectorAll('.reveal-word');
      // Tentukan berapa kata yang harus jelas (opacity 1) berdasarkan progress
      const activeCount = Math.floor(progress * words.length);

      words.forEach((word, index) => {
        // Kata yang indeksnya kurang dari activeCount akan jelas, sisanya samar
        word.style.opacity = index < activeCount ? 1 : 0.15;
      });
    }
  }

  // --- LOGIKA SCROLL-DRIVEN PATH SVG ---
  const pathSection = document.getElementById('path-section');

  if (pathSection && globalAnimatedPath) {
    const rect = pathSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Ambil panjang total garis SVG yang kita simpan saat halaman dimuat
    const pathLength = globalAnimatedPath.getTotalLength();

    if (rect.top <= windowHeight && rect.bottom >= 0) {
      let progress = -rect.top / (rect.height - windowHeight);
      progress = Math.max(0, Math.min(1, progress));

      // strokeDashoffset mengontrol berapa banyak bagian garis yang "disembunyikan"
      // Semakin scroll ke bawah (progress mendekati 1), offset berkurang menjadi 0 (garis tampil penuh)
      globalAnimatedPath.style.strokeDashoffset = pathLength - (progress * pathLength);
    }
  }

  // --- LOGIKA KINETIC TYPOGRAPHY ---
  const kineticSection = document.getElementById('kinetic-section');
  if (kineticSection) {
    const rect = kineticSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    // Jika elemen masuk ke layar
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      // Geser tiap baris dengan arah (positif/negatif) dan kecepatan pengali (0.5, 0.8) yang berbeda
      document.getElementById('k-row-1').style.transform = `translateX(${rect.top * 0.5}px)`;
      document.getElementById('k-row-2').style.transform = `translateX(${-rect.top * 0.8}px)`;
      document.getElementById('k-row-3').style.transform = `translateX(${rect.top * 0.3}px)`;
    }
  }

  // --- LOGIKA CLIP-PATH EXPAND ---
  const clipSection = document.getElementById('clip-section');
  const clipContent = document.getElementById('clip-content');
  if (clipSection && clipContent) {
    const rect = clipSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= 0 && rect.bottom >= windowHeight) {
      const scrollProgress = Math.abs(rect.top) / (rect.height - windowHeight);
      // Radius mengembang dari 0% hingga 150% (cukup besar menutupi seluruh ujung layar)
      clipContent.style.clipPath = `circle(${scrollProgress * 150}% at 50% 50%)`;
    } else if (rect.top > 0) {
      clipContent.style.clipPath = `circle(0% at 50% 50%)`;
    } else if (rect.bottom < windowHeight) {
      clipContent.style.clipPath = `circle(150% at 50% 50%)`;
    }
  }

  // Selesai memproses, buka kunci agar frame berikutnya bisa dijadwalkan
  scrollTicking = false;
}

// Event listener scroll yang di-throttle dengan requestAnimationFrame
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScrollUpdate);
    scrollTicking = true;
  }
}, { passive: true });

// --- SMOOTH VELOCITY SKEW ENGINE (requestAnimationFrame) ---
// Kita menggunakan loop khusus yang berjalan 60fps terpisah dari event listener scroll
// agar efek momentum / per memantul fisika terlihat sangat mulus
let vScroll = window.scrollY;
let vTarget = window.scrollY;

function renderVelocity() {
  vTarget = window.scrollY;

  // Lerp (Linear Interpolation) untuk meredam/memuluskan perubahan angka
  vScroll += (vTarget - vScroll) * 0.1;

  // Hitung "kecepatan" berdasarkan seberapa jauh layar bergeser dalam satu frame
  let velocity = vTarget - vScroll;

  // Konversi kecepatan menjadi derajat kemiringan (skew).
  // Dibatasi Math.max/min agar tidak jungkir balik (maksimal miring 12 derajat)
  let skew = Math.max(-12, Math.min(12, velocity * 0.05));

  // Terapkan properti skew ke semua kartu di section Velocity
  const skewItems = document.querySelectorAll('.skew-item');
  skewItems.forEach(item => {
    item.style.transform = `skewY(${skew}deg)`;
  });

  requestAnimationFrame(renderVelocity);
}

// Memulai mesin efek distorsi fisika
requestAnimationFrame(renderVelocity);


// 2. Script untuk Animasi Reveal saat di-scroll (Intersection Observer) & Setup Awal
document.addEventListener('DOMContentLoaded', () => {

  // --- SETUP TEXT REVEAL (Memecah teks menjadi <span> per kata) ---
  const textEl = document.getElementById('reveal-text');
  if (textEl) {
    const originalText = textEl.innerText;
    // Pecah teks berdasarkan spasi, bungkus tiap kata dengan span .reveal-word
    textEl.innerHTML = originalText.split(' ').map(word =>
      `<span class="reveal-word inline-block mr-3 md:mr-4">${word}</span>`
    ).join('');
  }

  // --- SETUP SCROLL-DRIVEN PATH (Menyiapkan properti SVG awal) ---
  globalAnimatedPath = document.getElementById('animated-path');
  if (globalAnimatedPath) {
    const pathLength = globalAnimatedPath.getTotalLength();
    // Mengatur stroke-dasharray dan dashoffset sama dengan panjang garis
    // Ini membuat garis menjadi "putus-putus" dengan jarak putus sepanjang garis itu sendiri (menyembunyikannya)
    globalAnimatedPath.style.strokeDasharray = pathLength;
    globalAnimatedPath.style.strokeDashoffset = pathLength;
  }

  // --- SETUP POSISI KARTU 3D SPIRAL (Melingkar) ---
  const spiralItems = document.querySelectorAll('.spiral-item');
  const totalItems = spiralItems.length;
  // Radius lingkar agar kartu tidak saling bertumpuk (menyesuaikan layar)
  const radius = window.innerWidth < 768 ? 220 : 380;

  spiralItems.forEach((item, index) => {
    // Membagi 360 derajat agar kartu merata membentuk lingkaran
    const angle = index * (360 / totalItems);

    // rotateY mengatur sudut kartu, translateZ mendorong kartu menjauh dari titik tengah
    item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
  });

  // --- SETUP INTERSECTION OBSERVER ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, observerOptions);

  const hiddenElements = document.querySelectorAll('.animate-on-scroll');
  hiddenElements.forEach((el) => observer.observe(el));
});