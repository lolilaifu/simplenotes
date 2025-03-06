# 📝 Simple Note-Taking App (Pre-Release)

🚧 **Status: Pre-Release (Buggy, Work in Progress)** 🚧  

This is a lightweight **Electron-based** note-taking application that allows users to create, delete, and (eventually) edit notes. Currently, the editing feature is **not working**.  

---

## ⚡ Features  
✅ Create new notes  
✅ Delete notes  
❌ Edit notes (Not working yet)  
⚠️ **Expect bugs** – this is an early version!  

---

## 📦 Installation & Setup  

### 1️⃣ Install Dependencies  
Make sure you have **Node.js** and **npm** installed. Then, run:  
```bash
npm install
```
## 2️⃣ Run the App

Start the Electron app with:  

```bash
npm start
```
## 📦 Build as an .exe (Windows)

To generate an executable file:

```bash
npx electron-packager . NoteApp --platform=win32 --arch=x64 --out=dist --overwrite
```


