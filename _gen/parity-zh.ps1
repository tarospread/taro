$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'

$T = @{
  en = @{
    qLabel = 'Your question (optional)'
    qPh = 'For example: what helps me understand my project?'
    qHint = 'Open questions work better: “what should I do to…”, “what do I need to understand about…”.'
    extra = @"
  <h2>One card or three</h2>
  <div class="table-scroll"><table>
    <tr><th>Format</th><th>When it fits</th><th>What it shows</th></tr>
    <tr><td>One card a day</td><td>Every morning, for practice</td><td>The tone of the day, one theme to notice</td></tr>
    <tr><td>Three cards a day</td><td>An important day: a meeting, a talk, a decision</td><td>Morning–day–evening, or situation–help–obstacle</td></tr>
    <tr><td>Three cards on a question</td><td>A concrete situation, not a day</td><td>Past–present–future, situation–obstacle–advice</td></tr>
  </table></div>

  <h2>How to ask a question</h2>
  <ul class="clean">
    <li>“What do I need to understand about this situation?”</li>
    <li>“What should I pay attention to in the conversation with …?”</li>
    <li>“Where am I pushing too hard?”</li>
    <li>“What will support me if the day goes off plan?”</li>
  </ul>
  <p>Poor questions: “what will happen?”, “does he love me?”, “should I quit my job?” — one card cannot answer them honestly.</p>

  <h2>See also</h2>
  <p><a href="/taro/en/karty.html">Meanings of all 78 cards</a> · <a href="/taro/en/rasklad.html">Three-card spread</a> · <a href="/taro/en/celtic-cross.html">Celtic Cross</a> · <a href="/taro/en/karty.html">Card meanings</a></p>
"@
  }
  de = @{
    qLabel = 'Ihre Frage (optional)'
    qPh = 'Zum Beispiel: Was hilft mir, mein Projekt zu verstehen?'
    qHint = 'Offene Fragen wirken besser: „Was sollte ich tun, um …“, „Was muss ich über … verstehen?“'
    extra = @"
  <h2>Eine Karte oder drei</h2>
  <div class="table-scroll"><table>
    <tr><th>Format</th><th>Wann es passt</th><th>Was es zeigt</th></tr>
    <tr><td>Eine Karte am Tag</td><td>Jeden Morgen, zum Üben</td><td>Den Ton des Tages, ein Thema zum Achten</td></tr>
    <tr><td>Drei Karten am Tag</td><td>Ein wichtiger Tag: Gespräch, Treffen, Entscheidung</td><td>Morgen–Tag–Abend oder Situation–Hilfe–Hindernis</td></tr>
    <tr><td>Drei Karten zu einer Frage</td><td>Eine konkrete Lage, nicht ein Tag</td><td>Vergangenheit–Gegenwart–Zukunft, Situation–Hindernis–Rat</td></tr>
  </table></div>

  <h2>Wie man fragt</h2>
  <ul class="clean">
    <li>„Was muss ich über diese Lage verstehen?“</li>
    <li>„Worauf soll ich im Gespräch mit … achten?“</li>
    <li>„Wo drücke ich zu stark?“</li>
    <li>„Was trägt mich, wenn der Tag anders läuft?“</li>
  </ul>
  <p>Schlechte Fragen: „Was wird passieren?“, „Liebt er mich?“, „Soll ich kündigen?“ — eine Karte kann sie nicht ehrlich beantworten.</p>

  <h2>Siehe auch</h2>
  <p><a href="/taro/de/karty.html">Bedeutung aller 78 Karten</a> · <a href="/taro/de/rasklad.html">Drei-Karten-Legung</a> · <a href="/taro/de/keltisches-kreuz.html">Keltisches Kreuz</a></p>
"@
  }
  zh = @{
    qLabel = '你的问题（可选）'
    qPh = '例如：什么能帮我理解这个项目？'
    qHint = '开放式问题更有效：“我应该怎么做才能……”“关于……我需要明白什么？”'
    extra = @"
  <h2>一张牌还是三张</h2>
  <div class="table-scroll"><table>
    <tr><th>方式</th><th>适合什么时候</th><th>显示什么</th></tr>
    <tr><td>每天一张</td><td>每天早上，用于练习</td><td>这一天的基调，一个值得留意的主题</td></tr>
    <tr><td>每天三张</td><td>重要的一天：会谈、谈话、决定</td><td>早上–白天–晚上，或 处境–帮助–阻碍</td></tr>
    <tr><td>针对问题的三张</td><td>具体处境，而不是某一天</td><td>过去–现在–未来，处境–阻碍–建议</td></tr>
  </table></div>

  <h2>怎么提问</h2>
  <ul class="clean">
    <li>“关于这个处境，我需要明白什么？”</li>
    <li>“在和……谈话时，我该注意什么？”</li>
    <li>“我在哪里用力过猛？”</li>
    <li>“如果一天不按计划走，什么会支撑我？”</li>
  </ul>
  <p>不好的问题：“会发生什么？”“他爱我吗？”“该不该辞职？”——一张牌无法诚实回答。</p>

  <h2>另见</h2>
  <p><a href="/taro/zh/karty.html">全部 78 张牌的牌义</a> · <a href="/taro/zh/rasklad.html">三张牌牌阵</a> · <a href="/taro/zh/kaierte-shizi.html">凯尔特十字</a></p>
"@
  }
}

foreach ($lang in @('zh')) {
  $t = $T[$lang]

  # 1) поле вопроса на странице расклада
  $p = Join-Path "$dir\$lang" 'rasklad.html'
  $c = Get-Content $p -Raw -Encoding utf8
  if ($c -notmatch 'id="question"') {
    $block = @"
    <label for="question">$($t.qLabel)</label>
    <input type="text" id="question" placeholder="$($t.qPh)" maxlength="200">
    <div class="hint">$($t.qHint)</div>

"@
    $c = $c.Replace('    <label id="spread-kind-label">', ($block + '    <label id="spread-kind-label">'))
    Set-Content -Path $p -Value $c -Encoding utf8
  }

  # 2) недостающие блоки на странице «на день»
  $p2 = Join-Path "$dir\$lang" 'den.html'
  $d = Get-Content $p2 -Raw -Encoding utf8
  if ($d -notmatch 'One card or three|Eine Karte oder drei|一张牌还是三张') {
    $d = [regex]::Replace($d, '(\s*<p class="disclaimer">)', ("`n" + $t.extra + '$1'), 1)
    Set-Content -Path $p2 -Value $d -Encoding utf8
  }
  "${lang}: поле вопроса и блоки добавлены"
}
