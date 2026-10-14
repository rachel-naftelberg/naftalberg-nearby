// ==========================================================================
// שירות מקומות בסביבה (Nearby Places Service)
// מסעדות, בתי קפה, שירותים ציבוריים, שירותים חיוניים וסינון מרחק קשיח
// ==========================================================================

class PlacesService {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.cachedLivePlaces = [];
    this.cachedCoordsKey = '';
    this.isLoadingLive = false;
  }

  // איסוף כל המקומות בסביבת המיקום הנוכחי (עם סינון מרחק קשיח של 15 ק"מ מקסימום!)
  getNearbyPlaces(lat, lng) {
    const MAX_DISTANCE_METERS = 15000; // מקסימום 15 ק"מ - מונע לחלוטין הצעות מערים רחוקות
    const activeSpot = window.attractionModalManager ? window.attractionModalManager.selectedSpot : null;
    let spot = activeSpot;
    if (!spot && window.attractionModalManager) {
      spot = window.attractionModalManager.findNearestAttraction(lat, lng);
    }

    let rawPlaces = [];

    // 1. אם יש אטרקציה נבחרת / קרובה עם מקומות, אסוף אותם
    if (spot && spot.nearbyPlaces && spot.nearbyPlaces.length > 0) {
      rawPlaces = rawPlaces.concat(spot.nearbyPlaces);
    }

    // 2. אסוף מקומות מכל נקודות הציון במאגר שנמצאות ברדיוס מקומי (עד 12 ק"מ)
    const allHotspots = Object.values(window.NaftalbergData ? window.NaftalbergData.HOTSPOTS_DATA : {});
    for (const h of allHotspots) {
      if (h.nearbyPlaces && h.nearbyPlaces.length > 0) {
        const spotDist = window.hotelDistanceCalculator.calculateHaversineDistance(lat, lng, h.lat, h.lng);
        if (spotDist <= 12000) {
          rawPlaces = rawPlaces.concat(h.nearbyPlaces);
        }
      }
    }

    // 3. הוסף מקומות שנמשכו באופן חי מ-OpenStreetMap / Overpass (אם קיימים)
    if (this.cachedLivePlaces && this.cachedLivePlaces.length > 0) {
      rawPlaces = rawPlaces.concat(this.cachedLivePlaces);
    }

    if (!rawPlaces.length) {
      return [];
    }

    // מניעת כפילויות לפי מזהה או שם ומיקום
    const seen = new Set();
    const uniqueRawPlaces = [];
    for (const p of rawPlaces) {
      const key = p.id || `${p.name}_${p.lat.toFixed(3)}_${p.lng.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRawPlaces.push(p);
      }
    }

    // חישוב מרחק מדויק מכל מקום למיקום המשתמש הנוכחי
    const places = uniqueRawPlaces.map(place => {
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

    // סינון קשיח: מקומות שרחוקים מ-15 ק"מ נפסלים לחלוטין!
    const strictlyLocalPlaces = places.filter(p => p.distanceMeters <= MAX_DISTANCE_METERS);

    // מיון לפי קרבה מהקרוב לרחוק
    return strictlyLocalPlaces.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  // משיכת מקומות חיים מ-OpenStreetMap Overpass לסביבת המיקום
  async fetchLivePlaces(lat, lng) {
    const key = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    if (this.cachedCoordsKey === key && this.cachedLivePlaces.length > 0) {
      return this.cachedLivePlaces;
    }
    if (this.isLoadingLive) return this.cachedLivePlaces;

    this.isLoadingLive = true;

    try {
      const query = `[out:json][timeout:6];
(
  node["amenity"~"restaurant|cafe|fast_food|toilets|pharmacy|supermarket"](around:4000,${lat},${lng});
  node["tourism"~"attraction|museum|viewpoint|gallery"](around:4000,${lat},${lng});
);
out center 30;`;

      const overpassEndpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
      ];

      let elements = [];
      for (const endpoint of overpassEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: 'data=' + encodeURIComponent(query),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.elements && data.elements.length > 0) {
              elements = data.elements;
              break;
            }
          }
        } catch (_) {}
      }

      if (elements && elements.length > 0) {
        const livePlaces = [];
        elements.forEach(item => {
          const tags = item.tags || {};
          const name = tags['name:he'] || tags.name || tags['name:en'];
          if (!name) return;

          const itemLat = item.lat || (item.center ? item.center.lat : null);
          const itemLng = item.lon || (item.center ? item.center.lon : null);
          if (!itemLat || !itemLng) return;

          let category = 'essential';
          let subType = '';
          let cuisine = '';
          let coffeeSpecialty = '';
          let hours = tags.opening_hours || 'לפי שעות הפעילות';

          if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') {
            category = 'restaurant';
            cuisine = tags.cuisine || 'מקומי / מגוון';
          } else if (tags.amenity === 'cafe') {
            category = 'cafe';
            coffeeSpecialty = tags.coffee || 'קפה ומאפים טריים';
          } else if (tags.amenity === 'toilets') {
            category = 'restroom';
          } else if (tags.amenity === 'pharmacy') {
            category = 'essential';
            subType = 'pharmacy';
          } else if (tags.amenity === 'supermarket') {
            category = 'essential';
            subType = 'supermarket';
          } else if (tags.tourism) {
            category = 'attraction';
          }

          const dist = window.hotelDistanceCalculator.calculateHaversineDistance(lat, lng, itemLat, itemLng);
          if (dist > 15000) return;

          livePlaces.push({
            id: `osm-${item.id}`,
            category,
            subType,
            name,
            desc: tags.description || `${name} בסביבתכם המיידית`,
            cuisine,
            coffeeSpecialty,
            cost: tags.fee === 'yes' ? 'בתשלום' : 'חינם',
            accessible: tags.wheelchair === 'yes' ? 'נגיש' : 'רגיל',
            cleanlinessRating: 4.5,
            rating: 4.6,
            priceLevel: '₪₪',
            distanceMeters: dist,
            formattedDistance: window.hotelDistanceCalculator.formatDistance(dist),
            lat: itemLat,
            lng: itemLng,
            address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : '',
            hours
          });
        });

        if (livePlaces.length > 0) {
          this.cachedLivePlaces = livePlaces;
          this.cachedCoordsKey = key;
        }
      }
    } catch (err) {
      console.warn('Live places fetch error:', err);
    } finally {
      this.isLoadingLive = false;
    }

    return this.cachedLivePlaces;
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
        return { label: 'מה עוד באזור', icon: '🏬', color: '#9b5de5' };
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
          <span class="pill pill-cuisine">🍝 ${place.cuisine || 'מקומי'}</span>
          <span class="pill pill-price">${place.priceLevel || '₪₪'}</span>
          <span class="pill pill-hours">🕒 ${place.hours || 'פתוח'}</span>
        </div>
      `;
    } else if (place.category === 'cafe') {
      extraDetails = `
        <div class="card-pills-row">
          <span class="pill pill-coffee">☕ ${place.coffeeSpecialty || 'קפה ומאפים'}</span>
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
      let subIcon = '🏬 שירות חיוני';
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
            <button class="btn-card-map" onclick="window.mapService.flyToAndHighlight(${place.lat}, ${place.lng}, '${place.name.replace(/'/g, "\\'")}', true)" title="הצג במפה">
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
