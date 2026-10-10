// ==========================================================================
// מודל "איפה אני נמצא" (Deep-Dive Attraction Modal & Live Schedule)
// סנכרון עם תאריך ושעה של המכשיר, שעות פתיחה, מופעים, סיפורים ומחירים
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
        statusText: 'פתוח לקהל',
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

  // איתור האטרקציה הקרובה ביותר למיקום הנוכחי
  findNearestAttraction(currentLat, currentLng) {
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

  // פתיחת המודל והצגת כל המידע הנדרש
  openModal(spotData = null) {
    const modal = document.getElementById('attractionModal');
    if (!modal) return;

    const loc = window.locationService;
    const spot = spotData || this.findNearestAttraction(loc.currentLat, loc.currentLng);
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

  closeModal() {
    const modal = document.getElementById('attractionModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }
}

window.attractionModalManager = new AttractionModalManager();
