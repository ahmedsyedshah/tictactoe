const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map(); // Store room codes and their players

// Generate a random 6-digit room code
function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to check for a win
function checkWin(boardState) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a]; // Return the winning player ('X' or 'O')
        }
    }
    return null; // No winner
}

// Function to check for a draw
function checkDraw(boardState) {
    return boardState.every(cell => cell !== null); // All cells are filled
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle room creation
    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, { players: [socket.id], boardState: Array(9).fill(null), currentPlayer: 'X' });
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    // Handle joining a room
    socket.on('joinRoom', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room && room.players.length < 2) {
            room.players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('roomJoined', roomCode);
            io.to(roomCode).emit('startGame', room.currentPlayer);
        } else {
            socket.emit('roomError', 'Room is full or does not exist.');
        }
    });

    // Handle game moves
    socket.on('makeMove', (roomCode, index, player) => {
        const room = rooms.get(roomCode);
        if (room && room.players.includes(socket.id)) {
            room.boardState[index] = player; // Update the board state
            io.to(roomCode).emit('moveMade', index, player);
            room.currentPlayer = player === 'X' ? 'O' : 'X'; // Switch turns
            io.to(roomCode).emit('updatePlayer', room.currentPlayer);

            // Check for win or draw
            const winner = checkWin(room.boardState);
            if (winner) {
                io.to(roomCode).emit('gameWon', winner);
            } else if (checkDraw(room.boardState)) {
                io.to(roomCode).emit('gameDraw');
            }
        }
    });

    // Handle restart game
    socket.on('restartGame', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room) {
            room.boardState = Array(9).fill(null); // Reset the board state
            room.currentPlayer = 'X'; // Reset to player X
            io.to(roomCode).emit('restartGame');
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        for (const [roomCode, room] of rooms.entries()) {
            if (room.players.includes(socket.id)) {
                io.to(roomCode).emit('playerDisconnected');
                rooms.delete(roomCode);
            }
        }
    });
});

// Serve the game.html file at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});