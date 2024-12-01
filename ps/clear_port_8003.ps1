Write-Host "Checking for processes using port 8003..."

$Processes = Get-NetTCPConnection -LocalPort 8003 -State Listen | ForEach-Object {
    Get-Process -Id $_.OwningProcess
}

if ($Processes) {
    Write-Host "Processes found using port 8003. Terminating them..."
    foreach ($Process in $Processes) {
        Write-Host "Terminating process: $($Process.ProcessName) (ID: $($Process.Id))"
        Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Port 8003 is now free."
}
else {
    Write-Host "No processes found using port 8003. The port is already free."
}