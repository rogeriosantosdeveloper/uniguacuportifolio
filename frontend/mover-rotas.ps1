# Script para mover rotas para o App Router
# Execute este script na pasta frontend/

Write-Host "Movendo rotas para src/app/..." -ForegroundColor Yellow

# Criar diretorio app se nao existir
if (-not (Test-Path "src\app")) {
    New-Item -ItemType Directory -Path "src\app" -Force | Out-Null
}

# Mover cadastro
if (Test-Path "src\cadastro") {
    Copy-Item -Path "src\cadastro" -Destination "src\app\cadastro" -Recurse -Force
    Write-Host "Cadastro movido" -ForegroundColor Green
}

# Mover login
if (Test-Path "src\login") {
    Copy-Item -Path "src\login" -Destination "src\app\login" -Recurse -Force
    Write-Host "Login movido" -ForegroundColor Green
}

# Mover perfil
if (Test-Path "src\perfil") {
    Copy-Item -Path "src\perfil" -Destination "src\app\perfil" -Recurse -Force
    Write-Host "Perfil movido" -ForegroundColor Green
}

# Mover admin
if (Test-Path "src\admin") {
    Copy-Item -Path "src\admin" -Destination "src\app\admin" -Recurse -Force
    Write-Host "Admin movido" -ForegroundColor Green
}

# Mover artefatos
if (Test-Path "src\artefatos") {
    Copy-Item -Path "src\artefatos" -Destination "src\app\artefatos" -Recurse -Force
    Write-Host "Artefatos movido" -ForegroundColor Green
}

Write-Host ""
Write-Host "Arquivos copiados com sucesso!" -ForegroundColor Green
Write-Host "IMPORTANTE: Delete as pastas antigas em src/ apos verificar que tudo funciona." -ForegroundColor Yellow
