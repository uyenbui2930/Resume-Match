# Save as quick-test.ps1
$baseUrl = "http://localhost:3000"

Write-Host "1. Testing Health Check..."
Invoke-RestMethod "$baseUrl/api/health"

Write-Host "`n2. Testing Register..."
$register = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -Body (@{
    email="quicktest@example.com"
    password="test123"
    firstName="Quick"
    lastName="Test"
} | ConvertTo-Json) -ContentType "application/json"

$token = $register.data.token
Write-Host "Token obtained: $($token.Substring(0,20))..."

Write-Host "`n3. Testing Protected Route..."
Invoke-RestMethod "$baseUrl/api/resumes/my-resumes" -Headers @{Authorization="Bearer $token"}

Write-Host "`n4. Testing Dashboard..."
Invoke-RestMethod "$baseUrl/api/dashboard/overview" -Headers @{Authorization="Bearer $token"}

Write-Host "`n✅ Quick tests complete!"