package com.oprationPlanManagement.operatorPlanService.repository;

import com.oprationPlanManagement.operatorPlanService.entity.AppUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IAppUserRepository extends JpaRepository<AppUserEntity, Long> {

    Optional<AppUserEntity> findByUsername(String username);
}
