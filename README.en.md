<div align="center">
  <br/>
  <br/>
  <img src="./public/logo.svg" alt="MediaMorph Logo" width="380" />
  <br/>
  <br/>
  <p>
    🇺🇸 <strong>English Version</strong> | 🇧🇷 <a href="./README.md">Versão em Português</a>
  </p>
</div>

<br />

## 🌟 Overview

**MediaMorph** is a high-performance, open-source desktop application designed for **batch conversion, compression, video trimming, and manipulation of images, videos, audios, and PDF documents**. Built with **Electron 33**, **React 18**, **TypeScript**, **Tailwind CSS**, **Sharp**, and **FFmpeg**, MediaMorph provides 100% offline, local, and secure multimedia processing with hardware acceleration.

Engineered for creators, developers, designers, and power users, MediaMorph combines an industrial-grade media engine with a clean, responsive interface featuring light/dark themes and a built-in file explorer.

<div align="center">
  <img src="https://img.shields.io/badge/Electron-33.2.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Version" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.15-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Platform" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" />
</div>

---

## 🚀 Key Features

- 🖼️ **Advanced Image Processing:**
  - Lossy and lossless conversion/compression to **WebP, AVIF, JPEG, PNG, GIF, and TIFF**.
  - Native Windows Icon (**`.ico`**) generation with automatic multi-resolution scaling for shortcuts and executables.
  - Social media dimension presets (*Instagram Story 9:16, Feed 1:1, YouTube Thumbnail 16:9, Twitter Banner 3:1, Favicon 32x32*).
  - EXIF metadata stripping and alpha channel transparency preservation.
  - Interactive **Before vs After** comparison modal (*Split Slider*) with real-time file size savings calculation.

- 🎬 **Video Optimization & Visual Trimmer:**
  - High-efficiency encoding powered by **FFmpeg** for **MP4 (H.264), WebM (VP9), MKV, animated GIF**, or audio extraction to **MP3**.
  - Target file size compression presets (*Discord 25MB/8MB, WhatsApp 16MB, 50MB*) and manual Constant Rate Factor (*CRF 18-35*) controls.
  - **Integrated Visual Trimmer:** Dual-handle timeline scrubber with continuous loop playback constrained strictly to the selected cut.
  - One-click audio stripping for muted video export.

- 🎵 **Audio Processing:**
  - Support for **MP3, WAV, FLAC, AAC, and OGG**.
  - Custom bitrate controls (128k - 320k), stereo/mono channel mixing, and dynamic volume normalization.

- 📄 **PDF Document Compiler:**
  - Merge and compile multiple image files into a single high-definition PDF document with custom page compression.

- 📂 **Integrated File Explorer:**
  - Direct in-app directory browsing with system shortcuts (*Downloads, Pictures, Videos, Documents, Desktop, Local Drive C:*).
  - One-click recursive whole-folder imports into the processing queue.

- 🌓 **Light & Dark Theme Support:**
  - Responsive, eye-friendly design (`#161616` dark background and `#f1f1f1` light background) styled with `#10B981` and `#12F7AB` brand accents.

---

## 🛠️ Tech Stack

<div align="center">
  <img alt="Windows" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Windows.svg">
  <img alt="NodeJS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NodeJS.svg">
  <img alt="Typescript" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Typescript.svg">
  <img alt="React" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React.svg">
  <img alt="Vite" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Vite.svg">
  <img alt="TailwindCSS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/TailwindCSS.svg">
  <img alt="PostCSS" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PostCSS.svg">
  <img alt="Lucide" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Lucide.svg">
  <img alt="npm" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/npm.svg">
  <img alt="GIT" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/GIT.svg">
  <img alt="Conventional Commits" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Conventional%20Commits.svg">
  <img alt="Github Actions" height="60" width="60" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Github%20Actions.svg">
</div>

---

## 🏛️ System Architecture

MediaMorph adopts a modular layered architecture, decoupling the UI rendering layer from native backend worker services via IPC (*Inter-Process Communication*):

```mermaid
graph TB
    subgraph Frontend ["🎨 Renderer Process (UI / React 18)"]
        UI["🖥️ Main Dashboard & App UI"]
        Explorer["📂 Integrated File Explorer"]
        Trimmer["✂️ Visual Video Trimmer with Loop"]
        Dropzone["📥 Drag & Drop File & Folder Zone"]
        Settings["⚙️ Global & Per-File Settings"]
    end

    subgraph IPC ["⚡ Secure IPC Communication Bridge"]
        Bridge["🔒 contextBridge / electronAPI"]
    end

    subgraph Backend ["⚙️ Main Process (Node.js & Electron Main)"]
        Main["🧠 Electron Main Process"]
        ImgService["🖼️ imageService (Sharp & png-to-ico)"]
        VidService["🎬 videoService (FFmpeg & FFprobe)"]
        AudService["🎵 audioService (FFmpeg Audio Core)"]
        PdfService["📄 pdfService (PDF-Lib Engine)"]
    end

    subgraph Native ["💻 Operating System & Hardware"]
        FS["📁 Local File System (Windows)"]
        HW["⚡ Hardware Acceleration & Media Streaming"]
    end

    UI --> Bridge
    Explorer --> Bridge
    Trimmer --> Bridge
    Dropzone --> Bridge
    Settings --> Bridge

    Bridge --> Main
    Main --> ImgService
    Main --> VidService
    Main --> AudService
    Main --> PdfService

    ImgService --> FS
    VidService --> FS
    AudService --> FS
    PdfService --> FS

    Trimmer -.->|Local file:/// Stream| HW
```

---

## 📊 Supported Formats & Capabilities

| Media Type | Input Formats | Output Formats | Capabilities |
| :--- | :--- | :--- | :--- |
| **Images** | PNG, JPG, JPEG, WebP, AVIF, TIFF, GIF, SVG, BMP, ICO | WebP, AVIF, JPEG, PNG, GIF, TIFF, ICO | Scale/dimension resize, social presets, EXIF removal, lossless mode, `.ico` generator. |
| **Videos** | MP4, MKV, MOV, AVI, WebM, FLV, WMV, M4V, 3GP | MP4 (H.264), WebM (VP9), MKV, GIF, MP3 | CRF compression, target size limit (Discord/WhatsApp), 1080p/720p/480p/360p downscaling, visual trimmer, audio muting. |
| **Audio** | MP3, WAV, FLAC, AAC, OGG, M4A, WMA | MP3, WAV, FLAC, AAC, OGG | Bitrate adjustment (128k - 320k), stereo/mono mixing, volume normalization. |
| **Documents**| PNG, JPG, JPEG, WebP, AVIF, TIFF | PDF (.pdf) | Multi-image compilation, custom page ordering, adjustable quality. |

---

## 📦 Installation & Setup

### Prerequisites

* [Node.js](https://nodejs.org/) v18.0.0 or higher
* [NPM](https://www.npmjs.com/) (included with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/gui-bus/MediaMorph.git
cd MediaMorph
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run dev
```

### 4. Build and Package Executable (`.exe`)

```bash
# Compiles TypeScript, Vite bundle, Electron binaries and applies official icon resource
npm run build:exe
```

The standalone production executable will be created at:
📂 **`release/1.0.0/win-unpacked/MediaMorph.exe`**

---

## 📑 Available Scripts

* `npm run dev`: Starts the Vite dev server and launches the Electron application window.
* `npm run build`: Compiles the frontend and packages the base Electron build.
* `npm run build:frontend`: Runs type checking with `tsc` and builds production assets via Vite.
* `npm run build:exe`: Compiles and packages the Windows executable (`.exe`) with official icon patching.
* `npm run strip-comments`: Automatically strips source-code comments for clean production deployments.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.

---

<div align="center">
  Built with 💚 by <a href="https://github.com/gui-bus">Guilherme Bustamante</a>
</div>
