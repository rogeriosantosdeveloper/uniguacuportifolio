package com.portifolio.uniguacu.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = "storage") // Mapeia propriedades do application.properties
public class StorageProperties {

    private String location = "upload-dir"; // Nome do diretório padrão

}