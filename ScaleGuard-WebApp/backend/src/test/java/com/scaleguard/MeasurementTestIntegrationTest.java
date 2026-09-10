package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.*;
import com.scaleguard.entity.*;
import com.scaleguard.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MeasurementTestIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MeasurementTestRecordRepository recordRepository;

    @Autowired
    private MeasurementTestSessionRepository sessionRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private VerificationApplicationRepository applicationRepository;

    @Autowired
    private InstrumentRepository instrumentRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private OfficerProfileRepository officerProfileRepository;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String boToken;
    private String officer1Token;
    private String officer2Token;
    private Long activeInspectionId;
    private Long scheduledInspectionId;

    @BeforeEach
    void setUp() throws Exception {
        recordRepository.deleteAll();
        sessionRepository.deleteAll();
        inspectionRepository.deleteAll();
        applicationRepository.deleteAll();
        instrumentRepository.deleteAll();
        businessRepository.deleteAll();

        // 1. Admin
        String adminEmail = "meas_admin@scaleguard.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            RegisterRequest adminReg = new RegisterRequest("Admin User", adminEmail, "+91-9876543310", "Admin@123", "Admin@123");
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(adminReg)));
            User admin = userRepository.findByEmail(adminEmail).orElseThrow();
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
        LoginRequest adminLogin = new LoginRequest(adminEmail, "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminLogin))).andReturn();
        adminToken = objectMapper.readTree(adminRes.getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Business Owner + Business + Instrument
        String boEmail = "meas_bo@test.com";
        if (!userRepository.existsByEmail(boEmail)) {
            RegisterRequest boReg = new RegisterRequest("Business Owner", boEmail, "+91-9876543320", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(boReg)));
        }
        LoginRequest boLogin = new LoginRequest(boEmail, "Password@123");
        MvcResult boRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(boLogin))).andReturn();
        boToken = objectMapper.readTree(boRes.getResponse().getContentAsString()).get("accessToken").asText();

        BusinessCreateRequest bizReq = new BusinessCreateRequest(
                "Apex Enterprises", "RETAIL", "REG-MTR-123", "27AAAAA0000A1Z5",
                "biz@mtr-apex.com", "+91-9876543320", "Shop 1", "Market Road",
                "Mumbai", "Maharashtra", "400001", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bizReq)));

        InstrumentCreateRequest instReq = new InstrumentCreateRequest(
                "Counter Scale", InstrumentType.DIGITAL_WEIGHING_SCALE, "Essae", "DS-215",
                "SN-MTR-001", new BigDecimal("30.00"), CapacityUnit.KG,
                new BigDecimal("1.00"), AccuracyUnit.G, 2024, LocalDate.of(2024, 1, 1), "Counter 1"
        );
        MvcResult instRes = mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(instReq))).andReturn();
        Long instId = objectMapper.readTree(instRes.getResponse().getContentAsString()).get("id").asLong();

        // 3. Officers 1 & 2
        String off1Email = "meas_off1@scaleguard.com";
        OfficerProfile off1Profile = officerProfileRepository.findByOfficerCode("LMO-MTR-001").orElse(null);
        Long officer1Id;
        if (off1Profile == null) {
            OfficerCreateRequest off1Req = new OfficerCreateRequest(
                    "Officer One", off1Email, "Officer@123", "LMO-MTR-001",
                    "Senior Inspector", "Legal Metrology", "Mumbai", "+91-9876543311"
            );
            MvcResult off1Res = mockMvc.perform(post("/api/admin/officers")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(off1Req))).andReturn();
            officer1Id = objectMapper.readTree(off1Res.getResponse().getContentAsString()).get("id").asLong();
        } else {
            officer1Id = off1Profile.getId();
        }

        String off2Email = "meas_off2@scaleguard.com";
        OfficerProfile off2Profile = officerProfileRepository.findByOfficerCode("LMO-MTR-002").orElse(null);
        if (off2Profile == null) {
            OfficerCreateRequest off2Req = new OfficerCreateRequest(
                    "Officer Two", off2Email, "Officer@123", "LMO-MTR-002",
                    "Junior Inspector", "Legal Metrology", "Pune", "+91-9876543312"
            );
            mockMvc.perform(post("/api/admin/officers")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(off2Req)));
        }

        LoginRequest off1Login = new LoginRequest(off1Email, "Officer@123");
        MvcResult off1LoginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(off1Login))).andReturn();
        officer1Token = objectMapper.readTree(off1LoginRes.getResponse().getContentAsString()).get("accessToken").asText();

        LoginRequest off2Login = new LoginRequest(off2Email, "Officer@123");
        MvcResult off2LoginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(off2Login))).andReturn();
        officer2Token = objectMapper.readTree(off2LoginRes.getResponse().getContentAsString()).get("accessToken").asText();

        // 4. Create Applications and Inspections
        // App 1 -> Active inspection (IN_PROGRESS)
        VerificationApplicationCreateRequest vaReq1 = new VerificationApplicationCreateRequest(
                instId, ApplicationType.INITIAL_VERIFICATION, "Initial check",
                LocalDate.now(), LocalDate.now().plusDays(5), "Urgent"
        );
        MvcResult vaRes1 = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vaReq1))).andReturn();
        Long app1Id = objectMapper.readTree(vaRes1.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/verification-applications/" + app1Id + "/submit")
                .header("Authorization", "Bearer " + boToken));

        mockMvc.perform(post("/api/admin/verification-applications/" + app1Id + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(officer1Id))));

        InspectionCreateRequest icReq1 = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2), "Apex Facility", "Initial test inspection"
        );
        MvcResult inspRes1 = mockMvc.perform(post("/api/officer/verification-applications/" + app1Id + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(icReq1))).andReturn();
        activeInspectionId = objectMapper.readTree(inspRes1.getResponse().getContentAsString()).get("id").asLong();

        // Move activeInspection to IN_PROGRESS
        mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/start")
                .header("Authorization", "Bearer " + officer1Token));

        // App 2 -> Scheduled inspection (not yet IN_PROGRESS)
        VerificationApplicationCreateRequest vaReq2 = new VerificationApplicationCreateRequest(
                instId, ApplicationType.RE_VERIFICATION, "Annual check",
                LocalDate.now(), LocalDate.now().plusDays(5), "Scheduled"
        );
        MvcResult vaRes2 = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vaReq2))).andReturn();
        Long app2Id = objectMapper.readTree(vaRes2.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/verification-applications/" + app2Id + "/submit")
                .header("Authorization", "Bearer " + boToken));

        mockMvc.perform(post("/api/admin/verification-applications/" + app2Id + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(officer1Id))));

        InspectionCreateRequest icReq2 = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(5), "Apex Facility", "Scheduled test"
        );
        MvcResult inspRes2 = mockMvc.perform(post("/api/officer/verification-applications/" + app2Id + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(icReq2))).andReturn();
        scheduledInspectionId = objectMapper.readTree(inspRes2.getResponse().getContentAsString()).get("id").asLong();
    }

    @AfterEach
    void tearDown() {
        recordRepository.deleteAll();
        sessionRepository.deleteAll();
        inspectionRepository.deleteAll();
    }

    @Test
    @DisplayName("Should allow assigned officer to start measurement testing session")
    void testStartMeasurementTestSession_Success() throws Exception {
        mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.inspectionId", is(activeInspectionId.intValue())))
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.startedAt", notNullValue()))
                .andExpect(jsonPath("$.completedAt", nullValue()))
                .andExpect(jsonPath("$.totalRecords", is(0)));
    }

    @Test
    @DisplayName("Should reject starting measurement testing if inspection is not IN_PROGRESS")
    void testStartMeasurementTestSession_InvalidInspectionStatus() throws Exception {
        mockMvc.perform(post("/api/officer/inspections/" + scheduledInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Measurement testing can only be started while inspection is in progress.")));
    }

    @Test
    @DisplayName("Should prevent starting duplicate measurement testing session")
    void testStartMeasurementTestSession_DuplicateConflict() throws Exception {
        // Start once
        mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated());

        // Start again
        mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Measurement testing has already been started for this inspection.")));
    }

    @Test
    @DisplayName("Should isolate measurement testing from other officers (ownership 404)")
    void testStartMeasurementTestSession_OwnershipIsolation() throws Exception {
        mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer2Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should add measurement record and calculate errors accurately using BigDecimal")
    void testAddMeasurementRecord_SuccessAndCalculations() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        // 1st record: Standard 10.000, Observed 10.020 -> Error +0.020000, % Error +0.200000%
        MeasurementTestRecordCreateRequest r1 = new MeasurementTestRecordCreateRequest(
                new BigDecimal("10.000"), new BigDecimal("10.020"), "kg", "First calibration point"
        );
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.testPoint", is(1)))
                .andExpect(jsonPath("$.standardValue", is(10.0)))
                .andExpect(jsonPath("$.observedValue", is(10.02)))
                .andExpect(jsonPath("$.errorValue", is(0.02)))
                .andExpect(jsonPath("$.percentageError", is(0.2)))
                .andExpect(jsonPath("$.unit", is("kg")))
                .andExpect(jsonPath("$.remarks", is("First calibration point")));

        // 2nd record: Standard 20.000, Observed 19.980 -> Error -0.020000, % Error -0.100000%
        MeasurementTestRecordCreateRequest r2 = new MeasurementTestRecordCreateRequest(
                new BigDecimal("20.000"), new BigDecimal("19.980"), "kg", "Second test point"
        );
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.testPoint", is(2)))
                .andExpect(jsonPath("$.errorValue", is(-0.02)))
                .andExpect(jsonPath("$.percentageError", is(-0.1)));

        // Verify session summary
        mockMvc.perform(get("/api/officer/inspections/" + activeInspectionId + "/measurement-tests")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", is(2)))
                .andExpect(jsonPath("$.records", hasSize(2)))
                .andExpect(jsonPath("$.maximumAbsoluteError", is(0.02)))
                .andExpect(jsonPath("$.averagePercentageError", is(0.15)));
    }

    @Test
    @DisplayName("Should reject invalid record inputs: zero or negative standard, negative observed")
    void testAddMeasurementRecord_Validations() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        // Standard = 0
        MeasurementTestRecordCreateRequest zeroStd = new MeasurementTestRecordCreateRequest(
                BigDecimal.ZERO, new BigDecimal("10.000"), "kg", "Zero test"
        );
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(zeroStd)))
                .andExpect(status().isBadRequest());

        // Observed < 0
        MeasurementTestRecordCreateRequest negObs = new MeasurementTestRecordCreateRequest(
                new BigDecimal("10.000"), new BigDecimal("-1.000"), "kg", "Negative test"
        );
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(negObs)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update test record and correctly recalculate error values")
    void testUpdateMeasurementRecord_Success() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        MeasurementTestRecordCreateRequest r1 = new MeasurementTestRecordCreateRequest(
                new BigDecimal("10.000"), new BigDecimal("10.020"), "kg", "Initial"
        );
        MvcResult recRes = mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(r1)))
                .andExpect(status().isCreated()).andReturn();
        Long recordId = objectMapper.readTree(recRes.getResponse().getContentAsString()).get("id").asLong();

        // Update to standard: 10.000, observed: 10.050 -> error: 0.050, % error: 0.5%
        MeasurementTestRecordUpdateRequest updateReq = new MeasurementTestRecordUpdateRequest(
                new BigDecimal("10.000"), new BigDecimal("10.050"), "kg", "Corrected value"
        );
        mockMvc.perform(patch("/api/officer/measurement-tests/records/" + recordId)
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errorValue", is(0.05)))
                .andExpect(jsonPath("$.percentageError", is(0.5)))
                .andExpect(jsonPath("$.remarks", is("Corrected value")));
    }

    @Test
    @DisplayName("Should delete record and preserve test point numbers of other records")
    void testDeleteMeasurementRecord_PreservesNumbering() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        // Add point 1
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("10.000"), new BigDecimal("10.010"), "kg", "Point 1"))))
                .andExpect(status().isCreated());

        // Add point 2
        MvcResult r2Res = mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("20.000"), new BigDecimal("20.020"), "kg", "Point 2"))))
                .andExpect(status().isCreated()).andReturn();
        Long r2Id = objectMapper.readTree(r2Res.getResponse().getContentAsString()).get("id").asLong();

        // Add point 3
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("30.000"), new BigDecimal("30.030"), "kg", "Point 3"))))
                .andExpect(status().isCreated());

        // Delete point 2
        mockMvc.perform(delete("/api/officer/measurement-tests/records/" + r2Id)
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isNoContent());

        // Verify remaining test points are 1 and 3 (not renumbered)
        mockMvc.perform(get("/api/officer/inspections/" + activeInspectionId + "/measurement-tests")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRecords", is(2)))
                .andExpect(jsonPath("$.records[0].testPoint", is(1)))
                .andExpect(jsonPath("$.records[1].testPoint", is(3)));
    }

    @Test
    @DisplayName("Should update overall remarks")
    void testUpdateOverallRemarks_Success() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        MeasurementTestRemarksUpdateRequest remarksReq = new MeasurementTestRemarksUpdateRequest(
                "All test points fall within permissible MPE limits."
        );
        mockMvc.perform(patch("/api/officer/measurement-tests/" + sessionId + "/remarks")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(remarksReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallRemarks", is("All test points fall within permissible MPE limits.")));
    }

    @Test
    @DisplayName("Should complete measurement testing, lock edits, but keep inspection IN_PROGRESS")
    void testCompleteMeasurementTesting_FlowAndLocking() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        // Attempt completion with 0 records -> Should fail 400
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/complete")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("At least one measurement test record is required")));

        // Add 1 record
        MvcResult recRes = mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("10.000"), new BigDecimal("10.005"), "kg", "Within tolerance"))))
                .andExpect(status().isCreated()).andReturn();
        Long recId = objectMapper.readTree(recRes.getResponse().getContentAsString()).get("id").asLong();

        // Complete session
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/complete")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.completedAt", notNullValue()));

        // Check inspection is STILL IN_PROGRESS (decoupled)
        Inspection insp = inspectionRepository.findById(activeInspectionId).orElseThrow();
        assertEquals(InspectionStatus.IN_PROGRESS, insp.getStatus(), "Inspection must remain IN_PROGRESS after testing completes");

        // Verify edits/additions/deletions are now locked (409 Conflict)
        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("15.000"), new BigDecimal("15.000"), "kg", "Post completion"))))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/officer/measurement-tests/records/" + recId)
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordUpdateRequest(
                        new BigDecimal("10.000"), new BigDecimal("10.002"), "kg", "Post update"))))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/officer/measurement-tests/records/" + recId)
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/officer/measurement-tests/" + sessionId + "/remarks")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRemarksUpdateRequest("New remarks"))))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Should allow Admin to view results (read-only) and deny Business Owner (403)")
    void testAdminAndBusinessOwnerAccess() throws Exception {
        MvcResult startRes = mockMvc.perform(post("/api/officer/inspections/" + activeInspectionId + "/measurement-tests/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isCreated()).andReturn();
        Long sessionId = objectMapper.readTree(startRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/officer/measurement-tests/" + sessionId + "/records")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new MeasurementTestRecordCreateRequest(
                        new BigDecimal("10.000"), new BigDecimal("10.010"), "kg", "Check"))))
                .andExpect(status().isCreated());

        // Admin can view
        mockMvc.perform(get("/api/admin/inspections/" + activeInspectionId + "/measurement-tests")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sessionId.intValue())))
                .andExpect(jsonPath("$.records", hasSize(1)));

        // Business owner is forbidden (403)
        mockMvc.perform(get("/api/admin/inspections/" + activeInspectionId + "/measurement-tests")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/officer/inspections/" + activeInspectionId + "/measurement-tests")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isForbidden());

        // Unauthenticated is 401
        mockMvc.perform(get("/api/officer/inspections/" + activeInspectionId + "/measurement-tests"))
                .andExpect(status().isUnauthorized());
    }
}
