package com.omnicharge.paymentservice.consumer;

import com.omnicharge.paymentservice.configuration.RabbitMQConfig;
import com.omnicharge.paymentservice.dto.PaymentSagaEvent;
import com.omnicharge.paymentservice.entity.Transaction;
import com.omnicharge.paymentservice.enums.TransactionStatus;
import com.omnicharge.paymentservice.repository.ITransactionRepository;
import com.omnicharge.paymentservice.service.RazorpayRefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SagaReplyConsumer {

    private final ITransactionRepository transactionRepository;
    private final RazorpayRefundService razorpayRefundService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.SAGA_REPLY_QUEUE)
    public void onRechargeUpdated(PaymentSagaEvent event) {
        log.info("SAGA COMPLETE - sagaId={}, rechargeId={}, eventType={}",
                event.getSagaId(), event.getRechargeId(), event.getEventType());
    }

    @RabbitListener(queues = RabbitMQConfig.SAGA_DLQ)
    public void onSagaDeadLetter(PaymentSagaEvent event) {
        log.error("SAGA COMPENSATION TRIGGERED - sagaId={}, rechargeId={}, reason=landed in DLQ",
                event.getSagaId(), event.getRechargeId());

        try {
            UUID transactionId = event.getTransactionId();

            transactionRepository.findById(transactionId).ifPresentOrElse(txn -> {
                if (txn.getStatus() == TransactionStatus.SUCCESS) {
                    txn.setStatus(TransactionStatus.FAILED);
                    txn.setFailureReason(
                            "Saga compensation: recharge activation failed after all retries. Refund initiated.");
                    txn = transactionRepository.save(txn);

                    log.warn("Transaction {} rolled back to FAILED during saga compensation", transactionId);

                    if (txn.getRazorpayPaymentId() != null && !txn.getRazorpayPaymentId().isBlank()) {
                        String refundId = razorpayRefundService.refundAndNotify(
                                txn,
                                "Saga compensation: recharge activation failed for rechargeId=" + txn.getRechargeId()
                        );
                        if (refundId != null && !refundId.isBlank()) {
                            txn.setStatus(TransactionStatus.REFUNDED);
                            txn.setFailureReason("Recharge activation failed. Payment refunded.");
                            txn = transactionRepository.save(txn);
                        }
                    } else {
                        log.error("CRITICAL: Transaction {} has no razorpayPaymentId - manual refund required.",
                                transactionId);
                    }

                    publishFailedSagaEvent(txn);
                } else {
                    log.info("Transaction {} already in status={} - no compensation needed",
                            transactionId, txn.getStatus());
                }
            }, () -> log.error("Compensation failed - transaction not found: {}", transactionId));

        } catch (Exception e) {
            log.error("CRITICAL: Saga compensation handler failed for sagaId={}. Manual intervention required. Error: {}",
                    event.getSagaId(), e.getMessage(), e);
        }
    }

    private void publishFailedSagaEvent(Transaction txn) {
        try {
            PaymentSagaEvent failedEvent = PaymentSagaEvent.builder()
                    .sagaId(txn.getTransactionId().toString())
                    .transactionId(txn.getTransactionId())
                    .rechargeId(txn.getRechargeId())
                    .userId(txn.getUserId())
                    .userEmail(txn.getUserEmail())
                    .userContactNo(txn.getUserContactNo())
                    .amount(txn.getAmount())
                    .razorpayPaymentId(txn.getRazorpayPaymentId())
                    .eventType(RabbitMQConfig.SAGA_ROUTING_FAILED)
                    .failureReason(txn.getFailureReason())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.SAGA_EXCHANGE,
                    RabbitMQConfig.SAGA_ROUTING_FAILED,
                    failedEvent
            );
        } catch (Exception e) {
            log.error("Failed to publish compensation failure event for rechargeId={}: {}",
                    txn.getRechargeId(), e.getMessage(), e);
        }
    }
}
