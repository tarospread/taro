/* Динамическая луна на фоне «Тихой колоды».
   Включается классом html.dyn-moon; если что-то не загрузилось — класс не ставится
   и остаётся прежняя статичная фотография луны.
   Отключить: убрать <script src=".../moon-bg.js"> из index.html. */
(function () {
  var host = document.getElementById('moon-bg');
  if (!host) return;

  var enable = function () { document.documentElement.classList.add('dyn-moon'); };

  if (!window.WebGLRenderingContext) return;

  import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js').then(function (THREE) {
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    var mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      '/taro/assets/moon-2k.jpg',
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        mat.map = tex; mat.needsUpdate = true;
      },
      undefined,
      function () {
        /* если 2K не отдался — берём прежнюю карту с CDN */
        loader.load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/planets/moon_1024.jpg', function (tex) {
          tex.colorSpace = THREE.SRGBColorSpace;
          mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 2.6; mat.needsUpdate = true;
        });
      }
    );

    loader.load('/taro/assets/moon-normal.jpg', function (nrm) {
      nrm.colorSpace = THREE.NoColorSpace;
      nrm.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      mat.normalMap = nrm;
      mat.normalScale = new THREE.Vector2(0.9, 0.9);
      mat.needsUpdate = true;
    });
    var moon = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), mat);
    moon.rotation.z = 0.15;
    scene.add(moon);

    var sun = new THREE.DirectionalLight(0xfff4e6, 3.0);
    sun.position.set(3.6, 1.2, 2.2);
    scene.add(sun);
    var earthshine = new THREE.DirectionalLight(0x6f86c6, 0.26);
    earthshine.position.set(-4, -1.5, 2);
    scene.add(earthshine);
    scene.add(new THREE.AmbientLight(0x161226, 0.5));

    function frame() {
      var w = host.clientWidth || window.innerWidth;
      var h = host.clientHeight || window.innerHeight;
      var aspect = w / h;

      /* как на старом фото: луна крупная, чуть выше центра.
         fov фиксирован, расстояние считаем так, чтобы диск занимал ~78% высоты. */
      var cover = aspect < 1 ? 0.88 : 0.70;
      var fov = 32;
      var dist = 1 / (cover * Math.tan(fov * Math.PI / 360));

      camera.fov = fov;
      camera.aspect = aspect;
      camera.position.set(0, 0, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      renderer.setSize(w, h, false);
      moon.position.set(aspect < 1 ? 0 : -0.02, aspect < 1 ? -0.34 : 0.12, 0);
      moon.scale.setScalar(1);
    }
    frame();
    window.addEventListener('resize', frame);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clock = new THREE.Clock();
    var started = false;

    (function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) moon.rotation.y += dt * 0.035;
      renderer.render(scene, camera);
      if (!started) { started = true; enable(); }
    })();
  }).catch(function () { /* остаётся статичная луна */ });
})();








