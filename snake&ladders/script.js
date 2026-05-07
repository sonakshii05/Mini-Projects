document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("board");
  const boardOverlay = document.getElementById("board-overlay");
  const p1 = document.getElementById("player1");
  const p2 = document.getElementById("player2");
  const statusTextEl = document.getElementById("statusText");
  const diceResult = document.getElementById("diceResult");
  const currentPlayerText = document.getElementById("currentPlayerText");
  const player1Score = document.getElementById("player1Score");
  const player2Score = document.getElementById("player2Score");
  const victoryPopup = document.getElementById("victoryPopup");
  const confettiLayer = document.getElementById("confettiLayer");
  const rollButton = document.getElementById("rollButton");
  const pauseButton = document.getElementById("pauseButton");
  const restartButton = document.getElementById("restartButton");
  const aiButton = document.getElementById("aiButton");
  const muteToggle = document.getElementById("muteToggle");
  const popupRestart = document.getElementById("popupRestart");
  const diceCube = document.getElementById("diceCube");

  const diceAudio = document.getElementById("diceAudio");
  const snakeAudio = document.getElementById("snakeAudio");
  const ladderAudio = document.getElementById("ladderAudio");
  const victoryAudio = document.getElementById("victoryAudio");
  const musicAudio = document.getElementById("musicAudio");

  const jumps = [
    { start: 4, end: 14, type: "ladder", offset: -0.22 },
    { start: 9, end: 31, type: "ladder", offset: 0.16 },
    { start: 17, end: 7, type: "snake", offset: 0.3 },
    { start: 20, end: 38, type: "ladder", offset: -0.18 },
    { start: 28, end: 84, type: "ladder", offset: 0.18 },
    { start: 40, end: 59, type: "ladder", offset: 0.08 },
    { start: 51, end: 67, type: "ladder", offset: -0.14 },
    { start: 63, end: 81, type: "ladder", offset: 0.22 },
    { start: 64, end: 60, type: "snake", offset: -0.16 },
    { start: 89, end: 26, type: "snake", offset: 0.28 },
    { start: 95, end: 75, type: "snake", offset: -0.24 },
    { start: 99, end: 78, type: "snake", offset: 0.24 }
  ];

  const jumpLookup = Object.fromEntries(jumps.map((jump) => [jump.start, jump.end]));

  let positions = [1, 1];
  let currentPlayer = 0;
  let gameOver = false;
  let isPaused = false;
  let isRolling = false;
  let useAI = false;

  function createCell(number) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `cell-${number}`;
    const label = document.createElement("span");
    label.textContent = number;
    const icon = document.createElement("div");
    icon.className = "cell-icon";
    icon.textContent = getCellEmoji(number);
    if (icon.textContent !== "") {
  cell.appendChild(icon);
}
    cell.appendChild(label);
    if (jumpLookup[number]) {
      cell.classList.add(jumpLookup[number] < number ? "snake-cell" : "ladder-cell");
    }
    return cell;
  }

  function createBoard() {
    board.innerHTML = "";
    for (let row = 9; row >= 0; row--) {
      const leftToRight = (9 - row) % 2 === 0;
      const base = row * 10;
      for (let col = 0; col < 10; col++) {
        const number = base + (leftToRight ? col + 1 : 10 - col);
        board.appendChild(createCell(number));
      }
    }
    drawBoardOverlay();
  }
function getCellEmoji(number) {
  if (jumpLookup[number]) {
    return jumpLookup[number] < number ? "🐍" : "🪜";
  }

  return "";
}
  function getCellRect(index) {
    const cell = document.getElementById(`cell-${index}`);
    return cell ? cell.getBoundingClientRect() : null;
  }

  function placePlayer(player, index) {
    const rect = getCellRect(index);
    if (!rect) return;
    const boardRect = board.getBoundingClientRect();
    player.style.left = `${rect.left - boardRect.left + rect.width * 0.18}px`;
    player.style.top = `${rect.top - boardRect.top + rect.height * 0.18}px`;
  }

  function updatePlayers() {
    placePlayer(p1, positions[0]);
    placePlayer(p2, positions[1]);
    currentPlayerText.textContent = `Player ${currentPlayer + 1}`;
    document.querySelector(".active-chip").className = `active-chip ${currentPlayer === 0 ? "token1-glow" : "token2-glow"}`;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function animateDice() {
    diceCube.style.transform = `perspective(700px) rotateX(${Math.random() * 720 + 360}deg) rotateY(${Math.random() * 720 + 360}deg)`;
  }

  async function rollDice() {
    if (isPaused || gameOver || isRolling) return;
    isRolling = true;
    rollButton.disabled = true;
    statusTextEl.innerText = `Player ${currentPlayer + 1} is rolling...`;
    diceAudio.currentTime = 0;
    diceAudio.play().catch(() => {});
    animateDice();
    await sleep(800);
    const value = Math.floor(Math.random() * 6) + 1;
    diceResult.innerText = `Roll: ${value}`;
    diceCube.className = `dice-cube show-${value}`;
    const target = positions[currentPlayer] + value;
    if (target > 100) {
      statusTextEl.innerText = `Needs exact ${100 - positions[currentPlayer]} to finish.`;
      switchTurn();
      isRolling = false;
      rollButton.disabled = false;
      maybeAIMove();
      return;
    }
    await animateMovement(positions[currentPlayer], target);
    positions[currentPlayer] = target;
    updatePlayers();
    if (!(await handleJump())) {
      if (positions[currentPlayer] === 100) {
        endGame();
      } else {
        switchTurn();
      }
    }
    if (!gameOver) rollButton.disabled = false;
    isRolling = false;
    maybeAIMove();
  }

  async function animateMovement(start, end) {
    const step = start < end ? 1 : -1;
    for (let position = start + step; position !== end + step; position += step) {
      positions[currentPlayer] = position;
      updatePlayers();
      await sleep(130);
    }
  }

  async function handleJump() {
    const position = positions[currentPlayer];
    const destination = jumpLookup[position];
    if (!destination) return false;
    const isSnake = destination < position;
    if (isSnake) {
      snakeAudio.currentTime = 0;
      snakeAudio.play().catch(() => {});
      statusTextEl.innerText = `Snake! Player ${currentPlayer + 1} slides to ${destination}.`;
    } else {
      ladderAudio.currentTime = 0;
      ladderAudio.play().catch(() => {});
      statusTextEl.innerText = `Ladder! Player ${currentPlayer + 1} climbs to ${destination}.`;
    }
    await sleep(420);
    await animateMovement(position, destination);
    positions[currentPlayer] = destination;
    updatePlayers();
    if (destination === 100) {
      endGame();
      return true;
    }
    return false;
  }

  function switchTurn() {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    updatePlayers();
    statusTextEl.innerText = `Player ${currentPlayer + 1} turn. Roll the dice.`;
  }

  function endGame() {
    gameOver = true;
    rollButton.disabled = true;
    victoryAudio.currentTime = 0;
    victoryAudio.play().catch(() => {});
    document.getElementById("winnerText").innerText = `Player ${currentPlayer + 1} is victorious!`;
    victoryPopup.classList.remove("hidden");
    if (currentPlayer === 0) player1Score.textContent = Number(player1Score.textContent) + 1;
    else player2Score.textContent = Number(player2Score.textContent) + 1;
    spawnConfetti();
  }

  function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
    rollButton.disabled = isPaused || gameOver;
    statusTextEl.innerText = isPaused ? "Game paused." : `Player ${currentPlayer + 1} turn. Roll the dice.`;
  }

  function toggleAI() {
    useAI = !useAI;
    aiButton.textContent = useAI ? "AI Enabled" : "Play vs AI";
    if (useAI && currentPlayer === 1 && !gameOver && !isPaused) maybeAIMove();
  }

  function toggleMusic() {
    musicAudio.muted = !musicAudio.muted;
    muteToggle.textContent = musicAudio.muted ? "Unmute Music" : "Mute Music";
  }

  function maybeAIMove() {
    if (!useAI || currentPlayer !== 1 || isPaused || gameOver) return;
    setTimeout(() => {
      if (!gameOver && !isPaused) rollDice();
    }, 900);
  }

  function restartGame() {
    positions = [1, 1];
    currentPlayer = 0;
    gameOver = false;
    isPaused = false;
    isRolling = false;
    rollButton.disabled = false;
    diceResult.innerText = "Roll: -";
    statusTextEl.innerText = "Player 1 turn. Roll the dice to move.";
    victoryPopup.classList.add("hidden");
    resetConfetti();
    updatePlayers();
    maybeAIMove();
  }

  function spawnConfetti() {
    resetConfetti();
    const count = 40;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 90 + 5}%`;
      piece.style.background = `hsl(${Math.random() * 80 + 180}, 90%, ${Math.random() * 20 + 60}%)`;
      piece.style.width = `${Math.random() * 8 + 6}px`;
      piece.style.height = `${Math.random() * 18 + 12}px`;
      piece.style.animationDuration = `${Math.random() * 0.8 + 1.2}s`;
      piece.style.animationDelay = `${Math.random() * 0.2}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      confettiLayer.appendChild(piece);
    }
  }

  function resetConfetti() {
    confettiLayer.innerHTML = "";
  }

  function drawBoardOverlay() {
    boardOverlay.innerHTML = "";
    const boardRect = board.getBoundingClientRect();
    boardOverlay.setAttribute("width", boardRect.width);
    boardOverlay.setAttribute("height", boardRect.height);

    function createSVGLine(x1, y1, x2, y2, color, width, dash) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", width);
      line.setAttribute("stroke-linecap", "round");
      if (dash) line.setAttribute("stroke-dasharray", dash);
      return line;
    }

    jumps.forEach((jump) => {
      const { start, end, type, offset } = jump;
      const startRect = getCellRect(start);
      const endRect = getCellRect(end);
      if (!startRect || !endRect) return;

      const x1 = startRect.left - boardRect.left + startRect.width / 2;
      const y1 = startRect.top - boardRect.top + startRect.height / 2;
      const x2 = endRect.left - boardRect.left + endRect.width / 2;
      const y2 = endRect.top - boardRect.top + endRect.height / 2;
      const isSnake = type === "snake";
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.hypot(dx, dy);
      const normalX = (y2 - y1) / length;
      const normalY = -(x2 - x1) / length;
      const curve = Math.min(170, Math.max(80, length * 0.2));
      const curveOffset = offset * length;
      const controlX = (x1 + x2) / 2 + normalX * curveOffset;
      const controlY = (y1 + y2) / 2 + normalY * curveOffset;

      if (isSnake) {
        const main = document.createElementNS("http://www.w3.org/2000/svg", "path");
        main.setAttribute("d", `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`);
        main.setAttribute("stroke", "#ef4444");
        main.setAttribute("stroke-width", "12");
        main.setAttribute("fill", "none");
        main.setAttribute("stroke-linecap", "round");
        main.setAttribute("opacity", "0.92");
        boardOverlay.appendChild(main);
      } else {
        const railOffset = 14;
        const leftStartX = x1 + normalX * railOffset;
        const leftStartY = y1 + normalY * railOffset;
        const leftEndX = x2 + normalX * railOffset;
        const leftEndY = y2 + normalY * railOffset;
        const rightStartX = x1 - normalX * railOffset;
        const rightStartY = y1 - normalY * railOffset;
        const rightEndX = x2 - normalX * railOffset;
        const rightEndY = y2 - normalY * railOffset;

        const leftRail = document.createElementNS("http://www.w3.org/2000/svg", "path");
        leftRail.setAttribute("d", `M ${leftStartX} ${leftStartY} L ${leftEndX} ${leftEndY}`);
        leftRail.setAttribute("stroke", "#fde047");
        leftRail.setAttribute("stroke-width", "6");
        leftRail.setAttribute("stroke-linecap", "round");
        leftRail.setAttribute("opacity", "0.95");
        boardOverlay.appendChild(leftRail);

        const rightRail = document.createElementNS("http://www.w3.org/2000/svg", "path");
        rightRail.setAttribute("d", `M ${rightStartX} ${rightStartY} L ${rightEndX} ${rightEndY}`);
        rightRail.setAttribute("stroke", "#fde047");
        rightRail.setAttribute("stroke-width", "6");
        rightRail.setAttribute("stroke-linecap", "round");
        rightRail.setAttribute("opacity", "0.95");
        boardOverlay.appendChild(rightRail);

        const rungCount = 3;
        for (let step = 1; step <= rungCount; step += 1) {
          const t = step / (rungCount + 1);
          const rungX = x1 + dx * t;
          const rungY = y1 + dy * t;
          const rungLeftX = rungX + normalX * railOffset;
          const rungLeftY = rungY + normalY * railOffset;
          const rungRightX = rungX - normalX * railOffset;
          const rungRightY = rungY - normalY * railOffset;
          const rungLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
          rungLine.setAttribute("x1", rungLeftX);
          rungLine.setAttribute("y1", rungLeftY);
          rungLine.setAttribute("x2", rungRightX);
          rungLine.setAttribute("y2", rungRightY);
          rungLine.setAttribute("stroke", "#fde047");
          rungLine.setAttribute("stroke-width", "4");
          rungLine.setAttribute("stroke-linecap", "round");
          rungLine.setAttribute("opacity", "0.85");
          boardOverlay.appendChild(rungLine);
        }
      }
    });
  }

  function toggleMusic() {
    musicAudio.muted = !musicAudio.muted;
    muteToggle.textContent = musicAudio.muted ? "Unmute Music" : "Mute Music";
  }

  rollButton.addEventListener("click", rollDice);
  pauseButton.addEventListener("click", togglePause);
  restartButton.addEventListener("click", restartGame);
  aiButton.addEventListener("click", toggleAI);
  muteToggle.addEventListener("click", toggleMusic);
  popupRestart.addEventListener("click", restartGame);
  window.addEventListener("resize", () => {
    drawBoardOverlay();
    updatePlayers();
  });

  musicAudio.volume = 0.22;
  musicAudio.play().catch(() => {});

  createBoard();
  updatePlayers();
});

