# Etapa 1: Compilar o projeto (Build)
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
# Compila pulando testes para ser mais rápido
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Etapa 2: Rodar o projeto (Imagem final leve)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copia o .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Define a porta que o Render espera (ele usa a variável PORT)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]