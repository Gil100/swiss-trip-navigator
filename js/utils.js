// פונקציה לבדיקה אם התאריך הנוכחי נמצא בטווח של יום מסוים
function isCurrentDate(dateStr) {
    const today = new Date();
    const date = new Date(dateStr);
    
    return today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate();
}

// פונקציה לחישוב היום הנוכחי של הטיול לפי התאריכים
function getCurrentDayIndex(days) {
    // בדיקה אם היום הנוכחי נמצא בטווח הטיול
    for (let i = 0; i < days.length; i++) {
        if (isCurrentDate(days[i].date)) {
            return i;
        }
    }
    
    // אם לא מצאנו את היום הנוכחי, נחזיר את היום הקרוב ביותר
    const today = new Date();
    let closestDayIndex = 0;
    let minDiff = Number.MAX_SAFE_INTEGER;
    
    days.forEach((day, index) => {
        const date = new Date(day.date);
        const diff = Math.abs(date.getTime() - today.getTime());
        
        if (diff < minDiff) {
            minDiff = diff;
            closestDayIndex = index;
        }
    });
    
    return closestDayIndex;
}

// פונקציה להוספת קישור ניווט
function getNavigationLink(coordinates, platform = 'google') {
    const [lat, lng] = coordinates;
    
    if (platform === 'google') {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (platform === 'waze') {
        return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    }
    
    return '';
}

// פונקציה להמרת תאריך למחרוזת מותאמת
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// פונקציה לבדיקה אם מכשיר הוא נייד
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// פונקציה ליצירת אייקון טקסט כברירת מחדל
function createTextIcon(text, bgColor = '#e53935') {
    const div = document.createElement('div');
    div.style.backgroundColor = bgColor;
    div.style.color = 'white';
    div.style.width = '32px';
    div.style.height = '32px';
    div.style.borderRadius = '50%';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.fontWeight = 'bold';
    div.textContent = text;
    
    return div;
}