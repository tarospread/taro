$ErrorActionPreference = 'Stop'
$root = 'C:\Users\User\.dsh\taro-pages'
$tr   = Join-Path $root '_gen\tr'

$slugs = @(
  'kak-zadavat-voprosy-kolode', 'plohie-voprosy', 'kak-vybrat-kolodu', 'taro-na-lyubov',
  'keltskiy-krest', 'taro-na-dengi', 'taro-i-psihologiya', 'istoriya-taro',
  'starshie-arkany', 'rasklad-na-treh-kartah', 'karta-dnya', 'perevernutye-karty'
)

$head = @{
  en = @{ h1 = 'Articles about tarot'; lead = 'How to read cards, how to ask questions, and where the deck came from. Quietly, without mysticism for its own sake.'; sub = 'Articles' }
  de = @{ h1 = 'Artikel über Tarot'; lead = 'Wie man Karten liest, wie man fragt und woher das Deck kommt. Ruhig, ohne Mystik um ihrer selbst willen.'; sub = 'Artikel' }
  zh = @{ h1 = '塔罗文章'; lead = '怎么读牌、怎么提问，以及这副牌的来历。安静地讲，不做多余的玄虚。'; sub = '文章' }
}

foreach ($lang in @('en', 'de', 'zh')) {
  $items = ''
  foreach ($slug in $slugs) {
    $p = Join-Path $tr "$lang\$slug.json"
    if (-not (Test-Path $p)) { continue }
    $t = Get-Content $p -Raw -Encoding utf8 | ConvertFrom-Json
    $items += '  <a class="panel" href="/taro/' + $lang + '/blog/' + $slug + '.html" style="display:block;margin-bottom:14px">' + "`n"
    $items += '    <h2 style="margin:0 0 6px;font-size:19px">' + $t.h1 + '</h2>' + "`n"
    $items += '    <p style="margin:0 0 6px;color:var(--muted);font-size:15px">' + $t.description + '</p>' + "`n"
    $items += '    <p class="hint" style="margin:0">' + $t.date + '</p>' + "`n"
    $items += '  </a>' + "`n"
  }

  $main = @"
<main class="wrap">
  <h1>$($head[$lang].h1)</h1>
  <p class="lead">$($head[$lang].lead)</p>
  <div style="margin-top:26px">
$items  </div>
</main>
"@

  $page = Join-Path $root "$lang\blog.html"
  $c = Get-Content $page -Raw -Encoding utf8
  if ($c -notmatch 'class="panel" href="/taro/' + $lang + '/blog/') {
    $c = [regex]::Replace($c, '(?s)<main.*?</main>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $main }, 1)
    Set-Content -Path $page -Value $c -Encoding utf8
    "${lang}: список статей обновлён"
  } else {
    "${lang}: список уже собран"
  }
}
