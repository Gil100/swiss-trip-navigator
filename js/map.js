// =====================================================
// BASIC MAP IMPLEMENTATION FOR SWISS TRIP NAVIGATOR
// 
// A simple DOM-based map with markers but no background image
// to ensure everything works reliably
// =====================================================

let markers = [];
let routeLine = null;

// יצירת סמן טקסט פשוט להצגה במפה
function createSimpleMarker(lat, lng, text, color) {
  // 1. יצירת אלמנט HTML
  const markerElement = document.createElement('div');
  markerElement.className = 'simple-marker';
  markerElement.style.backgroundColor = color || '#e53935';
  markerElement.style.color = 'white';
  markerElement.style.width = '30px';
  markerElement.style.height = '30px';
  markerElement.style.borderRadius = '50%';
  markerElement.style.display = 'flex';
  markerElement.style.alignItems = 'center';
  markerElement.style.justifyContent = 'center';
  markerElement.style.position = 'absolute';
  markerElement.style.transform = 'translate(-50%, -50%)';
  markerElement.style.border = '2px solid white';
  markerElement.style.boxShadow = '0 0 5px rgba(0,0,0,0.4)';
  markerElement.style.zIndex = '1000';
  markerElement.style.cursor = 'pointer';
  markerElement.style.fontSize = '16px';
  markerElement.innerHTML = text || '●';
  
  // 2. הוספה למפה
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(markerElement);
  }
  
  // 3. עדכון מיקום
  updateMarkerPosition(markerElement, lat, lng);
  
  return {
    element: markerElement,
    lat: lat,
    lng: lng,
    positionOnMap: function() {
      updateMarkerPosition(this.element, this.lat, this.lng);
    },
    remove: function() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    },
    setPopupContent: function(content) {
      this.popupContent = content;
      
      // הוספת אירוע לחיצה שיציג את החלון המידע
      this.element.onclick = () => {
        showPopup(this.lat, this.lng, content);
      };
    }
  };
}

// עדכון מיקום סמן על המפה
function updateMarkerPosition(markerElement, lat, lng) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  // חישוב גודל המפה
  const mapWidth = mapContainer.offsetWidth;
  const mapHeight = mapContainer.offsetHeight;
  
  // המרת קואורדינטות לאחוזים (מותאם לשוויץ)
  const latRange = [45.8, 47.8]; // טווח קווי רוחב
  const lngRange = [5.9, 10.5];  // טווח קווי אורך
  
  const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
  const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
  
  // חישוב מיקום בפיקסלים
  const x = (lngPercent / 100) * mapWidth;
  const y = (latPercent / 100) * mapHeight;
  
  // עדכון מיקום הסמן
  markerElement.style.left = `${x}px`;
  markerElement.style.top = `${y}px`;
}

// הצגת חלון מידע
function showPopup(lat, lng, content) {
  // הסרת חלון מידע קודם אם קיים
  const existingPopup = document.getElementById('simple-popup');
  if (existingPopup) {
    existingPopup.parentNode.removeChild(existingPopup);
  }
  
  // יצירת חלון מידע חדש
  const popup = document.createElement('div');
  popup.id = 'simple-popup';
  popup.className = 'simple-popup';
  popup.innerHTML = content;
  popup.style.position = 'absolute';
  popup.style.backgroundColor = 'white';
  popup.style.padding = '10px';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.4)';
  popup.style.maxWidth = '300px';
  popup.style.zIndex = '2000';
  
  // הוספת כפתור סגירה
  const closeButton = document.createElement('div');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.fontSize = '16px';
  closeButton.onclick = () => {
    popup.parentNode.removeChild(popup);
  };
  popup.appendChild(closeButton);
  
  // הוספה למפה ומיקום
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(popup);
    
    // מיקום החלון ליד הסמן
    const mapWidth = mapContainer.offsetWidth;
    const mapHeight = mapContainer.offsetHeight;
    
    const latRange = [45.8, 47.8];
    const lngRange = [5.9, 10.5];
    
    const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
    const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
    
    const x = (lngPercent / 100) * mapWidth;
    const y = (latPercent / 100) * mapHeight;
    
    popup.style.left = `${x + 20}px`; // קצת ימינה מהסמן
    popup.style.top = `${y - 10}px`;  // קצת למעלה מהסמן
    
    // וידוא שהחלון נשאר בתוך גבולות המפה
    const popupRect = popup.getBoundingClientRect();
    const mapRect = mapContainer.getBoundingClientRect();
    
    if (popupRect.right > mapRect.right) {
      popup.style.left = `${x - popupRect.width - 20}px`;
    }
    
    if (popupRect.bottom > mapRect.bottom) {
      popup.style.top = `${y - popupRect.height - 20}px`;
    }
  }
}

// אתחול המפה
function initMap() {
  try {
    console.log("Initializing basic map...");
    
    // 1. ודא שהאלמנט קיים
    if (!document.getElementById('map')) {
      console.error('אלמנט המפה לא נמצא');
      return;
    }
    
    // 2. הוסף רקע בסיסי למפה (ללא תמונת רקע)
    const mapElement = document.getElementById('map');
    mapElement.style.backgroundColor = '#e5f2fd';
    mapElement.style.position = 'relative';
    mapElement.style.overflow = 'hidden';
    
    // 3. יצירת אובייקט מפה בסיסי
    window.map = {
      // מצב פנימי
      _center: [46.8182, 8.2275],
      _zoom: 8,
      _markers: [],
      
      // API בסיסי
      setView: function(center, zoom) {
        this._center = center;
        this._zoom = zoom || this._zoom;
        this.refreshMarkers();
        return this;
      },
      
      refreshMarkers: function() {
        this._markers.forEach(marker => {
          if (marker && marker.positionOnMap) {
            marker.positionOnMap();
          }
        });
      },
      
      addMarker: function(lat, lng, options) {
        try {
          // קביעת סוג האייקון בהתאם לסוג המיקום
          let iconText = '📍';
          let iconColor = '#e53935';
          
          if (options && options.icon && options.icon.options) {
            const className = options.icon.options.className || '';
            
            if (className.includes('waterfall')) {
              iconColor = '#00BCD4';
              iconText = '💦';
            } else if (className.includes('viewpoint')) {
              iconColor = '#FFC107';
              iconText = '👁️';
            } else if (className.includes('lake')) {
              iconColor = '#2196F3';
              iconText = '🏞️';
            } else if (className.includes('mountain')) {
              iconColor = '#795548';
              iconText = '🏔️';
            } else if (className.includes('castle')) {
              iconColor = '#673AB7';
              iconText = '🏰';
            } else if (className.includes('cablecar')) {
              iconColor = '#F44336';
              iconText = '🚡';
            } else if (className.includes('gorge')) {
              iconColor = '#607D8B';
              iconText = '🏞️';
            } else if (className.includes('landmark')) {
              iconColor = '#9C27B0';
              iconText = '🏛️';
            } else if (className.includes('monument')) {
              iconColor = '#E91E63';
              iconText = '🗿';
            } else if (className.includes('parking')) {
              iconColor = '#3F51B5';
              iconText = '🅿️';
            } else if (className.includes('city')) {
              iconColor = '#FF9800';
              iconText = '🏙️';
            }
          }
          
          // יצירת סמן
          const marker = createSimpleMarker(lat, lng, iconText, iconColor);
          this._markers.push(marker);
          
          // הוספת API תואם ל-Leaflet
          marker.bindPopup = function(content) {
            this.setPopupContent(content);
            return this;
          };
          
          marker.on = function(event, handler) {
            if (event === 'click') {
              const originalClick = this.element.onclick;
              this.element.onclick = (e) => {
                if (originalClick) originalClick.call(this, e);
                handler.call(this, e);
              };
            }
            return this;
          };
          
          marker.getLatLng = function() {
            return { lat: this.lat, lng: this.lng };
          };
          
          marker.openPopup = function() {
            if (this.popupContent) {
              showPopup(this.lat, this.lng, this.popupContent);
            }
          };
          
          return marker;
        } catch (e) {
          console.error("Error creating marker:", e);
          return null;
        }
      },
      
      removeMarker: function(marker) {
        if (!marker) return;
        
        try {
          marker.remove();
          
          const index = this._markers.indexOf(marker);
          if (index > -1) {
            this._markers.splice(index, 1);
          }
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      },
      
      invalidateSize: function() {
        this.refreshMarkers();
        return this;
      },
      
      // פונקציות תואמות ל-API שאנחנו משתמשים בו
      customAddMarker: function(lat, lng, options, popupContent, clickHandler) {
        try {
          const marker = this.addMarker(lat, lng, options);
          
          if (marker && popupContent) {
            marker.bindPopup(popupContent);
          }
          
          if (marker && clickHandler) {
            marker.on('click', clickHandler);
          }
          
          return marker;
        } catch (e) {
          console.error("Error in customAddMarker:", e);
          return null;
        }
      },
      
      customRemoveMarker: function(marker) {
        this.removeMarker(marker);
      },
      
      customAddPolyline: function() {
        // פונקציה ריקה - אין תמיכה בקווים
        return { remove: function() {} };
      },
      
      customFitBounds: function(bounds) {
        // פונקציה ריקה - אין תמיכה בגבולות
        // במקום זה, נתמקד על הנקודה הראשונה
        try {
          if (this._markers.length > 0) {
            const firstMarker = this._markers[0];
            this.setView([firstMarker.lat, firstMarker.lng]);
          }
        } catch (e) {}
      }
    };
    
    // 4. חיזוק המפה מפני טעויות
    Object.keys(window.map).forEach(key => {
      const originalFn = window.map[key];
      if (typeof originalFn === 'function') {
        window.map[key] = function() {
          try {
            return originalFn.apply(this, arguments);
          } catch (e) {
            console.error(`Error in map.${key}:`, e);
            return null;
          }
        };
      }
    });
    
    // 5. הוספת קואורדינטות משורטטות על המפה
    addCoordinateLines();
    
    // 6. הצגת היום הנוכחי על המפה
    if (appState.isDataLoaded) {
      updateMapForDay(appState.itineraryData.days[appState.currentDayIndex]);
    }
    
    console.log('המפה אותחלה בהצלחה');
    
  } catch (error) {
    console.error('שגיאה באתחול המפה:', error);
  }
  
  // הוספת CSS מותאם למפה
  const style = document.createElement('style');
  style.textContent = `
    #map {
      background-color: #e5f2fd;
      position: relative;
      overflow: hidden;
    }
    .simple-marker {
      font-size: 16px;
      user-select: none;
      text-align: center;
      line-height: 1;
    }
    .simple-popup {
      direction: rtl;
      text-align: right;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      max-height: 300px;
      overflow-y: auto;
      background-color: white;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.4);
    }
    .simple-popup h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #e53935;
    }
    .simple-popup p {
      margin: 0 0 8px 0;
    }
    .next-location-info {
      margin: 10px 0;
      padding: 8px;
      background-color: #f9f9f9;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .popup-nav-link {
      display: inline-block;
      background-color: #e53935;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      margin-top: 8px;
      cursor: pointer;
      border: none;
      font-size: 14px;
      text-decoration: none;
    }
    .coordinate-line {
      position: absolute;
      background-color: rgba(200, 200, 200, 0.2);
      z-index: 10;
    }
    .coordinate-label {
      position: absolute;
      font-size: 10px;
      color: #666;
      z-index: 15;
      background-color: rgba(255, 255, 255, 0.7);
      padding: 1px 3px;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);
}

// הוספת קווי קואורדינטות לעזרה בהתמצאות
function addCoordinateLines() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  
  const width = mapElement.offsetWidth;
  const height = mapElement.offsetHeight;
  
  // קווי רוחב - אופקיים
  const latitudes = [46.0, 46.5, 47.0, 47.5];
  latitudes.forEach(lat => {
    const line = document.createElement('div');
    line.className = 'coordinate-line';
    line.style.left = '0';
    line.style.width = '100%';
    line.style.height = '1px';
    
    const latRange = [45.8, 47.8];
    const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
    const y = (latPercent / 100) * height;
    line.style.top = `${y}px`;
    
    mapElement.appendChild(line);
    
    // תווית
    const label = document.createElement('div');
    label.className = 'coordinate-label';
    label.textContent = `${lat}°N`;
    label.style.top = `${y - 12}px`;
    label.style.left = '5px';
    mapElement.appendChild(label);
  });
  
  // קווי אורך - אנכיים
  const longitudes = [6.0, 7.0, 8.0, 9.0, 10.0];
  longitudes.forEach(lng => {
    const line = document.createElement('div');
    line.className = 'coordinate-line';
    line.style.top = '0';
    line.style.height = '100%';
    line.style.width = '1px';
    
    const lngRange = [5.9, 10.5];
    const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
    const x = (lngPercent / 100) * width;
    line.style.left = `${x}px`;
    
    mapElement.appendChild(line);
    
    // תווית
    const label = document.createElement('div');
    label.className = 'coordinate-label';
    label.textContent = `${lng}°E`;
    label.style.left = `${x + 5}px`;
    label.style.top = '5px';
    mapElement.appendChild(label);
  });
}

// עדכון המפה ליום ספציפי
function updateMapForDay(day) {
  try {
    console.log("Updating map for day:", day.dayNumber);
    
    // בדיקה שהמפה אותחלה
    if (!window.map) {
      console.error('המפה לא אותחלה');
      return;
    }
    
    // ניקוי סמנים קודמים
    clearMarkers();
    
    // הוספת סמנים חדשים
    day.locations.forEach(location => {
      const marker = createMarker(location, day);
      if (marker) {
        markers.push(marker);
      }
    });
    
    // התמקדות על כל הסמנים
    if (day.locations.length > 0) {
      // התמקדות על המקום הראשון כברירת מחדל
      window.map.setView(day.locations[0].coordinates);
    }
    
  } catch (error) {
    console.error('שגיאה בעדכון המפה:', error);
  }
}

// יצירת סמן
function createMarker(location, day) {
  try {
    console.log(`Creating marker for ${location.title}`);
    
    if (!location.coordinates || location.coordinates.length !== 2) {
      console.error("Invalid coordinates for:", location.title);
      return null;
    }
    
    const [lat, lng] = location.coordinates;
    
    // ניסיון ליצור אייקון
    let icon;
    try {
      icon = L.divIcon({
        className: `map-icon ${location.type || 'default'}`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
        html: `<div class="icon-inner"></div>`
      });
    } catch (e) {
      icon = null;
    }
    
    // הכנת מידע לחלון המידע
    let nextLocationInfo = '';
    
    const locationIndex = day.locations.findIndex(loc => loc.id === location.id);
    if (locationIndex < day.locations.length - 1) {
      const nextLocation = day.locations[locationIndex + 1];
      const distance = calculateDistance(location.coordinates, nextLocation.coordinates);
      const travelTime = estimateTravelTime(distance);
      
      nextLocationInfo = `
        <div class="next-location-info">
          <p><strong>למיקום הבא:</strong> ${nextLocation.title}</p>
          <p>מרחק משוער: ${distance.toFixed(1)} ק"מ</p>
          <p>זמן נסיעה משוער: ${travelTime} דקות</p>
        </div>
      `;
    }
    
    // תוכן לחלון המידע
    const popupContent = `
      <div class="marker-popup">
        <h3>${location.title}</h3>
        <p>${location.description}</p>
        ${nextLocationInfo}
        <button class="popup-nav-link" onclick="openNavigation({
          coordinates: [${location.coordinates[0]}, ${location.coordinates[1]}],
          title: '${location.title.replace(/'/g, "\\'")}'
        })">פתח בניווט</button>
      </div>
    `;
    
    // פונקציית לחיצה
    const clickHandler = function() {
      highlightItineraryItem(location.id);
    };
    
    // יצירת סמן
    return window.map.customAddMarker(lat, lng, { icon }, popupContent, clickHandler);
    
  } catch (error) {
    console.error("Critical error creating marker:", error);
    return null;
  }
}

// ניקוי כל הסמנים
function clearMarkers() {
  try {
    console.log("Clearing markers...");
    
    if (!window.map) return;
    
    // הסרת כל הסמנים
    markers.forEach(marker => {
      if (marker) {
        try {
          window.map.customRemoveMarker(marker);
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      }
    });
    
    markers = [];
    
    // ניקוי קו המסלול אם קיים
    if (routeLine) {
      try {
        window.map.customRemoveMarker(routeLine);
      } catch (e) {
        console.warn("Error removing route line:", e);
      }
      
      routeLine = null;
    }
    
    console.log("All markers cleared");
  } catch (error) {
    console.error('שגיאה בניקוי סמנים:', error);
  }
}

// יצירת קו מסלול
function createRouteLine(locations) {
  // פונקציה ריקה - בגרסה הבסיסית אין תצוגת קווים
  return null;
}

// התמקדות על מיקום
function focusLocationOnMap(location) {
  try {
    console.log(`Focusing on location: ${location.title}`);
    
    if (!window.map) return;
    
    // התמקדות על המיקום
    window.map.setView(location.coordinates);
    
    // חיפוש וסימון הסמן המתאים
    const marker = markers.find(m => {
      if (!m || !m.getLatLng) return false;
      
      try {
        const pos = m.getLatLng();
        return pos.lat === location.coordinates[0] && pos.lng === location.coordinates[1];
      } catch (e) {
        return false;
      }
    });
    
    // פתיחת חלון מידע אם נמצא סמן מתאים
    if (marker && typeof marker.openPopup === 'function') {
      marker.openPopup();
    }
    
  } catch (error) {
    console.error('שגיאה בהתמקדות על מיקום:', error);
  }
}

// פונקציה לחישוב מרחק בין שתי נקודות 
function calculateDistance(coord1, coord2) {
  // נוסחת Haversine לחישוב מרחק בין שתי נקודות על פני כדור הארץ
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // מרחק בקילומטרים
  return distance;
}

// פונקציה להערכת זמן נסיעה לפי מרחק
function estimateTravelTime(distance) {
  // הנחה של מהירות ממוצעת של 60 קמ"ש בדרכים אלפיניות
  const avgSpeed = 60; // קמ"ש
  const timeHours = distance / avgSpeed;
  const timeMinutes = Math.round(timeHours * 60);
  return timeMinutes;
}