/* ===== Логика гаданий: карта дня и расклад на 3 карты ===== */
(function () {
  'use strict';
  var SUITS = window.TAROT_SUITS, CARDS = window.TAROT_CARDS;
  var GLYPH = { wands: 'Ж', cups: 'К', swords: 'М', pentacles: 'П' };
  var ELEMENT = { wands: 'Огонь', cups: 'Вода', swords: 'Воздух', pentacles: 'Земля' };
  var ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];

  /* ---------- оформление: единый вид карт (гравюры 1909) и выбор рубашки ---------- */
  var BACKS = [
    { id: 'classic', name: 'Классика' },
    { id: 'moon', name: 'Луна' },
    { id: 'geometry', name: 'Геометрия' },
    { id: 'retro', name: 'Ретро' }
  ];
  var prefs = { back: 'classic' };
  (function loadPrefs() {
    try {
      var saved = JSON.parse((window.localStorage && window.localStorage.getItem('taro_prefs')) || '{}');
      if (saved && saved.back) prefs.back = saved.back;
    } catch (e) { /* приватный режим — работаем без сохранения */ }
  })();
  function savePrefs() {
    try { window.localStorage && window.localStorage.setItem('taro_prefs', JSON.stringify(prefs)); } catch (e) {}
  }
  function base() { return window.SITE_BASE || ''; }
  /* вопрос для размышления к карте */
  function cardQuestion(card) {
    var q = window.TARO_QUESTIONS;
    return (q && card && q[card.slug]) ? q[card.slug] : '';
  }
  /* адреса служебных страниц: /tolkovanie/ и /poslanie/ */
  function pageUrl(name) { return base() + '/' + name + '/'; }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function cardHTML(card, reversed) {
    var top, sym, bottom;
    if (card.arcana === 'major') {
      top = ROMAN[card.id]; sym = ROMAN[card.id]; bottom = 'Старший Аркан';
    } else {
      top = card.rank; sym = GLYPH[card.suit]; bottom = ELEMENT[card.suit];
    }
    var img = '<img class="face" src="' + base() + '/assets/img/' + card.slug + '.jpg" alt="Карта Таро «' +
      card.name + '»" loading="lazy" onerror="this.style.display=\'none\'">';
    return img +
           '<span class="num">' + top + '</span>' +
           '<div class="sym">' + sym + '</div>' +
           '<div class="nm">' + card.name + '</div>' +
           '<div class="el">' + bottom + '</div>' +
           (reversed ? '<span class="el" style="bottom:22px">перевёрнутая</span>' : '');
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
    d.innerHTML = '<img class="face" src="' + base() + '/assets/backs/' + prefs.back + '.svg" alt="Рубашка карты">';
    return d;
  }

  /* карта лежит рубашкой вверх и открывается по нажатию.
     delay > 0 — раскрыть автоматически (для карты дня), delay = 0 — только по клику. */
  function renderFlip(card, reversed, delay, onOpen) {
    var wrap = el('div', 'flip');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-label', 'Открыть карту');
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
        wrap.setAttribute('aria-label', 'Карта: ' + card.name + '. Нажмите, чтобы закрыть');
      } else {
        wrap.className = wrap.className.replace(/\s*flipped/, '');
        wrap.setAttribute('aria-label', 'Открыть карту');
      }
      if (onOpen) onOpen(opened);
      /* Метрика: открытие карты — цель card_open */
      if (opened && window.ym) { try { window.ym(113733436, 'reachGoal', 'card_open'); } catch (e) {} }
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
    if (!document.body || !nodes[0].getBoundingClientRect) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var deck = el('div', 'deal-deck show');
    for (var k = 0; k < 4; k++) {
      var back = el('img');
      back.src = base() + '/assets/backs/' + prefs.back + '.svg';
      back.alt = '';
      back.style.transform = 'translateY(' + (k * -2) + 'px)';
      deck.appendChild(back);
    }
    document.body.appendChild(deck);

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

    /* Колода гаснет сразу после того, как её покинула последняя карта.
       Раньше она стояла на месте всю анимацию и выглядела как «задержавшаяся старая карта». */
    /* Метрика: карты легли — цель spread_dealt */
    if (window.ym && nodes.length > 1) { try { window.ym(113733436, 'reachGoal', 'spread_dealt'); } catch (e) {} }

    var depart = 130 + (nodes.length - 1) * stagger;
    setTimeout(function () {
      deck.className = 'deal-deck';
      setTimeout(function () { if (deck.parentNode) deck.parentNode.removeChild(deck); }, 420);
    }, depart + 40);
  }

  /* кнопки «открыть / закрыть все карты» */
  function openAllButton(host, flips) {
    var row = el('div', 'open-all-row');
    var open = el('button', 'btn open-all', 'Открыть все карты');
    open.type = 'button';
    open.onclick = function () { flips.forEach(function (f) { if (f.openCard) f.openCard(); }); };
    var close = el('button', 'btn open-all open-all-close', 'Закрыть все карты');
    close.type = 'button';
    close.onclick = function () { flips.forEach(function (f) { if (f.closeCard) f.closeCard(); }); };
    row.appendChild(open);
    row.appendChild(close);
    host.appendChild(row);
    return row;
  }

  /* смена оформления на уже разложенных картах */
  function applyLive() {
    if (!document.querySelectorAll) return;
    Array.prototype.forEach.call(document.querySelectorAll('.card'), function (node) {
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
    Array.prototype.forEach.call(document.querySelectorAll('.static-flip'), function (wrap) {
      Array.prototype.forEach.call(wrap.querySelectorAll('.front .card'), function (node) {
        node.className = 'card';
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.card-back .face'), function (img) {
      img.src = base() + '/assets/backs/' + prefs.back + '.svg';
    });
  }

  function initPrefs() {
    var slot = document.getElementById('prefs-slot');
    var panel = slot;
    if (!panel) {
      var btn = document.getElementById('draw') || document.getElementById('draw-celtic');
      if (!btn || !btn.closest) return;
      panel = btn.closest('.panel');
    }
    if (!panel || document.getElementById('taro-prefs')) return;

    var box = el('details', 'prefs');
    box.id = 'taro-prefs';
    box.appendChild(el('summary', null, 'Оформление колоды: рубашка'));
    box.appendChild(el('label', null, 'Рубашка карт'));
    var backHost = el('div', 'chips');
    box.appendChild(backHost);
    box.appendChild(el('div', 'hint',
      'Рубашка видна, пока карта закрыта. Выбор запоминается в этом браузере. ' +
      'Рисунки карт — подлинные гравюры Памелы Колман Смит 1909 года (общественное достояние), ' +
      'рубашки нарисованы для этого сайта.'));

    function fill(host, list, key) {
      host.innerHTML = '';
      list.forEach(function (item) {
        var b = el('button', 'chip', item.name);
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

  function initDay() {
    var box = document.getElementById('day-card');
    if (!box) return;
    var today = new Date();
    var card = CARDS[hashDate(today)];
    var t = document.getElementById('day-text');
    var d = document.getElementById('day-date');
    if (d) d.textContent = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    t.innerHTML = '<p class="hint">Нажмите на карту — покажем значение дня.</p>';

    var dayFlip = renderFlip(card, false, 0, function (isOpen) {
      if (!isOpen) {
        t.innerHTML = '<p class="hint">Нажмите на карту — покажем значение дня.</p>';
        return;
      }
      t.innerHTML = '<p><strong>' + card.name + '</strong> — ' + card.essence.toLowerCase() + '.</p>' +
        '<p><span class="pos">Совет дня:</span> ' + card.advice + '</p>' +
        (cardQuestion(card) ? '<p class="question">' + cardQuestion(card) + '</p>' : '');
      var shareRow = el('p');
      shareRow.style.marginTop = '12px';
      shareButton(shareRow,
        function () { return 'Карта дня Таро — «' + card.name + '»: ' + card.essence.toLowerCase() + '.'; },
        function () { return siteUrl('/'); },
        'Поделиться картой дня');
      t.appendChild(shareRow);
    });
    box.appendChild(dayFlip);
    /* Карта дня никуда не летит: она сразу стоит на своём месте, а по клику крутится.
       Раздача волной остаётся только у раскладов, где карт несколько. */
  }
  /* ---------- Расклад на 3 карты ---------- */
  var TOPICS = {
    general:  { title: 'Общая ситуация', positions: ['Прошлое', 'Настоящее', 'Будущее'] },
    advice:   { title: 'Что делать',     positions: ['Ситуация', 'Препятствие', 'Совет'] },
    love:     { title: 'Отношения',      positions: ['Ты', 'Партнёр', 'Что между вами'] },
    money:    { title: 'Работа и деньги',positions: ['Сейчас', 'Что мешает', 'Куда ведёт'] },
    self:     { title: 'Я и моя цель',   positions: ['Что мешает', 'Мой ресурс', 'Первый шаг'] }
  };
  var currentTopic = 'general';

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function spread() {
    var qEl = document.getElementById('question');
    var q = (qEl && qEl.value || '').trim();
    var warn = document.getElementById('q-warn');
    if (q && /^(выйду|будет ли|любит ли|уволят|да или нет|бросит)/i.test(q)) {
      warn.textContent = 'Похоже на вопрос «да/нет». Таро лучше отвечает на «что мне сделать, чтобы…» — но расклад всё равно покажем.';
      warn.style.display = 'block';
    } else if (warn) { warn.style.display = 'none'; }

    var useRev = document.getElementById('reversed-toggle');
    var allowRev = useRev ? useRev.checked : false;
    var def = window.SPREAD_DEF || null;           /* расклад описан на самой странице */
    var pos = def ? def.positions.map(function (p) { return p.name; }) : TOPICS[currentTopic].positions;
    var deck = shuffle(CARDS.slice());
    var picked = deck.slice(0, pos.length);

    var box = document.getElementById('spread-result');
    box.innerHTML = '';
    if (!def) box.appendChild(el('h2', null, 'Расклад: ' + TOPICS[currentTopic].title));
    if (q) {
      var qp = el('p', 'note', '<strong>Ваш вопрос:</strong> ' + q.replace(/[<>]/g, ''));
      box.appendChild(qp);
    }

    var trip = el('div', def ? 'spread-grid' : 'triplet');
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

    box.appendChild(el('p', 'hint open-hint', 'Карты легли рубашкой вверх. Открывайте по одной — или нажмите «Открыть все карты».'));
    rows.forEach(function (r, i) {
      var slot = el('div', 'slot');
      var block = el('div', 'panel reading-item');
      block.style.marginBottom = '12px';
      block.style.display = 'none';
      block.innerHTML = '<div class="pos">' + pos[i] + ' — ' + r.c.name + (r.rev ? ' (перевёрнутая)' : '') + '</div>' +
        '<p>' + (r.rev ? r.c.shadow : r.c.essence) + '.</p>' +
        '<p><em>Совет: ' + r.c.advice + '</em></p>' +
        (cardQuestion(r.c) ? '<p class="question">' + cardQuestion(r.c) + '</p>' : '');
      reading.appendChild(block);

      var flip = renderFlip(r.c, r.rev, 0, function (isOpen) {
        block.style.display = isOpen ? '' : 'none';
        revealed += isOpen ? 1 : -1;
        summaryBox.style.display = (revealed === rows.length) ? '' : 'none';
      });
      flips.push(flip);
      slot.appendChild(flip);
      slot.appendChild(el('div', 'cap', pos[i]));
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
    if (majors >= 2) summary.push('Две и более Старших Аркана — ситуация судьбоносная, вы на важном этапе, а не в рядовой полосе.');
    else if (majors === 0) summary.push('Старших Арканов нет — события в ваших руках, многое зависит от конкретных действий.');
    Object.keys(suitCount).forEach(function (s) {
      if (suitCount[s] >= 2) summary.push('Преобладают ' + SUITS[s].name + ' — тема ' + SUITS[s].sphere + '.');
    });
    if (summary.length) {
      summaryBox.appendChild(el('div', 'note', '<strong>Целостная картина.</strong> ' + summary.join(' ')));
    }
    summaryBox.appendChild(el('p', 'hint',
      'Один вопрос — один расклад. Если хотите переспросить, сформулируйте вопрос иначе и дайте себе время подумать.'));
    reading.appendChild(summaryBox);

    box.appendChild(reading);
    diaryBlock(box, {
      q: q,
      pos: pos,
      cards: rows.map(function (r) { return { id: r.c.id, rev: r.rev }; })
    }, def ? 'Расклад по странице' : TOPICS[currentTopic].title);
    thanksBlock(box, {
      q: q,
      pos: pos,
      cards: rows.map(function (r) { return { id: r.c.id, rev: r.rev }; })
    });
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    var extra = window.TARO_POS_SETS || {};
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
    return (window.location ? window.location.origin : '') + base() + (pathname || '/');
  }
  function shareButton(host, getText, getUrl, label) {
    var b = el('button', 'btn ghost', label);
    b.type = 'button';
    b.onclick = function () {
      var url = getUrl(), text = getText();
      if (navigator && navigator.share) { navigator.share({ title: 'Тихая колода', text: text, url: url }); return; }
      if (window.open) {
        window.open('https://t.me/share/url?url=' + encodeURIComponent(url) +
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
    p.innerHTML = '<p style="margin:0 0 10px">Расклад отозвался? Можно поблагодарить автора или попросить личный разбор — ссылка с вашим раскладом уйдёт автору.</p>';
    var b = el('button', 'btn ghost', 'Спасибо автору / личный разбор');
    b.type = 'button';
    b.setAttribute('id', 'thanks-btn');
    b.onclick = function () {
      if (window.location) window.location.href = pageUrl('poslanie') + '?t=' + packSpread(sp);
    };
    p.appendChild(b);
    shareButton(p,
      function () {
        var names = sp.cards.map(function (x) { return CARDS[x.id].name; }).join(', ');
        return 'Мой расклад Таро: ' + names + '.';
      },
      function () { return siteUrl('/rasklady.html'); },
      'Поделиться раскладом');
    box.appendChild(p);
  }

  function getParam(name) {
    var search = (window.location && window.location.search) || '';
    var m = search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return m ? decodeURIComponent(m[1]) : '';
  }

  function miniSpread(host, sp) {
    var grid = el('div', 'spread-grid');
    sp.cards.forEach(function (x, i) {
      var slot = el('div', 'slot');
      slot.appendChild(renderCard(x.card, x.rev));
      slot.appendChild(el('div', 'cap', sp.pos[i] || ('Позиция ' + (i + 1))));
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
        b.innerHTML = 'Скопировано';
      } else if (window.prompt) {
        window.prompt('Скопируйте ссылку:', text);
      }
    };
    host.appendChild(b);
    return b;
  }

  function tgButton(host, getUrl, text) {
    var b = el('button', 'btn', 'Отправить в Telegram');
    b.type = 'button';
    b.onclick = function () {
      var u = 'https://t.me/share/url?url=' + encodeURIComponent(getUrl()) +
        '&text=' + encodeURIComponent(text);
      if (window.open) window.open(u, '_blank');
    };
    host.appendChild(b);
    return b;
  }

  /* страница /spasibo.html — сторона посетителя */
  function initThanksPage() {
    var app = document.getElementById('thanks-app');
    if (!app) return;
    var token = getParam('t');
    var sp = token ? unpackSpread(token) : null;
    app.innerHTML = '';
    if (!sp) {
      app.appendChild(el('h1', null, 'Послание хранителю колоды'));
      if (!token) {
        app.appendChild(el('p', 'lead', 'Эта страница открывается по ссылке с раскладом — её получают после гадания, когда хотят попросить личный разбор.'));
        app.appendChild(el('p', 'note', 'Чтобы получить такую ссылку: сделайте расклад и нажмите под ним «Спасибо автору / личный разбор».'));
      } else {
        app.appendChild(el('p', 'note', 'Ссылка повреждена — похоже, её скопировали не целиком. Сделайте расклад заново и нажмите «Спасибо автору».'));
      }
      app.appendChild(el('p', null, '<a href="/rasklady.html">Все расклады</a> · <a href="/rasklad.html">Расклад на 3 карты</a> · <a href="/taro/">Карта дня</a>'));
      return;
    }

    var panel = el('div', 'panel');
    panel.appendChild(el('p', 'hint', 'Дата расклада: ' + sp.date));
    if (sp.q) panel.appendChild(el('p', null, '<strong>Ваш вопрос:</strong> ' + sp.q.replace(/[<>]/g, '')));
    app.appendChild(panel);

    miniSpread(app, sp);

    var form = el('div', 'panel');
    form.style.marginTop = '14px';
    var msg = field(form, 'thanks-msg', 'Сообщение автору (необязательно)',
      'Например: хочу разобрать этот расклад подробнее, вот мой контакт…', sp.msg);

    function currentToken() { return repack(sp, { m: msg.value.trim() }); }
    function currentUrl() {
      return (window.location ? window.location.origin : '') + pageUrl('tolkovanie') + '?t=' + currentToken();
    }

    var row = el('p');
    row.style.marginTop = '14px';
    form.appendChild(row);

    /* если настроен бот — ведём клиента прямо в чат с ним */
    if (window.SITE_BOT) {
      var bb = el('button', 'btn', 'Отправить автору через бота');
      bb.type = 'button';
      bb.onclick = function () {
        var u = 'https://t.me/' + window.SITE_BOT + '?start=' + encodeURIComponent(currentToken());
        if (window.open) window.open(u, '_blank');
      };
      row.appendChild(bb);
    }
    tgButton(row, currentUrl, 'Здравствуйте! Карты уже легли — прошу вашего толкования. Вот расклад:');
    copyButton(row, currentUrl, 'Скопировать ссылку для автора');
    app.appendChild(form);

    var out = el('div', 'panel');
    out.style.marginTop = '14px';
    app.appendChild(out);
    linkBox(out, currentUrl(), 'Ссылка, которую нужно отправить автору:');
    out.appendChild(el('p', 'hint',
      'Автор откроет её и увидит ваш расклад и вопрос. Ответ придёт вам отдельной ссылкой — её можно сохранить или распечатать.'));
  }

  /* страница /otvet.html — сторона автора и клиента */
  function initOtvetPage() {
    var app = document.getElementById('otvet-app');
    if (!app) return;
    var token = getParam('t');
    var sp = token ? unpackSpread(token) : null;
    app.innerHTML = '';
    if (!sp) {
      app.appendChild(el('h1', null, 'Толкование расклада'));
      if (!token) {
        app.appendChild(el('p', 'lead', 'Это страница личного разбора. Она открывается по ссылке с раскладом: её присылает посетитель, когда просит толкование, — и по ней же он получает ответ.'));
        app.appendChild(el('p', 'note', 'Если вы зашли просто посмотреть: сделайте расклад и нажмите под ним «Спасибо автору / личный разбор» — получите такую ссылку.'));
      } else {
        app.appendChild(el('p', 'note', 'Ссылка повреждена — похоже, её скопировали не целиком. Попросите прислать ссылку заново.'));
      }
      app.appendChild(el('p', null, '<a href="/rasklady.html">Все расклады</a> · <a href="/rasklad.html">Расклад на 3 карты</a> · <a href="/taro/">Карта дня</a>'));
      return;
    }

    if (sp.answer) {
      /* клиент смотрит готовый ответ */
      app.appendChild(el('h1', null, 'Ваш личный разбор'));
      app.appendChild(el('p', 'lead', 'Ответ автора на расклад от ' + sp.date + '.'));
      if (sp.q) app.appendChild(el('p', 'note', '<strong>Ваш вопрос:</strong> ' + sp.q.replace(/[<>]/g, '')));
      miniSpread(app, sp);
      var ansBox = el('div', 'panel');
      ansBox.style.marginTop = '16px';
      ansBox.appendChild(el('h2', null, 'Ответ автора'));
      sp.answer.split(/\n{2,}/).forEach(function (par) {
        ansBox.appendChild(el('p', null, par.replace(/[<>]/g, '').replace(/\n/g, '<br>')));
      });
      app.appendChild(ansBox);
      var acts = el('p');
      acts.style.marginTop = '14px';
      app.appendChild(acts);
      var pr = el('button', 'btn ghost', 'Распечатать или сохранить в PDF');
      pr.type = 'button';
      pr.onclick = function () { if (window.print) window.print(); };
      acts.appendChild(pr);
      app.appendChild(el('p', 'disclaimer',
        'Разбор носит развлекательный и рефлексивный характер и не заменяет консультацию врача, юриста или психолога.'));
      return;
    }

    /* автор формирует ответ */
    app.appendChild(el('h1', null, 'Заявка на личный разбор'));
    app.appendChild(el('p', 'lead', 'Так выглядит заявка от посетителя. Ваш ответ станет отдельной ссылкой — её нужно отправить клиенту.'));
    app.appendChild(el('p', 'hint', 'Дата расклада: ' + sp.date));
    if (sp.q) app.appendChild(el('p', 'note', '<strong>Вопрос клиента:</strong> ' + sp.q.replace(/[<>]/g, '')));
    if (sp.msg) app.appendChild(el('p', 'note', '<strong>Сообщение:</strong> ' + sp.msg.replace(/[<>]/g, '')));
    miniSpread(app, sp);

    var form = el('div', 'panel');
    form.style.marginTop = '16px';
    var ans = field(form, 'otvet-text', 'Ваш разбор', 'По позициям: 1 — …, 2 — …, общий вывод…', '');
    var row = el('p');
    row.style.marginTop = '14px';
    form.appendChild(row);

    function answerUrl() {
      return (window.location ? window.location.origin : '') + pageUrl('tolkovanie') + '?t=' + repack(sp, { a: ans.value.trim() });
    }

    var out = el('div', 'panel');
    out.style.marginTop = '14px';

    var make = el('button', 'btn', 'Сформировать ответ');
    make.type = 'button';
    make.onclick = function () {
      out.innerHTML = '';
      if (!ans.value.trim()) {
        out.appendChild(el('p', 'hint', 'Сначала напишите текст разбора.'));
        return;
      }
      linkBox(out, answerUrl(), 'Ссылка с вашим ответом — отправьте её клиенту:');
      var r2 = el('p');
      out.appendChild(r2);
      tgButton(r2, answerUrl, 'Карты ответили. Ваш личный разбор готов:');
      copyButton(r2, answerUrl, 'Скопировать ссылку с ответом');
      var open = el('button', 'btn ghost', 'Открыть, как увидит клиент');
      open.type = 'button';
      open.onclick = function () { if (window.open) window.open(answerUrl(), '_blank'); };
      r2.appendChild(open);
    };
    row.appendChild(make);
    form.appendChild(el('p', 'hint',
      'Отправляя ответ, вы тем самым разрешаете просмотр: клиент увидит только текст разбора и карты.'));
    app.appendChild(form);
    app.appendChild(out);
  }

  function initTopics() {
    var box = document.getElementById('topics');
    if (!box) return;
    Object.keys(TOPICS).forEach(function (k) {
      var b = el('button', 'chip', TOPICS[k].title);
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

  /* ---------- Кельтский крест: 10 карт ---------- */
  var CELTIC = [
    { area: 'p12', title: 'Ситуация' },
    { area: 'p12', title: 'Препятствие' },
    { area: 'p3',  title: 'Фундамент' },
    { area: 'p4',  title: 'Недавнее прошлое' },
    { area: 'p5',  title: 'Возможность' },
    { area: 'p6',  title: 'Ближайшее будущее' },
    { area: 'p7',  title: 'Ваша позиция' },
    { area: 'p8',  title: 'Окружение' },
    { area: 'p9',  title: 'Надежды и страхи' },
    { area: 'p10', title: 'Итог' }
  ];

  function celticSpread() {
    var qEl = document.getElementById('celtic-question');
    var q = (qEl && qEl.value || '').trim();
    var deck = shuffle(CARDS.slice()).slice(0, 10);

    var box = document.getElementById('celtic-result');
    box.innerHTML = '';
    if (q) box.appendChild(el('p', 'note', '<strong>Ваш вопрос:</strong> ' + q.replace(/[<>]/g, '')));

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
      block.innerHTML = '<div class="pos">' + (i + 1) + '. ' + p.title + ' — ' + c.name + '</div>' +
        '<p>' + c.essence + '.</p><p><em>Совет: ' + c.advice + '</em></p>' +
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
      var titles = cell.map(function (_, k) { return CELTIC[used + k].title; }).join(' / ');
      slot.appendChild(el('div', 'cap', nums + '. ' + titles));
      used += cell.length;
      grid.appendChild(slot);
    });

    box.appendChild(el('p', 'hint open-hint', 'Карты легли рубашкой вверх. Открывайте по одной — или нажмите «Открыть все карты».'));
    /* кнопки — над раскладом, в одну строку */
    openAllButton(box, flips);
    box.appendChild(grid);
    dealCards(flips);

    var majors = deck.filter(function (c) { return c.arcana === 'major'; }).length;
    var sum = [];
    if (majors >= 4) sum.push('Старших Арканов ' + majors + ' — ситуация действительно значимая, вы на переломном этапе.');
    else if (majors <= 1) sum.push('Старших Арканов почти нет — многое решается конкретными действиями, а не судьбой.');
    sum.push('Сравните позиции 9 (надежды и страхи) и 10 (итог): если они противоречат друг другу, главный ответ обычно там.');
    summaryBox.appendChild(el('div', 'note', '<strong>Целостная картина.</strong> ' + sum.join(' ')));
    summaryBox.appendChild(el('p', 'hint', 'Читайте в таком порядке: 1+2, затем 3–6–10, затем 5–4, и только потом 7–8–9.'));
    reading.appendChild(summaryBox);

    box.appendChild(reading);
    thanksBlock(box, {
      q: q,
      pos: CELTIC.map(function (p) { return p.title; }),
      cards: deck.map(function (c) { return { id: c.id, rev: false }; })
    });
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- меню с выпадающими подменю ---------- */
  function initNav() {
    if (!document.querySelectorAll) return;
    var items = document.querySelectorAll('.nav-item');
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

    document.onclick = function () { closeAll(); };
    document.onkeydown = function (e) {
      if ((e.key || '') === 'Escape' || e.keyCode === 27) closeAll();
    };
  }

  /* ---------- статические карты-перевёртыши ---------- */
  function initStaticFlips() {
    if (!document.querySelectorAll) return;
    var nodes = document.querySelectorAll('.static-flip');
    Array.prototype.forEach.call(nodes, function (wrap) {
      function toggle() {
        var isOpen = wrap.className.indexOf('flipped') >= 0;
        wrap.className = isOpen ? wrap.className.replace(/\s*flipped/, '') : wrap.className + ' flipped';
        var label = wrap.getAttribute('aria-label') || '';
        wrap.setAttribute('aria-label', isOpen ? label.replace(/\. Нажмите.*/, '') : label + '. Нажмите, чтобы закрыть');
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
    if (!document.body || !document.createElement) return;
    var canvas = document.createElement('canvas');
    canvas.id = 'dust';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var small = window.innerWidth && window.innerWidth < 700;
    var count = small ? 22 : 55;
    var dots = [];

    function size() {
      canvas.width = window.innerWidth || 1024;
      canvas.height = window.innerHeight || 768;
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
    var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
    (function loop() { draw(); raf(loop); })();
    if (window.addEventListener) window.addEventListener('resize', size);
  }

  /* ---------- «Спасибо» в меню: карта с QR для перевода. Без реквизитов на странице ---------- */
  function initThanksCard() {
    var D = window.TARO_DONATE;
    if (!D || !document.querySelector) return;
    var open = document.querySelector('.nav-thanks');
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
      if (document.onkeydown === escHandler) document.onkeydown = null;
    }
    function escHandler(e) { if ((e.key || '') === 'Escape') close(); }

    function build() {
      overlay = el('div', 'thanks-overlay');
      var box = el('div', 'thanks-box');

      var card = el('div', 'flip static-flip thanks-card');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Открыть карту благодарности');
      var inner = el('div', 'flip-inner');
      var backSide = el('div', 'flip-side back');
      var backCard = el('div', 'card card-back');
      backCard.innerHTML = '<img class="face" src="' + base() + '/assets/backs/' + prefs.back + '.svg" alt="Рубашка карты">';
      backSide.appendChild(backCard);

      var frontSide = el('div', 'flip-side front');
      var panel = el('div', 'card thanks-front');
      panel.innerHTML =
        '<span class="thanks-frame"></span>' +
        '<p class="thanks-title">' + D.title + '</p>' +
        '<span class="thanks-divider"><i></i></span>' +
        '<span class="thanks-qr-frame"><img class="thanks-qr" src="' + qrSrc() + '" alt="QR-код для благодарности"></span>' +
        '<p class="thanks-hint">Наведите камеру телефона</p>' +
        '<p class="thanks-sub">' + (D.subtitle || '') + '</p>' +
        (D.payLink ? '' : '<p class="thanks-sub">Сумму укажете в приложении банка — любая</p>');
      frontSide.appendChild(panel);
      inner.appendChild(backSide);
      inner.appendChild(frontSide);
      card.appendChild(inner);

      var actions = el('p', 'thanks-actions');
      /* перевод — по ссылке из банка; «просто спасибо» — тёплое слово без денег.
         Второе работает через бота: без него кнопки нет. */
      if (window.SITE_BOT) {
        var just = el('a', 'btn open-all thanks-just', '🙏 Просто спасибо');
        just.setAttribute('href', 'https://t.me/' + window.SITE_BOT + '?start=thanks');
        just.setAttribute('rel', 'noopener');
        actions.appendChild(just);
      }
      if (D.payLink) {
        var pay = el('a', 'btn open-all thanks-pay', D.payLinkLabel || 'Перевести благодарность');
        pay.setAttribute('href', D.payLink);
        pay.setAttribute('rel', 'noopener');
        actions.appendChild(pay);
      }
      var shut = el('button', 'btn open-all open-all-close', 'Закрыть');
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

      box.appendChild(el('p', 'hint', 'Нажмите на карту'));
      box.appendChild(card);
      box.appendChild(actions);
      overlay.appendChild(box);
      overlay.onclick = function (e) { if (e.target === overlay) close(); };
      document.body.appendChild(overlay);
      document.onkeydown = escHandler;
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
    var base = window.SITE_BASE || '';
    var p = location.pathname;
    if (base && p.indexOf(base) === 0) p = p.slice(base.length);
    return p || '/';
  }

  function tgTabs() {
    var base = window.SITE_BASE || '';
    /* root — «настоящая» вкладка: на ней нативная кнопка «Назад» не нужна.
       У «Ещё» root нет: страницы этого раздела открыты с вкладки, значит назад есть куда. */
    return [
      { href: base + '/', icon: '🌙', label: 'Карта дня', re: /^\/$|^\/index\.html$/, root: true },
      { href: base + '/rasklad.html', icon: '🔮', label: 'Расклад', re: /^\/rasklad/, root: true },
      { href: base + '/karty/', icon: '📖', label: '78 карт', re: /^\/karty/, root: true },
      { icon: '⋯', label: 'Ещё', more: true,
        re: /^\/blog|^\/legenda|^\/koloda|^\/tablica|^\/dnevnik|^\/o-kolode|^\/rasklady/ }
    ];
  }

  /* Экран «Ещё»: то, что не влезло в четыре вкладки */
  function tgMoreScreen(tg) {
    var base = window.SITE_BASE || '';
    var overlay = el('div', 'tg-more');
    var box = el('div', 'tg-more-box');
    var title = el('p', 'tg-more-title', 'Ещё');
    box.appendChild(title);

    var links = [
      ['/blog/', '📰 Статьи'],
      ['/legenda.html', '🌊 Легенда о колоде'],
      ['/rasklady.html', '🃏 Все расклады'],
      ['/koloda.html', '🖼 Колода в картинках'],
      ['/tablica-znacheniy.html', '📊 Сводная таблица'],
      ['/dnevnik/', '📔 Дневник'],
      ['/o-kolode.html', 'ℹ️ О колоде и правах']
    ];
    links.forEach(function (l) {
      var a = el('a', 'tg-more-link', l[1]);
      a.setAttribute('href', base + l[0]);
      box.appendChild(a);
    });

    var shut = el('button', 'btn open-all', 'Закрыть');
    shut.type = 'button';
    shut.onclick = function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    box.appendChild(shut);
    overlay.appendChild(box);
    overlay.onclick = function (e) { if (e.target === overlay) shut.onclick(); };
    document.body.appendChild(overlay);
  }

  function tgBuzz(tg, style) {
    try { if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred(style || 'light'); } catch (e) {}
  }

  function initTelegram() {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;                       /* обычный браузер — ничего не меняем */

    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor('#14101d');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#14101d');
    } catch (e) { /* старые версии клиента — просто продолжаем */ }

    /* при открытии из Телеграма шапку сайта прячем: там своя шапка, а вкладки снизу */
    var head = document.querySelector && document.querySelector('header.site');
    if (head && head.parentNode) head.parentNode.removeChild(head);
    if (document.body && document.body.className.indexOf('tg-app') < 0) {
      document.body.className += ' tg-app';
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
    document.body.appendChild(bar);

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
    var D = window.TARO_DONATE;
    if (D && D.ready && tg.openLink && D.payLink) {
      var openBtn = document.querySelector('.nav-thanks');
      if (openBtn) {
        openBtn.onclick = function () { tg.openLink(D.payLink); };
      }
    }
  }

  /* ---------- дневник: расклады и заметки хранятся в браузере ---------- */
  function diaryLoad() {
    try { return JSON.parse((window.localStorage && window.localStorage.getItem('taro_diary')) || '[]'); }
    catch (e) { return []; }
  }
  function diarySave(list) {
    try { window.localStorage && window.localStorage.setItem('taro_diary', JSON.stringify(list)); } catch (e) {}
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
      title: title || 'Расклад',
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
    var b = el('button', 'btn open-all', 'Сохранить в дневник');
    b.type = 'button';
    b.onclick = function () {
      diaryAdd(diaryEntry(sp, title));
      b.innerHTML = 'Сохранено';
      b.disabled = true;
    };
    p.appendChild(b);
    var link = el('p', 'hint');
    link.innerHTML = 'Записи хранятся только в вашем браузере. <a href="' + pageUrl('dnevnik') + '">Открыть дневник</a>';
    p.appendChild(link);
    box.appendChild(p);
  }

  /* страница /dnevnik/ */
  function initDiaryPage() {
    var app = document.getElementById('diary-app');
    if (!app) return;
    var list = diaryLoad();
    app.innerHTML = '';

    if (!list.length) {
      app.appendChild(el('p', 'note', 'Записей пока нет. Сделайте расклад и нажмите «Сохранить в дневник».'));
      return;
    }

    var bar = el('p', 'thanks-actions');
    var exp = el('button', 'btn open-all open-all-close', 'Выгрузить текстом');
    exp.type = 'button';
    exp.onclick = function () {
      var text = list.map(function (e) {
        var cards = e.cards.map(function (c) { return CARDS[c.id] ? CARDS[c.id].name + (c.rev ? ' (перев.)' : '') : '?'; }).join(', ');
        return e.date + ' — ' + e.title + '\n' + (e.q ? 'Вопрос: ' + e.q + '\n' : '') +
          'Карты: ' + cards + '\n' + (e.note ? 'Заметка: ' + e.note + '\n' : '');
      }).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        exp.innerHTML = 'Скопировано';
      } else if (window.print) { window.print(); }
    };
    var clr = el('button', 'btn open-all open-all-close', 'Очистить дневник');
    clr.type = 'button';
    clr.onclick = function () {
      if (window.confirm && !window.confirm('Удалить все записи? Это необратимо.')) return;
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
        return k ? k.name + (c.rev ? ' (перевёрнутая)' : '') : 'карта №' + c.id;
      }).join(' · ');
      card.innerHTML = '<div class="pos">' + entry.date + ' — ' + entry.title + '</div>' +
        (entry.q ? '<p><strong>Вопрос:</strong> ' + entry.q.replace(/[<>]/g, '') + '</p>' : '') +
        '<p>' + cards + '</p>';
      var ta = el('textarea');
      ta.rows = 2;
      ta.placeholder = 'Как это проявилось? Что вы заметили?';
      ta.value = entry.note || '';
      ta.onchange = function () {
        var all = diaryLoad();
        if (all[idx]) { all[idx].note = ta.value; diarySave(all); }
      };
      card.appendChild(ta);
      var del = el('button', 'chip', 'Удалить запись');
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

  document.addEventListener('DOMContentLoaded', function () {
    initDay();
    initTopics();
    initPrefs();
    initNav();
    initStaticFlips();
    initDust();
    initThanksCard();
    initTelegram();
    initDiaryPage();
    initThanksPage();
    initOtvetPage();
    var b = document.getElementById('draw');
    if (b) b.onclick = spread;
    var dc = document.getElementById('draw-celtic');
    if (dc) dc.onclick = celticSpread;
    var rc = document.getElementById('reset-celtic');
    if (rc) rc.onclick = function () { document.getElementById('celtic-result').innerHTML = ''; };
  });

  /* отладочный доступ — используется дымовым тестом src/test-smoke.js */
  window.TARO_DEBUG = {
    prefs: prefs, BACKS: BACKS, cardHTML: cardHTML, applyLive: applyLive,
    packSpread: packSpread, unpackSpread: unpackSpread, packObj: packObj, initNav: initNav,
    b64uDecode: b64uDecode, b64uEncode: b64uEncode, repack: repack, initStaticFlips: initStaticFlips,
    initPrefs: initPrefs
  };
})();


