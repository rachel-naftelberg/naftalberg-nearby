// ==========================================================================
// טיולי נפתלברג - מה בסביבה | הבקר הראשי (Main App Controller)
// חיבור כל הרכיבים: תיקיות, מיקום, מזג אוויר, מרחק מהמלון ואטרקציות
// ==========================================================================

class NaftalbergApp {
  constructor() {
    this.currentView = 'folders';
    this.currentCategory = 'all';
    this.placesCache = [];
  }

  init() {
    // 1. שעון חי בממשק
    this.startDeviceClock();

    // 2. אתחול מאזיני אירועים
    this.bindEvents();

    // 3. הצגת מסך תיקיות כברירת מחדל בכניסה
    this.renderFolders();
    this.switchView('folders');

    // 4. אתחול מפה עם השהייה קלה לטעינת DOM
    setTimeout(() => {
      const active = window.foldersManager.getActiveFolder();
      const lat = active ? active.hotelLat : 32.5714;
      const lng = active ? active.hotelLng : 34.9530;
      window.mapService.initMap('leafletMap', lat, lng);
    }, 300);

    // 5. הרשמה לשינויי מיקום
    window.locationService.onLocationChange(() => {
      if (this.currentView === 'explore') {
        this.refreshExploreView();
      }
    });
  }

  // עדכון שעון המכשיר בכל שנייה
  startDeviceClock() {
    const clockDisplay = document.getElementById('headerClockText');
    const update = () => {
      const dt = window.attractionModalManager.getDeviceDateTime();
      if (clockDisplay) {
        clockDisplay.textContent = `${dt.dayName}, ${dt.timeStr}`;
      }
    };
    update();
    setInterval(update, 1000);
  }

  bindEvents() {
    // מעבר בין מסכים מתפריט תחתון ומעלה
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', e => {
        const target = e.currentTarget.getAttribute('data-target');
        if (target === 'viewFolders') {
          this.switchView('folders');
        } else if (target === 'viewExplore') {
          this.switchView('explore');
        } else if (target === 'mapSection') {
          this.switchView('explore');
          setTimeout(() => {
            const mapEl = document.getElementById('mapSection');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      });
    });

    const btnHeaderFolders = document.getElementById('btnHeaderFolders');
    if (btnHeaderFolders) {
      btnHeaderFolders.addEventListener('click', () => this.switchView('folders'));
    }

    const btnSwitchTrip = document.getElementById('btnSwitchTrip');
    if (btnSwitchTrip) {
      btnSwitchTrip.addEventListener('click', () => this.switchView('folders'));
    }

    // פתיחת מודל יצירת תיקייה
    const btnOpenCreate = document.getElementById('btnOpenCreateFolder');
    if (btnOpenCreate) {
      btnOpenCreate.addEventListener('click', () => this.openFolderModal());
    }

    const btnCloseFolderModal = document.getElementById('btnCloseFolderModal');
    if (btnCloseFolderModal) {
      btnCloseFolderModal.addEventListener('click', () => this.closeFolderModal());
    }

    const backdropFolder = document.getElementById('backdropFolder');
    if (backdropFolder) {
      backdropFolder.addEventListener('click', () => this.closeFolderModal());
    }

    // טופס שמירת תיקייה
    const formFolder = document.getElementById('formFolder');
    if (formFolder) {
      formFolder.addEventListener('submit', e => {
        e.preventDefault();
        this.handleSaveNewFolder();
      });
    }

    // כפתור שימוש במיקום ה-GPS הנוכחי עבור המלון
    const btnUseGpsForHotel = document.getElementById('btnUseGpsForHotel');
    if (btnUseGpsForHotel) {
      btnUseGpsForHotel.addEventListener('click', async () => {
        btnUseGpsForHotel.textContent = '⏳ קורא מיקום GPS...';
        try {
          const coords = await window.locationService.requestLiveGPS();
          document.getElementById('formHotelLat').value = coords.lat;
          document.getElementById('formHotelLng').value = coords.lng;

          // Reverse geocode
          try {
            const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18`, { headers: { 'Accept-Language': 'he,en' } });
            const d = await rev.json();
            if (d && d.display_name) {
              document.getElementById('formHotelAddress').value = d.display_name.split(',').slice(0, 3).join(',');
              if (!document.getElementById('formTripCity').value) {
                document.getElementById('formTripCity').value = d.address?.city || d.address?.town || d.address?.village || 'ישראל';
              }
            }
          } catch (_) {}

          btnUseGpsForHotel.textContent = '✓ נקלט מיקום ה-GPS הנוכחי!';
          const statusHint = document.getElementById('gpsHotelStatusHint');
          if (statusHint) statusHint.textContent = `קואורדינטות: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
        } catch (err) {
          btnUseGpsForHotel.textContent = '⚠️ שגיאה בקריאת GPS';
        }
      });
    }

    // כפתור קריאת GPS חי מהמכשיר בבאנר הראשי
    const btnLiveGps = document.getElementById('btnLiveGps');
    if (btnLiveGps) {
      btnLiveGps.addEventListener('click', async () => {
        btnLiveGps.innerHTML = '<span class="gps-pulse-dot"></span><span>⏳ מחפש לוויינים...</span>';
        try {
          await window.locationService.requestLiveGPS();
          btnLiveGps.innerHTML = '<span class="gps-pulse-dot"></span><span>✓ מיקום חי פעיל</span>';
          this.refreshExploreView();
        } catch (err) {
          btnLiveGps.innerHTML = '<span class="gps-pulse-dot"></span><span>⚠️ GPS לא זמין</span>';
        }
      });
    }

    // החלפת נקודת ציון (סימולטור)
    const hotspotSelect = document.getElementById('hotspotSelect');
    if (hotspotSelect) {
      hotspotSelect.addEventListener('change', e => {
        const spotId = e.target.value;
        const spot = window.NaftalbergData.HOTSPOTS_DATA[spotId];
        if (spot) {
          if (window.attractionModalManager) {
            window.attractionModalManager.selectedSpot = spot;
          }
          window.locationService.setLocation(spot.lat, spot.lng, spot.name, false);
          this.refreshExploreView();
        }
      });
    }

    // פתיחה וסגירה של מודל "איפה אני נמצא"
    const btnOpenAttraction = document.getElementById('btnOpenAttractionModal');
    if (btnOpenAttraction) {
      btnOpenAttraction.addEventListener('click', () => {
        window.attractionModalManager.openModal();
      });
    }

    const btnCloseAttraction = document.getElementById('btnCloseAttractionModal');
    if (btnCloseAttraction) {
      btnCloseAttraction.addEventListener('click', () => {
        window.attractionModalManager.closeModal();
      });
    }

    const backdropAttraction = document.getElementById('backdropAttraction');
    if (backdropAttraction) {
      backdropAttraction.addEventListener('click', () => {
        window.attractionModalManager.closeModal();
      });
    }

    // כפתור הצג במפה בבאנר Hero
    const btnFocusMapAttraction = document.getElementById('btnFocusMapAttraction');
    if (btnFocusMapAttraction) {
      btnFocusMapAttraction.addEventListener('click', () => {
        const lat = window.locationService.currentLat;
        const lng = window.locationService.currentLng;
        window.mapService.flyToAndHighlight(lat, lng);
      });
    }

    // עריכת מלון מהירה מווידג'ט המלון
    const btnOpenEditHotel = document.getElementById('btnOpenEditHotel');
    if (btnOpenEditHotel) {
      btnOpenEditHotel.addEventListener('click', () => {
        const active = window.foldersManager.getActiveFolder();
        if (active) this.openFolderModal(active.id);
      });
    }

    // תיקון מיקום מלון בלחיצה אחת מההתראה
    const btnFixHotelGps = document.getElementById('btnFixHotelGps');
    if (btnFixHotelGps) {
      btnFixHotelGps.addEventListener('click', () => {
        const active = window.foldersManager.getActiveFolder();
        if (active) {
          window.foldersManager.updateFolder(active.id, {
            hotelLat: window.locationService.currentLat,
            hotelLng: window.locationService.currentLng,
            hotelAddress: 'מיקום עדכני לפי מיקומך הנוכחי'
          });
          this.refreshExploreView();
        }
      });
    }

    // קטגוריות סינון
    document.querySelectorAll('.category-tab-btn').forEach(tab => {
      tab.addEventListener('click', e => {
        document.querySelectorAll('.category-tab-btn').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentCategory = e.currentTarget.getAttribute('data-category');
        window.placesService.currentCategory = this.currentCategory;
        this.renderPlacesList();
      });
    });

    // חיפוש מקומות
    const searchInput = document.getElementById('placesSearchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        window.placesService.searchQuery = e.target.value;
        this.renderPlacesList();
      });
    }
    if (btnClearSearch && searchInput) {
      btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        window.placesService.searchQuery = '';
        this.renderPlacesList();
      });
    }
  }

  // מעבר בין מסכים
  switchView(viewName) {
    this.currentView = viewName;
    const viewFolders = document.getElementById('viewFolders');
    const viewExplore = document.getElementById('viewExplore');

    if (viewName === 'folders') {
      if (viewFolders) viewFolders.classList.add('active');
      if (viewExplore) viewExplore.classList.remove('active');
      this.renderFolders();
    } else {
      if (viewFolders) viewFolders.classList.remove('active');
      if (viewExplore) viewExplore.classList.add('active');
      this.refreshExploreView();
      if (window.mapService && window.mapService.map) {
        setTimeout(() => window.mapService.map.invalidateSize(), 200);
      }
    }

    // עדכון תפריט תחתון
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const target = item.getAttribute('data-target');
      if (target === (viewName === 'folders' ? 'viewFolders' : 'viewExplore')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // רינדור רשימת התיקיות
  renderFolders() {
    const grid = document.getElementById('foldersGrid');
    const countBadge = document.getElementById('foldersCountBadge');
    if (!grid) return;

    const folders = window.foldersManager.folders;
    const activeId = window.foldersManager.activeFolderId;

    if (countBadge) countBadge.textContent = `${folders.length} תיקיות`;

    grid.innerHTML = folders.map(f => {
      const isActive = f.id === activeId;
      return `
        <div class="folder-card ${isActive ? 'active-folder' : ''}">
          <div class="folder-card-top">
            <div class="folder-icon-circle">${f.icon || '✈️'}</div>
            ${isActive ? '<span class="folder-active-pill">פעיל כעת ✨</span>' : ''}
          </div>

          <h3 class="folder-title">${f.name}</h3>
          <p class="folder-city">📍 ${f.city}</p>

          <div class="folder-hotel-box">
            <div class="hotel-box-header">
              <span>🏨 מלון שמור:</span>
            </div>
            <strong class="hotel-box-name">${f.hotelName}</strong>
            <p class="hotel-box-address">${f.hotelAddress || 'ללא כתובת מדויקת'}</p>
          </div>

          <div class="folder-card-footer">
            <button class="btn-open-trip" onclick="window.app.handleSelectFolder('${f.id}')">
              ${isActive ? '👉 פתח טיול זה' : 'בחר טיול זה'}
            </button>
            <button class="btn-folder-action" onclick="window.app.openFolderModal('${f.id}')" title="ערוך פרטי מלון">✏️</button>
            <button class="btn-folder-action delete" onclick="window.app.handleDeleteFolder('${f.id}')" title="מחק תיקייה">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  handleSelectFolder(id) {
    const folder = window.foldersManager.folders.find(f => f.id === id);
    if (folder) {
      window.foldersManager.setActiveFolderId(id);
      this.applyActiveFolder(folder);
      this.switchView('explore');
    }
  }

  handleDeleteFolder(id) {
    if (confirm('האם למחוק תיקיית טיול זו?')) {
      const success = window.foldersManager.deleteFolder(id);
      if (success) this.renderFolders();
    }
  }

  applyActiveFolder(folder) {
    const nameEl = document.getElementById('activeFolderName');
    const cityEl = document.getElementById('activeFolderCity');
    const emojiEl = document.getElementById('activeFolderEmoji');

    if (nameEl) nameEl.textContent = folder.name;
    if (cityEl) cityEl.textContent = `📍 ${folder.city}`;
    if (emojiEl) emojiEl.textContent = folder.icon || '✈️';

    // הגדרת מיקום התחלתי
    if (folder.currentHotspotId && window.NaftalbergData.HOTSPOTS_DATA[folder.currentHotspotId]) {
      const spot = window.NaftalbergData.HOTSPOTS_DATA[folder.currentHotspotId];
      if (window.attractionModalManager) {
        window.attractionModalManager.selectedSpot = spot;
      }
      window.locationService.setLocation(spot.lat, spot.lng, spot.name, false);
      const selector = document.getElementById('hotspotSelect');
      if (selector) selector.value = folder.currentHotspotId;
    } else {
      if (window.attractionModalManager) {
        window.attractionModalManager.selectedSpot = null;
      }
      window.locationService.setLocation(folder.centerLat || folder.hotelLat, folder.centerLng || folder.hotelLng, folder.city, false);
    }

    this.refreshExploreView();
  }

  // עדכון מסך החקירה המלא
  async refreshExploreView() {
    const activeFolder = window.foldersManager.getActiveFolder();
    if (!activeFolder) return;

    const currentLat = window.locationService.currentLat;
    const currentLng = window.locationService.currentLng;

    // 1. עדכון מפה
    if (window.mapService) {
      window.mapService.updateUserMarker(currentLat, currentLng);
      window.mapService.updateHotelMarker(
        activeFolder.hotelLat,
        activeFolder.hotelLng,
        activeFolder.hotelName,
        activeFolder.hotelAddress
      );
    }

    // 2. עדכון ווידג'ט מרחק מהמלון
    this.updateHotelDistanceWidget(activeFolder, currentLat, currentLng);

    // 3. עדכון מזג אוויר
    this.updateWeatherWidget(currentLat, currentLng);

    // 4. איסוף מקומות בסביבה (סינון מרחק קשיח של 15 ק"מ)
    this.placesCache = window.placesService.getNearbyPlaces(currentLat, currentLng);
    this.renderPlacesList();

    // 5. סימון מקומות במפה
    if (window.mapService) {
      window.mapService.renderNearbyMarkers(this.placesCache);
    }

    // 6. עדכון באנר האטרקציה הקרובה
    this.updateNearestHeroBanner(currentLat, currentLng);

    // 7. עדכון סרגל בחירת אטרקציה בסביבה
    await this.renderAttractionPicker();

    // 8. משיכת נתונים חיים נוספים ברקע מ-OSM
    if (window.placesService && window.placesService.fetchLivePlaces) {
      window.placesService.fetchLivePlaces(currentLat, currentLng).then(live => {
        if (live && live.length > 0) {
          this.placesCache = window.placesService.getNearbyPlaces(currentLat, currentLng);
          this.renderPlacesList();
          if (window.mapService) {
            window.mapService.renderNearbyMarkers(this.placesCache);
          }
        }
      });
    }
  }

  updateHotelDistanceWidget(folder, userLat, userLng) {
    const currency = folder.city.includes('ישראל') ? '₪' : '€';
    const trip = window.hotelDistanceCalculator.calculateTrip(
      userLat,
      userLng,
      folder.hotelLat,
      folder.hotelLng,
      currency
    );

    const nameEl = document.getElementById('hotelNameDisplay');
    const addrEl = document.getElementById('hotelAddressDisplay');
    const distEl = document.getElementById('hotelDirectDistance');

    if (nameEl) nameEl.textContent = folder.hotelName;
    if (addrEl) addrEl.textContent = folder.hotelAddress || 'כתובת שמורה';
    if (distEl) distEl.textContent = trip.formattedDistance;

    // הליכה
    const walkTime = document.getElementById('walkTimeDisplay');
    const walkSteps = document.getElementById('walkStepsDisplay');
    if (walkTime) walkTime.textContent = trip.walk.formattedTime;
    if (walkSteps) walkSteps.textContent = trip.walk.formattedSteps;

    // תחב"צ
    const transitTime = document.getElementById('transitTimeDisplay');
    const transitTip = document.getElementById('transitTipDisplay');
    if (transitTime) transitTime.textContent = trip.transit.formattedTime;
    if (transitTip) transitTip.textContent = trip.transit.tip;

    // רכב / מונית
    const driveTime = document.getElementById('driveTimeDisplay');
    const driveCost = document.getElementById('driveCostDisplay');
    if (driveTime) driveTime.textContent = trip.drive.formattedTime;
    if (driveCost) driveCost.textContent = trip.drive.estimatedCost;

    // התראה אם המלון רחוק מעל 100 ק"מ
    const warningBox = document.getElementById('hotelFarWarning');
    if (warningBox) {
      warningBox.style.display = trip.directMeters > 100000 ? 'flex' : 'none';
    }

    // קישור ניווט
    const navBtn = document.getElementById('btnNavigateToHotel');
    if (navBtn) {
      navBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${folder.hotelLat},${folder.hotelLng}`;
    }
  }

  async updateWeatherWidget(lat, lng) {
    const weather = await window.weatherService.fetchWeather(lat, lng);
    const tempEl = document.getElementById('weatherTemp');
    const condEl = document.getElementById('weatherCondition');
    const iconEl = document.getElementById('weatherIcon');
    const windEl = document.getElementById('weatherWind');
    const humEl = document.getElementById('weatherHumidity');
    const tipEl = document.getElementById('weatherTipText');

    if (tempEl) tempEl.textContent = `${weather.temperature}°`;
    if (condEl) condEl.textContent = weather.condition;
    if (iconEl) iconEl.textContent = weather.icon;
    if (windEl) windEl.textContent = `${weather.windSpeed} קמ״ש`;
    if (humEl) humEl.textContent = `${weather.humidity}%`;
    if (tipEl) tipEl.textContent = weather.tip;

    const locEl = document.getElementById('weatherLocationName');
    if (locEl) {
      const active = window.foldersManager.getActiveFolder();
      locEl.textContent = active ? active.city.split(',')[0] : 'בסביבה';
    }
  }

  updateNearestHeroBanner(lat, lng) {
    const spot = window.attractionModalManager.findNearestAttraction(lat, lng);
    const titleEl = document.getElementById('heroAttractionTitle');
    const subEl = document.getElementById('heroAttractionSubtitle');
    const distEl = document.getElementById('heroDistancePill');
    const statusEl = document.getElementById('heroOpenStatusPill');

    if (spot) {
      if (titleEl) titleEl.textContent = spot.name;
      if (subEl) subEl.textContent = spot.subtitle || spot.city;
      if (distEl) {
        distEl.textContent = `📍 ${window.hotelDistanceCalculator.formatDistance(spot.distanceMeters || 0)} ממך`;
      }

      const deviceTime = window.attractionModalManager.getDeviceDateTime();
      const status = window.attractionModalManager.checkOpenStatus(spot.schedule, deviceTime);
      if (statusEl) {
        statusEl.className = `hero-status-pill ${status.badgeClass}`;
        statusEl.textContent = status.statusText;
      }
    }
  }

  async renderAttractionPicker() {
    const container = document.getElementById('nearbySpotsPickerContainer');
    if (!container) return;

    const currentLat = window.locationService.currentLat;
    const currentLng = window.locationService.currentLng;
    const nearbyList = await window.attractionModalManager.getNearbyAttractionsList(currentLat, currentLng);
    const selectedSpot = window.attractionModalManager.selectedSpot || nearbyList[0];
    const deviceTime = window.attractionModalManager.getDeviceDateTime();

    if (!nearbyList || nearbyList.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem; padding: 6px;">לא נמצאו אטרקציות נוספות ברדיוס 15 ק"מ.</p>';
      return;
    }

    container.innerHTML = nearbyList.slice(0, 6).map(spot => {
      const isSelected = selectedSpot && selectedSpot.id === spot.id;
      const status = window.attractionModalManager.checkOpenStatus(spot.schedule, deviceTime);
      const dist = window.hotelDistanceCalculator.formatDistance(spot.distanceMeters);

      return `
        <div class="picker-spot-card ${isSelected ? 'selected-spot' : ''}" onclick="window.app.handleSelectNearbySpot('${spot.id}')">
          <div class="picker-spot-top">
            <span class="picker-spot-name">${spot.name}</span>
            <span class="picker-spot-dist">📍 ${dist}</span>
          </div>
          <div class="picker-spot-footer">
            <span class="hero-status-pill ${status.badgeClass}">${status.statusText.split(' ')[0]} ${status.statusText.split(' ')[1] || ''}</span>
            <button class="btn-select-spot-action" type="button">
              ${isSelected ? 'אתה כאן ✓' : 'אני כאן! 📍'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  handleSelectNearbySpot(spotId) {
    window.attractionModalManager.selectAttraction(spotId);
    this.renderAttractionPicker();
  }

  renderPlacesList() {
    const container = document.getElementById('placesGrid');
    const countText = document.getElementById('placesCountText');
    if (!container) return;

    const filtered = window.placesService.filterPlaces(
      this.placesCache,
      this.currentCategory,
      window.placesService.searchQuery
    );

    if (countText) {
      countText.textContent = `נמצאו ${filtered.length} מקומות בסביבה הקרובה`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; background: rgba(30, 41, 59, 0.4); border-radius: 14px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
          <h4 style="color: white; margin-bottom: 4px;">לא נמצאו תוצאות לסינון זה</h4>
          <p style="color: #94a3b8; font-size: 0.85rem;">נסו לבחור קטגוריה אחרת או לנקות את מונח החיפוש.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => window.placesService.renderPlaceCard(p)).join('');
  }

  // מודל תיקייה
  openFolderModal(folderId = null) {
    const modal = document.getElementById('modalFolder');
    const formTitle = document.getElementById('folderModalTitle');
    const formId = document.getElementById('formFolderId');

    if (!modal) return;

    if (folderId) {
      const folder = window.foldersManager.folders.find(f => f.id === folderId);
      if (folder) {
        if (formTitle) formTitle.textContent = 'עריכת פרטי מלון ותיקייה';
        if (formId) formId.value = folder.id;
        document.getElementById('formTripName').value = folder.name;
        document.getElementById('formTripCity').value = folder.city;
        document.getElementById('formHotelName').value = folder.hotelName;
        document.getElementById('formHotelAddress').value = folder.hotelAddress || '';
        document.getElementById('formHotelLat').value = folder.hotelLat || '';
        document.getElementById('formHotelLng').value = folder.hotelLng || '';
        document.getElementById('formHotelNotes').value = folder.hotelNotes || '';
        document.getElementById('formTripIcon').value = folder.icon || '✈️';
      }
    } else {
      if (formTitle) formTitle.textContent = 'יצירת תיקיית טיול חדשה';
      if (formId) formId.value = '';
      document.getElementById('formTripName').value = '';
      document.getElementById('formTripCity').value = '';
      document.getElementById('formHotelName').value = '';
      document.getElementById('formHotelAddress').value = '';
      document.getElementById('formHotelLat').value = '';
      document.getElementById('formHotelLng').value = '';
      document.getElementById('formHotelNotes').value = '';
      document.getElementById('formTripIcon').value = '🍇';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeFolderModal() {
    const modal = document.getElementById('modalFolder');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async geocodeAddress(query) {
    if (!query || !query.trim()) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'he,en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (_) {}
    return null;
  }

  async handleSaveNewFolder() {
    const folderId = document.getElementById('formFolderId').value;
    const name = document.getElementById('formTripName').value.trim();
    const city = document.getElementById('formTripCity').value.trim();
    const hotelName = document.getElementById('formHotelName').value.trim();
    const hotelAddress = document.getElementById('formHotelAddress').value.trim();
    const hotelNotes = document.getElementById('formHotelNotes').value.trim();
    const icon = document.getElementById('formTripIcon').value || '✈️';
    let lat = parseFloat(document.getElementById('formHotelLat').value);
    let lng = parseFloat(document.getElementById('formHotelLng').value);

    if (!name || !city || !hotelName) {
      alert('נא למלא שם טיול, עיר ושם מלון.');
      return;
    }

    const submitBtn = document.getElementById('btnSubmitFolder');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ שומר ומאתר מיקום במפה...';
    }

    let hotspotId = null;

    // 1. איתור קואורדינטות ב-Nominatim אם לא הוזנו ידנית או באמצעות GPS
    if (isNaN(lat) || isNaN(lng)) {
      const hotelQuery = hotelAddress ? `${hotelAddress}, ${city}` : `${hotelName}, ${city}`;
      const hotelGeo = await this.geocodeAddress(hotelQuery);
      if (hotelGeo) {
        lat = hotelGeo.lat;
        lng = hotelGeo.lng;
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      const cityGeo = await this.geocodeAddress(city);
      if (cityGeo) {
        lat = cityGeo.lat;
        lng = cityGeo.lng;
      }
    }

    // 2. בדיקה בטבלת ערים מוכרות (זכרון יעקב, ירושלים, תל אביב וכו')
    if (window.NaftalbergData && window.NaftalbergData.CITY_COORDINATES) {
      for (const [cityName, coords] of Object.entries(window.NaftalbergData.CITY_COORDINATES)) {
        if (city.includes(cityName) || cityName.includes(city)) {
          if (isNaN(lat) || isNaN(lng)) {
            lat = coords.lat;
            lng = coords.lng;
          }
          hotspotId = coords.hotspotId;
          break;
        }
      }
    }

    // 3. ברירת מחדל: מיקום נוכחי
    if (isNaN(lat) || isNaN(lng)) {
      lat = window.locationService ? window.locationService.currentLat : 32.5714;
      lng = window.locationService ? window.locationService.currentLng : 34.9530;
    }

    if (folderId) {
      // עדכון תיקייה קיימת
      window.foldersManager.updateFolder(folderId, {
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
      const active = window.foldersManager.getActiveFolder();
      if (active && active.id === folderId) {
        this.applyActiveFolder(active);
      }
    } else {
      // יצירת תיקייה חדשה
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
      this.applyActiveFolder(newFolder);
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '💾 שמור תיקייה והתחל חקירה';
    }

    this.closeFolderModal();
    this.renderFolders();
    this.switchView('explore');
  }
}

// הפעלה כשה-DOM מוכן
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NaftalbergApp();
  window.app.init();
});
