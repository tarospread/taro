/* 3D-луна для «Тихой колоды»: декоративный фон, без управления, пауза вне экрана. */
(function () {
  var host = document.getElementById('moon-hero');
  if (!host) return;
  var failed = function () { host.style.display = 'none'; };
  if (!window.WebGLRenderingContext) return failed();

  import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js').then(function (THREE) {
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    var mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
    new THREE.TextureLoader().setCrossOrigin('anonymous').load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r161/examples/textures/planets/moon_1024.jpg',
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        mat.map = tex; mat.bumpMap = tex; mat.bumpScale = 2.4; mat.needsUpdate = true;
      },
      undefined,
      function () { /* без текстуры останется матовый шар */ }
    );

    var moon = new THREE.Mesh(new THREE.SphereGeometry(1.35, 96, 96), mat);
    moon.rotation.z = 0.12;
    scene.add(moon);

    var sun = new THREE.DirectionalLight(0xfff6ea, 3.2);
    sun.position.set(4.4, 0.8, 1.6);
    scene.add(sun);
    var earthshine = new THREE.DirectionalLight(0x6a7fb8, 0.3);
    earthshine.position.set(-4, -1, 2);
    scene.add(earthshine);
    scene.add(new THREE.AmbientLight(0x171226, 0.6));

    function resize() {
      var w = host.clientWidth || 1, h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(host);
    }
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var clock = new THREE.Clock();
    (function tick() {
      requestAnimationFrame(tick);
      if (!visible) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!reduced) moon.rotation.y += dt * 0.045;
      renderer.render(scene, camera);
    })();
  }).catch(failed);
})();
