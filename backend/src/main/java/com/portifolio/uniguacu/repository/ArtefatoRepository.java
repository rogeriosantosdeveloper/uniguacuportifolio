package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.Artefato;
import com.portifolio.uniguacu.model.StatusProjeto; // Importa o nosso novo Enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ArtefatoRepository extends JpaRepository<Artefato, Long> {

    /**
     * Novo método para o administrador buscar projetos por status (ex: PENDENTE).
     * O Spring Data JPA cria a query automaticamente a partir do nome do método.
     */
    List<Artefato> findByStatus(StatusProjeto status);

    /**
     * Query principal para a busca da página inicial.
     * Agora ela filtra para trazer apenas projetos com status 'APROVADO'.
     * Também foram corrigidos os nomes das colunas de data.
     */
    @Query(value = "SELECT * FROM artefato a WHERE " +
            "a.status = 'APROVADO' AND " + // <-- FILTRO DE STATUS ADICIONADO
            "(:busca IS NULL OR lower(a.titulo) LIKE lower(concat('%', :busca, '%')) OR lower(a.autor) LIKE lower(concat('%', :busca, '%'))) AND " +
            "(:curso IS NULL OR a.curso = :curso) AND " +
            "(:campus IS NULL OR a.campus = :campus) AND " +
            "(:categoria IS NULL OR a.categoria = :categoria) AND " +
            "(:semestre IS NULL OR a.semestre = :semestre) AND " +
            "(:dataInicial IS NULL OR a.data_inicial >= :dataInicial) AND " + // <-- COLUNA DE DATA CORRIGIDA
            "(:dataFinal IS NULL OR a.data_final <= :dataFinal)", // <-- COLUNA DE DATA CORRIGIDA
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