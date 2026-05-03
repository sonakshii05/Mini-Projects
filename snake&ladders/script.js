document.addEventListener("DOMContentLoaded", () => {

const board = document.getElementById("board");
const svg = document.getElementById("overlay");

const p1 = document.getElementById("player1");
const p2 = document.getElementById("player2");
const statusText = document.getElementById("status");

let positions = [1, 1];
let currentPlayer = 0;

// Sounds
const diceSound = document.getElementById("diceSound");
const snakeSound = document.getElementById("snakeSound");
const ladderSound = document.getElementById("ladderSound");

// Snakes & Ladders
const jumps = {
  4: 14, 9: 31, 17: 7, 20: 38, 28: 84,
  40: 59, 51: 67, 63: 81, 64: 60,
  89: 26, 95: 75, 99: 78
};

// Create board
for (let i = 100; i >= 1; i--) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.id = "cell-" + i;
  cell.innerText = i;
  board.appendChild(cell);
}

// Move player
function move(player, pos) {
  const cell = document.getElementById("cell-" + pos);
  if (!cell) return;

  const rect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  player.style.left = rect.left - boardRect.left + rect.width / 4 + "px";
  player.style.top = rect.top - boardRect.top + rect.height / 4 + "px";
}

// Update players
function updatePlayers() {
  move(p1, positions[0]);
  move(p2, positions[1]);
}

// Dice
window.rollDice = function () {
  diceSound?.play().catch(()=>{});

  let dice = Math.floor(Math.random() * 6) + 1;
  let next = positions[currentPlayer] + dice;

  if (next > 100) return;

  animateMove(currentPlayer, positions[currentPlayer], next);
};

// Animate
function animateMove(playerIndex, start, end) {
  let current = start;

  const interval = setInterval(() => {
    if (current >= end) {
      clearInterval(interval);

      if (jumps[current]) {
        setTimeout(() => {
          if (jumps[current] < current) snakeSound?.play().catch(()=>{});
          else ladderSound?.play().catch(()=>{});

          current = jumps[current];
          positions[playerIndex] = current;
          updatePlayers();
          checkWin();
          switchTurn();
        }, 400);
      } else {
        positions[playerIndex] = current;
        updatePlayers();
        checkWin();
        switchTurn();
      }
      return;
    }

    current++;
    positions[playerIndex] = current;
    updatePlayers();
  }, 250);
}

// Turn switch
function switchTurn() {
  currentPlayer = currentPlayer === 0 ? 1 : 0;
  statusText.innerText = `Player ${currentPlayer + 1} Turn`;
}

// Win
function checkWin() {
  if (positions[currentPlayer] === 100) {
    document.getElementById("winScreen").classList.remove("hidden");
    document.getElementById("winnerText").innerText =
      `🎉 Player ${currentPlayer + 1} Wins!`;
  }
}

// Restart
window.restartGame = function () {
  positions = [1, 1];
  currentPlayer = 0;
  updatePlayers();
  document.getElementById("winScreen").classList.add("hidden");
  statusText.innerText = "Player 1 Turn";
};

// Draw curves
function drawCurves() {
  svg.innerHTML = "";

  Object.keys(jumps).forEach(start => {
    const end = jumps[start];

    const c1 = document.getElementById("cell-" + start);
    const c2 = document.getElementById("cell-" + end);

    if (!c1 || !c2) return;

    const r1 = c1.getBoundingClientRect();
    const r2 = c2.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();

    const x1 = r1.left - boardRect.left + r1.width / 2;
    const y1 = r1.top - boardRect.top + r1.height / 2;
    const x2 = r2.left - boardRect.left + r2.width / 2;
    const y2 = r2.top - boardRect.top + r2.height / 2;

    if (end < start) {
      const cx = (x1 + x2) / 2 + (Math.random() * 80 - 40);
      const cy = (y1 + y2) / 2 + (Math.random() * 80 - 40);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
      path.setAttribute("stroke", "red");
      path.setAttribute("stroke-width", "8");
      path.setAttribute("fill", "none");

      svg.appendChild(path);
    } else {
      const offset = 6;

      const l1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const l2 = document.createElementNS("http://www.w3.org/2000/svg", "line");

      l1.setAttribute("x1", x1 - offset);
      l1.setAttribute("y1", y1);
      l1.setAttribute("x2", x2 - offset);
      l1.setAttribute("y2", y2);

      l2.setAttribute("x1", x1 + offset);
      l2.setAttribute("y1", y1);
      l2.setAttribute("x2", x2 + offset);
      l2.setAttribute("y2", y2);

      l1.setAttribute("stroke", "gold");
      l2.setAttribute("stroke", "gold");

      svg.appendChild(l1);
      svg.appendChild(l2);
    }
  });
}

// Init
updatePlayers();
setTimeout(drawCurves, 300);
window.addEventListener("resize", drawCurves);

});

