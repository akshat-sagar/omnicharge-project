package com.omnicharge.paymentservice.controller;

import com.omnicharge.paymentservice.dto.PaymentVerifyRequestDTO;
import com.omnicharge.paymentservice.dto.RazorpayOrderRequestDTO;
import com.omnicharge.paymentservice.dto.RazorpayOrderResponseDTO;
import com.omnicharge.paymentservice.dto.TransactionResponseDTO;
import com.omnicharge.paymentservice.enums.PaymentMethod;
import com.omnicharge.paymentservice.enums.TransactionStatus;
import com.omnicharge.paymentservice.service.ITransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    @Mock
    private ITransactionService transactionService;

    private TransactionController controller;
    private TransactionResponseDTO transactionResponseDTO;

    @BeforeEach
    void setUp() {
        controller = new TransactionController(transactionService);
        transactionResponseDTO = TransactionResponseDTO.builder()
                .amount(299.0)
                .paymentMethod(PaymentMethod.UPI)
                .transactionStatus(TransactionStatus.SUCCESS)
                .rechargeId(5L)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Test
    void getAllTransactionsByUserId_ShouldReturnList() {
        List<TransactionResponseDTO> responseDTOList = List.of(transactionResponseDTO);
        when(transactionService.getAllTransactionsByUserId(10L)).thenReturn(responseDTOList);

        ResponseEntity<List<TransactionResponseDTO>> response = controller.getAllTransactionsByUserId(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(responseDTOList, response.getBody());
    }

    @Test
    void getMyTransactions_ShouldReturnList() {
        List<TransactionResponseDTO> responseDTOList = List.of(transactionResponseDTO);
        when(transactionService.getMyTransactions()).thenReturn(responseDTOList);

        ResponseEntity<List<TransactionResponseDTO>> response = controller.getMyTransactions();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(responseDTOList, response.getBody());
    }

    @Test
    void getTransactionByRechargeId_ShouldReturnBody() {
        when(transactionService.getTransactionByRechargeId(5L)).thenReturn(transactionResponseDTO);

        ResponseEntity<TransactionResponseDTO> response = controller.getTransactionByRechargeId(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(transactionResponseDTO, response.getBody());
    }

    @Test
    void createOrder_ShouldReturnOrderResponse() {
        RazorpayOrderRequestDTO requestDTO = new RazorpayOrderRequestDTO(5L, "upi");
        RazorpayOrderResponseDTO responseDTO = new RazorpayOrderResponseDTO("order_1", 299.0, "INR", "rzp_test_key");
        when(transactionService.createOrder(requestDTO)).thenReturn(responseDTO);

        ResponseEntity<RazorpayOrderResponseDTO> response = controller.createOrder(requestDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(responseDTO, response.getBody());
    }

    @Test
    void verifyPayment_ShouldReturnTransactionResponse() {
        PaymentVerifyRequestDTO requestDTO = new PaymentVerifyRequestDTO("order_1", "pay_1", "sig");
        when(transactionService.verifyPayment(requestDTO)).thenReturn(transactionResponseDTO);

        ResponseEntity<TransactionResponseDTO> response = controller.verifyPayment(requestDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(transactionResponseDTO, response.getBody());
    }
}
