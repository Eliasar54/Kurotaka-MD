#!/bin/bash

clear

RED="\033[1;31m"
GREEN="\033[1;32m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"
RESET="\033[0m"

echo -e "${CYAN}"
echo "  ██████╗ ██╗████████╗██╗  ██╗██████╗ ██████╗ "
echo " ██╔═══██╗██║╚══██╔══╝██║  ██║██╔══██╗██╔══██╗"
echo " ██║   ██║██║   ██║   ███████║██████╔╝██████╔╝"
echo " ██║▄▄ ██║██║   ██║   ██╔══██║██╔═══╝ ██╔═══╝ "
echo " ╚██████╔╝██║   ██║   ██║  ██║██║     ██║     "
echo "  ╚══▀▀═╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝     "
echo -e "${RESET}"

read -p "Ruta de la carpeta: " folder_path
read -p "URL completa del repositorio (https://github.com/usuario/repositorio.git): " repo_url

if [ ! -d "$folder_path" ]; then
  echo -e "${RED}Error: Carpeta no encontrada.${RESET}"
  exit 1
fi

cd "$folder_path" || exit

echo -e "${BLUE}Añadiendo directorio a la lista de directorios seguros...${RESET}"
git config --global --add safe.directory "$folder_path"
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al añadir el directorio a la lista de directorios seguros.${RESET}"
  exit 1
fi
echo -e "${GREEN}Directorio añadido a la lista de directorios seguros.${RESET}"

if [ ! -d ".git" ]; then
  echo -e "${BLUE}Inicializando repositorio...${RESET}"
  git init &>/dev/null
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: No se pudo inicializar el repositorio.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}Repositorio inicializado.${RESET}"
fi

echo -e "${BLUE}Agregando archivos...${RESET}"
git add . &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al agregar archivos.${RESET}"
  exit 1
fi
echo -e "${GREEN}Archivos agregados.${RESET}"

read -p "Mensaje del commit: " commit_message
git commit -m "$commit_message" &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al realizar el commit.${RESET}"
  exit 1
fi
echo -e "${GREEN}Commit realizado: $commit_message${RESET}"

echo -e "${BLUE}Configurando rama main...${RESET}"
git branch -M main &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al configurar la rama main.${RESET}"
  exit 1
fi
echo -e "${GREEN}Rama main configurada.${RESET}"

echo -e "${BLUE}Configurando remoto...${RESET}"
git remote add origin "$repo_url" &>/dev/null
git remote -v &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al configurar el remoto. Verifique la URL o si ya existe el remoto.${RESET}"
  exit 1
fi
echo -e "${GREEN}Remoto configurado.${RESET}"

echo -e "${BLUE}Subiendo archivos...${RESET}"
git push -u origin main &>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error al subir los archivos. Verifique el token, la URL o los permisos.${RESET}"
  exit 1
fi

echo -e "${CYAN}Archivos subidos exitosamente.${RESET}"
