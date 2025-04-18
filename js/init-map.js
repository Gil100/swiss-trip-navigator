// פונקציה מבטיחה אתחול מפה תקין
(function() {
    // מאזין לטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      console.log("Map initialization script started");
      
      // בדיקה האם Leaflet זמין
      const isLeafletAvailable = window.L && typeof window.L.map === 'function';
      
      if (isLeafletAvailable) {
        console.log("Leaflet is available, initializing map");
        // קצת עיכוב לוודא שה-DOM מוכן לחלוטין
        setTimeout(() => {
          initLeafletMap();
        }, 100);
      } else {
        console.log("Leaflet not available, waiting for it to load");
        // המתנה קצרה לטעינת Leaflet
        setTimeout(function() {
          if (window.L && typeof window.L.map === 'function') {
            console.log("Leaflet loaded after delay, initializing map");
            initLeafletMap();
          } else {
            console.warn("Leaflet still not available, using fallback map");
            // אתחול מפה חלופית
            if (typeof initMap === 'function') {
              initMap();
            }
          }
        }, 500);
      }
    });
    
    // אתחול מפה באמצעות Leaflet
    function initLeafletMap() {
      try {
        // בדיקה אם יש כבר אובייקט מפה קיים
        if (window.map && window.map._container) {
          console.log("Map already initialized, using existing map");
          
          // עדיין עדכן את המפה עם היום הנוכחי אם צריך
          if (window.appState && window.appState.isDataLoaded) {
            const currentDay = window.appState.itineraryData.days[window.appState.currentDayIndex];
            if (typeof updateMapForDay === 'function') {
              setTimeout(() => updateMapForDay(currentDay), 100);
            }
          } else if (window.pendingDay && typeof updateMapForDay === 'function') {
            setTimeout(() => updateMapForDay(window.pendingDay), 100);
          }
          return;
        }
        
        // ודא שאלמנט המפה קיים
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error("Map element not found");
          return;
        }
        
        // בדיקה אם יש כבר מפה קיימת על האלמנט
        if (mapElement._leaflet_id) {
          console.warn("Map container is already initialized, clearing it first");
          try {
            // מנסה לנקות את האלמנט
            mapElement.innerHTML = '';
            mapElement._leaflet_id = null;
          } catch (e) {
            console.error("Failed to clear existing map element:", e);
          }
        }
        
        // אתחול מפת Leaflet
        const map = L.map('map', {
          center: [46.8182, 8.2275], // מרכז שוויץ
          zoom: 8,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true
        });
        
        // הוספת שכבת מפה בסיסית
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);
        
        // שמירת המפה באובייקט גלובלי
        window.map = map;
        
        // הוספת תמיכה למסכי מגע
        if (L.Browser.touch) {
          L.DomEvent
            .disableClickPropagation(mapElement)
            .disableScrollPropagation(mapElement);
        }
        
        // הוספת כפתורי זום
        L.control.zoom({
          position: 'topleft'
        }).addTo(map);
        
        // הוספת סגנונות לאייקונים
        if (typeof addMapStyles === 'function') {
          addMapStyles();
        }
        
        console.log("Leaflet map initialized successfully");
        
        // התאמות למובייל - מוגדל יותר ומותאם יותר למגע
        if (window.innerWidth < 768) {
          // הגדל את כפתורי הזום
          const zoomControls = document.querySelectorAll('.leaflet-control-zoom a');
          zoomControls.forEach(btn => {
            btn.style.fontSize = '22px';
            btn.style.width = '40px';
            btn.style.height = '40px';
            btn.style.lineHeight = '38px';
          });
        }
        
        // הצגת היום הנוכחי על המפה (אם הנתונים כבר נטענו)
        if (window.appState && window.appState.isDataLoaded) {
          const currentDay = window.appState.itineraryData.days[window.appState.currentDayIndex];
          if (typeof updateMapForDay === 'function') {
            setTimeout(function() {
              updateMapForDay(currentDay);
            }, 100);
          }
        }
        
        // בדיקה אם יש יום ממתין להצגה
        if (window.pendingDay) {
          setTimeout(function() {
            if (typeof updateMapForDay === 'function') {
              updateMapForDay(window.pendingDay);
              delete window.pendingDay;
            }
          }, 200);
        }
        
      } catch (error) {
        console.error("Error initializing Leaflet map:", error);
        
        // אתחול מפה חלופית
        if (typeof initMap === 'function') {
          console.log("Falling back to simple map implementation");
          initMap();
        }
      }
    }
  })();