
function FreePort3000 {
    Write-Host "Checking for processes using port 3000..."

    # Find the process using port 3000
    $Processes = Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object {
        Get-Process -Id $_.OwningProcess
    }

    if ($Processes) {
        Write-Host "Processes found using port 3000. Terminating them..."
        foreach ($Process in $Processes) {
            Write-Host "Terminating process: $($Process.ProcessName) (ID: $($Process.Id))"
            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Port 3000 is now free."
    }
    else {
        Write-Host "No processes found using port 3000. The port is already free."
    }
}

# Call the function
FreePort3000
