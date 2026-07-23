$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path $PSScriptRoot -Parent
$BackupRoot = "F:\Dropbox\Savveyra\Backups"
$BackupName = Get-Date -Format "yyyy-MM-dd_HHmm"
$BackupFolder = Join-Path $BackupRoot $BackupName

Set-Location $RepoRoot

Write-Host "Checking Docker..."

docker info *> $null

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Docker Desktop is not running."
    Write-Host "Open Docker Desktop, wait until it is ready, and run the backup again."
    exit 1
}

New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null

Write-Host "Backing up roles..."
npx.cmd supabase db dump --linked --role-only --file "$BackupFolder\roles.sql"

Write-Host "Backing up schema..."
npx.cmd supabase db dump --linked --file "$BackupFolder\schema.sql"

Write-Host "Backing up data..."
npx.cmd supabase db dump --linked --data-only --use-copy --file "$BackupFolder\data.sql"

Write-Host ""
Write-Host "Backup complete: $BackupFolder"