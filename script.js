// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countdown;
let timeLeft = 30;
let score = 0;

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
// added pause button  
document.getElementById("pause-btn").addEventListener("click", pauseGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);
document.getElementById("play-again-btn").addEventListener("click", () => {
  document.getElementById("win-dialog").close();
  resetGame();
  startGame();
});

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  if (timeLeft === 0) {
    timeLeft = 30;
    document.getElementById("time").textContent = timeLeft;
  }

  gameRunning = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  countdown = setInterval(() => {
    timeLeft -= 1;
    document.getElementById("time").textContent = timeLeft;

    if (timeLeft === 0) {
      gameRunning = false;
      clearInterval(dropMaker);
      clearInterval(countdown);
      document.getElementById("game-container").replaceChildren();

      if (score > 100) {
        document.getElementById("win-score").textContent = score;
        document.getElementById("win-dialog").showModal();
      }
    }
  }, 1000);
}
function pauseGame() {
  // Prevent pausing if the game isn't running
  if (!gameRunning) return;

  gameRunning = false;

  // Stop creating new drops
  clearInterval(dropMaker);
  clearInterval(countdown);
}
function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("game-container").replaceChildren();
  document.getElementById("win-dialog").close();
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

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  function catchDrop() {
    if (!drop.isConnected) return;

    score += 10;
    document.getElementById("score").textContent = score;
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
    if (!drop.isConnected) return;

    score -= 5;
    document.getElementById("score").textContent = score;
    drop.remove();
  });
}
