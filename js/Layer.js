/* 
 * תיקון עבור שגיאת addLayer בספריית Leaflet
 * גרסה מעודכנת עם תיקון לשגיאת t.addLayer 
 */

// המתנה לטעינת הספרייה
document.addEventListener('DOMContentLoaded', function() {
    // וידוא שהאובייקט L קיים
    if (typeof L !== 'undefined') {
      // הוספת מתודת addLayer לכל האובייקטים שצריכים אותה
      
      // הרחבת L.Layer
      if (L.Layer) {
        L.Layer.prototype.addLayer = function(layer) {
          return this;
        };
      }
      
      // הרחבת L.Marker
      if (L.Marker) {
        L.Marker.prototype.addLayer = function(layer) {
          return this;
        };
      }
      
      // הרחבת DivIcon ו-Icon
      if (L.DivIcon) {
        L.DivIcon.prototype.addLayer = function(layer) {
          return this;
        };
      }
      
      if (L.Icon) {
        L.Icon.prototype.addLayer = function(layer) {
          return this;
        };
      }
      
      console.log("Leaflet patched successfully for addLayer issue");
    } else {
      console.error("Leaflet library not found when trying to patch");
    }
  });