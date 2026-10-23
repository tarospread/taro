$ErrorActionPreference = 'Stop'
$root = 'C:\Users\User\.dsh\taro-pages'
$tmp  = Join-Path $root '_gen\tr\_tmp'
$out  = Join-Path $root '_gen\tr\en'
if (-not (Test-Path $out)) { New-Item -ItemType Directory -Force -Path $out | Out-Null }

$items = @(
  @{ slug='kak-zadavat-voprosy-kolode'
     title='How to ask the tarot deck a question — Quiet Deck'
     h1='How to ask the tarot deck a question'
     date='7 October 2026'
     description='The wording of a question shapes most of the answer: which questions work, which turn vague, and how to reframe love, work and money questions.' },
  @{ slug='plohie-voprosy'
     title='11 questions not to ask the tarot cards — Quiet Deck'
     h1='11 questions not to ask the tarot cards'
     date='1 October 2026'
     description='Which questions come back vague, put you in the victim''s seat or cross other people''s boundaries — with examples and a working replacement for each.' },
  @{ slug='kak-vybrat-kolodu'
     title='How to choose your first tarot deck — Quiet Deck'
     h1='How to choose your first tarot deck'
     date='6 October 2026'
     description='Rider–Waite–Smith, Marseille, Thoth or an oracle: how the systems differ, what matters for a beginner, and why the prettiest deck is a poor first choice.' },
  @{ slug='taro-na-lyubov'
     title='Tarot on love: what the cards are saying — Quiet Deck'
     h1='Tarot on love: what the cards are saying'
     date='3 October 2026'
     description='Love readings: which cards are considered good, what the difficult cards mean in questions of the heart, and how not to mistake hope for what the cards say.' },
  @{ slug='keltskiy-krest'
     title='The Celtic Cross: a 10-card spread, position by position — Quiet Deck'
     h1='The Celtic Cross: a 10-card spread, position by position'
     date='4 October 2026'
     description='The classic Celtic Cross tarot spread: the layout, the meaning of all ten positions and the order to read them in, for a deep look at a tangled situation.' },
  @{ slug='taro-na-dengi'
     title='Tarot on money and work: reading cards for business questions — Quiet Deck'
     h1='Tarot on money and work: reading cards for business questions'
     date='2 October 2026'
     description='Which suits and cards speak about money and career, a three-card spread for business questions, and the usual mistakes people make when reading them.' }
)

foreach ($it in $items) {
  $main = Get-Content (Join-Path $tmp ($it.slug + '.main.html')) -Raw -Encoding utf8
  $main = $main.Replace("`r`n", "`n").TrimEnd("`n")
  $obj = [ordered]@{
    title       = $it.title
    description = $it.description
    h1          = $it.h1
    date        = $it.date
    main        = $main
  }
  $json = $obj | ConvertTo-Json -Depth 5
  $path = Join-Path $out ($it.slug + '.json')
  [IO.File]::WriteAllText($path, $json, (New-Object System.Text.UTF8Encoding($false)))
  $len = (Get-Content $path -Raw -Encoding utf8 | ConvertFrom-Json).description.Length
  "{0} | desc={1} | bytes={2}" -f $it.slug, $len, (Get-Item $path).Length
}
