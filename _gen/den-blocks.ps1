$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\User\.dsh\taro-pages'

$faq = @{
  en = @"
  <h2>Frequently asked</h2>
  <div class="panel">
    <p><b>Is the card of the day the same for everyone?</b><br>Yes. It is computed from the date, so all visitors see one card per day. That is not a reading of your situation but a shared theme of the day.</p>
    <p><b>Can I draw again if I dislike the card?</b><br>You can, but the point is lost: talking to the deck turns into looking for a convenient answer. Better to note the first card and come back to it in the evening.</p>
    <p><b>Do I have to learn all 78 meanings?</b><br>No. Start with the 22 Major Arcana and the four Aces; the rest will come with practice.</p>
  </div>
"@
  de = @"
  <h2>Häufige Fragen</h2>
  <div class="panel">
    <p><b>Ist die Tageskarte für alle gleich?</b><br>Ja. Sie wird aus dem Datum berechnet, alle Besucher sehen pro Tag eine Karte. Das ist keine Deutung Ihrer Lage, sondern ein gemeinsames Tagesthema.</p>
    <p><b>Darf ich neu ziehen, wenn die Karte nicht gefällt?</b><br>Man kann, aber der Sinn geht verloren: Das Gespräch mit dem Deck wird zur Suche nach einer bequemen Antwort. Besser: die erste Karte notieren und abends zurückkommen.</p>
    <p><b>Muss ich alle 78 Bedeutungen lernen?</b><br>Nein. Beginnen Sie mit den 22 Großen Arkana und den vier Assen; der Rest kommt mit der Übung.</p>
  </div>
"@
  zh = @"
  <h2>常见问题</h2>
  <div class="panel">
    <p><b>今日一牌对所有人都一样吗？</b><br>是的。它按日期计算，所有访客每天看到同一张牌。这不是对你处境的解读，而是这一天的共同主题。</p>
    <p><b>不喜欢这张牌，可以重抽吗？</b><br>可以，但意义会消失：与牌的对话变成了寻找顺耳答案。更好的做法是记下第一张牌，晚上再回来看。</p>
    <p><b>需要背下全部 78 张牌的牌义吗？</b><br>不需要。先从 22 张大牌和四张 A 开始，其余的随练习而来。</p>
  </div>
"@
}

$section = @{
  en = @"
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
  <p><a href="/taro/en/karty.html">Meanings of all 78 cards</a> · <a href="/taro/en/rasklad.html">Three-card spread</a> · <a href="/taro/en/celtic-cross.html">Celtic Cross</a></p>
"@
  de = @"
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
  zh = @"
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

foreach ($lang in @('en', 'de', 'zh')) {
  $p = Join-Path "$dir\$lang" 'den.html'
  $d = Get-Content $p -Raw -Encoding utf8

  if ($d -notmatch 'One card or three|Eine Karte oder drei|一张牌还是三张') {
    $d = [regex]::Replace($d, '(?s)(</main>)', ($section[$lang] + "`n" + '$1'), 1)
  }
  if ($d -notmatch 'Frequently asked|Häufige Fragen|常见问题') {
    $d = [regex]::Replace($d, '(?s)(</main>)', ($faq[$lang] + "`n" + '$1'), 1)
  }
  Set-Content -Path $p -Value $d -Encoding utf8
  $h = ([regex]::Matches([regex]::Match($d, '(?s)<main.*?</main>').Value, '<h2')).Count
  "${lang}: h2 на странице «день» — $h"
}
