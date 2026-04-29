$products = Get-Content all_products.json | ConvertFrom-Json
$groupId = "jh7757mvgp49b99zhqr2gk5dt585jas7"
$chunkSize = 15
for ($i = 0; $i -lt $products.Count; $i += $chunkSize) {
    $end = [Math]::Min($i + $chunkSize - 1, $products.Count - 1)
    $chunk = $products[$i..$end]
    $chunkWithOrder = @()
    for ($j = 0; $j -lt $chunk.Count; $j++) {
        $p = $chunk[$j]
        $p | Add-Member -MemberType NoteProperty -Name "order" -Value ($i + $j) -Force
        $chunkWithOrder += $p
    }
    
    $json = $chunkWithOrder | ConvertTo-Json -Compress -Depth 10
    $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))
    
    $args = @{ groupId = $groupId; base64Data = $base64 } | ConvertTo-Json -Compress
    
    Write-Host "Pushing chunk $($i / $chunkSize + 1)..."
    # Using single quotes for the argument and escaping internal double quotes for CMD/NPX
    npx convex run --url https://glorious-kiwi-580.convex.cloud products:addProductsBase64 $args
}
