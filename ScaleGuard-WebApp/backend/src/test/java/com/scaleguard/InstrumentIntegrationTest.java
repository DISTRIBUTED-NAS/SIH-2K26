package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.*;
import com.scaleguard.entity.AccuracyUnit;
import com.scaleguard.entity.CapacityUnit;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.InstrumentRepository;
import com.scaleguard.repository.UserRepository;
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
public class InstrumentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    private String officerToken;

    @BeforeEach
    void setUp() throws Exception {
        instrumentRepository.deleteAll();
        businessRepository.deleteAll();

        // 1. Setup Business Owner 1
        String bo1Email = "owner1@instruments.test";
        if (!userRepository.existsByEmail(bo1Email)) {
            RegisterRequest reg = new RegisterRequest("Owner One", bo1Email, "9876543210", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        bo1Token = loginAndGetToken(bo1Email, "Password@123");

        // Create Business Profile for BO1
        BusinessCreateRequest biz1 = new BusinessCreateRequest(
                "Precision Tech Scales", "Manufacturing", "REG-001", "24AAACG1234F1Z5",
                "info@precisiontech.in", "9876543210", "Plot 1", "GIDC", "Ahmedabad", "Gujarat", "380001", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(biz1)));

        // 2. Setup Business Owner 2
        String bo2Email = "owner2@instruments.test";
        if (!userRepository.existsByEmail(bo2Email)) {
            RegisterRequest reg = new RegisterRequest("Owner Two", bo2Email, "9876543211", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        bo2Token = loginAndGetToken(bo2Email, "Password@123");

        // Create Business Profile for BO2
        BusinessCreateRequest biz2 = new BusinessCreateRequest(
                "Apex Weight Labs", "Testing", "REG-002", "24AAACG1234F1Z5",
                "info@apexlabs.in", "9876543211", "Plot 2", "GIDC", "Surat", "Gujarat", "395001", "India"
        );
        mockMvc.perform(post("/api/businesses")
                .header("Authorization", "Bearer " + bo2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(biz2)));

        // 3. Setup Business Owner with NO profile
        String noProfileEmail = "noprofile@instruments.test";
        if (!userRepository.existsByEmail(noProfileEmail)) {
            RegisterRequest reg = new RegisterRequest("No Profile User", noProfileEmail, "9876543219", "Password@123", "Password@123");
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(reg)));
        }
        boNoProfileToken = loginAndGetToken(noProfileEmail, "Password@123");

        // 4. Admin & Officer Tokens
        adminToken = loginAndGetToken("admin@scaleguard.com", "Admin@123");
        officerToken = loginAndGetToken("officer@scaleguard.com", "Officer@123");
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest(email, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        return authResponse.getAccessToken();
    }

    private InstrumentCreateRequest createValidRequest(String serialNumber) {
        return new InstrumentCreateRequest(
                "Digital Platform Scale 500kg",
                InstrumentType.DIGITAL_WEIGHING_SCALE,
                "Avery Weigh-Tronix",
                "ZK830-500",
                serialNumber,
                new BigDecimal("500.0000"),
                CapacityUnit.KG,
                new BigDecimal("0.1000"),
                AccuracyUnit.KG,
                2024,
                LocalDate.of(2024, 5, 10),
                "Warehouse Bay 3"
        );
    }

    @Test
    @DisplayName("1. Successfully create an instrument as Business Owner")
    void createInstrument_Success() throws Exception {
        InstrumentCreateRequest request = createValidRequest("SN-TEST-1001");

        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.instrumentName").value("Digital Platform Scale 500kg"))
                .andExpect(jsonPath("$.instrumentType").value("DIGITAL_WEIGHING_SCALE"))
                .andExpect(jsonPath("$.manufacturer").value("Avery Weigh-Tronix"))
                .andExpect(jsonPath("$.modelNumber").value("ZK830-500"))
                .andExpect(jsonPath("$.serialNumber").value("SN-TEST-1001"))
                .andExpect(jsonPath("$.capacity").value(500.0))
                .andExpect(jsonPath("$.capacityUnit").value("KG"))
                .andExpect(jsonPath("$.accuracy").value(0.1))
                .andExpect(jsonPath("$.accuracyUnit").value("KG"))
                .andExpect(jsonPath("$.manufacturingYear").value(2024))
                .andExpect(jsonPath("$.purchaseDate").value("2024-05-10"))
                .andExpect(jsonPath("$.location").value("Warehouse Bay 3"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.businessId").exists())
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("2. Create instrument without business profile returns 400 Bad Request")
    void createInstrument_WithoutBusinessProfile_Returns400() throws Exception {
        InstrumentCreateRequest request = createValidRequest("SN-TEST-NOPROFILE");

        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + boNoProfileToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Business profile must be created before registering instruments."));
    }

    @Test
    @DisplayName("3. Create instrument with duplicate serial number returns 409 Conflict")
    void createInstrument_DuplicateSerialNumber_Returns409() throws Exception {
        InstrumentCreateRequest req1 = createValidRequest("SN-DUPLICATE-001");
        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        // BO2 attempts to use same serial number
        InstrumentCreateRequest req2 = createValidRequest("SN-DUPLICATE-001");
        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("An instrument with this serial number already exists."));
    }

    @Test
    @DisplayName("4. Get all instruments belonging to current business owner")
    void getMyInstruments_Success() throws Exception {
        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-BO1-A"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-BO1-B"))))
                .andExpect(status().isCreated());

        // BO2 registers an instrument
        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-BO2-A"))))
                .andExpect(status().isCreated());

        // BO1 fetches own instruments -> should only see 2 instruments
        mockMvc.perform(get("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].serialNumber", isOneOf("SN-BO1-A", "SN-BO1-B")))
                .andExpect(jsonPath("$[1].serialNumber", isOneOf("SN-BO1-A", "SN-BO1-B")));
    }

    @Test
    @DisplayName("5. Search and filter own instruments by status and type")
    void getMyInstruments_WithFilters() throws Exception {
        InstrumentCreateRequest digital = createValidRequest("SN-SEARCH-DIGITAL");
        digital.setInstrumentName("High Precision Scale");
        mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(digital)));

        InstrumentCreateRequest mechanical = createValidRequest("SN-SEARCH-MECH");
        mechanical.setInstrumentName("Heavy Mechanical Counter");
        mechanical.setInstrumentType(InstrumentType.MECHANICAL_WEIGHING_SCALE);
        mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mechanical)));

        // Search by text "Precision"
        mockMvc.perform(get("/api/instruments?search=precision")
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].serialNumber").value("SN-SEARCH-DIGITAL"));

        // Filter by InstrumentType MECHANICAL_WEIGHING_SCALE
        mockMvc.perform(get("/api/instruments?instrumentType=MECHANICAL_WEIGHING_SCALE")
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].serialNumber").value("SN-SEARCH-MECH"));
    }

    @Test
    @DisplayName("6. Get single instrument by ID for current owner")
    void getMyInstrumentById_Success() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-GET-01"))))
                .andExpect(status().isCreated())
                .andReturn();

        InstrumentResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), InstrumentResponse.class);

        mockMvc.perform(get("/api/instruments/" + created.getId())
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.serialNumber").value("SN-GET-01"));
    }

    @Test
    @DisplayName("7. Accessing another owner's instrument returns 404 Not Found")
    void getMyInstrumentById_OtherOwner_Returns404() throws Exception {
        // BO2 creates instrument
        MvcResult res = mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-BO2-ISOLATE"))))
                .andExpect(status().isCreated())
                .andReturn();

        InstrumentResponse bo2Instrument = objectMapper.readValue(res.getResponse().getContentAsString(), InstrumentResponse.class);

        // BO1 tries to access BO2's instrument
        mockMvc.perform(get("/api/instruments/" + bo2Instrument.getId())
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Instrument not found"));
    }

    @Test
    @DisplayName("8. Update own instrument successfully")
    void updateMyInstrument_Success() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-UPDATE-01"))))
                .andExpect(status().isCreated())
                .andReturn();

        InstrumentResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), InstrumentResponse.class);

        InstrumentUpdateRequest updateReq = new InstrumentUpdateRequest(
                "Upgraded Platform Scale 600kg",
                InstrumentType.PLATFORM_SCALE,
                "Avery Weigh-Tronix",
                "ZK830-600-V2",
                "SN-UPDATE-01",
                new BigDecimal("600.0000"),
                CapacityUnit.KG,
                new BigDecimal("0.0500"),
                AccuracyUnit.KG,
                2024,
                LocalDate.of(2024, 6, 1),
                "Quality Inspection Bay"
        );

        mockMvc.perform(put("/api/instruments/" + created.getId())
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instrumentName").value("Upgraded Platform Scale 600kg"))
                .andExpect(jsonPath("$.instrumentType").value("PLATFORM_SCALE"))
                .andExpect(jsonPath("$.capacity").value(600.0))
                .andExpect(jsonPath("$.location").value("Quality Inspection Bay"));
    }

    @Test
    @DisplayName("9. Update instrument status to INACTIVE via PATCH /api/instruments/{id}/status")
    void updateMyInstrumentStatus_Success() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-STATUS-01"))))
                .andExpect(status().isCreated())
                .andReturn();

        InstrumentResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), InstrumentResponse.class);

        InstrumentStatusUpdateRequest statusReq = new InstrumentStatusUpdateRequest(InstrumentStatus.INACTIVE);

        mockMvc.perform(patch("/api/instruments/" + created.getId() + "/status")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    @DisplayName("10. Admin view all instruments across businesses with business summary")
    void getAllInstruments_Admin_Success() throws Exception {
        mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createValidRequest("SN-ADMIN-BO1"))));

        mockMvc.perform(post("/api/instruments")
                .header("Authorization", "Bearer " + bo2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createValidRequest("SN-ADMIN-BO2"))));

        mockMvc.perform(get("/api/admin/instruments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].businessName", hasItems("Precision Tech Scales", "Apex Weight Labs")))
                .andExpect(jsonPath("$[*].businessCity", hasItems("Ahmedabad", "Surat")));
    }

    @Test
    @DisplayName("11. Admin view single instrument details by ID")
    void getInstrumentById_Admin_Success() throws Exception {
        MvcResult res = mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-ADMIN-SINGLE"))))
                .andExpect(status().isCreated())
                .andReturn();

        InstrumentResponse created = objectMapper.readValue(res.getResponse().getContentAsString(), InstrumentResponse.class);

        mockMvc.perform(get("/api/admin/instruments/" + created.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.businessName").value("Precision Tech Scales"))
                .andExpect(jsonPath("$.businessCity").value("Ahmedabad"));
    }

    @Test
    @DisplayName("12. RBAC: Business Owner cannot access admin instrument endpoints")
    void rbac_BusinessOwnerAccessingAdminRoute_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/instruments")
                        .header("Authorization", "Bearer " + bo1Token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("13. RBAC: Admin cannot create instruments")
    void rbac_AdminCreatingInstrument_Returns403() throws Exception {
        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createValidRequest("SN-ADMIN-FAIL"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("14. RBAC: Officer cannot access business owner instrument endpoints")
    void rbac_OfficerAccessingBusinessRoute_Returns403() throws Exception {
        mockMvc.perform(get("/api/instruments")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("15. Unauthenticated request to instruments returns 401 Unauthorized")
    void unauthenticatedAccess_Returns401() throws Exception {
        mockMvc.perform(get("/api/instruments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("16. Validation error: Capacity <= 0 returns 400 Bad Request")
    void validation_CapacityZero_Returns400() throws Exception {
        InstrumentCreateRequest req = createValidRequest("SN-ZERO-CAP");
        req.setCapacity(BigDecimal.ZERO);

        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.capacity").exists());
    }

    @Test
    @DisplayName("17. Validation error: Future purchase date returns 400 Bad Request")
    void validation_FuturePurchaseDate_Returns400() throws Exception {
        InstrumentCreateRequest req = createValidRequest("SN-FUTURE-DATE");
        req.setPurchaseDate(LocalDate.now().plusDays(5));

        mockMvc.perform(post("/api/instruments")
                        .header("Authorization", "Bearer " + bo1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.purchaseDate").exists());
    }
}
