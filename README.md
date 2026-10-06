# Vortex QR — Smart URL QR Studio & Site Recognition Engine

A web application designed with a high-contrast **Black, Pure White & Crimson Red** aesthetic. It converts user links into scannable QR codes that redirect to the target website, features smart site recognition, manages a persistent saved QR vault, provides an interactive zoom lightbox, and decodes QR images.

## Features

- **Link to QR Generator**:
  - Live scannable QR code generation that directly encodes valid URLs (`http://` / `https://`).
  - Pre-loaded with **Google AI Mode** (`https://www.google.com/search?q=Artificial+Intelligence&udm=14`) as the default sample.
  - Quick sample chips: Google AI Mode, Gemini AI, GitHub, YouTube, Wikipedia.
  - Auto-protocol handling, clipboard paste, and clear controls.

- **Smart Website Search & Classification Algorithm**:
  - Automatically identifies known web services and extracts clean brand names and favicons.
  - Live fuzzy search bar in the Saved Vault to filter saved sites by title, domain, or URL.

- **Saved QR Vault (Wireframe Layout)**:
  - Preserves saved QR codes across reloads using `localStorage`.
  - Layout matches the provided wireframe:
    - **Left**: Website title (customizable and editable inline), favicon, destination URL, timestamp, copy link, load in studio, and delete controls.
    - **Right**: High-contrast generated QR thumbnail in a framed box with a hover zoom overlay.
  - Delete any link individually or clear all items.

- **Interactive Zoom Lightbox**:
  - Click any QR code thumbnail (or the main QR code) to open the Zoom Modal.
  - Interactive zoom controls: `+` (Zoom In), `-` (Zoom Out), slider (80%–400%), reset button, double-click toggle, and mouse wheel zoom.
  - Built-in "Test Link" redirect button and high-resolution PNG download.

- **Image Scanner & Reverse QR Decoder ("If just image, generate QR")**:
  - Drag & drop, browse, or paste (`Ctrl+V` / `Cmd+V`) any QR image screenshot.
  - The built-in client-side engine (`jsQR`) decodes the embedded link, identifies which website it belongs to, and loads it into the generator.

- **Theme & Aesthetics**:
  - Dark Mode (Obsidian black with glowing Crimson Red accents) & Light Mode (Pure white with slate and crimson styling).
  - Responsive layout for desktop, tablet, and mobile.

## Running Locally

Open `index.html` directly in any web browser, or serve it with Python:

```bash
python3 -m http.server 8088
```

Then visit: [http://localhost:8088](http://localhost:8088)
