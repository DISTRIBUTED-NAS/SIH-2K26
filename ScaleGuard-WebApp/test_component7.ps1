$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ">>> SCALEGUARD COMPONENT 7 LIVE VERIFICATION SUITE <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Token = $null,
        [object]$Body = $null,
        [int[]]$ExpectedStatus = @(200, 201, 204)
    )

    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $jsonBody = $null
    if ($Body) {
        $jsonBody = $Body | ConvertTo-Json -Depth 10
    }

    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            Headers = $headers
        }
        if ($jsonBody) {
            $params["Body"] = $jsonBody
        }

        $response = Invoke-RestMethod @params
        return @{
            StatusCode = 200
            Data = $response
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $null
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $rawText = $reader.ReadToEnd()
            $errorBody = $rawText | ConvertFrom-Json
        } catch {}

        if ($ExpectedStatus -contains $statusCode) {
            return @{
                StatusCode = $statusCode
                Data = $errorBody
            }
        } else {
            Write-Host "API call failed with status $statusCode (expected: $($ExpectedStatus -join ', ')): $Uri" -ForegroundColor Red
            if ($errorBody) {
                Write-Host ($errorBody | ConvertTo-Json -Depth 5) -ForegroundColor DarkRed
            }
            throw $_
        }
    }
}

# 1. Login Admin
Write-Host "`n1. Authenticating Admin..." -ForegroundColor Yellow
$adminLogin = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = "admin@scaleguard.com"
    password = "Admin@123"
}
$adminToken = $adminLogin.Data.accessToken
Write-Host "  Admin logged in successfully." -ForegroundColor Green

# 2. Login Officer
Write-Host "`n2. Authenticating LMO Officer..." -ForegroundColor Yellow
$officerLogin = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = "officer@scaleguard.com"
    password = "Officer@123"
}
$officerToken = $officerLogin.Data.accessToken
Write-Host "  Officer logged in successfully." -ForegroundColor Green

# 3. Create Business Owner & Instrument & Application
Write-Host "`n3. Setting up Business, Instrument & Application..." -ForegroundColor Yellow
$boEmail = "bo_c7_$timestamp@test.com"
$boReg = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/register" -Body @{
    fullName = "BO Component 7"
    email = $boEmail
    phoneNumber = "+91-9876543$($timestamp.ToString().Substring($timestamp.ToString().Length - 4))"
    password = "Password@123"
    confirmPassword = "Password@123"
} -ExpectedStatus @(201)

$boLoginRes = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = $boEmail
    password = "Password@123"
}
$boToken = $boLoginRes.Data.accessToken

$biz = Invoke-Api -Method "POST" -Uri "$baseUrl/api/businesses" -Token $boToken -Body @{
    businessName = "Comp7 Retail Ltd"
    businessType = "RETAIL"
    registrationNumber = "REG-C7-$timestamp"
    gstNumber = "29ABCDE1234F1Z5"
    contactEmail = "biz_$timestamp@test.com"
    contactPhone = "+91-9876543210"
    addressLine1 = "Shop 10, Commercial Street"
    city = "Bangalore"
    state = "Karnataka"
    pincode = "560001"
    country = "India"
}

$inst = Invoke-Api -Method "POST" -Uri "$baseUrl/api/instruments" -Token $boToken -Body @{
    instrumentName = "Precision Bench Scale"
    instrumentType = "DIGITAL_WEIGHING_SCALE"
    manufacturer = "Essae"
    modelNumber = "DS-215"
    serialNumber = "SN-C7-$timestamp"
    capacity = 30.000
    capacityUnit = "KG"
    accuracy = 1.000
    accuracyUnit = "G"
    manufacturingYear = 2024
    location = "Main Counter"
}
$instId = $inst.Data.id

$app = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boToken -Body @{
    instrumentId = $instId
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Commercial trade verification"
    preferredDateStart = (Get-Date).ToString("yyyy-MM-dd")
    preferredDateEnd = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    notes = "Expedited request"
}
$appId = $app.Data.id

Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/verification-applications/$appId/submit" -Token $boToken | Out-Null
Write-Host "  Application #$appId submitted." -ForegroundColor Green

# 4. Admin Assigns Officer
Write-Host "`n4. Assigning Officer to Application..." -ForegroundColor Yellow
$officers = Invoke-Api -Method "GET" -Uri "$baseUrl/api/admin/officers" -Token $adminToken
$assignedOfficerId = $officers.Data.content[0].id

Invoke-Api -Method "POST" -Uri "$baseUrl/api/admin/verification-applications/$appId/assign-officer" -Token $adminToken -Body @{
    officerId = $assignedOfficerId
} | Out-Null
Write-Host "  Officer #$assignedOfficerId assigned." -ForegroundColor Green

# 5. Officer Creates and Starts Inspection
Write-Host "`n5. Officer Creating & Starting Inspection..." -ForegroundColor Yellow
$insp = Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/verification-applications/$appId/inspection" -Token $officerToken -Body @{
    scheduledAt = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
    location = "Main Counter, Comp7 Store"
    notes = "Standard verification protocol"
}
$inspId = $insp.Data.id

Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/inspections/$inspId/start" -Token $officerToken | Out-Null
Write-Host "  Inspection #$inspId is now IN_PROGRESS." -ForegroundColor Green

# 6. Officer Starts Measurement Test Session
Write-Host "`n6. Starting Measurement Test Session (Component 7)..." -ForegroundColor Yellow
$sessionRes = Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/inspections/$inspId/measurement-tests/start" -Token $officerToken -ExpectedStatus @(201)
$sessionId = $sessionRes.Data.id
Write-Host "  Test Session started: ID $sessionId, Status: $($sessionRes.Data.status)" -ForegroundColor Green

# 7. Add Test Readings (Points 1 & 2)
Write-Host "`n7. Recording Calibration Test Readings..." -ForegroundColor Yellow
$rec1 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/measurement-tests/$sessionId/records" -Token $officerToken -ExpectedStatus @(201) -Body @{
    standardValue = 10.000
    observedValue = 10.020
    unit = "kg"
    remarks = "Point 1 reading"
}
Write-Host "  Point #$($rec1.Data.testPoint): Standard=10.0, Observed=10.02, Error=$($rec1.Data.errorValue), %Error=$($rec1.Data.percentageError)%" -ForegroundColor Green

$rec2 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/measurement-tests/$sessionId/records" -Token $officerToken -ExpectedStatus @(201) -Body @{
    standardValue = 20.000
    observedValue = 19.980
    unit = "kg"
    remarks = "Point 2 reading"
}
Write-Host "  Point #$($rec2.Data.testPoint): Standard=20.0, Observed=19.98, Error=$($rec2.Data.errorValue), %Error=$($rec2.Data.percentageError)%" -ForegroundColor Green

# 8. Update Test Reading
Write-Host "`n8. Updating Record #$($rec1.Data.id)..." -ForegroundColor Yellow
$updated = Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/officer/measurement-tests/records/$($rec1.Data.id)" -Token $officerToken -Body @{
    standardValue = 10.000
    observedValue = 10.015
    unit = "kg"
    remarks = "Recalibrated reading"
}
Write-Host "  Updated Error=$($updated.Data.errorValue), %Error=$($updated.Data.percentageError)%" -ForegroundColor Green

# 9. Update Overall Remarks
Write-Host "`n9. Updating Overall Remarks..." -ForegroundColor Yellow
Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/officer/measurement-tests/$sessionId/remarks" -Token $officerToken -Body @{
    overallRemarks = "All measurements conform to permissible tolerance limits."
} | Out-Null
Write-Host "  Overall remarks updated." -ForegroundColor Green

# 10. Complete Measurement Testing
Write-Host "`n10. Finalizing Measurement Testing Session..." -ForegroundColor Yellow
$completed = Invoke-Api -Method "POST" -Uri "$baseUrl/api/officer/measurement-tests/$sessionId/complete" -Token $officerToken
Write-Host "  Session status: $($completed.Data.status), CompletedAt: $($completed.Data.completedAt)" -ForegroundColor Green

# 11. Admin Reads Results (Read-Only)
Write-Host "`n11. Admin Verifying Test Results (Read-Only)..." -ForegroundColor Yellow
$adminView = Invoke-Api -Method "GET" -Uri "$baseUrl/api/admin/inspections/$inspId/measurement-tests" -Token $adminToken
Write-Host "  Admin retrieved $($adminView.Data.totalRecords) records. Max Error: $($adminView.Data.maximumAbsoluteError), Avg % Error: $($adminView.Data.averagePercentageError)%" -ForegroundColor Green

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host ">>> COMPONENT 7 VERIFICATION SUITE: ALL CHECKS PASSED <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
