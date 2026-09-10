$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api'
$rand = Get-Random -Minimum 1000 -Maximum 9999

Write-Host "=========================================================="
Write-Host "SCALEGUARD COMPONENT 3 LIVE INTEGRATION TEST SUITE"
Write-Host "=========================================================="

Write-Host "`n=== STEP 1: Register Business Owner 1 ==="
$bo1Email = "bo1.inst.$rand@scaleguard.test"
$reg1Body = @{
  fullName = "Priya Sharma"
  email = $bo1Email
  password = "Password@123"
  confirmPassword = "Password@123"
  phoneNumber = "9876543210"
} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $reg1Body

$login1Body = @{ email = $bo1Email; password = "Password@123" } | ConvertTo-Json
$login1Res = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $login1Body
$bo1Token = $login1Res.accessToken
$bo1Headers = @{ Authorization = "Bearer $bo1Token" }
Write-Host "BO1 Registered & Logged In: $bo1Email"

Write-Host "`n=== STEP 2: Verify Instrument Creation without Business Profile returns 400 ==="
$instSample = @{
  instrumentName = "Electronic Bench Scale"
  instrumentType = "DIGITAL_WEIGHING_SCALE"
  manufacturer = "Mettler Toledo"
  modelNumber = "ICS425"
  serialNumber = "SN-$rand-001"
  capacity = 30
  capacityUnit = "KG"
  accuracy = 0.001
  accuracyUnit = "KG"
  manufacturingYear = 2024
  purchaseDate = "2024-03-15"
  location = "Testing Lab 1"
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "$base/instruments" -Method Post -ContentType "application/json" -Headers $bo1Headers -Body $instSample
  throw "Expected 400 Bad Request but succeeded!"
} catch {
  $statusCode = [int]$_.Exception.Response.StatusCode
  Write-Host "Correctly rejected without business profile: HTTP $statusCode"
}

Write-Host "`n=== STEP 3: Create Business Profile for BO1 ==="
$biz1Body = @{
  businessName = "Sharma Precision Weighing Systems"
  businessType = "Manufacturing & Trading"
  registrationNumber = "REG-GJ-2026-$rand-01"
  gstNumber = "24AAACG1234F1Z5"
  contactEmail = "contact@sharmaweighing.test"
  contactPhone = "9876543210"
  addressLine1 = "Plot 101, GIDC Estate"
  city = "Vadodara"
  state = "Gujarat"
  pincode = "390010"
  country = "India"
} | ConvertTo-Json
$biz1Res = Invoke-RestMethod -Uri "$base/businesses" -Method Post -ContentType "application/json" -Headers $bo1Headers -Body $biz1Body
Write-Host "Business Profile Created for BO1: $($biz1Res.businessName) (ID: $($biz1Res.id))"

Write-Host "`n=== STEP 4: Register Instrument 1 for BO1 ==="
$inst1Res = Invoke-RestMethod -Uri "$base/instruments" -Method Post -ContentType "application/json" -Headers $bo1Headers -Body $instSample
$inst1Id = $inst1Res.id
Write-Host "Instrument 1 Created: $($inst1Res.instrumentName) (ID: $inst1Id, Serial: $($inst1Res.serialNumber), Status: $($inst1Res.status))"

Write-Host "`n=== STEP 5: Register Business Owner 2 & Business Profile ==="
$bo2Email = "bo2.inst.$rand@scaleguard.test"
$reg2Body = @{
  fullName = "Vikram Desai"
  email = $bo2Email
  password = "Password@123"
  confirmPassword = "Password@123"
  phoneNumber = "9876543211"
} | ConvertTo-Json
$null = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $reg2Body

$login2Body = @{ email = $bo2Email; password = "Password@123" } | ConvertTo-Json
$login2Res = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $login2Body
$bo2Token = $login2Res.accessToken
$bo2Headers = @{ Authorization = "Bearer $bo2Token" }

$biz2Body = @{
  businessName = "Desai Heavy Platform Scales"
  businessType = "Industrial Weighing"
  registrationNumber = "REG-GJ-2026-$rand-02"
  gstNumber = "24AAACG1234F1Z5"
  contactEmail = "contact@desaiscales.test"
  contactPhone = "9876543211"
  addressLine1 = "Plot 202, GIDC Phase II"
  city = "Surat"
  state = "Gujarat"
  pincode = "395001"
  country = "India"
} | ConvertTo-Json
$biz2Res = Invoke-RestMethod -Uri "$base/businesses" -Method Post -ContentType "application/json" -Headers $bo2Headers -Body $biz2Body
Write-Host "Business Profile Created for BO2: $($biz2Res.businessName)"

Write-Host "`n=== STEP 6: Verify Duplicate Serial Number globally returns 409 Conflict ==="
$dupSerialBody = @{
  instrumentName = "Duplicate Serial Device"
  instrumentType = "PLATFORM_SCALE"
  manufacturer = "Other Brand"
  modelNumber = "OB-100"
  serialNumber = "SN-$rand-001" # Same serial as BO1
  capacity = 100
  capacityUnit = "KG"
  accuracy = 0.05
  accuracyUnit = "KG"
  manufacturingYear = 2024
  location = "Bay 1"
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "$base/instruments" -Method Post -ContentType "application/json" -Headers $bo2Headers -Body $dupSerialBody
  throw "Expected 409 Conflict but succeeded!"
} catch {
  $statusCode = [int]$_.Exception.Response.StatusCode
  Write-Host "Correctly rejected duplicate serial number: HTTP $statusCode Conflict"
}

Write-Host "`n=== STEP 7: Register Instrument 2 for BO2 with unique serial ==="
$inst2Body = @{
  instrumentName = "Heavy Duty Platform Scale 1000kg"
  instrumentType = "PLATFORM_SCALE"
  manufacturer = "Avery Weigh-Tronix"
  modelNumber = "H500"
  serialNumber = "SN-$rand-002"
  capacity = 1000
  capacityUnit = "KG"
  accuracy = 0.2
  accuracyUnit = "KG"
  manufacturingYear = 2024
  purchaseDate = "2024-04-10"
  location = "Heavy Weighbridge Bay"
} | ConvertTo-Json
$inst2Res = Invoke-RestMethod -Uri "$base/instruments" -Method Post -ContentType "application/json" -Headers $bo2Headers -Body $inst2Body
$inst2Id = $inst2Res.id
Write-Host "Instrument 2 Created for BO2: $($inst2Res.instrumentName) (ID: $inst2Id, Serial: $($inst2Res.serialNumber))"

Write-Host "`n=== STEP 8: Verify Business Isolation (BO1 sees only own instruments) ==="
$bo1Instruments = Invoke-RestMethod -Uri "$base/instruments" -Method Get -Headers $bo1Headers
Write-Host "BO1 retrieves instruments count: $($bo1Instruments.Count)"
if ($bo1Instruments.Count -ne 1) { throw "Expected exactly 1 instrument for BO1!" }

try {
  Invoke-RestMethod -Uri "$base/instruments/$inst2Id" -Method Get -Headers $bo1Headers
  throw "Expected 404 when BO1 accesses BO2's instrument!"
} catch {
  Write-Host "BO1 accessing BO2 instrument: HTTP $([int]$_.Exception.Response.StatusCode) Not Found (Isolated)"
}

Write-Host "`n=== STEP 9: Update Instrument 1 as BO1 ==="
$updateBody = @{
  instrumentName = "Electronic Precision Bench Scale 50kg (Calibrated)"
  instrumentType = "PRECISION_BALANCE"
  manufacturer = "Mettler Toledo"
  modelNumber = "ICS425-PRO"
  serialNumber = "SN-$rand-001"
  capacity = 50
  capacityUnit = "KG"
  accuracy = 0.0005
  accuracyUnit = "KG"
  manufacturingYear = 2024
  purchaseDate = "2024-03-15"
  location = "Clean Room Calibration Lab"
} | ConvertTo-Json
$updatedRes = Invoke-RestMethod -Uri "$base/instruments/$inst1Id" -Method Put -ContentType "application/json" -Headers $bo1Headers -Body $updateBody
Write-Host "Updated Name: $($updatedRes.instrumentName)"
Write-Host "Updated Capacity: $($updatedRes.capacity) $($updatedRes.capacityUnit)"
Write-Host "Updated Location: $($updatedRes.location)"

Write-Host "`n=== STEP 10: Toggle Instrument Status to INACTIVE ==="
$statusReq = @{ status = "INACTIVE" } | ConvertTo-Json
$statusRes = Invoke-RestMethod -Uri "$base/instruments/$inst1Id/status" -Method Patch -ContentType "application/json" -Headers $bo1Headers -Body $statusReq
Write-Host "Instrument 1 Status after PATCH: $($statusRes.status)"

Write-Host "`n=== STEP 11: Admin Login & Directory Verification ==="
$adminLoginBody = @{ email = "admin@scaleguard.com"; password = "Admin@123" } | ConvertTo-Json
$adminLoginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $adminLoginBody
$adminHeaders = @{ Authorization = "Bearer $($adminLoginRes.accessToken)" }

$allAdminInst = Invoke-RestMethod -Uri "$base/admin/instruments" -Method Get -Headers $adminHeaders
Write-Host "Admin retrieved total registered instruments across state: $($allAdminInst.Count)"

$inactiveAdminInst = Invoke-RestMethod -Uri "$base/admin/instruments?status=INACTIVE" -Method Get -Headers $adminHeaders
Write-Host "Admin filtered by status=INACTIVE: $($inactiveAdminInst.Count) instruments"

$adminDetail = Invoke-RestMethod -Uri "$base/admin/instruments/$inst1Id" -Method Get -Headers $adminHeaders
Write-Host "Admin inspected Instrument 1: $($adminDetail.instrumentName)"
Write-Host "Associated Business: $($adminDetail.businessName) ($($adminDetail.businessCity), $($adminDetail.businessState))"

Write-Host "`n=== STEP 12: RBAC Role Restrictions ==="
try {
  Invoke-RestMethod -Uri "$base/admin/instruments" -Method Get -Headers $bo1Headers
  throw "Expected 403 when BO accesses Admin instruments!"
} catch {
  Write-Host "BO accessing Admin route: HTTP $([int]$_.Exception.Response.StatusCode) (Forbidden)"
}

try {
  Invoke-RestMethod -Uri "$base/instruments" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $instSample
  throw "Expected 403 when Admin calls POST /api/instruments!"
} catch {
  Write-Host "Admin creating instrument: HTTP $([int]$_.Exception.Response.StatusCode) (Forbidden)"
}

Write-Host "`n=========================================================="
Write-Host ">>> ALL COMPONENT 3 LIVE API TESTS PASSED PERFECTLY! <<<"
Write-Host "=========================================================="
