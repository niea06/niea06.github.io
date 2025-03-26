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
          let departureTimeInMinutes = departureHour * 60 + departureMinute;
  
          // 24時間を超える場合の処理
          if (departureTimeInMinutes < currentTimeInMinutes) {
            departureTimeInMinutes += 24 * 60; // 24時間分を加算
          }
  
          if (departureTimeInMinutes > currentTimeInMinutes) {
            nextDepartureTime = departure;
            const diffMinutes = departureTimeInMinutes - currentTimeInMinutes;
            const remainingHours = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;
            remainingTime = `${remainingHours}時間${remainingMinutes}分`;
            break;
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
    updateBusInfo(timetable);
    setInterval(() => updateBusInfo(timetable), 60000); // 1分ごとに情報を更新
  }
  
  init();