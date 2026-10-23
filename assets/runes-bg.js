/* Вращение и лёгкий 3D-наклон кольца рун (немецкая версия).
   Настройка ссылкой: ?spin=1.2&size=0.9&tilt=0.6 */
(function () {
  var CFG = { spin: 1, size: 1, tilt: 0.5 };

  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has('spin')) CFG.spin = Math.max(0, Math.min(4, Number(qs.get('spin')) || 0));
    if (qs.has('size')) CFG.size = Math.max(0.3, Math.min(1.6, Number(qs.get('size')) || 1));
    if (qs.has('tilt')) CFG.tilt = Math.max(0, Math.min(1, Number(qs.get('tilt')) || 0));
  } catch (e) {}

  var host = document.getElementById('runes-bg');
  if (!host) return;
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
