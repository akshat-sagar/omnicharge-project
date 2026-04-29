package com.oprationPlanManagement.operatorPlanService.configuration;

import com.oprationPlanManagement.operatorPlanService.entity.AppUserEntity;
import com.oprationPlanManagement.operatorPlanService.repository.IAppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_USERNAME = "akshatshanu@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Test@123";
    private static final String DEFAULT_ADMIN_ROLE = "ROLE_ADMIN";

    private final IAppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (appUserRepository.findByUsername(DEFAULT_ADMIN_USERNAME).isPresent()) {
            return;
        }

        AppUserEntity adminUser = new AppUserEntity();
        adminUser.setUsername(DEFAULT_ADMIN_USERNAME);
        adminUser.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        adminUser.setRole(DEFAULT_ADMIN_ROLE);

        appUserRepository.save(adminUser);
    }
}
