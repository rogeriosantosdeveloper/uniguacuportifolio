package com.portifolio.uniguacu.controller;

import com.portifolio.uniguacu.dto.JwtAuthResponse;
import com.portifolio.uniguacu.dto.LoginRequest;
import com.portifolio.uniguacu.dto.RegisterRequest;
import com.portifolio.uniguacu.dto.UsuarioDTO;
import com.portifolio.uniguacu.model.Usuario;
import com.portifolio.uniguacu.repository.UsuarioRepository;
import com.portifolio.uniguacu.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (usuarioRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return new ResponseEntity<>("Este email já está em uso!", HttpStatus.BAD_REQUEST);
        }

        Usuario user = new Usuario();
        user.setNomeCompleto(registerRequest.getNomeCompleto());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setCurso(registerRequest.getCurso());
        user.setTurno(registerRequest.getTurno());

        // CORREÇÃO: Garante que todo novo usuário seja um aluno.
        user.setRole("ROLE_ALUNO");

        Usuario result = usuarioRepository.save(user);

        return new ResponseEntity<>(convertToDto(result), HttpStatus.CREATED);
    }

    // Este método é apenas um exemplo e não envia email de verdade.
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        return usuarioRepository.findByEmail(email)
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    System.out.println("Token de reset para " + email + ": " + token);
                    return ResponseEntity.ok("Se o email existir, um link para redefinição de senha foi enviado.");
                })
                .orElse(ResponseEntity.ok("Se o email existir, um link para redefinição de senha foi enviado."));
    }

    // Método auxiliar para converter Usuario em DTO e não expor a senha
    private UsuarioDTO convertToDto(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNomeCompleto(usuario.getNomeCompleto());
        dto.setEmail(usuario.getEmail());
        dto.setFotoUrl(usuario.getFotoUrl());
        dto.setCurso(usuario.getCurso());
        dto.setTurno(usuario.getTurno());
        // Não inclua a senha no DTO
        return dto;
    }
}