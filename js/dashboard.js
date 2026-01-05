import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyALG5rqXdMdJLVY3Sm9An4pmCCoflYUn7g",
    authDomain: "healmind-2025.firebaseapp.com",
    projectId: "healmind-2025",
    storageBucket: "healmind-2025.firebasestorage.app",
    messagingSenderId: "815736974240",
    appId: "1:815736974240:web:46d83a46fae313961612c5",
    measurementId: "G-Q113X0VYS2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charts
let historyChart, weeklyChart;

function getStatusColor(prob) {
    if (prob < 30) return { label: 'Normal', text: 'SuccessText', glass: 'BadgeBase BadgeSuccess' };
    if (prob < 70) return { label: 'Moderate', text: 'WarningText', glass: 'BadgeBase BadgeWarning' };
    return { label: 'High Stress', text: 'DangerText', glass: 'BadgeBase BadgeDanger' };
}

function getAdvice(prob) {
    if (prob < 30) return "Stay focused, you're doing great!";
    if (prob < 70) return "Keep it up, you can handle this!";
    return "Take a breather, you got this!";
}

function initCharts() {
    const ctxHistory = document.getElementById('historyChart').getContext('2d');
    historyChart = new Chart(ctxHistory, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Stress %', data: [], borderColor: '#60a5fa', backgroundColor: 'rgba(96, 165, 250, 0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#94a3b8', maxRotation: 0 } }, y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } } } }
    });

    const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(ctxWeekly, {
        type: 'line',
        data: { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label:'Avg Stress %', data:[20,35,15,45,60,40,30], borderColor:'#60a5fa', backgroundColor:'rgba(255,255,255,0.02)', fill:true, tension:0.4, borderWidth:3, pointBackgroundColor:'#fff', pointRadius:4, pointHoverRadius:8, pointHoverBackgroundColor:'#60a5fa' }] },
        options: { responsive:true, maintainAspectRatio:false }
    });
}

function updateUI(items) {
    if(items.length===0) return;
    const currentItem = items[items.length-1];
    const statusInfo = getStatusColor(currentItem.prob);

    document.getElementById('status-label').textContent = statusInfo.label;
    document.getElementById('status-label').className = 'StatusLarge ' + statusInfo.text;

    document.getElementById('prob-value').textContent = Math.round(currentItem.prob)+'%';
    const probStatus = document.getElementById('prob-status');
    probStatus.textContent = currentItem.prob>70?'CRITICAL':'STABLE';
    probStatus.className = statusInfo.glass;

    const peakStress = Math.max(...items.map(d=>d.prob));
    document.getElementById('avg-value').textContent = Math.round(peakStress)+'%';
    document.getElementById('time-subtext').textContent = 'Live feed analysis: '+currentItem.time.toLocaleTimeString();
    document.getElementById('advice-text').textContent = getAdvice(currentItem.prob);

    historyChart.data.labels = items.map(d=>d.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));
    historyChart.data.datasets[0].data = items.map(d=>d.prob);
    historyChart.update('none');

    const today = new Date();
    const dayIndex = today.getDay();
    const realIndex = dayIndex===0?6:dayIndex-1;
    weeklyChart.data.datasets[0].data[realIndex] = currentItem.prob;
    weeklyChart.update();
}

initCharts();

const q = query(collection(db,"stress_predictions"));
onSnapshot(q,snapshot=>{
    let items=[];
    snapshot.forEach(doc=>{
        let data=doc.data();
        let timeValue = data.prediction_timestamp || data.timestamp || new Date();
        if(timeValue && typeof timeValue.toDate==='function') timeValue = timeValue.toDate();
        else timeValue=new Date(timeValue);

        let probValue = data.stress_probabilities?.class_1 || data.stress_probabilities?.['1'] || data.probability || 0;
        if(probValue<=1 && probValue>0) probValue*=100;
        items.push({id:doc.id,time:timeValue,prob:probValue});
    });
    if(items.length>0) items.sort((a,b)=>a.time-b.time);
    updateUI(items);
});

// Mood Diary Button
const moodBtn = document.getElementById("openMoodDiary");
if(moodBtn){
    moodBtn.addEventListener("click",()=>{window.location.href="mood-calendar.html";});
}
