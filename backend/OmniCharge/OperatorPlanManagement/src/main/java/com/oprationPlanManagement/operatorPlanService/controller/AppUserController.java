package com.oprationPlanManagement.operatorPlanService.controller;

import com.oprationPlanManagement.operatorPlanService.dto.requestDTO.AppUserRequestDTO;
import com.oprationPlanManagement.operatorPlanService.dto.responseDTO.AppUserResponseDTO;
import com.oprationPlanManagement.operatorPlanService.service.IAppUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AppUserController {

    private final IAppUserService appUserService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AppUserResponseDTO> createUser(@Valid @RequestBody AppUserRequestDTO requestDTO) {
        return ResponseEntity.ok(appUserService.createUser(requestDTO));
    }
}
