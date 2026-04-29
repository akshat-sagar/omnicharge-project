package com.omnicharge.paymentservice.dto;

import com.omnicharge.paymentservice.enums.TransactionStatus;
import com.omnicharge.paymentservice.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder

public class TransactionResponseDTO {
    private UUID transactionId;
    private Double amount;
    private TransactionStatus transactionStatus;
    private PaymentMethod paymentMethod;
    private LocalDateTime timestamp;
    private Long rechargeId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
}
