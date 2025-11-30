package com.portifolio.uniguacu.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nomeCompleto;
    private String email;
    private String fotoUrl;
    private String curso;
    private String turno;
    private String role;
}