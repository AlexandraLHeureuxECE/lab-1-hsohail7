const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const restartBtn = document.getElementById("restartBtn");

const themeToggle = document.getElementById("themeToggle");
const markStyleSelect = document.getElementById("markStyle");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");
const p1LabelEl = document.getElementById("p1Label");
const p2LabelEl = document.getElementById("p2Label");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;

let scores = { X: 0, O: 0, D: 0 };

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const MARK_STYLES = {
  classic: { X: "X", O: "O", p1: "Player X", p2: "Player O" },
  emoji: { X: "❌", O: "⭕", p1: "Player ❌", p2: "Player ⭕" },
  letters: { X: "A", O: "B", p1: "Player A", p2: "Player B" },
};

function getMarkStyle() {
  return MARK_STYLES[markStyleSelect.value] || MARK_STYLES.classic;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setHint(text) {
  hintEl.textContent = text;
}

function updateTurnMessaging() {
  const style = getMarkStyle();
  setStatus(`Player ${style[currentPlayer]}’s turn — click an empty square.`);
  setHint("Goal: get 3 in a row (horizontal, vertical, or diagonal).");
}

function renderBoard() {
  boardEl.innerHTML = "";

  // ✅ Let CSS know the current mark style (for emoji centering tweak)
  boardEl.dataset.markStyle = markStyleSelect.value;

  const style = getMarkStyle();

  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.dataset.index = String(i);

    const span = document.createElement("span");
    span.className = "mark";
    span.textContent = board[i] ? style[board[i]] : "";
    btn.appendChild(span);

    if (board[i] || gameOver) btn.disabled = true;

    btn.addEventListener("click", onCellClick);
    boardEl.appendChild(btn);
  }

  p1LabelEl.textContent = style.p1;
  p2LabelEl.textContent = style.p2;

  scoreXEl.textContent = String(scores.X);
  scoreOEl.textContent = String(scores.O);
  scoreDEl.textContent = String(scores.D);
}

function onCellClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  if (gameOver || board[idx]) return;

  board[idx] = currentPlayer;

  const winnerInfo = getWinner(board);
  if (winnerInfo) {
    gameOver = true;
    const style = getMarkStyle();
    const winChar = style[winnerInfo.winner];

    setStatus(`🎉 ${winChar} wins!`);
    setHint("Press Restart to play a new round (no page refresh needed).");

    scores[winnerInfo.winner] += 1;

    renderBoard();
    highlightWinningCells(winnerInfo.line);
    return;
  }

  if (isDraw(board)) {
    gameOver = true;
    setStatus("🤝 It’s a draw!");
    setHint("No moves left. Press Restart to play again.");

    scores.D += 1;

    renderBoard();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnMessaging();
  renderBoard();
}

function getWinner(b) {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line };
    }
  }
  return null;
}

function isDraw(b) {
  return b.every((cell) => cell !== null);
}

function highlightWinningCells(line) {
  const cells = boardEl.querySelectorAll(".cell");
  line.forEach((i) => cells[i].classList.add("win"));
}

function restartGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  updateTurnMessaging();
  renderBoard();
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const isLight = theme === "light";
  themeToggle.textContent = isLight ? "Light" : "Dark";
  themeToggle.setAttribute("aria-pressed", String(isLight));
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "light" ? "dark" : "light");
});

markStyleSelect.addEventListener("change", () => {
  if (!gameOver) updateTurnMessaging();
  renderBoard();
});

restartBtn.addEventListener("click", restartGame);

(function init() {
  setTheme("dark");
  updateTurnMessaging();
  renderBoard();
})();
