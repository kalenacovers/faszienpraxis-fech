<?php
/**
 * Template Name: Zertifikate
 *
 * @package FechPuls
 */

get_header();
?>

<style>
  .zert-hero {
    padding: 160px 60px 80px;
    text-align: center;
    position: relative;
  }

  .zert-hero-label {
    font-size: 11px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
  }

  .zert-hero h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 56px;
    font-weight: 300;
    color: var(--dark);
    line-height: 1.15;
    margin-bottom: 20px;
  }

  .zert-hero p {
    font-size: 17px;
    color: var(--text-muted);
    max-width: 560px;
    margin: 0 auto;
    font-weight: 300;
    line-height: 1.7;
  }

  /* ══════════════════════════════
     GALLERY
  ══════════════════════════════ */
  .zert-gallery {
    padding: 0 60px 100px;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
  }

  .zert-card {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    cursor: pointer;
    background: var(--cream);
    aspect-ratio: 3 / 4;
    opacity: 0;
    transform: translateY(60px) scale(0.95);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .zert-card.revealed {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .zert-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .zert-card:hover img {
    transform: scale(1.05);
  }

  /* Reveal curtain effect */
  .zert-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--warm-white);
    transform-origin: top;
    transition: transform 1s cubic-bezier(0.76, 0, 0.24, 1);
    transform: scaleY(1);
  }

  .zert-card.revealed::after {
    transform: scaleY(0);
    transform-origin: bottom;
  }

  /* ══════════════════════════════
     LIGHTBOX
  ══════════════════════════════ */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(10, 37, 64, 0.92);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .lightbox.active {
    opacity: 1;
    pointer-events: all;
  }

  .lightbox img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 4px;
    transform: scale(0.9) translateY(20px);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .lightbox.active img {
    transform: scale(1) translateY(0);
  }

  .lightbox-close {
    position: absolute;
    top: 28px;
    right: 36px;
    width: 44px;
    height: 44px;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, color 0.2s;
  }

  .lightbox-close:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: #fff;
  }

  .lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, color 0.2s;
  }

  .lightbox-nav:hover {
    border-color: rgba(255, 255, 255, 0.4);
    color: #fff;
  }

  .lightbox-prev { left: 24px; }
  .lightbox-next { right: 24px; }

  .lightbox-counter {
    position: absolute;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ══════════════════════════════
     RESPONSIVE
  ══════════════════════════════ */
  @media (max-width: 1024px) {
    .zert-hero { padding: 140px 40px 60px; }
    .zert-hero h1 { font-size: 44px; }
    .zert-gallery { padding: 0 40px 80px; }
  }

  @media (max-width: 768px) {
    .zert-hero { padding: 120px 24px 48px; }
    .zert-hero h1 { font-size: 36px; }
    .zert-hero p { font-size: 15px; }
    .zert-gallery {
      padding: 0 24px 64px;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .lightbox-prev { left: 12px; }
    .lightbox-next { right: 12px; }
  }

  @media (max-width: 480px) {
    .zert-hero h1 { font-size: 30px; }
    .zert-gallery {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 0 20px 56px;
    }
  }
</style>

<!-- HERO -->
<section class="zert-hero">
  <p class="zert-hero-label">Qualifikationen & Nachweise</p>
  <h1>Zertifikate</h1>
  <p>Fundiertes Fachwissen, bestätigt durch anerkannte Ausbildungen und Zertifizierungen im Bereich Faszientherapie, Schmerztherapie und ganzheitlicher Gesundheit.</p>
</section>

<!-- GALLERY -->
<section class="zert-gallery">
  <?php
  $certificates = [
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/ganzheitlicher-gesundheitspraktiker-scaled.jpg',
      'alt' => 'Ganzheitlicher Gesundheitspraktiker',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/sport-therapeut-scaled.jpg',
      'alt' => 'Sport-Therapeut',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/professionelle-ganzheitliche-schmerztherapie-scaled.jpg',
      'alt' => 'Professionelle ganzheitliche Schmerztherapie',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/professionelle-ganzheitliche-amerikanische-chiropraktik-scaled.jpg',
      'alt' => 'Professionelle ganzheitliche amerikanische Chiropraktik',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/prakriker-fuer-tiefe-freisetzungspunkte-scaled.jpg',
      'alt' => 'Praktiker für tiefe Freisetzungspunkte',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/faszientherapeut-scaled.jpg',
      'alt' => 'Faszientherapeut',
    ],
    [
      'src' => 'https://faszienpraxis-fech.de/wp-content/uploads/2026/03/bewegungstherapeut-scaled.jpg',
      'alt' => 'Bewegungstherapeut',
    ],
  ];

  foreach ( $certificates as $index => $cert ) : ?>
    <div class="zert-card" data-index="<?php echo esc_attr( $index ); ?>">
      <img src="<?php echo esc_url( $cert['src'] ); ?>"
           alt="<?php echo esc_attr( $cert['alt'] ); ?>"
           loading="lazy">
    </div>
  <?php endforeach; ?>
</section>

<!-- LIGHTBOX -->
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" id="lb-close" aria-label="Schließen">&times;</button>
  <button class="lightbox-nav lightbox-prev" id="lb-prev" aria-label="Vorheriges Bild">&#8249;</button>
  <img id="lb-img" src="" alt="">
  <button class="lightbox-nav lightbox-next" id="lb-next" aria-label="Nächstes Bild">&#8250;</button>
  <div class="lightbox-counter" id="lb-counter"></div>
</div>

<script>
  // Scroll-triggered reveal with staggered delays
  const cards = document.querySelectorAll('.zert-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const index = parseInt(card.dataset.index, 10);
        setTimeout(() => {
          card.classList.add('revealed');
        }, index * 120);
        revealObserver.unobserve(card);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => revealObserver.observe(card));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbCounter = document.getElementById('lb-counter');
  const images   = Array.from(cards).map(c => c.querySelector('img'));
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src    = images[index].src;
    lbImg.alt    = images[index].alt;
    lbCounter.textContent = (index + 1) + ' / ' + images.length;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + images.length) % images.length;
    lbImg.src    = images[currentIndex].src;
    lbImg.alt    = images[currentIndex].alt;
    lbCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => navigate(-1));
  document.getElementById('lb-next').addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
</script>

<?php get_footer(); ?>
