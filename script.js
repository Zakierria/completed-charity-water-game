// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countdown;
let timeLeft = 30;
let score = 0;
let gameMode;
let newHighScore = false;
const difficulties = {
  easy: { time: 30, dropDuration: 4 },
  medium: { time: 30, dropDuration: 3 },
  hard: { time: 25, dropDuration: 2 },
};
const difficultySelect = document.getElementById("difficulty");
const highScores = loadHighScores();
const highScoreDialog = document.getElementById("high-score-dialog");

function loadHighScores() {
  const savedScores = JSON.parse(localStorage.getItem("waterDropHighScores") || "{}");
  return Object.fromEntries(
    Object.keys(difficulties).map((mode) => [
      mode,
      Number.isFinite(savedScores[mode]) && savedScores[mode] >= 0 ? savedScores[mode] : 0,
    ]),
  );
}

function updateHighScoreDisplay() {
  const mode = difficultySelect.value;
  document.getElementById("high-score-mode").textContent =
    mode.charAt(0).toUpperCase() + mode.slice(1);
  document.getElementById("high-score").textContent = highScores[mode];
}

function updateScore() {
  document.getElementById("score").textContent = score;

  if (score <= highScores[gameMode]) return;

  newHighScore = true;
  highScores[gameMode] = score;
  localStorage.setItem("waterDropHighScores", JSON.stringify(highScores));
  updateHighScoreDisplay();
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
// added pause button  
document.getElementById("pause-btn").addEventListener("click", pauseGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
difficultySelect.addEventListener("change", resetGame);
document.querySelectorAll(".play-again-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".end-dialog").forEach((dialog) => dialog.close());
    resetGame();
    startGame();
  });
});
document.getElementById("main-screen-btn").addEventListener("click", resetGame);
document.getElementById("continue-game-btn").addEventListener("click", () => {
  highScoreDialog.close();
  showGameResult();
});
highScoreDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  highScoreDialog.close();
  showGameResult();
});
updateHighScoreDisplay();

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning || highScoreDialog.open) return;

  if (timeLeft === 0) {
    timeLeft = difficulties[difficultySelect.value].time;
    document.getElementById("time").textContent = timeLeft;
  }

  gameMode = difficultySelect.value;
  gameRunning = true;
  difficultySelect.disabled = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  countdown = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("time").textContent = timeLeft;

    if (timeLeft === 0) {
      gameRunning = false;
      difficultySelect.disabled = false;
      clearInterval(dropMaker);
      clearInterval(countdown);
      document.getElementById("game-container").replaceChildren();
      updateHighScoreDisplay();

      if (newHighScore) {
        document.getElementById("new-record-mode").textContent =
          gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
        document.getElementById("new-record-score").textContent = highScores[gameMode];
        highScoreDialog.showModal();
      } else {
        showGameResult();
      }
    }
  }, 1000);
}

function showGameResult() {
  if (score >= 100) {
    document.getElementById("win-score").textContent = score;
    document.getElementById("win-dialog").showModal();
  } else {
    document.getElementById("lose-score").textContent = score;
    document.getElementById("lose-dialog").showModal();
  }
}

function pauseGame() {
  // Prevent pausing if the game isn't running
  if (!gameRunning) return;

  gameRunning = false;
  difficultySelect.disabled = false;

  // Stop creating new drops
  clearInterval(dropMaker);
  clearInterval(countdown);
}
function resetGame() {
  gameRunning = false;
  difficultySelect.disabled = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  score = 0;
  newHighScore = false;
  timeLeft = difficulties[difficultySelect.value].time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("game-container").replaceChildren();
  document.querySelectorAll(".end-dialog").forEach((dialog) => dialog.close());
  updateHighScoreDisplay();
}
function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";
  drop.setAttribute("role", "button");
  drop.setAttribute("aria-label", "Catch water drop for 10 points");
  drop.tabIndex = 0;

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Keep drops fully inside the container, including on narrow screens.
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * Math.max(0, gameWidth - size);
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = `${difficulties[difficultySelect.value].dropDuration}s`;

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  function catchDrop() {
    if (!gameRunning || !drop.isConnected) return;

    score += 10;
    updateScore();
    drop.remove();
  }

  drop.addEventListener("pointerdown", catchDrop);
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      catchDrop();
    }
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (!gameRunning || !drop.isConnected) return;

    score -= 5;
    updateScore();
    drop.remove();
  });
}
