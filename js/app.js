// מצב גלובלי של האפליקציה
const appState = {
    itineraryData: null,
    currentDayIndex: 0,
    isDataLoaded: false,
    isMobileView: window.innerWidth < 768,
    isSidebarVisible: window.innerWidth >= 768
};

// טעינת הנתונים בעת העלאת האפליקציה
document.addEventListener('DOMContentLoaded', async () => {
    try {
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
        
        // נסה לקבוע את היום הנוכחי לפי תאריך
        setCurrentDayBasedOnDate();
        
        // אתחול הממשק
        initUI();
        
        // הצגת היום הנוכחי
        showCurrentDay();
        
        // אתחול המפה
        initMap();
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
}

// הצגה/הסתרה של הסרגל הצדדי
function toggleSidebar() {
    const sidebar = document.getElementById('itinerary-container');
    sidebar.classList.toggle('hidden');
    appState.isSidebarVisible = !appState.isSidebarVisible;
    
    // במידה והסרגל הוצג, התאם את גודל המפה
    if (appState.isSidebarVisible && appState.isMobileView && window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
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
    if (!appState.isDataLoaded) return;
    
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
    
    // עדכון המפה
    updateMapForDay(currentDay);
}