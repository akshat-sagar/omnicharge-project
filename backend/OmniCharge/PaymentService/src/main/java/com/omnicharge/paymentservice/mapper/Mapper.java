package com.omnicharge.paymentservice.mapper;

import com.omnicharge.paymentservice.dto.TransactionRequestDTO;
import com.omnicharge.paymentservice.dto.TransactionResponseDTO;
import com.omnicharge.paymentservice.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class Mapper {

    public TransactionResponseDTO toTransactionResponseDTO(Transaction transaction) {
        return TransactionResponseDTO.builder()
                .transactionId(transaction.getTransactionId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .timestamp(transaction.getTimestamp())
                .transactionStatus(transaction.getStatus())
                .rechargeId(transaction.getRechargeId())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .build();
    }

}
