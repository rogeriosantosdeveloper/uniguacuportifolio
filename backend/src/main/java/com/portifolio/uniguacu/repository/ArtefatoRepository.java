package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.Artefato;
import com.portifolio.uniguacu.model.StatusProjeto; // Importa o Enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ArtefatoRepository extends JpaRepository<Artefato, Long> {

    // Query ATUALIZADA para filtrar pelo Enum StatusProjeto
    // Renomeado para 'searchByStatus' para clareza
    @Query(value = "SELECT * FROM artefato a WHERE " +
            "a.status = :status AND " +
            "(:busca IS NULL OR LOWER(a.titulo::text) LIKE LOWER(CONCAT('%', :busca, '%')) OR LOWER(a.autor::text) LIKE LOWER(CONCAT('%', :busca, '%'))) AND " +
            "(:curso IS NULL OR a.curso = :curso) AND " +
            "(:campus IS NULL OR a.campus = :campus) AND " +
            "(:categoria IS NULL OR a.categoria = :categoria) AND " +
            "(:semestre IS NULL OR a.semestre = :semestre) AND " +
            "(:dataInicial IS NULL OR a.data_criacao >= :dataInicial) AND " +
            "(:dataFinal IS NULL OR a.data_criacao <= :dataFinal)", nativeQuery = true)
    List<Artefato> searchByStatus(
            @Param("status") String status, // <-- Agora aceita String
            @Param("busca") String busca,
            @Param("curso") String curso,
            @Param("campus") String campus,
            @Param("categoria") String categoria,
            @Param("semestre") Integer semestre,
            @Param("dataInicial") LocalDate dataInicial,
            @Param("dataFinal") LocalDate dataFinal
    );

    // Nova query para buscar projetos por status (para admin)
    // Agora aceita o Enum
    List<Artefato> findByStatus(StatusProjeto status);
}