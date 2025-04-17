// =====================================================
// FALLBACK LEAFLET MAP SOLUTION
// 
// This is a complete rewrite that bypasses most of Leaflet's 
// built-in methods and creates a much simpler implementation
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

// אתחול המפה - גישה אלטרנטיבית
function initMap() {
  try {
    console.log("Initializing emergency fallback map...");
    
    // הוספת תמונת רקע
    addBackgroundImage();
    
    // ודא שהאלמנט קיים לפני אתחול המפה
    if (!document.getElementById('map')) {
      console.error('אלמנט המפה לא נמצא');
      return;
    }
    
    // יצירת מפה בסיסית
    // הערה: אנחנו עוקפים את הבעיה ע"י יצירת אובייקט מפה חדש לחלוטין
    try {
      // נסה להסיר מפה קיימת אם יש כזו
      if (window.map && typeof window.map.remove === 'function') {
        window.map.remove();
      }
      
      // יצירת אובייקט מפה חדש
      window.map = L.map('map', {
        center: [46.8182, 8.2275],
        zoom: 8,
        zoomControl: true
      });
      
      // הוספת שכבת מפה
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(window.map);
      
      console.log("Map created successfully");
    } catch (e) {
      console.error("Critical error creating map:", e);
      
      // נסה ליצור "מפה" מזויפת כדי שהממשק לא יקרוס
      window.map = createFallbackMapObject();
      console.warn("Created fallback map object instead");
    }
    
    // גרסת מערכת פשוטה להוספת סמנים
    // אנחנו מצמידים את הפונקציות שלנו ישירות לאובייקט המפה
    window.map.customAddMarker = function(lat, lng, options, popupContent, clickHandler) {
      try {
        // יצירת סמן בסיסי
        const marker = L.marker([lat, lng], options || {});
        
        // ניסיון להוסיף למפה
        try {
          marker.addTo(this);
        } catch (e) {
          console.warn("Could not add marker with addTo, trying direct method");
          
          try {
            this._layers = this._layers || {};
            this._layers[L.Util.stamp(marker)] = marker;
            marker._map = this;
          } catch (e2) {
            console.error("All methods failed to add marker");
          }
        }
        
        // הוספת חלון מידע אם סופק
        if (popupContent) {
          try {
            marker.bindPopup(popupContent);
          } catch (e) {
            console.warn("Could not bind popup to marker");
          }
        }
        
        // הוספת מטפל לחיצה אם סופק
        if (clickHandler && typeof clickHandler === 'function') {
          try {
            marker.on('click', clickHandler);
          } catch (e) {
            console.warn("Could not add click handler to marker");
          }
        }
        
        return marker;
      } catch (e) {
        console.error("Critical error in customAddMarker:", e);
        return null;
      }
    };
    
    window.map.customRemoveMarker = function(marker) {
      try {
        if (!marker) return;
        
        try {
          if (typeof marker.remove === 'function') {
            marker.remove();
            return;
          }
        } catch (e) {}
        
        try {
          this.removeLayer(marker);
          return;
        } catch (e) {}
        
        // שיטה אלטרנטיבית - מחיקה ישירה מהשכבות
        try {
          if (this._layers && marker._leaflet_id) {
            delete this._layers[marker._leaflet_id];
            marker._map = null;
          }
        } catch (e) {
          console.error("Could not remove marker using any method");
        }
      } catch (e) {
        console.error("Critical error in customRemoveMarker:", e);
      }
    };
    
    // פונקציה להוספת קו
    window.map.customAddPolyline = function(points, options) {
      try {
        if (!points || points.length < 2) return null;
        
        // יצירת קו פוליליין
        const line = L.polyline(points, options || {});
        
        // ניסיון להוסיף למפה
        try {
          line.addTo(this);
        } catch (e) {
          console.warn("Could not add polyline with addTo, trying direct method");
          
          try {
            this._layers = this._layers || {};
            this._layers[L.Util.stamp(line)] = line;
            line._map = this;
          } catch (e2) {
            console.error("All methods failed to add polyline");
          }
        }
        
        return line;
      } catch (e) {
        console.error("Critical error in customAddPolyline:", e);
        return null;
      }
    };
    
    // הוספת פונקציה להגדלת התצוגה של כל הסמנים
    window.map.customFitBounds = function(bounds, options) {
      try {
        this.fitBounds(bounds, options || {});
      } catch (e) {
        console.warn("Could not fit bounds:", e);
      }
    };
    
    // הצגת היום הנוכחי על המפה
    if (appState.isDataLoaded) {
      updateMapForDay(appState.itineraryData.days[appState.currentDayIndex]);
    }
    
    console.log('המפה אותחלה בהצלחה');
    
  } catch (error) {
    console.error('שגיאה חמורה באתחול המפה:', error);
    
    // נסה ליצור "מפה" מזויפת כדי שהממשק לא יקרוס
    window.map = createFallbackMapObject();
    console.warn("Created fallback map object as last resort");
  }
}

// פונקציה ליצירת אובייקט מפה מזויף שמונע התרסקות
function createFallbackMapObject() {
  return {
    customAddMarker: function() { return null; },
    customRemoveMarker: function() {},
    customAddPolyline: function() { return null; },
    customFitBounds: function() {},
    setView: function() {},
    getCenter: function() { return { lat: 46.8, lng: 8.2 }; },
    getZoom: function() { return 8; }
  };
}

// עדכון המפה עבור יום מסוים - גרסה אלטרנטיבית
function updateMapForDay(day) {
  try {
    console.log("Updating map for day:", day.dayNumber);
    
    // בדיקה אם המפה אותחלה
    if (!window.map) {
      console.error('המפה לא אותחלה');
      return;
    }
    
    // ניקוי סמנים קודמים
    clearMarkers();
    
    // הוספת סמנים חדשים
    const bounds = L.latLngBounds();
    let validMarkersCount = 0;
    
    day.locations.forEach(location => {
      const marker = createMarker(location, day);
      if (marker) {
        markers.push(marker);
        try {
          bounds.extend(marker.getLatLng());
          validMarkersCount++;
        } catch (e) {
          console.warn("Could not extend bounds with marker");
        }
      }
    });
    
    // התאמת התצוגה לכל הסמנים
    if (validMarkersCount > 0) {
      try {
        window.map.customFitBounds(bounds, { padding: [30, 30] });
      } catch (e) {
        console.warn("Error fitting bounds:", e);
        // גיבוי - התמקדות על הנקודה הראשונה
        if (day.locations.length > 0) {
          window.map.setView(day.locations[0].coordinates, 10);
        }
      }
    }
    
    // יצירת קו המחבר את הנקודות
    createRouteLine(day.locations);
    
  } catch (error) {
    console.error('שגיאה בעדכון המפה:', error);
  }
}

// יצירת סמן על המפה - גרסה אלטרנטיבית
function createMarker(location, day) {
  try {
    console.log(`Creating marker for ${location.title}`);
    
    // בדיקה שיש קואורדינטות תקינות
    if (!location.coordinates || location.coordinates.length !== 2) {
      console.error("Invalid coordinates for:", location.title);
      return null;
    }
    
    const [lat, lng] = location.coordinates;
    
    // הכנת האייקון
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
      console.warn("Could not create custom icon:", e);
      icon = null;
    }
    
    // מידע מורחב בחלון המידע
    let nextLocationInfo = '';
    
    // אם זה לא המיקום האחרון, הוסף מידע על המיקום הבא
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
    
    // הכנת תוכן לחלון המידע
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
    
    // פונקציית לחיצה לסמן
    const clickHandler = function() {
      highlightItineraryItem(location.id);
    };
    
    // יצירת הסמן באמצעות הפונקציה המותאמת שלנו
    const marker = window.map.customAddMarker(lat, lng, { icon }, popupContent, clickHandler);
    
    if (!marker) {
      console.error("Failed to create marker for:", location.title);
      
      // ניסיון נוסף ליצור סמן בסיסי
      try {
        return window.map.customAddMarker(lat, lng, {}, popupContent, clickHandler);
      } catch (e) {
        console.error("Could not create even basic marker:", e);
        return null;
      }
    }
    
    return marker;
  } catch (error) {
    console.error("Critical error creating marker:", error);
    return null;
  }
}

// ניקוי סמנים - גרסה אלטרנטיבית
function clearMarkers() {
  try {
    console.log("Clearing markers...");
    
    if (!window.map) return;
    
    // הסרת כל הסמנים
    markers.forEach(marker => {
      if (!marker) return;
      
      try {
        window.map.customRemoveMarker(marker);
      } catch (e) {
        console.warn("Error removing marker:", e);
      }
    });
    
    markers = [];
    
    // הסרת קו המסלול אם קיים
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

// יצירת קו המחבר את נקודות המסלול - גרסה אלטרנטיבית
function createRouteLine(locations) {
  try {
    console.log("Creating route line...");
    
    if (!window.map) return;
    
    const points = locations.map(loc => loc.coordinates);
    
    if (points.length < 2) {
      console.log("Not enough points for route line");
      return;
    }
    
    const polylineOptions = {
      color: '#e53935',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 10'
    };
    
    // יצירת קו המסלול באמצעות הפונקציה המותאמת שלנו
    routeLine = window.map.customAddPolyline(points, polylineOptions);
    
    console.log("Route line created:", routeLine ? "success" : "failed");
  } catch (error) {
    console.error('שגיאה ביצירת קו מסלול:', error);
  }
}

// התמקדות על נקודה במפה - גרסה אלטרנטיבית
function focusLocationOnMap(location) {
  try {
    console.log(`Focusing on location: ${location.title}`);
    
    if (!window.map) return;
    
    try {
      // התמקדות על הנקודה
      window.map.setView(location.coordinates, 14);
      
      // חיפוש הסמן המתאים
      const marker = markers.find(m => {
        if (!m || !m.getLatLng) return false;
        
        try {
          const pos = m.getLatLng();
          return pos.lat === location.coordinates[0] && pos.lng === location.coordinates[1];
        } catch (e) {
          return false;
        }
      });
      
      // פתיחת חלון מידע אם הסמן נמצא
      if (marker && typeof marker.openPopup === 'function') {
        marker.openPopup();
      }
      
      console.log("Focus complete");
    } catch (e) {
      console.error("Error focusing on location:", e);
    }
  } catch (error) {
    console.error('שגיאה בהתמקדות על מיקום:', error);
  }
}

// פונקציה לחישוב מרחק בין שתי נקודות קואורדינטות
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