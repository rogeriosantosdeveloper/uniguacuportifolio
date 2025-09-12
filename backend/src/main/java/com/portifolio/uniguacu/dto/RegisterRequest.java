package com.portifolio.uniguacu.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nomeCompleto;
    private String email;
    private String password;
    private String curso;
    private String turno;
}