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

    @Column(columnDefinition = "TEXT") // Instrução explícita para forçar o tipo TEXTO
    private String autor;

    private String curso;
    private String campus;
    private String categoria;
    private Integer semestre;
    private LocalDate dataCriacao;

    // --- CAMPOS DE MÍDIA ---
    private String urlImagemPrincipal;

    @Column(columnDefinition = "TEXT")
    private String listaImagens; // JSON: ["img1.jpg", "img2.jpg"]

    @Column(columnDefinition = "TEXT")
    private String listaDocumentos; // JSON: [{"nome": "doc.pdf", "url": "doc_uuid.pdf"}]

    private String videoYoutubeUrl;

    // --- CAMPO DE STATUS ---
    @Enumerated(EnumType.STRING) // Diz ao banco para salvar o nome (ex: "PENDENTE")
    @Column(nullable = false)
    private StatusProjeto status; // Agora usa o tipo Enum
}
