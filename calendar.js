// ====== 数据初始化 ======
let moodData = JSON.parse(localStorage.getItem("moodData") || "{}");
let currentViewDate = new Date(); 
let selectedDateStr = ""; 

const emojis = ['😊', '😐', '☹️', '😡', '😴', '💪'];
let selectedEmoji = "";

document.addEventListener("DOMContentLoaded", () => {
    initEmojiSelector();
    renderCalendar();

    document.getElementById("prevBtn").onclick = () => changeMonth(-1);
    document.getElementById("nextBtn").onclick = () => changeMonth(1);
    document.getElementById("todayBtn").onclick = goToToday;

    document.getElementById("stressLevel").oninput = (e) => {
        document.getElementById("stressVal").innerText = e.target.value;
    };

    document.getElementById("saveBtn").onclick = saveMood;
});

function initEmojiSelector() {
    const container = document.getElementById("emojiOptions");
    emojis.forEach(e => {
        const btn = document.createElement("button");
        btn.className = "emoji-btn";
        btn.innerText = e;
        btn.onclick = () => {
            selectedEmoji = e;
            document.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        };
        container.appendChild(btn);
    });
}

function changeMonth(step) {
    currentViewDate.setMonth(currentViewDate.getMonth() + step);
    renderCalendar();
}

function goToToday() {
    currentViewDate = new Date();
    const todayStr = getFormattedDate(currentViewDate);
    renderCalendar();
    selectDate(todayStr); 
}

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    const monthDisplay = document.getElementById("monthDisplay");
    calendar.innerHTML = "";

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentViewDate.toLocaleString('en-US', { month: 'long' });

    monthDisplay.innerText = `${monthName} ${year}`;

    // 添加星期标题
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const div = document.createElement("div");
        div.className = "calendar-header";
        div.innerText = day;
        calendar.appendChild(div);
    });

    // 添加上个月的空白格子
    for (let i = 0; i < firstDayIndex; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    const today = new Date();
    const todayStr = getFormattedDate(today);

    // 添加本月日期
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";

        // 如果是选中日期，添加active类
        if (dateStr === selectedDateStr) cell.classList.add("active");
        // 如果是今天，添加today类
        if (dateStr === todayStr) cell.classList.add("today");

        let content = `<span class="day-num">${d}</span>`;
        if (moodData[dateStr] && moodData[dateStr].emoji) {
            content += `<div class="day-mood">${moodData[dateStr].emoji}</div>`;
        }

        cell.innerHTML = content;
        cell.onclick = () => selectDate(dateStr);
        calendar.appendChild(cell);
    }
}

function selectDate(dateStr) {
    selectedDateStr = dateStr;
    document.getElementById("displayDate").innerText = dateStr;

    const entry = moodData[dateStr] || { emoji: "", stress: 5, note: "" };

    selectedEmoji = entry.emoji;
    document.getElementById("stressLevel").value = entry.stress;
    document.getElementById("stressVal").innerText = entry.stress;
    document.getElementById("dailyNote").value = entry.note;

    // 更新选中的emoji按钮
    document.querySelectorAll(".emoji-btn").forEach(btn => {
        btn.classList.toggle("selected", btn.innerText === selectedEmoji);
    });

    renderCalendar(); // 重新渲染日历以更新选中状态
}

function saveMood() {
    if (!selectedDateStr) {
        alert("Please select a day on the calendar first!");
        return;
    }

    if (!selectedEmoji) {
        alert("Please select an emoji!");
        return;
    }

    moodData[selectedDateStr] = {
        emoji: selectedEmoji,
        stress: document.getElementById("stressLevel").value,
        note: document.getElementById("dailyNote").value
    };

    localStorage.setItem("moodData", JSON.stringify(moodData));
    alert("Mood recorded for " + selectedDateStr);
    renderCalendar();
}

function getFormattedDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
