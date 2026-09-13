
$targets = @("confirm\(", "alert\(", ">Loading\.\.\.<\/p>", "toLocaleDateString", "toLocaleTimeString", ": any", "console\.log", "debugger", "TODO", "FIXME")
foreach ($t in $targets) {
    Write-Host "--- Searching for $t ---"
    Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String $t | ForEach-Object { $_.Line.Trim() } | Select-Object -Unique
}

