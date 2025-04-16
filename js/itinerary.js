// הצגת רשימת נקודות המסלול ליום מסוים
function renderItineraryList(day) {
    const itineraryList = document.getElementById('itinerary-list');
    itineraryList.innerHTML = '';
    
    day.locations.forEach(location => {
    const listItem = document.createElement('li');
    listItem.className = 'itinerary-item';
    listItem.dataset.id = location.id;
    
    const locationTypeClass = location.type || 'default';
    
    listItem.innerHTML = `
        <div class="itinerary-header">
        <span class="location-icon ${locationTypeClass}"></span>
        <span class="itinerary-time">${location.time}</span>
        <span class="itinerary-title">${location.title}</span>
        </div>
        <p class="itinerary-description">${location.description}</p>
        <div class="itinerary-actions">
        <a href="#" class="nav-link" data-id="${location.id}">
            <img src="icons/navigation.svg" alt="ניווט" width="18" height="18">
            ניווט
        </a>
        </div>
    `;
    
      // הוספת אירוע לחיצה שיתמקד על הנקודה במפה
    listItem.addEventListener('click', () => {
        focusLocationOnMap(location);
    });
    
      // הוספת אירוע לחיצה לכפתור הניווט
    const navButton = listItem.querySelector('.nav-link');
    navButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // מניעת הפעלת האירוע של האלמנט המכיל
        openNavigation(location);
    });
    
    itineraryList.appendChild(listItem);
    });
}

  // פונקציה להדגשת פריט מסלול ברשימה
function highlightItineraryItem(locationId) {
    // הסרת הדגשות קודמות
    document.querySelectorAll('.itinerary-item').forEach(item => {
    item.classList.remove('highlighted');
    });
    
    // הדגשת הפריט הנוכחי
    const item = document.querySelector(`.itinerary-item[data-id="${locationId}"]`);
    if (item) {
    item.classList.add('highlighted');
    
      // גלילה לפריט אם הוא לא נראה
    const container = document.getElementById('itinerary-container');
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.offsetHeight;
    
    if (itemTop < containerTop || itemBottom > containerBottom) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    }
}

  // פתיחת אפליקציית ניווט
function openNavigation(location) {
    // בדיקה האם המשתמש במכשיר נייד
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const [lat, lng] = location.coordinates;
    
    if (isMobile) {
      // יצירת שכבת הצללה
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    overlay.style.display = 'block';
    
      // יצירת תפריט בחירה
    const navOptions = document.createElement('div');
    navOptions.className = 'nav-options';
    navOptions.innerHTML = `
        <div class="nav-title">בחר אפליקציית ניווט:</div>
        <div class="nav-buttons">
        <button class="nav-google">Google Maps</button>
        <button class="nav-waze">Waze</button>
        </div>
    `;
    
    document.body.appendChild(navOptions);
    
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
    overlay.addEventListener('click', cleanup);
    
    function cleanup() {
        document.body.removeChild(overlay);
        document.body.removeChild(navOptions);
    }
    } else {
      // במחשב נפתח ישירות בגוגל מפות
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
}