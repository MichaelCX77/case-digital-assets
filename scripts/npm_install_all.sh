#!/bin/bash
# Script para instalar dependências em todos os microserviços e gateway usando apenas npm install

# Microserviços
MICROSERVICOS=("clientes" "contas" "transacoes")
BASE_DIR="backend/services"

for SERVICE in "${MICROSERVICOS[@]}"
do
  echo "=============================="
  echo "Instalando dependências em $SERVICE"
  echo "=============================="
  
  cd "$BASE_DIR/$SERVICE" || { echo "Diretório $SERVICE não encontrado!"; exit 1; }
  
  npm install
  
  cd - > /dev/null
done

# Gateway
echo "=============================="
echo "Instalando dependências no gateway"
echo "=============================="

cd "backend/gateway" || { echo "Diretório gateway não encontrado!"; exit 1; }
npm install
cd - > /dev/null

echo "=============================="
echo "Dependências instaladas em todos os serviços e gateway!"
echo "=============================="
