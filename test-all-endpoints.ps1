# Simple API Test - Job Assistant
$BaseUrl = "http://localhost:3000"

Write-Host "=== Testing Job Assistant API ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method GET
    Write-Host "   PASSED: $($health.message)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register User
Write-Host "2. Testing User Registration..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    email = "test$timestamp@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResult = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json"
    Write-Host "   PASSED: User registered" -ForegroundColor Green
    $Token = $registerResult.data.token
    Write-Host "   Token: $($Token.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit
}
Write-Host ""

# Test 3: Get Resumes (Protected Route)
Write-Host "3. Testing Protected Route (Get Resumes)..." -ForegroundColor Yellow
try {
    $resumes = Invoke-RestMethod -Uri "$BaseUrl/api/resumes/my-resumes" `
        -Method GET `
        -Headers @{Authorization = "Bearer $Token"}
    Write-Host "   PASSED: Protected route works" -ForegroundColor Green
    Write-Host "   Resumes count: $($resumes.data.count)" -ForegroundColor Cyan
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: AI Agent (Resume Scorer)
Write-Host "4. Testing AI Agent (Resume Scorer)..." -ForegroundColor Yellow
$agentBody = @{
    resumeText = "Software Engineer with JavaScript and React experience"
    jobDescription = "Looking for developer with JavaScript skills"
} | ConvertTo-Json

try {
    $agentResult = Invoke-RestMethod -Uri "$BaseUrl/api/agents/resume-scorer" `
        -Method POST `
        -Body $agentBody `
        -ContentType "application/json" `
        -Headers @{Authorization = "Bearer $Token"}
    Write-Host "   PASSED: Agent executed successfully" -ForegroundColor Green
    Write-Host "   Score: $($agentResult.data.score)" -ForegroundColor Cyan
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Dashboard
Write-Host "5. Testing Dashboard Overview..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$BaseUrl/api/dashboard/overview" `
        -Method GET `
        -Headers @{Authorization = "Bearer $Token"}
    Write-Host "   PASSED: Dashboard works" -ForegroundColor Green
    Write-Host "   Total Applications: $($dashboard.data.summary.totalApplications)" -ForegroundColor Cyan
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan