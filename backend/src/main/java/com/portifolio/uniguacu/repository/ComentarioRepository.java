package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Busca todos os comentários associados a um Artefato específico, ordenados por data
    List<Comentario> findByArtefatoIdOrderByDataCriacaoDesc(Long artefatoId);
}
