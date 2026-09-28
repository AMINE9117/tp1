(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Année du pied de page */
  $('#year').textContent = new Date().getFullYear();

  /* Barre de progression + nav */
  const nav = $('#nav'), progress = $('#progress');
  const onScroll = () => {
    const h = document.documentElement;
    progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    nav.classList.toggle('scrolled', h.scrollTop > 40);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => {
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Lien actif */
  const navLinks = $$('.links a[href^="#"]:not(.cta-link)');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* Texte qui se tape */
  const roles = ['développement web.', 'bases de données.', 'flux de données.', 'travail en équipe.'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, i = 0, del = false;
    const tick = () => {
      const w = roles[r];
      typed.textContent = w.slice(0, i);
      if (!del && i === w.length) { del = true; return setTimeout(tick, 1600); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    };
    setTimeout(tick, 1400);
  }

  /* Apparition au défilement (décalage automatique dans une même grille) */
  $$('.grid, .hobbies, .skills, .timeline').forEach(g =>
    $$('.reveal', g).forEach((el, i) => el.style.setProperty('--d', (i * 0.08) + 's')));
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(count);
    o.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  function count(el) {
    const to = +el.dataset.count;
    if (reduce) return (el.textContent = to);
    const t0 = performance.now(), dur = 1200;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Effet d'inclinaison sur les cartes projets */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const b = c.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
        c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      c.addEventListener('mouseleave', () => c.style.transform = '');
    });
  }

  /* Animation du hero : flux de données entre des nœuds */
  const cv = $('#flow'), ctx = cv.getContext('2d');
  let W, H, nodes = [], packets = [], raf;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -999, y: -999 };

  function resize() {
    const b = cv.getBoundingClientRect();
    W = b.width; H = b.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, W * H / 15000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25
    }));
    packets = [];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const maxD = Math.min(170, W / 5);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    const pairs = [];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < maxD) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - d / maxD) * .22})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        pairs.push([a, b]);
      }
    }
    if (pairs.length && packets.length < 28 && Math.random() < .12) {
      const [a, b] = pairs[(Math.random() * pairs.length) | 0];
      packets.push({ a, b, t: 0, s: .008 + Math.random() * .012 });
    }
    packets = packets.filter(p => p.t < 1);
    ctx.fillStyle = '#f2b33d';
    for (const p of packets) {
      p.t += p.s;
      ctx.beginPath();
      ctx.arc(p.a.x + (p.b.x - p.a.x) * p.t, p.a.y + (p.b.y - p.a.y) * p.t, 2.6, 0, 6.283);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    for (const n of nodes) {
      const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < 110;
      ctx.beginPath(); ctx.arc(n.x, n.y, near ? 4 : 2, 0, 6.283); ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  resize();
  addEventListener('resize', resize);
  $('.hero').addEventListener('mousemove', e => {
    const b = cv.getBoundingClientRect();
    mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
  });
  if (reduce) draw(), cancelAnimationFrame(raf);
  else {
    draw();
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) draw();
    }).observe($('.hero'));
  }
})();