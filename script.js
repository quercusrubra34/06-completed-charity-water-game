// Log a message to the console to ensure the script is linked correctly
console.log('Water Infrastructure Game - JavaScript loaded successfully!');

// Game configuration - these numbers control how the game works
const GRID_SIZE = 20; // How many squares wide and tall our game board is
const MAX_DROPLETS = 8; // Maximum number of water droplets on screen

// Game state variables - these keep track of what's happening in the game
let gameBoard = []; // 2D array representing our game grid
let snake = []; // Array of snake body positions
let direction = { x: 0, y: 0 }; // Which direction the snake is moving
let score = 0; // Player's current score
let highScore = 0; // Best score ever achieved
let gameSpeed = 200; // How fast the game runs (lower = faster)
let gameInterval = null; // Stores the game loop timer
let currentDifficulty = 'medium'; // Current difficulty setting

// Water droplet arrays - different types of collectibles
let waterDrops = []; // Regular blue water drops (+1 point)
let bonusDrops = []; // Gold water drops (+5 points)
let dirtyDrops = []; // Gray dirty water (-5 points)
let walls = []; // Wall obstacles for obstacles mode

// Get references to HTML elements we'll need to control
const introScreen = document.getElementById('intro-screen');
const gameBoardElement = document.getElementById('game-board');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score-display');

// Initialize the game when the page loads
function initGame() {
  console.log('Initializing game...');
  createGameBoard();
  showIntroScreen();
}

// Create the game board as a grid of HTML elements
function createGameBoard() {
  // Clear any existing game board
  gameBoardElement.innerHTML = '';
  
  // Create a 2D array to represent our game board
  gameBoard = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    gameBoard[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      // Create a new cell element
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.id = `cell-${row}-${col}`;
      
      // Add the cell to our HTML game board
      gameBoardElement.appendChild(cell);
      
      // Store the cell in our 2D array for easy access
      gameBoard[row][col] = cell;
    }
  }
  console.log('Game board created with', GRID_SIZE, 'x', GRID_SIZE, 'cells');
}

// Show the intro screen and hide other screens
function showIntroScreen() {
  introScreen.style.display = 'block';
  gameBoardElement.style.display = 'none';
  gameOverScreen.style.display = 'none';
  scoreDisplay.style.display = 'none';
  console.log('Showing intro screen');
}

// Start a new game with the selected difficulty
function startGame(difficulty = 'medium') {
  console.log(`Starting game with difficulty: ${difficulty}`);
  currentDifficulty = difficulty;
  
  // Hide intro screen and show game
  introScreen.style.display = 'none';
  gameBoardElement.style.display = 'grid';
  scoreDisplay.style.display = 'block';
  
  // Reset game state
  resetGameState();
  
  // Set game speed based on difficulty
  setGameSpeed(difficulty);
  
  // Generate walls if obstacles mode
  if (difficulty === 'obstacles') {
    generateWalls();
  }
  
  // Place initial water droplets
  placeInitialDroplets();
  
  // Start listening for arrow key presses
  setupKeyboardControls();
  
  // Update the display
  updateDisplay();
  
  console.log('Game started successfully');
}

// Reset all game variables to starting values
function resetGameState() {
  // Initialize snake in the center of the board
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 }; // Snake doesn't move until player presses a key
  score = 0;
  
  // Clear all droplet arrays
  waterDrops = [];
  bonusDrops = [];
  dirtyDrops = [];
  walls = [];
  
  // Stop any existing game loop
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  
  // Clear the visual game board
  clearGameBoard();
  
  console.log('Game state reset');
}

// Set the game speed based on difficulty level
function setGameSpeed(difficulty) {
  switch (difficulty) {
    case 'easy':
      gameSpeed = 300; // Slower for beginners
      break;
    case 'hard':
      gameSpeed = 100; // Faster for experts
      break;
    case 'obstacles':
      gameSpeed = 250; // Slightly slower due to obstacles
      break;
    default: // medium
      gameSpeed = 200;
  }
  console.log(`Game speed set to ${gameSpeed}ms per move`);
}

// Generate wall obstacles for obstacles mode
function generateWalls() {
  const numberOfWalls = Math.floor(Math.random() * 8) + 5; // 5-12 walls
  console.log(`Generating ${numberOfWalls} walls`);
  
  for (let i = 0; i < numberOfWalls; i++) {
    let wallPosition;
    let attempts = 0;
    
    // Try to find a good position for the wall
    do {
      wallPosition = getRandomPosition();
      attempts++;
    } while (attempts < 50 && (
      isNearSnakeStart(wallPosition) ||
      isPositionOccupied(wallPosition) ||
      walls.some(wall => wall.x === wallPosition.x && wall.y === wallPosition.y)
    ));
    
    // If we found a good spot, add the wall
    if (attempts < 50) {
      walls.push(wallPosition);
    }
  }
}

// Check if a position is too close to where the snake starts
function isNearSnakeStart(position) {
  const startX = 10;
  const startY = 10;
  const distance = Math.abs(position.x - startX) + Math.abs(position.y - startY);
  return distance < 3; // Keep walls at least 3 spaces away from start
}

// Place the initial water droplets on the board
function placeInitialDroplets() {
  // Fill the board with regular water drops
  while (waterDrops.length < MAX_DROPLETS) {
    const position = getRandomPosition();
    if (!isPositionOccupied(position)) {
      waterDrops.push(position);
    }
  }
  console.log(`Placed ${waterDrops.length} initial water droplets`);
}

// Get a random position on the game board
function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };
}

// Check if a position is occupied by snake, droplets, or walls
function isPositionOccupied(position) {
  // Check if snake is at this position
  const snakeHere = snake.some(segment => segment.x === position.x && segment.y === position.y);
  
  // Check if any droplets are at this position
  const dropletHere = waterDrops.some(drop => drop.x === position.x && drop.y === position.y) ||
                     bonusDrops.some(drop => drop.x === position.x && drop.y === position.y) ||
                     dirtyDrops.some(drop => drop.x === position.x && drop.y === position.y);
  
  // Check if a wall is at this position
  const wallHere = walls.some(wall => wall.x === position.x && wall.y === position.y);
  
  return snakeHere || dropletHere || wallHere;
}

// Set up keyboard controls for the game
function setupKeyboardControls() {
  // Remove any existing keyboard listeners
  document.removeEventListener('keydown', handleKeyPress);
  
  // Add new keyboard listener
  document.addEventListener('keydown', handleKeyPress);
  console.log('Keyboard controls set up');
}

// Handle keyboard input from the player
function handleKeyPress(event) {
  // Only respond to arrow keys
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    return;
  }
  
  // Prevent the page from scrolling when arrow keys are pressed
  event.preventDefault();
  
  // If this is the first key press, start the game loop
  if (gameInterval === null) {
    startGameLoop();
  }
  
  // Change direction based on which arrow key was pressed
  // But don't allow the snake to go backwards into itself
  switch (event.key) {
    case 'ArrowUp':
      if (direction.y === 0) { // Only if not already moving vertically
        direction = { x: 0, y: -1 };
      }
      break;
    case 'ArrowDown':
      if (direction.y === 0) {
        direction = { x: 0, y: 1 };
      }
      break;
    case 'ArrowLeft':
      if (direction.x === 0) { // Only if not already moving horizontally
        direction = { x: -1, y: 0 };
      }
      break;
    case 'ArrowRight':
      if (direction.x === 0) {
        direction = { x: 1, y: 0 };
      }
      break;
  }
  
  console.log(`Direction changed to: x=${direction.x}, y=${direction.y}`);
}

// Start the main game loop
function startGameLoop() {
  console.log('Starting game loop');
  gameInterval = setInterval(gameStep, gameSpeed);
}

// One step of the game - this runs repeatedly
function gameStep() {
  moveSnake();
  checkCollisions();
  updateDisplay();
}

// Move the snake one step in the current direction
function moveSnake() {
  // Calculate where the snake's head will be next
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };
  
  // Add the new head to the front of the snake
  snake.unshift(newHead);
  
  // We'll remove the tail later if no food was eaten
}

// Check for collisions and handle them
function checkCollisions() {
  const head = snake[0];
  
  // Check if snake hit the walls of the game board
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    console.log('Game over: Snake hit boundary');
    gameOver();
    return;
  }
  
  // Check if snake hit itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      console.log('Game over: Snake hit itself');
      gameOver();
      return;
    }
  }
  
  // Check if snake hit a wall (in obstacles mode)
  if (walls.some(wall => wall.x === head.x && wall.y === head.y)) {
    console.log('Game over: Snake hit wall');
    gameOver();
    return;
  }
  
  // Check if snake ate any droplets
  let ateFood = false;
  
  // Check regular water drops
  for (let i = 0; i < waterDrops.length; i++) {
    if (head.x === waterDrops[i].x && head.y === waterDrops[i].y) {
      score += 1;
      waterDrops.splice(i, 1); // Remove the eaten droplet
      ateFood = true;
      console.log('Ate water drop! Score:', score);
      break;
    }
  }
  
  // Check bonus drops
  for (let i = 0; i < bonusDrops.length; i++) {
    if (head.x === bonusDrops[i].x && head.y === bonusDrops[i].y) {
      score += 5;
      bonusDrops.splice(i, 1);
      // Bonus drops make the snake grow extra
      for (let j = 0; j < 3; j++) {
        snake.push({ ...snake[snake.length - 1] });
      }
      ateFood = true;
      console.log('Ate bonus drop! Score:', score);
      break;
    }
  }
  
  // Check dirty drops
  for (let i = 0; i < dirtyDrops.length; i++) {
    if (head.x === dirtyDrops[i].x && head.y === dirtyDrops[i].y) {
      score = Math.max(0, score - 5); // Don't let score go below 0
      dirtyDrops.splice(i, 1);
      ateFood = true;
      console.log('Ate dirty drop! Score:', score);
      break;
    }
  }
  
  // If no food was eaten, remove the tail (snake doesn't grow)
  if (!ateFood) {
    snake.pop();
  } else {
    // Add new droplets to replace the ones that were eaten
    addRandomDroplets();
  }
}

// Add new random droplets to the game
function addRandomDroplets() {
  // Keep adding droplets until we have enough
  while (waterDrops.length + bonusDrops.length + dirtyDrops.length < MAX_DROPLETS) {
    const position = getRandomPosition();
    if (isPositionOccupied(position)) {
      continue; // Try again if position is occupied
    }
    
    // Randomly decide what type of droplet to add
    const random = Math.random();
    if (random < 0.1) { // 10% chance for bonus drop
      bonusDrops.push(position);
    } else if (random < 0.2) { // 10% chance for dirty drop
      dirtyDrops.push(position);
    } else { // 80% chance for regular water drop
      waterDrops.push(position);
    }
  }
}

// Update the visual display of the game
function updateDisplay() {
  // Clear the entire board first
  clearGameBoard();
  
  // Draw walls
  walls.forEach(wall => {
    const cell = gameBoard[wall.y][wall.x];
    cell.className = 'grid-cell wall';
  });
  
  // Draw water droplets
  waterDrops.forEach(drop => {
    const cell = gameBoard[drop.y][drop.x];
    cell.innerHTML = '<div class="water-drop"></div>';
  });
  
  // Draw bonus droplets
  bonusDrops.forEach(drop => {
    const cell = gameBoard[drop.y][drop.x];
    cell.innerHTML = '<div class="bonus-drop"></div>';
  });
  
  // Draw dirty droplets
  dirtyDrops.forEach(drop => {
    const cell = gameBoard[drop.y][drop.x];
    cell.innerHTML = '<div class="dirty-drop"></div>';
  });
  
  // Draw snake
  snake.forEach((segment, index) => {
    const cell = gameBoard[segment.y][segment.x];
    if (index === 0) {
      // Snake head
      cell.className = 'grid-cell snake-head';
    } else {
      // Snake body
      cell.className = 'grid-cell snake-body';
    }
  });
  
  // Update score display
  document.getElementById('current-score').textContent = score;
}

// Clear all visual elements from the game board
function clearGameBoard() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = gameBoard[row][col];
      cell.className = 'grid-cell';
      cell.innerHTML = '';
    }
  }
}

// Handle game over
function gameOver() {
  console.log('Game Over! Final score:', score);
  
  // Stop the game loop
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  
  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    console.log('New high score!', highScore);
  }
  
  // Show game over screen
  showGameOverScreen();
}

// Show the game over screen with scores
function showGameOverScreen() {
  gameBoardElement.style.display = 'none';
  scoreDisplay.style.display = 'none';
  gameOverScreen.style.display = 'block';
  
  // Update the displayed scores
  document.getElementById('final-score').textContent = score;
  document.getElementById('displayed-high-score').textContent = highScore;
}

// Go back to the intro screen (called by Play Again button)
function returnToIntro() {
  console.log('Returning to intro screen');
  gameOverScreen.style.display = 'none';
  showIntroScreen();
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
