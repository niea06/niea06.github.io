async function loadTimetable() {
    const response = await fetch('timetable.json'); // 時刻表のJSONファイルを読み込む
    const timetableData = await response.json();
    return timetableData;
  }
  
  function updateCurrentTime() {
    const now = new Date();
    const currentTimeElement = document.getElementById('current-time');
    if (currentTimeElement) {
        currentTimeElement.textContent = now.toLocaleTimeString('ja-JP');
    }
  }
  
  function updateTimetable(timetable) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
    for (const busStop in timetable) {
      for (const route in timetable[busStop]) {
        const departures = timetable[busStop][route];
        const busStopKebabCase = busStop.replace(/ /g, '-');
        const routeKebabCase = route.replace(/ /g, '-');
        const timetableElementId = `timetable-${busStopKebabCase}-route-${routeKebabCase}`;
        const timetableElement = document.getElementById(timetableElementId);
  
        if (timetableElement) {
          timetableElement.innerHTML = '';
          departures.forEach(departure => {
            const [departureHour, departureMinute] = departure.split(':').map(Number);
            const departureTimeInMinutes = departureHour * 60 + departureMinute;
            const span = document.createElement('span');
            span.textContent = departure;
            
            if (departureTimeInMinutes < currentTimeInMinutes) {
              span.classList.add('past');
            } else if (departureTimeInMinutes === currentTimeInMinutes) {
              span.classList.add('next');
            }
            
            timetableElement.appendChild(span);
          });
        }
      }
    }
  }
  
  function updateBusInfo(timetable) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
    for (const busStop in timetable) {
      for (const route in timetable[busStop]) {
        const departures = timetable[busStop][route];
        let nextDepartureTime = null;
        let remainingTime = null;
        let minDiff = Infinity;
  
        for (const departure of departures) {
          const [departureHour, departureMinute] = departure.split(':').map(Number);
          let departureTimeInMinutes = departureHour * 60 + departureMinute;
  
          // 現在時刻より前の時刻は24時間後の時刻として扱う
          if (departureTimeInMinutes <= currentTimeInMinutes) {
            departureTimeInMinutes += 24 * 60;
          }
  
          const diff = departureTimeInMinutes - currentTimeInMinutes;
          if (diff < minDiff) {
            minDiff = diff;
            nextDepartureTime = departure;
            const remainingHours = Math.floor(diff / 60);
            const remainingMinutes = diff % 60;
            remainingTime = `${remainingHours}時間${remainingMinutes}分`;
          }
        }
  
        const busStopKebabCase = busStop.replace(/ /g, '-');
        const routeKebabCase = route.replace(/ /g, '-');
        const nextDepartureElementId = `bus-stop-${busStopKebabCase}-route-${routeKebabCase}-next`;
        const remainingTimeElementId = `bus-stop-${busStopKebabCase}-route-${routeKebabCase}-remaining`;
  
  
        const nextDepartureElement = document.getElementById(nextDepartureElementId);
        const remainingTimeElement = document.getElementById(remainingTimeElementId);
  
        if (nextDepartureElement) {
          nextDepartureElement.textContent = nextDepartureTime || '本日の運行は終了しました';
        }
        if (remainingTimeElement) {
          remainingTimeElement.textContent = remainingTime || '';
        }
      }
    }
  }
  
  async function init() {
    const timetable = await loadTimetable();
    updateCurrentTime();
    updateBusInfo(timetable);
    updateTimetable(timetable);
    
    // 1分ごとに情報を更新
    setInterval(() => {
        updateCurrentTime();
        updateBusInfo(timetable);
        updateTimetable(timetable);
    }, 60000);
  }
  
  init();