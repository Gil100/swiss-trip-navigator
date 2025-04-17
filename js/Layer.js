// תיקון מקיף לבעיות באינטראקציה עם ספריית Leaflet
document.addEventListener('DOMContentLoaded', function() {
    if (typeof L !== 'undefined') {
      console.log("Leaflet found, applying advanced fixes");
      
      // הוספת שירותי יצירת מפה וסמנים חדשים
      window.mapServices = {
        createMap: function(elementId, options) {
          try {
            const defaultOptions = {
              center: [46.8182, 8.2275],
              zoom: 8,
              zoomControl: true
            };
            const mergedOptions = Object.assign({}, defaultOptions, options || {});
            
            return L.map(elementId, mergedOptions);
          } catch (e) {
            console.error('Error creating map:', e);
            return null;
          }
        },
        
        createMarker: function(map, coordinates, options) {
          try {
            if (!map || !coordinates) return null;
            
            const marker = L.marker(coordinates, options || {});
            marker.addTo(map);
            return marker;
          } catch (e) {
            console.error('Error creating marker:', e);
            return null;
          }
        },
        
        createPolyline: function(map, points, options) {
          try {
            if (!map || !points || !Array.isArray(points) || points.length < 2) return null;
            
            const line = L.polyline(points, options || {});
            line.addTo(map);
            return line;
          } catch (e) {
            console.error('Error creating polyline:', e);
            return null;
          }
        },
        
        removeLayer: function(map, layer) {
          try {
            if (!map || !layer) return;
            
            if (typeof layer.remove === 'function') {
              layer.remove();
            } else if (typeof map.removeLayer === 'function') {
              map.removeLayer(layer);
            }
          } catch (e) {
            console.error('Error removing layer:', e);
          }
        }
      };
      
      // שמירת הפונקציה המקורית כגיבוי
      if (L.Layer && L.Layer.prototype.addTo) {
        const originalAddTo = L.Layer.prototype.addTo;
        
        L.Layer.prototype.addTo = function(map) {
          try {
            if (map && typeof map.addLayer === 'function') {
              map.addLayer(this);
              return this;
            }
          } catch (e) {
            console.warn("Error in patched addTo, using fallback:", e);
          }
          
          return originalAddTo.call(this, map);
        };
      }
      
      console.log("Advanced Leaflet fixes applied");
    } else {
      console.warn("Leaflet library not found, skipping fixes");
    }
  });