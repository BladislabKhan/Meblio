$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $scriptDirectory "..")).Path
$pythonCandidates = @(
  "C:\Python314\python.exe",
  (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1)
) | Where-Object { $_ }
$hostAddress = "0.0.0.0"
$port = 8082
$runtimeDirectory = Join-Path $projectRoot ".runtime"
$stdoutLog = Join-Path $runtimeDirectory "http-server.log"
$stderrLog = Join-Path $runtimeDirectory "http-server-error.log"

if (-not (Test-Path -LiteralPath $projectRoot -PathType Container)) {
  throw "Project directory not found: $projectRoot"
}

$pythonPath = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $pythonPath) {
  throw "Python executable not found."
}

if (-not (Test-Path -LiteralPath $runtimeDirectory -PathType Container)) {
  New-Item -ItemType Directory -Path $runtimeDirectory | Out-Null
}

$existingListener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
if ($existingListener) {
  Write-Output "Port $port is already in use. Server startup skipped."
  exit 0
}

$arguments = @(
  "-m"
  "http.server"
  $port.ToString()
  "--bind"
  $hostAddress
)

Start-Process -FilePath $pythonPath `
  -ArgumentList $arguments `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog | Out-Null

Write-Output "Local server started at http://$hostAddress`:$port"
