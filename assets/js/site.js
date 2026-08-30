/* ============================================================
   Norair Harutyunyan — Game Art Portfolio

   Progressive enhancement only. With JavaScript disabled the
   page is fully readable: every section visible, every poster
   frame shown, no overlay covering anything.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ============================================================
     1. BOOT SCREEN
     Held until the fonts have resolved and the first paintable
     assets are in, so nobody watches the type re-flow.
     ============================================================ */
  (function boot() {
    var el = document.getElementById('boot');
    var fill = document.getElementById('boot-fill');
    if (!el) { root.classList.remove('is-booting'); return; }

    var steps = 0;
    var TOTAL = 3;
    var finished = false;

    function step() {
      steps++;
      if (fill) fill.style.transform = 'scaleX(' + Math.min(1, 0.06 + steps / TOTAL).toFixed(3) + ')';
      if (steps >= TOTAL) done();
    }

    function done() {
      if (finished) return;
      finished = true;
      if (fill) fill.style.transform = 'scaleX(1)';
      root.classList.remove('is-booting');
      requestAnimationFrame(function () {
        el.classList.add('is-done');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
      });
    }

    /* the three things worth waiting for */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(step).catch(step);
    else step();

    /* DOMContentLoaded, not load: waiting for every subresource on a slow
       connection turns the boot screen into the thing being waited for. */
    if (document.readyState !== 'loading') step();
    else document.addEventListener('DOMContentLoaded', step, { once: true });

    /* the hero poster of the first clip, so the fold is not empty */
    var firstPoster = document.querySelector('.stage__poster');
    if (firstPoster && firstPoster.complete) step();
    else if (firstPoster) {
      firstPoster.addEventListener('load', step, { once: true });
      firstPoster.addEventListener('error', step, { once: true });
    } else step();

    /* never hold the page hostage to a slow asset */
    setTimeout(done, 1500);
  })();

  /* ---------- 2. scroll progress ---------- */
  var bar = document.querySelector('.progress');
  if (bar) {
    var barTick = false;
    var draw = function () {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
      barTick = false;
    };
    addEventListener('scroll', function () {
      if (!barTick) { barTick = true; requestAnimationFrame(draw); }
    }, { passive: true });
    addEventListener('resize', draw, { passive: true });
    draw();
  }

  /* ---------- 3. mobile navigation ---------- */
  var burger = document.querySelector('.nav-burger');
  var nav = document.querySelector('#primary-nav');
  if (burger && nav) {
    var setNav = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    burger.addEventListener('click', function () {
      setNav(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        burger.focus();
      }
    });
  }

  /* ---------- 4. header inverts over the light profile band ---------- */
  var head = document.querySelector('.site-head');
  var lightBand = document.querySelector('.profile');
  if (head && lightBand) {
    var headTick = false;
    var syncHeader = function () {
      var r = lightBand.getBoundingClientRect();
      var probe = head.offsetHeight * 0.6;
      head.classList.toggle('is-light', r.top <= probe && r.bottom >= probe);
      headTick = false;
    };
    addEventListener('scroll', function () {
      if (!headTick) { headTick = true; requestAnimationFrame(syncHeader); }
    }, { passive: true });
    addEventListener('resize', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- 5. scroll spy ---------- */
  var spyLinks = [].slice.call(document.querySelectorAll('#primary-nav a[href^="#"]'));
  var spyTargets = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- 6. reveal on scroll, staggered per row ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reveals.length && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.filter(function (en) { return en.isIntersecting; })
        .forEach(function (en, i) {
          en.target.style.setProperty('--stagger', Math.min(i, 5) * 40 + 'ms');
          en.target.classList.add('is-in');
          ro.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    reveals.forEach(function (el) { ro.observe(el); });
    setTimeout(function () {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }, 4000);
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ============================================================
     7. GALLERY
     The square is reserved in CSS, a shimmer holds the slot, and
     the art is only faded in once it has actually decoded. No
     half-painted thumbnails, no shift.
     ============================================================ */
  [].slice.call(document.querySelectorAll('.tile__art')).forEach(function (slot) {
    var img = slot.querySelector('img');
    if (!img) return;
    var settle = function () { slot.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth > 0) {
      settle();
    } else {
      img.addEventListener('load', function () {
        if (img.decode) img.decode().then(settle).catch(settle);
        else settle();
      }, { once: true });
      /* a missing file must not leave a shimmer running forever */
      img.addEventListener('error', settle, { once: true });
    }
  });

  /* ============================================================
     8. VIDEO
     Sources attach well before the clip is on screen, so playback
     starts full. Each stage arrives soft and pulls into focus,
     which also covers the hand-off from poster to first frame.
     ============================================================ */
  var stages = [].slice.call(document.querySelectorAll('.stage[data-video]'));

  var stored = null;
  try { stored = localStorage.getItem('nh-motion'); } catch (e) { /* private mode */ }
  var motionOn = stored === null ? !reduced.matches : stored === 'on';

  var toggle = document.querySelector('.motion-toggle');
  var toggleLabel = toggle && toggle.querySelector('[data-label]');

  function attach(video) {
    if (video.dataset.ready === '1') return;
    video.dataset.ready = '1';
    var mobile = video.dataset.srcMobile;
    if (mobile) {
      var s1 = document.createElement('source');
      s1.src = mobile;
      s1.type = 'video/mp4';
      s1.media = '(max-width: 768px)';
      video.appendChild(s1);
    }
    var s2 = document.createElement('source');
    s2.src = video.dataset.src;
    s2.type = 'video/mp4';
    video.appendChild(s2);
    video.preload = 'auto';
    video.load();
  }

  function mark(stage, playing) {
    stage.classList.toggle('is-playing', playing);
    var btn = stage.querySelector('.stage__ctl button');
    if (btn) btn.setAttribute('aria-label', playing ? 'Pause this clip' : 'Play this clip');
  }

  function play(stage, video) {
    attach(video);
    var p = video.play();
    if (p && typeof p.then === 'function') {
      p.then(function () { mark(stage, true); })
       .catch(function () { mark(stage, false); }); /* low-power mode, data saver */
    } else {
      mark(stage, true);
    }
  }

  function pause(stage, video) {
    video.pause();
    mark(stage, false);
  }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0;
  }

  stages.forEach(function (stage) {
    var video = stage.querySelector('video');
    if (!video) return;

    /* the clip only becomes visible once it can genuinely paint */
    var reveal = function () { stage.classList.add('is-ready'); };
    video.addEventListener('loadeddata', reveal);
    video.addEventListener('playing', reveal);
    /* if the file is unreachable the poster simply stays */
    video.addEventListener('error', function () { mark(stage, false); }, true);

    var btn = stage.querySelector('.stage__ctl button');
    if (btn) {
      btn.addEventListener('click', function () {
        if (video.paused) play(stage, video); else pause(stage, video);
      });
    }
    mark(stage, false);
  });

  if ('IntersectionObserver' in window && stages.length) {
    /* buffer early: one full viewport ahead of the clip */
    var preloader = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var v = en.target.querySelector('video');
        if (v) attach(v);
        preloader.unobserve(en.target);
      });
    }, { rootMargin: '100% 0px' });
    stages.forEach(function (s) { preloader.observe(s); });

    /* focus pull: clear the blur slightly before the clip is centred */
    var focusPull = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var stage = en.target;
        stage.classList.toggle('is-inview', en.isIntersecting);
        if (en.isIntersecting) {
          /* drop the filter once it has settled, so nothing keeps
             a blur pass alive on a large surface while scrolling */
          clearTimeout(stage._settle);
          stage._settle = setTimeout(function () { stage.classList.add('is-settled'); }, 950);
        } else {
          clearTimeout(stage._settle);
          stage.classList.remove('is-settled');
        }
      });
    }, { rootMargin: '-8% 0px -8% 0px', threshold: 0.12 });
    stages.forEach(function (s) { focusPull.observe(s); });

    /* playback */
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var stage = en.target;
        var video = stage.querySelector('video');
        if (!video) return;
        if (en.isIntersecting) {
          if (motionOn) play(stage, video);
        } else if (!video.paused) {
          pause(stage, video);
        }
      });
    }, { threshold: 0.2 });
    stages.forEach(function (s) { vo.observe(s); });
  } else {
    stages.forEach(function (s) { s.classList.add('is-inview', 'is-settled'); });
  }

  /* ---------- 9. motion toggle ---------- */
  function applyMotion() {
    body.classList.toggle('motion-off', !motionOn);
    if (toggle) {
      toggle.setAttribute('aria-pressed', motionOn ? 'true' : 'false');
      if (toggleLabel) toggleLabel.textContent = motionOn ? 'Motion on' : 'Motion off';
    }
    stages.forEach(function (stage) {
      var video = stage.querySelector('video');
      if (!video) return;
      if (!motionOn) pause(stage, video);
      else if (inView(stage)) play(stage, video);
    });
    if (hero) hero.setEnabled(motionOn);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      motionOn = !motionOn;
      stored = motionOn ? 'on' : 'off';
      try { localStorage.setItem('nh-motion', stored); } catch (e) { /* ignore */ }
      applyMotion();
    });
  }

  var onPrefChange = function () {
    if (stored !== null) return;       /* an explicit choice wins over the OS */
    motionOn = !reduced.matches;
    applyMotion();
  };
  if (reduced.addEventListener) reduced.addEventListener('change', onPrefChange);
  else if (reduced.addListener) reduced.addListener(onPrefChange);

  /* ---------- 10. stop everything when the tab is hidden ---------- */
  document.addEventListener('visibilitychange', function () {
    stages.forEach(function (stage) {
      var v = stage.querySelector('video');
      if (!v) return;
      if (document.hidden) { if (!v.paused) pause(stage, v); }
      else if (motionOn && inView(stage)) play(stage, v);
    });
    if (hero) hero.setVisible(!document.hidden);
  });

  /* ---------- 11. year stamp ---------- */
  var years = [].slice.call(document.querySelectorAll('[data-year]'));
  if (years.length) {
    var y = String(new Date().getFullYear());
    years.forEach(function (el) { el.textContent = y; });
  }

  /* ============================================================
     12. HERO HAZE (WebGL)
     A slow ruby drift behind the title. Purely atmospheric: if
     the context is refused, or the machine is struggling, it is
     dropped and the CSS glow underneath carries the hero.
     ============================================================ */
  function buildHero() {
    var canvas = document.getElementById('hero-gl');
    if (!canvas || reduced.matches) return null;

    var gl = canvas.getContext('webgl', {
      alpha: true, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, powerPreference: 'low-power'
    }) || canvas.getContext('experimental-webgl');
    if (!gl) return null;

    /* No GPU, no haze. Software rasterisers turn every frame into main-thread
       work, which is exactly what a first paint cannot afford. */
    var forceGL = location.search.indexOf('gl=force') > -1;   /* review hatch */
    try {
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      var who = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      if (!forceGL && /swiftshader|llvmpipe|software|basic render/i.test(who)) return null;
    } catch (e) { /* extension blocked, carry on */ }
    if (!forceGL && (navigator.hardwareConcurrency || 8) <= 2) return null;

    var VERT = [
      'attribute vec2 a;',
      'void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
    ].join('\n');

    var FRAG = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform vec2 u_res;',
      'uniform float u_time;',
      'uniform vec2 u_ptr;',

      /* precision-safe hash: the classic sin() one degenerates to 1.0 on mediump */
      'float hash(vec2 p){',
      '  vec3 q = fract(vec3(p.xyx) * 0.1031);',
      '  q += dot(q, q.yzx + 33.33);',
      '  return fract((q.x + q.y) * q.z);',
      '}',

      'float noise(vec2 p){',
      '  vec2 i = floor(p), f = fract(p);',
      '  vec2 u = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
      '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);',
      '}',

      'float fbm(vec2 p){',
      '  float v = 0.0, a = 0.5;',
      '  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }',
      '  return v;',
      '}',

      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / u_res;',
      '  float ar = u_res.x / u_res.y;',
      '  vec2 p = vec2(uv.x * ar, uv.y);',
      '  float t = u_time * 0.028;',

      /* two rounds of domain warping: drifting ink, not a gradient */
      '  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, -t)));',
      '  vec2 r = vec2(fbm(p * 1.5 + 2.6 * q + vec2(1.7, 9.2) + t * 0.7),',
      '                fbm(p * 1.5 + 2.6 * q + vec2(8.3, 2.8) - t * 0.5));',
      '  float f = fbm(p * 1.5 + 2.2 * r);',

      /* the light sits where the reference build puts it: upper right */
      '  vec2 c = vec2(0.80 + u_ptr.x * 0.04, 0.84 + u_ptr.y * 0.04);',
      '  float d = distance(p, vec2(c.x * ar, c.y));',
      '  float halo = 1.0 - smoothstep(0.0, 1.15, d);',

      '  vec3 crimson = vec3(0.553, 0.063, 0.176);',
      '  vec3 ruby    = vec3(1.000, 0.208, 0.373);',
      '  vec3 col = mix(crimson, ruby, smoothstep(0.34, 0.86, f));',
      '  col *= pow(halo, 2.6) * (0.22 + 0.70 * f) * 0.42;',

      /* grain kills the banding a smooth gradient would show */
      '  col += (hash(gl_FragCoord.xy + fract(u_time) * 57.0) - 0.5) * 0.018;',
      '  col *= 1.0 - smoothstep(0.20, 1.30, length(uv - 0.5));',

      '  col = max(col, 0.0);',
      '  float a = clamp(max(max(col.r, col.g), col.b) * 1.4, 0.0, 0.9);',
      '  gl_FragColor = vec4(col, a);',
      '}'
    ].join('\n');

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    }

    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uPtr = gl.getUniformLocation(prog, 'u_ptr');

    var scale = Math.min(devicePixelRatio || 1, 0.75);
    var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    var running = false, enabled = motionOn, visible = true, onScreen = true, raf = 0;
    var t0 = 0, frames = 0, slow = 0, degraded = false;

    function size() {
      var w = Math.max(1, Math.round(canvas.clientWidth * scale));
      var h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    var FRAME_MS = 1000 / 30;   /* a slow drift gains nothing from 60fps */

    function frame(now) {
      if (!running) return;
      if (!t0) t0 = now;

      if (now - (frame.painted || 0) < FRAME_MS) { raf = requestAnimationFrame(frame); return; }
      frame.painted = now;

      /* watch the cost: two strikes and the effect steps aside */
      var dt = now - (frame.last || now);
      frame.last = now;
      if (frames++ > 40) {
        if (dt > 34) slow++; else slow = Math.max(0, slow - 1);
        if (slow > 45) {
          if (!degraded) { degraded = true; slow = 0; scale = 0.7; size(); }
          else { stop(); canvas.classList.remove('is-live'); return; }
        }
      }

      ptr.x += (ptr.tx - ptr.x) * 0.05;
      ptr.y += (ptr.ty - ptr.y) * 0.05;
      gl.uniform2f(uPtr, ptr.x, ptr.y);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !enabled || !visible || !onScreen) return;
      running = true;
      size();
      raf = requestAnimationFrame(frame);
      canvas.classList.add('is-live');
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    addEventListener('resize', function () { if (running) size(); }, { passive: true });

    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      addEventListener('pointermove', function (e) {
        ptr.tx = (e.clientX / innerWidth) * 2 - 1;
        ptr.ty = 1 - (e.clientY / innerHeight) * 2;
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0 }).observe(canvas);
    }

    start();

    return {
      setEnabled: function (v) { enabled = v; if (v) start(); else { stop(); canvas.classList.remove('is-live'); } },
      setVisible: function (v) { visible = v; if (v) start(); else stop(); }
    };
  }

  /* Built once the page has settled, never in front of the first paint.
     requestIdleCallback is throttled in a background tab and can simply never
     run there, so a timer guarantees the effect still arrives. */
  var hero = null, heroTried = false;
  function heroLater() {
    if (heroTried) return;
    heroTried = true;
    hero = buildHero();
    if (hero) hero.setEnabled(motionOn);
  }
  function scheduleHero() {
    if ('requestIdleCallback' in window) requestIdleCallback(heroLater, { timeout: 1200 });
    else setTimeout(heroLater, 400);
  }
  if (document.readyState === 'complete') setTimeout(scheduleHero, 250);
  else addEventListener('load', function () { setTimeout(scheduleHero, 250); }, { once: true });
  setTimeout(heroLater, 2200);

  applyMotion();
})();
