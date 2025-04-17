// תיקון מינימלי לבעיות Leaflet
document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') {
      console.log("Leaflet found, applying minimal patches");
      
      // שמירת הפונקציה המקורית לגיבוי
      const originalAddTo = L.Layer.prototype.addTo;
      
      // החלפת מתודת addTo עם יישום חסין יותר
      L.Layer.prototype.addTo = function(map) {
        try {
          if (map && typeof map.addLayer === 'function') {
            map.addLayer(this);
            return this;
          }
        } catch (e) {
          console.warn("Error in patched addTo, using fallback:", e);
        }
        
        // חזרה לפונקציה המקורית
        return originalAddTo.call(this, map);
      };
      
      console.log("Leaflet patching completed");
    }
  });