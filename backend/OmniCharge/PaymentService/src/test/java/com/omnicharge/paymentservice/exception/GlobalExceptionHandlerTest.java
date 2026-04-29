package com.omnicharge.paymentservice.exception;

import com.omnicharge.paymentservice.dto.PaymentVerifyRequestDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private HttpServletRequest request;

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/transaction/test");
    }

    @Test
    void handleTransactionNotFoundException_ShouldReturnNotFound() {
        ResponseEntity<ErrorResponse> response = handler.handleTransactionNotFoundException(
                new TransactionNotFoundException("missing"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("missing", response.getBody().getMessage());
    }

    @Test
    void handleMethodArgumentNotValidException_ShouldReturnBadRequest() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new PaymentVerifyRequestDTO(), "dto");
        bindingResult.addError(new FieldError("dto", "razorpayOrderId", "must not be blank"));
        MethodParameter parameter = new MethodParameter(
                DummyMethods.class.getDeclaredMethod("accept", PaymentVerifyRequestDTO.class), 0);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleMethodArgumentNotValidException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("/transaction/test", response.getBody().getPath());
    }

    @Test
    void handleException_ShouldReturnBadRequest() {
        ResponseEntity<ErrorResponse> response = handler.handleException(new RuntimeException("boom"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("boom", response.getBody().getMessage());
    }

    private static class DummyMethods {
        @SuppressWarnings("unused")
        public void accept(PaymentVerifyRequestDTO dto) {
        }
    }
}
