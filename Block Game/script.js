const gameContainer = document.querySelector(".game-container");
const startBtn = document.querySelector(".start-btn");
const controlBtn = document.querySelector(".control-btn");
const returnBtn = document.querySelector(".return-btn");
const menu = document.querySelector(".menu");
const control = document.querySelector(".control");
const player = document.querySelector(".player");
const score = document.querySelector('.score-val');
const gameOverContainer = document.querySelector('.game-over-container');
const resetBtn = document.querySelector('.restart-btn');
const finalScore = document.querySelector('.curr-score-val');
const maxScoreAll = document.querySelector('.value');
const sides = ["left", "right", "top", "bottom"];
let MAX_Y_RANGE = 600 - 50;
let MAX_X_RANGE = 600 - 50;
let SPEED = 10;

class Game {
  _keysPressed = {};
  #currScore = 0;
  #scoreInterval;
  #blockSpawnerInterval;
  #animationFrameId;

  constructor() {
    startBtn.addEventListener("click", this._startGame.bind(this));
    controlBtn.addEventListener("click", this._controlEvent.bind(this));
    returnBtn.addEventListener("click", this._returnEvent.bind(this));
    resetBtn.addEventListener("click", this._resetEvent.bind(this));
    this._initMaxScore();
  }

  _controlEvent() {
    menu.classList.add("hidden");
    control.classList.remove("hidden");
  }

  _returnEvent() {
    control.classList.add("hidden");
    menu.classList.remove("hidden");
  }

  _startGame() {
    menu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    this.#currScore = 0;
    score.textContent = "0";
    const gameContainerCoords = gameContainer.getBoundingClientRect();
    player.style.top = `${gameContainerCoords.height / 2 - player.offsetHeight / 2}px`;
    player.style.left = `${gameContainerCoords.width / 2 - player.offsetWidth / 2}px`;
    this._keysPressed = {};
    SPEED = 10;
    document.addEventListener("keydown", this._keyDownHandler.bind(this));
    document.addEventListener("keyup", this._keyUpHandler.bind(this));
    this._movePlayer();
    this._spawnBlocks();
    this._startScoreInterval();
  }

  _keyDownHandler(e) {
    this._keysPressed[e.key] = true;
  }

  _keyUpHandler(e) {
    this._keysPressed[e.key] = false;
  }

  _startScoreInterval() {
    this.#scoreInterval = setInterval(() => {
      this.#currScore++;
      score.textContent = this.#currScore;
    }, 1000);
  }

  _stopScoreInterval() {
    clearInterval(this.#scoreInterval);
  }

  _spawnBlocks() {
    this.#blockSpawnerInterval = setInterval(() => {
      const block = document.createElement("div");
      block.classList.add("block");
      const randomSide = sides[Math.floor(Math.random() * sides.length)];
      let spawnPosX, spawnPosY, finalPosX, finalPosY;
      switch (randomSide) {
        case "left":
          spawnPosX = -100;
          spawnPosY = Math.random() * MAX_Y_RANGE;
          finalPosX = MAX_X_RANGE + 100;
          finalPosY = Math.random() * MAX_Y_RANGE;
          break;
        case "right":
          spawnPosX = MAX_X_RANGE + 100;
          spawnPosY = Math.random() * MAX_Y_RANGE;
          finalPosX = -100;
          finalPosY = Math.random() * MAX_Y_RANGE;
          break;
        case "top":
          spawnPosX = Math.random() * MAX_X_RANGE;
          spawnPosY = -100;
          finalPosX = Math.random() * MAX_X_RANGE;
          finalPosY = MAX_Y_RANGE + 100;
          break;
        case "bottom":
          spawnPosX = Math.random() * MAX_X_RANGE;
          spawnPosY = MAX_Y_RANGE + 100;
          finalPosX = Math.random() * MAX_X_RANGE;
          finalPosY = -100;
          break;
      }
      block.style.left = `${spawnPosX}px`;
      block.style.top = `${spawnPosY}px`;
      gameContainer.appendChild(block);
      const collisionInterval = setInterval(() => {
        if (this._checkCollision(block, player)) {
          this._gameOver();
          clearInterval(collisionInterval);
        }
      }, 50);
      setTimeout(() => {
        block.style.left = `${finalPosX}px`;
        block.style.top = `${finalPosY}px`;
      }, 50);
      setTimeout(() => {
        block.remove();
        clearInterval(collisionInterval);
      }, 4000);
    }, 500);
  }

  _checkCollision(block, player) {
    const blockRect = block.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    return (
      blockRect.left < playerRect.right &&
      blockRect.right > playerRect.left &&
      blockRect.top < playerRect.bottom &&
      blockRect.bottom > playerRect.top
    );
  }

  _movePlayer() {
    const gameContainerCoords = gameContainer.getBoundingClientRect();
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;
    let top = parseFloat(player.style.top) || 0;
    let left = parseFloat(player.style.left) || 0;
    if (this._keysPressed["w"] || this._keysPressed['ArrowUp'] || this._keysPressed['D']) 
      if(top-SPEED >= 0) top -= SPEED;

    if (this._keysPressed["s"] || this._keysPressed['ArrowDown'] || this._keysPressed['S']) 
      if(top + playerHeight + SPEED <= gameContainerCoords.height) top += SPEED;
    
    if (this._keysPressed["a"] || this._keysPressed['ArrowLeft'] || this._keysPressed['A']) 
      if(left - SPEED >= 0) left -= SPEED;
    
    if (this._keysPressed["d"] || this._keysPressed['ArrowRight'] || this._keysPressed['D']) 
      if(left  + playerWidth + SPEED <= gameContainerCoords.width) left += SPEED;
    
    player.style.top = `${top}px`;
    player.style.left = `${left}px`;
    this.#animationFrameId = requestAnimationFrame(this._movePlayer.bind(this));
  }

  _gameOver() {
    gameOverContainer.classList.remove("hidden");
    gameContainer.classList.add("hidden");
    finalScore.textContent = score.textContent;
    const maxScore = Math.max(+finalScore.textContent, +localStorage.getItem("maxScore") || 0);
    maxScoreAll.textContent = maxScore;
    localStorage.setItem("maxScore", maxScore);
    this._stopScoreInterval();
    clearInterval(this.#blockSpawnerInterval);
    cancelAnimationFrame(this.#animationFrameId);
    document.removeEventListener("keydown", this._keyDownHandler.bind(this));
    document.removeEventListener("keyup", this._keyUpHandler.bind(this));
  }

  _resetEvent() {
    document.querySelectorAll(".block").forEach((block) => block.remove());
    this._keysPressed = {};
    this.#currScore = 0;
    SPEED = 10;
    clearInterval(this.#blockSpawnerInterval);
    cancelAnimationFrame(this.#animationFrameId);
    this._stopScoreInterval();
    this._init();
  }

  _init() {
    gameOverContainer.classList.add("hidden");
    gameContainer.classList.add("hidden");
    menu.classList.remove("hidden");
  }

  _initMaxScore() {
    const maxScore = localStorage.getItem("maxScore") || 0;
    maxScoreAll.textContent = maxScore;
  }
}

const game = new Game();
