package com.portifolio.uniguacu.config;

import com.portifolio.uniguacu.model.Usuario;
import com.portifolio.uniguacu.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verifica se o admin já existe
        if (!usuarioRepository.findByEmail("admin@uniguacu.com").isPresent()) {
            Usuario admin = new Usuario();
            admin.setNomeCompleto("Administrador");
            admin.setEmail("admin@uniguacu.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Senha forte em produção!
            admin.setRole("ROLE_ADMIN");
            usuarioRepository.save(admin);
            System.out.println("Usuário administrador padrão criado.");
        }
    }
}