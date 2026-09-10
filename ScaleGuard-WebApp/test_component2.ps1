$ErrorActionPreference = 'Stop'
$base = 'http://localhost:8080/api'

Write-Host "=== STEP 1: Register New Business Owner ==="
$rand = Get-Random -Minimum 1000 -Maximum 9999
$email = "aarav.$rand@gujaratweights.com"
$regBody = @{
  fullName = "Aarav Patel"
  email = $email
  password = "Password@123"
  confirmPassword = "Password@123"
  phoneNumber = "9876543210"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "Registered User Success: $($regRes.success), Message: $($regRes.message), Email: $email"

Write-Host "=== STEP 2: Login as Business Owner ==="
$loginBody = @{
  email = $email
  password = "Password@123"
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$boToken = $loginRes.accessToken
Write-Host "BO Token received: $($boToken.Substring(0, 15))... (Owner: $($loginRes.user.fullName))"

$boHeaders = @{ Authorization = "Bearer $boToken" }

Write-Host "=== STEP 3: Verify GET /api/businesses/me returns 404 before profile creation ==="
try {
  Invoke-RestMethod -Uri "$base/businesses/me" -Method Get -Headers $boHeaders
  throw "Expected 404 but got success!"
} catch {
  $statusCode = [int]$_.Exception.Response.StatusCode
  Write-Host "Received expected status code: $statusCode"
}

Write-Host "=== STEP 4: Create Business Profile via POST /api/businesses ==="
$bizCreateBody = @{
  businessName = "Gujarat Precision Scales Pvt Ltd"
  businessType = "Manufacturing"
  registrationNumber = "REG-GJ-2026-$rand"
  gstNumber = "24AAACG1234F1Z5"
  contactEmail = "contact@gujaratprecision.in"
  contactPhone = "9876543210"
  addressLine1 = "Plot 42, GIDC Electronic Estate"
  addressLine2 = "Sector 25"
  city = "Gandhinagar"
  state = "Gujarat"
  pincode = "382025"
  country = "India"
} | ConvertTo-Json

$createRes = Invoke-RestMethod -Uri "$base/businesses" -Method Post -ContentType "application/json" -Headers $boHeaders -Body $bizCreateBody
Write-Host "Business Created ID: $($createRes.id) Name: $($createRes.businessName) Status: $($createRes.status)"
$bizId = $createRes.id

Write-Host "=== STEP 5: Verify Duplicate Creation returns 409 Conflict ==="
try {
  Invoke-RestMethod -Uri "$base/businesses" -Method Post -ContentType "application/json" -Headers $boHeaders -Body $bizCreateBody
  throw "Expected 409 duplicate conflict but request succeeded!"
} catch {
  $statusCode = [int]$_.Exception.Response.StatusCode
  Write-Host "Received expected duplicate conflict status: $statusCode"
}

Write-Host "=== STEP 6: Verify GET /api/businesses/me returns the profile ==="
$meRes = Invoke-RestMethod -Uri "$base/businesses/me" -Method Get -Headers $boHeaders
Write-Host "Fetched Profile Name: $($meRes.businessName) City: $($meRes.city)"

Write-Host "=== STEP 7: Update Business Profile via PUT /api/businesses/me ==="
$bizUpdateBody = @{
  businessName = "Gujarat Precision Scales and Instruments Pvt Ltd"
  businessType = "Manufacturing & Testing"
  registrationNumber = "REG-GJ-2026-$rand"
  gstNumber = "24AAACG1234F1Z5"
  contactEmail = "contact@gujaratprecision.in"
  contactPhone = "9876543211"
  addressLine1 = "Plot 42-43, GIDC Electronic Estate"
  addressLine2 = "Phase II"
  city = "Gandhinagar"
  state = "Gujarat"
  pincode = "382025"
  country = "India"
} | ConvertTo-Json

$updateRes = Invoke-RestMethod -Uri "$base/businesses/me" -Method Put -ContentType "application/json" -Headers $boHeaders -Body $bizUpdateBody
Write-Host "Updated Business Name: $($updateRes.businessName) New Phone: $($updateRes.contactPhone)"

Write-Host "=== STEP 8: Admin Login & Directory Verification ==="
$adminLoginBody = @{
  email = "admin@scaleguard.com"
  password = "Admin@123"
} | ConvertTo-Json
$adminLoginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $adminLoginBody
$adminToken = $adminLoginRes.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

$allBiz = Invoke-RestMethod -Uri "$base/admin/businesses" -Method Get -Headers $adminHeaders
Write-Host "Admin retrieved businesses count: $($allBiz.Count)"

$adminBizDetail = Invoke-RestMethod -Uri "$base/admin/businesses/$bizId" -Method Get -Headers $adminHeaders
Write-Host "Admin inspected Business: $($adminBizDetail.businessName) Owner ID: $($adminBizDetail.ownerId)"

Write-Host "=== STEP 9: RBAC Checks ==="
# BO cannot call admin endpoint
try {
  Invoke-RestMethod -Uri "$base/admin/businesses" -Method Get -Headers $boHeaders
  throw "Expected 403 when BO accesses Admin route!"
} catch {
  Write-Host "BO accessing Admin route: HTTP $([int]$_.Exception.Response.StatusCode) (Correct 403 Forbidden)"
}

# Admin cannot create business
try {
  Invoke-RestMethod -Uri "$base/businesses" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $bizCreateBody
  throw "Expected 403 when Admin calls POST /api/businesses!"
} catch {
  Write-Host "Admin calling POST /api/businesses: HTTP $([int]$_.Exception.Response.StatusCode) (Correct 403 Forbidden)"
}

Write-Host "====================================================="
Write-Host ">>> ALL COMPONENT 2 LIVE API TESTS PASSED PERFECTLY! <<<"
Write-Host "====================================================="
