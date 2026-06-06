#!/bin/bash

# Interrompe o script caso ocorra qualquer erro
set -e

echo "=================================================="
# 1 & 2. ATUALIZANDO SISTEMA E INSTALANDO DOCKER / DOCKER COMPOSE
echo "=> Atualizando pacotes e instalando dependências do Docker..."
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

echo "=> Adicionando chave GPG oficial do Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "=> Configurando repositório do Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "=> Instalando Docker e Docker Compose..."
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. INSTALANDO O GIT
echo "=================================================="
echo "=> Instalando o Git..."
sudo apt-get install -y git

# CLONANDO O PROJETO
echo "=================================================="
echo "=> Clonando o projeto do GitHub..."

REPO_DIR="Sprint-3"

# Remove o diretório antigo se ele já existir
rm -rf "$REPO_DIR"

git clone https://github.com/Project-MetaDex/Sprint-3.git

# COPIANDO APENAS O docker-compose.yml
echo "=================================================="
echo "=> Copiando docker-compose.yml para /home/ubuntu..."

sudo cp "$REPO_DIR"/DockerCompose/docker-compose.yml /home/ubuntu/docker-compose.yml

# ENTRANDO NO DIRETÓRIO HOME E RODANDO O DOCKER COMPOSE
echo "=================================================="
echo "=> Executando Docker Compose em /home/ubuntu..."

cd /home/ubuntu

# Sobe os containers em background (-d)
sudo docker compose up -d

echo "=> Aguardando 5 segundos para estabilização dos containers..."
sleep 5

# EXCLUINDO O DIRETÓRIO CLONADO
echo "=================================================="
echo "=> Limpando o diretório clonado (os containers continuarão rodando)..."

rm -rf "$REPO_DIR"

# VALIDAÇÃO FINAL
echo "=================================================="
echo "=> Verificando status dos containers 'metadex-bd' e 'metadex-site':"

sudo docker ps --filter "name=metadex"

echo "=================================================="
echo " PROCESSAMENTO CONCLUÍDO COM SUCESSO!"
echo "=================================================="