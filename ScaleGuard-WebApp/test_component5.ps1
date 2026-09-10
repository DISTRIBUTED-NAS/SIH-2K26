$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ">>> SCALEGUARD COMPONENT 5 LIVE VERIFICATION SUITE <<<" -ForegroundColor Cyan
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
            Write-Host "API call failed with unexpected status $statusCode from $Method $Uri" -ForegroundColor Red
            Write-Host ($errorBody | ConvertTo-Json -Depth 5) -ForegroundColor Red
            throw "Unexpected status code $statusCode from $Method $Uri"
        }
    }
}

# 1. Admin Authentication
Write-Host "`n[STEP 1] Authenticating as Admin..." -ForegroundColor Yellow
$adminLogin = Invoke-Api -Method POST -Uri "$baseUrl/api/auth/login" -Body @{
    email = "admin@scaleguard.com"
    password = "Admin@123"
}
$adminToken = $adminLogin.accessToken
Write-Host " Admin authenticated successfully" -ForegroundColor Green

# 2. Business Owner Setup
Write-Host "`n[STEP 2] Setting up Business Owner, Business & Instrument..." -ForegroundColor Yellow
$boEmail = "bo_c5_${timestamp}@test.com"
$boPass = "Password@123"

$boRegister = Invoke-Api -Method POST -Uri "$baseUrl/api/auth/register" -Body @{
    fullName = "C5 Business Owner"
    email = $boEmail
    phoneNumber = "+91-9876543210"
    password = $boPass
    confirmPassword = $boPass
}
$boLogin = Invoke-Api -Method POST -Uri "$baseUrl/api/auth/login" -Body @{
    email = $boEmail
    password = $boPass
}
$boToken = $boLogin.accessToken

$biz = Invoke-Api -Method POST -Uri "$baseUrl/api/businesses" -Token $boToken -Body @{
    businessName = "Apex Calibration Labs $timestamp"
    businessType = "Testing & Calibration"
    registrationNumber = "REG-C5-$timestamp"
    gstNumber = "24AAACG9999F1Z5"
    contactEmail = "apex_${timestamp}@test.com"
    contactPhone = "+91-9876543210"
    addressLine1 = "Plot 42, GIDC"
    addressLine2 = "Phase II"
    city = "Ahmedabad"
    state = "Gujarat"
    pincode = "380001"
    country = "India"
}

$inst = Invoke-Api -Method POST -Uri "$baseUrl/api/instruments" -Token $boToken -Body @{
    instrumentName = "Heavy Duty Platform Scale"
    instrumentType = "PLATFORM_SCALE"
    manufacturer = "Avery Weigh-Tronix"
    modelNumber = "WB-50T"
    serialNumber = "SN-C5-$timestamp"
    capacity = 50000.0000
    capacityUnit = "KG"
    accuracy = 1.0000
    accuracyUnit = "KG"
    manufacturingYear = 2023
    purchaseDate = "2023-06-15"
    location = "Gate 1 Truck Scale"
}
$instrumentId = $inst.id
Write-Host " Business & Instrument setup complete (Instrument ID: $instrumentId)" -ForegroundColor Green

# 3. Provision Officers
Write-Host "`n[STEP 3] Admin provisions Officer 1..." -ForegroundColor Yellow
$officer1Code = "LMO-C5-01-$timestamp"
$officer1Email = "officer1_${timestamp}@scaleguard.gov"
$officer1 = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/officers" -Token $adminToken -Body @{
    name = "Inspector Rajiv Mehra"
    email = $officer1Email
    password = "Officer@123"
    officerCode = $officer1Code
    designation = "Senior Inspector of Legal Metrology"
    department = "Legal Metrology Department"
    district = "Ahmedabad"
    phoneNumber = "+91-9876500001"
}
$officer1Id = $officer1.id
Write-Host " Officer 1 provisioned (ID: $officer1Id, Code: $officer1Code, Status: $($officer1.status))" -ForegroundColor Green

# 4. Duplicate checks
Write-Host "`n[STEP 4] Testing duplicate email & officer code rejections..." -ForegroundColor Yellow
$dupEmail = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/officers" -Token $adminToken -ExpectedStatus @(409) -Body @{
    name = "Duplicate Email Officer"
    email = $officer1Email
    password = "Officer@123"
    officerCode = "LMO-UNIQUE-$timestamp"
    designation = "Inspector"
    department = "LMD"
    district = "Surat"
    phoneNumber = "+91-9876500002"
}
if ($dupEmail.StatusCode -eq 409) {
    Write-Host " Duplicate email correctly rejected with 409 Conflict" -ForegroundColor Green
} else {
    throw "Duplicate email was not rejected"
}

$dupCode = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/officers" -Token $adminToken -ExpectedStatus @(409) -Body @{
    name = "Duplicate Code Officer"
    email = "unique_${timestamp}@scaleguard.gov"
    password = "Officer@123"
    officerCode = $officer1Code
    designation = "Inspector"
    department = "LMD"
    district = "Surat"
    phoneNumber = "+91-9876500003"
}
if ($dupCode.StatusCode -eq 409) {
    Write-Host " Duplicate officer code correctly rejected with 409 Conflict" -ForegroundColor Green
} else {
    throw "Duplicate officer code was not rejected"
}

# 5. Officer 2 & Inactive Officer 3
Write-Host "`n[STEP 5] Provisioning Officer 2 and Officer 3 (Inactive)..." -ForegroundColor Yellow
$officer2Code = "LMO-C5-02-$timestamp"
$officer2Email = "officer2_${timestamp}@scaleguard.gov"
$officer2 = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/officers" -Token $adminToken -Body @{
    name = "Inspector Anita Desai"
    email = $officer2Email
    password = "Officer@123"
    officerCode = $officer2Code
    designation = "Assistant Controller"
    department = "Legal Metrology Department"
    district = "Ahmedabad"
    phoneNumber = "+91-9876500002"
}
$officer2Id = $officer2.id

$officer3Code = "LMO-C5-03-$timestamp"
$officer3Email = "officer3_${timestamp}@scaleguard.gov"
$officer3 = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/officers" -Token $adminToken -Body @{
    name = "Inspector Inactive Test"
    email = $officer3Email
    password = "Officer@123"
    officerCode = $officer3Code
    designation = "Inspector"
    department = "Legal Metrology Department"
    district = "Ahmedabad"
    phoneNumber = "+91-9876500003"
}
$officer3Id = $officer3.id

# Deactivate Officer 3
$deact = Invoke-Api -Method PATCH -Uri "$baseUrl/api/admin/officers/$officer3Id/status" -Token $adminToken -Body @{
    status = "INACTIVE"
}
Write-Host " Officer 2 provisioned (ID: $officer2Id); Officer 3 provisioned and set to INACTIVE (ID: $officer3Id)" -ForegroundColor Green

# 6. List and filter officers
Write-Host "`n[STEP 6] Admin lists and filters officers..." -ForegroundColor Yellow
$officerList = Invoke-Api -Method GET -Uri "$baseUrl/api/admin/officers?district=Ahmedabad" -Token $adminToken
Write-Host " Found $($officerList.content.Count) officers in Ahmedabad district" -ForegroundColor Green

# 7. Update Officer details
Write-Host "`n[STEP 7] Admin updates Officer 1 details..." -ForegroundColor Yellow
$updatedOfficer1 = Invoke-Api -Method PUT -Uri "$baseUrl/api/admin/officers/$officer1Id" -Token $adminToken -Body @{
    name = "Inspector Rajiv K. Mehra"
    designation = "Senior Inspector & Technical Head"
    department = "Legal Metrology Enforcement"
    district = "Ahmedabad Urban"
    phoneNumber = "+91-9876599999"
}
Write-Host " Officer 1 updated successfully (Name: $($updatedOfficer1.name), Designation: $($updatedOfficer1.designation))" -ForegroundColor Green

# 8. Create Verification Application & Assignment Workflow
Write-Host "`n[STEP 8] Testing Application Submission and Officer Assignment..." -ForegroundColor Yellow
$app = Invoke-Api -Method POST -Uri "$baseUrl/api/verification-applications" -Token $boToken -Body @{
    instrumentId = $instrumentId
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Annual statutory verification for trade weighing"
    requestedDate = "2026-10-15"
    preferredInspectionDate = "2026-10-18"
    remarks = "Calibration test weights ready on site"
}
$appId = $app.id
Write-Host " Application created as DRAFT (ID: $appId, Status: $($app.status))" -ForegroundColor Green

# Attempt assign to DRAFT -> 409 Conflict
$draftAssign = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/verification-applications/$appId/assign-officer" -Token $adminToken -ExpectedStatus @(409) -Body @{
    officerId = $officer1Id
}
if ($draftAssign.StatusCode -eq 409) {
    Write-Host " Assignment to DRAFT application rejected with 409 Conflict as expected" -ForegroundColor Green
} else {
    throw "Assignment to DRAFT was not rejected"
}

# Submit Application
$submittedApp = Invoke-Api -Method PATCH -Uri "$baseUrl/api/verification-applications/$appId/submit" -Token $boToken
Write-Host " Application submitted (Status: $($submittedApp.status))" -ForegroundColor Green

# Attempt assign INACTIVE officer -> 400 Bad Request
$inactiveAssign = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/verification-applications/$appId/assign-officer" -Token $adminToken -ExpectedStatus @(400) -Body @{
    officerId = $officer3Id
}
if ($inactiveAssign.StatusCode -eq 400) {
    Write-Host " Assignment of INACTIVE officer rejected with 400 Bad Request as expected" -ForegroundColor Green
} else {
    throw "Assignment of inactive officer was not rejected"
}

# Assign Officer 1
$assignResult = Invoke-Api -Method POST -Uri "$baseUrl/api/admin/verification-applications/$appId/assign-officer" -Token $adminToken -Body @{
    officerId = $officer1Id
}
Write-Host " Officer 1 assigned successfully! (Status: $($assignResult.status), Officer: $($assignResult.assignedOfficer.name), AssignedAt: $($assignResult.assignedAt))" -ForegroundColor Green

# Reassign to Officer 2
Write-Host "`n[STEP 9] Reassigning application to Officer 2..." -ForegroundColor Yellow
$reassignResult = Invoke-Api -Method PUT -Uri "$baseUrl/api/admin/verification-applications/$appId/assign-officer" -Token $adminToken -Body @{
    officerId = $officer2Id
}
Write-Host " Reassigned to Officer 2! (Officer: $($reassignResult.assignedOfficer.name), Code: $($reassignResult.assignedOfficer.officerCode))" -ForegroundColor Green

# 9. Officer Portal Flow
Write-Host "`n[STEP 10] Officer Portal: Login, View Profile & Assigned Applications..." -ForegroundColor Yellow
$officer2Login = Invoke-Api -Method POST -Uri "$baseUrl/api/auth/login" -Body @{
    email = $officer2Email
    password = "Officer@123"
}
$officer2Token = $officer2Login.accessToken

# Officer 2 self-profile
$officer2Profile = Invoke-Api -Method GET -Uri "$baseUrl/api/officer/profile" -Token $officer2Token
Write-Host " Officer 2 Profile retrieved (Name: $($officer2Profile.name), Code: $($officer2Profile.officerCode), District: $($officer2Profile.district))" -ForegroundColor Green

# Officer 2 assigned applications
$officer2Apps = Invoke-Api -Method GET -Uri "$baseUrl/api/officer/verification-applications" -Token $officer2Token
Write-Host " Officer 2 has $($officer2Apps.Count) assigned applications" -ForegroundColor Green

# Officer 2 application details
$officer2AppDetail = Invoke-Api -Method GET -Uri "$baseUrl/api/officer/verification-applications/$appId" -Token $officer2Token
Write-Host " Officer 2 retrieved application docket details: Business=$($officer2AppDetail.businessName), Serial=$($officer2AppDetail.instrument.serialNumber)" -ForegroundColor Green

# 10. Strict Tenant Isolation Check
Write-Host "`n[STEP 11] Checking Officer Tenant Isolation..." -ForegroundColor Yellow
$officer1Login = Invoke-Api -Method POST -Uri "$baseUrl/api/auth/login" -Body @{
    email = $officer1Email
    password = "Officer@123"
}
$officer1Token = $officer1Login.accessToken

$officer1Check = Invoke-Api -Method GET -Uri "$baseUrl/api/officer/verification-applications/$appId" -Token $officer1Token -ExpectedStatus @(404)
if ($officer1Check.StatusCode -eq 404) {
    Write-Host " Officer 1 cannot access application assigned to Officer 2 (404 Not Found) - Isolation Confirmed!" -ForegroundColor Green
} else {
    throw "Tenant isolation failed: Officer 1 accessed Officer 2's application"
}

# 11. RBAC Checks
Write-Host "`n[STEP 12] Role-Based Access Control (RBAC) Checks..." -ForegroundColor Yellow
$boAccessOfficer = Invoke-Api -Method GET -Uri "$baseUrl/api/officer/profile" -Token $boToken -ExpectedStatus @(403)
if ($boAccessOfficer.StatusCode -eq 403) {
    Write-Host " Business Owner blocked from Officer Portal with 403 Forbidden" -ForegroundColor Green
} else {
    throw "RBAC failed: BO accessed officer portal"
}

$officerAccessAdmin = Invoke-Api -Method GET -Uri "$baseUrl/api/admin/officers" -Token $officer2Token -ExpectedStatus @(403)
if ($officerAccessAdmin.StatusCode -eq 403) {
    Write-Host " Officer blocked from Admin Officer Management with 403 Forbidden" -ForegroundColor Green
} else {
    throw "RBAC failed: Officer accessed admin endpoint"
}

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host ">>> ALL COMPONENT 5 LIVE TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
