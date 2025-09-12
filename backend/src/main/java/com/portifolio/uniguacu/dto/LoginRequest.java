package com.portifolio.uniguacu.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email; // Trocamos username por email
    private String password;
}