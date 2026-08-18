const words = [
    "Ütü", "Çaydanlık", "Helikopter", "Gözlük", "Muz", "Hendekteki Yalnız Berat...", 
    "Bilgisayar", "Uçak", "Kılıç", "Gitar", "Balık", "Ağaç", "Twerk Atan Musi", 
    "Araba", "Ay", "Güneş", "Şemsiye", "Pizza", "Kalem", "Kürt", "Ön Kaldıran Berat", 
    "Pipi", "Taşşak", "Kaşar", "Seks", "Ters Düz", "Lahmacun", "Masaya Dayayan Selim", 
    "Kel", "Salatalık Turşusu", "Gizli Ajan", "Zengin Fakir", "31 Çeken Selim", 
    "Uçan İnek", "Deli Doktoru", "Süper Kahraman", "Tofaş", "Dildo",
    "Tavuk", "Görünmez Adam", "Zombi İstilası", "Bozuk Para", "Köpek Gören Mushab, 
    "Kırmızı Biber", "Sokak Kedisi", "Hızlı Tren", "Kırık Kalp", "Hayalet Avcısı"
];

let playerName = "";
let totalRounds = 5;
let roundTime = 45;
let totalPlayers = 3; // Varsayılan 3 kişi
let currentRound = 1;
let currentWord = "";
let totalScore = 0;
let timeLeft = 45;
let timerInterval;

// Oylama Değişkenleri
let currentJuryIndex = 1;
let roundScores = [];

// Çizim Tahtası Değişkenleri
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = '#0f172a';

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
});
canvas.addEventListener('touchend', () => canvas.dispatchEvent(new MouseEvent('mouseup', {})));
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    let touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY }));
});

function startPosition(e) { painting = true; draw(e); }
function endPosition() { painting = false; ctx.beginPath(); }
function draw(e) {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function setColor(color, element) {
    ctx.strokeStyle = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function setSize(size) {
    ctx.lineWidth = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function startGame() {
    playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert("Lütfen önce oyuncu adını gir kanka!");
        return;
    }

    totalRounds = parseInt(document.getElementById('setting-rounds').value);
    roundTime = parseInt(document.getElementById('setting-time').value);
    totalPlayers = parseInt(document.getElementById('setting-players').value);
    
    currentRound = 1;
    totalScore = 0;

    startNewRound();
}

function startNewRound() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    document.getElementById('round-indicator').textContent = `Tur: ${currentRound}/${totalRounds}`;
    
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('target-word').textContent = `Kelime: ${currentWord}`;

    clearCanvas();
    startTimer();
}

function startTimer() {
    timeLeft = roundTime;
    document.getElementById('timer').textContent = `⏱️ ${timeLeft}s`;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `⏱️ ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitDrawing();
        }
    }, 1000);
}

function submitDrawing() {
    clearInterval(timerInterval);
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('voting-screen').classList.remove('hidden');

    const previewCanvas = document.getElementById('previewCanvas');
    const pCtx = previewCanvas.getContext('2d');
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    pCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);

    currentJuryIndex = 1;
    roundScores = [];
    updateVotingPrompt();
}

function updateVotingPrompt() {
    let totalJuries = totalPlayers - 1;
    if (totalJuries < 1) totalJuries = 1;

    document.getElementById('voting-info').textContent = `Jüri Üyesi ${currentJuryIndex} / ${totalJuries} puan veriyor:`;
    document.getElementById('score-input').value = "";
    
    if (currentJuryIndex === totalJuries) {
        document.getElementById('vote-btn').textContent = "Puanı Kaydet & Ortalamayı Gör";
    } else {
        document.getElementById('vote-btn').textContent = "Puanı Kaydet & Sonraki Jüri";
    }
}

function submitScore() {
    let score = parseFloat(document.getElementById('score-input').value);
    if (isNaN(score) || score < 0 || score > 10) {
        alert("Lütfen 0 ile 10 arasında geçerli bir puan gir (Örn: 7.5)");
        return;
    }

    roundScores.push(score);
    let totalJuries = totalPlayers - 1;
    if (totalJuries < 1) totalJuries = 1;

    if (currentJuryIndex < totalJuries) {
        currentJuryIndex++;
        updateVotingPrompt();
    } else {
        let sum = roundScores.reduce((a, b) => a + b, 0);
        let averageScore = sum / roundScores.length;

        totalScore += averageScore;

        document.getElementById('voting-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');

        let nextBtnText = currentRound >= totalRounds ? "🏆 Oyunu Bitir & Sonucu Gör" : "Sonraki Tura Geç";
        document.getElementById('next-btn').textContent = nextBtnText;

        document.getElementById('result-text').innerHTML = `
            👤 Çizen Oyuncu: <b>${playerName}</b><br>
            🎯 Tamamlanan Tur: <b>${currentRound} / ${totalRounds}</b><br>
            📝 Çizilen Kelime: <b>${currentWord}</b><br>
            👥 Jüri Puanları: [ <b>${roundScores.join(' - ')}</b> ]<br>
            ⭐ <b>Bu Turun Ortalama Puanı: ${averageScore.toFixed(1)} / 10</b><br><br>
            📊 Genel Toplam Skor: <b>${totalScore.toFixed(1)} Puan</b>
        `;
    }
}

function nextRound() {
    if (currentRound >= totalRounds) {
        alert(`Oyun bitti ${playerName}! Toplam Skorun: ${totalScore.toFixed(1)}`);
        location.reload();
    } else {
        currentRound++;
        startNewRound();
    }
}
