// ==========================================================================
// שירות מפה אינטראקטיבית (Leaflet Map Service)
// סיכות מותאמות אישית, פולס רדאר, סיכת מלון מוזהבת וקו ניווט
// ==========================================================================

class MapService {
  constructor() {
    this.map = null;
    this.userMarker = null;
    this.hotelMarker = null;
    this.placeMarkersLayer = null;
    this.routeLine = null;
    this.isInitialized = false;
  }

  initMap(containerId = 'leafletMapContainer', initialLat = 41.8902, initialLng = 12.4922) {
    if (this.isInitialized || !window.L) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    this.map = L.map(containerId, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false
    });

    // בקרת זום בצד שמאל למעלה (בממשק עברי)
    L.control.zoom({ position: 'topleft' }).addTo(this.map);

    // שכבת מפה מודרנית ונקייה מבית CartoDB (Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.placeMarkersLayer = L.layerGroup().addTo(this.map);
    this.isInitialized = true;

    // רענון ממדי מפה
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 300);
  }

  updateUserMarker(lat, lng) {
    if (!this.map || !window.L) return;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="user-radar-container">
          <div class="radar-pulse"></div>
          <div class="user-core-dot"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      this.userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup-card">
            <strong>📍 המיקום הנוכחי שלך</strong>
            <p style="margin: 4px 0 0; font-size: 12px; color: #666;">נקודת הזיהוי של האפליקציה</p>
          </div>
        `);
    }
  }

  updateHotelMarker(lat, lng, hotelName = 'המלון שלי', hotelAddress = '') {
    if (!this.map || !window.L) return;

    const hotelIcon = L.divIcon({
      className: 'custom-hotel-marker',
      html: `
        <div class="hotel-star-pin">
          <span class="hotel-star-icon">🏨</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (this.hotelMarker) {
      this.hotelMarker.setLatLng([lat, lng]);
    } else {
      this.hotelMarker = L.marker([lat, lng], { icon: hotelIcon, zIndexOffset: 900 })
        .addTo(this.map);
    }

    this.hotelMarker.bindPopup(`
      <div class="map-popup-card">
        <div style="font-weight: 700; color: #1e3c72; font-size: 14px;">🏨 ${hotelName}</div>
        ${hotelAddress ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${hotelAddress}</div>` : ''}
        <div style="margin-top: 8px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener" class="popup-navigate-btn">
            🧭 נווט למלון
          </a>
        </div>
      </div>
    `);

    this.drawRouteToHotel();
  }

  drawRouteToHotel() {
    if (!this.map || !this.userMarker || !this.hotelMarker) return;

    const userLatLng = this.userMarker.getLatLng();
    const hotelLatLng = this.hotelMarker.getLatLng();

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    // קו מנוקד אלגנטי בין המשתמש למלון
    this.routeLine = L.polyline([userLatLng, hotelLatLng], {
      color: '#f59e0b',
      weight: 3,
      dashArray: '6, 8',
      opacity: 0.85
    }).addTo(this.map);
  }

  renderNearbyMarkers(places) {
    if (!this.map || !this.placeMarkersLayer || !window.L) return;

    this.placeMarkersLayer.clearLayers();

    places.forEach(place => {
      const meta = window.placesService.getCategoryMeta(place.category);
      const icon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div class="poi-pin" style="background: ${meta.color}; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            <span>${meta.icon}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(this.placeMarkersLayer)
        .bindPopup(`
          <div class="map-popup-card">
            <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${place.name}</div>
            <div style="font-size: 12px; color: #64748b; margin: 4px 0;">${meta.icon} ${meta.label} • 📍 ${place.formattedDistance}</div>
            ${place.desc ? `<p style="font-size: 12px; margin: 4px 0 8px; line-height: 1.4;">${place.desc}</p>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" rel="noopener" class="popup-navigate-btn">
              🧭 נווט עכשיו
            </a>
          </div>
        `);
    });
  }

  fitAll() {
    if (!this.map) return;
    const group = [];
    if (this.userMarker) group.push(this.userMarker.getLatLng());
    if (this.hotelMarker) group.push(this.hotelMarker.getLatLng());

    if (this.placeMarkersLayer) {
      this.placeMarkersLayer.eachLayer(layer => {
        if (layer.getLatLng) group.push(layer.getLatLng());
      });
    }

    if (group.length > 0) {
      this.map.fitBounds(L.latLngBounds(group), { padding: [50, 50], maxZoom: 16 });
    }
  }

  flyToAndHighlight(lat, lng, name = '') {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 17, { duration: 1.2 });
  }
}

window.mapService = new MapService();
