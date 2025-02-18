$nextFolderPath = ".\.next"
if (Test-Path $nextFolderPath) {
    Remove-Item -Recurse -Force $nextFolderPath
    Write-Host "next folder removed"
}
else {
    Write-Host "next folder not found"
}

npm run uc client test

Start-Job -ScriptBlock {
    Start-Sleep -Seconds 20
    Start-Process "http://localhost:8003"
} | Out-Null

npm start

