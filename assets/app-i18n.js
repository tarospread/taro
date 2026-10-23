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
      drawBtn: 'Draw the cards',
      spreadLabel: 'Spread',
      reversed: 'Use reversed cards',
      reversedHint: 'Beginners usually start without reversed cards.',
      again: 'Ask a different question — or draw again tomorrow.',
      spreads: [
        { name: 'Three cards — past, present, future', pos: ['Past', 'Present', 'Future'] },
        { name: 'Celtic Cross — 10 cards', pos: ['Situation', 'Obstacle', 'Foundation', 'Recent past', 'Possibility', 'Near future', 'Your position', 'Environment', 'Hopes and fears', 'Outcome'] },
        { name: 'Relationships — 5 cards', pos: ['You', 'Partner', 'Strength', 'Weakness', 'Perspective'] },
        { name: 'Mirror — 4 cards', pos: ['How others see you', 'What is inside', 'Strengths', 'Growth zone'] },
        { name: 'Path — 7 cards', pos: ['Cause', 'Experience', 'Baggage', 'Now', 'Near prospect', 'Middle prospect', 'Far prospect'] },
        { name: 'Three supports — body, work, soul', pos: ['Body', 'Work', 'Soul'] },
        { name: 'Year ahead — 12 cards', pos: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] }
      ]
    },
    de: {
      dayLabel: 'Tageskarte',
      dayBtn: 'Heutige Karte aufdecken',
      advice: 'Rat: ',
      drawBtn: 'Karten legen',
      spreadLabel: 'Legung',
      reversed: 'Umgekehrte Karten verwenden',
      reversedHint: 'Anfänger beginnen meist ohne umgekehrte Karten.',
      again: 'Stellen Sie eine andere Frage — oder legen Sie morgen wieder.',
      spreads: [
        { name: 'Drei Karten — Vergangenheit, Gegenwart, Zukunft', pos: ['Vergangenheit', 'Gegenwart', 'Zukunft'] },
        { name: 'Keltisches Kreuz — 10 Karten', pos: ['Situation', 'Hindernis', 'Fundament', 'Jüngste Vergangenheit', 'Möglichkeit', 'Nahe Zukunft', 'Ihre Position', 'Umfeld', 'Hoffnungen und Ängste', 'Ergebnis'] },
        { name: 'Beziehung — 5 Karten', pos: ['Sie', 'Partner', 'Stärke', 'Schwäche', 'Perspektive'] },
        { name: 'Spiegel — 4 Karten', pos: ['Wie man Sie sieht', 'Was innen ist', 'Stärken', 'Wachstumszone'] },
        { name: 'Weg — 7 Karten', pos: ['Ursache', 'Erfahrung', 'Gepäck', 'Jetzt', 'Nahe Perspektive', 'Mittlere Perspektive', 'Ferne Perspektive'] },
        { name: 'Drei Stützen — Körper, Werk, Seele', pos: ['Körper', 'Werk', 'Seele'] },
        { name: 'Jahreslegung — 12 Karten', pos: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] }
      ]
    },
    zh: {
      dayLabel: '今日一牌',
      dayBtn: '翻开今日牌',
      advice: '建议：',
      drawBtn: '开始抽牌',
      spreadLabel: '牌阵',
      reversed: '使用逆位牌',
      reversedHint: '初学者通常先不用逆位。',
      again: '可以换一个问题，或者明天再抽。',
      spreads: [
        { name: '三张牌 — 过去、现在、未来', pos: ['过去', '现在', '未来'] },
        { name: '凯尔特十字 — 10 张', pos: ['处境', '阻碍', '根基', '近期过去', '可能性', '近期未来', '你的立场', '环境', '希望与恐惧', '结果'] },
        { name: '关系 — 5 张', pos: ['你', '对方', '优势', '弱点', '前景'] },
        { name: '镜子 — 4 张', pos: ['别人如何看你', '你的内在', '优势', '成长区'] },
        { name: '路径 — 7 张', pos: ['原因', '经验', '包袱', '现在', '近期', '中期', '远期'] },
        { name: '三个支点 — 身体、事业、心灵', pos: ['身体', '事业', '心灵'] },
        { name: '年度 — 12 张', pos: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'] }
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
    var kind = document.getElementById('spread-kind');
    var chips = document.getElementById('spread-topics');
    var out = document.getElementById('spread-out');
    var btn = document.getElementById('spread-draw');
    var rev = document.getElementById('spread-reversed');
    var revLabel = document.getElementById('spread-reversed-text');
    var revHint = document.getElementById('spread-reversed-hint');
    var kindLabel = document.getElementById('spread-kind-label');
    if (revLabel) revLabel.textContent = T.reversed;
    if (revHint) revHint.textContent = T.reversedHint;
    if (kindLabel) kindLabel.textContent = T.spreadLabel;
    if (btn) btn.textContent = T.drawBtn;
    if (!out || !btn || !DECK.length) return;

    /* на отдельной странице расклад зафиксирован: window.SPREAD_DEFAULT = индекс */
    var current = (typeof window.SPREAD_DEFAULT === 'number') ? window.SPREAD_DEFAULT : 0;
    var fixed = (typeof window.SPREAD_DEFAULT === 'number');

    if (kind && fixed) {
      kind.style.display = 'none';
      if (kindLabel) kindLabel.style.display = 'none';
    }
    if (kind) {
      T.spreads.forEach(function (s, i) {
        var o = document.createElement('option');
        o.value = String(i);
        o.textContent = s.name;
        kind.appendChild(o);
      });
      kind.onchange = function () { current = Number(kind.value) || 0; };
    } else if (chips) {
      T.spreads.forEach(function (s, i) {
        var b = el('button', 'chip' + (i === 0 ? ' on' : ''), s.name);
        b.type = 'button';
        b.onclick = function () {
          current = i;
          Array.prototype.forEach.call(chips.children, function (c) { c.classList.remove('on'); });
          b.classList.add('on');
        };
        chips.appendChild(b);
      });
    }

    btn.onclick = function () {
      out.innerHTML = '';
      var spread = T.spreads[current];
      var count = spread.pos.length;
      var deck = shuffle(DECK).slice(0, count);
      var useRev = !!(rev && rev.checked);

      var head = el('p', 'hint', spread.name);
      head.style.cssText = 'margin:18px 0 0;color:var(--gold-soft)';
      out.appendChild(head);

      deck.forEach(function (card, i) {
        var reversed = useRev && Math.random() < 0.4;
        var c = info(card);

        var box = el('div', 'panel');
        box.style.cssText = 'margin-top:12px;padding:16px 18px';

        var pos = el('p', 'hint', (i + 1) + ' · ' + spread.pos[i]);
        pos.style.margin = '0 0 4px';
        box.appendChild(pos);

        var h = el('h3', '', c.name + (reversed ? ' (↺)' : ''));
        h.style.cssText = 'margin:0 0 8px;font-size:18px;color:var(--gold)';
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




