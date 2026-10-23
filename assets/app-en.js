/* Quiet Deck — English interactive layer.
   Reuses card order and slugs from cards.js and English meanings from cards.en.js.
   The daily card uses the same FNV-1a date hash as the Russian app, so both languages show the same card. */
(function () {
  var EN = window.TAROT_EN || { cards: {}, suits: {} };
  var RU = window.TAROT_CARDS || [];

  function bySlug(slug) { return EN.cards[slug] || null; }
  function nameOf(card) { return card.en || card.name; }

  function hashDate(d) {
    var s = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % RU.length;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function meaning(card, reversed) {
    var m = bySlug(card.slug) || {};
    return reversed ? (m.shadow || '') : (m.essence || '');
  }

  /* ---------- card of the day ---------- */
  function initDay() {
    var host = document.getElementById('day-card-en');
    if (!host) return;

    var card = RU[hashDate(new Date())];
    var m = bySlug(card.slug) || {};

    var face = el('div', 'panel');
    face.style.cssText = 'max-width:420px;padding:22px 24px';

    var title = el('h3', '', nameOf(card));
    title.style.cssText = 'margin:0 0 6px;font-size:22px;color:var(--gold)';
    face.appendChild(title);

    var meta = el('p', 'hint', 'Card of the day · ' + new Date().toLocaleDateString('en-GB'));
    meta.style.margin = '0 0 14px';
    face.appendChild(meta);

    var body = el('p', '', m.essence || '');
    body.style.margin = '0 0 12px';
    face.appendChild(body);

    if (m.advice) {
      var adv = el('p', 'hint', 'Advice: ' + m.advice);
      adv.style.margin = '0';
      adv.style.color = 'var(--gold-soft)';
      face.appendChild(adv);
    }

    var hiddenBox = el('div', '');
    hiddenBox.style.display = 'none';
    hiddenBox.appendChild(face);
    host.appendChild(hiddenBox);

    var btn = el('button', 'btn', 'Reveal today’s card');
    btn.type = 'button';
    btn.style.marginTop = '4px';
    btn.onclick = function () {
      hiddenBox.style.display = '';
      btn.remove();
    };
    host.appendChild(btn);
  }

  /* ---------- three-card spread ---------- */
  var TOPICS = [
    { key: 'general', label: 'General situation', pos: ['Past', 'Present', 'Future'] },
    { key: 'do', label: 'What to do', pos: ['Situation', 'Obstacle', 'Advice'] },
    { key: 'love', label: 'Relationships', pos: ['You', 'Partner', 'What is between you'] },
    { key: 'work', label: 'Work and money', pos: ['Now', 'What blocks', 'Where it leads'] },
    { key: 'goal', label: 'Me and my goal', pos: ['What blocks', 'My resource', 'First step'] }
  ];
  var topic = TOPICS[0];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function initSpread() {
    var chips = document.getElementById('spread-topics');
    var out = document.getElementById('spread-out');
    var btn = document.getElementById('spread-draw');
    var rev = document.getElementById('spread-reversed');
    if (!chips || !out || !btn) return;

    TOPICS.forEach(function (t) {
      var b = el('button', 'chip', t.label);
      b.type = 'button';
      b.className = 'chip' + (t.key === topic.key ? ' on' : '');
      b.onclick = function () {
        topic = t;
        Array.prototype.forEach.call(chips.children, function (c) { c.classList.remove('on'); });
        b.classList.add('on');
      };
      chips.appendChild(b);
    });

    btn.onclick = function () {
      out.innerHTML = '';
      var deck = shuffle(RU).slice(0, 3);
      var useRev = !!(rev && rev.checked);

      deck.forEach(function (card, i) {
        var reversed = useRev && Math.random() < 0.4;
        var m = bySlug(card.slug) || {};

        var box = el('div', 'panel');
        box.style.cssText = 'margin-top:14px;padding:18px 20px';

        var pos = el('p', 'hint', (i + 1) + ' · ' + topic.pos[i]);
        pos.style.margin = '0 0 4px';
        box.appendChild(pos);

        var h = el('h3', '', nameOf(card) + (reversed ? ' (reversed)' : ''));
        h.style.cssText = 'margin:0 0 8px;font-size:19px;color:var(--gold)';
        box.appendChild(h);

        var p = el('p', '', meaning(card, reversed));
        p.style.margin = '0';
        box.appendChild(p);

        if (m.advice && !reversed) {
          var a = el('p', 'hint', 'Advice: ' + m.advice);
          a.style.cssText = 'margin:8px 0 0;color:var(--gold-soft)';
          box.appendChild(a);
        }

        out.appendChild(box);
      });

      var again = el('p', 'hint', 'Ask a different question — or draw again tomorrow.');
      again.style.marginTop = '14px';
      out.appendChild(again);
    };
  }

  function init() { initDay(); initSpread(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
