let map;
let markers = [];

// הוספת תמונת רקע כשהמפה לא נטענת
function addBackgroundImage() {
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.backgroundImage = "url('icons/mainview.png')";
    mapElement.style.backgroundSize = "cover";
    mapElement.style.backgroundPosition = "center";
  }
}

// אתחול המפה
function initMap() {
  try {
    // הוספת תמונת רקע
    addBackgroundImage();
    
    // יצירת מפה חדשה וממורכזת בשוויץ
    map = L.map('map').setView([46.8182, 8.2275], 8);
    
    // הוספת שכבת מפה
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // הצגת היום הנוכחי על המפה
    if (appState.isDataLoaded) {
      updateMapForDay(appState.itineraryData.days[appState.currentDayIndex]);
    }
    
    // ניטור אירועים שמעידים על בעיות טעינה
    map.on('error', function(e) {
      console.error('שגיאה בטעינת המפה:', e);
    });
    
  } catch (error) {
    console.error('שגיאה באתחול המפה:', error);
  }
}

// עדכון המפה עבור יום מסוים
function updateMapForDay(day) {
  try {
    // ניקוי סמנים קודמים
    clearMarkers();
    
    // הוספת סמנים חדשים
    const bounds = L.latLngBounds();
    
    day.locations.forEach(location => {
      const marker = createMarker(location, day);
      markers.push(marker);
      bounds.extend(marker.getLatLng());
    });
    
    // התאמת התצוגה לכל הסמנים
    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
    
    // יצירת קו המחבר את הנקודות
    createRouteLine(day.locations);
    
  } catch (error) {
    console.error('שגיאה בעדכון המפה:', error);
  }
}

// יצירת סמן על המפה
function createMarker(location, day) {
  // בחירת אייקון מתאים לפי סוג המיקום
  const icon = L.divIcon({
    className: `map-icon ${location.type || 'default'}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    html: `<div class="icon-inner"></div>`
  });
  
  // יצירת סמן עם אייקון מותאם
  const marker = L.marker(location.coordinates, { icon }).addTo(map);
  
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
  
  return marker;
}

// ניקוי סמנים
function clearMarkers() {
  try {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // הסרת קו המסלול אם קיים
    if (window.routeLine) {
      map.removeLayer(window.routeLine);
      window.routeLine = null;
    }
  } catch (error) {
    console.error('שגיאה בניקוי סמנים:', error);
  }
}

// יצירת קו המחבר את נקודות המסלול
function createRouteLine(locations) {
  try {
    const points = locations.map(loc => loc.coordinates);
    
    if (points.length > 1) {
      window.routeLine = L.polyline(points, {
        color: '#e53935',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(map);
    }
  } catch (error) {
    console.error('שגיאה ביצירת קו מסלול:', error);
  }
}

// התמקדות על נקודה במפה
function focusLocationOnMap(location) {
  try {
    map.setView(location.coordinates, 14);
    
    // מציאת הסמן המתאים ופתיחת החלון המידע שלו
    const marker = markers.find(m => 
      m.getLatLng().lat === location.coordinates[0] && 
      m.getLatLng().lng === location.coordinates[1]
    );
    
    if (marker) {
      marker.openPopup();
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