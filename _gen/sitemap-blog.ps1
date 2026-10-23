$ErrorActionPreference = 'Stop'
$root = 'C:\Users\User\.dsh\taro-pages'
$smap = Join-Path $root 'sitemap.xml'
$c = Get-Content $smap -Raw -Encoding utf8

$slugs = @(
  'kak-zadavat-voprosy-kolode', 'plohie-voprosy', 'kak-vybrat-kolodu', 'taro-na-lyubov',
  'keltskiy-krest', 'taro-na-dengi', 'taro-i-psihologiya', 'istoriya-taro',
  'starshie-arkany', 'rasklad-na-treh-kartah', 'karta-dnya', 'perevernutye-karty'
)
$base = 'https://tarospread.github.io/taro'
$today = '2026-10-23'

$added = 0
foreach ($lang in @('en', 'de', 'zh')) {
  foreach ($slug in $slugs) {
    $url = "$base/$lang/blog/$slug.html"
    if ($c -notmatch [regex]::Escape($url)) {
      $c = $c.Replace('</urlset>', "  <url><loc>$url</loc><lastmod>$today</lastmod></url>`n</urlset>")
      $added++
    }
  }
}
# страницы списка статей уже есть? проверим
foreach ($lang in @('en', 'de', 'zh')) {
  $url = "$base/$lang/blog.html"
  if ($c -notmatch [regex]::Escape($url)) {
    $c = $c.Replace('</urlset>', "  <url><loc>$url</loc><lastmod>$today</lastmod></url>`n</urlset>")
    $added++
  }
}
Set-Content -Path $smap -Value $c -Encoding utf8
"добавлено URL: $added, всего: " + ([regex]::Matches($c, '<loc>').Count)
