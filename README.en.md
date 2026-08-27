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
- **Smart Native Image Compressor (*TinyPNG / MozJPEG Style*):** Keep the original format (PNG stays PNG, JPG stays JPG) while slashing file size by up to 70-80% using level-9 palette quantization and MozJPEG.
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
- **Direct PDF Compression (Shrink MBs):** Compress heavy PDF files (e.g. 50 MB down to 5 MB) with smart presets (*Recommended 70%, High Quality 85%, Extreme 50%*), preserving original page dimensions and layout.
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

## 🚀 How to Download & Use (Portable Executable)

**MediaMorph** is distributed as a **standalone portable app for Windows (64-bit)**. No installation or dependencies (like Node.js or FFmpeg) required!

### 📥 Download Steps:

1. Go to the official release page: **[GitHub Releases - MediaMorph](https://github.com/gui-bus/MediaMorph/releases)**
2. Under the latest release (e.g. `v1.0.0`), download the portable executable:
   👉 **`MediaMorph-Portable-1.0.0.exe`**
3. Double-click the downloaded file and start converting, compressing, and editing your media immediately!

> [!TIP]
> Because it is 100% portable, you can copy the executable to a USB flash drive or any folder and run it without admin privileges or installers.

---

## 📊 Supported Formats & Capabilities

| Media Type | Input Formats | Output Formats | Capabilities |
| :--- | :--- | :--- | :--- |
| **Images** | PNG, JPG, JPEG, WebP, AVIF, TIFF, GIF, SVG, BMP, ICO | WebP, AVIF, JPEG, PNG, GIF, TIFF, ICO | TinyPNG compressor mode, watermark (text/logo), color filters (brightness/contrast/saturation/sharpen), rotate/flip, SVG density, presets, EXIF removal, multi-layer `.ico`. |
| **Videos** | MP4, MKV, MOV, AVI, WebM, FLV, WMV, M4V, 3GP | MP4, WebM, MKV, GIF, MP3, WAV, FLAC, AAC, OGG | GPU acceleration (NVENC/QSV/AMF), FPS (24/30/60), speed multiplier (0.5x-4x), crop (9:16, 1:1, 16:9), visual trimmer, target size limit. |
| **Audio** | MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF | MP3, WAV, FLAC, AAC, OGG | Inline mini audio player, custom bitrate (128k - 320k), stereo/mono mixing, volume normalization. |
| **PDF Documents** | PNG, JPG, JPEG, WebP, AVIF, TIFF, PDF | PDF (.pdf), WebP, PNG, JPEG, AVIF, TIFF | PDF compression (50 MB ➔ 5 MB), multi-photo compiling, page extraction into high-res images (150 - 450 DPI), multi-PDF merging, page range splitting. |

---

<details>
<summary>💻 <strong>For Developers (Build from Source)</strong></summary>

<br />

If you'd like to inspect the code or build custom modifications:

```bash
# 1. Clone the repository
git clone https://github.com/gui-bus/MediaMorph.git
cd MediaMorph

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev

# 4. Package portable executable
npm run build
```

</details>

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.
