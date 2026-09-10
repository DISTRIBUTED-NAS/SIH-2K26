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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OfficerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    private Long boInstrumentId;

    @BeforeEach
    void setUp() throws Exception {
        applicationRepository.deleteAll();
        officerProfileRepository.deleteAll();
        instrumentRepository.deleteAll();
        businessRepository.deleteAll();

        // 1. Admin login token
        adminToken = loginAndGetToken("admin@scaleguard.com", "Admin@123");

        // 2. Business Owner setup
        String boEmail = "bo_officer_test@scaleguard.test";
        if (!userRepository.existsByEmail(boEmail)) {
            RegisterRequest reg = new RegisterRequest("Test BO", boEmail, "9876543210", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(reg)));
        }
        boToken = loginAndGetToken(boEmail, "Password@123");

        // Create Business Profile for BO
        BusinessCreateRequest biz = new BusinessCreateRequest(
                "Apex Weighing Industries", "Manufacturing", "REG-OFFICER-001", "24AAACG9999F1Z5",
                "info@apexweighing.test", "9876543210", "Plot 42", "Industrial Area", "Ahmedabad", "Gujarat", "380001", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(biz)));

        // Create Instrument for BO
        InstrumentCreateRequest inst = new InstrumentCreateRequest(
                "Electronic Precision Scale", InstrumentType.DIGITAL_WEIGHING_SCALE, "Avery Weigh-Tronix", "EPS-50",
                "SN-OFF-001", new BigDecimal("50.0000"), CapacityUnit.KG, new BigDecimal("0.0010"), AccuracyUnit.KG,
                2023, LocalDate.of(2023, 3, 10), "Production Line 1"
        );
        MvcResult instRes = mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inst)))
                .andExpect(status().isCreated())
                .andReturn();
        InstrumentResponse instDto = objectMapper.readValue(instRes.getResponse().getContentAsString(), InstrumentResponse.class);
        boInstrumentId = instDto.getId();
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest login = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        return auth.getAccessToken();
    }

    private Long createTestOfficer(String code, String name, String email, String district) throws Exception {
        OfficerCreateRequest req = new OfficerCreateRequest();
        req.setName(name);
        req.setEmail(email);
        req.setPassword("Officer@123");
        req.setOfficerCode(code);
        req.setDesignation("Inspector of Legal Metrology");
        req.setDepartment("Legal Metrology Department");
        req.setDistrict(district);
        req.setPhoneNumber("+91-9123456789");

        MvcResult res = mockMvc.perform(post("/api/admin/officers")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        OfficerResponse dto = objectMapper.readValue(res.getResponse().getContentAsString(), OfficerResponse.class);
        return dto.getId();
    }

    @Test
    @DisplayName("Admin creates officer successfully")
    void testAdminCreateOfficerSuccess() throws Exception {
        OfficerCreateRequest req = new OfficerCreateRequest();
        req.setName("Rajesh Patel");
        req.setEmail("rajesh.patel@lmogov.test");
        req.setPassword("Officer@123");
        req.setOfficerCode("LMO-GUJ-AHM-01");
        req.setDesignation("Inspector of Legal Metrology");
        req.setDepartment("Legal Metrology Department");
        req.setDistrict("Ahmedabad");
        req.setPhoneNumber("+91-9876500001");

        mockMvc.perform(post("/api/admin/officers")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Rajesh Patel")))
                .andExpect(jsonPath("$.email", is("rajesh.patel@lmogov.test")))
                .andExpect(jsonPath("$.officerCode", is("LMO-GUJ-AHM-01")))
                .andExpect(jsonPath("$.designation", is("Inspector of Legal Metrology")))
                .andExpect(jsonPath("$.district", is("Ahmedabad")))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("Admin cannot create officer with duplicate email or officer code")
    void testCreateOfficerDuplicates() throws Exception {
        createTestOfficer("LMO-001", "Officer One", "dup.officer@test.com", "Surat");

        // Duplicate email
        OfficerCreateRequest dupEmailReq = new OfficerCreateRequest();
        dupEmailReq.setName("Officer Two");
        dupEmailReq.setEmail("dup.officer@test.com");
        dupEmailReq.setPassword("Officer@123");
        dupEmailReq.setOfficerCode("LMO-002");
        dupEmailReq.setDesignation("Inspector");
        dupEmailReq.setDepartment("LMD");
        dupEmailReq.setDistrict("Rajkot");
        dupEmailReq.setPhoneNumber("+91-9876500002");

        mockMvc.perform(post("/api/admin/officers")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dupEmailReq)))
                .andExpect(status().isConflict());

        // Duplicate code
        OfficerCreateRequest dupCodeReq = new OfficerCreateRequest();
        dupCodeReq.setName("Officer Three");
        dupCodeReq.setEmail("officer3@test.com");
        dupCodeReq.setPassword("Officer@123");
        dupCodeReq.setOfficerCode("LMO-001");
        dupCodeReq.setDesignation("Inspector");
        dupCodeReq.setDepartment("LMD");
        dupCodeReq.setDistrict("Rajkot");
        dupCodeReq.setPhoneNumber("+91-9876500003");

        mockMvc.perform(post("/api/admin/officers")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dupCodeReq)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Admin lists officers with filter and search")
    void testAdminListOfficers() throws Exception {
        createTestOfficer("LMO-AHM-01", "Amit Shah", "amit@test.com", "Ahmedabad");
        createTestOfficer("LMO-SUR-01", "Sunil Joshi", "sunil@test.com", "Surat");

        // List all
        mockMvc.perform(get("/api/admin/officers")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(2))));

        // Filter by district
        mockMvc.perform(get("/api/admin/officers?district=Ahmedabad")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].district", is("Ahmedabad")));

        // Search by name
        mockMvc.perform(get("/api/admin/officers?search=Sunil")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name", is("Sunil Joshi")));
    }

    @Test
    @DisplayName("Admin updates officer and toggles status")
    void testAdminUpdateOfficerAndStatus() throws Exception {
        Long officerId = createTestOfficer("LMO-UPD-01", "Original Name", "orig@test.com", "Vadodara");

        // Update details
        OfficerUpdateRequest updateReq = new OfficerUpdateRequest();
        updateReq.setName("Updated Name");
        updateReq.setDesignation("Assistant Controller");
        updateReq.setDepartment("Weights & Measures");
        updateReq.setDistrict("Vadodara Urban");
        updateReq.setPhoneNumber("+91-9999988888");

        mockMvc.perform(put("/api/admin/officers/" + officerId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Updated Name")))
                .andExpect(jsonPath("$.designation", is("Assistant Controller")))
                .andExpect(jsonPath("$.district", is("Vadodara Urban")));

        // Deactivate officer
        OfficerStatusUpdateRequest statusReq = new OfficerStatusUpdateRequest(OfficerStatus.INACTIVE);
        mockMvc.perform(patch("/api/admin/officers/" + officerId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));
    }

    @Test
    @DisplayName("Officer Assignment: Assign, Reassign, Inactive Check, Draft Check")
    void testOfficerAssignmentWorkflow() throws Exception {
        Long activeOfficerId1 = createTestOfficer("LMO-ASSIGN-01", "Officer One", "assign1@test.com", "Ahmedabad");
        Long activeOfficerId2 = createTestOfficer("LMO-ASSIGN-02", "Officer Two", "assign2@test.com", "Gandhinagar");
        Long inactiveOfficerId = createTestOfficer("LMO-ASSIGN-03", "Officer Inactive", "inactive@test.com", "Ahmedabad");

        // Mark officer 3 as inactive
        mockMvc.perform(patch("/api/admin/officers/" + inactiveOfficerId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerStatusUpdateRequest(OfficerStatus.INACTIVE))))
                .andExpect(status().isOk());

        // Create application as DRAFT
        VerificationApplicationCreateRequest createReq = new VerificationApplicationCreateRequest(
                boInstrumentId, ApplicationType.INITIAL_VERIFICATION, "New installation verification",
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(12), "Handle with care"
        );
        MvcResult appRes = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        VerificationApplicationResponse appDto = objectMapper.readValue(appRes.getResponse().getContentAsString(), VerificationApplicationResponse.class);
        Long appId = appDto.getId();

        // 1. Attempt assigning to DRAFT application -> Conflict (409)
        mockMvc.perform(post("/api/admin/verification-applications/" + appId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(activeOfficerId1))))
                .andExpect(status().isConflict());

        // Submit application
        mockMvc.perform(patch("/api/verification-applications/" + appId + "/submit")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        // 2. Attempt assigning inactive officer -> Bad Request (400)
        mockMvc.perform(post("/api/admin/verification-applications/" + appId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(inactiveOfficerId))))
                .andExpect(status().isBadRequest());

        // 3. Assign active officer 1 -> Success (200), status OFFICER_ASSIGNED
        mockMvc.perform(post("/api/admin/verification-applications/" + appId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(activeOfficerId1))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationId", is(appId.intValue())))
                .andExpect(jsonPath("$.status", is("OFFICER_ASSIGNED")))
                .andExpect(jsonPath("$.assignedOfficer.id", is(activeOfficerId1.intValue())))
                .andExpect(jsonPath("$.assignedOfficer.officerCode", is("LMO-ASSIGN-01")))
                .andExpect(jsonPath("$.assignedAt", notNullValue()));

        // 4. Reassign officer to officer 2 -> Success (200)
        mockMvc.perform(put("/api/admin/verification-applications/" + appId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(activeOfficerId2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedOfficer.id", is(activeOfficerId2.intValue())))
                .andExpect(jsonPath("$.assignedOfficer.officerCode", is("LMO-ASSIGN-02")));
    }

    @Test
    @DisplayName("Officer Portal: Self-profile, view assigned applications, strict isolation")
    void testOfficerPortalFlow() throws Exception {
        String officerEmail = "portal.officer1@scaleguard.test";
        Long officerId = createTestOfficer("LMO-PORTAL-01", "Vikram Rathore", officerEmail, "Ahmedabad");
        String officerToken = loginAndGetToken(officerEmail, "Officer@123");

        String officer2Email = "portal.officer2@scaleguard.test";
        createTestOfficer("LMO-PORTAL-02", "Ananya Sharma", officer2Email, "Surat");
        String officer2Token = loginAndGetToken(officer2Email, "Officer@123");

        // 1. Officer 1 views profile
        mockMvc.perform(get("/api/officer/profile")
                .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.officerCode", is("LMO-PORTAL-01")))
                .andExpect(jsonPath("$.name", is("Vikram Rathore")))
                .andExpect(jsonPath("$.district", is("Ahmedabad")));

        // Create and submit an application
        VerificationApplicationCreateRequest createReq = new VerificationApplicationCreateRequest(
                boInstrumentId, ApplicationType.PERIODIC_VERIFICATION, "Annual reverification",
                LocalDate.now().plusDays(5), LocalDate.now().plusDays(7), "Calibration weights required"
        );
        MvcResult appRes = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn();
        VerificationApplicationResponse appDto = objectMapper.readValue(appRes.getResponse().getContentAsString(), VerificationApplicationResponse.class);
        Long appId = appDto.getId();

        mockMvc.perform(patch("/api/verification-applications/" + appId + "/submit")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isOk());

        // Assign to Officer 1
        mockMvc.perform(post("/api/admin/verification-applications/" + appId + "/assign-officer")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new OfficerAssignmentRequest(officerId))))
                .andExpect(status().isOk());

        // 2. Officer 1 views assigned applications list
        mockMvc.perform(get("/api/officer/verification-applications")
                .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(appId.intValue())))
                .andExpect(jsonPath("$[0].businessName", is("Apex Weighing Industries")))
                .andExpect(jsonPath("$[0].instrument.serialNumber", is("SN-OFF-001")));

        // 3. Officer 1 views assigned application details
        mockMvc.perform(get("/api/officer/verification-applications/" + appId)
                .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(appId.intValue())))
                .andExpect(jsonPath("$.city", is("Ahmedabad")))
                .andExpect(jsonPath("$.instrument.modelNumber", is("EPS-50")));

        // 4. Isolation: Officer 2 cannot see application assigned to Officer 1
        mockMvc.perform(get("/api/officer/verification-applications")
                .header("Authorization", "Bearer " + officer2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/officer/verification-applications/" + appId)
                .header("Authorization", "Bearer " + officer2Token))
                .andExpect(status().isNotFound());

        // 5. RBAC: Business Owner cannot access officer endpoints (403)
        mockMvc.perform(get("/api/officer/profile")
                .header("Authorization", "Bearer " + boToken))
                .andExpect(status().isForbidden());

        // 6. RBAC: Officer cannot access admin officer endpoints (403)
        mockMvc.perform(get("/api/admin/officers")
                .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isForbidden());
    }
}
