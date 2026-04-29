package com.omnicharge.paymentservice.scheduler;

import com.omnicharge.paymentservice.service.implementation.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PendingPaymentExpiryScheduler {

    private final TransactionService transactionService;

    @Scheduled(fixedDelayString = "${payment.pending-expiry-check-ms:60000}")
    public void cancelExpiredPendingPayments() {
        int cancelledCount = transactionService.cancelExpiredPendingTransactions();
        if (cancelledCount > 0) {
            log.info("Expired payment cleanup cancelled {} transaction(s)", cancelledCount);
        }
    }
}
