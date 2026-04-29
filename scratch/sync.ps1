$products = Get-Content all_products.json | ConvertFrom-Json
$groupId = "jh7757mvgp49b99zhqr2gk5dt585jas7"
$chunkSize = 10
for ($i = 0; $i -lt $products.Count; $i += $chunkSize) {
    $end = [Math]::Min($i + $chunkSize - 1, $products.Count - 1)
    $chunk = $products[$i..$end]
    $data = @{ groupId = $groupId; products = $chunk } | ConvertTo-Json -Compress -Depth 10
    Write-Host "Pushing chunk $($i / $chunkSize + 1)..."
    npx convex run --url https://glorious-kiwi-580.convex.cloud products:addProducts $data
}
