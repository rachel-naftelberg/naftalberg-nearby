// ==========================================================================
// מודל "איפה אני נמצא" (Deep-Dive Attraction Modal & Live Schedule)
// סנכרון עם תאריך ושעה של המכשיר, בחירת אטרקציה מתוך מספר אפשרויות,
// שעות פתיחה, מופעים, סיפורים ומחירים
// ==========================================================================

class AttractionModalManager {
  constructor() {
    this.daysHebrew = [
      'יום ראשון',
      'יום שני',
      'יום שלישי',
      'יום רביעי',
      'יום חמישי',
      'יום שישי',
      'יום שבת'
    ];
    this.selectedSpot = null;
    this.dynamicSpotCache = null;
    this.cachedCoordsKey = '';
  }

  // קריאת תאריך ושעה מהמכשיר (iPhone / Browser)
  getDeviceDateTime() {
    const now = new Date();
    const dayIndex = now.getDay(); // 0-6
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateFormatted = now.toLocaleDateString('he-IL', dateOptions);

    return {
      dateObj: now,
      dayIndex,
      dayName: this.daysHebrew[dayIndex],
      timeStr,
      dateFormatted,
      currentMinutes: now.getHours() * 60 + now.getMinutes()
    };
  }

  // בדיקת סטטוס פתיחה חי על פי השעה הנוכחית
  checkOpenStatus(schedule, deviceTime) {
    if (!schedule) {
      return {
        isOpen: true,
        statusText: '🟢 פתוח לקהל',
        badgeClass: 'status-open',
        subText: 'אתר פתוח תחת כיפת השמיים'
      };
    }

    const todaySchedule = schedule[deviceTime.dayIndex];
    if (!todaySchedule || todaySchedule.open === 'closed') {
      return {
        isOpen: false,
        statusText: '🔴 סגור היום',
        badgeClass: 'status-closed',
        subText: 'האתר סגור למבקרים ביום זה'
      };
    }

    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
    const openTotal = openH * 60 + openM;
    const closeTotal = closeH * 60 + closeM;
    const curTotal = deviceTime.currentMinutes;

    // אתר הפתוח 24/7
    if (todaySchedule.open === '00:00' && todaySchedule.close === '23:59') {
      return {
        isOpen: true,
        statusText: '🟢 פתוח 24 שעות',
        badgeClass: 'status-open',
        subText: 'פתוח תמיד, כניסה חופשית בכל שעה'
      };
    }

    if (curTotal >= openTotal && curTotal < closeTotal) {
      const remainingMinutes = closeTotal - curTotal;
      let remainingText = '';
      if (remainingMinutes <= 60) {
        remainingText = `(נסגר בקרוב! נותרו עוד ${remainingMinutes} דקות)`;
      } else {
        const h = Math.floor(remainingMinutes / 60);
        const m = remainingMinutes % 60;
        remainingText = `(פתוח עד ${todaySchedule.close} - נותרו עוד ${h} שע׳ ו-${m} דק׳)`;
      }

      return {
        isOpen: true,
        statusText: '🟢 פתוח עכשיו',
        badgeClass: 'status-open',
        subText: remainingText,
        todayHours: todaySchedule.label
      };
    } else {
      let nextOpenText = '';
      if (curTotal < openTotal) {
        nextOpenText = `ייפתח היום בשעה ${todaySchedule.open}`;
      } else {
        const nextDayIndex = (deviceTime.dayIndex + 1) % 7;
        const nextSched = schedule[nextDayIndex];
        nextOpenText = nextSched ? `ייפתח מחר ב-${nextSched.open}` : 'סגור עד מחר';
      }

      return {
        isOpen: false,
        statusText: '🔴 סגור כעת',
        badgeClass: 'status-closed',
        subText: nextOpenText,
        todayHours: todaySchedule.label
      };
    }
  }

  // איסוף כל האטרקציות בסביבת המשתמש (למיון ובחירה)
  async getNearbyAttractionsList(currentLat, currentLng) {
    const hotspots = Object.values(window.NaftalbergData.HOTSPOTS_DATA);
    let list = [];

    // 1. חישוב מרחק מכל האטרקציות במאגר
    hotspots.forEach(spot => {
      const dist = window.hotelDistanceCalculator.calculateHaversineDistance(
        currentLat,
        currentLng,
        spot.lat,
        spot.lng
      );
      list.push({ ...spot, distanceMeters: dist });
    });

    // מיון לפי מרחק מהמשתמש
    list.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // 2. אם האטרקציה הקרובה ביותר רחוקה מ-2 ק"מ (למשל המשתמש במיקום GPS אמיתי בארץ או בחו"ל שלא במאגר)
    if (list.length === 0 || list[0].distanceMeters > 2000) {
      const key = `${currentLat.toFixed(3)}_${currentLng.toFixed(3)}`;
      if (this.dynamicSpotCache && this.cachedCoordsKey === key) {
        list.unshift(this.dynamicSpotCache);
      } else {
        try {
          const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=18&addressdetails=1`;
          const resp = await fetch(revUrl, { headers: { 'Accept-Language': 'he,en' } });
          const data = await resp.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            const placeName = addr.attraction || addr.tourism || addr.museum || addr.historic || 
                              addr.amenity || addr.leisure || addr.building || addr.road || 'המיקום הנוכחי שלך';
            const city = addr.city || addr.town || addr.village || addr.suburb || 'בסביבה';

            const dynamicSpot = {
              id: 'dynamic-spot-current',
              city: city,
              name: placeName,
              subtitle: data.display_name.split(',').slice(0, 3).join(','),
              lat: currentLat,
              lng: currentLng,
              distanceMeters: 0,
              category: 'attraction',
              image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
              details: `אתה נמצא כרגע בכתובת: ${data.display_name}. האפליקציה זיהתה את המיקום החי שלך ומציעה שירותים, מסעדות, בתי קפה ושירותים ציבוריים בסביבתך.`,
              interestingStories: [
                `אתה נמצא ב-${city}, באזור ${addr.neighbourhood || addr.suburb || 'המרכז העירוני'}.`,
                'האפליקציה מחשבת מרחקים מדויקים וזמני הגעה בזמן אמת לכל מקום בסביבה ומהמלון שלך.'
              ],
              guideWhatToDo: [
                'בדקו את המסעדות ובתי הקפה המומלצים בלשוניות שמתחת.',
                'השתמשו בכפתור המרחק מהמלון כדי לדעת בכל רגע איך להגיע בקלות חזרה למלון.'
              ],
              ticketPrice: {
                standard: 'כניסה חופשית / לפי האתר המקומי'
              },
              schedule: {
                0: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                1: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                2: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                3: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                4: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                5: { open: '00:00', close: '23:59', label: 'פתוח 24/7' },
                6: { open: '00:00', close: '23:59', label: 'פתוח 24/7' }
              },
              showsAndEvents: [
                { time: 'היום', title: 'שיטוט וחקירה חופשית באזור', desc: 'האזור מציע מגוון נקודות עניין, חנויות ומסעדות מקומיות.' }
              ],
              officialUrl: ''
            };

            this.dynamicSpotCache = dynamicSpot;
            this.cachedCoordsKey = key;
            list.unshift(dynamicSpot);
          }
        } catch (e) {
          console.warn('Reverse geocoding failed:', e);
        }
      }
    }

    return list;
  }

  // איתור האטרקציה הקרובה ביותר למיקום הנוכחי
  findNearestAttraction(currentLat, currentLng) {
    if (this.selectedSpot) {
      const dist = window.hotelDistanceCalculator.calculateHaversineDistance(
        currentLat,
        currentLng,
        this.selectedSpot.lat,
        this.selectedSpot.lng
      );
      return { ...this.selectedSpot, distanceMeters: dist };
    }

    const hotspots = Object.values(window.NaftalbergData.HOTSPOTS_DATA);
    if (!hotspots.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    hotspots.forEach(spot => {
      const dist = window.hotelDistanceCalculator.calculateHaversineDistance(
        currentLat,
        currentLng,
        spot.lat,
        spot.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...spot, distanceMeters: dist };
      }
    });

    return nearest;
  }

  // קביעת אטרקציה נבחרת על ידי המשתמש מתוך רשימת האטרקציות באזור
  selectAttraction(spotId) {
    let spot = null;
    if (this.dynamicSpotCache && this.dynamicSpotCache.id === spotId) {
      spot = this.dynamicSpotCache;
    } else {
      spot = window.NaftalbergData.HOTSPOTS_DATA[spotId];
    }

    if (spot) {
      this.selectedSpot = spot;
      const currentLat = window.locationService.currentLat;
      const currentLng = window.locationService.currentLng;
      spot.distanceMeters = window.hotelDistanceCalculator.calculateHaversineDistance(
        currentLat,
        currentLng,
        spot.lat,
        spot.lng
      );

      // עדכון ה-UI
      if (window.app) {
        window.app.updateNearestHeroBanner(currentLat, currentLng);
        window.app.renderAttractionPicker();
      }

      if (window.mapService) {
        window.mapService.flyToAndHighlight(spot.lat, spot.lng, spot.name);
      }
    }
  }

  // פתיחת המודל והצגת כל המידע הנדרש
  async openModal(spotData = null) {
    const modal = document.getElementById('attractionModal');
    if (!modal) return;

    const loc = window.locationService;
    const spot = spotData || this.selectedSpot || this.findNearestAttraction(loc.currentLat, loc.currentLng);
    if (!spot) {
      alert('לא נמצאה אטרקציה קרובה למיקום הנוכחי.');
      return;
    }

    const deviceTime = this.getDeviceDateTime();
    const openStatus = this.checkOpenStatus(spot.schedule, deviceTime);

    // עדכון תוכן המודל
    document.getElementById('attrTitle').textContent = spot.name;
    document.getElementById('attrSubtitle').textContent = spot.subtitle || spot.city;
    document.getElementById('attrImage').src = spot.image || '';
    document.getElementById('attrImage').alt = spot.name;

    // סרגל החלפת אטרקציה בתוך המודל (אם יש עוד אטרקציות בסביבה)
    const switcherContainer = document.getElementById('attrModalSwitcher');
    if (switcherContainer) {
      const nearbyList = await this.getNearbyAttractionsList(loc.currentLat, loc.currentLng);
      if (nearbyList.length > 1) {
        let pillsHtml = `
          <div class="modal-attractions-switcher-bar">
            <span class="switcher-label">📍 אטרקציות בסביבה:</span>
            <div class="switcher-pills-list">
        `;
        nearbyList.slice(0, 6).forEach(item => {
          const isSelected = item.id === spot.id;
          pillsHtml += `
            <button class="btn-switcher-pill ${isSelected ? 'active' : ''}" onclick="window.attractionModalManager.selectAttractionAndReload('${item.id}')">
              ${item.name} (${window.hotelDistanceCalculator.formatDistance(item.distanceMeters)})
            </button>
          `;
        });
        pillsHtml += `</div></div>`;
        switcherContainer.innerHTML = pillsHtml;
        switcherContainer.style.display = 'block';
      } else {
        switcherContainer.style.display = 'none';
      }
    }

    // תאריך ושעה של המכשיר
    const clockBadge = document.getElementById('attrDeviceClock');
    if (clockBadge) {
      clockBadge.innerHTML = `
        <span>📱 שעון המכשיר שלך: <strong>${deviceTime.dayName}, ${deviceTime.timeStr}</strong> (${deviceTime.dateFormatted})</span>
      `;
    }

    // סטטוס פתיחה
    const statusBox = document.getElementById('attrStatusBox');
    if (statusBox) {
      statusBox.className = `status-banner ${openStatus.badgeClass}`;
      statusBox.innerHTML = `
        <div class="status-indicator-badge">${openStatus.statusText}</div>
        <div class="status-details">${openStatus.subText}</div>
      `;
    }

    // שעות פתיחה של כל השבוע
    const scheduleContainer = document.getElementById('attrScheduleContainer');
    if (scheduleContainer && spot.schedule) {
      let scheduleHtml = '<div class="weekly-schedule-grid">';
      for (let i = 0; i < 7; i++) {
        const isToday = i === deviceTime.dayIndex;
        const daySched = spot.schedule[i];
        scheduleHtml += `
          <div class="schedule-day-row ${isToday ? 'current-day' : ''}">
            <span class="day-title">${this.daysHebrew[i]}${isToday ? ' (היום)' : ''}</span>
            <span class="day-hours">${daySched ? daySched.label : 'סגור'}</span>
          </div>
        `;
      }
      scheduleHtml += '</div>';
      scheduleContainer.innerHTML = scheduleHtml;
    }

    // מופעים, אירועים ופעילויות להיום
    const showsContainer = document.getElementById('attrShowsContainer');
    if (showsContainer) {
      if (spot.showsAndEvents && spot.showsAndEvents.length > 0) {
        let showsHtml = '<div class="shows-list">';
        spot.showsAndEvents.forEach(show => {
          showsHtml += `
            <div class="show-item-card">
              <div class="show-time-badge">🕒 ${show.time}</div>
              <div class="show-content">
                <div class="show-title">${show.title}</div>
                <div class="show-desc">${show.desc}</div>
              </div>
            </div>
          `;
        });
        showsHtml += '</div>';
        showsContainer.innerHTML = showsHtml;
      } else {
        showsContainer.innerHTML = '<p class="muted-text">אין מופעים מיוחדים מתוזמנים להיום באתר זה.</p>';
      }
    }

    // פרטים על האטרקציה
    document.getElementById('attrDetailsText').textContent = spot.details || 'אין מידע נוסף.';

    // סיפורים מעניינים
    const storiesContainer = document.getElementById('attrStoriesContainer');
    if (storiesContainer) {
      if (spot.interestingStories && spot.interestingStories.length > 0) {
        storiesContainer.innerHTML = spot.interestingStories
          .map(story => `
            <div class="story-bubble">
              <span class="story-icon">💡</span>
              <p>${story}</p>
            </div>
          `)
          .join('');
      } else {
        storiesContainer.innerHTML = '<p class="muted-text">אין סיפורים מיוחדים זמינים כרגע.</p>';
      }
    }

    // מדריך קצר - מה עושים כאן
    const guideContainer = document.getElementById('attrGuideContainer');
    if (guideContainer) {
      if (spot.guideWhatToDo && spot.guideWhatToDo.length > 0) {
        guideContainer.innerHTML = spot.guideWhatToDo
          .map((item, idx) => `
            <div class="guide-step">
              <span class="guide-number">${idx + 1}</span>
              <p>${item}</p>
            </div>
          `)
          .join('');
      } else {
        guideContainer.innerHTML = '<p class="muted-text">אין מדריך מיוחד זמין כרגע.</p>';
      }
    }

    // מחירי כרטיסים
    const pricesContainer = document.getElementById('attrPricesContainer');
    if (pricesContainer) {
      if (spot.ticketPrice) {
        let priceHtml = '<div class="price-cards-grid">';
        for (const [key, val] of Object.entries(spot.ticketPrice)) {
          let label = 'כרטיס רגיל';
          if (key === 'standard') label = 'כרטיס סטנדרטי למבוגר';
          if (key === 'reduced') label = 'כרטיס מוזל / צעירים';
          if (key === 'free') label = 'כניסה חינם';
          if (key === 'stairsTo2nd') label = 'עלייה במדרגות';
          if (key === 'withTowers') label = 'כולל כניסה למגדלים';
          if (key === 'audioGuide') label = 'מדריך קולי';
          if (key === 'beachGear') label = 'השכרת ציוד חוף';
          if (key === 'gordonPool') label = 'בריכת שחייה';
          if (key === 'tunnels') label = 'סיור מנהרות';
          if (key === 'virtualReality') label = 'מציאות מדומה';

          priceHtml += `
            <div class="price-card">
              <span class="price-label">${label}</span>
              <span class="price-value">${val}</span>
            </div>
          `;
        }
        priceHtml += '</div>';
        pricesContainer.innerHTML = priceHtml;
      } else {
        pricesContainer.innerHTML = '<p class="muted-text">כניסה חופשית ללא תשלום.</p>';
      }
    }

    // קישור לאתר הרשמי
    const officialLink = document.getElementById('attrOfficialLink');
    if (officialLink) {
      if (spot.officialUrl) {
        officialLink.href = spot.officialUrl;
        officialLink.style.display = 'inline-flex';
      } else {
        officialLink.style.display = 'none';
      }
    }

    // כפתור ניווט ב-Google Maps
    const mapsLink = document.getElementById('attrNavigateBtn');
    if (mapsLink) {
      mapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  selectAttractionAndReload(spotId) {
    this.selectAttraction(spotId);
    this.openModal(this.selectedSpot);
  }

  closeModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }
}

window.attractionModalManager = new AttractionModalManager();
