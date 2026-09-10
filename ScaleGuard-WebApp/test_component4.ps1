$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ">>> SCALEGUARD COMPONENT 4 LIVE VERIFICATION SUITE <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Helper function
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
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $null
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
        } catch {}

        if ($ExpectedStatus -contains $statusCode) {
            return [PSCustomObject]@{
                StatusCode = $statusCode
                Error = $errorBody
            }
        } else {
            Write-Host "API call failed with status $statusCode" -ForegroundColor Red
            Write-Host ($errorBody | ConvertTo-Json -Depth 5) -ForegroundColor Red
            throw "Unexpected status code $statusCode from $Method $Uri"
        }
    }
}

# ---------------------------------------------------------
# STEP 1: REGISTER AND LOGIN BUSINESS OWNER A & B
# ---------------------------------------------------------
Write-Host "`n=== STEP 1: Register Business Owner A & B ===" -ForegroundColor Yellow
$boAEmail = "va_owner_a_$timestamp@test.com"
$boBEmail = "va_owner_b_$timestamp@test.com"

Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/register" -Body @{
    fullName = "VA Owner A"
    email = $boAEmail
    phoneNumber = "9876543210"
    password = "Password@123"
    confirmPassword = "Password@123"
} | Out-Null

$boALogin = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = $boAEmail
    password = "Password@123"
}
$boAToken = $boALogin.accessToken
Write-Host "BO A Token obtained" -ForegroundColor Green

Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/register" -Body @{
    fullName = "VA Owner B"
    email = $boBEmail
    phoneNumber = "9876543211"
    password = "Password@123"
    confirmPassword = "Password@123"
} | Out-Null

$boBLogin = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = $boBEmail
    password = "Password@123"
}
$boBToken = $boBLogin.accessToken
Write-Host "BO B Token obtained" -ForegroundColor Green

# ---------------------------------------------------------
# STEP 2: VERIFY BO A CANNOT CREATE APPLICATION WITHOUT BUSINESS PROFILE
# ---------------------------------------------------------
Write-Host "`n=== STEP 2: Verify BO A Cannot Create Application Without Business Profile ===" -ForegroundColor Yellow
$failNoProfile = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = 1
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Premature application without profile"
} -ExpectedStatus @(400)

if ($failNoProfile.StatusCode -eq 400) {
    Write-Host "Expected 400 Bad Request received: $($failNoProfile.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 400 Bad Request but got $($failNoProfile.StatusCode)"
}

# ---------------------------------------------------------
# STEP 3: CREATE BUSINESS PROFILES
# ---------------------------------------------------------
Write-Host "`n=== STEP 3: Create Business Profiles ===" -ForegroundColor Yellow
$bizA = Invoke-Api -Method "POST" -Uri "$baseUrl/api/businesses" -Token $boAToken -Body @{
    businessName = "Apex Metrology Solutions"
    businessType = "Manufacturing"
    registrationNumber = "REG-VA-001"
    gstNumber = "24AAACG1234F1Z5"
    contactEmail = "apex@test.com"
    contactPhone = "9876543210"
    addressLine1 = "Plot 101, GIDC"
    city = "Gandhinagar"
    state = "Gujarat"
    pincode = "382010"
    country = "India"
}
Write-Host "BO A Business Profile Created: $($bizA.businessName)" -ForegroundColor Green

$bizB = Invoke-Api -Method "POST" -Uri "$baseUrl/api/businesses" -Token $boBToken -Body @{
    businessName = "Baroda Weigh Systems"
    businessType = "Retail"
    registrationNumber = "REG-VA-002"
    gstNumber = "24BBBCC2345G2Z6"
    contactEmail = "baroda@test.com"
    contactPhone = "9876543211"
    addressLine1 = "Shop 12, Market Yard"
    city = "Vadodara"
    state = "Gujarat"
    pincode = "390001"
    country = "India"
}
Write-Host "BO B Business Profile Created: $($bizB.businessName)" -ForegroundColor Green

# ---------------------------------------------------------
# STEP 4: REGISTER INSTRUMENTS FOR BO A AND BO B
# ---------------------------------------------------------
Write-Host "`n=== STEP 4: Register Instruments for BO A & BO B ===" -ForegroundColor Yellow
$instA1 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/instruments" -Token $boAToken -Body @{
    instrumentName = "High Precision Bench Scale"
    instrumentType = "DIGITAL_WEIGHING_SCALE"
    manufacturer = "Avery Weigh-Tronix"
    modelNumber = "ZW-30"
    serialNumber = "SN-VA-$timestamp-A1"
    capacity = 30.0000
    capacityUnit = "KG"
    accuracy = 0.0010
    accuracyUnit = "KG"
    manufacturingYear = 2023
    purchaseDate = "2023-03-15"
    location = "Packaging Line 1"
}
Write-Host "BO A Instrument 1 Registered: ID $($instA1.id), Serial $($instA1.serialNumber)" -ForegroundColor Green

$instA2 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/instruments" -Token $boAToken -Body @{
    instrumentName = "Platform Scale Secondary"
    instrumentType = "PLATFORM_SCALE"
    manufacturer = "Essae Scales"
    modelNumber = "PS-500"
    serialNumber = "SN-VA-$timestamp-A2"
    capacity = 500.0000
    capacityUnit = "KG"
    accuracy = 0.0500
    accuracyUnit = "KG"
    manufacturingYear = 2022
    purchaseDate = "2022-06-10"
    location = "Loading Dock B"
}
Write-Host "BO A Instrument 2 Registered: ID $($instA2.id), Serial $($instA2.serialNumber)" -ForegroundColor Green

$instB = Invoke-Api -Method "POST" -Uri "$baseUrl/api/instruments" -Token $boBToken -Body @{
    instrumentName = "Retail Counter Scale"
    instrumentType = "COUNTER_SCALE"
    manufacturer = "Citizen Scales"
    modelNumber = "CS-15"
    serialNumber = "SN-VA-$timestamp-B1"
    capacity = 15.0000
    capacityUnit = "KG"
    accuracy = 0.0020
    accuracyUnit = "KG"
    manufacturingYear = 2023
    purchaseDate = "2023-09-01"
    location = "Counter 1"
}
Write-Host "BO B Instrument Registered: ID $($instB.id), Serial $($instB.serialNumber)" -ForegroundColor Green

# ---------------------------------------------------------
# STEP 5: BO A CREATES DRAFT VERIFICATION APPLICATION
# ---------------------------------------------------------
Write-Host "`n=== STEP 5: BO A Creates Draft Verification Application ===" -ForegroundColor Yellow
$today = (Get-Date).ToString("yyyy-MM-dd")
$preferred = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")

$appA1 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = $instA1.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Initial commercial verification for new packaging line"
    requestedDate = $today
    preferredInspectionDate = $preferred
    remarks = "Site access between 9:00 AM and 1:00 PM on weekdays"
}
Write-Host "Application Created: ID $($appA1.id), AppNumber: $($appA1.applicationNumber), Status: $($appA1.status)" -ForegroundColor Green

# Verify application number regex SG-YYYY-XXXXXX
if ($appA1.applicationNumber -match "^SG-\d{4}-\d{6}$") {
    Write-Host "Application Number Format Validated: $($appA1.applicationNumber)" -ForegroundColor Green
} else {
    throw "Application number format invalid: $($appA1.applicationNumber)"
}

# ---------------------------------------------------------
# STEP 6: VERIFY BO A CANNOT CREATE APPLICATION FOR BO B'S INSTRUMENT
# ---------------------------------------------------------
Write-Host "`n=== STEP 6: Cross-Tenant Instrument Isolation (404) ===" -ForegroundColor Yellow
$crossCreate = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = $instB.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Attempting to verify instrument belonging to another business"
} -ExpectedStatus @(404)

if ($crossCreate.StatusCode -eq 404) {
    Write-Host "Expected 404 Not Found received: $($crossCreate.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 404 but got $($crossCreate.StatusCode)"
}

# ---------------------------------------------------------
# STEP 7: VERIFY DATE VALIDATION RULES
# ---------------------------------------------------------
Write-Host "`n=== STEP 7: Verify Date Validation Rules ===" -ForegroundColor Yellow
$pastDate = (Get-Date).AddDays(-5).ToString("yyyy-MM-dd")
$invalidDateApp = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = $instA1.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Date test with invalid preferred inspection date"
    requestedDate = $today
    preferredInspectionDate = $pastDate
} -ExpectedStatus @(400)

if ($invalidDateApp.StatusCode -eq 400) {
    Write-Host "Expected 400 Bad Request for date in past: $($invalidDateApp.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 400 but got $($invalidDateApp.StatusCode)"
}

# ---------------------------------------------------------
# STEP 8: UPDATE DRAFT APPLICATION
# ---------------------------------------------------------
Write-Host "`n=== STEP 8: Update DRAFT Application ===" -ForegroundColor Yellow
$updatedApp = Invoke-Api -Method "PUT" -Uri "$baseUrl/api/verification-applications/$($appA1.id)" -Token $boAToken -Body @{
    instrumentId = $instA1.id
    applicationType = "PERIODIC_VERIFICATION"
    purpose = "Updated to periodic verification with amended remarks"
    requestedDate = $today
    preferredInspectionDate = $preferred
    remarks = "Updated contact person: Rajesh Patel (Phone: 9876543210)"
}
Write-Host "Draft Updated: Type: $($updatedApp.applicationType), Purpose: $($updatedApp.purpose)" -ForegroundColor Green

# ---------------------------------------------------------
# STEP 9: DELETE DRAFT APPLICATION
# ---------------------------------------------------------
Write-Host "`n=== STEP 9: Delete DRAFT Application ===" -ForegroundColor Yellow
# Create a throwaway draft to delete
$draftToDelete = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = $instA2.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Draft application intended to be deleted"
}
Write-Host "Draft to delete created: ID $($draftToDelete.id), Number: $($draftToDelete.applicationNumber)" -ForegroundColor Green

Invoke-Api -Method "DELETE" -Uri "$baseUrl/api/verification-applications/$($draftToDelete.id)" -Token $boAToken -ExpectedStatus @(204) | Out-Null
Write-Host "Draft application successfully deleted (HTTP 204 No Content)" -ForegroundColor Green

# Verify it is gone
$checkDeleted = Invoke-Api -Method "GET" -Uri "$baseUrl/api/verification-applications/$($draftToDelete.id)" -Token $boAToken -ExpectedStatus @(404)
if ($checkDeleted.StatusCode -eq 404) {
    Write-Host "Confirmed deleted: GET returned 404 Not Found" -ForegroundColor Green
} else {
    throw "Expected 404 for deleted application"
}

# ---------------------------------------------------------
# STEP 10: SUBMIT DRAFT APPLICATION
# ---------------------------------------------------------
Write-Host "`n=== STEP 10: Submit DRAFT Application (DRAFT -> SUBMITTED) ===" -ForegroundColor Yellow
$submittedApp = Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/verification-applications/$($appA1.id)/submit" -Token $boAToken
Write-Host "Application Submitted: ID $($submittedApp.id), Status: $($submittedApp.status)" -ForegroundColor Green

if ($submittedApp.status -ne "SUBMITTED") {
    throw "Expected status SUBMITTED but got $($submittedApp.status)"
}

# ---------------------------------------------------------
# STEP 11: VERIFY SUBMITTED APPLICATION CANNOT BE EDITED
# ---------------------------------------------------------
Write-Host "`n=== STEP 11: Submitted Application Cannot Be Edited (409 Conflict) ===" -ForegroundColor Yellow
$failEditSubmitted = Invoke-Api -Method "PUT" -Uri "$baseUrl/api/verification-applications/$($appA1.id)" -Token $boAToken -Body @{
    instrumentId = $instA1.id
    applicationType = "PERIODIC_VERIFICATION"
    purpose = "Trying to edit locked submitted application"
} -ExpectedStatus @(409)

if ($failEditSubmitted.StatusCode -eq 409) {
    Write-Host "Expected 409 Conflict received: $($failEditSubmitted.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 409 Conflict but got $($failEditSubmitted.StatusCode)"
}

# ---------------------------------------------------------
# STEP 12: VERIFY SUBMITTED APPLICATION CANNOT BE DELETED
# ---------------------------------------------------------
Write-Host "`n=== STEP 12: Submitted Application Cannot Be Deleted (409 Conflict) ===" -ForegroundColor Yellow
$failDeleteSubmitted = Invoke-Api -Method "DELETE" -Uri "$baseUrl/api/verification-applications/$($appA1.id)" -Token $boAToken -ExpectedStatus @(409)

if ($failDeleteSubmitted.StatusCode -eq 409) {
    Write-Host "Expected 409 Conflict received: $($failDeleteSubmitted.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 409 Conflict but got $($failDeleteSubmitted.StatusCode)"
}

# ---------------------------------------------------------
# STEP 13: VERIFY CANNOT SUBMIT FOR INACTIVE INSTRUMENT
# ---------------------------------------------------------
Write-Host "`n=== STEP 13: Cannot Submit Application for Inactive Instrument (400 Bad Request) ===" -ForegroundColor Yellow
# Create draft on instA2
$draftOnInstA2 = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $boAToken -Body @{
    instrumentId = $instA2.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Application for instrument that will be deactivated"
}

# Deactivate instA2
Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/instruments/$($instA2.id)/status" -Token $boAToken -Body @{
    status = "INACTIVE"
} | Out-Null
Write-Host "Instrument $($instA2.id) deactivated to INACTIVE" -ForegroundColor Yellow

# Try submitting
$failInactiveSubmit = Invoke-Api -Method "PATCH" -Uri "$baseUrl/api/verification-applications/$($draftOnInstA2.id)/submit" -Token $boAToken -ExpectedStatus @(400)
if ($failInactiveSubmit.StatusCode -eq 400) {
    Write-Host "Expected 400 Bad Request received: $($failInactiveSubmit.Error.message)" -ForegroundColor Green
} else {
    throw "Expected 400 Bad Request but got $($failInactiveSubmit.StatusCode)"
}

# ---------------------------------------------------------
# STEP 14: VERIFY CROSS-TENANT APPLICATION ISOLATION (404)
# ---------------------------------------------------------
Write-Host "`n=== STEP 14: Cross-Tenant Application Access (404 Isolation) ===" -ForegroundColor Yellow
$crossAppAccess = Invoke-Api -Method "GET" -Uri "$baseUrl/api/verification-applications/$($appA1.id)" -Token $boBToken -ExpectedStatus @(404)
if ($crossAppAccess.StatusCode -eq 404) {
    Write-Host "Expected 404 Not Found received for cross-owner application read" -ForegroundColor Green
} else {
    throw "Expected 404 but got $($crossAppAccess.StatusCode)"
}

# ---------------------------------------------------------
# STEP 15: ADMIN STATEWIDE REGISTRY AND INSPECTION
# ---------------------------------------------------------
Write-Host "`n=== STEP 15: Admin Statewide Registry & Inspection ===" -ForegroundColor Yellow
$adminLogin = Invoke-Api -Method "POST" -Uri "$baseUrl/api/auth/login" -Body @{
    email = "admin@scaleguard.com"
    password = "Admin@123"
}
$adminToken = $adminLogin.accessToken

$adminApps = Invoke-Api -Method "GET" -Uri "$baseUrl/api/admin/verification-applications" -Token $adminToken
Write-Host "Admin retrieved statewide applications count: $($adminApps.Count)" -ForegroundColor Green

$inspectedApp = Invoke-Api -Method "GET" -Uri "$baseUrl/api/admin/verification-applications/$($appA1.id)" -Token $adminToken
Write-Host "Admin Inspected App: $($inspectedApp.applicationNumber), Business: $($inspectedApp.businessName), Instrument: $($inspectedApp.instrument.instrumentName)" -ForegroundColor Green

# ---------------------------------------------------------
# STEP 16: RBAC SECURITY VERIFICATION
# ---------------------------------------------------------
Write-Host "`n=== STEP 16: RBAC Security Protections ===" -ForegroundColor Yellow
$boAccessAdmin = Invoke-Api -Method "GET" -Uri "$baseUrl/api/admin/verification-applications" -Token $boAToken -ExpectedStatus @(403)
if ($boAccessAdmin.StatusCode -eq 403) {
    Write-Host "BO accessing Admin endpoint: HTTP 403 Forbidden (Blocked as expected)" -ForegroundColor Green
} else {
    throw "Expected 403 for BO accessing Admin endpoint"
}

$adminAccessBO = Invoke-Api -Method "POST" -Uri "$baseUrl/api/verification-applications" -Token $adminToken -Body @{
    instrumentId = 1
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Admin illegal application creation"
} -ExpectedStatus @(403)
if ($adminAccessBO.StatusCode -eq 403) {
    Write-Host "Admin accessing BO creation endpoint: HTTP 403 Forbidden (Blocked as expected)" -ForegroundColor Green
} else {
    throw "Expected 403 for Admin calling BO endpoint"
}

$unauthAccess = Invoke-Api -Method "GET" -Uri "$baseUrl/api/verification-applications" -ExpectedStatus @(401)
if ($unauthAccess.StatusCode -eq 401) {
    Write-Host "Unauthenticated call: HTTP 401 Unauthorized (Blocked as expected)" -ForegroundColor Green
} else {
    throw "Expected 401 for unauthenticated call"
}

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host ">>> ALL COMPONENT 4 LIVE API TESTS PASSED PERFECTLY! <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
