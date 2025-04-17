// יש ליצור קובץ חדש בשם Layer.js בתיקיית js
// או לתקן את הקובץ הקיים אם הוא כבר קיים

/* 
 * תיקון עבור שגיאת addLayer בספריית Leaflet
 * הקובץ הזה מתקן את שגיאת RuntimeError: i.addLayer is not a function
 */

// פתרון עוקף עבור בעיית התאימות של Leaflet
if (L && L.Layer) {
    // וידוא שקיימת פונקציית addLayer למופעי Layer
    L.Layer.prototype.addLayer = function(layer) {
      // אם זה LayerGroup, נשתמש ב-addLayer שלו
      if (this.addTo && typeof this.addTo === 'function') {
        if (layer && layer._layerAdd) {
          layer._layerAdd({ target: this });
        }
        return this;
      }
      // אחרת מחזירים את האובייקט עצמו
      return this;
    };
    
    // וידוא שמתודת addTo קוראת ל-addLayer בצורה נכונה
    const originalAddTo = L.Layer.prototype.addTo;
    L.Layer.prototype.addTo = function(map) {
      if (map && map.addLayer && typeof map.addLayer === 'function') {
        map.addLayer(this);
        return this;
      }
      return originalAddTo.call(this, map);
    };
  }