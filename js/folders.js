// ==========================================================================
// ניהול תיקיות טיולים ומלונות (Trip Folders & Hotel Management)
// ==========================================================================

const STORAGE_KEY_FOLDERS = 'naftalberg_trip_folders';
const STORAGE_KEY_ACTIVE = 'naftalberg_active_folder_id';

class FoldersManager {
  constructor() {
    this.folders = this.loadFolders();
    this.activeFolderId = this.loadActiveFolderId();
  }

  loadFolders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading folders from localStorage:', e);
    }
    // ברירת מחדל אם אין עדיין נתונים
    const defaults = window.NaftalbergData ? window.NaftalbergData.DEFAULT_FOLDERS : [];
    this.saveFolders(defaults);
    return defaults;
  }

  saveFolders(folders = this.folders) {
    this.folders = folders;
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.error('Error saving folders to localStorage:', e);
    }
  }

  loadActiveFolderId() {
    try {
      const active = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (active && this.folders.some(f => f.id === active)) {
        return active;
      }
    } catch (e) {
      console.error('Error loading active folder id:', e);
    }
    return this.folders[0] ? this.folders[0].id : null;
  }

  setActiveFolderId(id) {
    this.activeFolderId = id;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } catch (e) {
      console.error('Error setting active folder:', e);
    }
  }

  getActiveFolder() {
    const found = this.folders.find(f => f.id === this.activeFolderId);
    return found || this.folders[0] || null;
  }

  createFolder(folderData) {
    const id = 'folder-' + Date.now();
    const newFolder = {
      id,
      name: folderData.name || 'טיול חדש',
      city: folderData.city || 'יעד לא מוגדר',
      hotelName: folderData.hotelName || 'לא הוגדר מלון',
      hotelAddress: folderData.hotelAddress || '',
      hotelLat: parseFloat(folderData.hotelLat) || 41.9018,
      hotelLng: parseFloat(folderData.hotelLng) || 12.4938,
      hotelNotes: folderData.hotelNotes || '',
      coverGradient: folderData.coverGradient || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      icon: folderData.icon || '✈️',
      centerLat: parseFloat(folderData.hotelLat) || 41.9018,
      centerLng: parseFloat(folderData.hotelLng) || 12.4938,
      currentHotspotId: folderData.currentHotspotId || null,
      createdAt: new Date().toISOString()
    };
    this.folders.push(newFolder);
    this.saveFolders();
    this.setActiveFolderId(id);
    return newFolder;
  }

  updateFolder(id, updateData) {
    const index = this.folders.findIndex(f => f.id === id);
    if (index !== -1) {
      this.folders[index] = {
        ...this.folders[index],
        ...updateData
      };
      this.saveFolders();
      return this.folders[index];
    }
    return null;
  }

  deleteFolder(id) {
    if (this.folders.length <= 1) {
      alert('חייבת להישאר לפחות תיקיית טיול אחת באפליקציה.');
      return false;
    }
    this.folders = this.folders.filter(f => f.id !== id);
    if (this.activeFolderId === id) {
      this.activeFolderId = this.folders[0].id;
      this.setActiveFolderId(this.activeFolderId);
    }
    this.saveFolders();
    return true;
  }
}

window.foldersManager = new FoldersManager();
