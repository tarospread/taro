$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'
$site = 'https://tarospread.github.io/taro'

$data = Get-Content "$dir\_gen\spreads.json" -Raw -Encoding utf8 | ConvertFrom-Json
$tpl  = Get-Content "$dir\_gen\template.html" -Raw -Encoding utf8

# позиции берём из app-i18n.js, чтобы таблица совпадала с движком
function Get-Positions($lang) {
  $js = Get-Content "$dir\assets\app-i18n.js" -Raw -Encoding utf8
  # вырезаем блок нужного языка: от "  xx: {" до следующего аналогичного маркера
  $start = $js.IndexOf("  ${lang}: {")
  if ($start -lt 0) { return @() }
  $next = @()
  foreach ($other in @('en','de','zh')) {
    if ($other -eq $lang) { continue }
    $i = $js.IndexOf("  ${other}: {", $start + 5)
    if ($i -gt 0) { $next += $i }
  }
  $end = if ($next.Count -gt 0) { ($next | Measure-Object -Minimum).Minimum } else { $js.Length }
  $block = $js.Substring($start, $end - $start)

  $items = [regex]::Matches($block, "(?s)name:\s*'([^']*)',\s*pos:\s*\[([^\]]*)\]")
  $out = @()
  foreach ($it in $items) {
    $pos = [regex]::Matches($it.Groups[2].Value, "'([^']*)'") | ForEach-Object { $_.Groups[1].Value }
    $out += , @{ name = $it.Groups[1].Value; pos = $pos }
  }
  return $out
}

$codes = @{ en = 'en'; de = 'de'; zh = 'zh-Hans' }
$total = 0

foreach ($lang in @('en', 'de', 'zh')) {
  $ui = $data.$lang
  $pos = Get-Positions $lang
  if ($pos.Count -ne 7) { throw "$lang : найдено $($pos.Count) раскладов вместо 7" }

  foreach ($s in $data.spreads) {
    $t = $s.$lang
    if (-not $t) { continue }

    $canon = "$site/$lang/$($t.file).html"
    $alt = @()
    foreach ($other in @('en', 'de', 'zh')) {
      $ot = $s.$other
      if ($ot) {
        $code = if ($other -eq 'zh') { 'zh-Hans' } else { $other }
        $alt += "<link rel=`"alternate`" hreflang=`"$code`" href=`"$site/$other/$($ot.file).html`">"
      }
    }
    $alt += "<link rel=`"alternate`" hreflang=`"x-default`" href=`"$site/en/$($s.en.file).html`">"

    $rows = for ($j = 0; $j -lt $pos[$s.idx].pos.Count; $j++) {
      "    <tr><td>$($j + 1)</td><td>$($pos[$s.idx].pos[$j])</td></tr>"
    }

    $html = $tpl
    $map = @{
      '__LANG__' = $codes[$lang]; '__LANGSHORT__' = $lang
      '__TITLE__' = $t.title; '__DESC__' = $t.desc; '__CANON__' = $canon
      '__ALT__' = ($alt -join "`n"); '__H1__' = $t.h1; '__LEAD__' = $t.lead
      '__SPREADLABEL__' = $ui.label; '__REV__' = $ui.rev; '__REVHINT__' = $ui.revHint
      '__DRAW__' = $ui.draw; '__POSITIONS_TITLE__' = $ui.posTitle; '__POSWORD__' = $ui.posWord
      '__ROWS__' = ($rows -join "`n"); '__HOW_TITLE__' = $ui.howTitle; '__HOW__' = $t.how
      '__DISCLAIMER__' = $ui.disclaimer; '__HEADER__' = $ui.header; '__FOOTER__' = $ui.footer
      '__IDX__' = [string]$s.idx
    }
    foreach ($k in $map.Keys) { $html = $html.Replace($k, $map[$k]) }

    $path = Join-Path "$dir\$lang" "$($t.file).html"
    Set-Content -Path $path -Value $html -Encoding utf8
    $total++
  }
  "--- $lang : готово"
}
"страниц создано: $total"


