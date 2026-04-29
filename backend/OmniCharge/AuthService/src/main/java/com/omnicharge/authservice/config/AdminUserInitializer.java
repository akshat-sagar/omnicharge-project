package com.omnicharge.authservice.config;

import com.omnicharge.authservice.entity.UserEntity;
import com.omnicharge.authservice.enums.Roles;
import com.omnicharge.authservice.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private static final String ADMIN_NAME = "Akshat Admin";
    private static final String ADMIN_EMAIL = "akshatshanu@gmail.com";
    private static final String ADMIN_CONTACT = "9999999999";
    private static final String ADMIN_PASSWORD = "Test@123";
    private static final String USER_ONE_NAME = "Hidden Akshat";
    private static final String USER_ONE_EMAIL = "hiddenakshat@gmail.com";
    private static final String USER_ONE_CONTACT = "8888888888";
    private static final String USER_TWO_NAME = "Social Sof Akshat";
    private static final String USER_TWO_EMAIL = "socialsofakshat@gmail.com";
    private static final String USER_TWO_CONTACT = "7777777777";

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser(ADMIN_NAME, ADMIN_EMAIL, ADMIN_CONTACT, ADMIN_PASSWORD, Roles.ADMIN);
        seedUser(USER_ONE_NAME, USER_ONE_EMAIL, USER_ONE_CONTACT, ADMIN_PASSWORD, Roles.USER);
        seedUser(USER_TWO_NAME, USER_TWO_EMAIL, USER_TWO_CONTACT, ADMIN_PASSWORD, Roles.USER);
    }

    private void seedUser(String name, String email, String contactNo, String rawPassword, Roles role) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseGet(UserEntity::new);

        user.setName(name);
        user.setEmail(email);
        user.setContactNo(contactNo);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);

        userRepository.save(user);
    }
}
