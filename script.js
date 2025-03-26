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
  
  function isWeekday() {
    const now = new Date();
    const day = now.getDay();
    return day !== 0 && day !== 6; // 0: 日曜, 6: 土曜
  }
  
  function updateScheduleTypeButtons(scheduleType) {
    const weekdayBtn = document.getElementById('weekday-btn');
    const holidayBtn = document.getElementById('holiday-btn');
    
    if (scheduleType === '平日') {
        weekdayBtn.classList.add('active');
        holidayBtn.classList.remove('active');
    } else {
        weekdayBtn.classList.remove('active');
        holidayBtn.classList.add('active');
    }
  }
  
  function updateTimetable(timetable, scheduleType) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
    for (const busStop in timetable) {
      for (const route in timetable[busStop]) {
        const departures = timetable[busStop][route][scheduleType];
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
            }
            
            timetableElement.appendChild(span);
          });
        }
      }
    }
  }
  
  function updateBusInfo(timetable, scheduleType) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
    for (const busStop in timetable) {
      for (const route in timetable[busStop]) {
        const departures = timetable[busStop][route][scheduleType];
        let nextDepartureTime = null;
        let remainingTime = null;
        let minDiff = Infinity;
  
        for (const departure of departures) {
          const [departureHour, departureMinute] = departure.split(':').map(Number);
          let departureTimeInMinutes = departureHour * 60 + departureMinute;
  
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
    try {
        const timetable = await loadTimetable();
        let currentScheduleType = isWeekday() ? '平日' : '休日';
        
        function updateDisplay() {
            updateCurrentTime();
            updateScheduleTypeButtons(currentScheduleType);
            updateBusInfo(timetable, currentScheduleType);
            updateTimetable(timetable, currentScheduleType);
        }

        // 初期表示
        updateDisplay();

        // 平日・休日切り替えボタンのイベントリスナー
        document.getElementById('weekday-btn').addEventListener('click', () => {
            currentScheduleType = '平日';
            updateDisplay();
        });

        document.getElementById('holiday-btn').addEventListener('click', () => {
            currentScheduleType = '休日';
            updateDisplay();
        });
        
        // 1分ごとに情報を更新
        setInterval(updateDisplay, 60000);
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
  }
  
  init();