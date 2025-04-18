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