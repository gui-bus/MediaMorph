<div align="center">
  <br/>
  <br/>
  <img src="./public/logo.svg" alt="MediaMorph Logo" width="380" />
  <br/>
  <br/>
  <p>
    🇺🇸 <a href="./README.en.md">English Version</a> | 🇧🇷 <strong>Versão em Português</strong>
  </p>
</div>

<br />

## 🌟 Visão Geral

O **MediaMorph** é um aplicativo desktop open-source de alta performance para **conversão, compressão, corte e manipulação em lote de imagens, vídeos, áudios e documentos PDF**. Desenvolvido com **Electron 33**, **React 18**, **TypeScript**, **Tailwind CSS**, **Sharp** e **FFmpeg**, o MediaMorph oferece processamento 100% local, seguro e offline com aceleração nativa por hardware.

Projetado para criadores de conteúdo, desenvolvedores, designers e usuários exigentes, o MediaMorph une um motor de renderização multimídia de padrão industrial a uma interface moderna, responsiva, com suporte completo a temas claro/escuro e um explorador de arquivos integrado nativo.

<div align="center">
  <img src="https://img.shields.io/badge/Electron-33.4.11-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Version" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.15-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Platform" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" />
</div>

---

## ⚡ O Que Você Pode Fazer com o MediaMorph

Abaixo está o catálogo completo de todas as funcionalidades, operações e manipulações disponíveis:

### 🖼️ 1. Imagens & Ícones
- **Conversão e Compressão Multiformato:** Converta entre **PNG, JPG/JPEG, WebP, AVIF, GIF, TIFF, BMP, SVG e ICO**.
- **Compressão com Perdas (*Lossy*) ou Sem Perdas (*Lossless*):** Controle deslizante de qualidade visual de 1 a 100% ou compressão matemática sem perda de qualidade.
- **Gerador Nativo de Ícones Windows (`.ico`):** Transforme qualquer imagem em um arquivo de ícone de múltiplas camadas (256x256, 128x128, 64x64, 48x48, 32x32, 16x16) para executáveis e atalhos.
- **Redimensionamento por Escala e Resolução:**
  - Redimensionamento percentual livre (*25%, 50%, 75%, 100%, 150%, 200%*).
  - Largura e altura personalizadas com bloqueio de proporção (*Aspect Ratio*).
- **Presets Rápidos para Redes Sociais & Web:**
  - *Instagram Story / Reels (1080x1920 - 9:16)*
  - *Instagram Post / Feed (1080x1080 - 1:1)*
  - *Instagram Retrato (1080x1350 - 4:5)*
  - *YouTube Thumbnail (1280x720 - 16:9)*
  - *Banner Twitter/X (1500x500 - 3:1)*
  - *Post Twitter/X (1200x675 - 16:9)*
  - *Favicon Web (32x32)*
  - *Full HD (1920x1080) e 4K Ultra HD (3840x2160)*
- **Remoção de Metadados EXIF:** Exclua dados sensíveis de localização GPS, modelo da câmera e data/hora para proteger sua privacidade.
- **Comparador Antes & Depois (*Split Slider*):** Visualize as imagens original e comprimida lado a lado com divisor interativo, zoom e porcentagem de economia de espaço em tempo real.

---

### 🎬 2. Vídeos & Animações
- **Conversão de Alta Eficiência:** Converta vídeos entre **MP4 (H.264), WebM (VP9), MKV, AVI, MOV, FLV, WMV, M4V e 3GP**.
- **Gerador de GIF Animado:** Transforme qualquer trecho de vídeo em um GIF animado leve e fluido.
- **Extração Direta de Áudio:** Extraia a trilha sonora de qualquer vídeo diretamente para **MP3** com alta fidelidade.
- **Modos Inteligentes de Limitação de Tamanho:**
  - *Discord Free (Limite de 25 MB ou 8 MB)*
  - *WhatsApp (Limite de 16 MB)*
  - *Email / Anexo Rápido (Limite de 50 MB)*
- **Controle de Compressão CRF (*Constant Rate Factor*):** Ajuste fino de taxa de bits entre CRF 18 (qualidade de estúdio) e CRF 35 (máxima economia de espaço).
- **Redimensionamento de Vídeo:** Downscaling inteligente para *4K (2160p), Full HD (1080p), HD (720p), SD (480p) e 360p*.
- **Cortador Visual Integrado (*Video Trimmer*):** Régua interativa de linha do tempo com ajuste fino de ponto inicial e final, pré-visualização contínua e reprodução em loop estritamente no trecho selecionado.
- **Remoção de Áudio com 1 Clique:** Exporte vídeos totalmente mudos (*Mute*) para redes sociais ou apresentações.
- **Miniaturas (*Thumbnails*) Automáticas:** Captura instantânea de frame visual para visualização rápida no explorador e na fila.

---

### 🎵 3. Áudios & Músicas
- **Conversão de Áudio:** Suporte completo para **MP3, WAV, FLAC, AAC, OGG, M4A, WMA e AIFF**.
- **Controle de Taxa de Bits (*Bitrate*):** Seleção de qualidade entre *128 kbps (econômico), 192 kbps (equilibrado), 256 kbps (alta qualidade) e 320 kbps (estúdio)*.
- **Mixagem de Canais:** Alterne entre áudio **Estéreo** e **Mono**.
- **Normalização de Volume Dinâmica:** Nivele faixas de áudio baixas ou com picos excessivos automaticamente.

---

### 📄 4. Documentos PDF
- **Imagens ➔ PDF Único:** Combine e compile dezenas de imagens em um único arquivo PDF de alta definição com ordenação flexível e compressão visual ajustável.
- **PDF ➔ Extração de Páginas em Imagens:** Carregue qualquer arquivo PDF e extraia cada página individualmente como imagem nos formatos **WebP, PNG, JPEG, AVIF ou TIFF**.
- **Controle de Escala e Resolução DPI de Extração:**
  - `1.0x (~150 DPI)` - Ideal para visualização rápida na tela.
  - `2.0x (~300 DPI)` - Qualidade de impressão e leitura nítida de textos.
  - `3.0x (~450 DPI)` - Resolução ultra-alta para gráficos, diagramas e detalhes minuciosos.

---

### 📂 5. Gerenciamento, Fila & Produtividade
- **Explorador de Arquivos Integrado:** Navegue pela árvore de diretórios do seu computador sem sair do app, com atalhos para *Downloads, Área de Trabalho, Imagens, Vídeos, Documentos e Disco Local (C:)*.
- **Importação de Pastas Inteiras:** Selecione uma pasta e deixe o MediaMorph varrer recursivamente todas as mídias compatíveis para a fila com um único clique.
- **Drag & Drop Inteligente:** Arraste e solte arquivos individuais ou pastas inteiras direto na interface.
- **Processamento em Lote com Barra de Progresso:** Acompanhe o progresso individual e coletivo de conversão em tempo real.
- **Configuração Global e Individual:** Aplique uma regra geral para todos os itens ou ajuste formatos e resoluções arquivo por arquivo.
- **Estatísticas Históricas de Economia:** Painel com total de arquivos convertidos, tempo economizado e gigabytes de armazenamento liberados.
- **100% Local & Seguro:** Nenhum arquivo é enviado para servidores externos ou nuvem. Tudo roda na sua máquina com privacidade total.

---

## 🛠️ Stack Tecnológica

<div align="center">
  <img alt="Electron" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Electron.svg">
  <img alt="React" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React.svg">
  <img alt="Typescript" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Typescript.svg">
  <img alt="NodeJS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NodeJS.svg">
  <img alt="FFmpeg" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/FFmpeg.svg">
  <img alt="Sharp" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Sharp.svg">
  <img alt="PDF-Lib" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PDF-Lib.svg">
  <img alt="Vite" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Vite.svg">
  <img alt="TailwindCSS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/TailwindCSS.svg">
  <img alt="PostCSS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PostCSS.svg">
  <img alt="Lucide" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Lucide.svg">
  <img alt="Windows" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Windows.svg">
  <img alt="npm" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/npm.svg">
  <img alt="GIT" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/GIT.svg">
  <img alt="Conventional Commits" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Conventional%20Commits.svg">
  <img alt="Github Actions" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Github%20Actions.svg">
</div>

---

## 🏛️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph Frontend ["🎨 Processo de Renderização (UI / React 18)"]
        UI["🖥️ Interface Principal & Dashboard"]
        Explorer["📂 Explorador de Arquivos com Thumbnails"]
        Trimmer["✂️ Cortador Visual de Vídeo com Loop"]
        Dropzone["📥 Drag & Drop de Arquivos e Pastas"]
        Settings["⚙️ Configurações Globais & Individuais"]
        Comparator["🖼️ Comparador Antes vs Depois (Split Slider)"]
    end

    subgraph IPC ["⚡ Ponte de Comunicação Segura (Electron Preload)"]
        Bridge["🔒 contextBridge / electronAPI"]
    end

    subgraph Backend ["⚙️ Processo Principal (Node.js & Electron Main)"]
        Main["🧠 Electron Main Process"]
        ImgService["🖼️ imageService (Sharp & ICO Generator)"]
        VidService["🎬 videoService (FFmpeg & FFprobe)"]
        AudService["🎵 audioService (FFmpeg Audio Core)"]
        PdfService["📄 pdfService (PDF-Lib & PDF.js Engine)"]
    end

    subgraph Native ["💻 Sistema Operacional & Hardware"]
        FS["📁 Sistema de Arquivos Local (Windows)"]
        HW["⚡ Aceleração Gráfica & Hardware Media Stream"]
    end

    UI --> Bridge
    Explorer --> Bridge
    Trimmer --> Bridge
    Dropzone --> Bridge
    Settings --> Bridge
    Comparator --> Bridge

    Bridge --> Main
    Main --> ImgService
    Main --> VidService
    Main --> AudService
    Main --> PdfService

    ImgService --> FS
    VidService --> FS
    AudService --> FS
    PdfService --> FS

    Trimmer -.->|Stream Local file:///| HW
```

---

## 📊 Tabela de Formatos & Operações

| Mídia | Formatos de Entrada | Formatos de Saída | Principais Capacidades |
| :--- | :--- | :--- | :--- |
| **Imagens** | PNG, JPG, JPEG, WebP, AVIF, TIFF, GIF, SVG, BMP, ICO | WebP, AVIF, JPEG, PNG, GIF, TIFF, ICO | Redimensionamento livre/presets sociais, remoção de EXIF, modo lossless, geração de `.ico` multicamadas. |
| **Vídeos** | MP4, MKV, MOV, AVI, WebM, FLV, WMV, M4V, 3GP | MP4 (H.264), WebM (VP9), MKV, GIF, MP3 | Compressão por CRF, limite em MB (Discord/WhatsApp), downscaling para 1080p/720p/480p, cortador visual interativo, mutar áudio. |
| **Áudios** | MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF | MP3, WAV, FLAC, AAC, OGG | Taxa de bits personalizada (128k - 320k), mixagem estéreo/mono, normalização de volume. |
| **Documentos PDF** | PNG, JPG, JPEG, WebP, AVIF, TIFF, PDF | PDF (.pdf), WebP, PNG, JPEG, AVIF, TIFF | União de fotos em PDF único, extração de páginas em imagens de alta definição (150 - 450 DPI). |

---

## 📦 Instalação & Execução Local

### Pré-requisitos

* [Node.js](https://nodejs.org/) versão 18.0.0 ou superior
* [NPM](https://www.npmjs.com/) (incluso no Node.js) ou gerenciador de pacotes equivalente

### 1. Clonar o Repositório

```bash
git clone https://github.com/gui-bus/MediaMorph.git
cd MediaMorph
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar em Modo de Desenvolvimento

```bash
npm run dev
```

### 4. Compilar e Gerar o Executável (`.exe`)

```bash
# Compila o TypeScript, o bundle do Vite, os binários do Electron e gera o executável portátil
npm run build
```

O executável standalone pronto para uso será gerado na pasta:
📂 **`release/1.0.0/MediaMorph-Portable-1.0.0.exe`**

---

## 📑 Scripts Disponíveis

* `npm run dev`: Inicia o servidor de desenvolvimento Vite e abre a janela do Electron.
* `npm run build`: Compila o frontend e cria o executável standalone do Electron via electron-builder.
* `npm run build:frontend`: Realiza a checagem de tipos com `tsc` e compila os assets estáticos via Vite.
* `npm run build:exe`: Compila e empacota o executável Windows com ícone oficial.
* `npm run strip-comments`: Remove automaticamente comentários do código-fonte para builds de produção limpos.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
