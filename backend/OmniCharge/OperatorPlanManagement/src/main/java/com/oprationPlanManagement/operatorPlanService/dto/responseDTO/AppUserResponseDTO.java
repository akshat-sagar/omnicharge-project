package com.oprationPlanManagement.operatorPlanService.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AppUserResponseDTO {

    private Long id;
    private String email;
    private String role;
}
