package com.portifolio.uniguacu.controller;

import com.portifolio.uniguacu.dto.UsuarioDTO;
import com.portifolio.uniguacu.model.Usuario;
import com.portifolio.uniguacu.repository.UsuarioRepository;
import com.portifolio.uniguacu.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getCurrentUser(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return ResponseEntity.ok(convertToDto(usuario));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioDTO> updateCurrentUser(@RequestBody UsuarioDTO usuarioDetails, Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        usuario.setNomeCompleto(usuarioDetails.getNomeCompleto());
        usuario.setEmail(usuarioDetails.getEmail());
        usuario.setCurso(usuarioDetails.getCurso());
        usuario.setTurno(usuarioDetails.getTurno());

        Usuario updatedUsuario = usuarioRepository.save(usuario);

        return ResponseEntity.ok(convertToDto(updatedUsuario));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("file") MultipartFile file, Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String filename = fileStorageService.store(file);
        usuario.setFotoUrl(filename);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok().build();
    }

    // CORREÇÃO: Endpoint específico para buscar apenas alunos.
    @GetMapping("/alunos")
    public ResponseEntity<List<UsuarioDTO>> getAllAlunos() {
        List<Usuario> usuarios = usuarioRepository.findAllByRole("ROLE_ALUNO"); // Busca por role
        List<UsuarioDTO> dtos = usuarios.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Este método agora pode ser usado para fins administrativos, se necessário.
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAllUsers() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioDTO> dtos = usuarios.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Método auxiliar para não expor dados sensíveis como a senha.
    private UsuarioDTO convertToDto(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNomeCompleto(usuario.getNomeCompleto());
        dto.setEmail(usuario.getEmail());
        dto.setFotoUrl(usuario.getFotoUrl());
        dto.setCurso(usuario.getCurso());
        dto.setTurno(usuario.getTurno());
        dto.setRole(usuario.getRole());
        return dto;
    }
}