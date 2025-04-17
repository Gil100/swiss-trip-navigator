// =====================================================
// ULTRA-MINIMAL LEAFLET MAP SOLUTION
// 
// This version uses the most basic approaches possible
// to ensure map functionality with minimal dependencies
// =====================================================

let markers = [];
let routeLine = null;

// הוספת תמונת רקע כשהמפה לא נטענת
function addBackgroundImage() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.backgroundImage = "url('mainview.webp')";
    mapElement.style.backgroundSize = "cover";
    mapElement.style.backgroundPosition = "center";
  }
}

// יצירת סמן טקסט פשוט להצגה במפה
function createSimpleMarker(lat, lng, text, color) {
  // 1. יצירת אלמנט HTML
  const markerElement = document.createElement('div');
  markerElement.className = 'simple-marker';
  markerElement.style.backgroundColor = color || '#e53935';
  markerElement.style.color = 'white';
  markerElement.style.width = '20px';
  markerElement.style.height = '20px';
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
  markerElement.textContent = text || '●';
  
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
  // יש להתאים את זה בהתאם לגודל המפה ולמיקום שבו אנחנו רוצים להציג
  // כאן מדובר ברק בהדגמה בסיסית מאוד
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  // 1. חישוב גודל המפה
  const mapWidth = mapContainer.offsetWidth;
  const mapHeight = mapContainer.offsetHeight;
  
  // 2. המרת קואורדינטות לאחוזים (פשטני מאוד - לא מדויק)
  // המרה פשוטה מ-lat/lng לאחוזים במפה (הנחה של מפה מלבנית פשוטה)
  // קווי רוחב מ-45 עד 48 (שוויץ)
  // קווי אורך מ-6 עד 10 (שוויץ)
  const latRange = [45, 48]; // טווח קווי רוחב
  const lngRange = [6, 10];  // טווח קווי אורך
  
  const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
  const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
  
  // 3. חישוב מיקום בפיקסלים
  const x = (lngPercent / 100) * mapWidth;
  const y = (latPercent / 100) * mapHeight;
  
  // 4. עדכון מיקום הסמן
  markerElement.style.left = `${x}px`;
  markerElement.style.top = `${y}px`;
}

// הצגת חלון מידע
function showPopup(lat, lng, content) {
  // 1. הסרת חלון מידע קודם אם קיים
  const existingPopup = document.getElementById('simple-popup');
  if (existingPopup) {
    existingPopup.parentNode.removeChild(existingPopup);
  }
  
  // 2. יצירת חלון מידע חדש
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
  
  // 3. הוספת כפתור סגירה
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
  
  // 4. הוספה למפה ומיקום
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(popup);
    
    // מיקום החלון ליד הסמן
    const mapWidth = mapContainer.offsetWidth;
    const mapHeight = mapContainer.offsetHeight;
    
    const latRange = [45, 48];
    const lngRange = [6, 10];
    
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
    console.log("Initializing ultra-minimal map...");
    
    // 1. הוספת תמונת רקע
    addBackgroundImage();
    
    // 2. ודא שהאלמנט קיים
    if (!document.getElementById('map')) {
      console.error('אלמנט המפה לא נמצא');
      return;
    }
    
    // 3. ליצירת מטה-אובייקט של מפה
    window.map = {
      // מידע בסיסי על המפה
      _center: [46.8182, 8.2275],
      _zoom: 8,
      
      // שמירת הסטטוס וסמנים
      _markers: [],
      _polylines: [],
      
      // פונקציות API
      setView: function(center, zoom) {
        this._center = center;
        this._zoom = zoom || this._zoom;
        this.refreshMarkers(); // עדכון מיקום כל הסמנים
      },
      
      addMarker: function(lat, lng, options) {
        // יצירת אייקון פשוט בהתאם לסוג המיקום
        let markerText = '●';
        let markerColor = '#e53935';
        
        if (options && options.icon && options.icon.options) {
          const className = options.icon.options.className || '';
          
          // קביעת צבע בהתאם לסוג המיקום
          if (className.includes('waterfall')) {
            markerColor = '#00BCD4';
            markerText = '💦';
          } else if (className.includes('viewpoint')) {
            markerColor = '#FFC107';
            markerText = '👁️';
          } else if (className.includes('lake')) {
            markerColor = '#2196F3';
            markerText = '🏞️';
          } else if (className.includes('mountain')) {
            markerColor = '#795548';
            markerText = '🏔️';
          } else if (className.includes('castle')) {
            markerColor = '#673AB7';
            markerText = '🏰';
          } else if (className.includes('cablecar')) {
            markerColor = '#F44336';
            markerText = '🚡';
          } else if (className.includes('gorge')) {
            markerColor = '#607D8B';
            markerText = '🏞️';
          } else if (className.includes('landmark')) {
            markerColor = '#9C27B0';
            markerText = '🏛️';
          } else if (className.includes('monument')) {
            markerColor = '#E91E63';
            markerText = '🗿';
          } else if (className.includes('parking')) {
            markerColor = '#3F51B5';
            markerText = '🅿️';
          } else if (className.includes('city')) {
            markerColor = '#FF9800';
            markerText = '🏙️';
          } else {
            markerColor = '#757575';
            markerText = '📍';
          }
        }
        
        // יצירת סמן פשוט
        const marker = createSimpleMarker(lat, lng, markerText, markerColor);
        this._markers.push(marker);
        
        // הוספת שיטות נוספות כדי שיתאימו לפורמט הרגיל
        marker.bindPopup = function(content) {
          this.setPopupContent(content);
          return this;
        };
        
        marker.on = function(event, handler) {
          if (event === 'click') {
            this.element.addEventListener('click', handler);
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
      },
      
      removeMarker: function(marker) {
        if (!marker) return;
        
        // הסרת הסמן מהמפה
        marker.remove();
        
        // הסרת הסמן מהרשימה
        const index = this._markers.indexOf(marker);
        if (index > -1) {
          this._markers.splice(index, 1);
        }
      },
      
      clearMarkers: function() {
        // הסרת כל הסמנים
        this._markers.forEach(marker => marker.remove());
        this._markers = [];
      },
      
      refreshMarkers: function() {
        // עדכון מיקום כל הסמנים
        this._markers.forEach(marker => marker.positionOnMap());
      },
      
      // פונקציות תואמות ל-Leaflet
      customAddMarker: function(lat, lng, options, popupContent, clickHandler) {
        const marker = this.addMarker(lat, lng, options);
        
        if (popupContent) {
          marker.bindPopup(popupContent);
        }
        
        if (clickHandler) {
          marker.on('click', clickHandler);
        }
        
        return marker;
      },
      
      customRemoveMarker: function(marker) {
        this.removeMarker(marker);
      },
      
      customAddPolyline: function(points, options) {
        // פונקציה זו היא placeholder, אנחנו לא מציירים קווים בגרסה המינימלית
        console.log("Polyline not implemented in minimal version");
        
        return {
          remove: function() {} // פונקצית dummy
        };
      },
      
      customFitBounds: function(bounds, options) {
        // הדממה של פעולה זו
        console.log("FitBounds not implemented in minimal version");
        
        // במקום זה נשתמש בנקודה הראשונה כמרכז המפה
        try {
          const firstPoint = bounds.getNorthEast ? bounds.getNorthEast() : null;
          if (firstPoint) {
            this.setView([firstPoint.lat, firstPoint.lng]);
          }
        } catch (e) {}
      }
    };
    
    // הצגת היום הנוכחי על המפה
    if (appState.isDataLoaded) {
      updateMapForDay(appState.itineraryData.days[appState.currentDayIndex]);
    }
    
    console.log('המפה אותחלה בהצלחה (גרסה מינימלית)');
    
  } catch (error) {
    console.error('שגיאה באתחול המפה:', error);
    
    // יצירת מפה ריקה במקרה של כישלון
    window.map = {
      setView: function() {},
      customAddMarker: function() { 
        return { 
          bindPopup: function() { return this; },
          on: function() { return this; },
          getLatLng: function() { return {lat: 0, lng: 0}; },
          openPopup: function() {},
          remove: function() {}
        }; 
      },
      customRemoveMarker: function() {},
      customAddPolyline: function() { return { remove: function() {} }; },
      customFitBounds: function() {}
    };
  }
  
  // הוספת CSS מותאם למפה
  const style = document.createElement('style');
  style.textContent = `
    .simple-marker {
      font-size: 14px;
      user-select: none;
    }
    .simple-popup {
      direction: rtl;
      text-align: right;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      max-height: 200px;
      overflow-y: auto;
    }
    .simple-popup h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #e53935;
    }
    .simple-popup p {
      margin: 0 0 8px 0;
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
  `;
  document.head.appendChild(style);
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
  // פונקציה ריקה - בגרסה המינימלית אין תצוגת קווים
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