/* Динамическая луна на фоне «Тихой колоды» — версия с фазой по дате и Землёй.
   Включается классом html.dyn-moon; если что-то не загрузилось — класс не ставится
   и остаётся прежняя статичная фотография луны.

   Отключить целиком: убрать <script src=".../moon-bg-phases.js"> из index.html
   (вернуться к прежней луне — вернуть moon-bg.js).

   НАСТРОЙКИ — правятся здесь, в CONFIG. */
(function () {
  var CONFIG = {
    date: 'auto',      /* 'auto' — сегодняшняя дата; или '2026-09-04' — зафиксировать фазу */
    floor: 0.10,       /* минимальная освещённость: тоньше серп не станет */
    relief: 0.1,       /* резкость рельефа: 0…2; 0.1 — мягкий, «фотографический» */
    mspin: 35,         /* скорость вращения луны: 0 — стоит, 100 — быстро */
    earth: 1,          /* 1 — Земля за луной, 0 — без неё */
    esize: 80,         /* размер Земли, % (15…80) */
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

  /* ── откуда смотрим: страна задаётся языком страницы, можно переопределить ссылкой ?lat=&lon= ── */
  var PLACES = {
    ru: { lat: 59.94, lon: 30.31 },   /* Санкт-Петербург */
    en: { lat: 51.51, lon: -0.13 },   /* Лондон */
    de: { lat: 52.52, lon: 13.40 },   /* Берлин */
    zh: { lat: 39.90, lon: 116.40 }   /* Пекин */
  };
  var langCode = (document.documentElement.lang || 'ru').slice(0, 2).toLowerCase();
  var place = PLACES[langCode] || PLACES.ru;
  var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return null; } })();
  CONFIG.lat = (qs && qs.has('lat')) ? Number(qs.get('lat')) : (CONFIG.lat || place.lat);
  CONFIG.lon = (qs && qs.has('lon')) ? Number(qs.get('lon')) : (CONFIG.lon || place.lon);

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


  /* ── астрономия: усечённые формулы Муса (точность ~1% по фазе) ── */
  var RAD = Math.PI / 180;

  function jdOf(date) { return date.getTime() / 86400000 + 2440587.5; }

  function sunLon(T) {
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD)
          + 0.000289 * Math.sin(3 * M * RAD);
    return (L0 + C) % 360;
  }

  function moonPos(T) {
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841;
    var D  = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868;
    var M  = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
    var Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699;
    var F  = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T;
    var d = D * RAD, m = M * RAD, mp = Mp * RAD, f = F * RAD;

    var lon = Lp
      + 6.289 * Math.sin(mp) + 1.274 * Math.sin(2 * d - mp) + 0.658 * Math.sin(2 * d)
      + 0.214 * Math.sin(2 * mp) - 0.186 * Math.sin(m) - 0.114 * Math.sin(2 * f)
      + 0.059 * Math.sin(2 * d - 2 * mp) + 0.057 * Math.sin(2 * d - m - mp)
      + 0.053 * Math.sin(2 * d + mp) + 0.046 * Math.sin(2 * d - m)
      + 0.041 * Math.sin(m - mp) - 0.035 * Math.sin(d) - 0.031 * Math.sin(m + mp)
      - 0.015 * Math.sin(2 * f - 2 * d) + 0.011 * Math.sin(mp - 4 * d);

    var lat = 5.128 * Math.sin(f) + 0.281 * Math.sin(mp + f) + 0.278 * Math.sin(mp - f)
      + 0.173 * Math.sin(2 * d - f) + 0.055 * Math.sin(2 * d - mp + f)
      + 0.046 * Math.sin(2 * d - mp - f) + 0.033 * Math.sin(2 * d + f)
      + 0.017 * Math.sin(2 * mp + f);

    var dist = 385000.56 - 20905 * Math.cos(mp) - 3699 * Math.cos(2 * d - mp)
      - 2956 * Math.cos(2 * d) - 570 * Math.cos(2 * mp)
      + 246 * Math.cos(2 * mp - 2 * d) - 205 * Math.cos(m - mp);

    return { lon: ((lon % 360) + 360) % 360, lat: lat, dist: dist };
  }

  function equatorial(lonDeg, latDeg, epsDeg) {
    var l = lonDeg * RAD, b = latDeg * RAD, e = epsDeg * RAD;
    var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
    return { ra: ((ra / RAD) % 360 + 360) % 360, dec: dec / RAD };
  }

  function gmst(jd) {
    var T = (jd - 2451545) / 36525;
    var g = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T;
    return ((g % 360) + 360) % 360;
  }

  function moonView(date, lat, lon) {
    var jd = jdOf(date);
    var T = (jd - 2451545) / 36525;
    var eps = 23.4392911 - 0.0130042 * T;

    var sEq = equatorial(sunLon(T), 0, eps);
    var mp = moonPos(T);
    var mEq = equatorial(mp.lon, mp.lat, eps);

    var cosPsi = Math.sin(mEq.dec * RAD) * Math.sin(sEq.dec * RAD)
      + Math.cos(mEq.dec * RAD) * Math.cos(sEq.dec * RAD) * Math.cos((mEq.ra - sEq.ra) * RAD);
    cosPsi = Math.max(-1, Math.min(1, cosPsi));
    var psi = Math.acos(cosPsi) / RAD;

    var dRa = (mEq.ra - sEq.ra) * RAD;
    var chi = Math.atan2(
      Math.cos(sEq.dec * RAD) * Math.sin(dRa),
      Math.sin(sEq.dec * RAD) * Math.cos(mEq.dec * RAD) - Math.cos(sEq.dec * RAD) * Math.sin(mEq.dec * RAD) * Math.cos(dRa)
    ) / RAD;

    var lst = gmst(jd) + lon;
    var H = ((lst - mEq.ra) % 360 + 360) % 360;
    var q = Math.atan2(
      Math.sin(H * RAD),
      Math.tan(lat * RAD) * Math.cos(mEq.dec * RAD) - Math.sin(mEq.dec * RAD) * Math.cos(H * RAD)
    ) / RAD;

    return {
      illum: (1 - Math.cos(psi * RAD)) / 2,
      psi: psi,
      tilt: ((chi - q) % 360 + 360) % 360,
      distance: mp.dist,
      sizeFactor: 385000 / mp.dist
    };
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
      /* Земля ставится в долях видимой половины кадра — не уезжает за край при любом размере */
      var halfH = dist * Math.tan(fov * Math.PI / 360);
      var halfW = halfH * aspect;
      earthPivot.position.set(
        moon.position.x + 0.62 * halfW,
        moon.position.y + 0.34 * halfH,
        -1.6 * dist
      );
      earthSpin.scale.setScalar(Math.min(dist * 0.10 * k, 0.42 * Math.min(halfW, halfH)));
      earthTilt.rotation.z = CONFIG.tilt * Math.PI / 180;
      earthPivot.visible = !!CONFIG.earth && aspect >= CONFIG.earthMinAspect;
    }
    frame();
    window.addEventListener('resize', frame);

    /* ── Фаза по эфемеридам (упрощённые формулы Муса) ── */
    var when = CONFIG.date === 'auto' ? new Date() : new Date(CONFIG.date + 'T12:00:00');
    var view = moonView(when, CONFIG.lat, CONFIG.lon);

    /* угол фазы: 0 — полная, 180° — новолуние */
    var alpha = Math.PI - view.psi * Math.PI / 180;
    if (CONFIG.floor > 0 && view.illum < CONFIG.floor) {
      alpha = Math.acos(Math.max(-1, Math.min(1, 2 * CONFIG.floor - 1)));
    }

    /* наклон яркого лимба: 0° — вверх, 90° — вправо (как видно с выбранной широты) */
    var theta = (90 - view.tilt) * Math.PI / 180;
    var sinA = Math.sin(alpha);
    sun.position.set(sinA * Math.cos(theta) * 5, sinA * Math.sin(theta) * 5, Math.cos(alpha) * 5);

    /* видимый размер: меняется на ±5% в зависимости от расстояния до Луны */
    var sizeFactor = Math.max(0.94, Math.min(1.06, view.sizeFactor));
    moon.scale.setScalar(sizeFactor);

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
    }).catch(function (e) { document.documentElement.setAttribute('data-moon-error', String((e && e.message) || e)); });
})();














