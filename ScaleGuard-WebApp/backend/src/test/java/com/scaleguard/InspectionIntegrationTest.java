package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.*;
import com.scaleguard.entity.*;
import com.scaleguard.repository.*;
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
public class InspectionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    private Long officer1Id;
    private Long officer2Id;
    private Long assignedAppId;

    @BeforeEach
    void setUp() throws Exception {
        inspectionRepository.deleteAll();
        applicationRepository.deleteAll();
        instrumentRepository.deleteAll();
        businessRepository.deleteAll();

        // 1. Seed Admin
        String adminEmail = "insp_admin@scaleguard.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            RegisterRequest adminReg = new RegisterRequest("Admin User", adminEmail, "+91-9876543210", "Admin@123", "Admin@123");
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

        // 2. Seed Business Owner + Business + Instrument
        String boEmail = "insp_bo@test.com";
        if (!userRepository.existsByEmail(boEmail)) {
            RegisterRequest boReg = new RegisterRequest("Business Owner", boEmail, "+91-9876543220", "Password@123", "Password@123");
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
                "Apex Enterprises", "RETAIL", "REG-INSP-123", "27AAAAA0000A1Z5",
                "biz@apex.com", "+91-9876543220", "Shop 1", "Market Road",
                "Mumbai", "Maharashtra", "400001", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bizReq)));

        InstrumentCreateRequest instReq = new InstrumentCreateRequest(
                "Counter Scale", InstrumentType.DIGITAL_WEIGHING_SCALE, "Essae", "DS-215",
                "SN-INSP-001", new BigDecimal("30.00"), CapacityUnit.KG,
                new BigDecimal("1.00"), AccuracyUnit.G, 2024, LocalDate.of(2024, 1, 1), "Counter 1"
        );
        MvcResult instRes = mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(instReq))).andReturn();
        Long instId = objectMapper.readTree(instRes.getResponse().getContentAsString()).get("id").asLong();

        // 3. Create Verification Application & Submit it
        VerificationApplicationCreateRequest appReq = new VerificationApplicationCreateRequest(
                instId, ApplicationType.INITIAL_VERIFICATION, "Annual legal certification",
                LocalDate.now(), LocalDate.now().plusDays(5), "Urgent verification"
        );
        MvcResult appRes = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appReq))).andReturn();
        assignedAppId = objectMapper.readTree(appRes.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(patch("/api/verification-applications/" + assignedAppId + "/submit")
                .header("Authorization", "Bearer " + boToken));

        // 4. Create Two Officers if not already created
        String off1Email = "insp_officer1@scaleguard.com";
        OfficerProfile off1Profile = officerProfileRepository.findByOfficerCode("LMO-INSP-001").orElse(null);
        if (off1Profile == null) {
            OfficerCreateRequest off1Req = new OfficerCreateRequest(
                    "Officer One", off1Email, "Officer@123", "LMO-INSP-001",
                    "Senior Inspector", "Legal Metrology", "Mumbai", "+91-9876543211"
            );
            MvcResult off1Res = mockMvc.perform(post("/api/admin/officers")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(off1Req))).andReturn();
            officer1Id = objectMapper.readTree(off1Res.getResponse().getContentAsString()).get("id").asLong();
        } else {
            officer1Id = off1Profile.getId();
        }

        String off2Email = "insp_officer2@scaleguard.com";
        OfficerProfile off2Profile = officerProfileRepository.findByOfficerCode("LMO-INSP-002").orElse(null);
        if (off2Profile == null) {
            OfficerCreateRequest off2Req = new OfficerCreateRequest(
                    "Officer Two", off2Email, "Officer@123", "LMO-INSP-002",
                    "Junior Inspector", "Legal Metrology", "Pune", "+91-9876543212"
            );
            MvcResult off2Res = mockMvc.perform(post("/api/admin/officers")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(off2Req))).andReturn();
            officer2Id = objectMapper.readTree(off2Res.getResponse().getContentAsString()).get("id").asLong();
        } else {
            officer2Id = off2Profile.getId();
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

        // 5. Admin Assigns Officer 1 to the Application
        OfficerAssignmentRequest assignReq = new OfficerAssignmentRequest(officer1Id);
        mockMvc.perform(post("/api/admin/verification-applications/" + assignedAppId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        inspectionRepository.deleteAll();
    }

    @Test
    @DisplayName("Assigned officer creates inspection successfully with generated number")
    void testCreateInspectionSuccess() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2),
                "Apex Enterprises, Mumbai Shop 1",
                "Initial inspection scheduled."
        );

        mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.inspectionNumber", matchesPattern("^INSP-\\d{4}-\\d{6}$")))
                .andExpect(jsonPath("$.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.location").value("Apex Enterprises, Mumbai Shop 1"))
                .andExpect(jsonPath("$.notes").value("Initial inspection scheduled."))
                .andExpect(jsonPath("$.applicationId").value(assignedAppId));

        // VerificationApplication remains OFFICER_ASSIGNED
        VerificationApplication app = applicationRepository.findById(assignedAppId).orElseThrow();
        assertEquals(ApplicationStatus.OFFICER_ASSIGNED, app.getStatus());
    }

    @Test
    @DisplayName("Reject inspection creation if scheduledAt is in the past")
    void testCreateInspectionPastDateRejected() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().minusDays(1),
                "Shop 1",
                "Past inspection"
        );

        mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Reject inspection creation by non-assigned officer")
    void testCreateInspectionWrongOfficerRejected() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2),
                "Shop 1",
                "Notes"
        );

        // Officer 2 attempts to create inspection for Officer 1's application
        mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Reject duplicate inspection creation for same application")
    void testCreateDuplicateInspectionRejected() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2),
                "Shop 1",
                "First inspection"
        );

        mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Second creation attempt
        mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An inspection already exists for this application."));
    }

    @Test
    @DisplayName("Officer lifecycle: start inspection -> in progress -> notes update -> complete")
    void testInspectionLifecycleFullFlow() throws Exception {
        // 1. Create inspection
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2), "Apex Shop", "Initial"
        );
        MvcResult createRes = mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long inspId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        // 2. Start inspection
        mockMvc.perform(post("/api/officer/inspections/" + inspId + "/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.startedAt").exists());

        // Application status becomes INSPECTION_IN_PROGRESS
        VerificationApplication appStarted = applicationRepository.findById(assignedAppId).orElseThrow();
        assertEquals(ApplicationStatus.INSPECTION_IN_PROGRESS, appStarted.getStatus());

        // Cannot start again
        mockMvc.perform(post("/api/officer/inspections/" + inspId + "/start")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Only scheduled inspections can be started."));

        // 3. Update notes
        InspectionNotesUpdateRequest notesReq = new InspectionNotesUpdateRequest("Calibration seal intact, accuracy tested within tolerance.");
        mockMvc.perform(patch("/api/officer/inspections/" + inspId + "/notes")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").value("Calibration seal intact, accuracy tested within tolerance."));

        // 4. Complete inspection
        mockMvc.perform(post("/api/officer/inspections/" + inspId + "/complete")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedAt").exists());

        // Application status becomes INSPECTION_COMPLETED
        VerificationApplication appCompleted = applicationRepository.findById(assignedAppId).orElseThrow();
        assertEquals(ApplicationStatus.INSPECTION_COMPLETED, appCompleted.getStatus());

        // Cannot update notes when completed
        mockMvc.perform(patch("/api/officer/inspections/" + inspId + "/notes")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notesReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Inspection notes can only be updated while inspection is in progress."));

        // Cannot cancel when completed
        InspectionCancelRequest cancelReq = new InspectionCancelRequest("Late cancellation");
        mockMvc.perform(post("/api/officer/inspections/" + inspId + "/cancel")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Cancel scheduled inspection reverts application to OFFICER_ASSIGNED")
    void testCancelScheduledInspection() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2), "Apex Shop", "Scheduled for visit"
        );
        MvcResult createRes = mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long inspId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        InspectionCancelRequest cancelReq = new InspectionCancelRequest("Business premises was closed during scheduled time.");
        mockMvc.perform(post("/api/officer/inspections/" + inspId + "/cancel")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cancelReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancellationReason").value("Business premises was closed during scheduled time."));

        // Application remains/reverts to OFFICER_ASSIGNED
        VerificationApplication app = applicationRepository.findById(assignedAppId).orElseThrow();
        assertEquals(ApplicationStatus.OFFICER_ASSIGNED, app.getStatus());
    }

    @Test
    @DisplayName("Officer cannot access another officer's inspection")
    void testOfficerIsolation() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2), "Apex Shop", "Notes"
        );
        MvcResult createRes = mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long inspId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        // Officer 2 attempts to get inspection details -> 404
        mockMvc.perform(get("/api/officer/inspections/" + inspId)
                .header("Authorization", "Bearer " + officer2Token))
                .andExpect(status().isNotFound());

        // Officer 2 list does not include Officer 1's inspection
        mockMvc.perform(get("/api/officer/inspections")
                .header("Authorization", "Bearer " + officer2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Officer 1 list includes inspection
        mockMvc.perform(get("/api/officer/inspections")
                .header("Authorization", "Bearer " + officer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(inspId));
    }

    @Test
    @DisplayName("Admin can view all inspections and inspection details with search & filters")
    void testAdminInspectionsMonitoring() throws Exception {
        InspectionCreateRequest req = new InspectionCreateRequest(
                LocalDateTime.now().plusDays(2), "Apex Shop Market", "Notes"
        );
        MvcResult createRes = mockMvc.perform(post("/api/officer/verification-applications/" + assignedAppId + "/inspection")
                .header("Authorization", "Bearer " + officer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();
        Long inspId = objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asLong();

        // Admin lists all inspections
        mockMvc.perform(get("/api/admin/inspections")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(inspId))
                .andExpect(jsonPath("$[0].businessName").value("Apex Enterprises"));

        // Admin filters by status
        mockMvc.perform(get("/api/admin/inspections?status=SCHEDULED")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/admin/inspections?status=COMPLETED")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Admin search matching business name
        mockMvc.perform(get("/api/admin/inspections?search=Apex")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Admin views details
        mockMvc.perform(get("/api/admin/inspections/" + inspId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(inspId))
                .andExpect(jsonPath("$.officerName").value("Officer One"))
                .andExpect(jsonPath("$.instrumentName").value("Counter Scale"))
                .andExpect(jsonPath("$.businessName").value("Apex Enterprises"));
    }

    @Test
    @DisplayName("Role security: unauthenticated -> 401, wrong role -> 403")
    void testRoleSecurity() throws Exception {
        // Unauthenticated -> 401
        mockMvc.perform(get("/api/officer/inspections"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/inspections"))
                .andExpect(status().isUnauthorized());

        // Business Owner accessing officer/admin inspection endpoints -> 403
        mockMvc.perform(get("/api/officer/inspections")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/inspections")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isForbidden());
    }
}
