# Genera los PNG de la PWA (mismo diseño que public/icons/icon.svg). Uso: npm run icons
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot '..\public\icons'
New-Item -ItemType Directory -Force $out | Out-Null

function Wave($g, $pen, $s, $y, $x0, $x1) {
    # Onda de semiperiodos de 9 unidades (viewBox 0-100), como el SVG
    $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
    for ($x = $x0; $x -le $x1; $x += 0.5) {
        $yy = $y - 3 * [Math]::Sin(($x - $x0) / 18 * 2 * [Math]::PI)
        $pts.Add((New-Object System.Drawing.PointF(($x * $s), ($yy * $s))))
    }
    $g.DrawLines($pen, $pts.ToArray())
}

foreach ($size in 180, 192, 512) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $s = $size / 100.0

    # Fondo completo (el sistema redondea; sirve también como maskable)
    $g.Clear([System.Drawing.Color]::FromArgb(0, 133, 127))

    $sun = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(232, 163, 0))
    $g.FillEllipse($sun, (33 * $s), (27 * $s), (34 * $s), (34 * $s))

    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), (5 * $s)
    $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
    Wave $g $pen $s 62 14 86

    $pen2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(178, 255, 255, 255)), (5 * $s)
    $pen2.StartCap = 'Round'; $pen2.EndCap = 'Round'
    Wave $g $pen2 $s 75 22 78

    $name = if ($size -eq 180) { 'apple-touch-icon.png' } else { "icon-$size.png" }
    $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    Write-Output "OK $name"
}
