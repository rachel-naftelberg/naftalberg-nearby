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
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaults = window.NaftalbergData ? window.NaftalbergData.DEFAULT_FOLDERS : [];
          let changed = false;
          defaults.forEach(def => {
            if (!parsed.some(f => f.id === def.id)) {
              parsed.push(def);
              changed = true;
            }
          });
          if (changed) {
            this.saveFolders(parsed);
          }
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
    const fallbackLat = window.locationService ? window.locationService.currentLat : 32.0853;
    const fallbackLng = window.locationService ? window.locationService.currentLng : 34.7818;

    const lat = !isNaN(parseFloat(folderData.hotelLat)) ? parseFloat(folderData.hotelLat) : fallbackLat;
    const lng = !isNaN(parseFloat(folderData.hotelLng)) ? parseFloat(folderData.hotelLng) : fallbackLng;

    const newFolder = {
      id,
      name: folderData.name || 'טיול חדש',
      city: folderData.city || 'יעד לא מוגדר',
      hotelName: folderData.hotelName || 'לא הוגדר מלון',
      hotelAddress: folderData.hotelAddress || '',
      hotelLat: lat,
      hotelLng: lng,
      hotelNotes: folderData.hotelNotes || '',
      coverGradient: folderData.coverGradient || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      icon: folderData.icon || '✈️',
      centerLat: lat,
      centerLng: lng,
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
