# ⚡ MediaMorph

> **Compressor e Conversor Desktop de Imagens e Vídeos para Windows (.exe)**  
> 100% Gratuito, Sem Limites, 100% Offline, Sem Uploads para a Nuvem e com Processamento Nativo por Hardware.

---

## 🚀 Principais Recursos

- **🖼️ Imagens:**
  - **Entrada:** PNG, JPG, JPEG, WebP, AVIF, GIF, SVG, TIFF, BMP.
  - **Saída:** WebP, AVIF, JPEG, PNG, GIF, TIFF.
  - **Controles:** Controle de qualidade (1-100%), Modo Lossless (100% sem perda), Redimensionamento (75%, 50% ou original) e Remoção de Metadados EXIF (para privacidade).
  - **Engine:** `Sharp` (C++ multithread ultra-rápido).

- **🎥 Vídeos:**
  - **Entrada:** MP4, MKV, MOV, WebM, AVI, FLV, WMV, M4V.
  - **Saída:** MP4 (H.264/H.265), WebM (VP9), GIF Animado, Áudio MP3.
  - **Presets Inteligentes:**
    - *Equilibrado (CRF 23)* - Qualidade excelente e tamanho moderado.
    - *Super Leve (CRF 28)* - Máxima economia de espaço.
    - *Discord / WhatsApp* - Calcula automaticamente o bitrate para que o vídeo caiba perfeitamente no limite selecionado (8MB, 16MB, 25MB, 50MB, 100MB).
    - *Converter Vídeo em GIF Animado* com paleta otimizada.
    - *Extrair Áudio para MP3*.
  - **Engine:** `FFmpeg` estático embutido (não precisa instalar nada no Windows).

- **⚡ Recursos Gerais:**
  - Fila com processamento em lote (arraste dezenas de arquivos ao mesmo tempo).
  - Indicador de economia em tempo real (ex: `🔥 -78%` de redução de tamanho).
  - Botão direto para "Ver no Explorer" após a conversão.
  - Tema Dark moderno e responsivo.

---

## 📥 Como Baixar o Executável (.exe)

1. Acesse a aba **Releases** deste repositório no GitHub.
2. Baixe o instalador `MediaMorph-Setup-1.0.0.exe` ou a versão portátil `MediaMorph-Portable-1.0.0.exe`.
3. Dê dois cliques e use! **Não é necessário instalar Node.js, Python ou FFmpeg**.

---

## 🛠️ Como Rodar e Compilar Localmente

Se você deseja executar ou modificar o código-fonte:

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- NPM

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/mediamorph.git
cd mediamorph

# Instale as dependências
npm install
```

### 3. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```

### 4. Gerar o Executável (.exe) para Windows Localmente
```bash
npm run build:exe
```
O arquivo `.exe` será gerado dentro da pasta `release/1.0.0/`.

---

## 🤖 Compilação Automática no GitHub (GitHub Actions)

Este repositório já vem com o workflow configurado em `.github/workflows/release.yml`.

Toda vez que você criar uma nova versão (tag) no GitHub:
```bash
git tag v1.0.0
git push origin v1.0.0
```
Os servidores do GitHub irão:
1. Compilar o projeto automaticamente em uma máquina Windows na nuvem.
2. Criar a Release no GitHub com os arquivos `.exe` prontos para qualquer pessoa baixar de graça.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
