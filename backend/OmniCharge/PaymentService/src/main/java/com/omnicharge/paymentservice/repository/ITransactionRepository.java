package com.omnicharge.paymentservice.repository;

import com.omnicharge.paymentservice.entity.Transaction;
import com.omnicharge.paymentservice.enums.TransactionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ITransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByUserIdOrderByTimestampDesc(Long userId);
    Optional<Transaction> findByRechargeId(Long rechargeId);
    Optional<Transaction> findByRazorpayOrderId(String razorpayOrderId);
    List<Transaction> findByStatusAndTimestampBefore(TransactionStatus status, LocalDateTime cutoffTime);
}
