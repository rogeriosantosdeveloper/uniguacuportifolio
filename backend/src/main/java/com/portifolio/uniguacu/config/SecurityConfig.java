package com.portifolio.uniguacu.config;

import com.portifolio.uniguacu.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // --- Endpoints Públicos ---
                        .requestMatchers("/api/auth/**").permitAll() // Login/Registro
                        .requestMatchers(HttpMethod.GET, "/api/artefatos").permitAll() // Listar artefatos APROVADOS
                        .requestMatchers(HttpMethod.GET, "/api/artefatos/{id}").permitAll() // Ver detalhe de um artefato
                        .requestMatchers(HttpMethod.GET, "/api/users").permitAll() // Listar usuários (alunos)
                        .requestMatchers(HttpMethod.GET, "/api/users/alunos").permitAll() // Listar apenas alunos
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll() // Ver imagens/documentos
                        .requestMatchers(HttpMethod.GET, "/api/artefatos/{artefatoId}/comentarios").permitAll() // Ver comentários
                        .requestMatchers(HttpMethod.POST, "/api/artefatos/{artefatoId}/comentarios").permitAll() // Deixar comentário (público)

                        // --- Endpoints de Usuário Logado ---
                        .requestMatchers(HttpMethod.POST, "/api/artefatos").authenticated() // Criar artefato
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated() // **CORREÇÃO AQUI** (Ver próprio perfil)
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated() // Atualizar próprio perfil
                        .requestMatchers(HttpMethod.POST, "/api/users/me/photo").authenticated() // Atualizar própria foto
                        .requestMatchers(HttpMethod.POST, "/api/files/upload").authenticated() // Fazer upload

                        // --- Endpoints de Admin ---
                        .requestMatchers(HttpMethod.GET, "/api/artefatos/pendentes").hasRole("ADMIN") // Ver pendentes
                        .requestMatchers(HttpMethod.PUT, "/api/artefatos/{id}/aprovar").hasRole("ADMIN") // Aprovar
                        .requestMatchers(HttpMethod.PUT, "/api/artefatos/{id}").hasRole("ADMIN") // Editar qualquer artefato
                        .requestMatchers(HttpMethod.DELETE, "/api/artefatos/{id}").hasRole("ADMIN") // Deletar qualquer artefato

                        // Nega qualquer outra requisição não listada
                        .anyRequest().denyAll()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}