/* ===== Quiet Deck — единый движок сайта для всех языков =====
   Механика взята из assets/app.js (русская версия). Все тексты интерфейса
   вынесены в словарь: window.I18N, файл assets/i18n/<lang>.js подключается
   обычным <script> ДО этим файлом. Никаких сетевых загрузок.
   Язык — атрибут <html lang>: ru, en, de, zh-Hans (zh-Hans → zh).
   Данные колоды — assets/cards.js + assets/cards.<lang>.js (структура одна).
   ES5, без сборщика и внешних зависимостей. */
(function () {
  'use strict';

  var DOC = document;
  var WIN = window;
  var CARDS = WIN.TAROT_CARDS || [];
  var SUITS = WIN.TAROT_SUITS || {};

  /* ---------- язык и словарь ---------- */
  function langKey() {
    var l = ((DOC.documentElement && DOC.documentElement.getAttribute('lang')) || 'ru').toLowerCase();
    if (l.indexOf('zh') === 0) return 'zh';   /* zh-Hans, zh-CN, zh → zh */
    if (l.indexOf('de') === 0) return 'de';
    if (l.indexOf('en') === 0) return 'en';
    return 'ru';
  }

  var LANG = langKey();
  var DICT = WIN.I18N || {};
  var DATA = LANG === 'ru' ? null : (WIN['TAROT_' + LANG.toUpperCase()] || null);
  var LOCALES = { ru: 'ru-RU', en: 'en-GB', de: 'de-DE', zh: 'zh-CN' };

  function isRu() { return LANG === 'ru'; }

  /* T('ключ') либо T('ключ', {name: '…'}) — подстановка {name} */
  function T(key, vars) {
    var s = DICT[key];
    if (s == null) return '';
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] != null ? String(vars[k]) : m;
      });
    }
    return s;
  }
  function has(key) { return DICT[key] != null; }

  /* ---------- данные карты на нужном языке ---------- */
  function cardName(card) {
    if (!card) return '';
    if (isRu()) return card.name || '';
    var d = DATA && DATA.cards && DATA.cards[card.slug];
    if (d && d.name) return d.name;
    return card.en || card.name || '';
  }
  function cardField(card, field) {
    if (!card) return '';
    if (!isRu()) {
      var d = DATA && DATA.cards && DATA.cards[card.slug];
      if (d && d[field]) return d[field];
    }
    return card[field] || '';
  }
  function suitName(suit) {
    if (!isRu() && DATA && DATA.suits && DATA.suits[suit] && DATA.suits[suit].name) {
      return DATA.suits[suit].name;
    }
    return has('suit.' + suit) ? T('suit.' + suit) : ((SUITS[suit] && SUITS[suit].name) || '');
  }
  function suitSphere(suit) {
    var d = (!isRu() && DATA && DATA.suits && DATA.suits[suit]) || SUITS[suit] || {};
    return d.sphere || '';
  }

  /* разряды младших арканов: в cards.js они по-русски, в словаре — ключи */
  var RANK_KEYS = {
    'Туз': 'card.rank.ace', 'Двойка': 'card.rank.two', 'Тройка': 'card.rank.three',
    'Четвёрка': 'card.rank.four', 'Пятёрка': 'card.rank.five', 'Шестёрка': 'card.rank.six',
    'Семёрка': 'card.rank.seven', 'Восьмёрка': 'card.rank.eight', 'Девятка': 'card.rank.nine',
    'Десятка': 'card.rank.ten', 'Паж': 'card.rank.page', 'Рыцарь': 'card.rank.knight',
    'Королева': 'card.rank.queen', 'Король': 'card.rank.king'
  };
  function rankName(card) {
    if (isRu()) return card.rank;
    var k = RANK_KEYS[card.rank];
    return (k && has(k)) ? T(k) : card.rank;
  }

  /* канонические имена позиций — это формат ссылки, а не текст интерфейса;
     поэтому они всегда по-русски, а на экран выводится T('pos.*') */
  var POS_KEYS = {
    'Прошлое': 'pos.past', 'Настоящее': 'pos.present', 'Будущее': 'pos.future',
    'Ситуация': 'pos.situation', 'Препятствие': 'pos.obstacle', 'Совет': 'pos.advice',
    'Ты': 'pos.you', 'Партнёр': 'pos.partner', 'Что между вами': 'pos.between',
    'Сейчас': 'pos.now', 'Что мешает': 'pos.whatBlocks', 'Куда ведёт': 'pos.leadsTo',
    'Мой ресурс': 'pos.myResource', 'Первый шаг': 'pos.firstStep',
    'Фундамент': 'pos.foundation', 'Недавнее прошлое': 'pos.recentPast',
    'Возможность': 'pos.possibility', 'Ближайшее будущее': 'pos.nearFuture',
    'Ваша позиция': 'pos.yourPosition', 'Окружение': 'pos.environment',
    'Надежды и страхи': 'pos.hopesFears', 'Итог': 'pos.outcome',
    'Сильная сторона': 'pos.strength', 'Слабая сторона': 'pos.weakness',
    'Перспектива': 'pos.perspective',
    'Как вас видят': 'pos.howSeen', 'Что внутри': 'pos.inside',
    'Сильные стороны': 'pos.strengths', 'Зона роста': 'pos.growth',
    'Причина': 'pos.cause', 'Опыт': 'pos.experience', 'Багаж': 'pos.baggage',
    'Ближняя перспектива': 'pos.nearProspect', 'Средняя перспектива': 'pos.midProspect',
    'Дальняя перспектива': 'pos.farProspect',
    'Опора тела': 'pos.body', 'Опора дела': 'pos.work', 'Опора души': 'pos.soul',
    'Январь': 'month.1', 'Февраль': 'month.2', 'Март': 'month.3', 'Апрель': 'month.4',
    'Май': 'month.5', 'Июнь': 'month.6', 'Июль': 'month.7', 'Август': 'month.8',
    'Сентябрь': 'month.9', 'Октябрь': 'month.10', 'Ноябрь': 'month.11', 'Декабрь': 'month.12'
  };
  function posLabel(name) {
    if (isRu()) return name;
    var k = POS_KEYS[name];
    return (k && has(k)) ? T(k) : name;
  }

  var ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
    'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

  /* ---------- оформление: единый вид карт (гравюры 1909) и выбор рубашки ---------- */
  var BACKS = [
    { id: 'classic' },
    { id: 'moon' },
    { id: 'geometry' },
    { id: 'retro' }
  ];
  var prefs = { back: 'classic' };
  (function loadPrefs() {
    try {
      var saved = JSON.parse((WIN.localStorage && WIN.localStorage.getItem('taro_prefs')) || '{}');
      if (saved && saved.back) prefs.back = saved.back;
    } catch (e) { /* приватный режим — работаем без сохранения */ }
  })();
  function savePrefs() {
    try { WIN.localStorage && WIN.localStorage.setItem('taro_prefs', JSON.stringify(prefs)); } catch (e) {}
  }
  function base() { return (typeof WIN.SITE_BASE === 'string' && WIN.SITE_BASE) ? WIN.SITE_BASE : '/taro'; }
  /* вопрос для размышления к карте */
  function cardQuestion(card) {
    var q = WIN.TARO_QUESTIONS;
    return (q && card && q[card.slug]) ? q[card.slug] : '';
  }
  /* адреса служебных страниц: /tolkovanie/ и /poslanie/ */
  function pageUrl(name) { return base() + '/' + name + '/'; }

  function el(tag, cls, html) {
    var e = DOC.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function cardHTML(card, reversed) {
    var top, sym, bottom, name = cardName(card);
    if (card.arcana === 'major') {
      top = ROMAN[card.id]; sym = ROMAN[card.id]; bottom = T('card.major');
    } else {
      top = rankName(card); sym = T('glyph.' + card.suit); bottom = T('element.' + card.suit);
    }
    var img = '<img class="face" src="' + base() + '/assets/img/' + card.slug + '.jpg" alt="' +
      T('card.alt', { name: name }) + '" loading="lazy" onerror="this.style.display=\'none\'">';
    return img +
           '<span class="num">' + top + '</span>' +
           '<div class="sym">' + sym + '</div>' +
           '<div class="nm">' + name + '</div>' +
           '<div class="el">' + bottom + '</div>' +
           (reversed ? '<span class="el" style="bottom:22px">' + T('card.reversedTag') + '</span>' : '');
  }

  function renderCard(card, reversed) {
    var d = el('div', 'card' + (reversed ? ' rev' : ''));
    d.setAttribute('data-slug', card.slug);
    d.setAttribute('data-rev', reversed ? '1' : '0');
    d.innerHTML = cardHTML(card, reversed);
    return d;
  }

  function renderBack() {
    var d = el('div', 'card card-back');
    d.innerHTML = '<img class="face" src="' + base() + '/assets/backs/' + prefs.back + '.svg" alt="' +
      T('back.alt') + '">';
    return d;
  }

  /* карта лежит рубашкой вверх и открывается по нажатию.
     delay > 0 — раскрыть автоматически (для карты дня), delay = 0 — только по клику. */
  function renderFlip(card, reversed, delay, onOpen) {
    var wrap = el('div', 'flip');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-label', T('flip.open'));
    var inner = el('div', 'flip-inner');
    var back = el('div', 'flip-side back');
    back.appendChild(renderBack());
    var front = el('div', 'flip-side front');
    front.appendChild(renderCard(card, reversed));
    inner.appendChild(back);
    inner.appendChild(front);
    wrap.appendChild(inner);

    var opened = false;
    function toggle() {
      opened = !opened;
      if (opened) {
        wrap.className += ' flipped';
        wrap.setAttribute('aria-label', T('flip.opened', { name: cardName(card) }));
      } else {
        wrap.className = wrap.className.replace(/\s*flipped/, '');
        wrap.setAttribute('aria-label', T('flip.open'));
      }
      if (onOpen) onOpen(opened);
      /* Метрика: открытие карты — цель card_open */
      if (opened && WIN.ym) { try { WIN.ym(113733436, 'reachGoal', 'card_open'); } catch (e) {} }
    }
    wrap.onclick = toggle;
    wrap.onkeydown = function (e) {
      var k = e.key || '';
      if (k === 'Enter' || k === ' ' || k === 'Spacebar' || e.keyCode === 13 || e.keyCode === 32) {
        if (e.preventDefault) e.preventDefault();
        toggle();
      }
    };
    wrap.openCard = function () { if (!opened) toggle(); };
    wrap.closeCard = function () { if (opened) toggle(); };
    wrap.isOpen = function () { return opened; };
    if (delay > 0) setTimeout(function () { if (opened) return; toggle(); }, delay);
    return wrap;
  }

  /* ---------- раздача из колоды: карты выходят волной и ложатся рубашкой вверх ---------- */
  function dealCards(nodes) {
    if (!nodes || !nodes.length) return;
    if (!DOC.body || !nodes[0].getBoundingClientRect) return;
    if (WIN.matchMedia && WIN.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var deck = el('div', 'deal-deck show');
    for (var k = 0; k < 4; k++) {
      var back = el('img');
      back.src = base() + '/assets/backs/' + prefs.back + '.svg';
      back.alt = '';
      back.style.transform = 'translateY(' + (k * -2) + 'px)';
      deck.appendChild(back);
    }
    DOC.body.appendChild(deck);

    var d = deck.getBoundingClientRect();
    var stagger = Math.min(170, 1600 / nodes.length);   /* длинная раздача не длится дольше 1,6 с */

    Array.prototype.forEach.call(nodes, function (node, i) {
      var r = node.getBoundingClientRect();
      var dx = (d.left + d.width / 2) - (r.left + r.width / 2);
      var dy = (d.top + d.height / 2) - (r.top + r.height / 2);
      node.style.transition = 'none';
      node.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.9)';
      node.style.zIndex = 30;
      /* невидима, пока лежит в колоде: иначе на медленном устройстве карта
         успевает мелькнуть на своём месте до начала полёта */
      node.style.opacity = '0';
      var reflow = node.offsetWidth;   /* заставляем браузер применить стартовое положение */
      void reflow;
      setTimeout(function () {
        /* 1) карта выходит из колоды в веер: лёгкий поворот и подъём */
        var mid = (nodes.length - 1) / 2;
        var fanAngle = (i - mid) * 7;
        var fanLift = -16 - Math.abs(i - mid) * 6;
        node.style.transition = 'transform .30s cubic-bezier(.2,.75,.3,1), opacity .12s linear';
        node.style.opacity = '';
        node.style.transform = 'translate(' + (dx * 0.5) + 'px,' + (dy * 0.5 + fanLift) + 'px) rotate(' + fanAngle + 'deg) scale(.94)';
        /* 2) из веера — на своё место */
        setTimeout(function () {
          node.style.transition = 'transform .42s cubic-bezier(.2,.8,.3,1.05)';
          node.style.transform = '';
          setTimeout(function () { node.style.transition = ''; node.style.zIndex = ''; }, 450);
        }, 290);
      }, 130 + i * stagger);
    });

    /* Колода гаснет сразу после того, как её покинула последняя карта. */
    /* Метрика: карты легли — цель spread_dealt */
    if (WIN.ym && nodes.length > 1) { try { WIN.ym(113733436, 'reachGoal', 'spread_dealt'); } catch (e) {} }

    var depart = 130 + (nodes.length - 1) * stagger;
    setTimeout(function () {
      deck.className = 'deal-deck';
      setTimeout(function () { if (deck.parentNode) deck.parentNode.removeChild(deck); }, 420);
    }, depart + 40);
  }

  /* кнопки «открыть / закрыть все карты» */
  function openAllButton(host, flips) {
    var row = el('div', 'open-all-row');
    var open = el('button', 'btn open-all', T('btn.openAll'));
    open.type = 'button';
    open.onclick = function () { flips.forEach(function (f) { if (f.openCard) f.openCard(); }); };
    var close = el('button', 'btn open-all open-all-close', T('btn.closeAll'));
    close.type = 'button';
    close.onclick = function () { flips.forEach(function (f) { if (f.closeCard) f.closeCard(); }); };
    row.appendChild(open);
    row.appendChild(close);
    host.appendChild(row);
    return row;
  }

  /* смена оформления на уже разложенных картах */
  function applyLive() {
    if (!DOC.querySelectorAll) return;
    Array.prototype.forEach.call(DOC.querySelectorAll('.card'), function (node) {
      var slug = node.getAttribute && node.getAttribute('data-slug');
      if (!slug) return;
      var card = null;
      for (var i = 0; i < CARDS.length; i++) if (CARDS[i].slug === slug) card = CARDS[i];
      if (!card) return;
      var rev = node.getAttribute('data-rev') === '1';
      node.className = 'card' + (rev ? ' rev' : '');
      node.innerHTML = cardHTML(card, rev);
    });
    /* карты на страницах справочника и колоды — они свёрстаны заранее */
    Array.prototype.forEach.call(DOC.querySelectorAll('.static-flip'), function (wrap) {
      Array.prototype.forEach.call(wrap.querySelectorAll('.front .card'), function (node) {
        node.className = 'card';
      });
    });
    Array.prototype.forEach.call(DOC.querySelectorAll('.card-back .face'), function (img) {
      img.src = base() + '/assets/backs/' + prefs.back + '.svg';
    });
  }

  function initPrefs() {
    var slot = DOC.getElementById('prefs-slot');
    var panel = slot;
    if (!panel) {
      var btn = DOC.getElementById('draw') || DOC.getElementById('draw-celtic') || DOC.getElementById('spread-draw');
      if (!btn || !btn.closest) return;
      panel = btn.closest('.panel');
    }
    if (!panel || DOC.getElementById('taro-prefs')) return;

    var box = el('details', 'prefs');
    box.id = 'taro-prefs';
    box.appendChild(el('summary', null, T('prefs.summary')));
    box.appendChild(el('label', null, T('prefs.label')));
    var backHost = el('div', 'chips');
    box.appendChild(backHost);
    box.appendChild(el('div', 'hint', T('prefs.hint')));

    function fill(host, list, key) {
      host.innerHTML = '';
      list.forEach(function (item) {
        var b = el('button', 'chip', T('back.' + item.id));
        b.type = 'button';
        if (prefs[key] === item.id) { b.style.borderColor = 'var(--gold)'; b.style.color = 'var(--text)'; }
        b.onclick = function () {
          prefs[key] = item.id;
          savePrefs();
          Array.prototype.forEach.call(host.children, function (c) { c.style.borderColor = ''; c.style.color = ''; });
          b.style.borderColor = 'var(--gold)'; b.style.color = 'var(--text)';
          applyLive();
        };
        host.appendChild(b);
      });
    }
    fill(backHost, BACKS, 'back');
    panel.appendChild(box);
  }

  /* Детерминированный выбор по дате: у всех одна карта дня, повторно не «перегадывается» */
  function hashDate(d) {
    var s = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) % CARDS.length;
  }

  /* текст карты дня: прямой смысл и совет */
  function dayText(card, host) {
    var ess = cardField(card, 'essence');
    if (isRu()) ess = ess.toLowerCase();
    host.innerHTML = '<p>' + T('day.essence', { name: cardName(card), essence: ess }) + '</p>' +
      '<p><span class="pos">' + T('day.advice') + '</span> ' + cardField(card, 'advice') + '</p>' +
      (cardQuestion(card) ? '<p class="question">' + cardQuestion(card) + '</p>' : '');
    var row = el('p');
    row.style.marginTop = '12px';
    shareButton(row,
      function () {
        var e2 = cardField(card, 'essence');
        if (isRu()) e2 = e2.toLowerCase();
        return T('day.shareText', { name: cardName(card), essence: e2 });
      },
      function () { return siteUrl('/'); },
      T('day.shareBtn'));
    host.appendChild(row);
  }

  function initDay() {
    var ru = DOC.getElementById('day-card');
    var i18n = DOC.getElementById('day-card-i18n');
    if (!ru && !i18n) return;
    var today = new Date();
    var card = CARDS[hashDate(today)];

    /* --- русская разметка: карта + панель с текстом и датой --- */
    if (ru) {
      var t = DOC.getElementById('day-text');
      var d = DOC.getElementById('day-date');
      if (d) d.textContent = today.toLocaleDateString(LOCALES[LANG], { day: 'numeric', month: 'long', year: 'numeric' });

      if (t) t.innerHTML = '<p class="hint">' + T('day.hint') + '</p>';

      var dayFlip = renderFlip(card, false, 0, function (isOpen) {
        if (!t) return;
        if (!isOpen) {
          t.innerHTML = '<p class="hint">' + T('day.hint') + '</p>';
          return;
        }
        t.innerHTML = '';
        dayText(card, t);
      });
      ru.appendChild(dayFlip);
      /* Карта дня никуда не летит: она сразу стоит на своём месте, а по клику крутится. */
      return;
    }

    /* --- разметка переводов: #day-card-i18n в сетке, кнопка «открыть карту» --- */
    var out = el('div');
    out.style.marginTop = '12px';
    out.innerHTML = '<p class="hint">' + T('day.hint') + '</p>';

    var flip = renderFlip(card, false, 0, function (isOpen) {
      if (!isOpen) {
        out.innerHTML = '<p class="hint">' + T('day.hint') + '</p>';
        if (reveal) reveal.style.display = '';
        return;
      }
      out.innerHTML = '';
      dayText(card, out);
      if (reveal) reveal.style.display = 'none';
    });
    i18n.appendChild(flip);
    i18n.appendChild(out);

    var reveal = null;
    if (has('day.btn')) {
      reveal = el('button', 'btn', T('day.btn'));
      reveal.type = 'button';
      reveal.onclick = function () { flip.openCard(); };
      i18n.appendChild(reveal);
    }
  }

  /* ---------- Расклад на 3 карты ---------- */
  /* канонические имена позиций (по-русски) → ключ словаря; см. posLabel */
  var TOPICS = {
    general: { title: 'Общая ситуация', key: 'topic.general', positions: ['Прошлое', 'Настоящее', 'Будущее'] },
    advice:  { title: 'Что делать',     key: 'topic.advice',  positions: ['Ситуация', 'Препятствие', 'Совет'] },
    love:    { title: 'Отношения',      key: 'topic.love',    positions: ['Ты', 'Партнёр', 'Что между вами'] },
    money:   { title: 'Работа и деньги', key: 'topic.money',  positions: ['Сейчас', 'Что мешает', 'Куда ведёт'] },
    self:    { title: 'Я и моя цель',   key: 'topic.self',    positions: ['Что мешает', 'Мой ресурс', 'Первый шаг'] }
  };
  var currentTopic = 'general';

  /* наборы раскладов для страниц переводов (там перечень в <select id="spread-kind">);
     позиции — канонические, по-русски, как в POS_SETS на русских страницах */
  var SPREADS = [
    { nameKey: 'spreads.three.name',         pos: ['Прошлое', 'Настоящее', 'Будущее'] },
    { nameKey: 'spreads.celtic.name',        pos: ['Ситуация', 'Препятствие', 'Фундамент', 'Недавнее прошлое', 'Возможность',
                                                    'Ближайшее будущее', 'Ваша позиция', 'Окружение', 'Надежды и страхи', 'Итог'] },
    { nameKey: 'spreads.relationships.name', pos: ['Ты', 'Партнёр', 'Сильная сторона', 'Слабая сторона', 'Перспектива'] },
    { nameKey: 'spreads.mirror.name',        pos: ['Как вас видят', 'Что внутри', 'Сильные стороны', 'Зона роста'] },
    { nameKey: 'spreads.path.name',          pos: ['Причина', 'Опыт', 'Багаж', 'Сейчас', 'Ближняя перспектива',
                                                    'Средняя перспектива', 'Дальняя перспектива'] },
    { nameKey: 'spreads.supports.name',      pos: ['Опора тела', 'Опора дела', 'Опора души'] },
    { nameKey: 'spreads.year.name',          pos: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',
                                                    'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'] }
  ];
  /* у path в SPREADS позиции как в POS_SETS.R */

  var spreadIndex = (typeof WIN.SPREAD_DEFAULT === 'number') ? WIN.SPREAD_DEFAULT : 0;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function topicTitle(topic) {
    return isRu() ? topic.title : T(topic.key);
  }

  function spread() {
    var qEl = DOC.getElementById('question');
    var q = (qEl && qEl.value || '').trim();
    var warn = DOC.getElementById('q-warn');
    if (q && /^(выйду|будет ли|любит ли|уволят|да или нет|бросит)/i.test(q)) {
      if (warn) {
        warn.textContent = T('spread.qWarn');
        warn.style.display = 'block';
      }
    } else if (warn) { warn.style.display = 'none'; }

    var useRev = DOC.getElementById('reversed-toggle') || DOC.getElementById('spread-reversed');
    var allowRev = useRev ? useRev.checked : false;
    var def = WIN.SPREAD_DEF || null;              /* расклад описан на самой странице */
    var select = DOC.getElementById('spread-kind'); /* перечень раскладов на страницах переводов */
    var useSelect = !!(select && !def);

    var pos, title;
    if (def) {
      pos = def.positions.map(function (p) { return p.name; });
      title = T('spread.pageTitle');
    } else if (useSelect) {
      var spDef = SPREADS[spreadIndex] || SPREADS[0];
      pos = spDef.pos.slice();
      title = T(spDef.nameKey);
    } else {
      pos = TOPICS[currentTopic].positions;
      title = topicTitle(TOPICS[currentTopic]);
    }

    var deck = shuffle(CARDS.slice());
    var picked = deck.slice(0, pos.length);

    var box = DOC.getElementById('spread-result') || DOC.getElementById('spread-out');
    if (!box) return;
    box.innerHTML = '';
    if (!def) box.appendChild(el('h2', null, T('spread.title', { title: title })));
    if (q) {
      var qp = el('p', 'note', '<strong>' + T('spread.yourQuestion') + '</strong> ' + q.replace(/[<>]/g, ''));
      box.appendChild(qp);
    }

    var trip = el('div', (def || useSelect) ? 'spread-grid' : 'triplet');
    var reading = el('div', 'reading');
    var rows = [];
    picked.forEach(function (c, i) {
      rows.push({ c: c, rev: allowRev && Math.random() < 0.35 });
    });

    /* разбор позиции показывается, пока карта открыта */
    var flips = [];
    var revealed = 0;
    var summaryBox = el('div', 'reading-summary');
    summaryBox.style.display = 'none';

    box.appendChild(el('p', 'hint open-hint', T('spread.openHint')));
    rows.forEach(function (r, i) {
      var slot = el('div', 'slot');
      var block = el('div', 'panel reading-item');
      block.style.marginBottom = '12px';
      block.style.display = 'none';
      block.innerHTML = '<div class="pos">' + posLabel(pos[i]) + ' — ' + cardName(r.c) +
        (r.rev ? T('spread.revSuffix') : '') + '</div>' +
        '<p>' + (r.rev ? cardField(r.c, 'shadow') : cardField(r.c, 'essence')) + '.</p>' +
        '<p><em>' + T('spread.advicePrefix') + cardField(r.c, 'advice') + '</em></p>' +
        (cardQuestion(r.c) ? '<p class="question">' + cardQuestion(r.c) + '</p>' : '');
      reading.appendChild(block);

      var flip = renderFlip(r.c, r.rev, 0, function (isOpen) {
        block.style.display = isOpen ? '' : 'none';
        revealed += isOpen ? 1 : -1;
        summaryBox.style.display = (revealed === rows.length) ? '' : 'none';
      });
      flips.push(flip);
      slot.appendChild(flip);
      slot.appendChild(el('div', 'cap', posLabel(pos[i])));
      trip.appendChild(slot);
    });
    /* кнопки — над раскладом, в одну строку */
    openAllButton(box, flips);
    box.appendChild(trip);
    dealCards(flips);

    /* Целостная картина */
    var majors = rows.filter(function (r) { return r.c.arcana === 'major'; }).length;
    var suitCount = {};
    rows.forEach(function (r) { if (r.c.suit) suitCount[r.c.suit] = (suitCount[r.c.suit] || 0) + 1; });
    var summary = [];
    if (majors >= 2) summary.push(T('summary.majorsMany'));
    else if (majors === 0) summary.push(T('summary.majorsNone'));
    Object.keys(suitCount).forEach(function (s) {
      if (suitCount[s] >= 2) summary.push(T('summary.suit', { suit: suitName(s), sphere: suitSphere(s) }));
    });
    if (summary.length) {
      summaryBox.appendChild(el('div', 'note', '<strong>' + T('summary.title') + '</strong> ' + summary.join(' ')));
    }
    summaryBox.appendChild(el('p', 'hint', T('spread.oneQuestion')));
    reading.appendChild(summaryBox);

    box.appendChild(reading);
    if (!useSelect) {
      diaryBlock(box, {
        q: q,
        pos: pos,
        cards: rows.map(function (r) { return { id: r.c.id, rev: r.rev }; })
      }, def ? T('spread.pageTitle') : TOPICS[currentTopic].title);
      thanksBlock(box, {
        q: q,
        pos: pos,
        cards: rows.map(function (r) { return { id: r.c.id, rev: r.rev }; })
      });
    }
    if (box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- ссылка «спасибо»: весь расклад внутри адреса ---------- */
  function b64uEncode(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64uDecode(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function packObj(obj) { return b64uEncode(JSON.stringify(obj)); }

  /* ---------- короткий формат ссылки (v2) ----------
     было: {"v":1,"d":"2026-10-07","q":"","pos":["Прошлое","Настоящее","Будущее"],"c":[[23,0],[0,0],[71,0]]}
     стало: 2|261007|*G|n-0-1z|вопрос|сообщение|ответ
     позиции — либо код известного набора, либо имена через «~»;
     карты — номер в 36-ричной системе, «r» — перевёрнутая.                    */
  var POS_SETS = {
    G: ['Прошлое', 'Настоящее', 'Будущее'],
    A: ['Ситуация', 'Препятствие', 'Совет'],
    L: ['Ты', 'Партнёр', 'Что между вами'],
    M: ['Сейчас', 'Что мешает', 'Куда ведёт'],
    S: ['Что мешает', 'Мой ресурс', 'Первый шаг'],
    K: ['Ситуация', 'Препятствие', 'Фундамент', 'Недавнее прошлое', 'Возможность',
        'Ближайшее будущее', 'Ваша позиция', 'Окружение', 'Надежды и страхи', 'Итог']
  };
  /* наборы позиций раскладов приходят со страницы (window.TARO_POS_SETS из сборки) */
  (function mergeSets() {
    var extra = WIN.TARO_POS_SETS || {};
    Object.keys(extra).forEach(function (k) { POS_SETS[k] = extra[k]; });
  })();

  function posCode(list) {
    var keys = Object.keys(POS_SETS);
    for (var i = 0; i < keys.length; i++) {
      var set = POS_SETS[keys[i]];
      if (set.length !== list.length) continue;
      var same = true;
      for (var j = 0; j < set.length; j++) if (set[j] !== list[j]) { same = false; break; }
      if (same) return '*' + keys[i];
    }
    return list.join('~');
  }
  function posList(code) {
    if (code.charAt(0) === '*') {
      var set = POS_SETS[code.slice(1)];
      if (set) return set.slice();
    }
    return code.split('~');
  }
  function shortDate(d) {
    var dt = d || new Date();
    var y = String(dt.getFullYear()).slice(2);
    var m = String(dt.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var day = String(dt.getDate()); if (day.length < 2) day = '0' + day;
    return y + m + day;
  }
  function longDate(s) {
    if (!s || s.length !== 6) return '';
    return '20' + s.slice(0, 2) + '-' + s.slice(2, 4) + '-' + s.slice(4, 6);
  }
  function cardsCode(cards) {
    return cards.map(function (x) { return Number(x.id).toString(36) + (x.rev ? 'r' : ''); }).join('-');
  }
  function cardsList(code) {
    if (!code) return [];
    return code.split('-').map(function (part) {
      var rev = /r$/.test(part);
      return { id: parseInt(rev ? part.slice(0, -1) : part, 36), rev: rev };
    });
  }

  function packSpread(sp) {
    return b64uEncode(['2', shortDate(), posCode(sp.pos), cardsCode(sp.cards), sp.q || '', '', ''].join('|'));
  }
  function unpackSpread(token) {
    var text;
    try { text = b64uDecode(token); } catch (e) { return null; }

    /* короткий формат */
    if (text.indexOf('2|') === 0) {
      var f = text.split('|');
      var cards = cardsList(f[3] || '');
      if (!cards.length) return null;
      var out = [];
      for (var i = 0; i < cards.length; i++) {
        var card = CARDS[cards[i].id];
        if (!card) return null;
        out.push({ card: card, rev: cards[i].rev });
      }
      return {
        raw: { v: 2, d: longDate(f[1]), pos: posList(f[2] || ''), c: cards.map(function (x) { return [x.id, x.rev ? 1 : 0]; }),
               q: f[4] || '', m: f[5] || '', a: f[6] || '' },
        v2: f, q: f[4] || '', msg: f[5] || '', answer: f[6] || '', date: longDate(f[1]),
        pos: posList(f[2] || ''), cards: out
      };
    }

    /* старый формат — ссылки, отправленные раньше, продолжают работать */
    try {
      var o = JSON.parse(text);
      if (!o || !o.c || !o.pos) return null;
      var list = [];
      for (var k = 0; k < o.c.length; k++) {
        var c = CARDS[o.c[k][0]];
        if (!c) return null;
        list.push({ card: c, rev: !!o.c[k][1] });
      }
      return { raw: o, q: o.q || '', msg: o.m || '', answer: o.a || '', date: o.d || '', pos: o.pos, cards: list };
    } catch (e) { return null; }
  }

  /* перепаковка с новым полем (сообщение или ответ), сохраняя прежний формат */
  function repack(sp, changes) {
    var raw = JSON.parse(JSON.stringify(sp.raw));
    Object.keys(changes || {}).forEach(function (k) { raw[k] = changes[k]; });
    if (raw.v === 2) {
      var d = (raw.d || '').replace(/-/g, '').slice(2);
      return b64uEncode(['2', d, posCode(raw.pos), cardsCode(raw.c.map(function (x) { return { id: x[0], rev: x[1] }; })),
        raw.q || '', raw.m || '', raw.a || ''].join('|'));
    }
    return packObj(raw);
  }

  /* ---------- «поделиться»: без личных данных, только карты и ссылка ---------- */
  function siteUrl(pathname) {
    return (WIN.location ? WIN.location.origin : '') + base() + (pathname || '/');
  }
  function shareButton(host, getText, getUrl, label) {
    var b = el('button', 'btn ghost', label);
    b.type = 'button';
    b.onclick = function () {
      var url = getUrl(), text = getText();
      if (navigator && navigator.share) { navigator.share({ title: T('share.title'), text: text, url: url }); return; }
      if (WIN.open) {
        WIN.open('https://t.me/share/url?url=' + encodeURIComponent(url) +
          '&text=' + encodeURIComponent(text), '_blank');
      }
    };
    host.appendChild(b);
    return b;
  }

  /* кнопка под раскладом */
  function thanksBlock(box, sp) {
    var p = el('div', 'panel');
    p.style.marginTop = '14px';
    p.innerHTML = '<p style="margin:0 0 10px">' + T('thanks.text') + '</p>';
    var b = el('button', 'btn ghost', T('thanks.btn'));
    b.type = 'button';
    b.setAttribute('id', 'thanks-btn');
    b.onclick = function () {
      if (WIN.location) WIN.location.href = pageUrl('poslanie') + '?t=' + packSpread(sp);
    };
    p.appendChild(b);
    shareButton(p,
      function () {
        var names = sp.cards.map(function (x) { return cardName(CARDS[x.id]); }).join(', ');
        return T('share.spreadText', { names: names });
      },
      function () { return siteUrl('/rasklady.html'); },
      T('share.spreadBtn'));
    box.appendChild(p);
  }

  function getParam(name) {
    var search = (WIN.location && WIN.location.search) || '';
    var m = search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function miniSpread(host, sp) {
    var grid = el('div', 'spread-grid');
    sp.cards.forEach(function (x, i) {
      var slot = el('div', 'slot');
      slot.appendChild(renderCard(x.card, x.rev));
      slot.appendChild(el('div', 'cap', posLabel(sp.pos[i]) || T('spread.position', { n: i + 1 })));
      grid.appendChild(slot);
    });
    host.appendChild(grid);
  }

  function field(host, id, label, placeholder, value) {
    var l = el('label', null, label);
    l.setAttribute('for', id);
    host.appendChild(l);
    var t = el('textarea');
    t.id = id;
    t.rows = 4;
    t.placeholder = placeholder || '';
    t.value = value || '';
    host.appendChild(t);
    return t;
  }

  function linkBox(host, url, caption) {
    host.appendChild(el('p', 'hint', caption));
    var inp = el('input');
    inp.type = 'text';
    inp.value = url;
    inp.readOnly = true;
    host.appendChild(inp);
    return inp;
  }

  function copyButton(host, getText, label) {
    var b = el('button', 'btn ghost', label);
    b.type = 'button';
    b.onclick = function () {
      var text = getText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        b.innerHTML = T('ui.copied');
      } else if (WIN.prompt) {
        WIN.prompt(T('ui.copyPrompt'), text);
      }
    };
    host.appendChild(b);
    return b;
  }

  function tgButton(host, getUrl, text) {
    var b = el('button', 'btn', T('ui.sendTelegram'));
    b.type = 'button';
    b.onclick = function () {
      var u = 'https://t.me/share/url?url=' + encodeURIComponent(getUrl()) +
        '&text=' + encodeURIComponent(text);
      if (WIN.open) WIN.open(u, '_blank');
    };
    host.appendChild(b);
    return b;
  }

  /* ссылки на русские разделы — они же стоят на страницах «спасибо» и толкования */
  function linksLine() {
    return '<a href="/rasklady.html">' + T('links.all') + '</a> · ' +
      '<a href="/rasklad.html">' + T('links.three') + '</a> · ' +
      '<a href="/taro/">' + T('links.day') + '</a>';
  }

  /* страница /spasibo.html — сторона посетителя */
  function initThanksPage() {
    var app = DOC.getElementById('thanks-app');
    if (!app) return;
    var token = getParam('t');
    var sp = token ? unpackSpread(token) : null;
    app.innerHTML = '';
    if (!sp) {
      app.appendChild(el('h1', null, T('thanksPage.title')));
      if (!token) {
        app.appendChild(el('p', 'lead', T('thanksPage.noToken')));
        app.appendChild(el('p', 'note', T('thanksPage.howTo')));
      } else {
        app.appendChild(el('p', 'note', T('thanksPage.broken')));
      }
      app.appendChild(el('p', null, linksLine()));
      return;
    }

    var panel = el('div', 'panel');
    panel.appendChild(el('p', 'hint', T('thanksPage.date', { date: sp.date })));
    if (sp.q) panel.appendChild(el('p', null, '<strong>' + T('spread.yourQuestion') + '</strong> ' + sp.q.replace(/[<>]/g, '')));
    app.appendChild(panel);

    miniSpread(app, sp);

    var form = el('div', 'panel');
    form.style.marginTop = '14px';
    var msg = field(form, 'thanks-msg', T('thanksPage.msgLabel'),
      T('thanksPage.msgPlaceholder'), sp.msg);

    function currentToken() { return repack(sp, { m: msg.value.trim() }); }
    function currentUrl() {
      return (WIN.location ? WIN.location.origin : '') + pageUrl('tolkovanie') + '?t=' + currentToken();
    }

    var row = el('p');
    row.style.marginTop = '14px';
    form.appendChild(row);

    /* если настроен бот — ведём клиента прямо в чат с ним */
    if (WIN.SITE_BOT) {
      var bb = el('button', 'btn', T('thanksPage.botBtn'));
      bb.type = 'button';
      bb.onclick = function () {
        var u = 'https://t.me/' + WIN.SITE_BOT + '?start=' + encodeURIComponent(currentToken());
        if (WIN.open) WIN.open(u, '_blank');
      };
      row.appendChild(bb);
    }
    tgButton(row, currentUrl, T('thanksPage.tgText'));
    copyButton(row, currentUrl, T('thanksPage.copyBtn'));
    app.appendChild(form);

    var out = el('div', 'panel');
    out.style.marginTop = '14px';
    app.appendChild(out);
    linkBox(out, currentUrl(), T('thanksPage.linkCaption'));
    out.appendChild(el('p', 'hint', T('thanksPage.hint')));
  }

  /* страница /otvet.html — сторона автора и клиента */
  function initOtvetPage() {
    var app = DOC.getElementById('otvet-app');
    if (!app) return;
    var token = getParam('t');
    var sp = token ? unpackSpread(token) : null;
    app.innerHTML = '';
    if (!sp) {
      app.appendChild(el('h1', null, T('otvetPage.title')));
      if (!token) {
        app.appendChild(el('p', 'lead', T('otvetPage.noToken')));
        app.appendChild(el('p', 'note', T('otvetPage.howTo')));
      } else {
        app.appendChild(el('p', 'note', T('otvetPage.broken')));
      }
      app.appendChild(el('p', null, linksLine()));
      return;
    }

    if (sp.answer) {
      /* клиент смотрит готовый ответ */
      app.appendChild(el('h1', null, T('otvetPage.answerTitle')));
      app.appendChild(el('p', 'lead', T('otvetPage.answerLead', { date: sp.date })));
      if (sp.q) app.appendChild(el('p', 'note', '<strong>' + T('spread.yourQuestion') + '</strong> ' + sp.q.replace(/[<>]/g, '')));
      miniSpread(app, sp);
      var ansBox = el('div', 'panel');
      ansBox.style.marginTop = '16px';
      ansBox.appendChild(el('h2', null, T('otvetPage.authorAnswer')));
      sp.answer.split(/\n{2,}/).forEach(function (par) {
        ansBox.appendChild(el('p', null, par.replace(/[<>]/g, '').replace(/\n/g, '<br>')));
      });
      app.appendChild(ansBox);
      var acts = el('p');
      acts.style.marginTop = '14px';
      app.appendChild(acts);
      var pr = el('button', 'btn ghost', T('otvetPage.print'));
      pr.type = 'button';
      pr.onclick = function () { if (WIN.print) WIN.print(); };
      acts.appendChild(pr);
      app.appendChild(el('p', 'disclaimer', T('otvetPage.disclaimer')));
      return;
    }

    /* автор формирует ответ */
    app.appendChild(el('h1', null, T('otvetPage.requestTitle')));
    app.appendChild(el('p', 'lead', T('otvetPage.requestLead')));
    app.appendChild(el('p', 'hint', T('otvetPage.date', { date: sp.date })));
    if (sp.q) app.appendChild(el('p', 'note', '<strong>' + T('otvetPage.clientQuestion') + '</strong> ' + sp.q.replace(/[<>]/g, '')));
    if (sp.msg) app.appendChild(el('p', 'note', '<strong>' + T('otvetPage.message') + '</strong> ' + sp.msg.replace(/[<>]/g, '')));
    miniSpread(app, sp);

    var form = el('div', 'panel');
    form.style.marginTop = '16px';
    var ans = field(form, 'otvet-text', T('otvetPage.answerLabel'), T('otvetPage.answerPlaceholder'), '');
    var row = el('p');
    row.style.marginTop = '14px';
    form.appendChild(row);

    function answerUrl() {
      return (WIN.location ? WIN.location.origin : '') + pageUrl('tolkovanie') + '?t=' + repack(sp, { a: ans.value.trim() });
    }

    var out = el('div', 'panel');
    out.style.marginTop = '14px';

    var make = el('button', 'btn', T('otvetPage.make'));
    make.type = 'button';
    make.onclick = function () {
      out.innerHTML = '';
      if (!ans.value.trim()) {
        out.appendChild(el('p', 'hint', T('otvetPage.emptyAnswer')));
        return;
      }
      linkBox(out, answerUrl(), T('otvetPage.linkCaption'));
      var r2 = el('p');
      out.appendChild(r2);
      tgButton(r2, answerUrl, T('otvetPage.tgText'));
      copyButton(r2, answerUrl, T('otvetPage.copyBtn'));
      var open = el('button', 'btn ghost', T('otvetPage.openAsClient'));
      open.type = 'button';
      open.onclick = function () { if (WIN.open) WIN.open(answerUrl(), '_blank'); };
      r2.appendChild(open);
    };
    row.appendChild(make);
    form.appendChild(el('p', 'hint', T('otvetPage.permission')));
    app.appendChild(form);
    app.appendChild(out);
  }

  function initTopics() {
    var box = DOC.getElementById('topics');
    if (!box) return;
    Object.keys(TOPICS).forEach(function (k) {
      var b = el('button', 'chip', topicTitle(TOPICS[k]));
      b.type = 'button';
      if (k === currentTopic) { b.style.borderColor = 'var(--gold)'; b.style.color = 'var(--text)'; }
      b.onclick = function () {
        currentTopic = k;
        Array.prototype.forEach.call(box.children, function (c) { c.style.borderColor = ''; c.style.color = ''; });
        b.style.borderColor = 'var(--gold)'; b.style.color = 'var(--text)';
      };
      box.appendChild(b);
    });
  }

  /* перечень раскладов на страницах переводов (#spread-kind) */
  function initSpreadPicker() {
    var select = DOC.getElementById('spread-kind');
    if (!select) return;
    var fixed = (typeof WIN.SPREAD_DEFAULT === 'number');
    var kindLabel = DOC.getElementById('spread-kind-label');
    var btn = DOC.getElementById('spread-draw');
    var revLabel = DOC.getElementById('spread-reversed-text');
    var revHint = DOC.getElementById('spread-reversed-hint');

    if (revLabel) revLabel.textContent = T('spread.reversed');
    if (revHint) revHint.textContent = T('spread.reversedHint');
    if (kindLabel) kindLabel.textContent = T('spread.label');
    if (btn) btn.textContent = T('spread.draw');

    if (fixed) {
      select.style.display = 'none';
      if (kindLabel) kindLabel.style.display = 'none';
    }
    select.innerHTML = '';
    SPREADS.forEach(function (s, i) {
      var o = DOC.createElement('option');
      o.value = String(i);
      o.textContent = T(s.nameKey);
      select.appendChild(o);
    });
    select.value = String(spreadIndex);
    select.onchange = function () { spreadIndex = Number(select.value) || 0; };
  }

  /* ---------- Кельтский крест: 10 карт ---------- */
  var CELTIC = [
    { area: 'p12', title: 'Ситуация',         key: 'pos.situation' },
    { area: 'p12', title: 'Препятствие',      key: 'pos.obstacle' },
    { area: 'p3',  title: 'Фундамент',        key: 'pos.foundation' },
    { area: 'p4',  title: 'Недавнее прошлое', key: 'pos.recentPast' },
    { area: 'p5',  title: 'Возможность',      key: 'pos.possibility' },
    { area: 'p6',  title: 'Ближайшее будущее', key: 'pos.nearFuture' },
    { area: 'p7',  title: 'Ваша позиция',     key: 'pos.yourPosition' },
    { area: 'p8',  title: 'Окружение',        key: 'pos.environment' },
    { area: 'p9',  title: 'Надежды и страхи', key: 'pos.hopesFears' },
    { area: 'p10', title: 'Итог',             key: 'pos.outcome' }
  ];
  function celticTitle(p) { return isRu() ? p.title : T(p.key); }

  function celticSpread() {
    var qEl = DOC.getElementById('celtic-question');
    var q = (qEl && qEl.value || '').trim();
    var deck = shuffle(CARDS.slice()).slice(0, 10);

    var box = DOC.getElementById('celtic-result');
    box.innerHTML = '';
    if (q) box.appendChild(el('p', 'note', '<strong>' + T('spread.yourQuestion') + '</strong> ' + q.replace(/[<>]/g, '')));

    var grid = el('div', 'celtic');
    var reading = el('div', 'reading');
    var flips = [];
    var revealed = 0;
    var summaryBox = el('div', 'reading-summary');
    summaryBox.style.display = 'none';

    /* блоки разбора создаём заранее и показываем по мере открытия карт */
    CELTIC.forEach(function (p, i) {
      var c = deck[i];
      var block = el('div', 'panel reading-item');
      block.style.marginBottom = '12px';
      block.style.display = 'none';
      block.innerHTML = '<div class="pos">' + (i + 1) + '. ' + celticTitle(p) + ' — ' + cardName(c) + '</div>' +
        '<p>' + cardField(c, 'essence') + '.</p><p><em>' + T('spread.advicePrefix') + cardField(c, 'advice') + '</em></p>' +
        (cardQuestion(c) ? '<p class="question">' + cardQuestion(c) + '</p>' : '');
      reading.appendChild(block);
    });

    function openHandler(i) {
      return function (isOpen) {
        var block = reading.children[i];
        if (block) block.style.display = isOpen ? '' : 'none';
        revealed += isOpen ? 1 : -1;
        summaryBox.style.display = (revealed === CELTIC.length) ? '' : 'none';
      };
    }

    /* позиции 1 и 2 лежат в одной ячейке — вторая карта поперёк первой */
    var CELLS = [['p3'], ['p6'], ['p5'], ['p12', 'p12'], ['p4'], ['p8'], ['p10'], ['p7'], ['p9']];
    var used = 0;
    CELLS.forEach(function (cell) {
      var slot = el('div', 'slot celtic-slot');
      slot.style.gridArea = cell[0];
      var holder;
      if (cell.length > 1) {
        holder = el('div', 'pair');
        cell.forEach(function (_, k) {
          var c = renderFlip(deck[used + k], false, 0, openHandler(used + k));
          flips.push(c);
          holder.appendChild(c);
        });
      } else {
        holder = renderFlip(deck[used], false, 0, openHandler(used));
        flips.push(holder);
      }
      slot.appendChild(holder);
      var nums = cell.map(function (_, k) { return used + k + 1; }).join(' и ');
      var titles = cell.map(function (_, k) { return celticTitle(CELTIC[used + k]); }).join(' / ');
      slot.appendChild(el('div', 'cap', nums + '. ' + titles));
      used += cell.length;
      grid.appendChild(slot);
    });

    box.appendChild(el('p', 'hint open-hint', T('spread.openHint')));
    /* кнопки — над раскладом, в одну строку */
    openAllButton(box, flips);
    box.appendChild(grid);
    dealCards(flips);

    var majors = deck.filter(function (c) { return c.arcana === 'major'; }).length;
    var sum = [];
    if (majors >= 4) sum.push(T('summary.celticMany', { n: majors }));
    else if (majors <= 1) sum.push(T('summary.celticFew'));
    sum.push(T('summary.celticCompare'));
    summaryBox.appendChild(el('div', 'note', '<strong>' + T('summary.title') + '</strong> ' + sum.join(' ')));
    summaryBox.appendChild(el('p', 'hint', T('summary.celticOrder')));
    reading.appendChild(summaryBox);

    box.appendChild(reading);
    thanksBlock(box, {
      q: q,
      pos: CELTIC.map(function (p) { return p.title; }),
      cards: deck.map(function (c) { return { id: c.id, rev: false }; })
    });
    if (box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- меню с выпадающими подменю ---------- */
  function initNav() {
    if (!DOC.querySelectorAll) return;
    var items = DOC.querySelectorAll('.nav-item');
    if (!items.length) return;
    var list = Array.prototype.slice.call(items);

    function closeAll(except) {
      list.forEach(function (item) {
        if (item === except) return;
        item.className = item.className.replace(/\s*open/, '');
        var t = item.querySelector('.nav-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    list.forEach(function (item) {
      var toggle = item.querySelector('.nav-toggle');
      if (!toggle) return;
      toggle.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var willOpen = item.className.indexOf('open') < 0;
        closeAll(item);
        if (willOpen) {
          item.className += ' open';
          toggle.setAttribute('aria-expanded', 'true');
        } else {
          closeAll();
        }
      };
      /* закрываем меню при переходе по ссылке */
      Array.prototype.forEach.call(item.querySelectorAll('.nav-panel a'), function (a) {
        a.onclick = function () { closeAll(); };
      });
    });

    DOC.onclick = function () { closeAll(); };
    DOC.onkeydown = function (e) {
      if ((e.key || '') === 'Escape' || e.keyCode === 27) closeAll();
    };
  }

  /* ---------- статические карты-перевёртыши ---------- */
  function initStaticFlips() {
    if (!DOC.querySelectorAll) return;
    var suffix = T('flip.openSuffix');
    var suffixRe = new RegExp(suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*$');
    var nodes = DOC.querySelectorAll('.static-flip');
    Array.prototype.forEach.call(nodes, function (wrap) {
      function toggle() {
        var isOpen = wrap.className.indexOf('flipped') >= 0;
        wrap.className = isOpen ? wrap.className.replace(/\s*flipped/, '') : wrap.className + ' flipped';
        var label = wrap.getAttribute('aria-label') || '';
        wrap.setAttribute('aria-label', isOpen ? label.replace(suffixRe, '') : label + suffix);
      }
      wrap.onclick = toggle;
      wrap.onkeydown = function (e) {
        var k = e.key || '';
        if (k === 'Enter' || k === ' ' || k === 'Spacebar' || e.keyCode === 13 || e.keyCode === 32) {
          if (e.preventDefault) e.preventDefault();
          toggle();
        }
      };
    });
  }

  /* ---------- звёздная пыль на фоне: свои 30 строк, без библиотек ---------- */
  function initDust() {
    if (!DOC.body || !DOC.createElement) return;
    var canvas = DOC.createElement('canvas');
    canvas.id = 'dust';
    DOC.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var still = WIN.matchMedia && WIN.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var small = WIN.innerWidth && WIN.innerWidth < 700;
    var count = small ? 22 : 55;
    var dots = [];

    function size() {
      canvas.width = WIN.innerWidth || 1024;
      canvas.height = WIN.innerHeight || 768;
    }
    size();
    for (var i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + .5,
        v: (small ? .25 : .45) + Math.random() * .6,
        a: Math.random() * .4 + .22
      });
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y -= d.v;
        if (d.y < -4) { d.y = canvas.height + 4; d.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.284);
        ctx.fillStyle = 'rgba(235,230,255,' + d.a.toFixed(2) + ')';
        ctx.fill();
      }
    }
    draw();
    if (still) return;
    var raf = WIN.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    (function loop() { draw(); raf(loop); })();
    if (WIN.addEventListener) WIN.addEventListener('resize', size);
  }

  /* ---------- «Спасибо» в меню: карта с QR для перевода. Без реквизитов на странице ---------- */
  function initThanksCard() {
    var D = WIN.TARO_DONATE;
    if (!D || !DOC.querySelector) return;
    var open = DOC.querySelector('.nav-thanks');
    if (!open) return;
    /* пока нечем платить — пункта в меню нет вовсе: лучше ничего, чем код, ведущий в поиск */
    if (!D.ready) { if (open.parentNode) open.parentNode.removeChild(open); return; }

    var overlay = null;

    function qrSrc() {
      return base() + '/assets/qr/' + (D.officialFile || 'thanks.svg');
    }

    function close() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
      if (DOC.onkeydown === escHandler) DOC.onkeydown = null;
    }
    function escHandler(e) { if ((e.key || '') === 'Escape') close(); }

    function build() {
      overlay = el('div', 'thanks-overlay');
      var box = el('div', 'thanks-box');

      var card = el('div', 'flip static-flip thanks-card');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', T('donate.openAria'));
      var inner = el('div', 'flip-inner');
      var backSide = el('div', 'flip-side back');
      var backCard = el('div', 'card card-back');
      backCard.innerHTML = '<img class="face" src="' + base() + '/assets/backs/' + prefs.back + '.svg" alt="' +
        T('back.alt') + '">';
      backSide.appendChild(backCard);

      var frontSide = el('div', 'flip-side front');
      var panel = el('div', 'card thanks-front');
      panel.innerHTML =
        '<span class="thanks-frame"></span>' +
        '<p class="thanks-title">' + D.title + '</p>' +
        '<span class="thanks-divider"><i></i></span>' +
        '<span class="thanks-qr-frame"><img class="thanks-qr" src="' + qrSrc() + '" alt="QR"></span>' +
        '<p class="thanks-hint">' + T('donate.camera') + '</p>' +
        '<p class="thanks-sub">' + (D.subtitle || '') + '</p>' +
        (D.payLink ? '' : '<p class="thanks-sub">' + T('donate.noLink') + '</p>');
      frontSide.appendChild(panel);
      inner.appendChild(backSide);
      inner.appendChild(frontSide);
      card.appendChild(inner);

      var actions = el('p', 'thanks-actions');
      /* перевод — по ссылке из банка; «просто спасибо» — тёплое слово без денег.
         Второе работает через бота: без него кнопки нет. */
      if (WIN.SITE_BOT) {
        var just = el('a', 'btn open-all thanks-just', T('donate.just'));
        just.setAttribute('href', 'https://t.me/' + WIN.SITE_BOT + '?start=thanks');
        just.setAttribute('rel', 'noopener');
        actions.appendChild(just);
      }
      if (D.payLink) {
        var pay = el('a', 'btn open-all thanks-pay', D.payLinkLabel || T('donate.pay'));
        pay.setAttribute('href', D.payLink);
        pay.setAttribute('rel', 'noopener');
        actions.appendChild(pay);
      }
      var shut = el('button', 'btn open-all open-all-close', T('donate.close'));
      shut.type = 'button';
      shut.onclick = close;
      actions.appendChild(shut);

      function toggleCard() {
        card.className = card.className.indexOf('flipped') >= 0
          ? 'flip static-flip thanks-card'
          : 'flip static-flip thanks-card flipped';
      }
      card.onclick = toggleCard;
      card.onkeydown = function (e) {
        var k = e.key || '';
        if (k === 'Enter' || k === ' ' || e.keyCode === 13 || e.keyCode === 32) { if (e.preventDefault) e.preventDefault(); toggleCard(); }
      };

      box.appendChild(el('p', 'hint', T('donate.tapCard')));
      box.appendChild(card);
      box.appendChild(actions);
      overlay.appendChild(box);
      overlay.onclick = function (e) { if (e.target === overlay) close(); };
      DOC.body.appendChild(overlay);
      DOC.onkeydown = escHandler;
    }

    open.onclick = function () {
      if (overlay) { close(); return; }
      build();
    };
  }

  /* ---------- Телеграм: сайт внутри мини-приложения ---------- */
  /* Внутри Телеграма сайт превращается в приложение: нижние вкладки вместо шапки,
     нативная кнопка «Назад», виброотклик. В обычном браузере ничего не меняется. */
  function tgPath() {
    var b = WIN.SITE_BASE || '';
    var p = location.pathname;
    if (b && p.indexOf(b) === 0) p = p.slice(b.length);
    return p || '/';
  }

  function tgTabs() {
    var b = WIN.SITE_BASE || '';
    /* root — «настоящая» вкладка: на ней нативная кнопка «Назад» не нужна.
       У «Ещё» root нет: страницы этого раздела открыты с вкладки, значит назад есть куда. */
    return [
      { href: b + '/', icon: '🌙', label: T('tgTab.day'), re: /^\/$|^\/index\.html$/, root: true },
      { href: b + '/rasklad.html', icon: '🔮', label: T('tgTab.spread'), re: /^\/rasklad/, root: true },
      { href: b + '/karty/', icon: '📖', label: T('tgTab.cards'), re: /^\/karty/, root: true },
      { icon: '⋯', label: T('tgTab.more'), more: true,
        re: /^\/blog|^\/legenda|^\/koloda|^\/tablica|^\/dnevnik|^\/o-kolode|^\/rasklady/ }
    ];
  }

  /* Экран «Ещё»: то, что не влезло в четыре вкладки */
  function tgMoreScreen(tg) {
    var b = WIN.SITE_BASE || '';
    var overlay = el('div', 'tg-more');
    var box = el('div', 'tg-more-box');
    box.appendChild(el('p', 'tg-more-title', T('tgMore.title')));

    var links = [
      ['/blog/', T('tgMore.articles')],
      ['/legenda.html', T('tgMore.legend')],
      ['/rasklady.html', T('tgMore.allSpreads')],
      ['/koloda.html', T('tgMore.deck')],
      ['/tablica-znacheniy.html', T('tgMore.table')],
      ['/dnevnik/', T('tgMore.diary')],
      ['/o-kolode.html', T('tgMore.about')]
    ];
    links.forEach(function (l) {
      var a = el('a', 'tg-more-link', l[1]);
      a.setAttribute('href', b + l[0]);
      box.appendChild(a);
    });

    var shut = el('button', 'btn open-all', T('donate.close'));
    shut.type = 'button';
    shut.onclick = function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    box.appendChild(shut);
    overlay.appendChild(box);
    overlay.onclick = function (e) { if (e.target === overlay) shut.onclick(); };
    DOC.body.appendChild(overlay);
  }

  function tgBuzz(tg, style) {
    try { if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style || 'light'); } catch (e) {}
  }

  function initTelegram() {
    var tg = WIN.Telegram && WIN.Telegram.WebApp;
    if (!tg) return;                       /* обычный браузер — ничего не меняем */
    /* вкладки ведут в русские разделы: переведённых страниц для всех вкладок нет,
       поэтому на переводах, как и раньше, мини-приложение не включается */
    if (!isRu()) return;

    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#14101d');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#14101d');
    } catch (e) { /* старые версии клиента — просто продолжаем */ }

    /* при открытии из Телеграма шапку сайта прячем: там своя шапка, а вкладки снизу */
    var head = DOC.querySelector && DOC.querySelector('header.site');
    if (head && head.parentNode) head.parentNode.removeChild(head);
    if (DOC.body && DOC.body.className.indexOf('tg-app') < 0) {
      DOC.body.className += ' tg-app';
    }

    /* нижние вкладки */
    var path = tgPath();
    var tabs = tgTabs();
    var bar = el('nav', 'tg-tabs');
    tabs.forEach(function (t) {
      var on = t.re && t.re.test(path);
      var node;
      if (t.more) {
        node = el('button', 'tg-tab' + (on ? ' on' : ''), '<span>' + t.icon + '</span>' + t.label);
        node.type = 'button';
        node.onclick = function () { tgBuzz(tg); tgMoreScreen(tg); };
      } else {
        node = el('a', 'tg-tab' + (on ? ' on' : ''), '<span>' + t.icon + '</span>' + t.label);
        node.setAttribute('href', t.href);
        node.onclick = function () { tgBuzz(tg); };
      }
      bar.appendChild(node);
    });
    DOC.body.appendChild(bar);

    /* нативная кнопка «Назад»: показываем везде, кроме вкладок */
    try {
      if (tg.BackButton) {
        var atTab = tabs.some(function (t) { return t.root && t.re && t.re.test(path); });
        if (atTab) tg.BackButton.hide();
        else {
          tg.BackButton.show();
          tg.BackButton.onClick(function () { history.back(); });
        }
      }
    } catch (e) { /* старые клиенты */ }

    /* в Телеграме кнопку «Спасибо» можно заменить нативной оплатой —
       включится, когда в donate.js появится платёжный провайдер */
    var D = WIN.TARO_DONATE;
    if (D && D.ready && tg.openLink && D.payLink) {
      var openBtn = DOC.querySelector('.nav-thanks');
      if (openBtn) {
        openBtn.onclick = function () { tg.openLink(D.payLink); };
      }
    }
  }

  /* ---------- дневник: расклады и заметки хранятся в браузере ---------- */
  function diaryLoad() {
    try { return JSON.parse((WIN.localStorage && WIN.localStorage.getItem('taro_diary')) || '[]'); }
    catch (e) { return []; }
  }
  function diarySave(list) {
    try { WIN.localStorage && WIN.localStorage.setItem('taro_diary', JSON.stringify(list)); } catch (e) {}
  }
  function diaryAdd(entry) {
    var list = diaryLoad();
    list.unshift(entry);
    if (list.length > 200) list = list.slice(0, 200);
    diarySave(list);
    return list.length;
  }
  function diaryEntry(sp, title) {
    return {
      ts: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      title: title || T('diary.defaultTitle'),
      q: sp.q || '',
      pos: sp.pos || [],
      cards: (sp.cards || []).map(function (c) { return { id: c.id, rev: !!c.rev }; }),
      note: ''
    };
  }
  /* кнопка сохранения под раскладом */
  function diaryBlock(box, sp, title) {
    var p = el('div', 'panel');
    p.style.marginTop = '14px';
    var b = el('button', 'btn open-all', T('diary.save'));
    b.type = 'button';
    b.onclick = function () {
      diaryAdd(diaryEntry(sp, title));
      b.innerHTML = T('diary.saved');
      b.disabled = true;
    };
    p.appendChild(b);
    var link = el('p', 'hint');
    link.innerHTML = T('diary.hint') + ' <a href="' + pageUrl('dnevnik') + '">' + T('diary.open') + '</a>';
    p.appendChild(link);
    box.appendChild(p);
  }

  /* страница /dnevnik/ */
  function initDiaryPage() {
    var app = DOC.getElementById('diary-app');
    if (!app) return;
    var list = diaryLoad();
    app.innerHTML = '';

    if (!list.length) {
      app.appendChild(el('p', 'note', T('diary.empty')));
      return;
    }

    var bar = el('p', 'thanks-actions');
    var exp = el('button', 'btn open-all open-all-close', T('diary.export'));
    exp.type = 'button';
    exp.onclick = function () {
      var text = list.map(function (e) {
        var cards = e.cards.map(function (c) {
          return CARDS[c.id] ? cardName(CARDS[c.id]) + (c.rev ? T('diary.revShort') : '') : '?';
        }).join(', ');
        return e.date + ' — ' + e.title + '\n' + (e.q ? T('diary.question') + e.q + '\n' : '') +
          T('diary.cards') + cards + '\n' + (e.note ? T('diary.note') + e.note + '\n' : '');
      }).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        exp.innerHTML = T('ui.copied');
      } else if (WIN.print) { WIN.print(); }
    };
    var clr = el('button', 'btn open-all open-all-close', T('diary.clear'));
    clr.type = 'button';
    clr.onclick = function () {
      if (WIN.confirm && !WIN.confirm(T('diary.clearConfirm'))) return;
      diarySave([]);
      initDiaryPage();
    };
    bar.appendChild(exp);
    bar.appendChild(clr);
    app.appendChild(bar);

    list.forEach(function (entry, idx) {
      var card = el('div', 'panel');
      card.style.marginBottom = '14px';
      var cards = entry.cards.map(function (c) {
        var k = CARDS[c.id];
        return k ? cardName(k) + (c.rev ? T('diary.revLong') : '') : T('diary.cardNo', { id: c.id });
      }).join(' · ');
      card.innerHTML = '<div class="pos">' + entry.date + ' — ' + entry.title + '</div>' +
        (entry.q ? '<p><strong>' + T('spread.yourQuestion') + '</strong> ' + entry.q.replace(/[<>]/g, '') + '</p>' : '') +
        '<p>' + cards + '</p>';
      var ta = el('textarea');
      ta.rows = 2;
      ta.placeholder = T('diary.notePlaceholder');
      ta.value = entry.note || '';
      ta.onchange = function () {
        var all = diaryLoad();
        if (all[idx]) { all[idx].note = ta.value; diarySave(all); }
      };
      card.appendChild(ta);
      var del = el('button', 'chip', T('diary.delete'));
      del.type = 'button';
      del.onclick = function () {
        var all = diaryLoad();
        all.splice(idx, 1);
        diarySave(all);
        initDiaryPage();
      };
      card.appendChild(del);
      app.appendChild(card);
    });
  }

  DOC.addEventListener('DOMContentLoaded', function () {
    initDay();
    initTopics();
    initSpreadPicker();
    initPrefs();
    initNav();
    initStaticFlips();
    initDust();
    initThanksCard();
    initTelegram();
    initDiaryPage();
    initThanksPage();
    initOtvetPage();
    var b = DOC.getElementById('draw') || DOC.getElementById('spread-draw');
    if (b) b.onclick = spread;
    var dc = DOC.getElementById('draw-celtic');
    if (dc) dc.onclick = celticSpread;
    var rc = DOC.getElementById('reset-celtic');
    if (rc) rc.onclick = function () { DOC.getElementById('celtic-result').innerHTML = ''; };
  });

  /* отладочный доступ — используется дымовым тестом src/test-smoke.js */
  WIN.TARO_DEBUG = {
    prefs: prefs, BACKS: BACKS, cardHTML: cardHTML, applyLive: applyLive,
    packSpread: packSpread, unpackSpread: unpackSpread, packObj: packObj, initNav: initNav,
    b64uDecode: b64uDecode, b64uEncode: b64uEncode, repack: repack, initStaticFlips: initStaticFlips,
    initPrefs: initPrefs, T: T, lang: LANG
  };
})();

