/* Переключатель языка: остаётесь на той же странице, меняется только язык. */
(function () {
  var MAP = {
    /* одинаковые имена файлов во всех языках */
    'index.html': 'index.html',
    '': 'index.html',
    'rasklad.html': 'rasklad.html',
    'den.html': 'den.html',
    'karty.html': 'karty.html',
    'blog.html': 'blog.html',
    'legend.html': 'legend.html',
    'thanks.html': 'thanks.html',
    /* расклады: у каждого языка своё имя файла */
    'celtic-cross.html': 'celtic-cross.html',
    'drei-karten.html': 'drei-karten.html',
    'kaierte-shizi.html': 'kaierte-shizi.html',
    'san-zhang.html': 'san-zhang.html',
    'three-cards.html': 'three-cards.html',
    'beziehung.html': 'beziehung.html',
    'guanxi.html': 'guanxi.html',
    'relationships.html': 'relationships.html',
    'jingzi.html': 'jingzi.html',
    'mirror.html': 'mirror.html',
    'spiegel.html': 'spiegel.html',
    'lujing.html': 'lujing.html',
    'path.html': 'path.html',
    'weg.html': 'weg.html',
    'drei-stuetzen.html': 'drei-stuetzen.html',
    'san-ge-zhidian.html': 'san-ge-zhidian.html',
    'supports.html': 'supports.html',
    'jahreslegung.html': 'jahreslegung.html',
    'niandu.html': 'niandu.html',
    'year-ahead.html': 'year-ahead.html',
    /* русские расклады → их переводные двойники */
    'keltskiy-krest.html': 'celtic-cross.html',
    'rasklad-na-otnosheniya.html': 'relationships.html',
    'rasklad-zerkalo.html': 'mirror.html',
    'rasklad-put.html': 'path.html',
    'rasklad-tri-yogurta.html': 'supports.html',
    'rasklad-na-god.html': 'year-ahead.html',
    'rasklad-na-den.html': 'den.html',
    'rasklady.html': 'rasklad.html'
  };

  var PAIRS = {
    'celtic-cross.html': { de: 'keltisches-kreuz.html', zh: 'kaierte-shizi.html', en: 'celtic-cross.html' },
    'keltisches-kreuz.html': { en: 'celtic-cross.html', zh: 'kaierte-shizi.html', de: 'keltisches-kreuz.html' },
    'kaierte-shizi.html': { en: 'celtic-cross.html', de: 'keltisches-kreuz.html', zh: 'kaierte-shizi.html' },
    'three-cards.html': { de: 'drei-karten.html', zh: 'san-zhang.html', en: 'three-cards.html' },
    'drei-karten.html': { en: 'three-cards.html', zh: 'san-zhang.html', de: 'drei-karten.html' },
    'san-zhang.html': { en: 'three-cards.html', de: 'drei-karten.html', zh: 'san-zhang.html' },
    'relationships.html': { de: 'beziehung.html', zh: 'guanxi.html', en: 'relationships.html' },
    'beziehung.html': { en: 'relationships.html', zh: 'guanxi.html', de: 'beziehung.html' },
    'guanxi.html': { en: 'relationships.html', de: 'beziehung.html', zh: 'guanxi.html' },
    'mirror.html': { de: 'spiegel.html', zh: 'jingzi.html', en: 'mirror.html' },
    'spiegel.html': { en: 'mirror.html', zh: 'jingzi.html', de: 'spiegel.html' },
    'jingzi.html': { en: 'mirror.html', de: 'spiegel.html', zh: 'jingzi.html' },
    'path.html': { de: 'weg.html', zh: 'lujing.html', en: 'path.html' },
    'weg.html': { en: 'path.html', zh: 'lujing.html', de: 'weg.html' },
    'lujing.html': { en: 'path.html', de: 'weg.html', zh: 'lujing.html' },
    'supports.html': { de: 'drei-stuetzen.html', zh: 'san-ge-zhidian.html', en: 'supports.html' },
    'drei-stuetzen.html': { en: 'supports.html', zh: 'san-ge-zhidian.html', de: 'drei-stuetzen.html' },
    'san-ge-zhidian.html': { en: 'supports.html', de: 'drei-stuetzen.html', zh: 'san-ge-zhidian.html' },
    'year-ahead.html': { de: 'jahreslegung.html', zh: 'niandu.html', en: 'year-ahead.html' },
    'jahreslegung.html': { en: 'year-ahead.html', zh: 'niandu.html', de: 'jahreslegung.html' },
    'niandu.html': { en: 'year-ahead.html', de: 'jahreslegung.html', zh: 'niandu.html' }
  };

  function target(lang) {
    var p = location.pathname;                    /* /taro/en/celtic-cross.html */
    var m = p.match(/^\/taro\/(?:(en|de|zh)\/)?(.*)$/);
    var file = (m && m[2]) ? m[2] : '';
    if (file === '') file = 'index.html';

    var prefix = (lang === 'ru') ? '/taro/' : '/taro/' + lang + '/';

    if (lang === 'ru') {
      /* назад на русские страницы: обратное соответствие */
      var rev = { 'celtic-cross.html': 'keltskiy-krest.html', 'keltisches-kreuz.html': 'keltskiy-krest.html',
        'kaierte-shizi.html': 'keltskiy-krest.html', 'three-cards.html': 'rasklad.html', 'drei-karten.html': 'rasklad.html',
        'san-zhang.html': 'rasklad.html', 'relationships.html': 'rasklad-na-otnosheniya.html', 'beziehung.html': 'rasklad-na-otnosheniya.html',
        'guanxi.html': 'rasklad-na-otnosheniya.html', 'mirror.html': 'rasklad-zerkalo.html', 'spiegel.html': 'rasklad-zerkalo.html',
        'jingzi.html': 'rasklad-zerkalo.html', 'path.html': 'rasklad-put.html', 'weg.html': 'rasklad-put.html',
        'lujing.html': 'rasklad-put.html', 'supports.html': 'rasklad-tri-yogurta.html', 'drei-stuetzen.html': 'rasklad-tri-yogurta.html',
        'san-ge-zhidian.html': 'rasklad-tri-yogurta.html', 'year-ahead.html': 'rasklad-na-god.html', 'jahreslegung.html': 'rasklad-na-god.html',
        'niandu.html': 'rasklad-na-god.html', 'den.html': 'rasklad-na-den.html', 'karty.html': 'karty/', 'blog.html': 'blog/',
        'legend.html': 'legenda.html', 'thanks.html': 'spasibo.html' };
      return '/taro/' + (rev[file] || '');
    }

    var pair = PAIRS[file] && PAIRS[file][lang];
    if (pair) return prefix + pair;
    if (file === 'index.html') return prefix;
    if (file === 'rasklad-na-den.html') return prefix + 'den.html';
    if (file === 'keltskiy-krest.html') return prefix + 'celtic-cross.html';
    if (MAP[file]) return prefix + MAP[file];
    return prefix;
  }

  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('.lang-select');
    if (!sel) return;
    var lang = (sel.value || '').replace('/taro/', '').replace(/\//g, '') || 'ru';
    location.href = target(lang);
  });
})();
