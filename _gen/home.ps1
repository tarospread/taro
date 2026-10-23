$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'

$T = @{
  en = @{
    h1 = 'Card of the day'
    lead = 'One card for the whole day — no re-drawing. See which energy is in focus today and what it advises.'
    hint = 'The card of the day is the same for every visitor and changes once a day. A reading is a reason to think, not a verdict.'
    cards = @(
      @('den.html', 'Daily tarot reading', 'One card for a day: how to ask, how to read, and what to do if you dislike the card.'),
      @('rasklad.html', 'Three-card spread', 'Ask an open question and get a reading by three positions plus the whole picture.'),
      @('karty.html', 'Meanings of 78 cards', 'Major and Minor Arcana: upright and reversed, the advice of each card, love, work and money.'),
      @('blog.html', 'How to ask the cards', 'The main skill in tarot: most of the answer depends on how the question is put.'),
      @('celtic-cross.html', 'Celtic Cross', 'A big ten-card spread for a complex situation: past, obstacle, environment, fears and outcome.')
    )
    allTitle = 'All spreads:'
    allText = 'three cards, Celtic Cross, year ahead (12), relationships, Mirror and Path'
    allHref = 'rasklad.html'
    whyTitle = 'Why it works this way'
    why = 'Tarot here is not a prediction of the inevitable. A card names a theme and a direction of attention; the decision stays with you. That is why the deck is quiet: no shouting, no “fate”, no pressure — only a mirror for thinking.'
  }
  de = @{
    h1 = 'Tageskarte'
    lead = 'Eine Karte für den ganzen Tag — ohne Nachlegen. Sehen Sie, welche Energie heute im Fokus steht und was sie rät.'
    hint = 'Die Tageskarte ist für alle Besucher gleich und wechselt einmal am Tag. Eine Deutung ist ein Anlass zum Nachdenken, kein Urteil.'
    cards = @(
      @('den.html', 'Tageslegung Tarot', 'Eine Karte für einen Tag: wie fragen, wie lesen und was tun, wenn die Karte nicht gefällt.'),
      @('rasklad.html', 'Drei-Karten-Legung', 'Stellen Sie eine offene Frage — Sie erhalten eine Deutung nach drei Positionen und das Gesamtbild.'),
      @('karty.html', 'Bedeutung der 78 Karten', 'Große und Kleine Arkana: aufrecht und umgekehrt, Rat der Karte, Liebe, Arbeit und Geld.'),
      @('blog.html', 'Wie man die Karten fragt', 'Die wichtigste Fähigkeit im Tarot: Der größte Teil der Antwort hängt von der Frage ab.'),
      @('keltisches-kreuz.html', 'Keltisches Kreuz', 'Eine große Legung mit zehn Karten für eine komplexe Lage: Vergangenheit, Hindernis, Umfeld, Ängste und Ergebnis.')
    )
    allTitle = 'Alle Legungen:'
    allText = 'drei Karten, Keltisches Kreuz, Jahreslegung (12), Beziehung, Spiegel und Weg'
    allHref = 'rasklad.html'
    whyTitle = 'Warum es so funktioniert'
    why = 'Tarot ist hier keine Vorhersage des Unvermeidlichen. Eine Karte benennt ein Thema und eine Richtung der Aufmerksamkeit; die Entscheidung bleibt bei Ihnen. Darum ist das Deck still: kein Geschrei, kein „Schicksal“, kein Druck — nur ein Spiegel zum Nachdenken.'
  }
  zh = @{
    h1 = '今日一牌'
    lead = '一张牌陪你一整天——不必反复抽。看看今天在焦点上的是哪种能量，它给出什么建议。'
    hint = '今日一牌对所有访客相同，每天更换一次。解读只是思考的理由，不是判决。'
    cards = @(
      @('den.html', '每日塔罗占卜', '一天一张牌：怎么提问、怎么阅读，以及不喜欢这张牌时该怎么做。'),
      @('rasklad.html', '三张牌牌阵', '提出一个开放的问题——按三个位置解读，并给出整体画面。'),
      @('karty.html', '78 张牌的牌义', '大牌与小牌：正位与逆位、牌的建议，以及爱情、工作与金钱。'),
      @('blog.html', '如何向牌提问', '塔罗最重要的能力：答案的大半取决于问题的提法。'),
      @('kaierte-shizi.html', '凯尔特十字', '十张牌的大牌阵，用于复杂处境：过去、阻碍、环境、恐惧与结果。')
    )
    allTitle = '全部牌阵：'
    allText = '三张牌、凯尔特十字、年度（12 张）、关系、镜子与路径'
    allHref = 'rasklad.html'
    whyTitle = '为什么这样设计'
    why = '这里的塔罗不是预言必然。牌指出主题和注意力方向，决定始终在你自己手里。所以这副牌很安静：没有喧哗，没有“命运”，没有压力——只是一面用来思考的镜子。'
  }
}

foreach ($lang in @('en', 'de', 'zh')) {
  $t = $T[$lang]
  $cards = ''
  foreach ($c in $t.cards) {
    $cards += @"
    <a class="panel" href="/taro/$lang/$($c[0])" style="display:block">
      <h3 style="margin-top:0">$($c[1])</h3>
      <p style="font-size:15px;color:var(--muted);margin:0">$($c[2])</p>
    </a>

"@
  }

  $main = @"
<main class="wrap">
  <h1>$($t.h1)</h1>
  <p class="lead">$($t.lead)</p>

  <div class="grid c2" style="align-items:start">
    <div id="day-card-i18n" class="slot"></div>
    <div class="panel">
      <p class="hint" style="margin-top:0">$($t.hint)</p>
    </div>
  </div>

  <div class="grid c3" style="margin-top:34px">
$cards  </div>

  <p class="hint" style="margin-top:14px">$($t.allTitle) <a href="/taro/$lang/$($t.allHref)">$($t.allText)</a>.</p>

  <h2>$($t.whyTitle)</h2>
  <p>$($t.why)</p>
</main>
"@

  $p = Join-Path "$dir\$lang" 'index.html'
  $c = Get-Content $p -Raw -Encoding utf8
  $new = [regex]::Replace($c, '(?s)<main class="wrap">.*?</main>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $main }, 1)
  Set-Content -Path $p -Value $new -Encoding utf8
  "--- $lang : главная перестроена по русскому образцу"
}
