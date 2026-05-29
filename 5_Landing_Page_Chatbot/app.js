/* ===== MOCO Kitchen — App Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  // === Navbar scroll effect ===
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
    parallaxFloating();
  });

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  // === Mobile nav toggle ===
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });

  // === Scroll animations (Intersection Observer) ===
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // === Smooth scroll for all anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // === FAQ accessibility ===
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item').forEach(other => {
          if (other !== item) other.removeAttribute('open');
        });
      }
    });
  });

  // === Parallax floating elements ===
  const floatingEls = document.querySelectorAll('.floating-el');
  function parallaxFloating() {
    const scrollY = window.scrollY;
    floatingEls.forEach((el, i) => {
      const speed = 0.03 + (i * 0.015);
      const yOffset = scrollY * speed;
      const xOffset = Math.sin(scrollY * 0.003 + i) * 8;
      el.style.transform = `translate(${xOffset}px, ${-yOffset}px) rotate(${scrollY * 0.02 * (i % 2 === 0 ? 1 : -1)}deg)`;
    });
  }

  // === Stats counter animation ===
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1200;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // === Testimonial carousel ===
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let currentSlide = 0;
  let autoPlayTimer;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
  }

  if (dots.length) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(autoPlayTimer);
        showSlide(parseInt(dot.dataset.index));
        autoPlayTimer = setInterval(nextSlide, 5000);
      });
    });
    autoPlayTimer = setInterval(nextSlide, 5000);
  }
});
