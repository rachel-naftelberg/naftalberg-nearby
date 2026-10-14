// ==========================================================================
// שירות מפה אינטראקטיבית (Leaflet Map Service)
// סימון משתמש, סימון מלון, קו ניווט וסיכות מקומות מסווגות
// ==========================================================================

class MapService {
  constructor() {
    this.map = null;
    this.userMarker = null;
    this.hotelMarker = null;
    this.routeLine = null;
    this.placesMarkersLayer = null;
  }

  initMap(containerId = 'leafletMap', defaultLat = 32.5714, defaultLng = 34.9530) {
    if (this.map) return;

    const el = document.getElementById(containerId);
    if (!el) return;

    this.map = L.map(containerId, {
      zoomControl: true,
      attributionControl: false
    }).setView([defaultLat, defaultLng], 15);

    // מפת OpenStreetMap סטנדרטית - פתוחה וחופשית ללא צורך ב-API Key!
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.placesMarkersLayer = L.layerGroup().addTo(this.map);
  }

  // סימון מיקום המשתמש עם עיגול פועם
  updateUserMarker(lat, lng, title = 'המיקום הנוכחי שלך') {
    if (!this.map) return;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: -6px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: pulseDot 1.5s infinite;"></div>
          <div style="position: absolute; inset: 0; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map);
      this.userMarker.bindPopup(`<strong>📍 ${title}</strong>`);
    }
  }

  // סימון המלון
  updateHotelMarker(lat, lng, name = 'המלון שלי', address = '') {
    if (!this.map) return;

    const hotelIcon = L.divIcon({
      className: 'custom-hotel-marker',
      html: `
        <div style="background: #f59e0b; color: white; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
          🏨
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    if (this.hotelMarker) {
      this.hotelMarker.setLatLng([lat, lng]);
    } else {
      this.hotelMarker = L.marker([lat, lng], { icon: hotelIcon }).addTo(this.map);
    }

    this.hotelMarker.bindPopup(`
      <div style="direction: rtl; text-align: right; font-family: 'Heebo', sans-serif;">
        <strong style="font-size: 1rem; color: #1e3a8a;">🏨 ${name}</strong>
        ${address ? `<p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">${address}</p>` : ''}
      </div>
    `);

    this.drawRouteLine();
  }

  // שרטוט קו מנוקד בין המשתמש למלון
  drawRouteLine() {
    if (!this.map || !this.userMarker || !this.hotelMarker) return;

    const userLatLng = this.userMarker.getLatLng();
    const hotelLatLng = this.hotelMarker.getLatLng();

    if (this.routeLine) {
      this.routeLine.setLatLngs([userLatLng, hotelLatLng]);
    } else {
      this.routeLine = L.polyline([userLatLng, hotelLatLng], {
        color: '#f59e0b',
        dashArray: '6, 8',
        weight: 3,
        opacity: 0.8
      }).addTo(this.map);
    }
  }

  // רינדור סיכות מקומות בסביבה
  renderNearbyMarkers(places) {
    if (!this.map || !this.placesMarkersLayer) return;

    this.placesMarkersLayer.clearLayers();

    places.slice(0, 30).forEach(place => {
      const meta = window.placesService.getCategoryMeta(place.category);
      const markerHtml = `
        <div style="background: ${meta.color}; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          ${meta.icon}
        </div>
      `;

      const icon = L.divIcon({
        className: 'place-marker',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([place.lat, place.lng], { icon });
      marker.bindPopup(`
        <div style="direction: rtl; text-align: right; font-family: 'Heebo', sans-serif; min-width: 140px;">
          <strong style="color: #0f172a; font-size: 0.95rem;">${place.name}</strong>
          <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">📍 ${place.formattedDistance}</div>
          <div style="margin-top: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" style="display: inline-block; background: #2563eb; color: white; padding: 3px 8px; border-radius: 6px; text-decoration: none; font-size: 0.75rem; font-weight: 600;">נווט</a>
          </div>
        </div>
      `);

      this.placesMarkersLayer.addLayer(marker);
    });
  }

  flyToAndHighlight(lat, lng, name = '') {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 17, { duration: 1.2 });
    
    // גלילה למפה במסכים קטנים
    const mapSection = document.getElementById('mapSection');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

window.mapService = new MapService();
