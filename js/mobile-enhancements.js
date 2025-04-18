// קובץ js/mobile-enhancements.js
// שיפורים לחוויית המשתמש במובייל

document.addEventListener('DOMContentLoaded', function() {
    // בדיקה אם המכשיר הוא מובייל
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        enhanceMobileExperience();
    }
    
    // האזנה לשינויים בגודל החלון
    window.addEventListener('resize', function() {
        const isMobileNow = window.innerWidth < 768;
        if (isMobileNow !== isMobile) {
            // רענון העמוד אם המצב השתנה (מובייל לדסקטופ או להיפך)
            location.reload();
        }
    });
});

// פונקציה לשיפור חוויית המובייל
function enhanceMobileExperience() {
    // הוספת מחלקה לגוף העמוד לציון מצב מובייל
    document.body.classList.add('mobile-view');
    
    // קבלת אלמנטים
    const itineraryContainer = document.getElementById('itinerary-container');
    const mapContainer = document.getElementById('map-container');
    
    if (!itineraryContainer || !mapContainer) return;
    
    // הוספת ידית גרירה
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    itineraryContainer.prepend(dragHandle);
    
    // יצירת חיבור להנפשות החלקה
    setupSwipeNavigation(itineraryContainer, dragHandle);
    
    // שיפור תגובתיות הסמנים במפה
    enhanceMapMarkers();
    
    // שיפור חלונות המידע (פופאפים)
    enhanceInfoPopups();
    
    // שיפור החלפת ימים במסלול
    enhanceDayNavigation();
    
    // הוספת כפתור בחירת יום קבוע
    addFixedDaySelector();
    
    // תיקון וראי-אימפלמנטציה של פונקציית הניווט למובייל
    fixMobileNavigation();
}

// תיקון פונקציית הניווט למובייל
function fixMobileNavigation() {
    console.log("Fixing mobile navigation functionality");
    
    // בדיקה אם קיימת כבר פונקציית openNavigation
    if (typeof window.openNavigation === 'function') {
        console.log("Overriding existing openNavigation function");
        
        // שמירת הפונקציה המקורית
        const originalOpenNavigation = window.openNavigation;
        
        // החלפת הפונקציה בגרסה משופרת
        window.openNavigation = function(location) {
            console.log("Enhanced openNavigation called for:", location);
            
            // וידוא שיש קואורדינטות
            if (!location || !location.coordinates || location.coordinates.length !== 2) {
                console.error("Invalid location data for navigation");
                return;
            }
            
            const [lat, lng] = location.coordinates;
            
            // יצירת שכבת הצללה
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '2000';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            
            document.body.appendChild(overlay);
            
            // יצירת תפריט בחירה
            const navOptions = document.createElement('div');
            navOptions.className = 'nav-options';
            navOptions.style.backgroundColor = 'white';
            navOptions.style.padding = '20px';
            navOptions.style.borderRadius = '12px';
            navOptions.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            navOptions.style.width = '90%';
            navOptions.style.maxWidth = '350px';
            navOptions.style.textAlign = 'center';
            navOptions.style.position = 'relative';
            navOptions.style.direction = 'rtl';
            
            const locationTitle = location.title || 'יעד';
            
            navOptions.innerHTML = `
                <div style="position: absolute; top: 10px; left: 10px; font-size: 24px; cursor: pointer;">&times;</div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #e53935;">ניווט אל: ${locationTitle}</div>
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    <button class="nav-google" style="padding: 12px; background-color: #4285F4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 8px;">Google Maps</span>
                    </button>
                    <button class="nav-waze" style="padding: 12px; background-color: #33CCFF; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 8px;">Waze</span>
                    </button>
                </div>
            `;
            
            overlay.appendChild(navOptions);
            
            // סגירת התפריט בלחיצה על X
            const closeButton = navOptions.querySelector('div[style*="position: absolute"]');
            closeButton.addEventListener('click', cleanup);
            
            // הוספת אירועי לחיצה
            navOptions.querySelector('.nav-google').addEventListener('click', () => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                cleanup();
            });
            
            navOptions.querySelector('.nav-waze').addEventListener('click', () => {
                window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
                cleanup();
            });
            
            // סגירת התפריט בלחיצה על ההצללה
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                }
            });
            
            function cleanup() {
                document.body.removeChild(overlay);
            }
        };
    } else {
        console.warn("openNavigation function not found, implementing new one");
        
        // יצירת פונקציית ניווט חדשה אם היא לא קיימת
        window.openNavigation = function(location) {
            console.log("New openNavigation implementation called for:", location);
            
            // יישום בסיסי דומה לקוד למעלה
            if (!location || !location.coordinates || location.coordinates.length !== 2) {
                console.error("Invalid location data for navigation");
                return;
            }
            
            const [lat, lng] = location.coordinates;
            
            // יצירת שכבת הצללה
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.zIndex = '2000';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            
            document.body.appendChild(overlay);
            
            // יצירת תפריט בחירה
            const navOptions = document.createElement('div');
            navOptions.className = 'nav-options';
            navOptions.style.backgroundColor = 'white';
            navOptions.style.padding = '20px';
            navOptions.style.borderRadius = '12px';
            navOptions.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
            navOptions.style.width = '90%';
            navOptions.style.maxWidth = '350px';
            navOptions.style.textAlign = 'center';
            navOptions.style.position = 'relative';
            navOptions.style.direction = 'rtl';
            
            const locationTitle = location.title || 'יעד';
            
            navOptions.innerHTML = `
                <div style="position: absolute; top: 10px; left: 10px; font-size: 24px; cursor: pointer;">&times;</div>
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #e53935;">ניווט אל: ${locationTitle}</div>
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                    <button class="nav-google" style="padding: 12px; background-color: #4285F4; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 8px;">Google Maps</span>
                    </button>
                    <button class="nav-waze" style="padding: 12px; background-color: #33CCFF; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 8px;">Waze</span>
                    </button>
                </div>
            `;
            
            overlay.appendChild(navOptions);
            
            // סגירת התפריט בלחיצה על X
            const closeButton = navOptions.querySelector('div[style*="position: absolute"]');
            closeButton.addEventListener('click', cleanup);
            
            // הוספת אירועי לחיצה
            navOptions.querySelector('.nav-google').addEventListener('click', () => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                cleanup();
            });
            
            navOptions.querySelector('.nav-waze').addEventListener('click', () => {
                window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
                cleanup();
            });
            
            // סגירת התפריט בלחיצה על ההצללה
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                }
            });
            
            function cleanup() {
                document.body.removeChild(overlay);
            }
        };
    }
    
    // תיקון פונקציונליות ניווט בחלונות המידע (פופאפים)
    fixPopupNavigation();
}

// תיקון פונקציונליות ניווט בחלונות המידע
function fixPopupNavigation() {
    // עדכון עבור פופאפים קיימים
    setTimeout(() => {
        // מציאת כל כפתורי הניווט בחלונות מידע
        const navButtons = document.querySelectorAll('.popup-nav-link');
        
        navButtons.forEach(button => {
            // החלפת אירוע onclick עם אירוע חדש שמשתמש בפונקציה המשופרת
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
    }, 500); // המתנה קצרה כדי לוודא שהפופאפים נטענו
}

// הגדרת התנהגות גרירה/החלקה
function setupSwipeNavigation(container, handle) {
    let startY, startTranslate, currentTranslate = 0;
    let isDragging = false;
    
    // גובה מקורי של הקונטיינר
    const containerHeight = container.offsetHeight;
    
    // הוספת מאזיני אירועים למגע
    handle.addEventListener('touchstart', touchStart, { passive: false });
    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', touchEnd, { passive: false });
    
    // גם מאזיני עכבר לבדיקה
    handle.addEventListener('mousedown', touchStart, { passive: false });
    document.addEventListener('mousemove', touchMove, { passive: false });
    document.addEventListener('mouseup', touchEnd, { passive: false });
    
    // הוספת מאזין לחיצה לכותרת
    const containerTitle = container.querySelector('h2');
    if (containerTitle) {
        containerTitle.addEventListener('click', function() {
            toggleContainerState();
        });
    }
    
    // פונקציות טיפול באירועי מגע
    function touchStart(e) {
        const touch = e.touches ? e.touches[0] : e;
        startY = touch.clientY;
        
        // בדיקת מצב נוכחי
        const transform = window.getComputedStyle(container).transform;
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
        
        // הוספת מחלקה לסגנון מיוחד בזמן גרירה
        container.classList.add('dragging');
        
        // מניעת ברירת מחדל רק בידית הגרירה
        if (e.target === handle || e.target.closest('.drag-handle') || e.target === containerTitle) {
            e.preventDefault();
        }
    }
    
    function touchMove(e) {
        if (!isDragging) return;
        
        const touch = e.touches ? e.touches[0] : e;
        const currentY = touch.clientY;
        const diffY = currentY - startY;
        
        // חישוב המיקום החדש עם הגבלות
        let newTranslate = startTranslate + diffY;
        
        // מגבלות תנועה
        const maxTranslate = containerHeight - 50; // משאיר 50px גלויים
        if (newTranslate > maxTranslate) {
            newTranslate = maxTranslate;
        }
        
        if (newTranslate < 0) {
            newTranslate = 0;
        }
        
        // עדכון מיקום הקונטיינר
        container.style.transform = `translateY(${newTranslate}px)`;
        
        // מניעת גלילת הדף אם הגרירה מתחילה מהידית
        if (e.target === handle || e.target.closest('.drag-handle') || e.target === containerTitle) {
            e.preventDefault();
        }
    }
    
    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // הסרת מחלקת גרירה
        container.classList.remove('dragging');
        
        // קביעת מצב סופי
        const threshold = containerHeight / 3;
        
        if (currentTranslate > threshold) {
            // הסתרה
            container.classList.add('hidden');
            container.style.transform = '';
            document.body.classList.remove('list-open');
        } else {
            // הצגה
            container.classList.remove('hidden');
            container.style.transform = 'translateY(0)';
            document.body.classList.add('list-open');
        }
        
        // עדכון המפה
        updateMapSize();
    }
    
    // החלפת מצב הקונטיינר
    function toggleContainerState() {
        container.classList.toggle('hidden');
        
        if (container.classList.contains('hidden')) {
            document.body.classList.remove('list-open');
            container.style.transform = '';
        } else {
            document.body.classList.add('list-open');
            container.style.transform = 'translateY(0)';
        }
        
        // עדכון המפה
        updateMapSize();
    }
    
    // פונקציה לעדכון גודל המפה
    function updateMapSize() {
        setTimeout(() => {
            if (window.map && typeof window.map.invalidateSize === 'function') {
                window.map.invalidateSize();
            }
        }, 300);
    }
}

// שיפור סמני המפה למובייל
function enhanceMapMarkers() {
    // האזנה ליצירת סמנים חדשים
    const originalAddMarker = window.addMarker || window.mapHelper?.addMarker;
    
    if (originalAddMarker) {
        window.addMarker = function() {
            const marker = originalAddMarker.apply(this, arguments);
            
            // שיפור גודל הסמן אם הוא נוצר
            if (marker && marker.getElement) {
                const element = marker.getElement();
                if (element) {
                    element.style.width = '44px';
                    element.style.height = '44px';
                    element.style.fontSize = '22px';
                }
            }
            
            return marker;
        };
        
        // עדכון הפונקציה גם במפה הפשוטה
        if (window.mapHelper) {
            window.mapHelper.addMarker = window.addMarker;
        }
    }
}

// שיפור חלונות מידע (פופאפים)
function enhanceInfoPopups() {
    // הוספת סגנון
    const style = document.createElement('style');
    style.innerHTML = `
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
    }
    
    .leaflet-popup-content h3,
    .simple-popup h3 {
        font-size: 18px !important;
        margin-bottom: 10px !important;
    }
    
    .popup-nav-link {
        padding: 12px !important;
        margin-top: 12px !important;
        font-size: 16px !important;
        font-weight: bold !important;
    }
    `;
    document.head.appendChild(style);
    
    // החלפת פונקציית showPopup המקורית אם היא קיימת
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
                
                // שיפור כפתורי ניווט וטיפול באירועי לחיצה
                const navLinks = popup.querySelectorAll('.popup-nav-link');
                navLinks.forEach(link => {
                    // שיפור סגנון
                    link.style.padding = '12px';
                    link.style.fontSize = '16px';
                    link.style.fontWeight = 'bold';
                    link.style.borderRadius = '8px';
                    link.style.margin = '12px 0 0 0';
                    link.style.textAlign = 'center';
                    link.style.display = 'block';
                    
                    // החלפת הלחיצה לפונקציה משופרת
                    const originalOnClick = link.getAttribute('onclick');
                    if (originalOnClick && originalOnClick.includes('openNavigation')) {
                        link.removeAttribute('onclick');
                        
                        // חילוץ נתוני המיקום מהקריאה המקורית
                        const match = originalOnClick.match(/openNavigation\(\{coordinates:\s*\[([\d\.-]+),\s*([\d\.-]+)\],\s*title:\s*['"]([^'"]+)['"]/);
                        
                        if (match) {
                            const lat = parseFloat(match[1]);
                            const lng = parseFloat(match[2]);
                            const title = match[3];
                            
                            // הוספת אירוע לחיצה חדש
                            link.addEventListener('click', function(e) {
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
        };
    }
}

// שיפור ניווט בין ימים
function enhanceDayNavigation() {
    const prevButton = document.getElementById('prev-day');
    const nextButton = document.getElementById('next-day');
    const dayDisplay = document.getElementById('current-day-display');

    if (prevButton && nextButton && dayDisplay) {
        // הגדלת כפתורים
        [prevButton, nextButton].forEach(button => {
            button.style.padding = '8px 15px';
            button.style.fontSize = '15px';
            button.style.height = '38px';
            button.style.minWidth = '70px';
        });

        // שיפור תצוגת היום הנוכחי
        dayDisplay.style.fontSize = '16px';
        dayDisplay.style.fontWeight = 'bold';
        dayDisplay.style.padding = '5px';
        dayDisplay.style.maxWidth = '180px';
        dayDisplay.style.overflow = 'hidden';
        dayDisplay.style.textOverflow = 'ellipsis';
        dayDisplay.style.whiteSpace = 'nowrap';
    }
}

// פונקציה משופרת להוספת כפתור קבוע לבחירת יום
function addFixedDaySelector() {
    // בדיקה אם כבר הוספנו את הכפתור
    if (document.getElementById('mobile-day-selector')) return;

    console.log("Adding fixed day selector button");

    // יצירת כפתור בחירת יום
    const daySelectorButton = document.createElement('button');
    daySelectorButton.id = 'mobile-day-selector';
    daySelectorButton.innerHTML = '📅';
    daySelectorButton.className = 'mobile-menu-button';

    // הוספת סגנון
    const style = document.createElement('style');
    style.textContent = `
    .mobile-menu-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #e53935;
        color: white;
        font-size: 24px;
        border: none;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    .mobile-menu-button:active {
        transform: scale(0.95);
    }

    .days-menu {
        position: fixed;
        bottom: 85px;
        right: 20px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        padding: 8px;
        z-index: 999;
        max-height: 70vh;
        overflow-y: auto;
        transform: scale(0);
        transform-origin: bottom right;
        transition: transform 0.2s ease-out;
        direction: rtl;
        min-width: 250px;
        max-width: 90vw;
    }

    .days-menu.open {
        transform: scale(1);
    }

    .days-menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .days-menu li {
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        font-weight: bold;
        cursor: pointer;
        border-radius: 8px;
        margin: 3px 0;
        transition: background-color 0.2s;
    }

    .days-menu li:hover {
        background-color: #f8f8f8;
    }

    .days-menu li:last-child {
        border-bottom: none;
    }

    .days-menu li.active {
        background-color: #f0f0f0;
        color: #e53935;
        border-right: 3px solid #e53935;
    }

    .days-menu h3 {
        margin: 0 0 10px 0;
        padding: 10px;
        text-align: center;
        border-bottom: 1px solid #eee;
        color: #e53935;
        font-size: 16px;
    }
    `;
    document.head.appendChild(style);

    // יצירת תפריט בחירת ימים
    const daysMenu = document.createElement('div');
    daysMenu.className = 'days-menu';
    daysMenu.innerHTML = '<h3>בחר יום במסלול</h3><ul id="days-list"></ul>';

    // הוספה לגוף המסמך
    document.body.appendChild(daySelectorButton);
    document.body.appendChild(daysMenu);

    // מאזין לחיצה להצגת התפריט
    daySelectorButton.addEventListener('click', function(e) {
        e.stopPropagation();

        // מילוי התפריט בימים הקיימים
        fillDaysMenu();

        // הצגת או הסתרת התפריט
        daysMenu.classList.toggle('open');
    });

    // סגירת התפריט בלחיצה מחוץ לתפריט
    document.addEventListener('click', function(e) {
        if (!daysMenu.contains(e.target) && e.target !== daySelectorButton) {
            daysMenu.classList.remove('open');
        }
    });

    // פונקציה למילוי התפריט בימים
    function fillDaysMenu() {
        const daysList = document.getElementById('days-list');
        if (!daysList) return;

        // ניקוי הרשימה
        daysList.innerHTML = '';

        // בדיקה אם יש פונקציית גישה למצב האפליקציה
        let appStateData = null;

        if (typeof window.getAppState === 'function') {
            appStateData = window.getAppState();
            console.log("Got app state via function:", appStateData ? "success" : "failed");
        } else if (window.appState) {
            appStateData = window.appState;
            console.log("Accessing appState directly:", appStateData ? "success" : "failed");
        }

        // אם הצלחנו לקבל את מצב האפליקציה
        if (appStateData && appStateData.itineraryData && appStateData.itineraryData.days) {
            console.log("Filling days menu with data from app state");
            const days = appStateData.itineraryData.days;
            const currentIndex = appStateData.currentDayIndex;

            days.forEach((day, index) => {
                const li = document.createElement('li');
                li.textContent = `יום ${day.dayNumber}: ${day.title}`;

                // סימון היום הנוכחי
                if (index === currentIndex) {
                    li.className = 'active';
                }

                // מאזין לחיצה למעבר ליום הנבחר
                li.addEventListener('click', function() {
                    // בדיקה ותיקון במקרה של ערך לא תקין
                    if (index >= 0 && index < days.length) {
                        // עדכון היום הנוכחי באובייקט המצב
                        appStateData.currentDayIndex = index;
                        
                        // הפעלת הפונקציה להצגת היום הנוכחי
                        if (typeof window.showCurrentDay === 'function') {
                            window.showCurrentDay();
                        } else {
                            // עדכון ישיר של הממשק אם הפונקציה לא זמינה
                            updateDayInterface(day, index, days.length);
                        }
                        
                        // עדכון התפריט
                        const allItems = daysList.querySelectorAll('li');
                        allItems.forEach(item => item.classList.remove('active'));
                        li.classList.add('active');
                        
                        // סגירת התפריט
                        daysMenu.classList.remove('open');
                    }
                });

                daysList.appendChild(li);
            });
        } else {
            console.warn('appState לא זמין - מנסה לקבל נתונים בדרך חלופית');

            // ננסה לקרוא את המידע מהממשק
            try {
                // אם אין לנו נתונים באובייקט appState, נסה לחלץ את המידע מה-DOM
                const currentDayDisplay = document.getElementById('current-day-display');
                const dayText = currentDayDisplay ? currentDayDisplay.textContent : '';
                const match = dayText.match(/יום (\d+)/);

                if (match) {
                    const currentDay = parseInt(match[1]);
                    
                    // נוסיף כמה ימים מסביב ליום הנוכחי
                    for (let i = 1; i <= 9; i++) {
                        const li = document.createElement('li');
                        if (i === currentDay) li.className = 'active';
                        
                        li.textContent = `יום ${i}: נתוני מסלול לא זמינים`;
                        li.addEventListener('click', function() {
                            // שימוש בכפתורי הקודם/הבא לדילוג ליום המבוקש
                            const currentDayNum = parseInt(match[1]);
                            const diff = i - currentDayNum;
                            
                            if (diff !== 0) {
                                const clickButton = diff > 0 ? 
                                    document.getElementById('next-day') : 
                                    document.getElementById('prev-day');
                                
                                // לחיצות מרובות לפי הפרש הימים
                                for (let c = 0; c < Math.abs(diff); c++) {
                                    clickButton.click();
                                }
                            }
                            
                            // סגירת התפריט
                            daysMenu.classList.remove('open');
                        });
                        
                        daysList.appendChild(li);
                    }
                    return;
                }
            } catch (e) {
                console.error('שגיאה בחילוץ מידע מה-DOM:', e);
            }

            daysList.innerHTML = '<li>לא ניתן לטעון את רשימת הימים</li>';
        }
    }

    // פונקציה לעדכון הממשק ישירות כשפונקציית showCurrentDay אינה זמינה
    function updateDayInterface(day, index, totalDays) {
        console.log(`עדכון ישיר של היום במיקום ${index+1}/${totalDays}: ${day.title}`);

        // עדכון כותרת היום
        const dayDisplay = document.getElementById('current-day-display');
        if (dayDisplay) {
            dayDisplay.textContent = `יום ${day.dayNumber}: ${day.title}`;
        }

        // עדכון מונה הימים
        const dayCounter = document.getElementById('day-counter');
        if (dayCounter) {
            dayCounter.textContent = `${index + 1} / ${totalDays}`;
        }

        // עדכון כפתורי הקודם/הבא
        const prevButton = document.getElementById('prev-day');
        const nextButton = document.getElementById('next-day');

        if (prevButton) prevButton.disabled = index === 0;
        if (nextButton) nextButton.disabled = index === totalDays - 1;

        // עדכון רשימת המיקומים
        try {
            if (typeof window.renderItineraryList === 'function') {
                window.renderItineraryList(day);
            }
        } catch (e) {
            console.warn('שגיאה בעדכון רשימת המיקומים:', e);
        }

        // עדכון המפה
        try {
            if (window.map && typeof window.updateMapForDay === 'function') {
                window.updateMapForDay(day);
            }
        } catch (e) {
            console.warn('שגיאה בעדכון המפה:', e);
        }
    }
}

// פונקציה לקבלת יום במסלול
function getDayInfo(dayIndex) {
    let appStateData = null;

    if (typeof window.getAppState === 'function') {
        appStateData = window.getAppState();
    } else if (window.appState) {
        appStateData = window.appState;
    }

    if (!appStateData || !appStateData.itineraryData) return null;

    const days = appStateData.itineraryData.days;
    if (dayIndex >= 0 && dayIndex < days.length) {
        return days[dayIndex];
    }

    return null;
}

// הפעלת השיפורים למובייל בטעינת הדף ובנוסף בהשהייה קצרה
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth < 768) {
        // מתן זמן קצר להטענת האפליקציה
        setTimeout(function() {
            // בדיקה אם הכפתור עדיין לא קיים ואז הוספה שלו
            if (!document.getElementById('mobile-day-selector')) {
                console.log("Adding day selector in delayed init");
                addFixedDaySelector();
            }
            
            // תיקון הניווט במובייל
            fixMobileNavigation();
        }, 1000);
    }
});