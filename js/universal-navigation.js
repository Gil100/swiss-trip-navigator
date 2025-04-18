// יצירת פונקציית ניווט משופרת שעובדת בכל הדפדפנים
function createUniversalNavigation() {
    // מחליף את פונקציית הניווט הגלובלית
    window.openNavigation = function(location) {
      console.log("Universal navigation called for:", location);
      
      if (!location || !location.coordinates || location.coordinates.length !== 2) {
        console.error("Invalid location data for navigation");
        return;
      }
      
      const [lat, lng] = location.coordinates;
      const locationTitle = location.title || 'יעד';
      
      // בדיקה אם המכשיר הוא מובייל
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      
      if (isMobile) {
        // יצירת דיאלוג ניווט
        createNavigationDialog(lat, lng, locationTitle);
      } else {
        // במחשב נפתח ישירות בגוגל מפות
        openInGoogleMaps(lat, lng);
      }
    };
    
    // פתיחת גוגל מפות
    function openInGoogleMaps(lat, lng) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      openUrlInNewTab(googleMapsUrl);
    }
    
    // פתיחת Waze
    function openInWaze(lat, lng) {
      const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      openUrlInNewTab(wazeUrl);
    }
    
    // פתיחת URL בטאב חדש עם מקסימום תאימות לדפדפנים שונים
    function openUrlInNewTab(url) {
      try {
        // נסיון ראשון - הדרך הרגילה
        const newWindow = window.open(url, '_blank');
        
        // בדיקה אם החלון נפתח בהצלחה
        if (newWindow) {
          newWindow.focus();
          return true;
        }
        
        // נסיון שני - יצירת <a> אלמנט והפעלת לחיצה
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch (e) {
        console.error("Error opening URL:", e);
        
        // נסיון שלישי - שינוי מיקום החלון הנוכחי
        try {
          window.location.href = url;
          return true;
        } catch (e2) {
          console.error("All methods failed to open URL:", e2);
          alert("לא ניתן לפתוח את אפליקציית הניווט. נסה לפתוח ידנית את גוגל מפות או Waze.");
          return false;
        }
      }
    }
    
    // יצירת דיאלוג בחירת אפליקציית ניווט
    function createNavigationDialog(lat, lng, locationTitle) {
      // הסרת דיאלוגים קודמים אם קיימים
      const existingOverlay = document.querySelector('.navigation-overlay');
      if (existingOverlay) {
        document.body.removeChild(existingOverlay);
      }
      
      // יצירת שכבת הצללה
      const overlay = document.createElement('div');
      overlay.className = 'navigation-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      
      // יצירת חלון הדיאלוג
      const dialog = document.createElement('div');
      dialog.className = 'navigation-dialog';
      dialog.style.backgroundColor = 'white';
      dialog.style.borderRadius = '12px';
      dialog.style.padding = '20px';
      dialog.style.width = '90%';
      dialog.style.maxWidth = '350px';
      dialog.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
      dialog.style.direction = 'rtl';
      dialog.style.textAlign = 'center';
      dialog.style.position = 'relative';
      dialog.style.zIndex = '10000';
      
      // כותרת
      dialog.innerHTML = `
        <div style="position:absolute; top:10px; left:10px; font-size:24px; cursor:pointer; width:30px; height:30px; line-height:30px; text-align:center;">&times;</div>
        <h2 style="margin:0 0 20px 0; color:#e53935; font-size:18px;">ניווט אל: ${locationTitle}</h2>
        <p style="margin:0 0 20px 0; font-size:16px;">בחר אפליקציית ניווט:</p>
        <div style="display:flex; flex-direction:column; gap:15px;">
          <button id="google-maps-btn" style="background-color:#4285F4; color:white; border:none; border-radius:8px; padding:15px; font-size:16px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
            <span style="margin-right:8px;">Google Maps</span>
          </button>
          <button id="waze-btn" style="background-color:#33CCFF; color:white; border:none; border-radius:8px; padding:15px; font-size:16px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center;">
            <span style="margin-right:8px;">Waze</span>
          </button>
        </div>
      `;
      
      // הוספה למסמך
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      
      // סגירה בלחיצה על X
      const closeButton = dialog.querySelector('div[style*="position:absolute"]');
      closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      // סגירה בלחיצה על ההצללה
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });
      
      // כפתור Google Maps
      const googleMapsBtn = document.getElementById('google-maps-btn');
      googleMapsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openInGoogleMaps(lat, lng);
        document.body.removeChild(overlay);
      });
      
      // כפתור Waze
      const wazeBtn = document.getElementById('waze-btn');
      wazeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openInWaze(lat, lng);
        document.body.removeChild(overlay);
      });
    }
    
    // חיזוק פתיחת ניווט דרך כפתורי פופאפ
    function enhanceNavigationButtons() {
      // תיקון כפתורי ניווט קיימים
      setTimeout(() => {
        // פופאפים במפה
        const navButtons = document.querySelectorAll('.popup-nav-link');
        navButtons.forEach(button => {
          // הסר כל אירועי לחיצה קיימים לפני הוספה חדשה
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }
          
          // זיהוי נתוני המיקום מהאטריביוטים
          const originalOnClick = newButton.getAttribute('onclick');
          if (originalOnClick && originalOnClick.includes('openNavigation')) {
            newButton.removeAttribute('onclick');
            
            // חילוץ נתוני המיקום מהקריאה המקורית
            const match = originalOnClick.match(/openNavigation\(\{coordinates:\s*\[([\d\.-]+),\s*([\d\.-]+)\],\s*title:\s*['"]([^'"]+)['"]/);
            
            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);
              const title = match[3];
              
              // הוספת אירוע לחיצה חדש
              newButton.addEventListener('click', function() {
                window.openNavigation({
                  coordinates: [lat, lng],
                  title: title
                });
                return false;
              });
            }
          } else if (newButton.id && newButton.id.includes('nav-')) {
            // בדיקה אם הכפתור יש לו ID ייחודי
            // לרוב כפתורי ניווט במפה מקבלים ID ייחודי
            const popupContent = newButton.closest('.marker-popup') || newButton.closest('.leaflet-popup-content');
            if (popupContent) {
              const titleElem = popupContent.querySelector('h3');
              const title = titleElem ? titleElem.textContent : 'יעד';
              
              // ננסה למצוא את קואורדינטות ממאפיינים נוספים
              let lat, lng;
              const locMatch = newButton.getAttribute('data-location');
              if (locMatch) {
                try {
                  const locData = JSON.parse(locMatch);
                  lat = locData.lat || locData[0];
                  lng = locData.lng || locData[1];
                } catch (e) {}
              }
              
              if (lat && lng) {
                newButton.addEventListener('click', function() {
                  window.openNavigation({
                    coordinates: [lat, lng],
                    title: title
                  });
                  return false;
                });
              }
            }
          }
        });
        
        // גם לרשימת המסלול
        const listNavLinks = document.querySelectorAll('.itinerary-actions .nav-link');
        listNavLinks.forEach(link => {
          // הסר כל אירועי לחיצה קיימים לפני הוספה חדשה
          const newLink = link.cloneNode(true);
          if (link.parentNode) {
            link.parentNode.replaceChild(newLink, link);
          }
          
          // זיהוי המיקום לפי הכפתור והפריט
          const listItem = newLink.closest('.itinerary-item');
          if (listItem) {
            let coordinates, title;
            
            // בדיקה אם זה פריט מלון
            if (listItem.classList.contains('hotel-item') || listItem.classList.contains('return-item') || newLink.classList.contains('hotel-nav') || newLink.classList.contains('return-nav')) {
              coordinates = [46.6279, 8.0324]; // קואורדינטות של המלון
              title = "המלון - Grindelwald";
            } 
            // פריט מסלול רגיל
            else {
              const locationId = listItem.dataset.id || newLink.dataset.id;
              if (!locationId) return;
              
              // מציאת המיקום באמצעות ה-ID
              const appState = window.getAppState ? window.getAppState() : window.appState;
              if (!appState || !appState.itineraryData) return;
              
              const currentDay = appState.itineraryData.days[appState.currentDayIndex];
              const location = currentDay.locations.find(loc => loc.id === locationId);
              if (!location) return;
              
              coordinates = location.coordinates;
              title = location.title;
            }
            
            if (coordinates && title) {
              newLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.openNavigation({
                  coordinates: coordinates,
                  title: title
                });
                return false;
              });
            }
          }
        });
      }, 500);
    }
    
    // תפיסת כל הכפתורים שנוצרים בעתיד
    const observer = new MutationObserver(function(mutations) {
      enhanceNavigationButtons();
    });
    
    // תחילת ניטור שינויים ב-DOM
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // הריץ את השיפורים פעם אחת מיד
    enhanceNavigationButtons();
    
    return window.openNavigation;
  }
  
  // הוספת קוד להפעלה מיידית
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Installing universal navigation system");
    
    // יצירה והפעלה של פונקציית הניווט האוניברסלית
    const navigationFunction = createUniversalNavigation();
    
    // הוספת סגנונות לדיאלוג הניווט
    const style = document.createElement('style');
    style.textContent = `
      .navigation-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(3px);
      }
      
      .navigation-dialog {
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        width: 90%;
        max-width: 350px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        direction: rtl;
        text-align: center;
        position: relative;
        z-index: 10000;
        animation: dialogAppear 0.3s ease-out;
      }
      
      @keyframes dialogAppear {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      #google-maps-btn, #waze-btn {
        transition: transform 0.2s ease;
      }
      
      #google-maps-btn:active, #waze-btn:active {
        transform: scale(0.95);
      }
    `;
    document.head.appendChild(style);
  });