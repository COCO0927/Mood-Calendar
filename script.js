// ====== 数据结构 ======
// 使用对象存储，Key 为日期字符串 'YYYY-MM-DD'
let moodData = JSON.parse(localStorage.getItem("moodData") || "{}");

let currentViewDate = new Date(); // 正在浏览的月
let selectedDateStr = ""; // 当前选中的日期

const emojis = ['😊', '😐', '☹️', '😡', '😴', '💪'];
let selectedEmoji = "";

// ====== 初始化 ======
document.addEventListener("DOMContentLoaded", () => {
    initEmojiSelector();
    renderCalendar();

    document.getElementById("prevBtn").onclick = () => changeMonth(-1);
    document.getElementById("nextBtn").onclick = () => changeMonth(1);
    document.getElementById("todayBtn").onclick = () => { currentViewDate = new Date(); renderCalendar(); };
    document.getElementById("stressLevel").oninput = (e) => document.getElementById("stressVal").innerText = e.target.value;
    document.getElementById("saveBtn").onclick = saveMood;
});

// 生成 Emoji 选项
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

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    const monthDisplay = document.getElementById("monthDisplay");
    calendar.innerHTML = "";

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentViewDate.toLocaleString('en-US', { month: 'long' });
    monthDisplay.innerText = `${monthName} ${year}`;

    // 星期头
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
        const h = document.createElement("div"); h.className = "calendar-header"; h.innerText = d;
        calendar.appendChild(h);
    });

    // 空格子
    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement("div"));
    }

    // 日期格子
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        if (dateStr === selectedDateStr) cell.classList.add("active");
        if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
            cell.classList.add("today");
        }

        cell.innerHTML = `<span class="day-num">${d}</span>`;
        
        // 显示已存的心情
        if (moodData[dateStr]) {
            const moodIcon = document.createElement("div");
            moodIcon.className = "day-mood";
            moodIcon.innerText = moodData[dateStr].emoji;
            cell.appendChild(moodIcon);
        }

        cell.onclick = () => selectDate(dateStr);
        calendar.appendChild(cell);
    }
}

function selectDate(dateStr) {
    selectedDateStr = dateStr;
    document.getElementById("displayDate").innerText = dateStr;
    
    // 加载已有数据
    const data = moodData[dateStr] || { emoji: "", stress: 5, note: "" };
    selectedEmoji = data.emoji;
    document.getElementById("stressLevel").value = data.stress;
    document.getElementById("stressVal").innerText = data.stress;
    document.getElementById("dailyNote").value = data.note;
    
    // 更新 Emoji 按钮状态
    document.querySelectorAll(".emoji-btn").forEach(b => {
        b.classList.toggle("selected", b.innerText === selectedEmoji);
    });

    renderCalendar(); // 刷新选中状态
}

function saveMood() {
    if (!selectedDateStr) return alert("Please select a day first!");
    
    moodData[selectedDateStr] = {
        emoji: selectedEmoji,
        stress: document.getElementById("stressLevel").value,
        note: document.getElementById("dailyNote").value
    };

    localStorage.setItem("moodData", JSON.stringify(moodData));
    alert("Mood saved for " + selectedDateStr);
    renderCalendar();
}
