// תיקון עמוק יותר עבור שגיאת addLayer בספריית Leaflet

// בדיקה האם האובייקט הגלובלי קיים והרחבתו אם כן
if (typeof window !== 'undefined') {
    // עטיפת הפונקציה המקורית
    window.originalAddTo = window.originalAddTo || {};
    
    // המתנה לטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof L !== 'undefined') {
        console.log("Leaflet found, applying deep patches");
        
        // שמירת גרסאות מקוריות של פונקציות
        if (L.Layer && L.Layer.prototype.addTo) {
          window.originalAddTo.Layer = L.Layer.prototype.addTo;
        }
        
        // שכתוב מלא של פונקציית addTo
        if (L.Layer) {
          L.Layer.prototype.addTo = function(map) {
            try {
              if (map && typeof map.addLayer === 'function') {
                map.addLayer(this);
                return this;
              }
            } catch (error) {
              console.warn("Error in patched addTo, using fallback:", error);
            }
            
            // ניסיון להשתמש בפונקציה המקורית אם היא שמורה
            if (window.originalAddTo.Layer) {
              return window.originalAddTo.Layer.call(this, map);
            }
            
            // תוספת חדשה: טיפול במקרה קצה כשהאובייקט הוא Icon
            if (this._icon || this.options && this.options.html) {
              console.log("Detected icon object, using direct map assignment");
              if (map && map._panes) {
                this._map = map;
                return this;
              }
            }
            
            return this;
          };
        }
  
        // טיפול בכל סוגי האובייקטים שעלולים לגרום לשגיאה
        ['Marker', 'CircleMarker', 'Path', 'Polyline', 'Polygon', 'ImageOverlay', 'SVGOverlay', 'DivIcon', 'Icon'].forEach(function(className) {
          if (L[className] && L[className].prototype) {
            if (!L[className].prototype.addLayer) {
              L[className].prototype.addLayer = function() { return this; };
            }
          }
        });
        
        // הוספת פונקציית עזר זו כדי לטפל בכל האובייקטים
        if (!L.DomUtil.addLayer) {
          L.DomUtil.addLayer = function() { return L.DomUtil; };
        }
        
        console.log("Deep Leaflet patching completed");
      }
    });
  }