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

// אתחול המפה - גרסה פשוטה יותר
function initMap() {
  try {
    console.log("Initializing map...");
    
    // הוספת תמונת רקע
    addBackgroundImage();
    
    // ודא שהאלמנט קיים לפני אתחול המפה
    if (!document.getElementById('map')) {
      console.error('אלמנט המפה לא נמצא');
      return;
    }
    
    // ודא שספריית Leaflet נטענה
    if (typeof L === 'undefined') {
      console.error('ספריית Leaflet לא נטענה');
      return;
    }
    
    // המתן לאובייקט העזר
    if (!window.mapHelper) {
      console.warn("mapHelper לא זמין, יוצר מפה ישירות");
      
      // יצירת מפה ישירות
      window.map = L.map('map').setView([46.8182, 8.2275], 8);
      
      // הוספת שכבת מפה
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(window.map);
    } else {
      // יצירת מפה באמצעות האובייקט העזר
      window.map = window.mapHelper.createMap('map');
    }
    
    // הצגת היום הנוכחי על המפה
    if (appState.isDataLoaded) {
      updateMapForDay(appState.itineraryData.days[appState.currentDayIndex]);
    }
    
    console.log('המפה אותחלה בהצלחה');
    
  } catch (error) {
    console.error('שגיאה באתחול המפה:', error);
  }
}

// עדכון המפה עבור יום מסוים - גרסה פשוטה יותר
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
        bounds.extend(marker.getLatLng());
        validMarkersCount++;
      }
    });
    
    // התאמת התצוגה לכל הסמנים
    if (validMarkersCount > 0) {
      try {
        window.map.fitBounds(bounds, { padding: [30, 30] });
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

// יצירת סמן על המפה - גרסה פשוטה יותר
function createMarker(location, day) {
  try {
    console.log(`Creating marker for ${location.title}`);
    
    // בדיקה שיש קואורדינטות תקינות
    if (!location.coordinates || location.coordinates.length !== 2) {
      console.error("Invalid coordinates for:", location.title);
      return null;
    }
    
    let marker = null;
    const [lat, lng] = location.coordinates;
    
    // בדיקה אם יש לנו אובייקט עזר
    if (window.mapHelper) {
      // שימוש באובייקט עזר
      const icon = window.mapHelper.createCustomIcon(location.type);
      marker = window.mapHelper.addMarker(lat, lng, { icon });
    } else {
      // ניסיון ישיר באמצעות Leaflet
      try {
        const icon = L.divIcon({
          className: `map-icon ${location.type || 'default'}`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
          html: `<div class="icon-inner"></div>`
        });
        
        marker = L.marker([lat, lng], { icon });
        marker.addTo(window.map);
      } catch (e) {
        console.warn("Error creating custom marker, trying basic marker:", e);
        
        // ניסיון ליצור סמן בסיסי
        try {
          marker = L.marker([lat, lng]);
          marker.addTo(window.map);
        } catch (e2) {
          console.error("Failed to create even basic marker:", e2);
          return null;
        }
      }
    }
    
    // אם הסמן לא נוצר, החזר null
    if (!marker) {
      console.error("Failed to create marker for:", location.title);
      return null;
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
    
    // הוספת חלון מידע שיוצג בלחיצה על הסמן
    try {
      marker.bindPopup(`
        <div class="marker-popup">
          <h3>${location.title}</h3>
          <p>${location.description}</p>
          ${nextLocationInfo}
          <button class="popup-nav-link" onclick="openNavigation({
            coordinates: [${location.coordinates[0]}, ${location.coordinates[1]}],
            title: '${location.title.replace(/'/g, "\\'")}'
          })">פתח בניווט</button>
        </div>
      `);
      
      // הוספת אירוע לחיצה שיסמן את הפריט ברשימה
      marker.on('click', () => {
        highlightItineraryItem(location.id);
      });
    } catch (e) {
      console.warn("Error binding popup to marker:", e);
    }
    
    return marker;
  } catch (error) {
    console.error("Critical error creating marker:", error);
    return null;
  }
}

// ניקוי סמנים - גרסה פשוטה יותר
function clearMarkers() {
  try {
    console.log("Clearing markers...");
    
    if (!window.map) return;
    
    // הסרת כל הסמנים
    markers.forEach(marker => {
      if (!marker) return;
      
      try {
        if (window.mapHelper) {
          window.mapHelper.removeLayer(marker);
        } else if (typeof marker.remove === 'function') {
          marker.remove();
        } else {
          window.map.removeLayer(marker);
        }
      } catch (e) {
        console.warn("Error removing marker:", e);
      }
    });
    
    markers = [];
    
    // הסרת קו המסלול אם קיים
    if (routeLine) {
      try {
        if (window.mapHelper) {
          window.mapHelper.removeLayer(routeLine);
        } else if (typeof routeLine.remove === 'function') {
          routeLine.remove();
        } else {
          window.map.removeLayer(routeLine);
        }
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

// יצירת קו המחבר את נקודות המסלול - גרסה פשוטה יותר
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
    
    // יצירת קו המסלול
    if (window.mapHelper) {
      routeLine = window.mapHelper.addPolyline(points, polylineOptions);
    } else {
      try {
        routeLine = L.polyline(points, polylineOptions);
        routeLine.addTo(window.map);
      } catch (e) {
        console.warn("Error adding polyline with addTo:", e);
        
        try {
          routeLine = L.polyline(points, polylineOptions);
          window.map.addLayer(routeLine);
        } catch (e2) {
          console.error("Failed to add polyline with both methods:", e2);
          routeLine = null;
        }
      }
    }
    
    console.log("Route line created:", routeLine ? "success" : "failed");
  } catch (error) {
    console.error('שגיאה ביצירת קו מסלול:', error);
  }
}

// התמקדות על נקודה במפה
function focusLocationOnMap(location) {
  try {
    console.log(`Focusing on location: ${location.title}`);
    
    if (!window.map) return;
    
    try {
      window.map.setView(location.coordinates, 14);
      
      // מציאת הסמן המתאים ופתיחת החלון המידע שלו
      const marker = markers.find(m => 
        m && m.getLatLng && 
        m.getLatLng().lat === location.coordinates[0] && 
        m.getLatLng().lng === location.coordinates[1]
      );
      
      if (marker) {
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