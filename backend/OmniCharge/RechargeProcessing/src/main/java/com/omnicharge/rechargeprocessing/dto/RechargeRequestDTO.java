
package com.omnicharge.rechargeprocessing.dto;

import com.omnicharge.rechargeprocessing.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Getter
@Setter
public class RechargeRequestDTO {

    @NotNull(message = "operatorId required!!!")
    private Long operatorId;

    @NotNull(message = "planId required!!!")
    private Long planId;

    @NotNull(message = "mobileNumber required!")
    @Pattern(regexp = "\\d{10}", message = "mobileNumber must be a 10-digit number")
    private String mobileNumber;

    @NotNull(message = "paymentMethod required!")
    private PaymentMethod paymentMethod;
}
