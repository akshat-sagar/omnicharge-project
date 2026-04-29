package com.omnicharge.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RazorpayOrderResponseDTO {
    private String razorpayOrderId;
    private Double amount;
    private String currency;
    private String keyId;  // ← ADDED: sent to frontend so it can initialise Razorpay checkout
}