// ==========================================================================
// שירות מקומות בסביבה (Nearby Places Service)
// מסעדות, בתי קפה, שירותים ציבוריים, שירותים חיוניים ומשיכת נתונים
// ==========================================================================

class PlacesService {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
  }

  // איסוף כל המקומות בסביבת המיקום הנוכחי
  getNearbyPlaces(lat, lng) {
    const nearestSpot = window.attractionModalManager.findNearestAttraction(lat, lng);
    if (!nearestSpot || !nearestSpot.nearbyPlaces) {
      return [];
    }

    // חישוב מרחק מדויק מכל מקום למיקום המשתמש הנוכחי
    const places = nearestSpot.nearbyPlaces.map(place => {
      const dist = window.hotelDistanceCalculator.calculateHaversineDistance(
        lat,
        lng,
        place.lat,
        place.lng
      );
      return {
        ...place,
        distanceMeters: dist,
        formattedDistance: window.hotelDistanceCalculator.formatDistance(dist)
      };
    });

    // מיון לפי קרבה
    return places.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // סינון מקומות לפי קטגוריה וטקסט חיפוש
  filterPlaces(places, category = this.currentCategory, query = this.searchQuery) {
    let filtered = places;

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (query && query.trim() !== '') {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(p => {
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.desc && p.desc.toLowerCase().includes(q)) ||
          (p.cuisine && p.cuisine.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q))
        );
      });
    }

    return filtered;
  }

  // אייקון ותגית לפי קטגוריה
  getCategoryMeta(category) {
    switch (category) {
      case 'restaurant':
        return { label: 'מסעדה', icon: '🍽️', color: '#e76f51' };
      case 'cafe':
        return { label: 'בית קפה', icon: '☕', color: '#2a9d8f' };
      case 'restroom':
        return { label: 'שירותים ציבוריים', icon: '🚻', color: '#457b9d' };
      case 'essential':
        return { label: 'שירות חיוני', icon: '🔍', color: '#9b5de5' };
      case 'attraction':
        return { label: 'אטרקציה', icon: '🏛️', color: '#f77f00' };
      default:
        return { label: 'מקום בסביבה', icon: '📍', color: '#4a5568' };
    }
  }

  // רינדור כרטיסיית מקום מעוצבת
  renderPlaceCard(place) {
    const meta = this.getCategoryMeta(place.category);
    let extraDetails = '';

    if (place.category === 'restaurant') {
      extraDetails = `
        <div class="card-pills-row">
          <span class="pill pill-cuisine">🍝 ${place.cuisine || 'איטלקי'}</span>
          <span class="pill pill-price">${place.priceLevel || '€€'}</span>
          <span class="pill pill-hours">🕒 ${place.hours || 'פתוח'}</span>
        </div>
      `;
    } else if (place.category === 'cafe') {
      extraDetails = `
        <div class="card-pills-row">
          <span class="pill pill-coffee">☕ ${place.coffeeSpecialty || 'אספרסו איטלקי'}</span>
          <span class="pill pill-hours">🕒 ${place.hours || 'פתוח'}</span>
        </div>
      `;
    } else if (place.category === 'restroom') {
      extraDetails = `
        <div class="card-pills-row">
          <span class="pill pill-cost">💰 ${place.cost || 'חינם'}</span>
          <span class="pill pill-access">♿ ${place.accessible || 'נגיש'}</span>
          <span class="pill pill-clean">✨ ניקיון: ${place.cleanlinessRating || 4.5} ⭐</span>
        </div>
      `;
    } else if (place.category === 'essential') {
      let subIcon = '🏬';
      if (place.subType === 'pharmacy') subIcon = '💊 בית מרקחת';
      if (place.subType === 'supermarket') subIcon = '🛒 סופרמרקט';
      if (place.subType === 'atm') subIcon = '🏧 כספומט / המרה';
      if (place.subType === 'transit') subIcon = '🚇 תחבורה ציבורית';

      extraDetails = `
        <div class="card-pills-row">
          <span class="pill pill-essential">${subIcon}</span>
          ${place.hours ? `<span class="pill pill-hours">🕒 ${place.hours}</span>` : ''}
        </div>
      `;
    }

    const ratingStars = place.rating 
      ? `<div class="place-rating">⭐ ${place.rating}</div>` 
      : '';

    return `
      <div class="place-card" data-id="${place.id}" data-lat="${place.lat}" data-lng="${place.lng}">
        <div class="place-card-header">
          <div class="place-header-top">
            <span class="place-badge" style="background: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}44;">
              ${meta.icon} ${meta.label}
            </span>
            <span class="place-distance">📍 ${place.formattedDistance}</span>
          </div>
          <div class="place-title-wrap">
            <h4 class="place-name">${place.name}</h4>
            ${ratingStars}
          </div>
        </div>

        <p class="place-description">${place.desc || ''}</p>
        ${extraDetails}

        <div class="place-card-footer">
          <span class="place-address">${place.address ? `📌 ${place.address}` : ''}</span>
          <div class="place-actions">
            <button class="btn-card-map" onclick="window.mapService.flyToAndHighlight(${place.lat}, ${place.lng}, '${place.name}')" title="הצג במפה">
              🗺️ מפה
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" rel="noopener" class="btn-card-navigate" title="נווט">
              🧭 נווט
            </a>
          </div>
        </div>
      </div>
    `;
  }
}

window.placesService = new PlacesService();
