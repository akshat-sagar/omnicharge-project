package com.oprationPlanManagement.operatorPlanService.service;

import com.oprationPlanManagement.operatorPlanService.dto.requestDTO.AppUserRequestDTO;
import com.oprationPlanManagement.operatorPlanService.dto.responseDTO.AppUserResponseDTO;
import com.oprationPlanManagement.operatorPlanService.entity.AppUserEntity;
import com.oprationPlanManagement.operatorPlanService.repository.IAppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserServiceImpl implements IAppUserService {

    private final IAppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AppUserResponseDTO createUser(AppUserRequestDTO requestDTO) {
        String normalizedRole = normalizeRole(requestDTO.getRole());

        if (appUserRepository.findByUsername(requestDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User already exists with email: " + requestDTO.getEmail());
        }

        AppUserEntity appUserEntity = new AppUserEntity();
        appUserEntity.setUsername(requestDTO.getEmail());
        appUserEntity.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        appUserEntity.setRole(normalizedRole);

        AppUserEntity savedUser = appUserRepository.save(appUserEntity);

        return new AppUserResponseDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }

    private String normalizeRole(String role) {
        String normalized = role.trim().toUpperCase();
        if ("ADMIN".equals(normalized)) {
            return "ROLE_ADMIN";
        }
        if ("USER".equals(normalized)) {
            return "ROLE_USER";
        }
        if ("ROLE_ADMIN".equals(normalized) || "ROLE_USER".equals(normalized)) {
            return normalized;
        }
        throw new IllegalArgumentException("Unsupported role: " + role);
    }
}
