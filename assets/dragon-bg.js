/* Дракон-фон для китайской версии.
   Настройки: mode white, tilt 0.55, size 0.60, speed 1.8 (утверждено владельцем).
   Рисунок: «Chinese black dragon», автор Angelus, CC BY-SA 3.0, Wikimedia Commons. */
(function () {
  var CFG = { tilt: 0.85, size: 0.70, speed: 1.8 };

  /* настройка ссылкой: ?tilt=0.7&size=0.5&speed=2 */
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has('tilt')) CFG.tilt = Math.max(0, Math.min(1, Number(qs.get('tilt')) || 0));
    if (qs.has('size')) CFG.size = Math.max(0.2, Math.min(1.4, Number(qs.get('size')) || 0.6));
    if (qs.has('speed')) CFG.speed = Math.max(0, Math.min(4, Number(qs.get('speed')) || 1));
  } catch (e) {}

  var host = document.getElementById('dragon-bg');
  if (!host) return;

  var img = host.querySelector('img');
  if (!img) return;

  /* внутренний слой: центрируется CSS, анимируется скриптом */
  var inner = host.querySelector('.dg-inner');
  if (!inner) {
    inner = document.createElement('div');
    inner.className = 'dg-inner';
    host.appendChild(inner);
    inner.appendChild(img);
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { inner.style.transform = 'scale(' + CFG.size + ')'; return; }

  var start = performance.now();
  function tick(now) {
    if (document.hidden) { requestAnimationFrame(tick); return; }
    var t = (now - start) / 1000 * CFG.speed;
    var rotY = Math.sin(t * 0.35) * 14 * CFG.tilt;
    var rotX = Math.sin(t * 0.27) * 6 * CFG.tilt;
    var z = Math.sin(t * 0.5) * 18 * CFG.tilt;
    inner.style.transform = 'rotateY(' + rotY.toFixed(2) + 'deg) rotateX(' + rotX.toFixed(2) + 'deg) translateZ(' + z.toFixed(1) + 'px) scale(' + CFG.size + ')';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();



