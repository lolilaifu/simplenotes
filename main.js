const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store
const store = new Store();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close event
  mainWindow.on('close', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });
}

// App ready event
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-notes', () => {
  return store.get('notes', []);
});

ipcMain.handle('save-note', (event, note) => {
  const notes = store.get('notes', []);
  notes.push(note);
  store.set('notes', notes);
  return true;
});

ipcMain.handle('delete-note', (event, id) => {
  const notes = store.get('notes', []);
  const updatedNotes = notes.filter(note => note.id !== id);
  store.set('notes', updatedNotes);
  return true;
});

ipcMain.handle('update-note', (event, updatedNote) => {
  const notes = store.get('notes', []);
  const index = notes.findIndex(note => note.id === updatedNote.id);
  if (index !== -1) {
    notes[index] = updatedNote;
    store.set('notes', notes);
    return true;
  }
  return false;
});
