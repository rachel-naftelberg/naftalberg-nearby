// ==========================================================================
// מנוע מיקום (Location Service) - GPS חי וסימולטור נקודות ציון
// ==========================================================================

class LocationService {
  constructor() {
    this.currentLat = 41.8902;
    this.currentLng = 12.4922;
    this.locationName = 'הקולוסיאום, רומא';
    this.isLiveGPS = false;
    this.listeners = [];
    this.watchId = null;
  }

  onLocationChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    const loc = {
      lat: this.currentLat,
      lng: this.currentLng,
      name: this.locationName,
      isLiveGPS: this.isLiveGPS
    };
    this.listeners.forEach(cb => {
      try {
        cb(loc);
      } catch (err) {
        console.error('Error in location listener:', err);
      }
    });
  }

  setLocation(lat, lng, name = 'מיקום נבחר', isLive = false) {
    this.currentLat = parseFloat(lat);
    this.currentLng = parseFloat(lng);
    this.locationName = name;
    this.isLiveGPS = isLive;
    if (isLive && window.attractionModalManager) {
      window.attractionModalManager.selectedSpot = null;
    }
    this.notifyListeners();
  }

  // הפעלת GPS של הדפדפן / אייפון
  requestLiveGPS() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        alert('המכשיר או הדפדפן אינם תומכים בשירותי מיקום GPS.');
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.setLocation(lat, lng, 'המיקום הנוכחי שלך (GPS חי)', true);
          resolve({ lat, lng });
        },
        error => {
          let msg = 'לא ניתן לקרוא מיקום GPS.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'הרשאת המיקום נדחתה בהגדרות הדפדפן. ניתן להשתמש בסימולטור הנקודות.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'אות ה-GPS אינו זמין כרגע.';
              break;
            case error.TIMEOUT:
              msg = 'חלף הזמן להשגת מיקום ה-GPS.';
              break;
          }
          console.warn(msg, error);
          reject(new Error(msg));
        },
        options
      );
    });
  }

  // מעקב מתמשך (Watch position)
  startWatchingGPS() {
    if (!('geolocation' in navigator)) return;
    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        this.setLocation(
          pos.coords.latitude,
          pos.coords.longitude,
          'המיקום הנוכחי שלך (GPS חי)',
          true
        );
      },
      err => {
        console.warn('GPS watch error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  stopWatchingGPS() {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

window.locationService = new LocationService();
