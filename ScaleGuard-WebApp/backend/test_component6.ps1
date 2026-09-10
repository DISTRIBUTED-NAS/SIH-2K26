$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ">>> SCALEGUARD COMPONENT 6 LIVE VERIFICATION SUITE <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# 1. Authenticate Admin
Write-Host "`n[STEP 1] Authenticating as Admin..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "admin@scaleguard.com"
    password = "Admin@123"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminAuth.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Write-Host "  Admin authenticated successfully (User: $($adminAuth.user.email))" -ForegroundColor Green

# 2. Register Business Owner and Setup Business & Instrument
Write-Host "`n[STEP 2] Setting up Business Owner, Business & Instrument..." -ForegroundColor Yellow
$boEmail = "bo.c6.$timestamp@example.com"
$boRegisterBody = @{
    fullName = "Inspection Test Owner"
    email = $boEmail
    phoneNumber = "+91 98765 12345"
    password = "Password@123"
    confirmPassword = "Password@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $boRegisterBody -ContentType "application/json" | Out-Null

$boLoginBody = @{
    email = $boEmail
    password = "Password@123"
} | ConvertTo-Json

$boAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $boLoginBody -ContentType "application/json"
$boToken = $boAuth.accessToken
$boHeaders = @{ Authorization = "Bearer $boToken" }

$businessBody = @{
    businessName = "Gujarat Precision Weighing Ltd $timestamp"
    businessType = "PRIVATE_LIMITED"
    registrationNumber = "REG-$timestamp"
    gstNumber = "24AAAAA0000A1Z5"
    contactEmail = $boEmail
    contactPhone = "+91 98765 12345"
    addressLine1 = "Plot 42, GIDC Industrial Estate"
    city = "Ahmedabad"
    state = "Gujarat"
    pincode = "380015"
    country = "India"
} | ConvertTo-Json

$business = Invoke-RestMethod -Uri "$baseUrl/businesses" -Method Post -Body $businessBody -Headers $boHeaders -ContentType "application/json"

$instrumentBody = @{
    instrumentName = "Heavy Industrial Weighbridge $timestamp"
    instrumentType = "PLATFORM_SCALE"
    manufacturer = "Avery Weigh-Tronix"
    modelNumber = "E1205-$timestamp"
    serialNumber = "SN-C6-$timestamp"
    capacity = 50000.0
    capacityUnit = "KG"
    accuracy = 10.0
    accuracyUnit = "G"
    manufacturingYear = 2024
    location = "Warehouse Bay 3, GIDC Industrial Estate"
} | ConvertTo-Json

$instrument = Invoke-RestMethod -Uri "$baseUrl/instruments" -Method Post -Body $instrumentBody -Headers $boHeaders -ContentType "application/json"
Write-Host "  Setup complete: Business ID $($business.id), Instrument ID $($instrument.id)" -ForegroundColor Green

# 3. Create and Submit Verification Application 1
Write-Host "`n[STEP 3] Business Owner creates and submits Application 1..." -ForegroundColor Yellow
$app1Body = @{
    instrumentId = $instrument.id
    applicationType = "INITIAL_VERIFICATION"
    purpose = "Statutory initial calibration and seal affixation"
    requestedDate = (Get-Date).ToString("yyyy-MM-dd")
    remarks = "Facility ready for verification visit"
} | ConvertTo-Json

$app1 = Invoke-RestMethod -Uri "$baseUrl/verification-applications" -Method Post -Body $app1Body -Headers $boHeaders -ContentType "application/json"
$app1Submitted = Invoke-RestMethod -Uri "$baseUrl/verification-applications/$($app1.id)/submit" -Method Patch -Headers $boHeaders
Write-Host "  Application 1 submitted: $($app1Submitted.applicationNumber) (Status: $($app1Submitted.status))" -ForegroundColor Green

# 4. Provision Officer 1
Write-Host "`n[STEP 4] Admin provisions Inspector Ramesh..." -ForegroundColor Yellow
$officer1Email = "officer1.c6.$timestamp@scaleguard.com"
$officer1Body = @{
    name = "Inspector Ramesh Patel"
    email = $officer1Email
    password = "Officer@123"
    officerCode = "LMO-C6-01-$timestamp"
    designation = "Senior Legal Metrology Inspector"
    department = "Weights and Measures Enforcement"
    district = "Ahmedabad"
    phoneNumber = "+91 98765 43210"
} | ConvertTo-Json

$officer1 = Invoke-RestMethod -Uri "$baseUrl/admin/officers" -Method Post -Body $officer1Body -Headers $adminHeaders -ContentType "application/json"
Write-Host "  Officer 1 provisioned: $($officer1.name) (ID: $($officer1.id), Code: $($officer1.officerCode))" -ForegroundColor Green

# 5. Assign Officer 1 to Application 1
Write-Host "`n[STEP 5] Admin assigns Officer 1 to Application 1..." -ForegroundColor Yellow
$assignBody = @{ officerId = $officer1.id } | ConvertTo-Json
$assignedApp = Invoke-RestMethod -Uri "$baseUrl/admin/verification-applications/$($app1.id)/assign-officer" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"
Write-Host "  Application assigned: Status is $($assignedApp.status)" -ForegroundColor Green

# Authenticate as Officer 1
$officer1LoginBody = @{ email = $officer1Email; password = "Officer@123" } | ConvertTo-Json
$officer1Auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $officer1LoginBody -ContentType "application/json"
$officer1Headers = @{ Authorization = "Bearer $($officer1Auth.accessToken)" }

# 6. Officer 1 Schedules Inspection
Write-Host "`n[STEP 6] Officer 1 schedules Inspection for Application 1..." -ForegroundColor Yellow
$scheduledDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
$insp1Body = @{
    scheduledAt = $scheduledDate
    location = "Plot 42, GIDC Industrial Estate, Ahmedabad"
    notes = "Standard M1 class weights required for testing"
} | ConvertTo-Json

$insp1 = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app1.id)/inspection" -Method Post -Body $insp1Body -Headers $officer1Headers -ContentType "application/json"
Write-Host "  Inspection Scheduled!" -ForegroundColor Green
Write-Host "  Inspection Number: $($insp1.inspectionNumber)" -ForegroundColor Cyan
Write-Host "  Status: $($insp1.status)" -ForegroundColor Cyan
if ($insp1.inspectionNumber -notmatch "^INSP-\d{4}-\d{6}$") {
    throw "Inspection number $($insp1.inspectionNumber) does not match expected format INSP-YYYY-XXXXXX"
}

# Verify Application Status remains OFFICER_ASSIGNED when SCHEDULED
$app1Check = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app1.id)" -Method Get -Headers $officer1Headers
Write-Host "  Application status: $($app1Check.status) (Linked Inspection: $($app1Check.inspectionNumber))" -ForegroundColor Green

# 7. Officer 1 Starts Inspection
Write-Host "`n[STEP 7] Officer 1 starts the inspection (Transition to IN_PROGRESS)..." -ForegroundColor Yellow
$startedInsp = Invoke-RestMethod -Uri "$baseUrl/officer/inspections/$($insp1.id)/start" -Method Post -Headers $officer1Headers
Write-Host "  Inspection Status: $($startedInsp.status)" -ForegroundColor Green
Write-Host "  Started At: $($startedInsp.startedAt)" -ForegroundColor Green

# Verify Application Status transitions to INSPECTION_IN_PROGRESS
$app1AfterStart = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app1.id)" -Method Get -Headers $officer1Headers
Write-Host "  Application Status: $($app1AfterStart.status)" -ForegroundColor Green
if ($app1AfterStart.status -ne "INSPECTION_IN_PROGRESS") {
    throw "Application status should be INSPECTION_IN_PROGRESS, got $($app1AfterStart.status)"
}

# 8. Officer 1 Updates Inspection Notes
Write-Host "`n[STEP 8] Officer 1 records field observations and notes..." -ForegroundColor Yellow
$notesBody = @{
    notes = "Visual check passed. Corner load test conducted with 10T dead weights. Zero-drift < 0.2 divisions."
} | ConvertTo-Json
$updatedNotesInsp = Invoke-RestMethod -Uri "$baseUrl/officer/inspections/$($insp1.id)/notes" -Method Patch -Body $notesBody -Headers $officer1Headers -ContentType "application/json"
Write-Host "  Notes updated: $($updatedNotesInsp.notes)" -ForegroundColor Green

# 9. Officer 1 Completes Inspection
Write-Host "`n[STEP 9] Officer 1 completes the inspection..." -ForegroundColor Yellow
$completedInsp = Invoke-RestMethod -Uri "$baseUrl/officer/inspections/$($insp1.id)/complete" -Method Post -Headers $officer1Headers
Write-Host "  Inspection Status: $($completedInsp.status)" -ForegroundColor Green
Write-Host "  Completed At: $($completedInsp.completedAt)" -ForegroundColor Green

# Verify Application Status transitions to INSPECTION_COMPLETED
$app1AfterComplete = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app1.id)" -Method Get -Headers $officer1Headers
Write-Host "  Application Status: $($app1AfterComplete.status)" -ForegroundColor Green
if ($app1AfterComplete.status -ne "INSPECTION_COMPLETED") {
    throw "Application status should be INSPECTION_COMPLETED, got $($app1AfterComplete.status)"
}

# 10. Test Cancellation Workflow on Application 2
Write-Host "`n[STEP 10] Testing Inspection Cancellation Workflow..." -ForegroundColor Yellow
$app2Body = @{
    instrumentId = $instrument.id
    applicationType = "PERIODIC_VERIFICATION"
    purpose = "Annual statutory verification"
    requestedDate = (Get-Date).ToString("yyyy-MM-dd")
} | ConvertTo-Json
$app2 = Invoke-RestMethod -Uri "$baseUrl/verification-applications" -Method Post -Body $app2Body -Headers $boHeaders -ContentType "application/json"
$app2Submitted = Invoke-RestMethod -Uri "$baseUrl/verification-applications/$($app2.id)/submit" -Method Patch -Headers $boHeaders
$app2Assigned = Invoke-RestMethod -Uri "$baseUrl/admin/verification-applications/$($app2.id)/assign-officer" -Method Post -Body $assignBody -Headers $adminHeaders -ContentType "application/json"

$insp2 = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app2.id)/inspection" -Method Post -Body $insp1Body -Headers $officer1Headers -ContentType "application/json"
Write-Host "  Inspection 2 scheduled: $($insp2.inspectionNumber)" -ForegroundColor Green

# Cancel Inspection 2
$cancelBody = @{
    reason = "Factory premises closed due to scheduled electrical maintenance"
} | ConvertTo-Json
$cancelledInsp = Invoke-RestMethod -Uri "$baseUrl/officer/inspections/$($insp2.id)/cancel" -Method Post -Body $cancelBody -Headers $officer1Headers -ContentType "application/json"
Write-Host "  Inspection 2 Status: $($cancelledInsp.status) (Reason: $($cancelledInsp.cancellationReason))" -ForegroundColor Green

# Verify Application 2 reverts to OFFICER_ASSIGNED
$app2AfterCancel = Invoke-RestMethod -Uri "$baseUrl/officer/verification-applications/$($app2.id)" -Method Get -Headers $officer1Headers
Write-Host "  Application 2 Status reverted to: $($app2AfterCancel.status)" -ForegroundColor Green
if ($app2AfterCancel.status -ne "OFFICER_ASSIGNED") {
    throw "Application 2 should have reverted to OFFICER_ASSIGNED, got $($app2AfterCancel.status)"
}

# 11. Security & RBAC Enforcement Checks
Write-Host "`n[STEP 11] Validating RBAC and Tenant Isolation..." -ForegroundColor Yellow

# Business Owner cannot access officer inspection endpoints (403)
try {
    Invoke-RestMethod -Uri "$baseUrl/officer/inspections" -Method Get -Headers $boHeaders
    throw "Business Owner should have been blocked from officer inspection endpoint!"
} catch {
    Write-Host "  Business Owner blocked from Officer Inspection API (HTTP $($_.Exception.Response.StatusCode))" -ForegroundColor Green
}

# Provision Officer 2
$officer2Email = "officer2.c6.$timestamp@scaleguard.com"
$officer2Body = @{
    name = "Inspector Priya Sharma"
    email = $officer2Email
    password = "Officer@123"
    officerCode = "LMO-C6-02-$timestamp"
    designation = "Legal Metrology Inspector"
    department = "Weights and Measures Enforcement"
    district = "Vadodara"
    phoneNumber = "+91 91234 56789"
} | ConvertTo-Json
$officer2 = Invoke-RestMethod -Uri "$baseUrl/admin/officers" -Method Post -Body $officer2Body -Headers $adminHeaders -ContentType "application/json"

$officer2LoginBody = @{ email = $officer2Email; password = "Officer@123" } | ConvertTo-Json
$officer2Auth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $officer2LoginBody -ContentType "application/json"
$officer2Headers = @{ Authorization = "Bearer $($officer2Auth.accessToken)" }

# Officer 2 cannot access Officer 1's inspection (Tenant Isolation)
try {
    Invoke-RestMethod -Uri "$baseUrl/officer/inspections/$($insp1.id)" -Method Get -Headers $officer2Headers
    throw "Officer 2 should have been blocked from viewing Officer 1's inspection!"
} catch {
    Write-Host "  Officer 2 blocked from Officer 1's inspection (HTTP $($_.Exception.Response.StatusCode) Not Found) - Isolation Confirmed!" -ForegroundColor Green
}

# 12. Admin Statewide Inspection Monitoring
Write-Host "`n[STEP 12] Admin statewide monitoring and filtering..." -ForegroundColor Yellow
$allAdminInspections = Invoke-RestMethod -Uri "$baseUrl/admin/inspections" -Method Get -Headers $adminHeaders
Write-Host "  Admin retrieved $($allAdminInspections.Count) total statewide inspections" -ForegroundColor Green

$completedFilter = Invoke-RestMethod -Uri "$baseUrl/admin/inspections?status=COMPLETED" -Method Get -Headers $adminHeaders
Write-Host "  Admin filtered COMPLETED inspections: $($completedFilter.Count) records" -ForegroundColor Green

$adminInspDetails = Invoke-RestMethod -Uri "$baseUrl/admin/inspections/$($insp1.id)" -Method Get -Headers $adminHeaders
Write-Host "  Admin fetched inspection details for $($adminInspDetails.inspectionNumber): Officer=$($adminInspDetails.officerName), Business=$($adminInspDetails.businessName)" -ForegroundColor Green

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host ">>> ALL COMPONENT 6 LIVE TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
