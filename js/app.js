// ==========================================================================
// אפליקציית "טיולי נפתלברג - מה בסביבה" - מנהל יישום ראשי (Main App Controller)
// ==========================================================================

class App {
  constructor() {
    this.currentView = 'explore'; // 'folders' or 'explore'
    this.currentCategory = 'all';
    this.placesCache = [];
  }

  async init() {
    console.log('🚀 טיולי נפתלברג - מה בסביבה | מאתחל מערכת...');

    // 1. אתחול מאזינים
    this.bindEvents();

    // 2. רינדור מסך התיקיות
    this.renderFolders();

    // 3. טעינת התיקייה הפעילה
    const activeFolder = window.foldersManager.getActiveFolder();
    if (activeFolder) {
      this.applyActiveFolder(activeFolder);
    } else {
      this.switchView('folders');
    }

    // 4. שעון חי בממשק
    this.startClock();

    // 5. אתחול מפה
    setTimeout(() => {
      window.mapService.initMap(
        'leafletMapContainer',
        window.locationService.currentLat,
        window.locationService.currentLng
      );
      this.refreshExploreView();
    }, 400);

    // 6. הרשמה לשינויי מיקום
    window.locationService.onLocationChange(() => {
      this.refreshExploreView();
    });
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      const dayName = days[now.getDay()];

      const timeEls = document.querySelectorAll('.live-device-clock-text');
      timeEls.forEach(el => {
        el.textContent = `יום ${dayName}, ${hours}:${minutes}`;
      });
    };
    updateTime();
    setInterval(updateTime, 30000);
  }

  bindEvents() {
    // ניווט ראשי
    document.querySelectorAll('[data-view-target]').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget.getAttribute('data-view-target');
        this.switchView(target);
      });
    });

    // כפתור "איפה אני נמצא עכשיו?"
    const whereAmIBtn = document.getElementById('btnWhereAmI');
    if (whereAmIBtn) {
      whereAmIBtn.addEventListener('click', () => {
        window.attractionModalManager.openModal();
      });
    }

    // סגירת מודל אטרקציה
    const closeAttrModalBtn = document.getElementById('closeAttrModal');
    if (closeAttrModalBtn) {
      closeAttrModalBtn.addEventListener('click', () => {
        window.attractionModalManager.closeModal();
      });
    }

    const attrModalOverlay = document.getElementById('attractionModal');
    if (attrModalOverlay) {
      attrModalOverlay.addEventListener('click', e => {
        if (e.target === attrModalOverlay) {
          window.attractionModalManager.closeModal();
        }
      });
    }

    // כפתור GPS חי
    const liveGPSBtn = document.getElementById('btnLiveGPS');
    if (liveGPSBtn) {
      liveGPSBtn.addEventListener('click', async () => {
        try {
          liveGPSBtn.classList.add('loading');
          await window.locationService.requestLiveGPS();
        } catch (err) {
          console.warn('GPS request failed:', err);
        } finally {
          liveGPSBtn.classList.remove('loading');
        }
      });
    }

    // סימולטור נקודות ציון
    const hotspotSelect = document.getElementById('hotspotSelector');
    if (hotspotSelect) {
      hotspotSelect.addEventListener('change', e => {
        const spotId = e.target.value;
        const spot = window.NaftalbergData.HOTSPOTS_DATA[spotId];
        if (spot) {
          window.locationService.setLocation(spot.lat, spot.lng, spot.name, false);
        }
      });
    }

    // קטגוריות סינון
    document.querySelectorAll('.category-tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const cat = e.currentTarget.getAttribute('data-category');
        this.currentCategory = cat;
        this.renderPlacesList();
      });
    });

    // שורת חיפוש
    const searchInput = document.getElementById('placesSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        window.placesService.searchQuery = e.target.value;
        this.renderPlacesList();
      });
    }

    // יצירת תיקייה חדשה
    const openCreateFolderBtn = document.getElementById('btnOpenCreateFolder');
    if (openCreateFolderBtn) {
      openCreateFolderBtn.addEventListener('click', () => {
        this.openFolderModal();
      });
    }

    const closeFolderModalBtn = document.getElementById('closeFolderModal');
    if (closeFolderModalBtn) {
      closeFolderModalBtn.addEventListener('click', () => {
        this.closeFolderModal();
      });
    }

    const folderForm = document.getElementById('folderForm');
    if (folderForm) {
      folderForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleSaveNewFolder();
      });
    }

    // עריכת פרטי מלון
    const editHotelBtn = document.getElementById('btnEditHotel');
    if (editHotelBtn) {
      editHotelBtn.addEventListener('click', () => {
        this.openEditHotelModal();
      });
    }

    const closeHotelModalBtn = document.getElementById('closeHotelModal');
    if (closeHotelModalBtn) {
      closeHotelModalBtn.addEventListener('click', () => {
        this.closeEditHotelModal();
      });
    }

    const hotelForm = document.getElementById('hotelForm');
    if (hotelForm) {
      hotelForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleSaveHotelDetails();
      });
    }

    // מתג תצוגת מפה / כרטיסיות במסכים קטנים
    const toggleMapBtn = document.getElementById('btnToggleMobileMap');
    if (toggleMapBtn) {
      toggleMapBtn.addEventListener('click', () => {
        const layout = document.querySelector('.explore-content-layout');
        if (layout) {
          layout.classList.toggle('show-map-full');
          if (window.mapService.map) {
            setTimeout(() => window.mapService.map.invalidateSize(), 200);
          }
        }
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-screen').forEach(s => s.classList.remove('active'));
    
    if (viewName === 'folders') {
      const foldersView = document.getElementById('viewFolders');
      if (foldersView) foldersView.classList.add('active');
      this.renderFolders();
    } else {
      const exploreView = document.getElementById('viewExplore');
      if (exploreView) exploreView.classList.add('active');
      this.refreshExploreView();
      if (window.mapService.map) {
        setTimeout(() => window.mapService.map.invalidateSize(), 200);
      }
    }

    // עדכון תפריט תחתון
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const target = item.getAttribute('data-view-target');
      if (target === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  applyActiveFolder(folder) {
    window.foldersManager.setActiveFolderId(folder.id);

    // עדכון כותרות ב-Explore
    const tripNameEl = document.getElementById('activeTripName');
    if (tripNameEl) tripNameEl.textContent = folder.name;

    const tripCityEl = document.getElementById('activeTripCity');
    if (tripCityEl) tripCityEl.textContent = folder.city;

    const folderBadgeIcon = document.getElementById('activeFolderIcon');
    if (folderBadgeIcon) folderBadgeIcon.textContent = folder.icon || '✈️';

    // הגדרת מיקום התחלתי בעיר התיקייה
    if (folder.currentHotspotId && window.NaftalbergData.HOTSPOTS_DATA[folder.currentHotspotId]) {
      const spot = window.NaftalbergData.HOTSPOTS_DATA[folder.currentHotspotId];
      window.locationService.setLocation(spot.lat, spot.lng, spot.name, false);
      const selector = document.getElementById('hotspotSelector');
      if (selector) selector.value = folder.currentHotspotId;
    } else {
      window.locationService.setLocation(folder.centerLat || folder.hotelLat, folder.centerLng || folder.hotelLng, folder.city, false);
    }

    this.refreshExploreView();
  }

  async refreshExploreView() {
    const activeFolder = window.foldersManager.getActiveFolder();
    if (!activeFolder) return;

    const currentLat = window.locationService.currentLat;
    const currentLng = window.locationService.currentLng;

    // 1. עדכון מפה: משתמש, מלון ומסלול
    window.mapService.updateUserMarker(currentLat, currentLng);
    window.mapService.updateHotelMarker(
      activeFolder.hotelLat,
      activeFolder.hotelLng,
      activeFolder.hotelName,
      activeFolder.hotelAddress
    );

    // 2. עדכון ווידג'ט מרחק מהמלון
    this.updateHotelDistanceWidget(activeFolder, currentLat, currentLng);

    // 3. עדכון מזג אוויר חי
    this.updateWeatherWidget(currentLat, currentLng);

    // 4. עדכון רשימת מקומות בסביבה
    this.placesCache = window.placesService.getNearbyPlaces(currentLat, currentLng);
    this.renderPlacesList();

    // 5. עדכון סיכות מקומות במפה
    window.mapService.renderNearbyMarkers(this.placesCache);

    // 6. עדכון באנר האטרקציה הקרובה
    this.updateNearestHeroBanner(currentLat, currentLng);
  }

  updateNearestHeroBanner(lat, lng) {
    const spot = window.attractionModalManager.findNearestAttraction(lat, lng);
    const heroTitle = document.getElementById('heroAttractionTitle');
    const heroDistance = document.getElementById('heroAttractionDistance');
    const heroStatus = document.getElementById('heroAttractionStatus');

    if (spot) {
      if (heroTitle) heroTitle.textContent = spot.name;
      if (heroDistance) {
        heroDistance.textContent = `📍 במרחק ${window.hotelDistanceCalculator.formatDistance(spot.distanceMeters)} ממך`;
      }
      
      const deviceTime = window.attractionModalManager.getDeviceDateTime();
      const openStatus = window.attractionModalManager.checkOpenStatus(spot.schedule, deviceTime);
      if (heroStatus) {
        heroStatus.textContent = openStatus.statusText;
        heroStatus.className = `hero-status-pill ${openStatus.badgeClass}`;
      }
    }
  }

  updateHotelDistanceWidget(folder, userLat, userLng) {
    const hotelInfo = window.hotelDistanceCalculator.calculateTrip(
      userLat,
      userLng,
      folder.hotelLat,
      folder.hotelLng,
      folder.city.includes('ישראל') ? '₪' : '€'
    );

    // שם המלון והמרחק הכללי
    const nameEl = document.getElementById('hotelWidgetName');
    if (nameEl) nameEl.textContent = folder.hotelName;

    const addressEl = document.getElementById('hotelWidgetAddress');
    if (addressEl) addressEl.textContent = folder.hotelAddress || 'לא צוינה כתובת';

    const distEl = document.getElementById('hotelWidgetTotalDist');
    if (distEl) distEl.textContent = hotelInfo.formattedDistance;

    // הליכה ברגל
    const walkTimeEl = document.getElementById('hotelWalkTime');
    if (walkTimeEl) walkTimeEl.textContent = `${hotelInfo.walking.minutes} דק׳`;

    const walkStepsEl = document.getElementById('hotelWalkSteps');
    if (walkStepsEl) walkStepsEl.textContent = `${hotelInfo.walking.steps} צעדים`;

    const walkBtn = document.getElementById('hotelWalkNavBtn');
    if (walkBtn) walkBtn.href = hotelInfo.walking.mapsUrl;

    // תחבורה ציבורית
    const transitTimeEl = document.getElementById('hotelTransitTime');
    if (transitTimeEl) transitTimeEl.textContent = `${hotelInfo.transit.minutes} דק׳`;

    const transitAdvEl = document.getElementById('hotelTransitAdvice');
    if (transitAdvEl) transitAdvEl.textContent = hotelInfo.transit.advice;

    const transitBtn = document.getElementById('hotelTransitNavBtn');
    if (transitBtn) transitBtn.href = hotelInfo.transit.mapsUrl;

    // רכב / מונית
    const driveTimeEl = document.getElementById('hotelDriveTime');
    if (driveTimeEl) driveTimeEl.textContent = `${hotelInfo.driving.minutes} דק׳`;

    const driveCostEl = document.getElementById('hotelDriveCost');
    if (driveCostEl) driveCostEl.textContent = hotelInfo.driving.taxiCost;

    const driveBtn = document.getElementById('hotelDriveNavBtn');
    if (driveBtn) driveBtn.href = hotelInfo.driving.mapsUrl;

    // כפתור חזרה מהירה למלון
    const directNavBtn = document.getElementById('hotelDirectNavigateBtn');
    if (directNavBtn) directNavBtn.href = hotelInfo.walking.mapsUrl;
  }

  async updateWeatherWidget(lat, lng) {
    const weather = await window.weatherService.fetchWeather(lat, lng);
    
    const tempEl = document.getElementById('weatherTemp');
    if (tempEl) tempEl.textContent = `${weather.temperature}°C`;

    const iconEl = document.getElementById('weatherIcon');
    if (iconEl) iconEl.textContent = weather.icon;

    const condEl = document.getElementById('weatherCondition');
    if (condEl) condEl.textContent = weather.conditionText;

    const tipEl = document.getElementById('weatherTipText');
    if (tipEl) tipEl.textContent = weather.tip;

    const windEl = document.getElementById('weatherWind');
    if (windEl) windEl.textContent = `💨 ${weather.windSpeed} קמ״ש`;

    const humEl = document.getElementById('weatherHumidity');
    if (humEl) humEl.textContent = `💧 ${weather.humidity}% לחות`;
  }

  renderPlacesList() {
    const container = document.getElementById('placesListContainer');
    if (!container) return;

    const filtered = window.placesService.filterPlaces(
      this.placesCache,
      this.currentCategory,
      window.placesService.searchQuery
    );

    const countBadge = document.getElementById('placesCountBadge');
    if (countBadge) countBadge.textContent = `${filtered.length} מקומות`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-places-state">
          <div class="empty-icon">🔍</div>
          <h4>לא נמצאו תוצאות לסינון זה</h4>
          <p>נסו לבחור קטגוריה אחרת או לנקות את מונח החיפוש.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => window.placesService.renderPlaceCard(p)).join('');
  }

  renderFolders() {
    const grid = document.getElementById('foldersGrid');
    if (!grid) return;

    const folders = window.foldersManager.folders;
    const activeId = window.foldersManager.activeFolderId;

    grid.innerHTML = folders
      .map(folder => {
        const isActive = folder.id === activeId;
        return `
          <div class="folder-card ${isActive ? 'active-trip' : ''}" style="border-top: 5px solid ${folder.coverGradient ? '#3b82f6' : '#f59e0b'};">
            <div class="folder-header-bar">
              <span class="folder-emoji">${folder.icon || '✈️'}</span>
              ${isActive ? '<span class="active-badge">פעיל כעת ✨</span>' : ''}
            </div>

            <div class="folder-body">
              <h3 class="folder-title">${folder.name}</h3>
              <p class="folder-city">📍 ${folder.city}</p>

              <div class="folder-hotel-preview">
                <div class="hotel-title-row">
                  <span class="hotel-label">🏨 מלון שמור:</span>
                  <strong class="hotel-name">${folder.hotelName}</strong>
                </div>
                ${folder.hotelAddress ? `<div class="hotel-address-line">${folder.hotelAddress}</div>` : ''}
                ${folder.hotelNotes ? `<div class="hotel-notes-preview">💬 ${folder.hotelNotes}</div>` : ''}
              </div>
            </div>

            <div class="folder-card-footer">
              <button class="btn-select-folder" onclick="window.app.handleSelectFolder('${folder.id}')">
                ${isActive ? '👉 פתח טיול' : 'בחר טיול זה'}
              </button>
              <div class="folder-actions-secondary">
                <button class="btn-icon-action" onclick="window.app.openEditHotelModal('${folder.id}')" title="ערוך פרטי מלון">✏️ מלון</button>
                <button class="btn-icon-action delete" onclick="window.app.handleDeleteFolder('${folder.id}')" title="מחק תיקייה">🗑️</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  handleSelectFolder(id) {
    const folder = window.foldersManager.folders.find(f => f.id === id);
    if (folder) {
      this.applyActiveFolder(folder);
      this.switchView('explore');
    }
  }

  handleDeleteFolder(id) {
    if (confirm('האם למחוק תיקיית טיול זו?')) {
      const success = window.foldersManager.deleteFolder(id);
      if (success) {
        this.renderFolders();
      }
    }
  }

  openFolderModal() {
    const modal = document.getElementById('folderCreateModal');
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeFolderModal() {
    const modal = document.getElementById('folderCreateModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  handleSaveNewFolder() {
    const name = document.getElementById('newTripName').value.trim();
    const city = document.getElementById('newTripCity').value.trim();
    const hotelName = document.getElementById('newTripHotel').value.trim();
    const hotelAddress = document.getElementById('newTripHotelAddress').value.trim();
    const hotelNotes = document.getElementById('newTripHotelNotes').value.trim();
    const icon = document.getElementById('newTripIcon').value || '✈️';

    if (!name || !city || !hotelName) {
      alert('נא למלא שם טיול, עיר ושם מלון.');
      return;
    }

    // קביעת קואורדינטות לפי עיר נבחרת או מרכז אירופה
    let lat = 41.9018;
    let lng = 12.4938;
    let hotspotId = null;

    if (city.includes('פריז') || city.toLowerCase().includes('paris')) {
      lat = 48.8566;
      lng = 2.3522;
      hotspotId = 'paris-eiffel';
    } else if (city.includes('ברצלונה') || city.toLowerCase().includes('barcelona')) {
      lat = 41.3879;
      lng = 2.1699;
      hotspotId = 'bcn-sagrada';
    } else if (city.includes('תל אביב') || city.toLowerCase().includes('tel aviv')) {
      lat = 32.0853;
      lng = 34.7818;
      hotspotId = 'tlv-beach';
    } else if (city.includes('רומא') || city.toLowerCase().includes('rome')) {
      lat = 41.9018;
      lng = 12.4938;
      hotspotId = 'rome-colosseum';
    }

    const newFolder = window.foldersManager.createFolder({
      name,
      city,
      hotelName,
      hotelAddress,
      hotelLat: lat,
      hotelLng: lng,
      hotelNotes,
      icon,
      currentHotspotId: hotspotId
    });

    this.closeFolderModal();
    this.renderFolders();
    this.applyActiveFolder(newFolder);
    this.switchView('explore');
  }

  openEditHotelModal(folderId = null) {
    const id = folderId || window.foldersManager.activeFolderId;
    const folder = window.foldersManager.folders.find(f => f.id === id);
    if (!folder) return;

    document.getElementById('editHotelFolderId').value = folder.id;
    document.getElementById('editHotelName').value = folder.hotelName;
    document.getElementById('editHotelAddress').value = folder.hotelAddress || '';
    document.getElementById('editHotelLat').value = folder.hotelLat || '';
    document.getElementById('editHotelLng').value = folder.hotelLng || '';
    document.getElementById('editHotelNotes').value = folder.hotelNotes || '';

    const modal = document.getElementById('hotelEditModal');
    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  closeEditHotelModal() {
    const modal = document.getElementById('hotelEditModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  handleSaveHotelDetails() {
    const id = document.getElementById('editHotelFolderId').value;
    const hotelName = document.getElementById('editHotelName').value.trim();
    const hotelAddress = document.getElementById('editHotelAddress').value.trim();
    const hotelLat = parseFloat(document.getElementById('editHotelLat').value) || 41.9018;
    const hotelLng = parseFloat(document.getElementById('editHotelLng').value) || 12.4938;
    const hotelNotes = document.getElementById('editHotelNotes').value.trim();

    if (!hotelName) {
      alert('נא להזין שם מלון.');
      return;
    }

    window.foldersManager.updateFolder(id, {
      hotelName,
      hotelAddress,
      hotelLat,
      hotelLng,
      hotelNotes
    });

    this.closeEditHotelModal();
    this.renderFolders();

    if (window.foldersManager.activeFolderId === id) {
      const active = window.foldersManager.getActiveFolder();
      this.applyActiveFolder(active);
    }
  }
}

window.app = new App();

// הפעלה כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
