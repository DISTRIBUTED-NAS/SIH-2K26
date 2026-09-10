package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.*;
import com.scaleguard.entity.*;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.InstrumentRepository;
import com.scaleguard.repository.UserRepository;
import com.scaleguard.repository.VerificationApplicationRepository;
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
public class VerificationApplicationIntegrationTest {

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
    private UserRepository userRepository;

    private String bo1Token;
    private String bo2Token;
    private String boNoProfileToken;
    private String adminToken;
    private Long bo1InstrumentId;
    private Long bo2InstrumentId;

    @BeforeEach
    void setUp() throws Exception {
        applicationRepository.deleteAll();
        instrumentRepository.deleteAll();
        businessRepository.deleteAll();

        // 1. Setup Business Owner 1
        String bo1Email = "appowner1@scaleguard.test";
        if (!userRepository.existsByEmail(bo1Email)) {
            RegisterRequest reg = new RegisterRequest("App Owner One", bo1Email, "9876543210", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        bo1Token = loginAndGetToken(bo1Email, "Password@123");

        // Create Business Profile for BO1
        BusinessCreateRequest biz1 = new BusinessCreateRequest(
                "Gujarat Precision Scales", "Manufacturing", "REG-APP-001", "24AAACG1234F1Z5",
                "info@gujaratscales.test", "9876543210", "Plot 100", "GIDC Estate", "Gandhinagar", "Gujarat", "382010", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(biz1)));

        // Create Instrument for BO1
        InstrumentCreateRequest inst1 = new InstrumentCreateRequest(
                "Platform Scale Alpha", InstrumentType.PLATFORM_SCALE, "Essae Scales", "ES-300",
                "SN-TEST-APP-001", new BigDecimal("300.0000"), CapacityUnit.KG, new BigDecimal("0.0500"), AccuracyUnit.KG,
                2023, LocalDate.of(2023, 1, 15), "Warehouse Bay 1"
        );
        MvcResult inst1Res = mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inst1)))
                .andExpect(status().isCreated())
                .andReturn();
        InstrumentResponse inst1Dto = objectMapper.readValue(inst1Res.getResponse().getContentAsString(), InstrumentResponse.class);
        bo1InstrumentId = inst1Dto.getId();

        // 2. Setup Business Owner 2
        String bo2Email = "appowner2@scaleguard.test";
        if (!userRepository.existsByEmail(bo2Email)) {
            RegisterRequest reg = new RegisterRequest("App Owner Two", bo2Email, "9876543211", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        bo2Token = loginAndGetToken(bo2Email, "Password@123");

        BusinessCreateRequest biz2 = new BusinessCreateRequest(
                "Sardar Metrology Works", "Calibration", "REG-APP-002", "24BBBCC2345G2Z6",
                "contact@sardarmetrology.test", "9876543211", "Plot 200", "Sector 24", "Gandhinagar", "Gujarat", "382024", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + bo2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(biz2)));

        InstrumentCreateRequest inst2 = new InstrumentCreateRequest(
                "Weigh Scale Titan", InstrumentType.DIGITAL_WEIGHING_SCALE, "Avery Weigh-Tronix", "WB-60T",
                "SN-TEST-APP-002", new BigDecimal("60.0000"), CapacityUnit.KG, new BigDecimal("0.0100"), AccuracyUnit.KG,
                2022, LocalDate.of(2022, 5, 20), "Main Weigh Station"
        );
        MvcResult inst2Res = mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inst2)))
                .andExpect(status().isCreated())
                .andReturn();
        InstrumentResponse inst2Dto = objectMapper.readValue(inst2Res.getResponse().getContentAsString(), InstrumentResponse.class);
        bo2InstrumentId = inst2Dto.getId();

        // 3. Setup BO without business profile
        String noProfileEmail = "noprofileapp@scaleguard.test";
        if (!userRepository.existsByEmail(noProfileEmail)) {
            RegisterRequest reg = new RegisterRequest("No Profile User", noProfileEmail, "9876543212", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        boNoProfileToken = loginAndGetToken(noProfileEmail, "Password@123");

        // 4. Setup Admin Token
        adminToken = loginAndGetToken("admin@scaleguard.com", "Admin@123");
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest req = new LoginRequest(email, password);
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        return auth.getAccessToken();
    }

    @Test
    @DisplayName("Create Draft Application - Success & 6-Digit Format")
    void createApplication_Success() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(7);

        VerificationApplicationCreateRequest req = new VerificationApplicationCreateRequest(
                bo1InstrumentId,
                ApplicationType.INITIAL_VERIFICATION,
                "Initial commercial verification for GIDC warehouse",
                today,
                futureDate,
                "Inspection requested during morning hours 10 AM to 1 PM"
        );

        mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.applicationNumber", matchesPattern("^SG-\\d{4}-\\d{6}$")))
                .andExpect(jsonPath("$.applicationType", is("INITIAL_VERIFICATION")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andExpect(jsonPath("$.purpose", is("Initial commercial verification for GIDC warehouse")))
                .andExpect(jsonPath("$.instrument.id", is(bo1InstrumentId.intValue())))
                .andExpect(jsonPath("$.instrument.instrumentName", is("Platform Scale Alpha")))
                .andExpect(jsonPath("$.instrument.serialNumber", is("SN-TEST-APP-001")))
                .andExpect(jsonPath("$.businessId").exists());
    }

    @Test
    @DisplayName("Create Application - Without Business Profile Returns 400")
    void createApplication_WithoutProfile_Returns400() throws Exception {
        VerificationApplicationCreateRequest req = new VerificationApplicationCreateRequest(
                bo1InstrumentId,
                ApplicationType.INITIAL_VERIFICATION,
                "Initial verification attempt without profile",
                LocalDate.now(),
                LocalDate.now().plusDays(5),
                "Remarks"
        );

        mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + boNoProfileToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Business profile must be created before submitting verification applications.")));
    }

    @Test
    @DisplayName("Create Application - With Other Business Instrument Returns 404")
    void createApplication_WithOtherBusinessInstrument_Returns404() throws Exception {
        // BO1 attempts to create application for BO2's instrument
        VerificationApplicationCreateRequest req = new VerificationApplicationCreateRequest(
                bo2InstrumentId,
                ApplicationType.INITIAL_VERIFICATION,
                "Attempting cross business instrument application",
                LocalDate.now(),
                LocalDate.now().plusDays(5),
                null
        );

        mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Instrument not found.")));
    }

    @Test
    @DisplayName("Create Application - Preferred Date Before Requested Date Returns 400")
    void createApplication_InvalidDates_Returns400() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate pastDate = today.minusDays(2);

        VerificationApplicationCreateRequest req = new VerificationApplicationCreateRequest(
                bo1InstrumentId,
                ApplicationType.INITIAL_VERIFICATION,
                "Invalid dates test",
                today,
                pastDate,
                null
        );

        mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Preferred inspection date cannot be before requested date.")));
    }

    @Test
    @DisplayName("Get My Applications - Tenant Isolation & Filter")
    void getMyApplications_IsolationAndFiltering() throws Exception {
        // Create 2 applications for BO1
        createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "App 1 BO1");
        createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.PERIODIC_VERIFICATION, "App 2 BO1");

        // Create 1 application for BO2
        createAppHelper(bo2Token, bo2InstrumentId, ApplicationType.RE_VERIFICATION, "App 1 BO2");

        // BO1 should only see 2 applications
        mockMvc.perform(get("/api/verification-applications")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].purpose", containsString("BO1")))
                .andExpect(jsonPath("$[1].purpose", containsString("BO1")));

        // Filter by type for BO1
        mockMvc.perform(get("/api/verification-applications?applicationType=INITIAL_VERIFICATION")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].applicationType", is("INITIAL_VERIFICATION")));
    }

    @Test
    @DisplayName("Get Single Application - Cross Owner Access Returns 404")
    void getSingleApplication_CrossOwnerAccess_Returns404() throws Exception {
        VerificationApplicationResponse bo2App = createAppHelper(bo2Token, bo2InstrumentId, ApplicationType.INITIAL_VERIFICATION, "Secret BO2 App");

        // BO1 tries to get BO2's application
        mockMvc.perform(get("/api/verification-applications/" + bo2App.getId())
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Verification application not found.")));
    }

    @Test
    @DisplayName("Update DRAFT Application - Success")
    void updateDraftApplication_Success() throws Exception {
        VerificationApplicationResponse draftApp = createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "Initial Purpose");

        VerificationApplicationUpdateRequest updateReq = new VerificationApplicationUpdateRequest(
                bo1InstrumentId,
                ApplicationType.PERIODIC_VERIFICATION,
                "Updated Periodic Verification Purpose",
                LocalDate.now(),
                LocalDate.now().plusDays(10),
                "Updated remarks"
        );

        mockMvc.perform(put("/api/verification-applications/" + draftApp.getId())
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applicationType", is("PERIODIC_VERIFICATION")))
                .andExpect(jsonPath("$.purpose", is("Updated Periodic Verification Purpose")))
                .andExpect(jsonPath("$.remarks", is("Updated remarks")))
                .andExpect(jsonPath("$.status", is("DRAFT")));
    }

    @Test
    @DisplayName("Submit Application - Lifecycle Transition & Edit/Delete Block")
    void submitApplication_LifecycleTransition_BlocksModification() throws Exception {
        VerificationApplicationResponse app = createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "App to Submit");

        // 1. Submit Application
        mockMvc.perform(patch("/api/verification-applications/" + app.getId() + "/submit")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUBMITTED")));

        // 2. Attempt double submit returns 409 Conflict
        mockMvc.perform(patch("/api/verification-applications/" + app.getId() + "/submit")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Application has already been submitted.")));

        // 3. Attempt editing SUBMITTED application returns 409 Conflict
        VerificationApplicationUpdateRequest updateReq = new VerificationApplicationUpdateRequest(
                bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "Editing Submitted App",
                LocalDate.now(), LocalDate.now().plusDays(5), "Remarks"
        );
        mockMvc.perform(put("/api/verification-applications/" + app.getId())
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Submitted applications cannot be modified.")));

        // 4. Attempt deleting SUBMITTED application returns 409 Conflict
        mockMvc.perform(delete("/api/verification-applications/" + app.getId())
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("Submitted applications cannot be deleted.")));
    }

    @Test
    @DisplayName("Submit Application - Inactive Instrument Returns 400")
    void submitApplication_InactiveInstrument_Returns400() throws Exception {
        // Create draft application
        VerificationApplicationResponse app = createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "App on soon inactive scale");

        // Deactivate instrument
        InstrumentStatusUpdateRequest statusReq = new InstrumentStatusUpdateRequest(InstrumentStatus.INACTIVE);
        mockMvc.perform(patch("/api/instruments/" + bo1InstrumentId + "/status")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("INACTIVE")));

        // Submit should fail with 400 Bad Request
        mockMvc.perform(patch("/api/verification-applications/" + app.getId() + "/submit")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Verification applications can only be submitted for active instruments.")));
    }

    @Test
    @DisplayName("Delete DRAFT Application - Success 204")
    void deleteDraftApplication_Success() throws Exception {
        VerificationApplicationResponse app = createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "App to delete");

        mockMvc.perform(delete("/api/verification-applications/" + app.getId())
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isNoContent());

        // Verify it is gone
        mockMvc.perform(get("/api/verification-applications/" + app.getId())
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Admin - View All Applications with Business Details")
    void admin_ViewAllApplications() throws Exception {
        createAppHelper(bo1Token, bo1InstrumentId, ApplicationType.INITIAL_VERIFICATION, "Admin test app 1");
        createAppHelper(bo2Token, bo2InstrumentId, ApplicationType.PERIODIC_VERIFICATION, "Admin test app 2");

        mockMvc.perform(get("/api/admin/verification-applications")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].businessName").exists())
                .andExpect(jsonPath("$[0].businessGst").exists())
                .andExpect(jsonPath("$[0].instrument.instrumentName").exists());
    }

    @Test
    @DisplayName("RBAC Protection Checks")
    void rbac_Protections() throws Exception {
        // 1. BO cannot access Admin API
        mockMvc.perform(get("/api/admin/verification-applications")
                .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isForbidden());

        // 2. Admin cannot access BO API
        mockMvc.perform(get("/api/verification-applications")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());

        // 3. Unauthenticated access returns 401
        mockMvc.perform(get("/api/verification-applications"))
                .andExpect(status().isUnauthorized());
    }

    private VerificationApplicationResponse createAppHelper(String token, Long instrumentId, ApplicationType type, String purpose) throws Exception {
        VerificationApplicationCreateRequest req = new VerificationApplicationCreateRequest(
                instrumentId,
                type,
                purpose,
                LocalDate.now(),
                LocalDate.now().plusDays(5),
                "Standard remarks"
        );

        MvcResult res = mockMvc.perform(post("/api/verification-applications")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(res.getResponse().getContentAsString(), VerificationApplicationResponse.class);
    }
}
