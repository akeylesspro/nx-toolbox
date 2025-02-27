$nextFolderPath = ".\.next"
if (Test-Path $nextFolderPath) {
    Remove-Item -Recurse -Force $nextFolderPath
    Write-Host "next folder removed"
}
else {
    Write-Host "next folder not found"
}

npm run uc client

Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:8003/boards"
} | Out-Null

npm start

