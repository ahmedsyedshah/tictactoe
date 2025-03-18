const board = document.querySelector('.board');
const message = document.querySelector('.message');
const cells = document.querySelectorAll('.cell');
const body = document.querySelector('body');
let currentPlayer = 'X';
let gameActive = true;
let isMultiplayer = false; // Track multiplayer mode
const boardState = Array(9).fill(null);

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function checkWin() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

function checkDraw() {
    return boardState.every(cell => cell !== null);
}

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    if (boardState[index] || !gameActive) return;

    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);

    const winner = checkWin();
    if (winner) {
        message.textContent = `Player ${winner} wins! 🎉`;
        gameActive = false;
        celebrateWin(winner);
        return;
    }

    if (checkDraw()) {
        message.textContent = "It's a draw! 🤝";
        gameActive = false;
        celebrateDraw();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // If not in multiplayer mode, let the AI make a move
    if (!isMultiplayer && currentPlayer === 'O') {
        setTimeout(aiMove, 500); // Add a 500ms delay before AI moves
    }
}

function aiMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === null) {
            boardState[i] = 'O';
            let score = minimax(boardState, 0, false);
            boardState[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    boardState[move] = 'O';
    cells[move].textContent = 'O';
    cells[move].classList.add('O');

    const winner = checkWin();
    if (winner) {
        message.textContent = `Player ${winner} wins! 🎉`;
        gameActive = false;
        celebrateWin(winner);
        return;
    }

    if (checkDraw()) {
        message.textContent = "It's a draw! 🤝";
        gameActive = false;
        celebrateDraw();
        return;
    }

    currentPlayer = 'X';
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWin();
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (checkDraw()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function celebrateWin(winner) {
    const winningCells = [];
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] === winner && boardState[b] === winner && boardState[c] === winner) {
            winningCells.push(cells[a], cells[b], cells[c]);
        }
    }

    // Calculate the center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Animate each winning cell to the center and fade out background/borders
    winningCells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2);
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'collectAndFix 1.5s ease forwards';

        // Fade out background and borders
        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    // Fade out non-winning cells
    cells.forEach((cell) => {
        if (!winningCells.includes(cell)) {
            cell.style.opacity = '0';
        }
    });

    // Show the winning message slightly below the center
    message.style.opacity = '1';
}

function celebrateDraw() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Separate X and O cells
    const xCells = Array.from(cells).filter(cell => cell.textContent === 'X');
    const oCells = Array.from(cells).filter(cell => cell.textContent === 'O');

    // Animate X cells to the left of the center
    xCells.forEach((cell, index) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2) - 60; // Move left
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'drawCollect 1.5s ease forwards';

        // Fade out background and borders
        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    // Animate O cells to the right of the center
    oCells.forEach((cell, index) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2) + 60; // Move right
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'drawCollect 1.5s ease forwards';

        // Fade out background and borders
        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    // Show the draw message slightly below the center
    message.style.opacity = '1';
}

function restartGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'winning');
        cell.style.animation = '';
        cell.style.opacity = '1';
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        cell.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    message.textContent = '';
    message.classList.remove('draw', 'multiplayer-on', 'multiplayer-off');
    message.style.opacity = '0';
    gameActive = true;
    currentPlayer = 'X';
    body.style.backgroundColor = ''; // Reset background color
}

function toggleMultiplayer() {
    isMultiplayer = !isMultiplayer; // Toggle multiplayer mode
    restartGame(); // Reset the game when switching modes

    // Add a class to the message for styling
    if (isMultiplayer) {
        message.textContent = "Multiplayer Mode: ON";
        message.classList.add('multiplayer-on');
        message.classList.remove('multiplayer-off');
    } else {
        message.textContent = "Multiplayer Mode: OFF";
        message.classList.add('multiplayer-off');
        message.classList.remove('multiplayer-on');
    }

    message.style.opacity = '1';
    setTimeout(() => {
        message.style.opacity = '0';
    }, 2000); // Hide the message after 2 seconds
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));



const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const connectionMessage = document.getElementById('connectionMessage');
const roomCodeInput = document.getElementById('roomCodeInput');


let roomCode = null;
let isHost = false;



const socket = io('http://localhost:3000');

// Function to check for a win
function checkWin() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    return null;
}

// Function to check for a draw
function checkDraw() {
    return boardState.every(cell => cell !== null);
}

// Function to handle cell clicks
function handleCellClick(event) {
    if (!roomCode || !gameActive || currentPlayer !== (isHost ? 'X' : 'O')) return;

    const cell = event.target;
    const index = cell.getAttribute('data-index');

    if (boardState[index]) return;

    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);

    socket.emit('makeMove', roomCode, index, currentPlayer);

    const winner = checkWin();
    if (winner) {
        message.textContent = `Player ${winner} wins! 🎉`;
        gameActive = false;
        celebrateWin(winner);
        return;
    }

    if (checkDraw()) {
        message.textContent = "It's a draw! 🤝";
        gameActive = false;
        celebrateDraw();
        return;
    }
}

// Function to celebrate a win
function celebrateWin(winner) {
    const winningCells = [];
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] === winner && boardState[b] === winner && boardState[c] === winner) {
            winningCells.push(cells[a], cells[b], cells[c]);
        }
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    winningCells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2);
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'collectAndFix 1.5s ease forwards';

        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    cells.forEach((cell) => {
        if (!winningCells.includes(cell)) {
            cell.style.opacity = '0';
        }
    });

    message.style.opacity = '1';
}

// Function to celebrate a draw
function celebrateDraw() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const xCells = Array.from(cells).filter(cell => cell.textContent === 'X');
    const oCells = Array.from(cells).filter(cell => cell.textContent === 'O');

    xCells.forEach((cell, index) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2) - 60;
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'drawCollect 1.5s ease forwards';

        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    oCells.forEach((cell, index) => {
        const rect = cell.getBoundingClientRect();
        const translateX = centerX - (rect.left + rect.width / 2) + 60;
        const translateY = centerY - (rect.top + rect.height / 2);

        cell.style.setProperty('--translateX', `${translateX}px`);
        cell.style.setProperty('--translateY', `${translateY}px`);
        cell.style.animation = 'drawCollect 1.5s ease forwards';

        cell.style.backgroundColor = 'transparent';
        cell.style.borderColor = 'transparent';
    });

    message.style.opacity = '1';
}

// Function to restart the game
function restartGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'winning');
        cell.style.animation = '';
        cell.style.opacity = '1';
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        cell.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    message.textContent = '';
    message.classList.remove('draw', 'multiplayer-on', 'multiplayer-off');
    message.style.opacity = '0';
    gameActive = true;
    currentPlayer = 'X';
    body.style.backgroundColor = '';
}

// Function to toggle multiplayer mode
function toggleMultiplayer() {
    isMultiplayer = !isMultiplayer;
    restartGame();

    if (isMultiplayer) {
        message.textContent = "Multiplayer Mode: ON";
        message.classList.add('multiplayer-on');
        message.classList.remove('multiplayer-off');
    } else {
        message.textContent = "Multiplayer Mode: OFF";
        message.classList.add('multiplayer-off');
        message.classList.remove('multiplayer-on');
    }

    message.style.opacity = '1';
    setTimeout(() => {
        message.style.opacity = '0';
    }, 2000);
}

// Function to generate a room
function generateRoom() {
    socket.emit('createRoom');
}

// Function to join a room
function joinRoom() {
    const code = roomCodeInput.value;
    if (code) {
        socket.emit('joinRoom', code);
    }
}

// Handle room creation
socket.on('roomCreated', (code) => {
    roomCode = code;
    isHost = true;
    roomCodeDisplay.textContent = `Room Code: ${code}`;
});

// Handle room joining
socket.on('roomJoined', (code) => {
    roomCode = code;
    roomCodeDisplay.textContent = `Joined Room: ${code}`;
});

// Handle game start
socket.on('startGame', (startingPlayer) => {
    currentPlayer = startingPlayer;
    gameActive = true;
    showConnectionMessage('Game started!');
});

// Handle moves from the other player
socket.on('moveMade', (index, player) => {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player);
    currentPlayer = player === 'X' ? 'O' : 'X';
});

// Handle player disconnection
socket.on('playerDisconnected', () => {
    showConnectionMessage('The other player has disconnected.');
    restartGame();
});

// Show connection/disconnection messages
function showConnectionMessage(msg) {
    connectionMessage.textContent = msg;
    connectionMessage.classList.add('show');
    setTimeout(() => {
        connectionMessage.classList.remove('show');
    }, 3000);
}

// Add event listeners to cells
cells.forEach(cell => cell.addEventListener('click', handleCellClick));


// Handle game won
socket.on('gameWon', (winner) => {
    message.textContent = `Player ${winner} wins! 🎉`;
    gameActive = false;
    celebrateWin(winner);
});

// Handle game draw
socket.on('gameDraw', () => {
    message.textContent = "It's a draw! 🤝";
    gameActive = false;
    celebrateDraw();
});

// Handle restart game
socket.on('restartGame', () => {
    restartGame();
});

// Function to restart the game
function restartGame() {
    boardState.fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'winning');
        cell.style.animation = '';
        cell.style.opacity = '1';
        cell.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        cell.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    });
    message.textContent = '';
    message.classList.remove('draw', 'multiplayer-on', 'multiplayer-off');
    message.style.opacity = '0';
    gameActive = true;
    currentPlayer = 'X';
    body.style.backgroundColor = '';
}

// Function to handle restart button click
function handleRestartClick() {
    if (roomCode) {
        socket.emit('restartGame', roomCode);
    }
    restartGame();
}

// Add event listener to the restart button
document.querySelector('.restart-button').addEventListener('click', handleRestartClick);

// Handle game moves
socket.on('makeMove', (roomCode, index, player) => {
    const room = rooms.get(roomCode);
    if (room && room.players.includes(socket.id)) {
        room.boardState[index] = player; // Update the board state
        io.to(roomCode).emit('moveMade', index, player);
        room.currentPlayer = player === 'X' ? 'O' : 'X';
        io.to(roomCode).emit('updatePlayer', room.currentPlayer);

        // Check for win or draw after each move
        const winner = checkWin(roomCode);
        if (winner) {
            io.to(roomCode).emit('gameWon', winner);
        } else if (checkDraw(roomCode)) {
            io.to(roomCode).emit('gameDraw');
        }
    }
});

