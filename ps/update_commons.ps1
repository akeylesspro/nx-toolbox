param (
    [string]$common,
    [string]$branch = "main"
)

if ($common) {
    Write-Output "------------------- update $common commons from branch $branch -------------------"
    npm i "git+https://github.com/akeylesspro/akeyless-$common-commons.git#$branch"  
    [System.Console]::Beep(1000, 500)
    [System.Console]::Beep(1000, 500)
    exit 1
}
# update all commons if no common is specified
# server
Write-Output "------------------- update server commons... -------------------"
npm i git+https://github.com/akeylesspro/akeyless-server-commons.git 
Write-Output "------------------- server commons have been updatede successfully! -------------------"
# client
Write-Output "------------------- update client commons... -------------------"
npm i git+https://github.com/akeylesspro/akeyless-client-commons.git
Write-Output "------------------- client commons have been updatede successfully! -------------------"
# types
Write-Output "------------------- update types commons... -------------------"
npm i git+https://github.com/akeylesspro/akeyless-types-commons.git 
Write-Output "------------------- types commons have been updatede successfully! -------------------"
# assets
Write-Output "------------------- update assets commons... -------------------"
npm i git+https://github.com/akeylesspro/akeyless-assets-commons.git 
Write-Output "------------------- assets commons have been updatede successfully! -------------------"
[System.Console]::Beep(1000, 500)
[System.Console]::Beep(1000, 500)
# --legacy-peer-deps
