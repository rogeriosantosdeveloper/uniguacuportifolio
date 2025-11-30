package com.portifolio.uniguacu.controller;

import com.portifolio.uniguacu.dto.ComentarioDTO;
import com.portifolio.uniguacu.model.Artefato;
import com.portifolio.uniguacu.model.Comentario;
import com.portifolio.uniguacu.repository.ArtefatoRepository;
import com.portifolio.uniguacu.repository.ComentarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/artefatos/{artefatoId}/comentarios")
public class ComentarioController {

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private ArtefatoRepository artefatoRepository; // Para buscar o Artefato

    // GET /api/artefatos/{artefatoId}/comentarios - Lista comentários de um projeto
    @GetMapping
    public List<ComentarioDTO> getComentariosByArtefato(@PathVariable Long artefatoId) {
        if (!artefatoRepository.existsById(artefatoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Artefato não encontrado");
        }
        return comentarioRepository.findByArtefatoIdOrderByDataCriacaoDesc(artefatoId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // POST /api/artefatos/{artefatoId}/comentarios - Adiciona um novo comentário
    @PostMapping
    public ResponseEntity<ComentarioDTO> addComentario(@PathVariable Long artefatoId, @RequestBody ComentarioDTO comentarioDTO) {
        Artefato artefato = artefatoRepository.findById(artefatoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artefato não encontrado"));

        Comentario comentario = new Comentario();
        comentario.setArtefato(artefato);
        comentario.setNome(comentarioDTO.getNome());
        comentario.setFuncaoEmpresa(comentarioDTO.getFuncaoEmpresa());
        comentario.setTexto(comentarioDTO.getTexto());
        comentario.setAvaliacaoSolucao(comentarioDTO.getAvaliacaoSolucao());
        comentario.setAvaliacaoVideo(comentarioDTO.getAvaliacaoVideo());
        comentario.setAvaliacaoImpacto(comentarioDTO.getAvaliacaoImpacto());
        comentario.setDataCriacao(LocalDateTime.now());

        Comentario savedComentario = comentarioRepository.save(comentario);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedComentario));
    }

    // Método auxiliar para converter Entidade para DTO
    private ComentarioDTO convertToDto(Comentario comentario) {
        ComentarioDTO dto = new ComentarioDTO();
        dto.setId(comentario.getId());
        dto.setArtefatoId(comentario.getArtefato().getId());
        dto.setNome(comentario.getNome());
        dto.setFuncaoEmpresa(comentario.getFuncaoEmpresa());
        dto.setTexto(comentario.getTexto());
        dto.setAvaliacaoSolucao(comentario.getAvaliacaoSolucao());
        dto.setAvaliacaoVideo(comentario.getAvaliacaoVideo());
        dto.setAvaliacaoImpacto(comentario.getAvaliacaoImpacto());
        dto.setDataCriacao(comentario.getDataCriacao());
        return dto;
    }
}
