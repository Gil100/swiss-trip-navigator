// navigation-fix.js
// פתרון מאוחד לבעיות הניווט באפליקציה

// הרץ מיד עם טעינת הדף
(function() {
    // מאזין לטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      console.log("Navigation fix loaded");
      initUniversalNavigation();
    });
  
    // פונקציה ליצירת מערכת ניווט אוניברסלית שתעבוד בכל הפלטפורמות
    function initUniversalNavigation() {
      console.log("Initializing universal navigation system");
      
      // החלפת פונקציית הניווט הגלובלית
      window.openNavigation = function(location) {
        console.log("Enhanced navigation called for:", location);
        
        // וידוא שיש קואורדינטות תקינות
        if (!location || !location.coordinates || location.coordinates.length !== 2) {
          console.error("Invalid location data for navigation:", location);
          return false;
        }
        
        const [lat, lng] = location.coordinates;
        const locationTitle = location.title || 'יעד';
        
        // בדיקה אם המכשיר הוא מובייל
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        if (isMobile) {
          // יצירת דיאלוג בחירת אפליקציית ניווט במובייל
          showNavigationOptions(lat, lng, locationTitle);
        } else {
          // במחשב נפתח ישירות בגוגל מפות
          openInGoogleMaps(lat, lng);
        }
        
        return true;
      };
  
      // פונקציה להצגת אפשרויות ניווט במובייל
      function showNavigationOptions(lat, lng, title) {
        // ניקוי דיאלוגים קודמים
        removeExistingDialogs();
        
        // יצירת שכבת הצללה
        const overlay = document.createElement('div');
        overlay.id = 'navigation-overlay';
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
        
        // יצירת תפריט בחירה
        const navOptions = document.createElement('div');
        navOptions.id = 'navigation-dialog';
        navOptions.style.backgroundColor = 'white';
        navOptions.style.padding = '20px';
        navOptions.style.borderRadius = '12px';
        navOptions.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        navOptions.style.width = '90%';
        navOptions.style.maxWidth = '320px';
        navOptions.style.textAlign = 'center';
        navOptions.style.position = 'relative';
        navOptions.style.direction = 'rtl';
        
        navOptions.innerHTML = `
          <div style="position: absolute; top: 10px; left: 10px; font-size: 24px; cursor: pointer; width: 30px; height: 30px; line-height: 26px; text-align: center; border-radius: 50%;">&times;</div>
          <h2 style="margin: 0 0 20px 0; color: #e53935; font-size: 18px; font-weight: bold; padding-bottom: 10px; border-bottom: 1px solid #eee;">ניווט אל: ${title}</h2>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <button id="nav-google-maps" style="background-color: #4285F4; color: white; border: none; border-radius: 8px; padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 100%;">
              <span>Google Maps</span>
            </button>
            <button id="nav-waze" style="background-color: #33CCFF; color: white; border: none; border-radius: 8px; padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 100%;">
              <span>Waze</span>
            </button>
            <button id="nav-cancel" style="background-color: #757575; color: white; border: none; border-radius: 8px; padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 5px;">ביטול</button>
          </div>
        `;
        
        // הוספה לגוף המסמך
        overlay.appendChild(navOptions);
        document.body.appendChild(overlay);
        
        // סגירת התפריט
        function closeDialog() {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
        }
        
        // הוספת מאזיני אירועים
        
        // סגירה בלחיצה על X
        const closeButton = navOptions.querySelector('div[style*="position: absolute"]');
        closeButton.addEventListener('click', closeDialog);
        
        // סגירה בלחיצה על ביטול
        document.getElementById('nav-cancel').addEventListener('click', closeDialog);
        
        // סגירה בלחיצה על ההצללה
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) {
            closeDialog();
          }
        });
        
        // פתיחת גוגל מפות
        document.getElementById('nav-google-maps').addEventListener('click', function() {
          openInGoogleMaps(lat, lng);
          closeDialog();
        });
        
        // פתיחת Waze
        document.getElementById('nav-waze').addEventListener('click', function() {
          openInWaze(lat, lng);
          closeDialog();
        });
      }
      
      // ניקוי דיאלוגים קיימים
      function removeExistingDialogs() {
        const existingOverlay = document.getElementById('navigation-overlay');
        if (existingOverlay) {
          document.body.removeChild(existingOverlay);
        }
        
        // ניקוי גם של דיאלוגים מהקוד הישן
        const oldOverlays = document.querySelectorAll('.overlay, .navigation-overlay');
        oldOverlays.forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        });
      }
      
      // פתיחת גוגל מפות
      function openInGoogleMaps(lat, lng) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        openUrlSafely(url);
      }
      
      // פתיחת Waze
      function openInWaze(lat, lng) {
        const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        openUrlSafely(url);
      }
      
      // פתיחת URL בצורה בטוחה
      function openUrlSafely(url) {
        console.log("Opening URL:", url);
        
        try {
          // ניסיון ראשון - פתיחת חלון חדש
          const newWindow = window.open(url, '_blank');
          
          // בדיקה אם החלון נפתח בהצלחה
          if (newWindow && !newWindow.closed) {
            newWindow.focus();
            return true;
          }
          
          // אם לא הצלחנו, ננסה שיטה אחרת
          console.log("First method failed, trying alternative");
          
          // ניסיון שני - יצירת אלמנט קישור פיזי
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
          
          return true;
        } catch (e) {
          console.error("Error opening URL:", e);
          
          // ניסיון שלישי - שינוי החלון הנוכחי
          try {
            window.location.href = url;
            return true;
          } catch (e2) {
            console.error("All methods failed to open URL:", e2);
            alert("לא ניתן לפתוח את אפליקציית הניווט. נסה להעתיק את הקישור או לפתוח את האפליקציה ידנית.");
            return false;
          }
        }
      }
      
      // תיקון ושדרוג כפתורי ניווט קיימים בדף
      enhanceExistingNavigationButtons();
      
      // מתקן כפתורי ניווט קיימים בדף
      function enhanceExistingNavigationButtons() {
        // קביעת אינטרוול לבדיקת כפתורים חדשים
        setInterval(function() {
          fixPopupNavigationButtons();
          fixItineraryNavigationButtons();
        }, 1000);
      }
      
      // תיקון כפתורי ניווט בחלונות מידע
      function fixPopupNavigationButtons() {
        // הבעיה העיקרית: כפתורים בפופאפים שנוצרים דינמית
        const navButtons = document.querySelectorAll('.popup-nav-link');
        
        navButtons.forEach(button => {
          // אם כבר הוספנו מאזין אירוע משלנו, נדלג
          if (button.dataset.enhancedNav === 'true') return;
          
          // בדיקה אם יש inline onclick שמכיל קריאה לפונקציית ניווט
          const originalOnClick = button.getAttribute('onclick');
          if (originalOnClick && originalOnClick.includes('openNavigation')) {
            // הסרת ה-onclick המקורי
            button.removeAttribute('onclick');
            
            // חילוץ הקואורדינטות והכותרת מהמחרוזת
            const match = originalOnClick.match(/openNavigation\(\{coordinates:\s*\[([\d\.-]+),\s*([\d\.-]+)\],\s*title:\s*['"]([^'"]+)['"]/);
            
            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);
              const title = match[3];
              
              // הוספת מאזין אירוע משלנו
              button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                window.openNavigation({
                  coordinates: [lat, lng],
                  title: title
                });
                
                return false;
              });
              
              // סימון שהכפתור שודרג
              button.dataset.enhancedNav = 'true';
            }
          } 
          // אם אין onclick, ננסה לחלץ את המידע בדרך אחרת
          else {
            const popupContent = button.closest('.marker-popup') || button.closest('.leaflet-popup-content');
            if (popupContent) {
              const titleElem = popupContent.querySelector('h3');
              const title = titleElem ? titleElem.textContent : 'יעד';
              
              // ננסה למצוא את הקואורדינטות
              // אפשרות 1: מ-dataset
              if (button.dataset.lat && button.dataset.lng) {
                const lat = parseFloat(button.dataset.lat);
                const lng = parseFloat(button.dataset.lng);
                
                button.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  window.openNavigation({
                    coordinates: [lat, lng],
                    title: title
                  });
                  
                  return false;
                });
                
                button.dataset.enhancedNav = 'true';
              }
              // אפשרות 2: חיפוש במאפיינים אחרים או בתוכן ה-DOM
              else {
                // כאן אפשר להוסיף עוד לוגיקה לחילוץ קואורדינטות
                console.log("Could not extract coordinates from button:", button);
              }
            }
          }
        });
      }
      
      // תיקון כפתורי ניווט ברשימת המסלול
      function fixItineraryNavigationButtons() {
        const navLinks = document.querySelectorAll('.itinerary-actions .nav-link');
        
        navLinks.forEach(link => {
          // אם כבר שודרג, נדלג
          if (link.dataset.enhancedNav === 'true') return;
          
          const listItem = link.closest('.itinerary-item');
          if (!listItem) return;
          
          // מקרה 1: כפתור ניווט למלון
          if (link.classList.contains('hotel-nav') || link.classList.contains('return-nav') || 
              listItem.classList.contains('hotel-item') || listItem.classList.contains('return-item')) {
            
            const coordinates = [46.6279, 8.0324]; // קואורדינטות המלון
            const title = "המלון - Grindelwald";
            
            link.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              window.openNavigation({
                coordinates: coordinates,
                title: title
              });
              
              return false;
            });
            
            link.dataset.enhancedNav = 'true';
          }
          // מקרה 2: כפתור ניווט למיקום אחר
          else {
            const locationId = listItem.dataset.id || link.dataset.id;
            if (!locationId) return;
            
            // נסה למצוא את המיקום ב-appState
            let coordinates, title;
            
            try {
              const appState = window.getAppState ? window.getAppState() : window.appState;
              if (appState && appState.itineraryData) {
                const currentDay = appState.itineraryData.days[appState.currentDayIndex];
                const location = currentDay.locations.find(loc => loc.id === locationId);
                
                if (location) {
                  coordinates = location.coordinates;
                  title = location.title;
                }
              }
            } catch (e) {
              console.error("Error finding location in appState:", e);
            }
            
            // אם מצאנו את המיקום, נוסיף מאזין אירוע
            if (coordinates && title) {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                window.openNavigation({
                  coordinates: coordinates,
                  title: title
                });
                
                return false;
              });
              
              link.dataset.enhancedNav = 'true';
            }
          }
        });
      }
    }
  })();