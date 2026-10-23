$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'
$site = 'https://tarospread.github.io/taro'

# --- словари навигации и текстов ---
$navSpreads = @{
  en = @(@('three-cards', 'Three cards'), @('celtic-cross', 'Celtic Cross'), @('relationships', 'Relationships'), @('mirror', 'Mirror'), @('path', 'Path'), @('supports', 'Three supports'), @('year-ahead', 'Year ahead (12)'), @('rasklad', 'All spreads'))
  de = @(@('drei-karten', 'Drei Karten'), @('keltisches-kreuz', 'Keltisches Kreuz'), @('beziehung', 'Beziehung'), @('spiegel', 'Spiegel'), @('weg', 'Weg'), @('drei-stuetzen', 'Drei Stützen'), @('jahreslegung', 'Jahreslegung (12)'), @('rasklad', 'Alle Legungen'))
  zh = @(@('san-zhang', '三张牌'), @('kaierte-shizi', '凯尔特十字'), @('guanxi', '关系'), @('jingzi', '镜子'), @('lujing', '路径'), @('san-ge-zhidian', '三个支点'), @('niandu', '年度（12）'), @('rasklad', '全部牌阵'))
}
$navLabels = @{
  en = @{ home = 'Daily card'; spreads = 'Spreads'; meanings = 'Card meanings'; articles = 'Articles'; legend = 'Legend'; thanks = 'Thanks'; all = 'All 78 cards'; majors = 'Major Arcana'; wands = 'Wands'; cups = 'Cups'; swords = 'Swords'; pentacles = 'Pentacles'; lang = 'Language' }
  de = @{ home = 'Tageskarte'; spreads = 'Legungen'; meanings = 'Kartenbedeutungen'; articles = 'Artikel'; legend = 'Legende'; thanks = 'Danke'; all = 'Alle 78 Karten'; majors = 'Große Arkana'; wands = 'Stäbe'; cups = 'Kelche'; swords = 'Schwerter'; pentacles = 'Münzen'; lang = 'Sprache' }
  zh = @{ home = '今日一牌'; spreads = '牌阵'; meanings = '牌义'; articles = '文章'; legend = '传说'; thanks = '致谢'; all = '全部 78 张'; majors = '大牌'; wands = '权杖'; cups = '圣杯'; swords = '宝剑'; pentacles = '星币'; lang = '语言' }
}
$texts = @{
  en = @{
    kartyTitle = 'Tarot card meanings — all 78 cards'; kartyH1 = 'Card meanings';
    kartyLead = 'All 78 Rider–Waite–Smith cards: what each card means upright, what it means reversed and what it advises. Free, no registration.'
    legendH1 = 'The legend of the quiet deck'; legendTitle = 'The legend of the quiet deck';
    thanksH1 = 'Thank you'; thanksTitle = 'Thank you — Quiet Deck';
    blogH1 = 'Articles'; blogTitle = 'Articles — Quiet Deck';
    blogLead = 'Long-form notes on tarot: how to ask, how to read, where cards help and where they do not.'
    thanksText = 'The deck is free and stays free: no subscription, no paid spreads. If you want to support the project, use the button below — it changes nothing about access.'
    thanksBtn = 'Support the project'
    legendText = 'The full legend is long and lives on the Russian-language page. In short: a quiet deck, no predictions, only attention — a card names a theme, and you decide what to do with it.'
  }
  de = @{
    kartyTitle = 'Tarot-Kartenbedeutungen — alle 78 Karten'; kartyH1 = 'Kartenbedeutungen';
    kartyLead = 'Alle 78 Karten des Rider-Waite-Smith-Decks: was jede Karte aufrecht bedeutet, was umgekehrt und welchen Rat sie gibt. Kostenlos.'
    legendH1 = 'Die Legende vom stillen Deck'; legendTitle = 'Die Legende vom stillen Deck';
    thanksH1 = 'Danke'; thanksTitle = 'Danke — Stilles Deck';
    blogH1 = 'Artikel'; blogTitle = 'Artikel — Stilles Deck';
    blogLead = 'Längere Notizen zum Tarot: wie man fragt, wie man liest, wo Karten helfen und wo nicht.'
    thanksText = 'Das Deck ist kostenlos und bleibt kostenlos: kein Abo, keine bezahlten Legungen. Wenn Sie das Projekt unterstützen möchten, nutzen Sie den Button unten — am Zugang ändert das nichts.'
    thanksBtn = 'Projekt unterstützen'
    legendText = 'Die vollständige Legende steht auf der russischen Seite. Kurz: ein stilles Deck, keine Vorhersagen, nur Aufmerksamkeit — eine Karte benennt ein Thema, und Sie entscheiden, was daraus wird.'
  }
  zh = @{
    kartyTitle = '塔罗牌义 — 全部 78 张'; kartyH1 = '牌义大全';
    kartyLead = 'Rider–Waite–Smith 全部 78 张牌：正位含义、逆位含义与建议。免费，无需注册。'
    legendH1 = '安静牌阵的传说'; legendTitle = '安静牌阵的传说';
    thanksH1 = '谢谢你'; thanksTitle = '谢谢你 — 安静牌阵';
    blogH1 = '文章'; blogTitle = '文章 — 安静牌阵';
    blogLead = '关于塔罗的长文：怎么提问、怎么阅读、牌在哪里有帮助、哪里没有。'
    thanksText = '这副牌免费，并且一直免费：没有订阅，没有付费牌阵。如果你想支持这个项目，可以用下面的按钮——这不会影响任何使用。'
    thanksBtn = '支持项目'
    legendText = '完整的传说写在俄语页面里。简单说：一副安静的牌，不预测命运，只提供注意力——牌说出主题，怎么做由你决定。'
  }
}

function Nav($lang) {
  $L = $navLabels[$lang]
  $items = ''
  foreach ($s in $navSpreads[$lang]) {
    $items += "        <a href=`"/taro/$lang/$($s[0]).html`">$($s[1])</a>`n"
  }
  $sel = @{ en = @('RU','EN','DE','ZH'); de = @('RU','EN','DE','ZH'); zh = @('RU','EN','DE','ZH') }[$lang]
  @"
<nav class="main">
    <a href="/taro/$lang/">$($L.home)</a>
    <div class="nav-item">
      <button class="nav-toggle" type="button" aria-expanded="false">$($L.spreads)</button>
      <div class="nav-panel">
$items      </div>
    </div>
    <div class="nav-item">
      <button class="nav-toggle" type="button" aria-expanded="false">$($L.meanings)</button>
      <div class="nav-panel">
        <a href="/taro/$lang/karty.html">$($L.all)</a>
        <a href="/taro/$lang/karty.html#majors">$($L.majors)</a>
        <a href="/taro/$lang/karty.html#wands">$($L.wands)</a>
        <a href="/taro/$lang/karty.html#cups">$($L.cups)</a>
        <a href="/taro/$lang/karty.html#swords">$($L.swords)</a>
        <a href="/taro/$lang/karty.html#pentacles">$($L.pentacles)</a>
      </div>
    </div>
    <a href="/taro/$lang/blog.html">$($L.articles)</a>
    <a href="/taro/$lang/legend.html">$($L.legend)</a>
    <a href="/taro/$lang/thanks.html">$($L.thanks)</a>
    <select class="lang-select" aria-label="$($L.lang)" onchange="if(this.value) location.href=this.value">
      <option value="/taro/"$(if($lang -eq 'ru'){' selected'})>RU</option>
      <option value="/taro/en/"$(if($lang -eq 'en'){' selected'})>EN</option>
      <option value="/taro/de/"$(if($lang -eq 'de'){' selected'})>DE</option>
      <option value="/taro/zh/"$(if($lang -eq 'zh'){' selected'})>ZH</option>
    </select>
  </nav>
"@
}

function Page($lang, $title, $desc, $h1, $body, $extraHead) {
  $code = @{ en = 'en'; de = 'de'; zh = 'zh-Hans' }[$lang]
  @"
<!DOCTYPE html>
<html lang="$code" data-bg="more">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>$title</title>
<meta name="description" content="$desc">
<link rel="canonical" href="$site/$lang/$(($title -replace ' ','')).html">
$extraHead
<link rel="stylesheet" href="/taro/assets/style.css">
<link rel="stylesheet" href="/taro/assets/moon-bg.css">
<style>
html[data-bg]::before{content:'';position:fixed;inset:-40px;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(9,7,15,.45),rgba(9,7,15,.45)),url(/taro/img/luna.jpg);background-position:50% 40%,50% 40%;background-size:auto,cover;background-repeat:no-repeat,no-repeat;filter:brightness(88%)}
html.dyn-moon[data-bg]::before{background-image:linear-gradient(180deg, rgba(9,7,15,.88) 0%, rgba(9,7,15,.46) 34%, rgba(9,7,15,.58) 72%, rgba(9,7,15,.72) 100%) !important}
</style>
<link rel="icon" href="/taro/assets/favicon.svg" type="image/svg+xml">
</head>
<body>
<div id="moon-bg" aria-hidden="true"></div>
<header class="site"><div class="wrap"><div class="logo">$(@{en='Quiet Deck';de='Stilles Deck';zh='安静牌阵'}[$lang]) <span>$(@{en='· tarot for reflection';de='· Tarot zum Nachdenken';zh='· 用于思考的塔罗'}[$lang])</span></div>
$(Nav $lang)
</div></header>
<main class="wrap">
  <h1>$h1</h1>
$body
</main>
<footer class="site"><div class="wrap"><p>© $(@{en='Quiet Deck';de='Stilles Deck';zh='安静牌阵'}[$lang]). Rider–Waite–Smith (1909).</p><p><a href="/taro/$lang/">$( $navLabels[$lang].home )</a> · <a href="/taro/$lang/rasklad.html">$( $navLabels[$lang].spreads )</a> · <a href="/taro/$lang/karty.html">$( $navLabels[$lang].meanings )</a></p><p class="hint">$( @{en='For entertainment and reflection only.';de='Nur zur Unterhaltung und Reflexion.';zh='仅供娱乐与自我反思。'}[$lang] )</p></div></footer>
<script src="/taro/assets/cards.js"></script>
<script src="/taro/assets/cards.$lang.js"></script>
<script src="/taro/assets/moon-bg-phases.js" defer></script>
</body>
</html>
"@
}

foreach ($lang in @('en', 'de', 'zh')) {
  $t = $texts[$lang]
  $L = $navLabels[$lang]

  # 1) карты: список всех 78, собирается в браузере из данных колоды
  $body = @"
  <p class="lead">$($t.kartyLead)</p>
  <div id="all-cards"></div>
  <script>
  document.addEventListener('DOMContentLoaded', function () {
    var host = document.getElementById('all-cards');
    var data = window['TAROT_$(($lang).ToUpper())'] || {suits:{},cards:{}};
    var deck = window.TAROT_CARDS || [];
    var groups = [
      ['majors', deck.filter(function (c) { return c.arcana === 'major'; })],
      ['wands', deck.filter(function (c) { return c.suit === 'wands'; })],
      ['cups', deck.filter(function (c) { return c.suit === 'cups'; })],
      ['swords', deck.filter(function (c) { return c.suit === 'swords'; })],
      ['pentacles', deck.filter(function (c) { return c.suit === 'pentacles'; })]
    ];
    var titles = {majors: '$($L.majors)', wands: '$($L.wands)', cups: '$($L.cups)', swords: '$($L.swords)', pentacles: '$($L.pentacles)'};
    groups.forEach(function (g) {
      if (!g[1].length) return;
      var h = document.createElement('h2');
      h.id = g[0];
      h.textContent = titles[g[0]];
      host.appendChild(h);
      var wrap = document.createElement('div');
      wrap.className = 'grid c3';
      g[1].forEach(function (card) {
        var d = (data.cards || {})[card.slug] || {};
        var box = document.createElement('div');
        box.className = 'panel';
        box.style.display = 'block';
        var n = document.createElement('h3');
        n.style.marginTop = '0';
        n.textContent = d.name || card.en || card.name;
        var p = document.createElement('p');
        p.style.cssText = 'font-size:14.5px;color:var(--muted);margin:0';
        p.textContent = d.essence || '';
        box.appendChild(n); box.appendChild(p);
        wrap.appendChild(box);
      });
      host.appendChild(wrap);
    });
  });
  </script>
"@
  Page $lang $t.kartyTitle $t.kartyLead $t.kartyH1 $body '' | Set-Content "$dir\$lang\karty.html" -Encoding utf8

  # 2) легенда
  $body = @"
  <p class="lead">$($t.legendText)</p>
  <p><a href="/taro/legenda.html">$(@{en='Read the full legend (Russian)';de='Die vollständige Legende lesen (russisch)';zh='阅读完整传说（俄语）'}[$lang])</a></p>
"@
  Page $lang $t.legendTitle $t.legendH1 $t.legendH1 $body '' | Set-Content "$dir\$lang\legend.html" -Encoding utf8

  # 3) спасибо
  $body = @"
  <p class="lead">$($t.thanksText)</p>
  <p><a class="btn" href="https://vtb.paymo.ru/collect-money/qr/?transaction=c5175d82-6f5f-46c8-9d09-f9a4761ade7d" rel="noopener">$($t.thanksBtn)</a></p>
"@
  Page $lang $t.thanksTitle $t.thanksH1 $t.thanksH1 $body '' | Set-Content "$dir\$lang\thanks.html" -Encoding utf8

  # 4) статьи — ссылки на русские материалы
  $arts = @(
    @('blog/karta-dnya.html', @{en='Working with the card of the day';de='Mit der Tageskarte arbeiten';zh='如何使用今日一牌'}[$lang]),
    @('blog/kak-zadavat-voprosy-kolode.html', @{en='How to ask the cards a question';de='Wie man den Karten eine Frage stellt';zh='如何向牌提问'}[$lang]),
    @('blog/perevernutye-karty.html', @{en='Reversed cards';de='Umgekehrte Karten';zh='逆位牌'}[$lang]),
    @('blog/keltskiy-krest.html', @{en='The Celtic Cross';de='Das Keltische Kreuz';zh='凯尔特十字'}[$lang]),
    @('blog/rasklad-na-treh-kartah.html', @{en='The three-card spread';de='Die Drei-Karten-Legung';zh='三张牌牌阵'}[$lang]),
    @('blog/starshie-arkany.html', @{en='The Major Arcana';de='Die Großen Arkana';zh='大牌'}[$lang]),
    @('blog/taro-i-psihologiya.html', @{en='Tarot and psychology';de='Tarot und Psychologie';zh='塔罗与心理学'}[$lang]),
    @('blog/taro-na-lyubov.html', @{en='Tarot on love';de='Tarot zur Liebe';zh='关于爱情的塔罗'}[$lang]),
    @('blog/taro-na-dengi.html', @{en='Tarot on money';de='Tarot zum Geld';zh='关于金钱的塔罗'}[$lang]),
    @('blog/plohie-voprosy.html', @{en='Bad questions to ask';de='Schlechte Fragen';zh='不好的问题'}[$lang]),
    @('blog/kak-vybrat-kolodu.html', @{en='Choosing a deck';de='Ein Deck auswählen';zh='如何选择牌组'}[$lang]),
    @('blog/istoriya-taro.html', @{en='A short history of tarot';de='Kurze Geschichte des Tarot';zh='塔罗简史'}[$lang])
  )
  $list = ($arts | ForEach-Object { "    <li><a href=`"/taro/$($_[0])`">$($_[1])</a></li>" }) -join "`n"
  $body = @"
  <p class="lead">$($t.blogLead)</p>
  <ul class="clean">
$list
  </ul>
  <p class="hint">$( @{en='Articles are in Russian for now.';de='Die Artikel sind vorerst auf Russisch.';zh='文章目前为俄语。'}[$lang] )</p>
"@
  Page $lang $t.blogTitle $t.blogLead $t.blogH1 $body '' | Set-Content "$dir\$lang\blog.html" -Encoding utf8

  # 5) заменяем навигацию во всех страницах языка
  $nav = Nav $lang
  $count = 0
  foreach ($f in (Get-ChildItem "$dir\$lang" -Filter *.html)) {
    $c = Get-Content $f.FullName -Raw -Encoding utf8
    $new = [regex]::Replace($c, '(?s)<nav class="main">.*?</nav>', $nav, 1)
    if ($new -ne $c) { Set-Content -Path $f.FullName -Value $new -Encoding utf8; $count++ }
  }
  "--- $lang : страниц создано 4, навигация обновлена в $count"
}

