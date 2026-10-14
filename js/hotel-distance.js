// ==========================================================================
// מחשבון מרחק מהמלון (Hotel Distance & Travel Modes Calculator)
// חישוב מרחק מדויק ברגל, בתחבורה ציבורית וברכב / מונית
// ==========================================================================

class HotelDistanceCalculator {
  // חישוב נוסחת Haversine למרחק גיאוגרפי מדויק במטרים
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return 0;
    }
    const R = 6371e3; // רדיוס כדור הארץ במטרים
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // עיצוב מרחק קריא במטרים / קילומטרים
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} מטר`;
    }
    const km = (meters / 1000).toFixed(1);
    return `${km} ק״מ`;
  }

  // חישוב זמני הגעה ועלויות לשלושת אמצעי התחבורה
  calculateTrip(userLat, userLng, hotelLat, hotelLng, currency = '₪') {
    const directMeters = this.calculateHaversineDistance(userLat, userLng, hotelLat, hotelLng);

    // 1. הליכה ברגל (מהירות ממוצעת 4.5 קמ"ש, פקטור פיתול רחובות 1.25)
    const walkDistanceMeters = directMeters * 1.25;
    const walkMinutes = Math.max(1, Math.round((walkDistanceMeters / 1000) * (60 / 4.5)));
    const walkSteps = Math.round((walkDistanceMeters / 1000) * 1320); // ~1,320 צעדים לק"מ

    // 2. תחבורה ציבורית (זמן המתנה 6 דק' + מהירות נסיעה עירונית 20 קמ"ש)
    let transitMinutes = 0;
    let transitTip = 'אוטובוס / קו ישיר';
    if (directMeters <= 500) {
      transitMinutes = walkMinutes;
      transitTip = 'הליכה קצרה מומלצת';
    } else {
      transitMinutes = Math.max(8, Math.round(6 + (directMeters / 1000) * (60 / 22)));
      if (directMeters > 3000) {
        transitTip = 'רכבת / קווי אקספרס';
      }
    }

    // 3. רכב / מונית (מהירות עירונית 30 קמ"ש)
    const driveMinutes = Math.max(3, Math.round(3 + (directMeters / 1000) * (60 / 30)));
    // הערכת עלות מונית
    let taxiCost = 0;
    if (currency === '€') {
      taxiCost = Math.round(5 + (directMeters / 1000) * 1.8);
    } else {
      taxiCost = Math.round(18 + (directMeters / 1000) * 5.5);
    }

    return {
      directMeters,
      formattedDistance: this.formatDistance(directMeters),
      walk: {
        minutes: walkMinutes,
        formattedTime: walkMinutes > 60 
          ? `${Math.floor(walkMinutes / 60)} שע׳ ו-${walkMinutes % 60} דק׳` 
          : `${walkMinutes} דק׳`,
        steps: walkSteps.toLocaleString(),
        formattedSteps: `כ-${walkSteps.toLocaleString()} צעדים`
      },
      transit: {
        minutes: transitMinutes,
        formattedTime: transitMinutes > 60 
          ? `${Math.floor(transitMinutes / 60)} שע׳ ו-${transitMinutes % 60} דק׳` 
          : `${transitMinutes} דק׳`,
        tip: transitTip
      },
      drive: {
        minutes: driveMinutes,
        formattedTime: driveMinutes > 60 
          ? `${Math.floor(driveMinutes / 60)} שע׳ ו-${driveMinutes % 60} דק׳` 
          : `${driveMinutes} דק׳`,
        estimatedCost: `~${taxiCost} ${currency}`
      }
    };
  }
}

window.hotelDistanceCalculator = new HotelDistanceCalculator();
