$ErrorActionPreference = 'Stop'
$src = 'C:\Users\User\.dsh\taro-pages\assets\futhark.svg'
$out = 'C:\Users\User\.dsh\taro-pages\assets\runes.svg'

[xml]$doc = Get-Content $src -Raw -Encoding utf8
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace('s', 'http://www.w3.org/2000/svg')

$BB = @{
  fehu=@(2,0,23,60,0.5,2); uruz=@(2,1,32,59,41.35,1); thurisaz=@(2,0,21,60,91.2,2); ansuz=@(0,0,16,60,132.05,2)
  raidho=@(0,0,22,60,165.9,2); kenaz=@(2,8,22,44,203.75,1); gebo=@(2,1,26.56,58,243.59,1); wunjo=@(0,0,18,60,290,2)
  hagalaz=@(2,0,36,60,0.5,70); naudiz=@(1,0,22,60,51,70); isa=@(2,0,0,60,85.5,70); jera=@(2,7.5,34,45,99,70)
  ihwa=@(2,0,32,60,146.5,70); perthro=@(0,0,23,60,194,70); elhaz=@(1,0,38,60,229.5,70); sowilo=@(2,2,20,56,286,70)
  tiwaz=@(2,0,36,60,0.5,138); berkano=@(0,0,23,60,44.43,138); ehwaz=@(0,0,40,60,73.36,138); mannaz=@(0,0,40,60,119.29,138)
  laguz=@(0,0,22,60,165.21,138); ingwaz=@(3,15,26,30,190.14,138); dagaz=@(0,0,40,60,225.07,138); othala=@(1.5,3.5,37,52.5,269.5,142)
}
$IDS = @('fehu','uruz','thurisaz','ansuz','raidho','kenaz','gebo','wunjo','hagalaz','naudiz','isa','jera','ihwa','perthro','elhaz','sowilo','tiwaz','berkano','ehwaz','mannaz','laguz','ingwaz','dagaz','othala')

$CX = 400.0; $CY = 400.0; $R = 292.0; $H = 46.0; $GOLD = '#d8b26a'
$Inv = [System.Globalization.CultureInfo]::InvariantCulture

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">')
[void]$sb.AppendLine('  <circle cx="400" cy="400" r="366" fill="none" stroke="#d8b26a" stroke-width="1.2" opacity="0.32"/>')
[void]$sb.AppendLine('  <circle cx="400" cy="400" r="242" fill="none" stroke="#d8b26a" stroke-width="1" opacity="0.16"/>')

for ($i = 0; $i -lt $IDS.Count; $i++) {
  $id = $IDS[$i]
  $node = $doc.SelectSingleNode("//s:g[@id='$id']", $ns)
  if (-not $node) { Write-Host "нет узла: $id"; continue }
  $b = $BB[$id]
  $bw = [double]$b[2]; $bh = [double]$b[3]
  if ($bh -le 0) { $bh = 60 }
  $tx = [double]$b[4]; $ty = [double]$b[5]
  $s = $H / $bh
  $cxLocal = [double]$b[0] + $bw / 2.0
  $cyLocal = [double]$b[1] + $bh / 2.0
  $angle = $i * (360.0 / $IDS.Count)

  $inner = $node.InnerXml
  $inner = $inner -replace 'stroke:#000000', ('stroke:' + $GOLD) -replace 'stroke:#000', ('stroke:' + $GOLD)
  $inner = $inner -replace 'stroke-width:4px', 'stroke-width:4.4px'

  $tr = 'translate({0},{1}) rotate({2}) translate(0,-{3}) scale({4}) translate({5},{6})' -f `
    $CX.ToString($Inv), $CY.ToString($Inv), [math]::Round($angle, 2).ToString($Inv), $R.ToString($Inv),
    [math]::Round($s, 4).ToString($Inv), [math]::Round(-$cxLocal, 2).ToString($Inv), [math]::Round(-$cyLocal, 2).ToString($Inv)

  [void]$sb.AppendLine('  <g transform="' + $tr + '">')
  [void]$sb.AppendLine('    ' + $inner.Trim())
  [void]$sb.AppendLine('  </g>')
}
[void]$sb.AppendLine('</svg>')
Set-Content -Path $out -Value $sb.ToString() -Encoding utf8
"создан $out · $([math]::Round((Get-Item $out).Length/1KB,1)) КБ"
Copy-Item $out 'C:\Users\User\dsh\НАПРАВЛЕНИЯ\САЙТ\3d-демо\runes.svg' -Force
