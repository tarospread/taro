/* Вращение и лёгкий 3D-наклон кольца рун (немецкая версия).
   Настройка ссылкой: ?spin=1.2&size=0.9&tilt=0.6 */
(function () {
  var CFG = { spin: 0.30, size: 0.90, tilt: 0.5, glow: 0.40 };

  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has('spin')) CFG.spin = Math.max(0, Math.min(4, Number(qs.get('spin')) || 0));
    if (qs.has('size')) CFG.size = Math.max(0.3, Math.min(1.6, Number(qs.get('size')) || 1));
    if (qs.has('tilt')) CFG.tilt = Math.max(0, Math.min(1, Number(qs.get('tilt')) || 0));
    if (qs.has('glow')) CFG.glow = Math.max(0, Math.min(1, Number(qs.get('glow')) || 0));
  } catch (e) {}

  var host = document.getElementById('runes-bg');
  if (!host) return;

  var img = host.querySelector('img');
  function applyGlow() {
    if (!img) return;
    var g = CFG.glow;
    img.style.filter =
      'drop-shadow(0 0 ' + (4 + g * 14).toFixed(0) + 'px rgba(216,178,106,' + (0.15 + g * 0.55).toFixed(2) + ')) ' +
      'drop-shadow(0 0 ' + (20 + g * 60).toFixed(0) + 'px rgba(89,177,125,' + (0.05 + g * 0.3).toFixed(2) + '))';
  }
  applyGlow();
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    host.style.transform = 'scale(' + CFG.size + ')';
    return;
  }

  var start = performance.now();
  function tick(now) {
    if (document.hidden) { requestAnimationFrame(tick); return; }
    var t = (now - start) / 1000;
    var spin = t * 9 * CFG.spin;                       /* медленное вращение кольца */
    var ry = Math.sin(t * 0.3) * 14 * CFG.tilt;        /* покачивание в 3D */
    var rx = Math.sin(t * 0.23) * 6 * CFG.tilt;
    host.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + spin.toFixed(2) + 'deg) scale(' + CFG.size + ')';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

