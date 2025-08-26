// --- Utils ---
function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
function norm(s) {
	return s.trim().replace(/\s+/g, " ");
}
// Accept either exact string(s) or a custom validator
function makeQ(prompt, answersOrValidator) {
	if (typeof answersOrValidator === "function") {
		return { q: prompt, validate: answersOrValidator };
	}
	const acceptable = answersOrValidator.map(norm);
	return { q: prompt, validate: (input) => acceptable.includes(norm(input)) };
}

// --- Questions ---
const baseQuestions = [
	// CLI
	makeQ("CLI: Visa nuvarande katalogs fullständiga sökväg", ["pwd"]),
	makeQ("CLI: Byt katalog", ["cd"]),
	makeQ("CLI: Lista filer och kataloger", ["ls"]),
	makeQ("CLI: Skapa ny katalog", ["mkdir"]),
	makeQ("CLI: Skapa en tom fil", ["touch"]),
	makeQ("CLI: Ta bort filer/kataloger rekursivt utan att fråga", ["rm -rf"]),
	makeQ("CLI: Flytta eller döp om fil/katalog", ["mv"]),
	makeQ("CLI: Skriv ut innehållet i en fil", ["cat"]),
	makeQ("CLI: Rensa terminalen", ["clear"]),
	makeQ("CLI: Kör som administratör (Super User Do)", ["sudo"]),

	// Git
	makeQ("Git: Klona ett repo från GitHub", ["git clone"]),
	makeQ("Git: Visa status", ["git status"]),
	makeQ("Git: Lägg till ALLT i staging area", ["git add ."]),
	makeQ('Git: Skapa en commit med ett meddelande (använd -m "Kommentar")', (input) => {
		const s = norm(input);
		return /^git commit -m ".*"$/.test(s) || /^git commit -m '.*'$/.test(s);
	}),
	makeQ("Git: Ladda upp commits till remote", ["git push"]),
	makeQ("Git: Hämta och sammanfoga senaste ändringar", ["git pull"]),
	makeQ("Git: Visa commit-historik", ["git log"]),
	makeQ("Git: Byt till en annan branch (name-of-branch)", (input) => {
		return /^git checkout [^\s]+$/.test(norm(input));
	}),
	makeQ("Git: Skapa ny branch och byt till den (name-of-branch)", (input) => {
		return /^git checkout -b [^\s]+$/.test(norm(input));
	}),

	// Vim
	makeQ("Vim: Öppna en fil med vim (filnamn)", (input) => {
		const s = norm(input);
		return /^vim (\S+|"[^"]+"|'[^']+')$/.test(s);
	}),
	makeQ("Vim: Gå in i insert-mode", ["i"]),
	makeQ("Vim: Gå ur insert-mode", ["esc", "ESC"]),
	makeQ("Vim: Spara och stäng fil", [":wq"]),
	makeQ("Vim: Stäng fil utan att spara", [":q!"]),
];

// --- State ---
let questions = [];
let score = 0;
let index = 0;

// --- DOM ---
const outputEl = document.getElementById("output");
const formEl = document.getElementById("form");
const inputEl = document.getElementById("answerInput");
const questionLabel = document.getElementById("questionLabel");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const skipBtn = document.getElementById("skipBtn");
const restartBtn = document.getElementById("restartBtn");

function println(text, cls) {
	const line = document.createElement("div");
	line.className = "line" + (cls ? " " + cls : "");
	line.textContent = text;
	outputEl.appendChild(line);
	outputEl.scrollTop = outputEl.scrollHeight;
}

function setQuestion() {
	if (index >= questions.length) {
		scoreEl.textContent = `Poäng: ${score}`;
		println(`🎉 Klart! Du fick ${score}/${questions.length} rätt.`, "ok");
		questionLabel.textContent = "Slut på frågor";
		inputEl.disabled = true;
		return;
	}
	questionLabel.textContent = questions[index].q;
	progressEl.textContent = `Fråga ${index + 1}/${questions.length}`;
	scoreEl.textContent = `Poäng: ${score}`;
	inputEl.value = "";
	inputEl.focus();
}

function submitAnswer(value, isSkip = false) {
	const { q, validate } = questions[index];
	if (isSkip) {
		println(`> ${value}`);
		println("❌ Fel.\n", "err");
		index++;
		setQuestion();
		return;
	}

	if (validate(value)) {
		println(`> ${value}`);
		println("✅ Rätt!\n", "ok");
		score++;
		index++;
		setQuestion();
	} else {
		println(`> ${value}`);
		println("❌ Fel.\n", "err");
		index++;
		setQuestion();
	}
}

function start() {
	questions = shuffle([...baseQuestions]);
	score = 0;
	index = 0;
    outputEl.innerHTML = `
    <div class="line">📖 Skriv det exakta kommandot. (Enter för att skicka)</div>
    <div class="line">Tips: Syntax räknas. Mellanslag, flaggor och citattecken! Katalog är ett annat ord för mapp.</div>
    <div class="line">Obs: Om frågan innehåller (filnamn) eller (branch-namn) ska du ersätta det med ett eget namn.</div>
    <div class="line">&nbsp;</div>
  `;
	inputEl.disabled = false;
	setQuestion();
}

// --- Events ---
formEl.addEventListener("submit", (e) => {
	e.preventDefault();
	const value = inputEl.value || "";
	submitAnswer(value);
});

skipBtn.addEventListener("click", () => {
	const value = inputEl.value || "(hoppa över)";
	submitAnswer(value, true);
});

restartBtn.addEventListener("click", start);

inputEl.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		inputEl.value = "";
	}
});

// Init
start();
