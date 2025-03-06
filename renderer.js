document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.querySelector('.note-form');
    const noteContent = document.getElementById('note-content');
    const notesContainer = document.getElementById('notes-container');
    const searchInput = document.getElementById('search');
    const darkModeToggle = document.getElementById('toggle-dark-mode');
    let autoSaveTimeout;

    // Load saved notes
    loadNotes();

    // Handle note submission
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveNote();
    });

    // Auto-save functionality with input validation
    noteContent.addEventListener('input', () => {
        const content = noteContent.value.trim();
        if (content.length < 1 || content.length > 2000) {
            showError('Note must be between 1 and 2000 characters');
            return;
        }

        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(async () => {
            await saveNote();
        }, 1000);
    });

    // Enhanced search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = searchInput.value.toLowerCase();
            const notes = document.querySelectorAll('.note-item');
            
            notes.forEach(note => {
                const content = note.querySelector('.note-content').textContent.toLowerCase();
                const timestamp = note.querySelector('.note-timestamp').textContent.toLowerCase();
                note.style.display = content.includes(searchTerm) || timestamp.includes(searchTerm) 
                    ? 'block' 
                    : 'none';
            });
        }, 300);
    });

    // Dark mode toggle with animation and system preference
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? '' : 'dark');
        darkModeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? '' : 'dark');
    });

    // Load saved theme or system preference
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
    document.body.setAttribute('data-theme', savedTheme);
    darkModeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    async function loadNotes() {
        try {
            /** @type {Note[]} */
            const notes = await window.electronAPI.getNotes();
            notesContainer.innerHTML = '';
            notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            notes.forEach(note => {
                const noteElement = createNoteElement(note);
                notesContainer.appendChild(noteElement);
            });
        } catch (error) {
            console.error('Failed to load notes:', error);
            showError('Failed to load notes. Please try again.');
        }
    }

    /**
     * @param {Note} note 
     */
    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <div class="note-content">${note.content}</div>
            <div class="note-timestamp">Last updated: ${note.timestamp}</div>
            <div class="note-actions">
                <button class="edit-note" data-id="${note.id}" aria-label="Edit note">Edit</button>
                <button class="delete-note" data-id="${note.id}" aria-label="Delete note">Delete</button>
            </div>
        `;

        // Add edit functionality with validation
        noteElement.querySelector('.edit-note').addEventListener('click', async () => {
            const newContent = prompt('Edit your note:', note.content);
            if (newContent !== null) {
                if (newContent.trim().length < 1 || newContent.trim().length > 2000) {
                    showError('Note must be between 1 and 2000 characters');
                    return;
                }

                try {
                    const updatedNote = {
                        ...note,
                        content: newContent.trim(),
                        timestamp: new Date().toLocaleString()
                    };
                    const success = await window.electronAPI.updateNote(updatedNote);
                    if (success) {
                        loadNotes();
                    }
                } catch (error) {
                    console.error('Failed to update note:', error);
                    showError('Failed to update note. Please try again.');
                }
            }
        });

        // Add delete functionality with confirmation
        noteElement.querySelector('.delete-note').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this note?')) {
                try {
                    const success = await window.electronAPI.deleteNote(note.id);
                    if (success) {
                        loadNotes();
                    }
                } catch (error) {
                    console.error('Failed to delete note:', error);
                    showError('Failed to delete note. Please try again.');
                }
            }
        });

        return noteElement;
    }

    async function saveNote() {
        const content = noteContent.value.trim();
        if (content.length < 1 || content.length > 2000) {
            showError('Note must be between 1 and 2000 characters');
            return;
        }

        try {
            /** @type {Note} */
            const note = {
                id: Date.now(),
                content: content,
                timestamp: new Date().toLocaleString()
            };

            const success = await window.electronAPI.saveNote(note);
            if (success) {
                noteContent.value = '';
                loadNotes();
            }
        } catch (error) {
            console.error('Failed to save note:', error);
            showError('Failed to save note. Please try again.');
        }
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
});
