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

    @Column(columnDefinition = "TEXT") // Instrução explícita para forçar o tipo TEXTO
    private String titulo;

    @Column(columnDefinition = "TEXT") // Instrução explícita para forçar o tipo TEXTO
    private String descricao;

    private String urlImagem;

    @Column(columnDefinition = "TEXT") // Instrução explícita para forçar o tipo TEXTO
    private String autor;

    private String curso;
    private String campus;
    private String categoria;
    private Integer semestre;
    private LocalDate dataCriacao;
}
