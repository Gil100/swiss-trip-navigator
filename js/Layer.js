// תיקון לבעיית אינטגרציה עם Leaflet
// גישה פשוטה יותר - במקום לתקן את הספריה, נוסיף פונקציות חלופיות משלנו

// מאזין לטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log("Starting simplified Leaflet integration");
    
    // הגדרת אובייקט עזר גלובלי
    window.mapHelper = {
      // יצירת מפה
      createMap: function(elementId) {
        try {
          console.log("Creating map with element ID:", elementId);
          // אם המפה כבר קיימת, החזר אותה
          if (window.map) {
            console.log("Map already exists, returning it");
            return window.map;
          }
          
          // יצירת מפה חדשה
          const map = L.map(elementId, {
            center: [46.8182, 8.2275],
            zoom: 8
          });
          
          // הוספת שכבת מפה בסיסית
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          window.map = map;
          console.log("Map created successfully");
          return map;
        } catch (e) {
          console.error("Error creating map:", e);
          return null;
        }
      },
      
      // יצירת סמן פשוט
      addMarker: function(lat, lng, options) {
        try {
          console.log("Adding marker at:", lat, lng);
          if (!window.map) {
            console.error("Map not initialized");
            return null;
          }
          
          // יצירת סמן בסיסי
          const marker = L.marker([lat, lng], options);
          
          try {
            // ניסיון להוסיף למפה
            marker.addTo(window.map);
            console.log("Marker added successfully");
          } catch (e) {
            console.warn("Error adding marker with addTo, trying alternative method", e);
            
            // ניסיון חלופי - גישה ישירה לפונקציה הפנימית
            try {
              window.map.addLayer(marker);
              console.log("Marker added with alternative method");
            } catch (e2) {
              console.error("All methods failed for adding marker:", e2);
              return null;
            }
          }
          
          return marker;
        } catch (e) {
          console.error("Critical error adding marker:", e);
          return null;
        }
      },
      
      // יצירת קו פוליליין פשוט
      addPolyline: function(points, options) {
        try {
          console.log("Adding polyline with", points.length, "points");
          if (!window.map || !points || points.length < 2) {
            console.error("Invalid map or points for polyline");
            return null;
          }
          
          // יצירת קו
          const line = L.polyline(points, options);
          
          try {
            // ניסיון להוסיף למפה
            line.addTo(window.map);
            console.log("Polyline added successfully");
          } catch (e) {
            console.warn("Error adding polyline with addTo, trying alternative method", e);
            
            // ניסיון חלופי
            try {
              window.map.addLayer(line);
              console.log("Polyline added with alternative method");
            } catch (e2) {
              console.error("All methods failed for adding polyline:", e2);
              return null;
            }
          }
          
          return line;
        } catch (e) {
          console.error("Critical error adding polyline:", e);
          return null;
        }
      },
      
      // הסרת שכבה מהמפה
      removeLayer: function(layer) {
        try {
          if (!window.map || !layer) return;
          
          try {
            // ניסיון ראשון - שימוש במתודה של השכבה
            if (typeof layer.remove === 'function') {
              layer.remove();
              console.log("Layer removed with layer.remove()");
              return;
            }
          } catch (e) {
            console.warn("Error removing layer with remove method", e);
          }
          
          try {
            // ניסיון שני - שימוש במתודה של המפה
            window.map.removeLayer(layer);
            console.log("Layer removed with map.removeLayer()");
          } catch (e) {
            console.error("Failed to remove layer:", e);
          }
        } catch (e) {
          console.error("Critical error removing layer:", e);
        }
      },
      
      // יצירת אייקון מותאם אישית
      createCustomIcon: function(type) {
        return L.divIcon({
          className: `map-icon ${type || 'default'}`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
          html: `<div class="icon-inner"></div>`
        });
      }
    };
    
    console.log("Map helper initialized");
  });