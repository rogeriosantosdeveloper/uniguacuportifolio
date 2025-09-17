package com.portifolio.uniguacu.config;

import com.portifolio.uniguacu.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
                        // --- REGRAS PÚBLICAS ---
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Permite requisições pre-flight do CORS
                        .requestMatchers("/api/auth/**").permitAll() // Permite login e registro
                        .requestMatchers(HttpMethod.GET, "/api/artefatos", "/api/artefatos/**").permitAll() // Permite ver projetos
                        .requestMatchers(HttpMethod.GET, "/api/users/alunos").permitAll() // Permite ver lista de alunos
                        .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll() // Permite ver imagens

                        // --- REGRAS DE USUÁRIO LOGADO ---
                        .requestMatchers(HttpMethod.POST, "/api/artefatos").authenticated() // Usuário logado pode criar projeto
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated() // Usuário logado pode ver seu perfil

                        // --- REGRAS DE ADMIN ---
                        .requestMatchers("/api/artefatos/pendentes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/artefatos/{id}/aprovar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/artefatos/{id}/reprovar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/artefatos/{id}").hasRole("ADMIN") // Apenas admin edita
                        .requestMatchers(HttpMethod.DELETE, "/api/artefatos/{id}").hasRole("ADMIN") // Apenas admin deleta

                        // Qualquer outra requisição precisa de autenticação
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}