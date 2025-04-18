// הצגת רשימת נקודות המסלול ליום מסוים
function renderItineraryList(day) {
  const itineraryList = document.getElementById('itinerary-list');
  itineraryList.innerHTML = '';
  
  // הוספת המלון כפריט ראשון
  const hotelItem = document.createElement('li');
  hotelItem.className = 'itinerary-item hotel-item';
  hotelItem.innerHTML = `
      <div class="itinerary-header">
          <span class="location-icon hotel"></span>
          <span class="itinerary-time">-</span>
          <span class="itinerary-title">המלון - Grindelwald</span>
      </div>
      <p class="itinerary-description">נקודת מוצא ליום ${day.dayNumber}: ${day.title}</p>
      <div class="itinerary-actions">
          <a href="#" class="nav-link hotel-nav">
              <img src="icons/navigation.svg" alt="ניווט" width="18" height="18">
              ניווט למלון
          </a>
      </div>
  `;
  
  // הוספת אירוע לחיצה שיתמקד על המלון במפה
  hotelItem.addEventListener('click', () => {
      const hotelCoordinates = [46.6279, 8.0324]; // Terrassenweg 104, 3818 Grindelwald
      focusLocationOnMap({
          coordinates: hotelCoordinates,
          title: "המלון - Grindelwald",
          description: "נקודת מוצא ליום " + day.dayNumber
      });
  });
  
  // הוספת אירוע לחיצה לכפתור הניווט למלון
  const hotelNavButton = hotelItem.querySelector('.hotel-nav');
  hotelNavButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openNavigation({
          coordinates: [46.6279, 8.0324],
          title: "המלון - Grindelwald"
      });
  });
  
  itineraryList.appendChild(hotelItem);
  
  // הוספת פריטי המסלול
  day.locations.forEach(location => {
      const listItem = document.createElement('li');
      listItem.className = 'itinerary-item';
      listItem.dataset.id = location.id;
      
      const locationTypeClass = location.type || 'default';
      
      // שיפור תצוגת פריט המסלול
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
  
  // הוספת מידע על חזרה למלון בסוף היום
  const returnItem = document.createElement('li');
  returnItem.className = 'itinerary-item return-item';
  returnItem.innerHTML = `
      <div class="itinerary-header">
          <span class="location-icon hotel"></span>
          <span class="itinerary-time">-</span>
          <span class="itinerary-title">חזרה למלון</span>
      </div>
      <p class="itinerary-description">סיום יום ${day.dayNumber}: ${day.title}</p>
  `;
  
  // הוספת אירוע לחיצה שיתמקד על המלון במפה
  returnItem.addEventListener('click', () => {
      const hotelCoordinates = [46.6279, 8.0324]; // Terrassenweg 104, 3818 Grindelwald
      focusLocationOnMap({
          coordinates: hotelCoordinates,
          title: "המלון - Grindelwald",
          description: "חזרה למלון בסוף היום"
      });
  });
  
  itineraryList.appendChild(returnItem);
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

// הפיכת הפונקציה לגלובלית
window.openNavigation = openNavigation;
// הפיכת פונקציית renderItineraryList לגלובלית
window.renderItineraryList = renderItineraryList;