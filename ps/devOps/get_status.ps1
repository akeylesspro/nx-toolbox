$currentProject = gcloud config get-value project
if ($currentProject -eq "akeyless-nx-qa") {
    $imageName = "nx-toolbox-qa"
    $environment = "QA"
}
else { 
    $imageName = "nx-toolbox"
    $environment = "PROD"
}

$tagsOutput = gcloud container images list-tags gcr.io/${currentProject}/${imageName} --format="json"

# Parse JSON output
$tags = $tagsOutput | ConvertFrom-Json

$allTags = $tags | ForEach-Object { $_.tags } | Where-Object { $_ -ne $null } | ForEach-Object { $_ } | Where-Object { $_ -ne "latest" } | Sort-Object -Unique

# Find the tag with "latest"
$latestTag = $tags | Where-Object { $_.tags -contains "latest" }

if ($latestTag) {
    $validVersion = $latestTag.tags | Where-Object { $_ -ne "latest" }
    Write-Host "Environment: $environment"
    Write-Host "Google Project: $currentProject"
    Write-Host "Project: $imageName"
    Write-Host "Version: latesclst:$validVersion"
    Write-Host "Possible Versions: $($allTags -join ', ')"
    kubectl get pods

}
else {
    Write-Host "Error: No 'latest' tag found."
}
