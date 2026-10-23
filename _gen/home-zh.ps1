$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'
$lang = 'zh'

$t = @{
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

$path = Join-Path "$dir\zh" 'index.html'
$content = Get-Content $path -Raw -Encoding utf8
$new = [regex]::Replace($content, '(?s)<main class="wrap">.*?</main>', [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $main }, 1)
Set-Content -Path $path -Value $new -Encoding utf8
'zh: главная перестроена'
