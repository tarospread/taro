/* Дракон-фон для китайской версии.
   Настройки: mode white, tilt 0.55, size 0.60, speed 1.8 (утверждено владельцем).
   Рисунок: «Chinese black dragon», автор Angelus, CC BY-SA 3.0, Wikimedia Commons. */
(function () {
  var CFG = { tilt: 0.55, size: 0.60, speed: 1.8 };

  var host = document.getElementById('dragon-bg');
  if (!host) return;

  var img = host.querySelector('img');
  if (!img) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { host.style.transform = 'scale(' + CFG.size + ')'; return; }

  var start = performance.now();
  function tick(now) {
    if (document.hidden) { requestAnimationFrame(tick); return; }
    var t = (now - start) / 1000 * CFG.speed;
    var rotY = Math.sin(t * 0.35) * 14 * CFG.tilt;
    var rotX = Math.sin(t * 0.27) * 6 * CFG.tilt;
    var z = Math.sin(t * 0.5) * 18 * CFG.tilt;
    host.style.transform = 'rotateY(' + rotY.toFixed(2) + 'deg) rotateX(' + rotX.toFixed(2) + 'deg) translateZ(' + z.toFixed(1) + 'px) scale(' + CFG.size + ')';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
