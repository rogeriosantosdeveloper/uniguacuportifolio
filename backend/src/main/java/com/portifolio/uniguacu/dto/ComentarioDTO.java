package com.portifolio.uniguacu.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComentarioDTO {
    private Long id;
    private Long artefatoId; // Apenas o ID para referência
    private String nome;
    private String funcaoEmpresa;
    private String texto;
    private Integer avaliacaoSolucao;
    private Integer avaliacaoVideo;
    private Integer avaliacaoImpacto;
    private LocalDateTime dataCriacao;
}
