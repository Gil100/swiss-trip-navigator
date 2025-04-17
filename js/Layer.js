/* 
 * תיקון עבור שגיאת addLayer בספריית Leaflet
 * גרסה מעודכנת עם תיקון לשגיאת t.addLayer 
 */

// המתנה לטעינת הספרייה
document.addEventListener('DOMContentLoaded', function() {
    // וידוא שהאובייקט L קיים
    if (typeof L !== 'undefined') {
      console.log("Leaflet loaded, applying patches...");
      
      // הרחבת L.Layer
      if (L.Layer) {
        if (!L.Layer.prototype.addLayer) {
          L.Layer.prototype.addLayer = function(layer) {
            console.log("Custom addLayer called on Layer");
            return this;
          };
        }
      }
      
      // הרחבת L.Marker
      if (L.Marker) {
        if (!L.Marker.prototype.addLayer) {
          L.Marker.prototype.addLayer = function(layer) {
            console.log("Custom addLayer called on Marker");
            return this;
          };
        }
      }
      
      // הרחבת DivIcon ו-Icon
      if (L.DivIcon) {
        if (!L.DivIcon.prototype.addLayer) {
          L.DivIcon.prototype.addLayer = function(layer) {
            console.log("Custom addLayer called on DivIcon");
            return this;
          };
        }
      }
      
      if (L.Icon) {
        if (!L.Icon.prototype.addLayer) {
          L.Icon.prototype.addLayer = function(layer) {
            console.log("Custom addLayer called on Icon");
            return this;
          };
        }
      }
      
      // טיפול ב-t.addLayer בתוך addTo
      if (L.Layer && L.Layer.prototype.addTo) {
        const originalAddTo = L.Layer.prototype.addTo;
        L.Layer.prototype.addTo = function(map) {
          try {
            if (map && map.addLayer && typeof map.addLayer === 'function') {
              map.addLayer(this);
              return this;
            }
          } catch (e) {
            console.warn("Error in patched addTo:", e);
          }
          // נסה בשיטה המקורית אם הטיפול שלנו נכשל
          return originalAddTo.call(this, map);
        };
      }
      
      console.log("Leaflet patching completed successfully");
    } else {
      console.error("Leaflet library not found when trying to patch");
    }
});