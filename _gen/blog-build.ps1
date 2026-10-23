$ErrorActionPreference = 'Stop'
$root = 'C:\Users\User\.dsh\taro-pages'
$tr   = Join-Path $root '_gen\tr'

$slugs = @(
  'kak-zadavat-voprosy-kolode', 'plohie-voprosy', 'kak-vybrat-kolodu', 'taro-na-lyubov',
  'keltskiy-krest', 'taro-na-dengi', 'taro-i-psihologiya', 'istoriya-taro',
  'starshie-arkany', 'rasklad-na-treh-kartah', 'karta-dnya', 'perevernutye-karty'
)

$base = 'https://tarospread.github.io/taro'
$brand = @{ en = 'Quiet Deck'; de = 'Stilles Deck'; zh = '安静牌阵' }
$brandSub = @{ en = 'tarot for reflection'; de = 'Tarot zum Nachdenken'; zh = '用于思考的塔罗' }
$blogLabel = @{ en = 'Articles'; de = 'Artikel'; zh = '文章' }
$homeLabel = @{ en = 'Home'; de = 'Startseite'; zh = '首页' }

function Build-Tag($lang, $slug) {
  # берём перевод
  $jsonPath = Join-Path $tr "$lang\$slug.json"
  if (-not (Test-Path $jsonPath)) { Write-Host "НЕТ перевода: $lang/$slug"; return $false }
  $t = Get-Content $jsonPath -Raw -Encoding utf8 | ConvertFrom-Json

  # русский оригинал — оболочка
  $ru = Get-Content (Join-Path $root "blog\$slug.html") -Raw -Encoding utf8

  # язык, канонический адрес
  $canon = "$base/$lang/blog/$slug.html"
  $ruCanon = "$base/blog/$slug.html"

  $html = $ru
  $html = $html -replace '<html lang="ru"', ('<html lang="' + $lang + '"')

  # title и description
  $html = [regex]::Replace($html, '(?s)<title>.*?</title>', "<title>$($t.title)</title>", 1)
  $html = [regex]::Replace($html, '<meta name="description" content="[^"]*">', ('<meta name="description" content="' + $t.description + '">'), 1)

  # canonical + hreflang
  $html = $html.Replace("href=`"$ruCanon`"", "href=`"$canon`"")
  $html = $html.Replace($ruCanon, $canon)

  # og
  $html = [regex]::Replace($html, '<meta property="og:title" content="[^"]*">', ('<meta property="og:title" content="' + $t.title + '">'), 1)
  $html = [regex]::Replace($html, '<meta property="og:description" content="[^"]*">', ('<meta property="og:description" content="' + $t.description + '">'), 1)

  # JSON-LD
  $ld = '{"@context":"https://schema.org","@type":"Article","headline":"' + $t.h1 + '","description":"' + $t.description + '","inLanguage":"' + $lang + '","mainEntityOfPage":"' + $canon + '","publisher":{"@type":"Organization","name":"' + $brand[$lang] + '"},"datePublished":"' + $t.date + '"}'
  $html = [regex]::Replace($html, '(?s)<script type="application/ld\+json">.*?</script>', ('<script type="application/ld+json">' + $ld + '</script>'), 1)

  # шапка и подвал — из переводной страницы блога того же языка
  $langBlog = Get-Content (Join-Path $root "$lang\blog.html") -Raw -Encoding utf8
  $nav = [regex]::Match($langBlog, '(?s)<header class="site".*?</header>').Value
  $foot = [regex]::Match($langBlog, '(?s)<footer class="site".*?</footer>').Value
  $html = [regex]::Replace($html, '(?s)<header class="site".*?</header>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $nav }, 1)
  $html = [regex]::Replace($html, '(?s)<footer class="site".*?</footer>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $foot }, 1)

  # main
  $html = [regex]::Replace($html, '(?s)<main.*?</main>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $t.main }, 1)

  # поле вопроса и прочее не нужно; сохраняем путь
  $outDir = Join-Path $root "$lang\blog"
  if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
  Set-Content -Path (Join-Path $outDir "$slug.html") -Value $html -Encoding utf8
  return $true
}

$ok = 0; $miss = 0
foreach ($lang in @('en', 'de', 'zh')) {
  foreach ($slug in $slugs) {
    if (Build-Tag $lang $slug) { $ok++ } else { $miss++ }
  }
}
"собрано страниц: $ok, без перевода: $miss"
