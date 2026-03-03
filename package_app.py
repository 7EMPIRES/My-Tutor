import os
import subprocess
import sys
import platform

def package():
    print("=== 7EMPIRES DRC PROFESSIONAL PACKAGING SYSTEM (TAURI) ===")
    print("The system has been upgraded to TAURI for maximum performance and professional distribution.")
    print("\nBENEFITS:")
    print("- Native Windows .msi installer")
    print("- Tiny executable size (~3MB)")
    print("- No Python runtime required on target machines")
    print("- Full support for Windows 7, 10, and 11")
    
    print("\nBUILD INSTRUCTIONS:")
    print("1. Ensure Node.js and Rust are installed.")
    print("2. Run: npm install")
    print("3. Run: npm run tauri build")
    
    print("\nYour professional installer will be in: src-tauri/target/release/bundle/msi/")
    print("See README_WINDOWS.md for full details.")

if __name__ == "__main__":
    package()
