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