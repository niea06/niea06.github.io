async function loadTimetable() {
    try {
        const response = await fetch('timetable.json');
        if (!response.ok) {
            throw new Error('時刻表データの読み込みに失敗しました');
        }
        const timetableData = await response.json();
        return timetableData;
    } catch (error) {
        console.error('時刻表データの読み込みエラー:', error);
        showError('時刻表データの読み込みに失敗しました。ページを更新してください。');
        return null;
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = '読み込み中...';
    document.body.insertBefore(loadingDiv, document.body.firstChild);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
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
    return day !== 0 && day !== 6;
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

function sortDepartures(departures) {
    return departures.sort((a, b) => {
        const [hourA, minuteA] = a.split(':').map(Number);
        const [hourB, minuteB] = b.split(':').map(Number);
        return (hourA * 60 + minuteA) - (hourB * 60 + minuteB);
    });
}

function updateTimetable(timetable, scheduleType) {
    if (!timetable) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (const busStop in timetable) {
        for (const route in timetable[busStop]) {
            const departures = sortDepartures([...timetable[busStop][route][scheduleType]]);
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
    if (!timetable) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    for (const busStop in timetable) {
        for (const route in timetable[busStop]) {
            const departures = sortDepartures([...timetable[busStop][route][scheduleType]]);
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
        showLoading();
        const timetable = await loadTimetable();
        hideLoading();

        if (!timetable) {
            return;
        }

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
        
        // 30秒ごとに情報を更新
        setInterval(updateDisplay, 30000);
    } catch (error) {
        console.error('エラーが発生しました:', error);
        showError('予期せぬエラーが発生しました。ページを更新してください。');
    }
}

init();