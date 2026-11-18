(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const select = (selector, context = document) => context.querySelector(selector);
  const selectAll = (selector, context = document) => [...context.querySelectorAll(selector)];
  const mulberry32 = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  function setupScroll() {
    const nav = select('#nav');
    if (!nav) {
      return;
    }
    let ticking = false;

    const update = () => {
      ticking = false;
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  }

  function setupMenu() {
    const menu = select('#menu');
    const toggle = select('#navToggle');
    const closeButton = select('#menuClose');
    if (!menu || !toggle || !closeButton) {
      return;
    }

    const setMenu = (open) => {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      (open ? closeButton : toggle).focus();
    };

    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    closeButton.addEventListener('click', () => setMenu(false));
    selectAll('.menu-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
      }
    });
  }

  function setupHeroScene() {
    const canvas = select('#heroCanvas');
    const heroSection = select('#home');
    if (!canvas || !heroSection) {
      return;
    }

    const context = canvas.getContext('2d');
    const scene = document.createElement('canvas');
    const sceneContext = scene.getContext('2d');
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const drawConifer = (ctx, x, baseY, h, w, color, random) => {
      ctx.fillStyle = color;
      ctx.fillRect(x - w * .045, baseY - h * .18, w * .09, h * .2);
      const layers = 5;
      for (let i = 0; i < layers; i++) {
        const t = i / layers;
        const y = baseY - h * .12 - h * .82 * t;
        const halfWidth = (w / 2) * (1 - t * .82) * (0.9 + random() * .25);
        const layerHeight = (h / layers) * 1.75;
        ctx.beginPath();
        ctx.moveTo(x - halfWidth, y);
        ctx.lineTo(x + halfWidth, y);
        ctx.lineTo(x + (random() - .5) * w * .06, y - layerHeight);
        ctx.closePath();
        ctx.fill();
      }
    };

    const drawRidge = (ctx, baseY, amplitude, color, random) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      const segments = 14;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const y = baseY - Math.abs(Math.sin(i * 1.7 + random() * 2)) * amplitude - random() * amplitude * .4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };

    const drawTorii = (ctx, x, baseY, h) => {
      const w = h * .95;
      const postWidth = h * .075;
      ctx.fillStyle = '#6e2a1c';
      ctx.beginPath();
      ctx.moveTo(x - w * .58, baseY - h);
      ctx.quadraticCurveTo(x, baseY - h * 1.1, x + w * .58, baseY - h);
      ctx.lineTo(x + w * .55, baseY - h * .93);
      ctx.quadraticCurveTo(x, baseY - h * 1.02, x - w * .55, baseY - h * .93);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(x - w * .5, baseY - h * .78, w, h * .06);
      ctx.fillRect(x - postWidth / 2, baseY - h * .95, postWidth, h * .17);
      ctx.save();
      ctx.translate(x - w * .36, baseY);
      ctx.rotate(.03);
      ctx.fillRect(-postWidth / 2, -h * .95, postWidth, h * .95);
      ctx.restore();
      ctx.save();
      ctx.translate(x + w * .36, baseY);
      ctx.rotate(-.03);
      ctx.fillRect(-postWidth / 2, -h * .95, postWidth, h * .95);
      ctx.restore();
    };

    const drawFogBand = (ctx, y, h, alpha) => {
      const gradient = ctx.createLinearGradient(0, y - h, 0, y + h);
      gradient.addColorStop(0, 'rgba(143, 163, 155, 0)');
      gradient.addColorStop(.5, `rgba(143, 163, 155, ${alpha})`);
      gradient.addColorStop(1, 'rgba(143, 163, 155, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - h, width, h * 2);
    };

    const renderScene = () => {
      const random = mulberry32(20261114);
      sceneContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const sky = sceneContext.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#0f1310');
      sky.addColorStop(.5, '#182420');
      sky.addColorStop(.82, '#2b3b30');
      sky.addColorStop(1, '#22302a');
      sceneContext.fillStyle = sky;
      sceneContext.fillRect(0, 0, width, height);

      sceneContext.fillStyle = 'rgba(236, 231, 219, .5)';
      for (let i = 0; i < 40; i++) {
        sceneContext.globalAlpha = random() * .5;
        sceneContext.fillRect(random() * width, random() * height * .4, 1.2, 1.2);
      }
      sceneContext.globalAlpha = 1;

      const moonX = width * .72;
      const moonY = height * .26;
      const moonRadius = Math.min(width, height) * .05;
      const halo = sceneContext.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 4.5);
      halo.addColorStop(0, 'rgba(233, 227, 208, .22)');
      halo.addColorStop(1, 'rgba(233, 227, 208, 0)');
      sceneContext.fillStyle = halo;
      sceneContext.fillRect(moonX - moonRadius * 5, moonY - moonRadius * 5, moonRadius * 10, moonRadius * 10);
      sceneContext.fillStyle = '#e9e3d0';
      sceneContext.beginPath();
      sceneContext.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      sceneContext.fill();

      drawRidge(sceneContext, height * .55, height * .1, '#243229', random);
      drawFogBand(sceneContext, height * .56, height * .05, .1);
      drawRidge(sceneContext, height * .64, height * .08, '#1b2620', random);

      for (let i = 0; i < 26; i++) {
        const x = (i / 25) * width + (random() - .5) * 40;
        drawConifer(sceneContext, x, height * .74 + random() * height * .03, height * (.12 + random() * .1), 34 + random() * 26, '#141d17', random);
      }

      drawFogBand(sceneContext, height * .72, height * .06, .16);
      drawTorii(sceneContext, width * .6, height * .84, height * .2);

      const clearing = sceneContext.createRadialGradient(width * .55, height * .9, 0, width * .55, height * .9, width * .4);
      clearing.addColorStop(0, 'rgba(143, 163, 155, .12)');
      clearing.addColorStop(1, 'rgba(143, 163, 155, 0)');
      sceneContext.fillStyle = clearing;
      sceneContext.fillRect(0, height * .6, width, height * .4);

      drawFogBand(sceneContext, height * .86, height * .07, .14);

      for (let i = 0; i < 7; i++) {
        const onLeft = i < 4;
        const x = onLeft ? random() * width * .16 : width - random() * width * .16;
        drawConifer(sceneContext, x, height * 1.02, height * (.42 + random() * .3), 90 + random() * 70, '#0c110d', random);
      }

      const vignette = sceneContext.createRadialGradient(width / 2, height * .45, Math.min(width, height) * .3, width / 2, height * .55, Math.max(width, height) * .85);
      vignette.addColorStop(0, 'rgba(15, 17, 14, 0)');
      vignette.addColorStop(1, 'rgba(15, 17, 14, .55)');
      sceneContext.fillStyle = vignette;
      sceneContext.fillRect(0, 0, width, height);
    };

    const paint = () => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.drawImage(scene, 0, 0, width, height);
    };

    const resize = () => {
      const rect = heroSection.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height) * 1.12;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = scene.width = Math.round(width * pixelRatio);
      canvas.height = scene.height = Math.round(height * pixelRatio);
      renderScene();
      paint();
    };

    resize();

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(heroSection);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  setupScroll();
  setupMenu();
  setupHeroScene();
})();
