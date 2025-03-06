const { contextBridge, ipcRenderer } = require('electron');

// Type definitions for better type safety
/**
 * @typedef {Object} Note
 * @property {number} id
 * @property {string} content
 * @property {string} timestamp
 */

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * @returns {Promise<Note[]>}
     */
    getNotes: () => ipcRenderer.invoke('get-notes'),
    
    /**
     * @param {Note} note
     * @returns {Promise<boolean>}
     */
    saveNote: (note) => ipcRenderer.invoke('save-note', note),
    
    /**
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
    
    /**
     * @param {Note} updatedNote
     * @returns {Promise<boolean>}
     */
    updateNote: (updatedNote) => ipcRenderer.invoke('update-note', updatedNote)
});
