package com.oprationPlanManagement.operatorPlanService.service;

import com.oprationPlanManagement.operatorPlanService.dto.requestDTO.AppUserRequestDTO;
import com.oprationPlanManagement.operatorPlanService.dto.responseDTO.AppUserResponseDTO;

public interface IAppUserService {

    AppUserResponseDTO createUser(AppUserRequestDTO requestDTO);
}
