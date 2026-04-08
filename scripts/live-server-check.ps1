param(
  [string]$BaseUrl = "https://app.fitgenie.ai"
)

$ErrorActionPreference = "Stop"

function Step($name, $scriptBlock) {
  Write-Host "`n== $name =="
  & $scriptBlock
  Write-Host "$name ✅" -ForegroundColor Green
}

try {
  Step "Health" {
    $r = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
    $r | ConvertTo-Json -Depth 10
  }

  Step "Readiness" {
    $r = Invoke-RestMethod -Method Get -Uri "$BaseUrl/ready"
    $r | ConvertTo-Json -Depth 10
  }

  Step "Profile API" {
    $body = @{
      userId = "u_live_001"
      name = "Live Test"
      age = 25
      gender = "prefer_not_to_say"
      location = "NY"
      stylePreferences = @("casual")
      budgetRange = @{
        min = 30
        max = 120
        currency = "USD"
      }
    } | ConvertTo-Json -Depth 10
    $r = Invoke-RestMethod -Method Post -Uri "$BaseUrl/user/profile" -ContentType "application/json" -Body $body
    $r | ConvertTo-Json -Depth 10
  }

  Step "Body Scan API" {
    $body = @{
      userId = "u_live_001"
      unit = "cm"
      chest = 90
      waist = 78
      hip = 95
      height = 172
    } | ConvertTo-Json -Depth 10
    $r = Invoke-RestMethod -Method Post -Uri "$BaseUrl/scan/body" -ContentType "application/json" -Body $body
    $r | ConvertTo-Json -Depth 10
  }

  Step "Recommendations API" {
    $body = @{
      userId = "u_live_001"
      intent = "daily wear"
    } | ConvertTo-Json -Depth 10
    $r = Invoke-RestMethod -Method Post -Uri "$BaseUrl/recommendations" -ContentType "application/json" -Body $body
    $r | ConvertTo-Json -Depth 10
  }

  Step "Tailors API" {
    $r = Invoke-RestMethod -Method Get -Uri "$BaseUrl/tailors"
    $r | ConvertTo-Json -Depth 10
  }

  Step "Booking API" {
    $body = @{
      userId = "u_live_001"
      tailorId = "t1"
      slot = "2026-04-09T10:00:00Z"
    } | ConvertTo-Json -Depth 10
    $r = Invoke-RestMethod -Method Post -Uri "$BaseUrl/booking" -ContentType "application/json" -Body $body
    $r | ConvertTo-Json -Depth 10
  }

  Write-Host "`n🎉 Live checks passed." -ForegroundColor Green
}
catch {
  Write-Host "`n❌ Check failed: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.ErrorDetails.Message) {
    Write-Host "Server response: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
  }
  exit 1
}
