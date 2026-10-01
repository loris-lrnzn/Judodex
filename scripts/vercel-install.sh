#!/bin/sh
# Installation sur Vercel : bibliothèques système de Chromium (pré-rendu), puis npm.
# La commande ne tient pas dans vercel.json (installCommand est limité à 256 caractères).
if ! dnf install -y nss nspr atk at-spi2-atk cups-libs libdrm libxkbcommon libXcomposite libXdamage libXfixes libXrandr mesa-libgbm pango cairo alsa-lib > /dev/null; then
  echo "dnf : bibliothèques de Chromium non installées, les pages ne seront pas pré-rendues"
fi
npm install
