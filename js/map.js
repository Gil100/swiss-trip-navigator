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
    const marker = createMarker(location);
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
function createMarker(location) {
  // בחירת אייקון מתאים לפי סוג המיקום
const icon = L.divIcon({
    className: `map-icon ${location.type || 'default'}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: `<div class="icon-inner"></div>`
});

  // יצירת סמן עם אייקון מותאם
const marker = L.marker(location.coordinates, { icon }).addTo(map);

  // הוספת חלון מידע שיוצג בלחיצה על הסמן
marker.bindPopup(`
    <div class="marker-popup">
    <h3>${location.title}</h3>
    <p>${location.description}</p>
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