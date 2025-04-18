// מצב גלובלי של האפליקציה
const appState = {
    itineraryData: null,
    currentDayIndex: 0,
    isDataLoaded: false,
    isMobileView: window.innerWidth < 768,
    isSidebarVisible: window.innerWidth >= 768,
    isMapInitialized: false
};

// טעינת הנתונים בעת העלאת האפליקציה
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("App starting...");
        
        // הצגת מסך פתיחה למשך 2 שניות
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            // אפשר סגירה בלחיצה
            splashScreen.addEventListener('click', () => {
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            });
            
            // הגדר טיימר שבטוח יסיר את מסך הפתיחה
            setTimeout(() => {
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }, 2000);
        }
        
        // הוספת כפתור להצגת/הסתרת הסרגל הצדדי במכשירים ניידים
        if (appState.isMobileView) {
            const toggleButton = document.createElement('button');
            toggleButton.id = 'toggle-sidebar';
            toggleButton.innerHTML = '&#9776;'; // סמל המבורגר
            toggleButton.classList.add('toggle-button');
            document.querySelector('header').appendChild(toggleButton);
            
            toggleButton.addEventListener('click', toggleSidebar);
            
            // הסתרת הסרגל הצדדי במצב התחלתי במכשירים ניידים
            document.getElementById('itinerary-container').classList.add('hidden');
            appState.isSidebarVisible = false;
        }
        
        // טעינת נתוני המסלול
        const response = await fetch('data/itinerary.json');
        appState.itineraryData = await response.json();
        appState.isDataLoaded = true;
        
        console.log("Itinerary data loaded successfully");
        
        // נסה לקבוע את היום הנוכחי לפי תאריך
        setCurrentDayBasedOnDate();
        
        // אתחול הממשק
        initUI();
        
        // אתחול המפה - הסרת תלות בספריית Leaflet
        window.initMapPromise = new Promise((resolve) => {
            console.log("Starting map initialization sequence");
            
            // ניסיון ראשון - שימוש ב-Leaflet אם קיים
            if (window.L && typeof window.L.map === 'function') {
                console.log("Leaflet detected, initializing map with Leaflet");
                try {
                    // יצירת מפה באמצעות Leaflet
                    const mapElement = document.getElementById('map');
                    const map = L.map(mapElement, {
                        center: [46.8182, 8.2275],
                        zoom: 8
                    });
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    
                    window.map = map;
                    appState.isMapInitialized = true;
                    console.log("Map initialized with Leaflet successfully");
                    resolve(true);
                    
                    // מיד לאחר אתחול, הצג את היום הנוכחי
                    showCurrentDay();
                    return;
                } catch (e) {
                    console.warn("Error initializing with Leaflet:", e);
                }
            }
            
            // ניסיון שני - מפה פשוטה
            console.log("Using simple map implementation");
            setTimeout(() => {
                try {
                    initMap(); // פונקציה בקובץ map.js
                    appState.isMapInitialized = true;
                    resolve(true);
                    
                    // מיד לאחר אתחול, הצג את היום הנוכחי
                    showCurrentDay();
                } catch (e) {
                    console.error("Error initializing simple map:", e);
                    resolve(false);
                }
            }, 100); // המתנה קצרה לטעינת כל הסקריפטים
        });
        
        // הצגת היום הנוכחי
        if (!appState.isMapInitialized) {
            // הצג את רשימת המיקומים מיד, בלי להמתין למפה
            const currentDay = appState.itineraryData.days[appState.currentDayIndex];
            renderItineraryList(currentDay);
        }
        
    } catch (error) {
        console.error('שגיאה בטעינת נתוני המסלול:', error);
        document.getElementById('itinerary-list').innerHTML = 
        '<li class="error">לא ניתן לטעון את נתוני המסלול. בדוק את החיבור לאינטרנט.</li>';
    }
    
    // טיפול בשינוי גודל המסך
    window.addEventListener('resize', handleResize);
});

// טיפול בשינוי גודל המסך
function handleResize() {
    const wasMobile = appState.isMobileView;
    appState.isMobileView = window.innerWidth < 768;
    
    // אם הגודל השתנה בין מובייל לדסקטופ
    if (wasMobile !== appState.isMobileView) {
        if (appState.isMobileView) {
            // עברנו למובייל - הוסף כפתור הצגה/הסתרה
            if (!document.getElementById('toggle-sidebar')) {
                const toggleButton = document.createElement('button');
                toggleButton.id = 'toggle-sidebar';
                toggleButton.innerHTML = '&#9776;';
                toggleButton.classList.add('toggle-button');
                document.querySelector('header').appendChild(toggleButton);
                
                toggleButton.addEventListener('click', toggleSidebar);
            }
            
            // הסתר את הסרגל הצדדי במובייל
            document.getElementById('itinerary-container').classList.add('hidden');
            appState.isSidebarVisible = false;
        } else {
            // עברנו לדסקטופ - הסר את כפתור ההצגה/הסתרה
            const toggleButton = document.getElementById('toggle-sidebar');
            if (toggleButton) {
                toggleButton.remove();
            }
            
            // הצג את הסרגל הצדדי בדסקטופ
            document.getElementById('itinerary-container').classList.remove('hidden');
            appState.isSidebarVisible = true;
        }
    }
    
    // עדכון גודל המפה אם היא קיימת
    if (window.map && appState.isMapInitialized) {
        if (typeof window.map.invalidateSize === 'function') {
            try {
                window.map.invalidateSize();
            } catch (e) {
                console.warn("Error resizing map:", e);
            }
        }
    }
}

// הצגה/הסתרה של הסרגל הצדדי
function toggleSidebar() {
    const sidebar = document.getElementById('itinerary-container');
    sidebar.classList.toggle('hidden');
    appState.isSidebarVisible = !appState.isSidebarVisible;
    
    // במידה והסרגל הוצג, התאם את גודל המפה
    if (appState.isSidebarVisible && appState.isMobileView && window.map && appState.isMapInitialized) {
        setTimeout(() => {
            if (typeof window.map.invalidateSize === 'function') {
                try {
                    window.map.invalidateSize();
                } catch (e) {
                    console.warn("Error resizing map after sidebar toggle:", e);
                }
            }
        }, 300); // המתן עד לסיום האנימציה
    }
}

// קביעת היום הנוכחי לפי תאריך
function setCurrentDayBasedOnDate() {
    if (!appState.isDataLoaded) return;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    for (let i = 0; i < appState.itineraryData.days.length; i++) {
        if (appState.itineraryData.days[i].date === todayStr) {
            appState.currentDayIndex = i;
            return;
        }
    }
    
    // אם לא נמצא היום הנוכחי, נסה למצוא את היום הקרוב ביותר
    const todayTime = today.getTime();
    let closestDayIndex = 0;
    let minDiff = Number.MAX_SAFE_INTEGER;
    
    appState.itineraryData.days.forEach((day, index) => {
        const dayDate = new Date(day.date);
        const diff = Math.abs(dayDate.getTime() - todayTime);
        
        if (diff < minDiff) {
            minDiff = diff;
            closestDayIndex = index;
        }
    });
    
    appState.currentDayIndex = closestDayIndex;
}

// אתחול של ממשק המשתמש
function initUI() {
    // עדכון כותרת הטיול
    document.querySelector('header h1').textContent = appState.itineraryData.tripName || 'Swiss Trip Navigator';
    
    // הגדרת כפתורים למעבר בין ימים
    document.getElementById('prev-day').addEventListener('click', () => {
        if (appState.currentDayIndex > 0) {
            appState.currentDayIndex--;
            showCurrentDay();
        }
    });
    
    document.getElementById('next-day').addEventListener('click', () => {
        if (appState.currentDayIndex < appState.itineraryData.days.length - 1) {
            appState.currentDayIndex++;
            showCurrentDay();
        }
    });
    
    // הוספת תצוגת מספור ימים
    const dayCounter = document.createElement('div');
    dayCounter.id = 'day-counter';
    document.getElementById('current-day-controls').appendChild(dayCounter);
}

// הצגת היום הנוכחי
function showCurrentDay() {
    if (!appState.isDataLoaded) {
        console.warn("Data not loaded yet, can't show current day");
        return;
    }
    
    const currentDay = appState.itineraryData.days[appState.currentDayIndex];
    
    // עדכון כותרת היום
    document.getElementById('current-day-display').textContent = 
    `יום ${currentDay.dayNumber}: ${currentDay.title}`;
    
    // עדכון מונה ימים
    document.getElementById('day-counter').textContent = 
    `${appState.currentDayIndex + 1} / ${appState.itineraryData.days.length}`;
    
    // עדכון כפתורי ניווט
    document.getElementById('prev-day').disabled = appState.currentDayIndex === 0;
    document.getElementById('next-day').disabled = appState.currentDayIndex === appState.itineraryData.days.length - 1;
    
    // הצגת נקודות המסלול
    renderItineraryList(currentDay);
    
    // עדכון המפה אם היא מאותחלת
    if (window.map && typeof updateMapForDay === 'function') {
        try {
            updateMapForDay(currentDay);
        } catch (e) {
            console.warn("Error updating map for current day:", e);
        }
    } else {
        console.log("Map not ready yet, will update when initialized");
        // שמירת היום הנוכחי לעדכון מאוחר
        window.pendingDay = currentDay;
    }
}

// תוספת לקובץ app.js - יש להוסיף בסוף הקובץ

// טיפול משופר במובייל - מאפשר החלקה של רשימת המיקומים
document.addEventListener('DOMContentLoaded', function() {
    // בדוק אם המכשיר הוא מובייל
    if (window.innerWidth < 768) {
      const itineraryContainer = document.getElementById('itinerary-container');
      let startY, startTranslate, currentTranslate = 0;
      let isDragging = false;
      
      // השג את גובה הקונטיינר המקורי
      const originalHeight = itineraryContainer.offsetHeight;
      
      // הוסף מאזיני אירועים למסך מגע
      itineraryContainer.addEventListener('touchstart', touchStart);
      itineraryContainer.addEventListener('touchmove', touchMove);
      itineraryContainer.addEventListener('touchend', touchEnd);
      
      // הוסף מאזיני אירועים לעכבר (לבדיקה בדסקטופ)
      itineraryContainer.addEventListener('mousedown', touchStart);
      itineraryContainer.addEventListener('mousemove', touchMove);
      itineraryContainer.addEventListener('mouseup', touchEnd);
      itineraryContainer.addEventListener('mouseleave', touchEnd);
      
      // פונקציות טיפול באירועי מגע
      function touchStart(e) {
        const touch = e.touches ? e.touches[0] : e;
        startY = touch.clientY;
        
        // בדוק את הטרנספורם הנוכחי
        const transform = window.getComputedStyle(itineraryContainer).transform;
        if (transform && transform !== 'none') {
          const matrix = transform.match(/matrix.*\((.+)\)/);
          if (matrix) {
            currentTranslate = parseFloat(matrix[1].split(', ')[5]) || 0;
          }
        } else {
          currentTranslate = 0;
        }
        
        startTranslate = currentTranslate;
        isDragging = true;
        
        // הוסף מחלקה למסמן שהגרירה התחילה
        itineraryContainer.classList.add('dragging');
      }
      
      function touchMove(e) {
        if (!isDragging) return;
        
        // מנע ברירת מחדל רק אם הגרירה היא על הידית וזה לא אלמנט גלילה
        if (e.target.closest('#itinerary-container:before, h2')) {
          e.preventDefault();
        }
        
        const touch = e.touches ? e.touches[0] : e;
        const currentY = touch.clientY;
        const diffY = currentY - startY;
        
        // חסום את התנועה להיות רק כלפי מטה ולא מעבר לגובה הקונטיינר
        let newTranslate = startTranslate + diffY;
        
        // הגבל את התנועה כך שהקונטיינר לא יוכל לצאת מהמסך לחלוטין
        const maxTranslate = originalHeight - 40; // משאיר 40px גלויים
        if (newTranslate > maxTranslate) {
          newTranslate = maxTranslate;
        }
        
        // אל תאפשר למשוך את הקונטיינר כלפי מעלה יותר מגובהו המקורי
        if (newTranslate < 0) {
          newTranslate = 0;
        }
        
        itineraryContainer.style.transform = `translateY(${newTranslate}px)`;
      }
      
      function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // הסר מחלקת גרירה
        itineraryContainer.classList.remove('dragging');
        
        // קבע את המצב הסופי - פתוח או סגור
        const threshold = originalHeight / 2;
        
        if (currentTranslate > threshold) {
          // הוסף מחלקת מוסתר
          itineraryContainer.classList.add('hidden');
          itineraryContainer.style.transform = '';
          document.body.classList.remove('list-open');
        } else {
          // הסר מחלקת מוסתר
          itineraryContainer.classList.remove('hidden');
          itineraryContainer.style.transform = 'translateY(0)';
          document.body.classList.add('list-open');
        }
      }
      
      // הוסף האזנה ללחיצה על הכותרת לפתיחה/סגירה
      const containerTitle = itineraryContainer.querySelector('h2');
      if (containerTitle) {
        containerTitle.addEventListener('click', function() {
          itineraryContainer.classList.toggle('hidden');
          
          // עדכן את מחלקת ה-body
          if (itineraryContainer.classList.contains('hidden')) {
            document.body.classList.remove('list-open');
          } else {
            document.body.classList.add('list-open');
          }
          
          // עדכן את גודל המפה
          setTimeout(() => {
            if (window.map && typeof window.map.invalidateSize === 'function') {
              window.map.invalidateSize();
            }
          }, 300);
        });
      }
      
      // הוסף מחלקת רשימה פתוחה לגוף הדף
      if (!itineraryContainer.classList.contains('hidden')) {
        document.body.classList.add('list-open');
      }
      
      // פח יותר גדול ללחיצה
      const items = document.querySelectorAll('.itinerary-item');
      items.forEach(item => {
        item.style.padding = '15px';
      });
      
      // שיפור גדלי טקסט
      const titles = document.querySelectorAll('.itinerary-title');
      titles.forEach(title => {
        title.style.fontSize = '16px';
      });
      
      const descriptions = document.querySelectorAll('.itinerary-description');
      descriptions.forEach(desc => {
        desc.style.fontSize = '14px';
      });
    }
  });
  
  // שיפור תצוגת הפופאפים במובייל
  function enhanceMobilePopups() {
    // בדוק אם המכשיר הוא מובייל
    if (window.innerWidth < 768) {
      // הוסף סגנון למפה באמצעות JavaScript
      const style = document.createElement('style');
      style.textContent = `
        .leaflet-popup-content-wrapper {
          width: 280px !important;
          max-width: 90vw !important;
          padding: 15px !important;
        }
        
        .leaflet-popup-content {
          margin: 5px !important;
          font-size: 15px !important;
        }
        
        .leaflet-popup-content h3 {
          font-size: 18px !important;
          margin-bottom: 10px !important;
        }
        
        .popup-nav-link {
          padding: 12px !important;
          margin-top: 12px !important;
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);
      
      // גודל מפה דינמי
      const mapContainer = document.getElementById('map-container');
      const itineraryContainer = document.getElementById('itinerary-container');
      
      if (mapContainer && itineraryContainer) {
        // האזנה לשינוי בקלאס של itinerary-container
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
              const isHidden = itineraryContainer.classList.contains('hidden');
              
              // התאם את גובה המפה בהתאם
              if (isHidden) {
                mapContainer.style.height = '80vh';
              } else {
                mapContainer.style.height = '45vh';
              }
              
              // עדכן את גודל המפה
              setTimeout(() => {
                if (window.map && typeof window.map.invalidateSize === 'function') {
                  window.map.invalidateSize();
                }
              }, 300);
            }
          });
        });
        
        observer.observe(itineraryContainer, { attributes: true });
      }
    }
  }
  
  // הפעל את השיפורים למובייל בטעינת הדף
  window.addEventListener('load', enhanceMobilePopups);