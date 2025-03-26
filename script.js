async function loadTimetable() {
    const response = await fetch('timetable.json'); // 時刻表のJSONファイルを読み込む
    const timetableData = await response.json();
    return timetableData;
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
  
        for (const departure of departures) {
          const [departureHour, departureMinute] = departure.split(':').map(Number);
          const departureTimeInMinutes = departureHour * 60 + departureMinute;
  
          if (departureTimeInMinutes > currentTimeInMinutes) {
            nextDepartureTime = departure;
            const diffMinutes = departureTimeInMinutes - currentTimeInMinutes;
            const remainingHours = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;
            remainingTime = `<span class="math-inline">\{remainingHours\}時間</span>{remainingMinutes}分`;
            break;
          }
        }
  
        const nextDepartureElementId = `bus-stop-<span class="math-inline">\{busStop\.toLowerCase\(\)\.replace\(' ', '\-'\)\}\-route\-</span>{route.toLowerCase().replace(' ', '-')}-next`;
        const remainingTimeElementId = `bus-stop-<span class="math-inline">\{busStop\.toLowerCase\(\)\.replace\(' ', '\-'\)\}\-route\-</span>{route.toLowerCase().replace(' ', '-')}-remaining`;
  
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
    updateBusInfo(timetable);
    setInterval(() => updateBusInfo(timetable), 60000); // 1分ごとに情報を更新
  }
  
  init();