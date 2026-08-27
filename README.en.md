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

**MediaMorph** is a high-performance, open-source desktop application designed for **batch conversion, compression, video trimming, watermarking, and manipulation of images, videos, audios, and PDF documents**. Built with **Electron 33**, **React 18**, **TypeScript**, **Tailwind CSS**, **Sharp**, and **FFmpeg**, MediaMorph provides 100% offline, local, and secure multimedia processing with native hardware acceleration (GPU).

Engineered for creators, developers, designers, and power users, MediaMorph combines an industrial-grade media engine with a clean, responsive interface featuring light/dark themes and a built-in file explorer.

<div align="center">
  <img src="https://img.shields.io/badge/Electron-33.4.11-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron Version" />
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.15-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Platform" />
  <img src="https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge" alt="MIT License" />
</div>

---

## ⚡ What You Can Do with MediaMorph

Below is the complete catalogue of all capabilities, features, and media operations available:

### 🖼️ 1. Images & Icons
- **Multi-Format Conversion & Compression:** Convert between **PNG, JPG/JPEG, WebP, AVIF, GIF, TIFF, BMP, SVG, and ICO**.
- **Batch Watermarking:**
  - Custom **Text** or transparent **PNG Logo** overlays.
  - Controls for opacity (10% to 100%), font size, color, and positioning (*Center, Corners*).
- **Color Adjustments & Filters:**
  - Real-time sliders for **Brightness**, **Contrast**, **Saturation**, and **Sharpen**.
  - Quick 90°/180°/270° rotation and horizontal/vertical flipping.
- **Advanced Vector Rasterization (SVG):** Render SVGs with high-density scaling multipliers (1x, 2x, 4x, 8x).
- **Lossy & Lossless Modes:** Quality slider (1% to 100%) or mathematical lossless compression.
- **Native Windows Icon Generator (`.ico`):** Multi-resolution `.ico` icon creation for executables and desktop shortcuts.
- **Scale & Resolution Resizing:** Free scaling or social media presets (*Story 9:16, Feed 1:1, YouTube Thumbnail 16:9, Twitter Banner 3:1, Favicon 32x32*).
- **EXIF Metadata Stripping:** Remove camera details, timestamp, and GPS locations for privacy.
- **Interactive Before & After Split Slider:** Side-by-side comparison modal with live zoom and real-time disk space savings.

---

### 🎬 2. Videos & Animations
- **High-Efficiency Video Encoding:** Convert videos between **MP4 (H.264), WebM (VP9), MKV, AVI, MOV, FLV, WMV, M4V, and 3GP**.
- **GPU Hardware Acceleration:** Hardware encoding powered by **NVIDIA NVENC**, **Intel QuickSync**, and **AMD AMF**.
- **FPS & Speed / Timelapse Controls:**
  - Framerate options: *Keep Original, 60 FPS, 30 FPS, 24 FPS*.
  - Speed multiplier: *0.5x (slow motion), 1.0x (normal), 1.5x, 2.0x, 4.0x (timelapse)* with automatic audio pitch sync.
- **Aspect Ratio Cropping:** Automatic framing for *9:16 Vertical (Reels/Shorts/TikTok), 1:1 Square, 16:9 Widescreen, and 4:5 Portrait*.
- **Animated GIF Creation:** Convert any video clip into a smooth, lightweight animated GIF.
- **Multi-Format Audio Extraction:** Extract high-fidelity audio directly from videos into **MP3, WAV, FLAC, AAC, or OGG**.
- **Smart Target File Size Presets:**
  - *Discord Free Uploads (25 MB / 8 MB limits)*
  - *WhatsApp Attachments (16 MB limit)*
  - *Email & Quick Sharing (50 MB limit)*
- **CRF (Constant Rate Factor) Controls:** Fine-tune video compression from CRF 18 to CRF 35.
- **Video Downscaling:** Smart presets for *4K (2160p), Full HD (1080p), HD (720p), SD (480p), and 360p*.
- **Visual Video Trimmer:** Timeline scrubber with precise start/end handles, live video preview, and continuous loop playback.
- **One-Click Audio Stripping:** Export muted videos for social media feeds or presentation loops.
- **Instant Video Thumbnails:** Automatic frame preview extraction displayed in the file explorer and queue list.

---

### 🎵 3. Audio & Music
- **Audio Conversion:** Full support for **MP3, WAV, FLAC, AAC, OGG, M4A, WMA, and AIFF**.
- **Inline Mini Audio Player:** Play and preview audio files directly on queue cards and inside the file explorer before converting.
- **Bitrate Customization:** Choose between *128 kbps, 192 kbps, 256 kbps, and 320 kbps*.
- **Channel Mixing:** Toggle between **Stereo** and **Mono** output.
- **Dynamic Volume Normalization:** Normalize loud or quiet audio tracks automatically.

---

### 📄 4. PDF Documents
- **Images ➔ Single PDF:** Merge and compile multiple photos/images into a single PDF document with custom page order and quality compression.
- **PDF ➔ Page Extraction to Images:** Load any PDF document and extract each page as a standalone image in **WebP, PNG, JPEG, AVIF, or TIFF** (150 to 450 DPI).
- **Merge Multiple PDFs:** Combine multiple PDF documents into a single continuous file.
- **Split & Extract PDF Pages:** Extract page ranges (e.g. `1-5`, `3, 7-10`) into new standalone PDF documents.

---

### 📂 5. File Explorer, Productivity & Presets
- **Smart Batch Renaming:** Configure dynamic output naming templates using tags like `{name}`, `{date}`, `{counter}`, and `{ext}`.
- **User Presets Manager:** Save and load your favorite configuration setups with 1 click.
- **Queue Pause & Resume:** Pause heavy batch conversion tasks and resume anytime without losing progress.
- **Integrated File Explorer:** Browse local directories with shortcuts to *Downloads, Desktop, Pictures, Videos, Documents, and Local Disk (C:)*.
- **Whole-Folder Import:** Select any directory to recursively discover and import all supported media files into the queue.
- **Lifetime Savings Analytics:** Visual dashboard tracking total files processed, hours saved, and gigabytes reclaimed.
- **100% Offline & Private:** Zero cloud dependencies. Everything runs locally on your PC.

---

## 🛠️ Tech Stack

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

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Frontend ["🎨 Renderer Process (UI / React 18)"]
        UI["🖥️ Main Dashboard & App UI"]
        Explorer["📂 Integrated File Explorer with Thumbnails"]
        Trimmer["✂️ Visual Video Trimmer with Loop"]
        AudioPlayer["🎵 Inline Mini Audio Player"]
        Dropzone["📥 Drag & Drop File & Folder Zone"]
        Settings["⚙️ Global Settings, Watermark & Filters"]
        Presets["⭐ User Presets Manager"]
        Comparator["🖼️ Before vs After Split Slider"]
    end

    subgraph IPC ["⚡ Secure IPC Communication Bridge"]
        Bridge["🔒 contextBridge / electronAPI"]
    end

    subgraph Backend ["⚙️ Main Process (Node.js & Electron Main)"]
        Main["🧠 Electron Main Process"]
        ImgService["🖼️ imageService (Sharp, Watermark & Filters)"]
        VidService["🎬 videoService (FFmpeg, GPU NVENC & Audio Extractor)"]
        AudService["🎵 audioService (FFmpeg Audio Core)"]
        PdfService["📄 pdfService (PDF-Lib & PDF.js Engine)"]
    end

    subgraph Native ["💻 Operating System & Hardware"]
        FS["📁 Local File System (Windows)"]
        HW["⚡ GPU Hardware Acceleration (NVENC/QSV/AMF)"]
    end

    UI --> Bridge
    Explorer --> Bridge
    Trimmer --> Bridge
    AudioPlayer --> Bridge
    Dropzone --> Bridge
    Settings --> Bridge
    Presets --> Bridge
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

    VidService -.->|GPU Acceleration| HW
    Trimmer -.->|Local file:/// Stream| HW
```

---

## 📊 Supported Formats & Capabilities

| Media Type | Input Formats | Output Formats | Capabilities |
| :--- | :--- | :--- | :--- |
| **Images** | PNG, JPG, JPEG, WebP, AVIF, TIFF, GIF, SVG, BMP, ICO | WebP, AVIF, JPEG, PNG, GIF, TIFF, ICO | Watermark (text/logo), color filters (brightness/contrast/saturation/sharpen), rotate/flip, SVG density, presets, EXIF removal, multi-layer `.ico`. |
| **Videos** | MP4, MKV, MOV, AVI, WebM, FLV, WMV, M4V, 3GP | MP4, WebM, MKV, GIF, MP3, WAV, FLAC, AAC, OGG | GPU acceleration (NVENC/QSV/AMF), FPS (24/30/60), speed multiplier (0.5x-4x), crop (9:16, 1:1, 16:9), visual trimmer, target size limit. |
| **Audio** | MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF | MP3, WAV, FLAC, AAC, OGG | Inline mini audio player, custom bitrate (128k - 320k), stereo/mono mixing, volume normalization. |
| **PDF Documents** | PNG, JPG, JPEG, WebP, AVIF, TIFF, PDF | PDF (.pdf), WebP, PNG, JPEG, AVIF, TIFF | Multi-photo compiling, page extraction into high-res images (150 - 450 DPI), multi-PDF merging, page range splitting. |

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
# Compiles TypeScript, Vite bundle, Electron binaries and creates portable executable
npm run build
```

The standalone production executable will be created at:
📂 **`release/1.0.0/MediaMorph-Portable-1.0.0.exe`**

---

## 📑 Available Scripts

* `npm run dev`: Starts the Vite dev server and launches the Electron application window.
* `npm run build`: Compiles the frontend and packages the standalone Electron executable.
* `npm run build:frontend`: Runs type checking with `tsc` and builds production assets via Vite.
* `npm run build:exe`: Compiles and packages the Windows executable (`.exe`) with official icon patching.
* `npm run strip-comments`: Automatically strips source-code comments for clean production deployments.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.
