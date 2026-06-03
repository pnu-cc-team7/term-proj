package com.team7.termproject.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException exception) {
        return ResponseEntity
                .status(exception.getStatus())
                .body(ErrorResponse.of(exception.getCode(), exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception) {
        boolean accessTokenMissing = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getField)
                .anyMatch("accessToken"::equals);

        if (accessTokenMissing) {
            return ResponseEntity
                    .badRequest()
                    .body(ErrorResponse.of("ACCESS_TOKEN_REQUIRED", "accessToken is required"));
        }

        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.of("INVALID_REQUEST", "Invalid request"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleInvalidJson() {
        return ResponseEntity
                .badRequest()
                .body(ErrorResponse.of("INVALID_JSON", "Invalid JSON body"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException() {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("INTERNAL_SERVER_ERROR", "Internal server error"));
    }
}

