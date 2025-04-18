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
      <div class="itinerary-actions">
          <a href="#" class="nav-link return-nav">
              <img src="icons/navigation.svg" alt="ניווט" width="18" height="18">
              ניווט למלון
          </a>
      </div>
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
  
  // הוספת אירוע לחיצה לכפתור הניווט למלון
  const returnNavButton = returnItem.querySelector('.return-nav');
  if (returnNavButton) {
      returnNavButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openNavigation({
              coordinates: [46.6279, 8.0324],
              title: "המלון - Grindelwald"
          });
      });
  }
  
  itineraryList.appendChild(returnItem);
  
  // שיפור נראות ותגובתיות בגרסת מובייל
  enhanceMobileListItems();
}

// שיפור נראות הפריטים במובייל
function enhanceMobileListItems() {
    // בדיקה אם המכשיר הוא מובייל
    if (window.innerWidth >= 768) return;
    
    // הוספת סגנון משופר לפריטי הרשימה
    const items = document.querySelectorAll('.itinerary-item');
    items.forEach(item => {
        // הגדלת הפריט עבור נגיעה נוחה יותר
        item.style.padding = '15px';
        item.style.marginBottom = '12px';
        
        // שיפור הצללה ועיצוב
        item.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        item.style.borderRadius = '10px';
        
        // שיפור כפתור הניווט
        const navLink = item.querySelector('.nav-link');
        if (navLink) {
            navLink.style.display = 'flex';
            navLink.style.alignItems = 'center';
            navLink.style.justifyContent = 'center';
            navLink.style.padding = '10px';
            navLink.style.backgroundColor = '#e53935';
            navLink.style.color = 'white';
            navLink.style.borderRadius = '8px';
            navLink.style.fontWeight = 'bold';
            navLink.style.textDecoration = 'none';
            navLink.style.margin = '10px 0 0 0';
            
            // הוספת אייקון ניווט אם חסר
            if (!navLink.querySelector('img')) {
                const navigationIcon = document.createElement('span');
                navigationIcon.textContent = '🧭 ';
                navigationIcon.style.marginLeft = '5px';
                navLink.prepend(navigationIcon);
            }
        }
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
  
  // וידוא שיש קואורדינטות
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    console.error("Invalid location data for navigation");
    return;
  }
  
  const [lat, lng] = location.coordinates;
  
  if (isMobile) {
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
  } else {
    // במחשב נפתח ישירות בגוגל מפות
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
}

// הפיכת הפונקציה לגלובלית
window.openNavigation = openNavigation;
// הפיכת פונקציית renderItineraryList לגלובלית
window.renderItineraryList = renderItineraryList;