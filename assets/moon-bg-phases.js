/* Динамическая луна на фоне «Тихой колоды» — версия с фазой по дате и Землёй.
   Включается классом html.dyn-moon; если что-то не загрузилось — класс не ставится
   и остаётся прежняя статичная фотография луны.

   Отключить целиком: убрать <script src=".../moon-bg-phases.js"> из index.html
   (вернуться к прежней луне — вернуть moon-bg.js).

   НАСТРОЙКИ — правятся здесь, в CONFIG. */
(function () {
  var CONFIG = {
    date: 'auto',      /* 'auto' — сегодняшняя дата; или '2026-09-04' — зафиксировать фазу */
    floor: 0,          /* минимальная освещённость, 0…0.8; 0 — «честная» фаза, в новолуние луна тёмная */
    relief: 1,         /* резкость рельефа: 0…2 */
    mspin: 35,         /* скорость вращения луны: 0 — стоит, 100 — быстро */
    earth: 1,          /* 1 — Земля за луной, 0 — без неё */
    esize: 35,         /* размер Земли, % (15…80) */
    tilt: 24.5,        /* наклон оси Земли, градусы */
    eday: 120,         /* секунд на один оборот Земли; 120 — «сутки» в ускоренном виде */
    coverLandscape: 0.70, /* доля высоты экрана, которую занимает луна на широком экране */
    coverPortrait: 0.12,  /* то же для телефона: маленькая луна в небе */
    portraitX: 0.42,      /* положение маленькой луны по горизонтали: -1 левый край … 1 правый */
    portraitY: 0.66,      /* по вертикали: -1 низ … 1 верх */
    earthMinAspect: 0.9   /* уже (уже экран) — Земля не показывается */
  };

  var SYN = 29.530588853;
  var NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

  var host = document.getElementById('moon-bg');
  if (!host) return;

  /* база путей: работает и на своём сервере (/static/taro/assets/), и на GitHub Pages (/taro/assets/) */
  var SELF = document.currentScript;
  var BASE = SELF ? SELF.src.replace(/moon-bg-phases\.js.*$/, '') : '/static/taro/assets/';

  var enable = function () { document.documentElement.classList.add('dyn-moon'); };
  if (!window.WebGLRenderingContext) return;

  function phaseFromDate(d) {
    var days = (d.getTime() - NEW_MOON) / 86400000;
    var p = ((days % SYN) + SYN) % SYN / SYN;
    return p;
  }

  import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js').then(function (THREE) {
    var wide = (window.innerWidth || 1200) >= 1100;
    var anisoMax = 8;

    var canvas = document.createElement('canvas');
    host.appendChild(canvas);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    anisoMax = renderer.capabilities.getMaxAnisotropy();

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

    /* ── Луна ── */
    var mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(BASE + 'moon-2k.jpg', function (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(16, anisoMax);
      mat.map = tex; mat.needsUpdate = true;
    }, undefined, function () {
      loader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/planets/moon_1024.jpg', function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 2.6; mat.needsUpdate = true;
      });
    });

    /* рельеф: на широких экранах 4K, на телефонах 2K — чтобы не тянуть лишние мегабайты */
    loader.load(
      wide ? BASE + 'moon-normal-4k.jpg' : BASE + 'moon-normal.jpg',
      function (nrm) {
        nrm.colorSpace = THREE.NoColorSpace;
        nrm.anisotropy = Math.min(16, anisoMax);
        mat.normalMap = nrm;
        mat.normalScale = new THREE.Vector2(CONFIG.relief, CONFIG.relief);
        mat.needsUpdate = true;
      }
    );

    var moon = new THREE.Mesh(new THREE.SphereGeometry(1, wide ? 160 : 96, wide ? 160 : 96), mat);
    moon.rotation.z = 0.15;
    scene.add(moon);

    /* ── Земля ── */
    var earthPivot = new THREE.Group();
    var earthTilt = new THREE.Group();
    var earthSpin = new THREE.Group();
    var earthMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.05 });
    var earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x5fa8ff, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending })
    );
    earth.add(glow);
    earthSpin.add(earth);
    earthTilt.add(earthSpin);
    earthPivot.add(earthTilt);
    earthPivot.visible = !!CONFIG.earth;
    scene.add(earthPivot);

    var wantEarth = !!CONFIG.earth && (window.innerWidth || 1200) / (window.innerHeight || 800) >= CONFIG.earthMinAspect;
    if (wantEarth) loader.load(
      BASE + 'earth_atmos_4096.jpg',
      function (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = Math.min(16, anisoMax);
        earthMat.map = t; earthMat.needsUpdate = true;
      },
      undefined,
      function () { earthPivot.visible = false; }   /* не загрузилась — просто убираем Землю */
    );

    /* ── Свет: положение солнца задаёт фазу ── */
    var sun = new THREE.DirectionalLight(0xfff4e6, 3.0);
    scene.add(sun);
    var earthshine = new THREE.DirectionalLight(0x6f86c6, 0.28);
    earthshine.position.set(-4, -1.5, 2);
    scene.add(earthshine);
    scene.add(new THREE.AmbientLight(0x161226, 0.5));

    var dist = 5;
    function frame() {
      var w = host.clientWidth || window.innerWidth;
      var h = host.clientHeight || window.innerHeight;
      var aspect = w / h;

      var cover = aspect < 1 ? CONFIG.coverPortrait : CONFIG.coverLandscape;
      host.dataset.moonCover = cover.toFixed(2);   /* для проверки: сколько высоты занято */
      host.dataset.moonAspect = aspect.toFixed(2);
      var fov = 32;
      dist = 1 / (cover * Math.tan(fov * Math.PI / 360));

      camera.fov = fov;
      camera.aspect = aspect;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      renderer.setSize(w, h, false);
      var halfH = dist * Math.tan(fov * Math.PI / 360);
      var halfW = halfH * aspect;
      if (aspect < 1) {
        /* маленькая луна в небе: положение задаётся долями половины экрана */
        moon.position.set(CONFIG.portraitX * halfW, CONFIG.portraitY * halfH, 0);
      } else {
        moon.position.set(-0.02, 0.12, 0);
      }
      moon.scale.setScalar(1);

      /* Земля: позади справа, всё в долях расстояния — композиция не зависит от экрана */
      var k = (CONFIG.esize / 100) / 0.45;
      earthPivot.position.set(
        moon.position.x + 0.74 * dist,
        moon.position.y + 0.42 * dist,
        -1.6 * dist
      );
      earthSpin.scale.setScalar(dist * 0.10 * k);
      earthTilt.rotation.z = CONFIG.tilt * Math.PI / 180;
      earthPivot.visible = !!CONFIG.earth && aspect >= CONFIG.earthMinAspect;
    }
    frame();
    window.addEventListener('resize', frame);

    /* ── Фаза по дате ── */
    var when = CONFIG.date === 'auto' ? new Date() : new Date(CONFIG.date + 'T12:00:00');
    var phase = phaseFromDate(when);
    var ang = phase * Math.PI * 2;
    var illum = (1 - Math.cos(ang)) / 2;
    if (CONFIG.floor > 0 && illum < CONFIG.floor) {
      var minAng = Math.acos(1 - 2 * CONFIG.floor);
      ang = (ang < Math.PI) ? minAng : (Math.PI * 2 - minAng);
    }
    sun.position.set(Math.sin(ang) * 5, 0.6, -Math.cos(ang) * 5);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clock = new THREE.Clock();
    var started = false;

    (function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) {
        moon.rotation.y += dt * 0.045 * (CONFIG.mspin / 100);
        earthSpin.rotation.y += dt * (Math.PI * 2 / Math.max(5, CONFIG.eday));
      }
      renderer.render(scene, camera);
      if (!started) { started = true; enable(); }
    })();
  }).catch(function () { /* остаётся статичная луна */ });
})();









