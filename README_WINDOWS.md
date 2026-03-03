# 7EMPIRES DRC - Professional Windows Build System

This application uses **Tauri**, the modern industry standard for high-performance desktop applications.

## Why this is the Best System:
1. **Native Performance**: Uses Windows WebView2 (Edge engine) for maximum speed.
2. **Tiny Size**: The installer is ~3MB (compared to 100MB+ for other systems).
3. **Professional Installer**: Generates a standard Windows `.msi` installer.
4. **No Python Required**: The app is self-contained and doesn't need a Python environment on the user's machine.

## How to Build the Installer (One-Time Setup):

1. **Install Prerequisites**:
   - Install **Node.js** (https://nodejs.org/)
   - Install **Rust** (https://rustup.rs/)
   - Install **C++ Build Tools** (Visual Studio Installer -> "Desktop development with C++")

2. **Build the App**:
   Open your terminal in the project folder and run:
   ```bash
   npm install
   npm run tauri build
   ```

3. **Find your Installer**:
   The professional `.msi` installer will be located in:
   `src-tauri/target/release/bundle/msi/7EMPIRES_Tutor_1.0.0_x64_en-US.msi`

## For Android:
The application is already optimized as a **Progressive Web App (PWA)**. 
- Open the App URL in Chrome on Android.
- Tap "Install App".
- It will work offline and feel like a native app.
