package com.portifolio.uniguacu.controller;

import com.portifolio.uniguacu.model.Artefato;
import com.portifolio.uniguacu.model.StatusProjeto; // Importa o Enum
import com.portifolio.uniguacu.repository.ArtefatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/artefatos")
public class ArtefatoController {

    @Autowired
    private ArtefatoRepository artefatoRepository;

    // Lista apenas projetos APROVADOS para a visão pública (Home)
    @GetMapping
    public List<Artefato> listarAprovados(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String curso,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Integer semestre,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal
    ) {
        // CORREÇÃO: Chama o método 'searchByStatus' e passa o Enum APROVADO como String
        return artefatoRepository.searchByStatus(
                StatusProjeto.APROVADO.name(),
                busca, curso, campus, categoria, semestre, dataInicial, dataFinal
        );
    }

    // Busca um artefato específico pelo ID (para a página de detalhes)
    @GetMapping("/{id}")
    public ResponseEntity<Artefato> buscarPorId(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Cria um novo artefato com status PENDENTE
    @PostMapping
    public ResponseEntity<Artefato> criarArtefato(@RequestBody Artefato artefato) {
        if (artefato.getDataCriacao() == null) {
            artefato.setDataCriacao(LocalDate.now());
        }
        artefato.setStatus(StatusProjeto.PENDENTE); // Define o status usando o Enum
        Artefato savedArtefato = artefatoRepository.save(artefato);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedArtefato);
    }

    // Atualiza um artefato (usado pelo Admin na página de edição)
    @PutMapping("/{id}")
    public ResponseEntity<Artefato> atualizarArtefato(@PathVariable Long id, @RequestBody Artefato artefatoDetalhes) {
        return artefatoRepository.findById(id)
                .map(artefatoExistente -> {
                    // Atualiza os campos básicos
                    artefatoExistente.setTitulo(artefatoDetalhes.getTitulo());
                    artefatoExistente.setDescricao(artefatoDetalhes.getDescricao());
                    artefatoExistente.setAutor(artefatoDetalhes.getAutor());

                    // Atualiza os novos campos de mídia
                    artefatoExistente.setUrlImagemPrincipal(artefatoDetalhes.getUrlImagemPrincipal());
                    artefatoExistente.setListaImagens(artefatoDetalhes.getListaImagens());
                    artefatoExistente.setListaDocumentos(artefatoDetalhes.getListaDocumentos());
                    artefatoExistente.setVideoYoutubeUrl(artefatoDetalhes.getVideoYoutubeUrl());

                    // Atualiza os campos de filtro
                    artefatoExistente.setCurso(artefatoDetalhes.getCurso());
                    artefatoExistente.setCampus(artefatoDetalhes.getCampus());
                    artefatoExistente.setCategoria(artefatoDetalhes.getCategoria());
                    artefatoExistente.setSemestre(artefatoDetalhes.getSemestre());

                    // IMPORTANTE: O status NÃO é atualizado aqui

                    Artefato atualizado = artefatoRepository.save(artefatoExistente);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Deleta um artefato (usado pelo Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarArtefato(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(artefato -> {
                    artefatoRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ENDPOINTS PARA ADMIN ---

    // Lista projetos PENDENTES (para um painel de admin futuro)
    @GetMapping("/pendentes")
    // @PreAuthorize("hasRole('ADMIN')")
    public List<Artefato> listarPendentes() {
        return artefatoRepository.findByStatus(StatusProjeto.PENDENTE); // Usa o Enum
    }

    // Endpoint para APROVAR um projeto (usado pelo Admin)
    @PutMapping("/{id}/aprovar")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Artefato> aprovarArtefato(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(artefato -> {
                    if (artefato.getStatus() != StatusProjeto.PENDENTE) { // Compara com Enum
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Projeto não está pendente para aprovação.");
                    }
                    artefato.setStatus(StatusProjeto.APROVADO); // Define com Enum
                    Artefato aprovado = artefatoRepository.save(artefato);
                    return ResponseEntity.ok(aprovado);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
