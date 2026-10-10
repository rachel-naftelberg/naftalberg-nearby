// ==========================================================================
// חישוב מרחק וזמני הגעה מהמלון (Hotel Distance & Travel Times Calculator)
// ברגל, בתחבורה ציבורית וברכב / מונית
// ==========================================================================

class HotelDistanceCalculator {
  // חישוב מרחק גיאודזי במטרים (Haversine formula)
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // רדיוס כדור הארץ במטרים
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // מרחק במטרים
  }

  formatDistance(meters) {
    if (meters < 1000) {
      return `${meters} מטרים`;
    }
    const km = (meters / 1000).toFixed(1);
    return `${km} ק״מ`;
  }

  calculateTrip(userLat, userLng, hotelLat, hotelLng, currency = '€') {
    const directMeters = this.calculateHaversineDistance(userLat, userLng, hotelLat, hotelLng);
    const directKm = directMeters / 1000;

    // מקדם רחובות עירוניים (רחובות מפותלים, רמזורים, מעברי חצייה)
    const streetKm = directKm * 1.25;

    // 1. הליכה ברגל (מהירות ממוצעת 4.5 קמ"ש)
    const walkMinutes = Math.max(1, Math.round((streetKm / 4.5) * 60));
    const walkSteps = Math.round(streetKm * 1350);
    const walkCalories = Math.round(streetKm * 55);

    // 2. תחבורה ציבורית (מטרו / אוטובוס: המתנה 4-6 דק' + נסיעה עירונית 20 קמ"ש)
    const transitMinutes = directMeters < 500 
      ? walkMinutes 
      : Math.max(6, Math.round(5 + (streetKm / 22) * 60));

    // 3. רכב / מונית (מהירות עירונית 25 קמ"ש + 2 דק' עלייה)
    const driveMinutes = Math.max(3, Math.round(2 + (streetKm / 26) * 60));
    
    // הערכת עלות מונית
    let taxiEstimate = '';
    if (currency === '₪') {
      const taxiShekel = Math.round(15 + streetKm * 4.5);
      taxiEstimate = `~${taxiShekel} ₪`;
    } else {
      const taxiEuro = Math.round(6 + streetKm * 1.8);
      taxiEstimate = `~${taxiEuro} €`;
    }

    // קישורי ניווט מדויקים ל-Google Maps
    const mapsBase = 'https://www.google.com/maps/dir/?api=1';
    const originParam = `&origin=${userLat},${userLng}`;
    const destParam = `&destination=${hotelLat},${hotelLng}`;

    return {
      directMeters,
      streetKm: streetKm.toFixed(1),
      formattedDistance: this.formatDistance(directMeters),
      
      // ברגל
      walking: {
        minutes: walkMinutes,
        text: walkMinutes === 1 ? 'דקה אחת ברגל' : `${walkMinutes} דקות ברגל`,
        steps: walkSteps.toLocaleString(),
        calories: walkCalories,
        mapsUrl: `${mapsBase}${originParam}${destParam}&travelmode=walking`
      },

      // תחבורה ציבורית
      transit: {
        minutes: transitMinutes,
        text: `${transitMinutes} דקות בתחב״צ`,
        advice: directMeters < 600 ? 'המרחק קצר - מומלץ ללכת ברגל' : 'מטרו / קו אוטובוס סמוך',
        mapsUrl: `${mapsBase}${originParam}${destParam}&travelmode=transit`
      },

      // ברכב / מונית
      driving: {
        minutes: driveMinutes,
        text: `${driveMinutes} דקות ברכב / מונית`,
        taxiCost: taxiEstimate,
        mapsUrl: `${mapsBase}${originParam}${destParam}&travelmode=driving`
      }
    };
  }
}

window.hotelDistanceCalculator = new HotelDistanceCalculator();
