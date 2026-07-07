// ============================================
// SUPER JOGO DA VELHA - JavaScript Completo
// Todas as funcionalidades + efeitos visuais
// ============================================

// Game State
let gameState = {
    boards: [],
    winners: [],
    currentPlayer: 'X',
    forcedBoard: null,
    gameOver: false,
    winner: null
};

let isProcessingMove = false;

// Create the game board
function createBoard() {
    const container = document.getElementById('game-board');
    container.innerHTML = '';
    container.className = 'game-board';

    for (let boardIdx = 0; boardIdx < 9; boardIdx++) {
        const smallBoard = document.createElement('div');
        smallBoard.className = 'small-board';
        smallBoard.dataset.board = boardIdx;

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-3 gap-[5px]';

        for (let cellIdx = 0; cellIdx < 9; cellIdx++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.board = boardIdx;
            cell.dataset.cell = cellIdx;
            cell.onclick = () => makeMove(boardIdx, cellIdx);
            grid.appendChild(cell);
        }

        smallBoard.appendChild(grid);

        // Winner overlay
        const overlay = document.createElement('div');
        overlay.className = 'winner-overlay';
        overlay.style.display = 'none';
        overlay.dataset.overlayFor = boardIdx;
        smallBoard.appendChild(overlay);

        container.appendChild(smallBoard);
    }
}

// Check small board winner
function checkSmallWinner(boardIdx) {
    const b = gameState.boards[boardIdx];
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (const [a, b1, c] of lines) {
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
            return b[a];
        }
    }
    return null;
}

function isBoardFull(boardIdx) {
    return gameState.boards[boardIdx].every(cell => cell !== null);
}

function checkBigWinner() {
    const w = gameState.winners;
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (const [a, b, c] of lines) {
        if (w[a] && w[a] !== 'draw' && w[a] === w[b] && w[a] === w[c]) {
            return w[a];
        }
    }
    return null;
}

// Update UI
function updateUI() {
    const turnContainer = document.getElementById('turn-indicator');
    const symbolEl = document.getElementById('player-symbol');

    if (gameState.gameOver) {
        turnContainer.innerHTML = `<span style="color:#a1a1aa; font-size:1.1rem; padding:0 12px;">FIM DE JOGO</span>`;
    } else {
        if (!symbolEl) {
            turnContainer.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="turn-label">VEZ DO JOGADOR</div>
                    <div class="player-symbol" id="player-symbol">X</div>
                </div>
            `;
        }
        const currentSymbol = document.getElementById('player-symbol');
        if (currentSymbol) {
            currentSymbol.textContent = gameState.currentPlayer;
            currentSymbol.style.color = gameState.currentPlayer === 'X' ? '#60a5fa' : '#f87171';
            turnContainer.style.background = gameState.currentPlayer === 'X' 
                ? 'rgba(59, 130, 246, 0.1)' 
                : 'rgba(248, 113, 113, 0.1)';
        }
    }

    // Clear forced highlights
    document.querySelectorAll('.small-board').forEach(el => {
        el.classList.remove('forced');
    });

    // Highlight forced board
    if (gameState.forcedBoard !== null && !gameState.gameOver) {
        const forcedEl = document.querySelector(`.small-board[data-board="${gameState.forcedBoard}"]`);
        if (forcedEl) forcedEl.classList.add('forced');
    }

    // Status text
    const statusEl = document.getElementById('status');
    if (gameState.gameOver) {
        if (gameState.winner === 'draw') {
            statusEl.innerHTML = `<span style="color:#fbbf24;">O jogo terminou em empate!</span>`;
        } else {
            statusEl.innerHTML = `<span style="color:${gameState.winner === 'X' ? '#60a5fa' : '#f87171'};">Jogador ${gameState.winner} venceu!</span>`;
        }
    } else if (gameState.forcedBoard !== null) {
        statusEl.innerHTML = `Jogue no tabuleiro <strong style="color:#facc15;">#${gameState.forcedBoard + 1}</strong> (destacado)`;
    } else {
        statusEl.innerHTML = `Você pode jogar em <strong>qualquer tabuleiro</strong> disponível`;
    }

    // Update cells
    document.querySelectorAll('.cell').forEach(cellEl => {
        const b = parseInt(cellEl.dataset.board);
        const c = parseInt(cellEl.dataset.cell);
        const value = gameState.boards[b][c];
        const boardWon = gameState.winners[b] !== null;

        if (value) {
            cellEl.innerHTML = `<span class="${value === 'X' ? 'cell-x' : 'cell-o'}">${value}</span>`;
            cellEl.classList.add('occupied');
            cellEl.style.backgroundColor = value === 'X' ? '#1e3a8a30' : '#450a0a35';
        } else {
            cellEl.innerHTML = '';
            cellEl.classList.remove('occupied');
            cellEl.style.backgroundColor = '';
            cellEl.style.opacity = boardWon ? '0.4' : '1';
        }

        if (boardWon) {
            cellEl.onclick = null;
        } else {
            cellEl.onclick = () => makeMove(b, c);
        }
    });

    // Winner overlays + won styles
    document.querySelectorAll('.small-board').forEach(small => {
        const b = parseInt(small.dataset.board);
        const win = gameState.winners[b];
        small.classList.remove('won-x', 'won-o');

        if (win === 'X') small.classList.add('won-x');
        if (win === 'O') small.classList.add('won-o');
    });

    document.querySelectorAll('.winner-overlay').forEach(overlay => {
        const b = parseInt(overlay.dataset.overlayFor);
        const win = gameState.winners[b];

        if (win === 'X' || win === 'O') {
            overlay.innerHTML = win;
            overlay.style.color = win === 'X' ? '#60a5fa' : '#f87171';
            overlay.style.display = 'flex';
        } else if (win === 'draw') {
            overlay.innerHTML = '–';
            overlay.style.color = '#71717a';
            overlay.style.fontSize = '4rem';
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    });
}

// Make a move
function makeMove(boardIdx, cellIdx) {
    if (gameState.gameOver || isProcessingMove) return;

    const board = gameState.boards[boardIdx];
    if (board[cellIdx] !== null) return;
    if (gameState.winners[boardIdx] !== null) return;

    // Forced board check
    if (gameState.forcedBoard !== null && boardIdx !== gameState.forcedBoard) {
        const forcedFinished = gameState.winners[gameState.forcedBoard] !== null || isBoardFull(gameState.forcedBoard);
        if (!forcedFinished) {
            flashInvalidMove();
            return;
        }
    }

    // Valid move
    isProcessingMove = true;
    board[cellIdx] = gameState.currentPlayer;

    // Cell pop effect
    const cellEl = document.querySelector(`.cell[data-board="${boardIdx}"][data-cell="${cellIdx}"]`);
    if (cellEl) {
        cellEl.innerHTML = `<span class="${gameState.currentPlayer === 'X' ? 'cell-x' : 'cell-o'}">${gameState.currentPlayer}</span>`;
        cellEl.classList.add('occupied', 'cell-pop');
        cellEl.style.backgroundColor = gameState.currentPlayer === 'X' ? '#1e3a8a30' : '#450a0a35';

        setTimeout(() => {
            cellEl.classList.remove('cell-pop');
        }, 280);
    }

    // Check small win
    let smallWinner = checkSmallWinner(boardIdx);

    if (smallWinner) {
        gameState.winners[boardIdx] = smallWinner;

        // Small win pulse effect
        const smallBoardEl = document.querySelector(`.small-board[data-board="${boardIdx}"]`);
        if (smallBoardEl) {
            smallBoardEl.classList.add('small-win');
            setTimeout(() => smallBoardEl.classList.remove('small-win'), 650);
        }

        // Check big win
        if (checkBigWinner()) {
            gameState.gameOver = true;
            gameState.winner = smallWinner;
            updateUI();
            setTimeout(() => showWinModal(smallWinner), 350);
            isProcessingMove = false;
            return;
        }
    } else if (isBoardFull(boardIdx)) {
        gameState.winners[boardIdx] = 'draw';
    }

    // Set forced board
    gameState.forcedBoard = cellIdx;
    if (gameState.winners[gameState.forcedBoard] !== null || isBoardFull(gameState.forcedBoard)) {
        gameState.forcedBoard = null;
    }

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';

    // Check overall draw
    if (!gameState.gameOver) {
        const allFinished = gameState.winners.every(w => w !== null);
        if (allFinished) {
            gameState.gameOver = true;
            gameState.winner = 'draw';
            updateUI();
            setTimeout(showDrawModal, 350);
            isProcessingMove = false;
            return;
        }
    }

    updateUI();

    setTimeout(() => {
        isProcessingMove = false;
    }, 130);
}

function flashInvalidMove() {
    if (gameState.forcedBoard === null) return;
    const forcedEl = document.querySelector(`.small-board[data-board="${gameState.forcedBoard}"]`);
    if (!forcedEl) return;

    forcedEl.classList.remove('forced');
    forcedEl.style.boxShadow = '0 0 0 5px #ef4444, 0 0 0 16px rgba(239, 68, 68, 0.25)';

    setTimeout(() => {
        forcedEl.style.boxShadow = '';
        if (gameState.forcedBoard !== null && !gameState.gameOver) {
            forcedEl.classList.add('forced');
        }
    }, 650);
}

// Confetti
function launchConfetti() {
    const colors = ['#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa'];
    for (let i = 0; i < 95; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.zIndex = '99999';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-20px';
        conf.style.width = (Math.random() * 10 + 6) + 'px';
        conf.style.height = conf.style.width;
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        conf.style.opacity = (Math.random() * 0.5 + 0.65).toString();
        conf.style.pointerEvents = 'none';
        document.body.appendChild(conf);

        const duration = Math.random() * 2600 + 2600;
        const rotation = (Math.random() * 90 - 45) * 4;

        conf.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: conf.style.opacity },
            { transform: `translateY(${window.innerHeight + 150}px) rotate(${rotation}deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => conf.remove();
    }
}

// Show modals
function showWinModal(winner) {
    const modal = document.getElementById('modal');
    const inner = document.getElementById('modal-content-inner');

    inner.innerHTML = `
        <div style="margin-bottom: 24px;">
            <div style="font-size: 5.5rem; font-weight: 900; color: ${winner === 'X' ? '#60a5fa' : '#f87171'}; margin-bottom: 12px;">
                ${winner}
            </div>
            <div style="font-size: 2.25rem; font-weight: 700; margin-bottom: 8px;">VENCEU!</div>
            <p style="color: #a1a1aa; font-size: 1.1rem;">Jogador <strong style="color: ${winner === 'X' ? '#60a5fa' : '#f87171'}">${winner}</strong> é o campeão</p>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('show');

    setTimeout(() => launchConfetti(), 180);
}

function showDrawModal() {
    const modal = document.getElementById('modal');
    const inner = document.getElementById('modal-content-inner');

    inner.innerHTML = `
        <div style="margin-bottom: 24px;">
            <div style="font-size: 4.5rem; margin-bottom: 16px;">
                <i class="fa-solid fa-handshake" style="color:#fbbf24;"></i>
            </div>
            <div style="font-size: 2.25rem; font-weight: 700; margin-bottom: 8px;">EMPATE!</div>
            <p style="color: #a1a1aa; font-size: 1.1rem;">Nenhum jogador conseguiu a vitória</p>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    modal.classList.remove('show');
}

function restartFromModal() {
    closeModal();
    restartGame();
}

// Initialize game
function initGame() {
    gameState = {
        boards: Array.from({ length: 9 }, () => Array(9).fill(null)),
        winners: Array(9).fill(null),
        currentPlayer: 'X',
        forcedBoard: null,
        gameOver: false,
        winner: null
    };

    isProcessingMove = false;

    // Clean any stuck classes
    document.querySelectorAll('.small-board').forEach(el => {
        el.classList.remove('forced', 'won-x', 'won-o', 'small-win');
        el.style.boxShadow = '';
    });

    createBoard();
    updateUI();
}

function restartGame() {
    initGame();
}

// Rules Modal
function showRulesModal() {
    const modal = document.getElementById('modal');
    const inner = document.getElementById('modal-content-inner');

    inner.innerHTML = `
        <div style="text-align: left; max-width: 320px; margin: 0 auto;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <i class="fa-solid fa-book" style="font-size:1.75rem; color:#60a5fa;"></i>
                <div>
                    <div style="font-size:1.5rem; font-weight:700;">Como Jogar</div>
                    <div style="font-size:0.9rem; color:#a1a1aa;">Super Jogo da Velha</div>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:16px; font-size:0.95rem;">
                <div style="display:flex; gap:12px;">
                    <div style="width:24px; height:24px; background:rgba(59,130,246,0.15); color:#60a5fa; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">1</div>
                    <div><strong>Primeira jogada:</strong> O jogador X pode marcar em qualquer casa de qualquer tabuleiro.</div>
                </div>
                <div style="display:flex; gap:12px;">
                    <div style="width:24px; height:24px; background:rgba(59,130,246,0.15); color:#60a5fa; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">2</div>
                    <div><strong>Jogada obrigatória:</strong> Depois de jogar em uma casa, o próximo jogador deve jogar no tabuleiro que corresponde à posição marcada.</div>
                </div>
                <div style="display:flex; gap:12px;">
                    <div style="width:24px; height:24px; background:rgba(59,130,246,0.15); color:#60a5fa; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">3</div>
                    <div><strong>Exemplo:</strong> Se você jogar no canto superior direito de um tabuleiro, o oponente é obrigado a jogar no tabuleiro do canto superior direito do grande.</div>
                </div>
                <div style="display:flex; gap:12px;">
                    <div style="width:24px; height:24px; background:rgba(59,130,246,0.15); color:#60a5fa; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700; flex-shrink:0;">4</div>
                    <div><strong>Tabuleiro bloqueado:</strong> Se o tabuleiro enviado já estiver vencido ou empatado, o jogador pode escolher qualquer tabuleiro.</div>
                </div>
                <div style="padding-top:12px; border-top:1px solid #3f3f46; font-size:0.9rem;">
                    <strong>Vitória:</strong> Vence quem conseguir <strong>3 tabuleiros pequenos em linha</strong> no grande tabuleiro.
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('show');
}

// Keyboard support
function setupKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'r' && document.getElementById('modal').style.display !== 'flex') {
            restartGame();
        }
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal');
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
        }
    });
}

// Start game
function startGame() {
    initGame();
    setupKeyboard();

    // Easter egg - click title to restart
    const title = document.querySelector('h1');
    if (title) {
        title.style.cursor = 'pointer';
        title.onclick = () => restartGame();
    }

    // Initial status
    setTimeout(() => {
        const status = document.getElementById('status');
        if (status && !gameState.gameOver) {
            status.innerHTML = `Você pode jogar em <strong>qualquer tabuleiro</strong> disponível`;
        }
    }, 900);
}

window.onload = startGame;