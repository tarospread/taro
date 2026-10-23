/* Quiet Deck — interactive layer for all languages.
   Card data comes from cards.<lang>.js: window.TAROT_EN / TAROT_DE / TAROT_ZH
   (name, essence, shadow, advice). Order and slugs come from cards.js.
   The daily card uses the same FNV-1a date hash as the Russian app,
   so every language shows the same card on the same day. */
(function () {
  var UI = {
    en: {
      dayLabel: 'Card of the day',
      dayBtn: 'Reveal today’s card',
      advice: 'Advice: ',
      drawBtn: 'Draw three cards',
      reversed: 'Use reversed cards',
      reversedHint: 'Beginners usually start without reversed cards.',
      again: 'Ask a different question — or draw again tomorrow.',
      topics: [
        { label: 'General situation', pos: ['Past', 'Present', 'Future'] },
        { label: 'What to do', pos: ['Situation', 'Obstacle', 'Advice'] },
        { label: 'Relationships', pos: ['You', 'Partner', 'What is between you'] },
        { label: 'Work and money', pos: ['Now', 'What blocks', 'Where it leads'] },
        { label: 'Me and my goal', pos: ['What blocks', 'My resource', 'First step'] }
      ]
    },
    de: {
      dayLabel: 'Tageskarte',
      dayBtn: 'Heutige Karte aufdecken',
      advice: 'Rat: ',
      drawBtn: 'Drei Karten legen',
      reversed: 'Umgekehrte Karten verwenden',
      reversedHint: 'Anfänger beginnen meist ohne umgekehrte Karten.',
      again: 'Stellen Sie eine andere Frage — oder legen Sie morgen wieder.',
      topics: [
        { label: 'Allgemeine Lage', pos: ['Vergangenheit', 'Gegenwart', 'Zukunft'] },
        { label: 'Was tun', pos: ['Situation', 'Hindernis', 'Rat'] },
        { label: 'Beziehung', pos: ['Sie', 'Partner', 'Was zwischen Ihnen steht'] },
        { label: 'Arbeit und Geld', pos: ['Jetzt', 'Was blockiert', 'Wohin es führt'] },
        { label: 'Ich und mein Ziel', pos: ['Was blockiert', 'Meine Ressource', 'Erster Schritt'] }
      ]
    },
    zh: {
      dayLabel: '今日一牌',
      dayBtn: '翻开今日牌',
      advice: '建议：',
      drawBtn: '抽三张牌',
      reversed: '使用逆位牌',
      reversedHint: '初学者通常先不用逆位。',
      again: '可以换一个问题，或者明天再抽。',
      topics: [
        { label: '整体处境', pos: ['过去', '现在', '未来'] },
        { label: '该怎么做', pos: ['处境', '阻碍', '建议'] },
        { label: '关系', pos: ['你', '对方', '你们之间'] },
        { label: '工作与金钱', pos: ['现在', '什么在阻碍', '通向哪里'] },
        { label: '我与目标', pos: ['什么在阻碍', '我的资源', '第一步'] }
      ]
    }
  };

  function langKey() {
    var l = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';
    if (l.indexOf('de') === 0) return 'de';
    return 'en';
  }

  var LANG = langKey();
  var T = UI[LANG];
  var DATA = window['TAROT_' + LANG.toUpperCase()] || { cards: {}, suits: {} };
  var DECK = window.TAROT_CARDS || [];

  function info(card) {
    var d = DATA.cards[card.slug] || {};
    return {
      name: d.name || card.en || card.name,
      essence: d.essence || '',
      shadow: d.shadow || '',
      advice: d.advice || ''
    };
  }

  function hashDate(d) {
    var s = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % DECK.length;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function initDay() {
    var host = document.getElementById('day-card-i18n');
    if (!host || !DECK.length) return;

    var card = DECK[hashDate(new Date())];
    var c = info(card);

    var face = el('div', 'panel');
    face.style.cssText = 'max-width:420px;padding:22px 24px';

    var h = el('h3', '', c.name);
    h.style.cssText = 'margin:0 0 6px;font-size:22px;color:var(--gold)';
    face.appendChild(h);

    var meta = el('p', 'hint', T.dayLabel + ' · ' + new Date().toLocaleDateString(LANG === 'zh' ? 'zh-CN' : LANG === 'de' ? 'de-DE' : 'en-GB'));
    meta.style.margin = '0 0 14px';
    face.appendChild(meta);

    var body = el('p', '', c.essence);
    body.style.margin = '0 0 12px';
    face.appendChild(body);

    if (c.advice) {
      var a = el('p', 'hint', T.advice + c.advice);
      a.style.cssText = 'margin:0;color:var(--gold-soft)';
      face.appendChild(a);
    }

    var box = el('div', '');
    box.style.display = 'none';
    box.appendChild(face);
    host.appendChild(box);

    var btn = el('button', 'btn', T.dayBtn);
    btn.type = 'button';
    btn.onclick = function () { box.style.display = ''; btn.remove(); };
    host.appendChild(btn);
  }

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
    var revLabel = document.getElementById('spread-reversed-text');
    var revHint = document.getElementById('spread-reversed-hint');
    if (revLabel) revLabel.textContent = T.reversed;
    if (revHint) revHint.textContent = T.reversedHint;
    if (!chips || !out || !btn || !DECK.length) return;
    if (btn.dataset.label) { btn.textContent = T.drawBtn; }

    var topic = T.topics[0];

    T.topics.forEach(function (t, idx) {
      var b = el('button', 'chip' + (idx === 0 ? ' on' : ''), t.label);
      b.type = 'button';
      b.onclick = function () {
        topic = t;
        Array.prototype.forEach.call(chips.children, function (c) { c.classList.remove('on'); });
        b.classList.add('on');
      };
      chips.appendChild(b);
    });

    btn.onclick = function () {
      out.innerHTML = '';
      var deck = shuffle(DECK).slice(0, 3);
      var useRev = !!(rev && rev.checked);

      deck.forEach(function (card, i) {
        var reversed = useRev && Math.random() < 0.4;
        var c = info(card);

        var box = el('div', 'panel');
        box.style.cssText = 'margin-top:14px;padding:18px 20px';

        var pos = el('p', 'hint', (i + 1) + ' · ' + topic.pos[i]);
        pos.style.margin = '0 0 4px';
        box.appendChild(pos);

        var h = el('h3', '', c.name + (reversed ? ' (↺)' : ''));
        h.style.cssText = 'margin:0 0 8px;font-size:19px;color:var(--gold)';
        box.appendChild(h);

        var p = el('p', '', reversed ? c.shadow : c.essence);
        p.style.margin = '0';
        box.appendChild(p);

        if (c.advice && !reversed) {
          var a = el('p', 'hint', T.advice + c.advice);
          a.style.cssText = 'margin:8px 0 0;color:var(--gold-soft)';
          box.appendChild(a);
        }

        out.appendChild(box);
      });

      var again = el('p', 'hint', T.again);
      again.style.marginTop = '14px';
      out.appendChild(again);
    };
  }

  function init() { initDay(); initSpread(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

