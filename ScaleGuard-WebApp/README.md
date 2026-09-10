# SCALEGUARD — Legal Metrology Verification & Certification Platform

> **System Components Completed**:
> - **Component 1**: Authentication & Role-Based Access Control (RBAC)
> - **Component 2**: Business Profile Management & Governance
> - **Component 3**: Instrument Management & Lifecycle
> - **Component 4**: Verification Application Management & Docket Lifecycle
> - **Component 5**: Officer Management & Assignment
> - **Component 6**: Inspection Management & Field Verification Lifecycle
> - **Component 7**: Measurement Testing & Tolerance Verification Module

ScaleGuard is a digital platform designed for government and commercial stakeholders to govern and streamline the verification and certification lifecycle of weighing and measuring instruments in compliance with Legal Metrology standards.

---

## 1. Implemented Development Scope

### Component 1: Authentication & Role-Based Access Control
- **User Self-Registration**: Exclusively for `BUSINESS_OWNER` accounts.
- **User Login**: Secure authentication with email and password.
- **Password Encryption**: Industry-standard BCrypt hashing (strength 10).
- **JWT Authentication**: Stateless, signed HS256 tokens carrying email, user ID, full name, and role claims.
- **Backend Role-Based Access Control (RBAC)**: Endpoint-level method and filter security for `BUSINESS_OWNER`, `ADMIN`, and `LMO_OFFICER`.
- **Protected Web Dashboards**: Dedicated role portals with real-time route guarding and access control validation.
- **Automated Seed Users**: Default administrative and officer credentials bootstrapped on startup.
- **Centralized Exception Handling**: Uniform RFC-compliant JSON error responses across all failure modes.

### Component 2: Business Profile Management
- **1:1 Owner-to-Business Relationship**: Strictly enforced at both JPA entity and database schema levels (`owner_id UNIQUE NOT NULL`). Each Business Owner can register exactly one business entity.
- **Business Profile Creation**: `POST /api/businesses` allows authenticated Business Owners to submit entity details.
- **Profile Duplicate Prevention**: Enforces HTTP 409 Conflict if an owner already has a registered business profile.
- **Current Business Retrieval**: `GET /api/businesses/me` securely retrieves the profile linked to the JWT owner.
- **Profile Update**: `PUT /api/businesses/me` enables Business Owners to modify editable profile fields with full input validation.
- **Admin Governance & Directory**:
  - `GET /api/admin/businesses`: Read-only access for `ADMIN` to list all registered businesses.
  - `GET /api/admin/businesses/{id}`: Detailed inspection view of any registered business entity.

### Component 3: Instrument Management
- **1:Many Business-to-Instruments Relationship**: Each business establishment can register and manage multiple weighing and measuring instruments (`business_id NOT NULL`).
- **Precondition Check**: Requires an active Business Profile before any instruments can be registered. Unregistered owners receive `400 BAD REQUEST`.
- **Instrument Lifecycle**: Simple lifecycle with states `ACTIVE` and `INACTIVE` (default `ACTIVE`).
- **No Permanent Deletion**: Instruments are never permanently deleted from the database in the MVP. Status is toggled via `PATCH /api/instruments/{id}/status`.
- **Global Serial Number Uniqueness**: Serial numbers must be unique across all businesses globally. Attempting duplicate registration yields `409 CONFLICT`.
- **Ownership Isolation**: Business Owners can only access, update, or toggle status of instruments belonging to their own business profile. Accessing another owner's instrument returns `404 NOT FOUND` to prevent resource enumeration.
- **Full Measurement Specifications**: Validated measurement attributes (`capacity > 0`, `capacityUnit`, `accuracy > 0`, `accuracyUnit`, `1900 <= manufacturingYear <= currentYear + 1`, past/present `purchaseDate`, and physical installation `location`).
- **Search & Filter Support**:
  - Business Owner filtering by free-text search, status, and instrument type.
  - Admin filtering across all businesses by free-text search, status, instrument type, and business ID.
- **Admin Read-Only Governance**: Admins can inspect instruments and view associated business metadata (`businessName`, `businessCity`, `businessState`), but cannot create, modify, or deactivate instruments.

### Component 4: Verification Application Management
- **1:Many Instrument-to-Applications Relationship**: An instrument can have multiple verification applications over its operational lifespan (`instrument_id NOT NULL`, `business_id NOT NULL`).
- **Strict MVP Lifecycle**: States strictly bounded to `DRAFT` and `SUBMITTED`.
- **Draft Workflow**: Draft applications can be created, updated, and deleted (`204 NO CONTENT`).
- **Formal Submission**: `PATCH /api/verification-applications/{id}/submit` changes status to `SUBMITTED`. Once submitted, applications become immutable and non-deletable (`409 CONFLICT` on edit/delete attempts).
- **Active Instrument Precondition**: An application can only be submitted if its associated instrument is currently `ACTIVE` (`400 BAD REQUEST` if inactive).
- **Sequential Application Numbering**: Unique backend-generated numbers in format `SG-YYYY-XXXXXX` (e.g. `SG-2026-000001`).
- **Tenant Isolation**: Business Owners can only access, edit, submit, or delete applications belonging to their own business profile (`404 NOT FOUND` on cross-tenant attempts).
- **Admin Statewide Governance**: Read-only access for administrators to search, filter, and inspect all verification applications alongside applicant business and equipment details.

### Component 5: Officer Management & Assignment
- **LMO Officer Provisioning**: Admins provision Legal Metrology Officers with unique officer codes, district jurisdiction, designation, and status.
- **Application Assignment**: Assign submitted applications to active officers; reassign when jurisdiction or workload demands require.
- **Tenant Isolation**: Officers strictly access and manage applications within their assigned jurisdiction.
- **Officer Portal**: Real-time console with workload metrics, assigned dockets, and personal credentials.

### Component 6: Inspection Management
- **Sequential Inspection Numbering**: Formatted `INSP-YYYY-XXXXXX` (e.g. `INSP-2026-000001`).
- **Inspection Lifecycle**: `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`; or `SCHEDULED` → `CANCELLED`.
- **Application Synchronization**: Application transitions from `OFFICER_ASSIGNED` to `INSPECTION_IN_PROGRESS` on start, to `INSPECTION_COMPLETED` on finish; or reverts to `OFFICER_ASSIGNED` on cancellation.
- **Observation Notes Recording**: Officers record and update field findings and calibration measurements during `IN_PROGRESS`.
- **Mandatory Cancellation Audit**: Cancelling a scheduled inspection requires a validated justification reason.
- **Statewide Inspection Monitoring**: Admins monitor and filter all statewide inspections by status, officer, district, and date ranges.

### Component 7: Measurement Testing & Tolerance Module
- **Inspection-to-Test-Session Binding**: Exactly one `MeasurementTestSession` per `Inspection` (`inspection_id UNIQUE NOT NULL`).
- **Sub-Milligram Precision Engine**: All calculations executed using `BigDecimal(19, 6)` arithmetic:
  $$\text{Error} = \text{Observed Value} - \text{Standard Value}$$
  $$\text{Percentage Error} = \left(\frac{\text{Error}}{\text{Standard Value}}\right) \times 100$$
- **Test Session Lifecycle**: `NOT_STARTED` → `IN_PROGRESS` → `COMPLETED`. Records can only be added, edited, or deleted while the session is `IN_PROGRESS`.
- **Dynamic Field Recalibration**: Updating observed or standard weights triggers immediate backend recalculation of absolute and percentage error metrics.
- **Officer Field Remarks**: Officers annotate overall calibration observations, environmental factors, or test weights used.
- **Admin Read-Only Auditing**: Full administrative inspection of all calibration records, maximum recorded deviation, and average percentage error.

> **Strict Scope Notice**: Subsequent components (Photo Evidence & Geo-tagging, Digital Certificates & Seal Affixation, QR Verification) are scheduled for future development phases.

---

## 2. Technology Stack

### Backend
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 (Stateless JWT Filter, BCrypt)
- **Data & Persistence**: Spring Data JPA, Hibernate, PostgreSQL driver
- **In-Memory Local/Test Database**: H2 (PostgreSQL dialect mode for instant offline running & automated testing)
- **JWT Library**: JJWT (Java JWT) 0.12.6
- **Build Tool**: Apache Maven 3.9+

### Frontend
- **Framework**: React 18
- **Build & Dev Tool**: Vite 5
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS 3 with custom Gov-Tech design tokens
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.7+ with request & response interceptors
- **State Management**: React Context API (`AuthContext`)

---

## 3. Project Directory Structure

```text
ScaleGuard-WebApp/
│
├── backend/                               # Spring Boot Application
│   ├── src/main/java/com/scaleguard/
│   │   ├── config/                        # CORS & DataInitializer
│   │   │   ├── CorsConfig.java
│   │   │   └── DataInitializer.java
│   │   ├── controller/                    # REST API Controllers
│   │   │   ├── AdminBusinessController.java
│   │   │   ├── AdminInstrumentController.java
│   │   │   ├── AdminTestController.java
│   │   │   ├── AuthController.java
│   │   │   ├── BusinessController.java
│   │   │   ├── BusinessOwnerTestController.java
│   │   │   ├── InstrumentController.java
│   │   │   └── OfficerTestController.java
│   │   ├── dto/                           # Requests, Responses, and DTOs
│   │   │   ├── AdminInstrumentResponse.java
│   │   │   ├── ApiResponse.java
│   │   │   ├── AuthResponse.java
│   │   │   ├── BusinessCreateRequest.java
│   │   │   ├── BusinessResponse.java
│   │   │   ├── BusinessUpdateRequest.java
│   │   │   ├── ErrorResponse.java
│   │   │   ├── InstrumentCreateRequest.java
│   │   │   ├── InstrumentResponse.java
│   │   │   ├── InstrumentStatusUpdateRequest.java
│   │   │   ├── InstrumentUpdateRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   └── UserResponse.java
│   │   ├── entity/                        # JPA Entities and Enums
│   │   │   ├── AccuracyUnit.java
│   │   │   ├── Business.java
│   │   │   ├── BusinessStatus.java
│   │   │   ├── CapacityUnit.java
│   │   │   ├── Instrument.java
│   │   │   ├── InstrumentStatus.java
│   │   │   ├── InstrumentType.java
│   │   │   ├── Role.java
│   │   │   └── User.java
│   │   ├── exception/                     # Centralized Error Handlers
│   │   │   ├── BadRequestException.java
│   │   │   ├── ConflictException.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   ├── repository/                    # Spring Data JPA Repositories
│   │   │   ├── BusinessRepository.java
│   │   │   ├── InstrumentRepository.java
│   │   │   ├── InstrumentSpecification.java
│   │   │   └── UserRepository.java
│   │   ├── security/                      # JWT Service, Filter, & SecurityConfig
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── JwtAuthenticationEntryPoint.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtService.java
│   │   │   └── SecurityConfig.java
│   │   ├── service/                       # Business Logic Layer
│   │   │   ├── AuthService.java
│   │   │   ├── BusinessService.java
│   │   │   ├── BusinessServiceImpl.java
│   │   │   ├── InstrumentService.java
│   │   │   └── InstrumentServiceImpl.java
│   │   └── ScaleGuardApplication.java     # Application Entry Point
│   ├── src/main/resources/
│   │   ├── application.properties         # Production PostgreSQL Configuration
│   │   └── application-local.properties   # Local Dev H2 In-Memory Configuration
│   ├── src/test/java/com/scaleguard/      # Automated Tests (43 Integration Tests)
│   │   ├── AuthControllerIntegrationTest.java
│   │   ├── BusinessProfileIntegrationTest.java
│   │   ├── InstrumentIntegrationTest.java
│   │   └── SecurityRbacIntegrationTest.java
│   ├── pom.xml                            # Maven Dependencies
│   └── .env.example                       # Environment template
│
├── web/                                   # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BusinessProfileCard.jsx    # Business Profile display card
│   │   │   ├── InstrumentStatusBadge.jsx  # Instrument status indicator badge
│   │   │   ├── Navbar.jsx                 # Top navigation bar
│   │   │   └── ProtectedRoute.jsx         # Role & auth route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx            # User state, JWT persistence, auto-refresh
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminInstrumentDetails.jsx # Read-only instrument inspection
│   │   │   │   ├── AdminInstrumentList.jsx    # Statewide instrument registry
│   │   │   │   ├── BusinessDetails.jsx        # Admin business inspection view
│   │   │   │   └── BusinessList.jsx           # Admin business directory table
│   │   │   ├── business/
│   │   │   │   ├── BusinessProfile.jsx        # Business Owner profile view
│   │   │   │   ├── CreateBusinessProfile.jsx  # New business registration form
│   │   │   │   └── EditBusinessProfile.jsx    # Business update form
│   │   │   ├── instruments/
│   │   │   │   ├── CreateInstrument.jsx       # Instrument registration form
│   │   │   │   ├── EditInstrument.jsx         # Instrument update form
│   │   │   │   ├── InstrumentDetails.jsx      # Instrument detail specification
│   │   │   │   └── InstrumentList.jsx         # Instrument asset management table
│   │   │   ├── AdminDashboard.jsx             # Admin governance portal
│   │   │   ├── BusinessOwnerDashboard.jsx     # Business owner portal & asset summary
│   │   │   ├── Login.jsx                      # Login page
│   │   │   ├── Register.jsx                   # Registration page
│   │   │   └── Unauthorized.jsx               # 403 Forbidden page
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx                  # React Router definitions
│   │   ├── services/
│   │   │   ├── api.js                         # Axios instance + JWT interceptor
│   │   │   ├── authService.js                 # Auth API request wrappers
│   │   │   ├── businessService.js             # Business Profile API wrappers
│   │   │   └── instrumentService.js           # Instrument API wrappers & enum helpers
│   │   ├── App.jsx                            # App shell with Context Provider
│   │   ├── index.css                          # Tailwind base & custom design tokens
│   │   └── main.jsx                           # React DOM root
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── ScaleGuard_Component_1_API.postman_collection.json # Postman (Auth & RBAC)
├── ScaleGuard_Component_2_API.postman_collection.json # Postman (Business Profiles)
├── ScaleGuard_Component_3_API.postman_collection.json # Postman (Instruments)
├── test_component2.ps1                                # Component 2 live test script
├── test_component3.ps1                                # Component 3 live test script
└── README.md                                          # Master System Documentation
```

---

## 4. User Roles & Access Matrix

| Role | Self Registration | Web Access | Allowed Business Profile Endpoints | Allowed Instrument Endpoints | Allowed Admin Endpoints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`BUSINESS_OWNER`** | **YES** (`/api/auth/register`) | `/dashboard/business-owner`<br>`/business-profile`<br>`/instruments` | `POST /api/businesses`<br>`GET /api/businesses/me`<br>`PUT /api/businesses/me` | `POST /api/instruments`<br>`GET /api/instruments`<br>`GET /api/instruments/{id}`<br>`PUT /api/instruments/{id}`<br>`PATCH /api/instruments/{id}/status` | **None** (HTTP 403) |
| **`ADMIN`** | **NO** (Database seed only) | `/dashboard/admin`<br>`/admin/businesses`<br>`/admin/instruments` | **None** (HTTP 403) | **None** (HTTP 403) | `GET /api/admin/businesses`<br>`GET /api/admin/businesses/{id}`<br>`GET /api/admin/instruments`<br>`GET /api/admin/instruments/{id}` |
| **`LMO_OFFICER`** | **NO** (Database seed only) | Backend API only (Future Mobile App) | **None** (HTTP 403) | **None** (HTTP 403) | **None** (HTTP 403) |

---

## 5. Seed User Credentials (Development)

During application startup, `DataInitializer` automatically provisions seed credentials:

### System Administrator
- **Email**: `admin@scaleguard.com`
- **Password**: `Admin@123`
- **Role**: `ADMIN`

### Legal Metrology Officer (For future Mobile App)
- **Email**: `officer@scaleguard.com`
- **Password**: `Officer@123`
- **Role**: `LMO_OFFICER`

---

## 6. How to Run & Verify

### Step 1: Start Backend Server

```powershell
cd ScaleGuard-WebApp/backend
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
$env:Path = "$env:JAVA_HOME\bin;C:\Users\Joshi\.maven\apache-maven-3.9.9\bin;$env:Path"

# Run automated tests (All 81 unit & integration tests across Components 1 to 7)
mvn clean test

# Start the Spring Boot application (using local in-memory profile)
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
*The backend starts on `http://localhost:8080`.*

### Step 2: Start Web Frontend

```powershell
cd ScaleGuard-WebApp/web
npm install
npm run dev
```
*The frontend web application is available at `http://localhost:5173`.*

### Step 3: Run the Automated Live Verification Suites

```powershell
cd ScaleGuard-WebApp

# Component 3 Verification Suite (Instruments)
powershell -ExecutionPolicy Bypass -File .\test_component3.ps1

# Component 4 Verification Suite (Verification Applications)
powershell -ExecutionPolicy Bypass -File .\test_component4.ps1

# Component 5 Verification Suite (Officer Management & Assignment)
powershell -ExecutionPolicy Bypass -File .\test_component5.ps1
```

---

## 7. REST API Reference (Component 3)

### 1. Register Instrument
- **Endpoint**: `POST /api/instruments`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Request Body**:
```json
{
  "instrumentName": "Digital Platform Scale 500kg",
  "instrumentType": "DIGITAL_WEIGHING_SCALE",
  "manufacturer": "Avery Weigh-Tronix",
  "modelNumber": "ZK830-500",
  "serialNumber": "SN-AVT-2024-001",
  "capacity": 500.0,
  "capacityUnit": "KG",
  "accuracy": 0.1,
  "accuracyUnit": "KG",
  "manufacturingYear": 2024,
  "purchaseDate": "2024-05-15",
  "location": "Warehouse Bay 3"
}
```
- **Response (201 Created)**: Returns full `InstrumentResponse` with `status: "ACTIVE"`.
- **Errors**: `400 BAD REQUEST` (Validation error or no business profile), `409 CONFLICT` (Duplicate serial number).

### 2. Get All My Instruments
- **Endpoint**: `GET /api/instruments`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Query Params**: `search`, `status` (`ACTIVE`/`INACTIVE`), `instrumentType`.
- **Response (200 OK)**: Array of `InstrumentResponse` objects belonging exclusively to the authenticated user's business.

### 3. Get Single Instrument Details
- **Endpoint**: `GET /api/instruments/{id}`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Response (200 OK)**: `InstrumentResponse` object.
- **Error (404 Not Found)**: Returned if the instrument does not exist or belongs to another business.

### 4. Update Instrument
- **Endpoint**: `PUT /api/instruments/{id}`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Request Body**: Updated fields (all editable except status and business ownership).
- **Response (200 OK)**: Updated `InstrumentResponse`.

### 5. Toggle Instrument Status
- **Endpoint**: `PATCH /api/instruments/{id}/status`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Request Body**:
```json
{
  "status": "INACTIVE"
}
```
- **Response (200 OK)**: Updated `InstrumentResponse`.

### 6. Admin List All Statewide Instruments
- **Endpoint**: `GET /api/admin/instruments`
- **Access**: `ROLE_ADMIN`
- **Query Params**: `search`, `status`, `instrumentType`, `businessId`.
- **Response (200 OK)**: Array of `AdminInstrumentResponse` objects (including `businessName`, `businessCity`, `businessState`).

### 7. Admin View Instrument Details
- **Endpoint**: `GET /api/admin/instruments/{id}`
- **Access**: `ROLE_ADMIN`
- **Response (200 OK)**: Full `AdminInstrumentResponse` details.

---

## 8. REST API Reference (Component 4)

### 1. Create Draft Application
- **Endpoint**: `POST /api/verification-applications`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Request Body**:
```json
{
  "instrumentId": 1,
  "applicationType": "INITIAL_VERIFICATION",
  "purpose": "Initial commercial verification for packaging line.",
  "requestedDate": "2026-09-09",
  "preferredInspectionDate": "2026-09-16",
  "remarks": "Please schedule inspection during morning hours."
}
```
- **Response (201 Created)**: Returns `VerificationApplicationResponse` with status `DRAFT` and generated `SG-YYYY-XXXXXX` number.

### 2. List My Applications
- **Endpoint**: `GET /api/verification-applications`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Query Params**: `status`, `applicationType`, `instrumentId`, `search`.
- **Response (200 OK)**: Array of `VerificationApplicationResponse` objects.

### 3. Get Application Details
- **Endpoint**: `GET /api/verification-applications/{id}`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Response (200 OK)**: `VerificationApplicationResponse` object (404 if not found or cross-owner).

### 4. Update Draft Application
- **Endpoint**: `PUT /api/verification-applications/{id}`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Response (200 OK)**: Updated `VerificationApplicationResponse` (409 Conflict if already `SUBMITTED`).

### 5. Submit Application
- **Endpoint**: `PATCH /api/verification-applications/{id}/submit`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Response (200 OK)**: Updated `VerificationApplicationResponse` with status `SUBMITTED` (409 Conflict if already submitted, 400 Bad Request if instrument is `INACTIVE`).

### 6. Delete Draft Application
- **Endpoint**: `DELETE /api/verification-applications/{id}`
- **Access**: `ROLE_BUSINESS_OWNER`
- **Response (204 No Content)**: 409 Conflict if already `SUBMITTED`.

### 7. Admin List All Statewide Applications
- **Endpoint**: `GET /api/admin/verification-applications`
- **Access**: `ROLE_ADMIN`
- **Query Params**: `status`, `applicationType`, `businessId`, `instrumentId`, `search`.
- **Response (200 OK)**: Array of `AdminVerificationApplicationResponse` objects with business metadata.

### 8. Admin Inspect Application Details
- **Endpoint**: `GET /api/admin/verification-applications/{id}`
- **Access**: `ROLE_ADMIN`
- **Response (200 OK)**: Full `AdminVerificationApplicationResponse` details.

---

## 9. REST API Reference (Component 5: Officer Management & Assignment)

### 1. Admin Provision New Officer
- **Endpoint**: `POST /api/admin/officers`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "name": "Inspector Rajesh Patel",
  "email": "rajesh.patel@gujarat.gov.in",
  "password": "Officer@123",
  "officerCode": "LMO-GUJ-AHM-01",
  "designation": "Inspector of Legal Metrology",
  "department": "Legal Metrology Department",
  "district": "Ahmedabad",
  "phoneNumber": "+91-9876543210"
}
```
- **Response (201 Created)**: Returns `OfficerResponse` with generated `id`, `userId`, `status: "ACTIVE"`.

### 2. Admin List Officers (Filter & Search)
- **Endpoint**: `GET /api/admin/officers`
- **Access**: `ROLE_ADMIN`
- **Query Params**: `search`, `status` (`ACTIVE`/`INACTIVE`), `district`, `page`, `size`, `sort`.
- **Response (200 OK)**: Paginated `Page<OfficerResponse>`.

### 3. Admin Get Officer By ID
- **Endpoint**: `GET /api/admin/officers/{id}`
- **Access**: `ROLE_ADMIN`
- **Response (200 OK)**: Returns `OfficerResponse` (404 if not found).

### 4. Admin Update Officer Details
- **Endpoint**: `PUT /api/admin/officers/{id}`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "name": "Inspector Rajesh K. Patel",
  "designation": "Senior Inspector & Head",
  "department": "Legal Metrology Department",
  "district": "Ahmedabad Urban",
  "phoneNumber": "+91-9876599999"
}
```
- **Response (200 OK)**: Returns updated `OfficerResponse`.

### 5. Admin Update Officer Status
- **Endpoint**: `PATCH /api/admin/officers/{id}/status`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "status": "INACTIVE"
}
```
- **Response (200 OK)**: Returns updated `OfficerResponse`.

### 6. Admin Assign Officer to Application
- **Endpoint**: `POST /api/admin/verification-applications/{applicationId}/assign-officer`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "officerId": 2
}
```
- **Response (200 OK)**: Returns `OfficerAssignmentResponse` with status `OFFICER_ASSIGNED` and populated `assignedAt`.
- **Constraints**: Application must be in `SUBMITTED` status (409 Conflict otherwise). Officer must be `ACTIVE` (400 Bad Request if `INACTIVE`).

### 7. Admin Reassign Officer
- **Endpoint**: `PUT /api/admin/verification-applications/{applicationId}/assign-officer`
- **Access**: `ROLE_ADMIN`
- **Request Body**:
```json
{
  "officerId": 3
}
```
- **Response (200 OK)**: Returns `OfficerAssignmentResponse` with updated `assignedOfficer` and refreshed `assignedAt`.
- **Constraints**: Application must currently be in `OFFICER_ASSIGNED` status (400 Bad Request otherwise). Officer must be `ACTIVE`.

### 8. Officer Self-Profile
- **Endpoint**: `GET /api/officer/profile`
- **Access**: `ROLE_LMO_OFFICER`
- **Response (200 OK)**: Returns `OfficerProfileResponse` for authenticated officer.

### 9. Officer List Assigned Applications
- **Endpoint**: `GET /api/officer/verification-applications`
- **Access**: `ROLE_LMO_OFFICER`
- **Response (200 OK)**: Array of `OfficerApplicationResponse` objects assigned to the officer.

### 10. Officer Get Assigned Application Details
- **Endpoint**: `GET /api/officer/verification-applications/{id}`
- **Access**: `ROLE_LMO_OFFICER`
- **Response (200 OK)**: Full `OfficerApplicationResponse` (404 Not Found if unassigned or assigned to another officer).

---

## COMPONENT 7: MEASUREMENT TESTING MODULE

### 1. Purpose
The Measurement Testing Module enables the assigned Legal Metrology Officer (LMO) to conduct physical calibration tests on weighing and measuring instruments during an active inspection (`IN_PROGRESS`). The system records standard weights, observed readings, computes error deviations and percentage errors server-side using high-precision `BigDecimal` arithmetic, maintains overall remarks, and seals test sessions into an immutable audit state upon completion.

### 2. Architecture
```
VerificationApplication (OFFICER_ASSIGNED)
          │
          ▼
      Inspection (IN_PROGRESS)
          │
          │ 1 : 1
          ▼
  MeasurementTestSession (IN_PROGRESS -> COMPLETED)
          │
          │ 1 : N
          ▼
  MeasurementTestRecord
    ├── testPoint #1 (Standard: 10.000, Observed: 10.020 -> Error: +0.020, %Error: +0.200%)
    ├── testPoint #2 (Standard: 20.000, Observed: 19.980 -> Error: -0.020, %Error: -0.100%)
    └── testPoint #N
```
> **Decoupled Lifecycle**: Completing a measurement test session (`status = COMPLETED`) does **not** complete the parent inspection. The inspection remains `IN_PROGRESS` for subsequent photo documentation (Component 8) and AI visual analysis (Component 9).

### 3. Database Entities
- **`measurement_test_sessions`**:
  - `id`: Primary key (BIGINT)
  - `inspection_id`: Foreign key to `inspections` (UNIQUE, NOT NULL, 1:1)
  - `status`: Enum (`IN_PROGRESS`, `COMPLETED`)
  - `started_at`: Timestamp when testing session began
  - `completed_at`: Timestamp when testing was finalized
  - `overall_remarks`: Officer observations (VARCHAR 2000)
  - `created_at`, `updated_at`: Auditing timestamps
- **`measurement_test_records`**:
  - `id`: Primary key (BIGINT)
  - `test_session_id`: Foreign key to `measurement_test_sessions` (NOT NULL, N:1)
  - `test_point`: Sequential integer generated server-side (`max + 1`)
  - `standard_value`: Certified reference weight (DECIMAL 19, 6)
  - `observed_value`: Reading displayed on instrument (DECIMAL 19, 6)
  - `error_value`: Server-calculated error (DECIMAL 19, 6)
  - `percentage_error`: Server-calculated percentage error (DECIMAL 19, 6)
  - `unit`: Unit of measurement, e.g., kg, g, mg (VARCHAR 30)
  - `remarks`: Reading-specific notes (VARCHAR 1000)
  - `created_at`, `updated_at`: Auditing timestamps

### 4. Measurement Calculation Formulas
All derived values are calculated strictly by the backend using `BigDecimal` (`scale = 6, RoundingMode.HALF_UP`):
$$\text{errorValue} = \text{observedValue} - \text{standardValue}$$
$$\text{percentageError} = \left( \frac{\text{errorValue}}{\text{standardValue}} \right) \times 100$$
- Constraints: `standardValue > 0` (strictly enforced to prevent division by zero), `observedValue >= 0`.
- The frontend provides live preview calculations only; the backend remains the single source of truth.

### 5. Backend Calculation Security & Audit Integrity
- **Client Trust Zero**: Derived values (`errorValue`, `percentageError`) and `testPoint` are never accepted from HTTP request bodies.
- **Audit Consistency**: Deleting an erroneous test record during `IN_PROGRESS` status removes the record without renumbering existing test points (e.g., points 1, 2, 3 -> deleting point 2 leaves points 1 and 3).
- **Completion Locking**: Once completed (`POST /api/officer/measurement-tests/{sessionId}/complete`), all record mutations (`POST`, `PATCH`, `DELETE`) and overall remarks updates are strictly locked (HTTP 409 Conflict).
- **Jurisdictional Isolation**: An officer attempting to access another officer's test session or test records receives HTTP 404 Not Found.

### 6. API Endpoints

#### Officer Endpoints (`ROLE_LMO_OFFICER`):
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/officer/inspections/{inspectionId}/measurement-tests/start` | Start measurement test session | 201 Created / 409 Conflict |
| `GET` | `/api/officer/inspections/{inspectionId}/measurement-tests` | Retrieve session, summary, and readings | 200 OK / 404 Not Found |
| `POST` | `/api/officer/measurement-tests/{sessionId}/records` | Add new calibration test reading | 201 Created / 400 Bad Request |
| `PATCH` | `/api/officer/measurement-tests/records/{recordId}` | Update reading and recalculate error | 200 OK / 409 Conflict |
| `DELETE` | `/api/officer/measurement-tests/records/{recordId}` | Delete reading without renumbering | 204 No Content / 409 Conflict |
| `PATCH` | `/api/officer/measurement-tests/{sessionId}/remarks` | Save overall testing remarks | 200 OK / 409 Conflict |
| `POST` | `/api/officer/measurement-tests/{sessionId}/complete` | Finalize & lock testing session | 200 OK / 400 Bad Request |

#### Admin Endpoints (`ROLE_ADMIN`):
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/admin/inspections/{inspectionId}/measurement-tests` | View complete test audit dossier (Read-Only) | 200 OK / 404 Not Found |

### 7. Frontend Routes
- **Officer Testing Dashboard**: `/officer/inspections/:inspectionId/measurement-tests`
- **Admin Audit View**: `/admin/inspections/:inspectionId/measurement-tests`
- **Inspection Details Integration**:
  - `/officer/inspections/:id`: Direct access button and activity card when inspection is `IN_PROGRESS` or `COMPLETED`.
  - `/admin/inspections/:id`: Audit header button and measurement overview card.

### 8. Testing Instructions
- **Run Backend Unit & Integration Tests**:
  ```powershell
  cd backend
  mvn test -Dtest=MeasurementTestIntegrationTest
  ```
- **Run All Project Tests**:
  ```powershell
  mvn test
  ```
- **Run Frontend Build**:
  ```powershell
  cd ../web
  npm run build
  ```
- **Execute End-to-End Live Verification**:
  ```powershell
  cd ..
  powershell -ExecutionPolicy Bypass -File ./test_component7.ps1
  ```


