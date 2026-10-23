$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'
$lang = 'de'

$t = @{
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
  why = 'Tarot ist hier keine Vorhersage des Unvermeidlichen. Eine Karte benennt ein Thema und eine Richtung der Aufmerksamkeit; die Entscheidung bleibt bei Ihnen. Darum ist das Deck still: kein Geschrei, kein Schicksal, kein Druck — nur ein Spiegel zum Nachdenken.'
}

$cards = ''
foreach ($item in $t.cards) {
  $cards += @"
    <a class="panel" href="/taro/$lang/$($item[0])" style="display:block">
      <h3 style="margin-top:0">$($item[1])</h3>
      <p style="font-size:15px;color:var(--muted);margin:0">$($item[2])</p>
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

$path = Join-Path "$dir\de" 'index.html'
$content = Get-Content $path -Raw -Encoding utf8
$new = [regex]::Replace($content, '(?s)<main class="wrap">.*?</main>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $main }, 1)
Set-Content -Path $path -Value $new -Encoding utf8
'de: главная перестроена'
