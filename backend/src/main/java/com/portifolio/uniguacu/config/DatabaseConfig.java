package com.portifolio.uniguacu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:}")
    private String springDatasourceUsername;

    @Value("${spring.datasource.password:}")
    private String springDatasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Se DATABASE_URL estiver definido (formato do Render: postgresql://user:password@host:port/database)
        if (databaseUrl != null && !databaseUrl.isEmpty() && !databaseUrl.startsWith("jdbc:")) {
            try {
                // O Render usa postgresql:// mas URI precisa de postgres://
                String uriString = databaseUrl.replace("postgresql://", "postgres://");
                URI dbUri = new URI(uriString);
                
                String userInfo = dbUri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] userPass = userInfo.split(":", 2);
                    String username = userPass[0];
                    String password = userPass.length > 1 ? userPass[1] : "";
                    
                    String host = dbUri.getHost();
                    int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
                    String path = dbUri.getPath();
                    String dbName = path.startsWith("/") ? path.substring(1) : path;
                    
                    String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
                    
                    return DataSourceBuilder.create()
                            .url(jdbcUrl)
                            .username(username)
                            .password(password)
                            .driverClassName("org.postgresql.Driver")
                            .build();
                }
            } catch (Exception e) {
                System.err.println("Erro ao fazer parsing do DATABASE_URL: " + databaseUrl);
                System.err.println("Usando configurações padrão do application.properties");
                e.printStackTrace();
            }
        }
        
        // Caso contrário, usa as configurações padrão do Spring Boot
        return DataSourceBuilder.create()
                .url(springDatasourceUrl.isEmpty() ? "jdbc:postgresql://localhost:5432/portifolio_db_v2" : springDatasourceUrl)
                .username(springDatasourceUsername.isEmpty() ? "postgres" : springDatasourceUsername)
                .password(springDatasourcePassword.isEmpty() ? "admin" : springDatasourcePassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}

