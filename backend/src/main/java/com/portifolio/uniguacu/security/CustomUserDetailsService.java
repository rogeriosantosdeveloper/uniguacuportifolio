package com.portifolio.uniguacu.security;

import com.portifolio.uniguacu.model.Usuario;
import com.portifolio.uniguacu.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // O nome do método é fixo pela interface do Spring Security, mas o parâmetro é o email
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // CORREÇÃO 1: Chamando o método findByEmail
        Usuario user = usuarioRepository.findByEmail(email)
                // CORREÇÃO 2: Atualizando a mensagem de erro
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));

        // CORREÇÃO 3: Usando user.getEmail() para criar o UserDetails
        return new User(user.getEmail(), user.getPassword(), new ArrayList<>());
    }
}