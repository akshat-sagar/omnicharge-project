package com.oprationPlanManagement.operatorPlanService.dto.responseDTO;

import java.io.Serializable;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PlanResponseDTO implements Serializable{
        private final long serialIzableID = 1L;
        private Long id;
        private Long operatorId;
        private Double amount;
        private String validity;
        private String description;

        public PlanResponseDTO(Long operatorId, Double amount, String validity, String description) {
                this.operatorId = operatorId;
                this.amount = amount;
                this.validity = validity;
                this.description = description;
        }
}
