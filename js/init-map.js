// פונקציה מבטיחה אתחול מפה תקין
(function() {
    // מאזין לטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      console.log("Map initialization script started");
      
      // בדיקה האם Leaflet זמין
      const isLeafletAvailable = window.L && typeof window.L.map === 'function';
      
      if (isLeafletAvailable) {
        console.log("Leaflet is available, initializing map");
        initLeafletMap();
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
        // ודא שאלמנט המפה קיים
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error("Map element not found");
          return;
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