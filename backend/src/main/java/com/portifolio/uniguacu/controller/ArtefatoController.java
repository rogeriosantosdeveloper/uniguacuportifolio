package com.portifolio.uniguacu.controller;

import com.portifolio.uniguacu.model.Artefato;
import com.portifolio.uniguacu.model.StatusProjeto;
import com.portifolio.uniguacu.repository.ArtefatoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/artefatos")
public class ArtefatoController {

    @Autowired
    private ArtefatoRepository artefatoRepository;

    @GetMapping
    public List<Artefato> listarTodos(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String curso,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Integer semestre,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicial,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFinal
    ) {
        return artefatoRepository.search(busca, curso, campus, categoria, semestre, dataInicial, dataFinal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artefato> buscarPorId(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criarArtefato(@RequestBody Artefato artefato) {
        if (artefato.getSemestre() != null && artefato.getSemestre() > 10) {
            return ResponseEntity.badRequest().body("O semestre não pode ser maior que 10.");
        }
        artefato.setStatus(StatusProjeto.PENDENTE);
        Artefato novoArtefato = artefatoRepository.save(artefato);
        return new ResponseEntity<>(novoArtefato, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarArtefato(@PathVariable Long id, @RequestBody Artefato artefatoDetalhes) {
        if (artefatoDetalhes.getSemestre() != null && artefatoDetalhes.getSemestre() > 10) {
            return ResponseEntity.badRequest().body("O semestre não pode ser maior que 10.");
        }

        return artefatoRepository.findById(id)
                .map(artefatoExistente -> {
                    artefatoExistente.setTitulo(artefatoDetalhes.getTitulo());
                    artefatoExistente.setDescricao(artefatoDetalhes.getDescricao());
                    artefatoExistente.setAutor(artefatoDetalhes.getAutor());
                    artefatoExistente.setUrlImagem(artefatoDetalhes.getUrlImagem());
                    artefatoExistente.setCurso(artefatoDetalhes.getCurso());
                    artefatoExistente.setCampus(artefatoDetalhes.getCampus());
                    artefatoExistente.setCategoria(artefatoDetalhes.getCategoria());
                    artefatoExistente.setSemestre(artefatoDetalhes.getSemestre());

                    // CORREÇÃO: Usando os nomes de campo padronizados
                    artefatoExistente.setDataInicial(artefatoDetalhes.getDataInicial());
                    artefatoExistente.setDataFinal(artefatoDetalhes.getDataFinal());

                    Artefato atualizado = artefatoRepository.save(artefatoExistente);
                    return ResponseEntity.ok(atualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletarArtefato(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(artefato -> {
                    artefatoRepository.deleteById(id);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Endpoints de Administração ---

    @GetMapping("/pendentes")
    public ResponseEntity<List<Artefato>> listarProjetosPendentes() {
        return ResponseEntity.ok(artefatoRepository.findByStatus(StatusProjeto.PENDENTE));
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<Artefato> aprovarProjeto(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(artefato -> {
                    artefato.setStatus(StatusProjeto.APROVADO);
                    return ResponseEntity.ok(artefatoRepository.save(artefato));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reprovar")
    public ResponseEntity<Artefato> reprovarProjeto(@PathVariable Long id) {
        return artefatoRepository.findById(id)
                .map(artefato -> {
                    artefato.setStatus(StatusProjeto.REPROVADO);
                    return ResponseEntity.ok(artefatoRepository.save(artefato));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}