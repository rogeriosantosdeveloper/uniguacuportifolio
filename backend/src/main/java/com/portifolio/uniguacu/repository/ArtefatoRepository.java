package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.Artefato;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ArtefatoRepository extends JpaRepository<Artefato, Long> {

    // ================== CORREÇÃO AQUI ==================
    // Alteramos a query para ser uma "Query Nativa" (SQL puro do PostgreSQL).
    // Isso evita o bug de tradução do Hibernate/JPQL.
    // Adicionamos 'value =' e, mais importante, 'nativeQuery = true'.
    @Query(value = "SELECT * FROM artefato a WHERE " +
            "(:busca IS NULL OR lower(a.titulo) LIKE lower(concat('%', :busca, '%')) OR lower(a.autor) LIKE lower(concat('%', :busca, '%'))) AND " +
            "(:curso IS NULL OR a.curso = :curso) AND " +
            "(:campus IS NULL OR a.campus = :campus) AND " +
            "(:categoria IS NULL OR a.categoria = :categoria) AND " +
            "(:semestre IS NULL OR a.semestre = :semestre) AND " +
            "(:dataInicial IS NULL OR a.data_criacao >= :dataInicial) AND " +
            "(:dataFinal IS NULL OR a.data_criacao <= :dataFinal)",
            nativeQuery = true)
    List<Artefato> search(
            @Param("busca") String busca,
            @Param("curso") String curso,
            @Param("campus") String campus,
            @Param("categoria") String categoria,
            @Param("semestre") Integer semestre,
            @Param("dataInicial") LocalDate dataInicial,
            @Param("dataFinal") LocalDate dataFinal
    );
}