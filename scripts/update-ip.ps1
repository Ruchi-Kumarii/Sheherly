param([string]$ip)

$configPath = Join-Path $PSScriptRoot "..\config.js"
$content = Get-Content $configPath -Raw
$updated = $content -replace 'const MY_IP = "[^"]*";', "const MY_IP = `"$ip`";"

if ($content -eq $updated) {
    Write-Host "[IP] No change needed or MY_IP not found in config.js"
    exit 1
}

Set-Content $configPath $updated -NoNewline
Write-Host "[IP] config.js updated -> MY_IP = $ip"
