package com.skillbridge.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // INVALID LOGIN
    // =========================================================

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(
            InvalidCredentialsException ex) {

        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                ex.getMessage()
        );
    }

    // =========================================================
    // RESOURCE NOT FOUND
    // =========================================================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(
            ResourceNotFoundException ex) {

        return buildResponse(
                HttpStatus.NOT_FOUND,
                "Not Found",
                ex.getMessage()
        );
    }

    // =========================================================
    // BAD REQUEST
    // =========================================================

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(
            BadRequestException ex) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Bad Request",
                ex.getMessage()
        );
    }

    // =========================================================
    // VALIDATION ERROR
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors =
                new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now()
        );

        body.put(
                "status",
                400
        );

        body.put(
                "error",
                "Validation Failed"
        );

        body.put(
                "message",
                "Please correct the invalid fields."
        );

        body.put(
                "errors",
                errors
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }

    // =========================================================
    // FORBIDDEN
    // =========================================================

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(
            AccessDeniedException ex) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "Forbidden",
                "You do not have permission to perform this action."
        );
    }

    // =========================================================
    // GENERAL ERROR
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneralException(
            Exception ex) {

        ex.printStackTrace();

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected error occurred. Please try again later."
        );
    }

        // =========================================================
        // DUPLICATE RESOURCE
        // =========================================================
    @ExceptionHandler(DuplicateResourceException.class)
public ResponseEntity<?> handleDuplicateResource(
        DuplicateResourceException ex) {

    return buildResponse(
            HttpStatus.CONFLICT,
            "Conflict",
            ex.getMessage()
    );
}

    // =========================================================
    // COMMON RESPONSE
    // =========================================================

    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status,
            String error,
            String message) {

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now()
        );

        body.put(
                "status",
                status.value()
        );

        body.put(
                "error",
                error
        );

        body.put(
                "message",
                message
        );

        return ResponseEntity
                .status(status)
                .body(body);
    }
}