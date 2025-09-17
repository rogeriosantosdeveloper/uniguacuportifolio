package com.portifolio.uniguacu.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name="artefato") // É uma boa prática definir o nome da tabela explicitamente
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

    // CORREÇÃO: Padronizando os nomes dos campos de data
    private LocalDate dataInicial;
    private LocalDate dataFinal;

    @Enumerated(EnumType.STRING)
    private StatusProjeto status;
}