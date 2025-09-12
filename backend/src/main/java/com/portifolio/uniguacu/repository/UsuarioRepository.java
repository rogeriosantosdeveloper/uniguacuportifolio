package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Trocamos findByUsername por findByEmail
    Optional<Usuario> findByEmail(String email);
}