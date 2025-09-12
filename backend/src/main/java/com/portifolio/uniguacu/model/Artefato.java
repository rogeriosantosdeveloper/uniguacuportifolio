package com.portifolio.uniguacu.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Artefato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(columnDefinition = "TEXT")
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private String urlImagem;

    @Column(columnDefinition = "TEXT")
    private String autor;

    private String curso;
    private String campus;
    private String categoria;
    private Integer semestre;

    // ================== CORREÇÃO AQUI ==================
    private LocalDate dataInicial; // Renomeado de dataCriacao para mais clareza
    private LocalDate dataFinal;   // Novo campo para a data de término
}