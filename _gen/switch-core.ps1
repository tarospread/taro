# Переключение страниц на единый движок core.js + словарь.
# Запуск только после проверки: pwsh -File _gen\switch-core.ps1
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\User\.dsh\taro-pages'
$ver  = '20261025a'

function Lang-Of($path) {
  if ($path -match '\\en\\') { return 'en' }
  if ($path -match '\\de\\') { return 'de' }
  if ($path -match '\\zh\\') { return 'zh' }
  return 'ru'
}

$changed = 0
foreach ($f in (Get-ChildItem $root -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch '\\_gen\\' })) {
  $lang = Lang-Of $f.FullName
  $c = Get-Content $f.FullName -Raw -Encoding utf8
  $o = $c

  $hasCore = $c -match 'core\.js'
  if ($hasCore) { continue }

  # 1) словарь ставим перед движком
  if ($c -notmatch 'assets/i18n/') {
    $dictTag = '<script src="/taro/assets/i18n/' + $lang + '.js?v=' + $ver + '"></script>'
    if ($c -match '<script src="/taro/assets/cards[^"]*"></script>') {
      $c = [regex]::Replace($c, '(<script src="/taro/assets/cards[^"]*"></script>)', ($dictTag + "`n" + '$1'), 1)
    } else {
      $c = $c.Replace('</body>', ($dictTag + "`n" + '</body>'))
    }
  }

  # 2) app.js / app-i18n.js → core.js
  $c = [regex]::Replace($c, '<script src="/taro/assets/app(-i18n)?\.js(\?v=[\w]+)?"></script>',
    ('<script src="/taro/assets/core.js?v=' + $ver + '"></script>'))

  if ($c -ne $o) {
    Set-Content -Path $f.FullName -Value $c -Encoding utf8
    $changed++
  }
}
"страниц переключено на core.js: $changed"
