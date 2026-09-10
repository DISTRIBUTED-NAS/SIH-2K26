package com.scaleguard.config;

import com.scaleguard.entity.Role;
import com.scaleguard.entity.User;
import com.scaleguard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final com.scaleguard.repository.OfficerProfileRepository officerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    public DataInitializer(UserRepository userRepository,
                           com.scaleguard.repository.OfficerProfileRepository officerProfileRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.officerProfileRepository = officerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            logger.info("Seed data initialization is disabled via app.seed.enabled=false");
            return;
        }

        seedAdminUser();
        seedOfficerUser();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@scaleguard.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    "System Administrator",
                    adminEmail,
                    "+91-9876543210",
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN
            );
            userRepository.save(admin);
            logger.info("Created development seed ADMIN user: {}", adminEmail);
        } else {
            logger.debug("Seed ADMIN user already exists: {}", adminEmail);
        }
    }

    private void seedOfficerUser() {
        String officerEmail = "officer@scaleguard.com";
        User officer = userRepository.findByEmail(officerEmail).orElse(null);
        if (officer == null) {
            officer = new User(
                    "LMO Inspection Officer",
                    officerEmail,
                    "+91-9876543211",
                    passwordEncoder.encode("Officer@123"),
                    Role.LMO_OFFICER
            );
            officer = userRepository.save(officer);
            logger.info("Created development seed LMO_OFFICER user: {}", officerEmail);
        } else {
            logger.debug("Seed LMO_OFFICER user already exists: {}", officerEmail);
        }

        if (!officerProfileRepository.existsByOfficerCode("LMO-MH-2024-001")) {
            com.scaleguard.entity.OfficerProfile profile = new com.scaleguard.entity.OfficerProfile(
                    "LMO-MH-2024-001",
                    "Senior Inspector",
                    "Legal Metrology Department",
                    "Mumbai",
                    "+91-9876543211",
                    com.scaleguard.entity.OfficerStatus.ACTIVE,
                    officer
            );
            officerProfileRepository.save(profile);
            logger.info("Created development seed OfficerProfile for: {}", officerEmail);
        }
    }
}
