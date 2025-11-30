package com.portifolio.uniguacu.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Muitos comentários para um Artefato
    @JoinColumn(name = "artefato_id", nullable = false)
    private Artefato artefato;

    @Column(nullable = false)
    private String nome;

    private String funcaoEmpresa; // Opcional

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    private Integer avaliacaoSolucao; // 1 a 5 estrelas
    private Integer avaliacaoVideo; // 1 a 5 estrelas
    private Integer avaliacaoImpacto; // 1 a 5 estrelas

    private LocalDateTime dataCriacao = LocalDateTime.now();

    // Getters e Setters gerados pelo Lombok
    // Construtores podem ser adicionados se necessário
}
