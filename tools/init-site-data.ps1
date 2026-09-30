param(
  [string]$OutputPath = ".\data\site-settings.example.json"
)

$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root $OutputPath
$directory = Split-Path -Parent $target

if (-not (Test-Path $directory)) {
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

$json = @'
{
  "note": "Пример структуры для будущего серверного хранения. Подходит как заготовка под JSON или БД.",
  "seo": {},
  "hero": {},
  "whyUs": {},
  "contacts": {},
  "reviews": {
    "items": [],
    "qrCards": []
  },
  "blocks": []
}
'@

Set-Content -LiteralPath $target -Value $json -Encoding UTF8
Write-Host "Файл структуры настроек создан: $target"
