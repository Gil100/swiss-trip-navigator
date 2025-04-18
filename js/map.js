// =====================================================
// BASIC MAP IMPLEMENTATION FOR SWISS TRIP NAVIGATOR
// 
// A simple DOM-based map with markers but no background image
// to ensure everything works reliably
// =====================================================

let markers = [];
let routeLine = null;
let mapInitialized = false; // Flag to track map initialization

// יצירת סמן טקסט פשוט להצגה במפה
function createSimpleMarker(lat, lng, text, color, size = 30) {
  // 1. יצירת אלמנט HTML
  const markerElement = document.createElement('div');
  markerElement.className = 'simple-marker';
  markerElement.style.backgroundColor = color || '#e53935';
  markerElement.style.color = 'white';
  markerElement.style.width = `${size}px`;
  markerElement.style.height = `${size}px`;
  markerElement.style.borderRadius = '50%';
  markerElement.style.display = 'flex';
  markerElement.style.alignItems = 'center';
  markerElement.style.justifyContent = 'center';
  markerElement.style.position = 'absolute';
  markerElement.style.transform = 'translate(-50%, -50%)';
  markerElement.style.border = '2px solid white';
  markerElement.style.boxShadow = '0 0 5px rgba(0,0,0,0.4)';
  markerElement.style.zIndex = '1000';
  markerElement.style.cursor = 'pointer';
  markerElement.style.fontSize = `${size/2}px`;
  markerElement.innerHTML = text || '●';
  
  // 2. הוספה למפה
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(markerElement);
  }
  
  // 3. עדכון מיקום
  updateMarkerPosition(markerElement, lat, lng);
  
  return {
    element: markerElement,
    lat: lat,
    lng: lng,
    positionOnMap: function() {
      updateMarkerPosition(this.element, this.lat, this.lng);
    },
    remove: function() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    },
    setPopupContent: function(content) {
      this.popupContent = content;
      
      // הוספת אירוע לחיצה שיציג את החלון המידע
      this.element.onclick = () => {
        showPopup(this.lat, this.lng, content);
      };
    }
  };
}

// עדכון מיקום סמן על המפה
function updateMarkerPosition(markerElement, lat, lng) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  // חישוב גודל המפה
  const mapWidth = mapContainer.offsetWidth;
  const mapHeight = mapContainer.offsetHeight;
  
  // המרת קואורדינטות לאחוזים (מותאם לשוויץ)
  const latRange = [45.8, 47.8]; // טווח קווי רוחב
  const lngRange = [5.9, 10.5];  // טווח קווי אורך
  
  const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
  const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
  
  // חישוב מיקום בפיקסלים
  const x = (lngPercent / 100) * mapWidth;
  const y = (latPercent / 100) * mapHeight;
  
  // עדכון מיקום הסמן
  markerElement.style.left = `${x}px`;
  markerElement.style.top = `${y}px`;
}

// הצגת חלון מידע
function showPopup(lat, lng, content) {
  // הסרת חלון מידע קודם אם קיים
  const existingPopup = document.getElementById('simple-popup');
  if (existingPopup) {
    existingPopup.parentNode.removeChild(existingPopup);
  }
  
  // יצירת חלון מידע חדש עם סגנון משופר
  const popup = document.createElement('div');
  popup.id = 'simple-popup';
  popup.className = 'simple-popup';
  popup.innerHTML = content;
  popup.style.position = 'absolute';
  popup.style.backgroundColor = 'white';
  popup.style.padding = '15px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 0 15px rgba(0,0,0,0.4)';
  popup.style.maxWidth = '300px';
  popup.style.width = '280px';
  popup.style.zIndex = '2000';
  
  // הוספת כפתור סגירה
  const closeButton = document.createElement('div');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '8px';
  closeButton.style.right = '8px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.fontSize = '22px';
  closeButton.style.width = '30px';
  closeButton.style.height = '30px';
  closeButton.style.textAlign = 'center';
  closeButton.style.lineHeight = '30px';
  closeButton.onclick = () => {
    popup.parentNode.removeChild(popup);
  };
  popup.appendChild(closeButton);
  
  // הוספה למפה ומיקום
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.appendChild(popup);
    
    // מיקום ליד הסמן
    const mapWidth = mapContainer.offsetWidth;
    const mapHeight = mapContainer.offsetHeight;
    
    const latRange = [45.8, 47.8];
    const lngRange = [5.9, 10.5];
    
    const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
    const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
    
    const x = (lngPercent / 100) * mapWidth;
    const y = (latPercent / 100) * mapHeight;
    
    popup.style.left = `${x + 20}px`; // קצת ימינה מהסמן
    popup.style.top = `${y - 10}px`;  // קצת למעלה מהסמן
    
    // ודא שהחלון נשאר בתוך גבולות המפה
    setTimeout(() => {
      const popupRect = popup.getBoundingClientRect();
      const mapRect = mapContainer.getBoundingClientRect();
      
      if (popupRect.right > mapRect.right) {
        popup.style.left = `${x - popupRect.width - 20}px`;
      }
      
      if (popupRect.bottom > mapRect.bottom) {
        popup.style.top = `${y - popupRect.height - 20}px`;
      }
      
      if (popupRect.left < mapRect.left) {
        popup.style.left = `${mapRect.left + 10}px`;
      }
      
      if (popupRect.top < mapRect.top) {
        popup.style.top = `${mapRect.top + 10}px`;
      }
      
      // הוספת מאזיני אירועים לכפתורי ניווט
      setupPopupNavigationButtons();
    }, 0);
  }
}

// פונקציה להוספת מאזיני אירועים לכפתורי ניווט בחלון המידע
function setupPopupNavigationButtons() {
  // מצא את כל כפתורי הניווט בחלון המידע
  const navButtons = document.querySelectorAll('.popup-nav-link');
  
  navButtons.forEach(button => {
    // בדיקה אם יש לכפתור inline onclick
    const originalOnClick = button.getAttribute('onclick');
    if (originalOnClick && originalOnClick.includes('openNavigation')) {
      // ביטול אירוע מקורי
      button.removeAttribute('onclick');
      
      // חילוץ נתוני המיקום מהקריאה המקורית
      const match = originalOnClick.match(/openNavigation\(\{coordinates:\s*\[([\d\.-]+),\s*([\d\.-]+)\],\s*title:\s*['"]([^'"]+)['"]/);
      
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        const title = match[3];
        
        // הוספת אירוע לחיצה חדש
        button.addEventListener('click', function(e) {
          e.preventDefault();
          window.openNavigation({
            coordinates: [lat, lng],
            title: title
          });
        });
      }
    }
  });
}

// אתחול המפה
function initMap() {
  try {
    console.log("Initializing basic map...");
    
    // 1. ודא שהאלמנט קיים
    if (!document.getElementById('map')) {
      console.error('אלמנט המפה לא נמצא');
      return;
    }
    
    // 2. הוסף רקע בסיסי למפה (ללא תמונת רקע)
    const mapElement = document.getElementById('map');
    mapElement.style.backgroundColor = '#e5f2fd';
    mapElement.style.position = 'relative';
    mapElement.style.overflow = 'hidden';
    
    // 3. יצירת אובייקט מפה בסיסי
    window.map = {
      // מצב פנימי
      _center: [46.8182, 8.2275],
      _zoom: 8,
      _markers: [],
      
      // API בסיסי
      setView: function(center, zoom) {
        this._center = center;
        this._zoom = zoom || this._zoom;
        this.refreshMarkers();
        return this;
      },
      
      refreshMarkers: function() {
        this._markers.forEach(marker => {
          if (marker && marker.positionOnMap) {
            marker.positionOnMap();
          }
        });
      },
      
      addMarker: function(lat, lng, options) {
        try {
          // קביעת סוג האייקון בהתאם לסוג המיקום
          let iconText = '📍';
          let iconColor = '#e53935';
          
          if (options && options.icon && options.icon.options) {
            const className = options.icon.options.className || '';
            
            if (className.includes('waterfall')) {
              iconColor = '#00BCD4';
              iconText = '💦';
            } else if (className.includes('viewpoint')) {
              iconColor = '#FFC107';
              iconText = '👁️';
            } else if (className.includes('lake')) {
              iconColor = '#2196F3';
              iconText = '🏞️';
            } else if (className.includes('mountain')) {
              iconColor = '#795548';
              iconText = '🏔️';
            } else if (className.includes('castle')) {
              iconColor = '#673AB7';
              iconText = '🏰';
            } else if (className.includes('cablecar')) {
              iconColor = '#F44336';
              iconText = '🚡';
            } else if (className.includes('gorge')) {
              iconColor = '#607D8B';
              iconText = '🏞️';
            } else if (className.includes('landmark')) {
              iconColor = '#9C27B0';
              iconText = '🏛️';
            } else if (className.includes('monument')) {
              iconColor = '#E91E63';
              iconText = '🗿';
            } else if (className.includes('parking')) {
              iconColor = '#3F51B5';
              iconText = '🅿️';
            } else if (className.includes('city')) {
              iconColor = '#FF9800';
              iconText = '🏙️';
            } else if (className.includes('hotel')) {
              iconColor = '#4CAF50';
              iconText = '🏨';
            }
          }
          
          // יצירת סמן
          const marker = createSimpleMarker(lat, lng, iconText, iconColor);
          this._markers.push(marker);
          
          // הוספת API תואם ל-Leaflet
          marker.bindPopup = function(content) {
            this.setPopupContent(content);
            return this;
          };
          
          marker.on = function(event, handler) {
            if (event === 'click') {
              const originalClick = this.element.onclick;
              this.element.onclick = (e) => {
                if (originalClick) originalClick.call(this, e);
                handler.call(this, e);
              };
            }
            return this;
          };
          
          marker.getLatLng = function() {
            return { lat: this.lat, lng: this.lng };
          };
          
          marker.openPopup = function() {
            if (this.popupContent) {
              showPopup(this.lat, this.lng, this.popupContent);
            }
          };
          
          return marker;
        } catch (e) {
          console.error("Error creating marker:", e);
          return null;
        }
      },
      
      removeMarker: function(marker) {
        if (!marker) return;
        
        try {
          marker.remove();
          
          const index = this._markers.indexOf(marker);
          if (index > -1) {
            this._markers.splice(index, 1);
          }
        } catch (e) {
          console.warn("Error removing marker:", e);
        }
      },
      
      invalidateSize: function() {
        this.refreshMarkers();
        return this;
      },
      
      // פונקציות תואמות ל-API שאנחנו משתמשים בו
      customAddMarker: function(lat, lng, options, popupContent, clickHandler) {
        try {
          const marker = this.addMarker(lat, lng, options);
          
          if (marker && popupContent) {
            marker.bindPopup(popupContent);
          }
          
          if (marker && clickHandler) {
            marker.on('click', clickHandler);
          }
          
          return marker;
        } catch (e) {
          console.error("Error in customAddMarker:", e);
          return null;
        }
      },
      
      customRemoveMarker: function(marker) {
        this.removeMarker(marker);
      },
      
      customAddPolyline: function() {
        // פונקציה ריקה - אין תמיכה בקווים
        return { remove: function() {} };
      },
      
      customFitBounds: function(bounds) {
        // פונקציה ריקה - אין תמיכה בגבולות
        // במקום זה, נתמקד על הנקודה הראשונה
        try {
          if (this._markers.length > 0) {
            const firstMarker = this._markers[0];
            this.setView([firstMarker.lat, firstMarker.lng]);
          }
        } catch (e) {}
      }
    };
    
    // 4. חיזוק המפה מפני טעויות
    Object.keys(window.map).forEach(key => {
      const originalFn = window.map[key];
      if (typeof originalFn === 'function') {
        window.map[key] = function() {
          try {
            return originalFn.apply(this, arguments);
          } catch (e) {
            console.error(`Error in map.${key}:`, e);
            return null;
          }
        };
      }
    });
    
    // 5. הוספת קואורדינטות משורטטות על המפה
    addCoordinateLines();
    
    // סמן את המפה כמאותחלת
    mapInitialized = true;
    
    // 6. הצגת היום הנוכחי על המפה
    if (window.pendingDay) {
      console.log("Processing pending day after map init");
      updateMapForDay(window.pendingDay);
      delete window.pendingDay;
    } else if (window.appState && window.appState.isDataLoaded) {
      const currentDay = window.appState.itineraryData.days[window.appState.currentDayIndex];
      updateMapForDay(currentDay);
    }
    
    console.log('המפה אותחלה בהצלחה');
    
  } catch (error) {
    console.error('שגיאה באתחול המפה:', error);
  }
  
  // הוספת CSS מותאם למפה
  addMapStyles();
}

// הוספת קווי קואורדינטות לעזרה בהתמצאות
function addCoordinateLines() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  
  const width = mapElement.offsetWidth;
  const height = mapElement.offsetHeight;
  
  // קווי רוחב - אופקיים
  const latitudes = [46.0, 46.5, 47.0, 47.5];
  latitudes.forEach(lat => {
    const line = document.createElement('div');
    line.className = 'coordinate-line';
    line.style.left = '0';
    line.style.width = '100%';
    line.style.height = '1px';
    
    const latRange = [45.8, 47.8];
    const latPercent = 100 - ((lat - latRange[0]) / (latRange[1] - latRange[0]) * 100);
    const y = (latPercent / 100) * height;
    line.style.top = `${y}px`;
    
    mapElement.appendChild(line);
    
    // תווית
    const label = document.createElement('div');
    label.className = 'coordinate-label';
    label.textContent = `${lat}°N`;
    label.style.top = `${y - 12}px`;
    label.style.left = '5px';
    mapElement.appendChild(label);
  });
  
  // קווי אורך - אנכיים
  const longitudes = [6.0, 7.0, 8.0, 9.0, 10.0];
  longitudes.forEach(lng => {
    const line = document.createElement('div');
    line.className = 'coordinate-line';
    line.style.top = '0';
    line.style.height = '100%';
    line.style.width = '1px';
    
    const lngRange = [5.9, 10.5];
    const lngPercent = ((lng - lngRange[0]) / (lngRange[1] - lngRange[0]) * 100);
    const x = (lngPercent / 100) * width;
    line.style.left = `${x}px`;
    
    mapElement.appendChild(line);
    
    // תווית
    const label = document.createElement('div');
    label.className = 'coordinate-label';
    label.textContent = `${lng}°E`;
    label.style.left = `${x + 5}px`;
    label.style.top = '5px';
    mapElement.appendChild(label);
  });
}

// עדכון המפה ליום ספציפי
function updateMapForDay(day) {
  try {
    console.log("Updating map for day:", day.dayNumber);
    
    // בדיקה שהמפה אותחלה
    if (!window.map) {
      console.warn('המפה לא אותחלה עדיין, מדלג על עדכון');
      // במקום לזרוק שגיאה, נזכור את היום הנוכחי ונטפל בו לאחר אתחול המפה
      window.pendingDay = day;
      return;
    }
    
    // ניקוי סמנים קודמים
    clearMarkers();
    
    // הוספת המלון כנקודת מוצא לכל יום
    const hotelCoordinates = [46.6279, 8.0324]; // Terrassenweg 104, 3818 Grindelwald
    const hotelMarker = createHotelMarker(hotelCoordinates, "המלון שלנו - Grindelwald", day);
    if (hotelMarker) {
      markers.push(hotelMarker);
    }
    
    // הוספת סמנים חדשים
    day.locations.forEach(location => {
      const marker = createMarker(location, day);
      if (marker) {
        markers.push(marker);
      }
    });
    
    // יצירת קו מסלול אם אפשר
    try {
      createDayRouteLine(day, hotelCoordinates);
    } catch (e) {
      console.warn("שגיאה ביצירת קו המסלול:", e);
    }
    
    // התמקדות על כל הסמנים
    if (day.locations.length > 0) {
      // התמקדות באזור שמכיל את כל הנקודות
      fitMapToMarkers();
    }
    
  } catch (error) {
    console.error('שגיאה בעדכון המפה:', error);
  }
}

// יצירת סמן למלון - קטע מתוקן
function createHotelMarker(coordinates, title, day) {
  try {
    if (!coordinates || coordinates.length !== 2) {
      console.error("Invalid hotel coordinates");
      return null;
    }
    
    const [lat, lng] = coordinates;
    
    // תוכן לחלון המידע - עדכון לשימוש בפונקציית JS במקום inline onclick
    const popupContent = `
      <div class="marker-popup">
        <h3>${title}</h3>
        <p>נקודת מוצא ליום ${day.dayNumber}: ${day.title}</p>
        <button class="popup-nav-link" id="hotel-nav-button">פתח בניווט</button>
      </div>
    `;
    
    // יצירת סמן באמצעות Leaflet אם זמין
    if (window.L && typeof L.marker === 'function') {
      try {
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'map-icon hotel',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            html: '<div class="icon-inner">🏨</div>'
          })
        });
        
        if (window.map.addLayer) {
          marker.addTo(window.map);
          
          // יצירת פופאפ והוספת אירוע לחיצה לאחר פתיחה
          const popup = L.popup({
            maxWidth: 300,
            minWidth: 280,
            className: 'custom-popup'
          }).setContent(popupContent);
          
          marker.bindPopup(popup);
          
          // הוספת מאזין אירוע לאחר פתיחת הפופאפ
          marker.on('popupopen', function() {
            const navButton = document.getElementById('hotel-nav-button');
            if (navButton) {
              navButton.addEventListener('click', function() {
                window.openNavigation({
                  coordinates: [lat, lng],
                  title: title
                });
              });
            }
          });
          
          return marker;
        }
      } catch (e) {
        console.warn("שגיאה ביצירת סמן Leaflet למלון:", e);
      }
    }
    
    // גישה חלופית - יצירת סמן פשוט
    const simpleMarker = createSimpleMarker(lat, lng, '🏨', '#4CAF50');
    
    // עדכון הפונקציה כך שתשתמש באירוע לחיצה במקום inline onclick
    simpleMarker.setPopupContent(popupContent);
    
    // הוספת אירוע לאחר הצגת הפופאפ
    const originalSetPopupContent = simpleMarker.setPopupContent;
    simpleMarker.setPopupContent = function(content) {
      originalSetPopupContent.call(this, content);
      
      // הוספת מאזין אירוע לכפתור הניווט אחרי הצגת הפופאפ
      setTimeout(() => {
        const navButton = document.getElementById('hotel-nav-button');
        if (navButton) {
          navButton.addEventListener('click', function() {
            window.openNavigation({
              coordinates: [lat, lng],
              title: title
            });
          });
        }
      }, 100);
    };
    
    return simpleMarker;
    
  } catch (error) {
    console.error("שגיאה ביצירת סמן המלון:", error);
    return null;
  }
}

// יצירת סמן - קטע מתוקן
function createMarker(location, day) {
  try {
    console.log(`Creating marker for ${location.title}`);
    
    if (!location.coordinates || location.coordinates.length !== 2) {
      console.error("Invalid coordinates for:", location.title);
      return null;
    }
    
    const [lat, lng] = location.coordinates;
    
    // הכנת מידע לחלון המידע עם סגנון משופר
    let nextLocationInfo = '';
    
    const locationIndex = day.locations.findIndex(loc => loc.id === location.id);
    if (locationIndex < day.locations.length - 1) {
      const nextLocation = day.locations[locationIndex + 1];
      const distance = calculateDistance(location.coordinates, nextLocation.coordinates);
      const travelTime = estimateTravelTime(distance);
      
      nextLocationInfo = `
        <div class="next-location-info">
          <p><strong>למיקום הבא:</strong> ${nextLocation.title}</p>
          <p>מרחק משוער: ${distance.toFixed(1)} ק"מ</p>
          <p>זמן נסיעה משוער: ${travelTime} דקות</p>
        </div>
      `;
    }
    
    // עדכון חלון המידע - שימוש ב-ID ייחודי במקום inline onclick
    const popupId = `popup-nav-${location.id}`;
    
    // תוכן לחלון המידע עם פורמט משופר וגודל גופן טוב יותר
    const popupContent = `
      <div class="marker-popup">
        <h3>${location.title}</h3>
        <p><strong>שעה:</strong> ${location.time}</p>
        <p>${location.description}</p>
        ${nextLocationInfo}
        <button class="popup-nav-link" id="${popupId}">פתח בניווט</button>
      </div>
    `;
    
    // פונקציית לחיצה להדגשת פריט ברשימת המסלול
    const clickHandler = function() {
      highlightItineraryItem(location.id);
    };
    
    // יצירת סמן באמצעות Leaflet אם זמין
    if (window.L && typeof L.marker === 'function') {
      try {
        // סמנים גדולים יותר לנגיעה טובה יותר במובייל
        const iconSize = isMobileDevice() ? 44 : 40;
        
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: `map-icon ${location.type || 'default'}`,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2],
            popupAnchor: [0, -iconSize/2],
            html: `<div class="icon-inner">${getTypeEmoji(location.type)}</div>`
          }),
          riseOnHover: true // הבא סמן לחזית בעת מעבר עכבר
        });
        
        if (window.map.addLayer) {
          marker.addTo(window.map);
          
          // יצירת חלון מידע עם רוחב מוגדר
          const popup = L.popup({ 
            maxWidth: 300,
            minWidth: 280,
            className: 'custom-popup' // הוספת מחלקה מותאמת לסגנון קל יותר
          }).setContent(popupContent);
          
          marker.bindPopup(popup);
          
          // הוספת אירוע שיופעל כאשר הפופאפ נפתח
          marker.on('popupopen', function() {
            const navButton = document.getElementById(popupId);
            if (navButton) {
              navButton.addEventListener('click', function() {
                window.openNavigation({
                  coordinates: [lat, lng],
                  title: location.title
                });
              });
            }
          });
          
          marker.on('click', clickHandler);
          return marker;
        }
      } catch (e) {
        console.warn("שגיאה ביצירת סמן Leaflet:", e);
      }
    }
    
    // גישה חלופית - יצירת סמן פשוט
    const iconSize = isMobileDevice() ? 44 : 30;
    const simpleMarker = createSimpleMarker(lat, lng, getTypeEmoji(location.type), getTypeColor(location.type), iconSize);
    simpleMarker.setPopupContent(popupContent);
    
    // עדכון אירועי לחיצה
    const originalSetPopupContent = simpleMarker.setPopupContent;
    simpleMarker.setPopupContent = function(content) {
      originalSetPopupContent.call(this, content);
      
      // הוספת מאזין אירוע לכפתור הניווט אחרי הצגת הפופאפ
      setTimeout(() => {
        const navButton = document.getElementById(popupId);
        if (navButton) {
          navButton.addEventListener('click', function() {
            window.openNavigation({
              coordinates: [lat, lng],
              title: location.title
            });
          });
        }
      }, 100);
    };
    
    // הוספת אירוע לחיצה
    simpleMarker.element.addEventListener('click', clickHandler);
    return simpleMarker;
    
  } catch (error) {
    console.error("שגיאה ביצירת סמן:", error);
    return null;
  }
}

// פונקציה להתאמת גודל המפה לכל הסמנים
function fitMapToMarkers() {
  try {
    if (!window.map) return;
// בדיקה אם יש לנו Leaflet
if (window.L && window.map.fitBounds && markers.length > 0) {
  try {
    // יצירת גבולות שכוללים את כל הסמנים
    const bounds = L.latLngBounds();
    
    markers.forEach(marker => {
      try {
        if (marker.getLatLng) {
          bounds.extend(marker.getLatLng());
        } else if (marker.lat && marker.lng) {
          bounds.extend([marker.lat, marker.lng]);
        }
      } catch (e) {
        console.warn("שגיאה בהוספת סמן לגבולות:", e);
      }
    });
    
    if (!bounds.isValid()) {
      console.warn("גבולות לא תקפים, מדלג על התאמת גודל");
      return;
    }
    
    // הוספת שוליים לגבולות
    const paddedBounds = bounds.pad(0.2); // 20% padding
    window.map.fitBounds(paddedBounds);
    
  } catch (e) {
    console.warn("שגיאה בהתאמת גודל מפת Leaflet:", e);
    
    // אם Leaflet נכשל, ננסה להתמקד על הסמן הראשון
    if (markers.length > 0) {
      const firstMarker = markers[0];
      if (firstMarker.getLatLng) {
        window.map.setView(firstMarker.getLatLng(), 10);
      } else if (firstMarker.lat && firstMarker.lng) {
        window.map.setView([firstMarker.lat, firstMarker.lng], 10);
      }
    }
  }
} 
// גישה חלופית למפה הפשוטה
else if (markers.length > 0) {
  const firstMarker = markers[0];
  if (firstMarker.lat && firstMarker.lng) {
    if (window.map.setView) {
      window.map.setView([firstMarker.lat, firstMarker.lng]);
    }
  }
}
} catch (error) {
console.error("שגיאה בהתאמת גודל המפה:", error);
}
}

// יצירת קו מסלול
function createDayRouteLine(day, hotelCoordinates) {
// מחיקת קו קיים אם יש
if (routeLine) {
try {
  if (routeLine.remove) {
    routeLine.remove();
  } else if (window.map.removeLayer) {
    window.map.removeLayer(routeLine);
  }
} catch (e) {
  console.warn("שגיאה במחיקת קו מסלול קיים:", e);
}
routeLine = null;
}

// בדיקה אם יש Leaflet ויש נקודות מסלול
if (window.L && window.map.addLayer && day.locations.length > 0) {
try {
  // יצירת מערך נקודות למסלול
  const routePoints = [];
  
  // הוספת המלון כנקודת התחלה
  routePoints.push(hotelCoordinates);
  
  // הוספת כל נקודות המסלול
  day.locations.forEach(location => {
    routePoints.push(location.coordinates);
  });
  
  // הוספת המלון כנקודת סיום (אם יש יותר מנקודה אחת במסלול)
  if (day.locations.length > 0) {
    routePoints.push(hotelCoordinates);
  }
  
  // יצירת קו עם סגנון מותאם
  routeLine = L.polyline(routePoints, {
    color: '#e53935',
    weight: 3,
    opacity: 0.7,
    dashArray: '5, 10', // קו מקווקו
    lineJoin: 'round'
  });
  
  // הוספת הקו למפה
  routeLine.addTo(window.map);
  
  return routeLine;
} catch (e) {
  console.warn("שגיאה ביצירת קו מסלול:", e);
}
}

return null;
}

// ניקוי כל הסמנים
function clearMarkers() {
try {
console.log("Clearing markers...");

if (!window.map) {
  console.warn('המפה לא אותחלה עדיין, אין צורך לנקות סמנים');
  markers = []; // איפוס המערך למקרה שיש בו ערכים
  return;
}

// הסרת כל הסמנים
markers.forEach(marker => {
  if (marker) {
    try {
      // בדיקה אם לסמן יש פונקציית הסרה ישירה
      if (typeof marker.remove === 'function') {
        marker.remove();
      } 
      // אם לא, ננסה להשתמש בפונקציית הסרה של המפה
      else if (window.map && typeof window.map.removeLayer === 'function') {
        window.map.removeLayer(marker);
      }
      else if (window.map && typeof window.map.customRemoveMarker === 'function') {
        window.map.customRemoveMarker(marker);
      }
    } catch (e) {
      console.warn("Error removing marker:", e);
    }
  }
});

markers = [];

// ניקוי קו המסלול אם קיים
if (routeLine) {
  try {
    if (typeof routeLine.remove === 'function') {
      routeLine.remove();
    } else if (window.map && typeof window.map.removeLayer === 'function') {
      window.map.removeLayer(routeLine);
    } else if (window.map && typeof window.map.customRemoveMarker === 'function') {
      window.map.customRemoveMarker(routeLine);
    }
  } catch (e) {
    console.warn("Error removing route line:", e);
  }
  
  routeLine = null;
}

console.log("All markers cleared");
} catch (error) {
console.error('שגיאה בניקוי סמנים:', error);
}
}

// התמקדות על מיקום
function focusLocationOnMap(location) {
try {
console.log(`Focusing on location: ${location.title}`);

if (!window.map) return;

// התמקדות על המיקום
try {
  if (window.map.setView) {
    window.map.setView(location.coordinates);
  }
} catch (e) {
  console.warn('שגיאה בהתמקדות על המיקום:', e);
}

// חיפוש וסימון הסמן המתאים
const marker = markers.find(m => {
  if (!m) return false;
  
  try {
    if (m.getLatLng) {
      const pos = m.getLatLng();
      return pos.lat === location.coordinates[0] && pos.lng === location.coordinates[1];
    } else if (m.lat && m.lng) {
      return m.lat === location.coordinates[0] && m.lng === location.coordinates[1];
    }
  } catch (e) {
    return false;
  }
  
  return false;
});

// פתיחת חלון מידע אם נמצא סמן מתאים
if (marker) {
  if (typeof marker.openPopup === 'function') {
    marker.openPopup();
  } else if (marker.popupContent) {
    showPopup(marker.lat, marker.lng, marker.popupContent);
  }
}

} catch (error) {
console.error('שגיאה בהתמקדות על מיקום:', error);
}
}

// פונקציה לחישוב מרחק בין שתי נקודות 
function calculateDistance(coord1, coord2) {
// נוסחת Haversine לחישוב מרחק בין שתי נקודות על פני כדור הארץ
const R = 6371; // רדיוס כדור הארץ בקילומטרים
const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
const a = 
Math.sin(dLat/2) * Math.sin(dLat/2) +
Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
Math.sin(dLon/2) * Math.sin(dLon/2); 
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
const distance = R * c; // מרחק בקילומטרים
return distance;
}

// פונקציה להערכת זמן נסיעה לפי מרחק
function estimateTravelTime(distance) {
// הנחה של מהירות ממוצעת של 60 קמ"ש בדרכים אלפיניות
const avgSpeed = 60; // קמ"ש
const timeHours = distance / avgSpeed;
const timeMinutes = Math.round(timeHours * 60);
return timeMinutes;
}

// פונקציה לקבלת אימוג'י לפי סוג המיקום
function getTypeEmoji(type) {
switch (type) {
case 'waterfall': return '💦';
case 'viewpoint': return '👁️';
case 'lake': return '🏞️';
case 'mountain': return '🏔️';
case 'castle': return '🏰';
case 'cablecar': return '🚡';
case 'gorge': return '🏞️';
case 'landmark': return '🏛️';
case 'monument': return '🗿';
case 'parking': return '🅿️';
case 'city': return '🏙️';
default: return '📍';
}
}

// פונקציה לקבלת צבע לפי סוג המיקום
function getTypeColor(type) {
switch (type) {
case 'waterfall': return '#00BCD4';
case 'viewpoint': return '#FFC107';
case 'lake': return '#2196F3';
case 'mountain': return '#795548';
case 'castle': return '#673AB7';
case 'cablecar': return '#F44336';
case 'gorge': return '#607D8B';
case 'landmark': return '#9C27B0';
case 'monument': return '#E91E63';
case 'parking': return '#3F51B5';
case 'city': return '#FF9800';
default: return '#e53935';
}
}

// הוספת סגנון CSS למפה
function addMapStyles() {
  // הסרת סגנונות קיימים כדי למנוע כפילות
  const existingStyle = document.getElementById('map-custom-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'map-custom-styles';
  style.textContent = `
  .map-icon.hotel .icon-inner:after {
    content: '🏨';
  }

  /* סגנון לקווי המסלול */
  .leaflet-overlay-pane path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* שיפור מראה האייקונים */
  .map-icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 50% !important;
    border: 2px solid white !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important;
    background-color: var(--marker-color, #e53935) !important;
    color: white !important;
    font-size: 18px !important;
    width: 36px !important;
    height: 36px !important;
  }

  /* סגנון לחלון מידע */
  .leaflet-popup-content {
    direction: rtl;
    text-align: right;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    min-width: 200px;
    max-width: 300px;
  }

  .leaflet-popup-content h3 {
    margin: 0 0 8px 0;
    color: #e53935;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }

  .leaflet-popup-content p {
    margin: 5px 0;
  }

  .popup-nav-link {
    display: block;
    background-color: #e53935;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    text-align: center;
    margin-top: 10px;
    text-decoration: none;
    cursor: pointer;
    border: none;
    width: 100%;
  }

  /* נקודת התחלה וסיום */
  .start-end-point {
    border: 3px solid white !important;
    z-index: 1000 !important;
  }

  /* אנימציה לנקודות על המפה */
  @keyframes markerPulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .map-icon:hover {
    animation: markerPulse 1s infinite;
    z-index: 1000 !important;
  }
  `;
  document.head.appendChild(style);
}
// הוסף את הקוד הבא בסוף קובץ map.js הקיים
// תוספות אלו משפרות את חוויית המשתמש במובייל

// בדיקה האם המכשיר הוא מובייל
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

// שיפורים לתצוגת המפה במובייל
function enhanceMobileMapExperience() {
  if (!isMobileDevice()) return;
  
  console.log("Enhancing map for mobile experience");
  
  // שיפור סמני המפה
  enhanceMapMarkers();
  
  // שיפור חלונות המידע (פופאפים)
  enhanceInfoPopups();
  
  // שיפור כפתורי זום
  enhanceZoomControls();
}

// שיפור סמני המפה - גודל גדול יותר לנגיעה קלה יותר
function enhanceMapMarkers() {
  const style = document.createElement('style');
  style.textContent = `
    .map-icon, .simple-marker {
      width: 44px !important;
      height: 44px !important;
      font-size: 22px !important;
      border: 2px solid white !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4) !important;
    }
    
    .map-icon .icon-inner {
      font-size: 22px !important;
    }
    
    /* הגדלת אזור הנגיעה */
    .leaflet-marker-icon {
      padding: 5px;
      margin-top: -5px;
      margin-left: -5px;
    }
  `;
  document.head.appendChild(style);
  
  // עדכון סמנים קיימים
  if (window.markers && window.markers.length) {
    window.markers.forEach(marker => {
      if (marker.getElement) {
        const el = marker.getElement();
        if (el) {
          el.style.width = '44px';
          el.style.height = '44px';
          el.style.fontSize = '22px';
        }
      }
    });
  }
}

// שיפור חלונות המידע
function enhanceInfoPopups() {
  const style = document.createElement('style');
  style.textContent = `
    .leaflet-popup-content-wrapper,
    .simple-popup {
      width: 280px !important;
      max-width: 90vw !important;
      padding: 15px !important;
      border-radius: 15px !important;
    }
    
    .leaflet-popup-content,
    .simple-popup {
      margin: 5px !important;
      font-size: 15px !important;
      width: auto !important;
    }
    
    .leaflet-popup-content h3,
    .simple-popup h3 {
      font-size: 18px !important;
      margin-bottom: 10px !important;
      padding-bottom: 8px !important;
      font-weight: bold !important;
    }
    
    .leaflet-popup-content p,
    .simple-popup p {
      margin: 8px 0 !important;
      line-height: 1.4 !important;
      font-size: 15px !important;
    }
    
    .popup-nav-link {
      padding: 12px !important;
      margin-top: 12px !important;
      font-size: 16px !important;
      font-weight: bold !important;
      border-radius: 8px !important;
      display: block !important;
      text-align: center !important;
    }
    
    .next-location-info {
      margin: 12px 0 !important;
      padding: 12px !important;
      border-radius: 8px !important;
      background-color: #f8f8f8 !important;
    }
  `;
  document.head.appendChild(style);
  
  // שיפור פונקציית הצגת פופאפ קיימת
  if (window.showPopup) {
    const originalShowPopup = window.showPopup;
    window.showPopup = function() {
      // הפעלת הפונקציה המקורית
      originalShowPopup.apply(this, arguments);
      
      // שיפור הפופאפ שנוצר
      const popup = document.getElementById('simple-popup');
      if (popup) {
        popup.style.width = '280px';
        popup.style.maxWidth = '90vw';
        popup.style.padding = '15px';
        popup.style.borderRadius = '15px';
        popup.style.boxShadow = '0 3px 14px rgba(0,0,0,0.3)';
        
        // שיפור הטקסט בפופאפ
        const title = popup.querySelector('h3');
        if (title) {
          title.style.fontSize = '18px';
          title.style.marginBottom = '10px';
          title.style.paddingBottom = '8px';
          title.style.borderBottom = '1px solid #ddd';
        }
        
        // שיפור פסקאות טקסט
        const paragraphs = popup.querySelectorAll('p');
        paragraphs.forEach(p => {
          p.style.fontSize = '15px';
          p.style.lineHeight = '1.4';
          p.style.margin = '8px 0';
        });
        
        // שיפור כפתורי ניווט
        const navLinks = popup.querySelectorAll('.popup-nav-link');
        navLinks.forEach(link => {
          link.style.padding = '12px';
          link.style.fontSize = '16px';
          link.style.fontWeight = 'bold';
          link.style.borderRadius = '8px';
          link.style.margin = '12px 0 0 0';
          link.style.textAlign = 'center';
          link.style.display = 'block';
        });
      }
    };
  }
}

// שיפור כפתורי זום
function enhanceZoomControls() {
  const style = document.createElement('style');
  style.textContent = `
    .leaflet-control-zoom a {
      width: 40px !important;
      height: 40px !important;
      line-height: 38px !important;
      font-size: 22px !important;
    }
  `;
  document.head.appendChild(style);
}

// שיפור פונקציית יצירת סמן
const originalCreateMarker = window.createMarker;
if (originalCreateMarker) {
  window.createMarker = function(location, day) {
    const marker = originalCreateMarker.apply(this, arguments);
    
    // אם זהו מכשיר מובייל, שפר את החזות
    if (isMobileDevice() && marker) {
      if (marker.getElement) {
        const el = marker.getElement();
        if (el) {
          el.style.width = '44px';
          el.style.height = '44px';
          el.style.fontSize = '22px';
        }
      }
    }
    
    return marker;
  };
}

// התאמת גודל הטקסט בחלון מידע
const originalFocusLocationOnMap = window.focusLocationOnMap;
if (originalFocusLocationOnMap) {
  window.focusLocationOnMap = function(location) {
    originalFocusLocationOnMap.apply(this, arguments);
    
    if (isMobileDevice()) {
      // אם יש חלון מידע פתוח, שפר את הנראות שלו
      setTimeout(() => {
        const popups = document.querySelectorAll('.leaflet-popup-content, .simple-popup');
        popups.forEach(popup => {
          popup.style.fontSize = '15px';
          
          const title = popup.querySelector('h3');
          if (title) {
            title.style.fontSize = '18px';
            title.style.marginBottom = '10px';
          }
          
          const paragraphs = popup.querySelectorAll('p');
          paragraphs.forEach(p => {
            p.style.fontSize = '15px';
            p.style.lineHeight = '1.4';
          });
          
          const navLinks = popup.querySelectorAll('.popup-nav-link');
          navLinks.forEach(link => {
            link.style.padding = '12px';
            link.style.fontSize = '16px';
            link.style.fontWeight = 'bold';
          });
        });
      }, 100);
    }
  };
}

// הוספת המאזין לאחר טעינת המפה
document.addEventListener('DOMContentLoaded', function() {
  // הפעלת השיפורים למובייל לאחר טעינת המפה
  if (isMobileDevice()) {
    // אם המפה כבר זמינה, הפעל מיד
    if (window.map) {
      enhanceMobileMapExperience();
    } else {
      // אחרת, המתן לטעינת המפה
      const checkMap = setInterval(() => {
        if (window.map) {
          enhanceMobileMapExperience();
          clearInterval(checkMap);
        }
      }, 100);
      
      // הגבל את הבדיקה ל-10 שניות
      setTimeout(() => clearInterval(checkMap), 10000);
    }
  }
});