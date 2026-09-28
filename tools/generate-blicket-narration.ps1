param(
  [Parameter(Mandatory = $true)][string]$VoiceId,
  [string]$VoiceCmd,
  [string]$CueId,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $VoiceCmd) { $VoiceCmd = (Resolve-Path (Join-Path $root '../voice-cloner/Voice.cmd')).Path }
$inventory = Get-Content (Join-Path $root 'audio/cues.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($CueId -and $CueId -notin @($inventory.narration | ForEach-Object id)) { throw "Unknown cue ID: $CueId" }
$profile = & $VoiceCmd voices show $VoiceId | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $profile.reference_sha256 -ne $inventory.voice.referenceSha256) {
  throw 'Voice reference hash does not match the cue inventory.'
}

foreach ($cue in $inventory.narration) {
  if ($CueId -and $cue.id -ne $CueId) { continue }
  foreach ($language in @('en', 'de')) {
    $relative = $cue.files.$language
    $target = Join-Path $root ('audio/' + $relative)
    if ((Test-Path -LiteralPath $target) -and -not $Force) { continue }
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
    Write-Host "Generating $language/$($cue.id)"
    $cliArgs = @('generate', '--voice', $VoiceId, '--engine', 'qwen', '--language', $language,
      '--text', $cue.text.$language, '--output', $target)
    if ($Force) { $cliArgs += '--force' }
    $result = & $VoiceCmd @cliArgs | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $target) -or (Get-Item -LiteralPath $target).Length -eq 0) {
      throw "Generation failed for $language/$($cue.id): $($result.error)"
    }
  }
}

Write-Host 'All narration assets are present.'
