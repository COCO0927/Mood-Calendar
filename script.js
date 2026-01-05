// ====== 数据初始化 ======
let moodData = JSON.parse(localStorage.getItem("moodData") || "{}");
let currentViewDate = new Date(); // 当前浏览的月份
let selectedDateStr = ""; // 当前选中的日期（YYYY-MM-DD）

const emojis = ['😊', '😐', '☹️', '😡', '😴', '💪'];
let selectedEmoji = "";

// ====== 页面加载执行 ======
document.addEventListener("DOMContentLoaded", () => {
    initEmojiSelector();
    renderCalendar();

    // 绑定导航按钮
    document.getElementById("prevBtn").onclick = () => changeMonth(-1);
    document.getElementById("nextBtn").onclick = () => changeMonth(1);
    document.getElementById("todayBtn").onclick = goToToday;
    
    // 绑定压力条数值显示
    document.getElementById("stressLevel").oninput = (e) => {
        document.getElementById("stressVal").innerText = e.target.value;
    };

    // 绑定保存按钮
    document.getElementById("saveBtn").onclick = saveMood;
});

// 初始化 Emoji 选择按钮
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

// 切换月份
function changeMonth(step) {
    currentViewDate.setMonth(currentViewDate.getMonth() + step);
    renderCalendar();
}

// 返回今天
function goToToday() {
    currentViewDate = new Date();
    const todayStr = getFormattedDate(currentViewDate);
    renderCalendar();
    selectDate(todayStr); // 自动选中今天
}

// 渲染日历核心函数
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    const monthDisplay = document.getElementById("monthDisplay");
    calendar.innerHTML = "";

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    // 计算日期
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentViewDate.toLocaleString('en-US', { month: 'long' });
    
    monthDisplay.innerText = `${monthName} ${year}`;

    // 1. 渲染星期表头
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const div = document.createElement("div");
        div.className = "calendar-header";
        div.innerText = day;
        calendar.appendChild(div);
    });

    // 2. 渲染空白格子 (对齐周几)
    for (let i = 0; i < firstDayIndex; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    // 3. 渲染每一天
    const today = new Date();
    const todayStr = getFormattedDate(today);

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        // 状态标记
        if (dateStr === selectedDateStr) cell.classList.add("active");
        if (dateStr === todayStr) cell.classList.add("today");

        // 内容：数字 + 表情
        let content = `<span class="day-num">${d}</span>`;
        if (moodData[dateStr] && moodData[dateStr].emoji) {
            content += `<div class="day-mood">${moodData[dateStr].emoji}</div>`;
        }

        cell.innerHTML = content;
        cell.onclick = () => selectDate(dateStr);
        calendar.appendChild(cell);
    }
}

// 点击日期选择逻辑
function selectDate(dateStr) {
    selectedDateStr = dateStr;
    document.getElementById("displayDate").innerText = dateStr;
    
    // 从缓存中读取该日期的记录，如果没有则重置界面
    const entry = moodData[dateStr] || { emoji: "", stress: 5, note: "" };
    
    selectedEmoji = entry.emoji;
    document.getElementById("stressLevel").value = entry.stress;
    document.getElementById("stressVal").innerText = entry.stress;
    document.getElementById("dailyNote").value = entry.note;
    
    // 更新左侧 Emoji 按钮的高亮状态
    document.querySelectorAll(".emoji-btn").forEach(btn => {
        btn.classList.toggle("selected", btn.innerText === selectedEmoji);
    });

    renderCalendar(); // 刷新日历以显示 active 边框
}

// 保存逻辑
function saveMood() {
    if (!selectedDateStr) {
        alert("Please select a day on the calendar first!");
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

// 辅助函数：格式化日期为 YYYY-MM-DD
function getFormattedDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
