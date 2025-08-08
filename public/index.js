const CONFIG = {
  canvasPadding: 20,
  enforceUniqueness: true,
  sunColor: '#ffd54d',
  moonColor: '#5fa9ff',
  gridLine: '#36424d',
  bg: '#141c23',
  invalidTint: 'rgba(255,86,86,0.25)',
  conflictTint: 'rgba(255,170,58,0.28)',
  highlightAnimationMs: 420,
};

const canvas = document.getElementById('canvas');
const sizeInput = document.getElementById('sizeInput');
const prefillInput = document.getElementById('prefillInput');
const newBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const solveBtn = document.getElementById('solveBtn');
const messageEl = document.getElementById('message');
const timeEl = document.getElementById('time');
const filledCellsEl = document.getElementById('filledCells');
const totalCellsEl = document.getElementById('totalCells');
const validStatusEl = document.getElementById('validStatus');
const playerNameEl = document.getElementById('playerName');

const ctx = canvas.getContext('2d');

let size = 8;
let cellSize = 50;
let gridOriginX = 0;
let gridOriginY = 0;

let grid = [];
let locked = [];
let solution = [];
let startTime = null;
let timerHandle = null;

let lastHintInfo = null;
let lastClickHighlight = null;

class SunFace {
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
  }
  draw() {
    const R = this.r * 0.82;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    const spikes = 12;
    for (let i = 0; i < spikes; i++) {
      const angle = (i / spikes) * Math.PI * 2;
      const outerR = R * 1.25;
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      const midA = angle + Math.PI / spikes;
      ctx.lineTo(Math.cos(midA) * R, Math.sin(midA) * R);
    }
    ctx.closePath();
    ctx.fillStyle = CONFIG.sunColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#ffefb6';
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-R * 0.25, -R * 0.15, R * 0.11, 0, Math.PI * 2);
    ctx.arc(R * 0.25, -R * 0.15, R * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = R * 0.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.4, Math.PI * 0.15, Math.PI - Math.PI * 0.15);
    ctx.stroke();
    ctx.restore();
  }
}

class MoonStar {
  constructor(x, y, r) {
    this.x = x; this.y = y; this.r = r;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const outer = this.r * 0.95;
    const inner = outer * 0.42;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (Math.PI / 5) * i;
      const radius = i % 2 === 0 ? outer : inner;
      ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
    }
    ctx.closePath();
    ctx.fillStyle = CONFIG.moonColor;
    ctx.fill();
    ctx.restore();
  }
}

function setCanvasSize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function initArrays() {
  grid = Array.from({ length: size }, () => Array(size).fill(null));
  locked = Array.from({ length: size }, () => Array(size).fill(false));
  solution = [];
}

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateSolution(targetSize) {
  const board = Array.from({ length: targetSize }, () => Array(targetSize).fill(null));
  const half = targetSize / 2;
  const symbols = ['S', 'M'];

  function noThreeLine(line) {
    for (let i = 0; i < line.length - 2; i++) {
      if (line[i] && line[i] === line[i + 1] && line[i] === line[i + 2]) return false;
    }
    return true;
  }

  function countsOK(line) {
    const s = line.filter(c => c === 'S').length;
    const m = line.filter(c => c === 'M').length;
    if (s > half || m > half) return false;
    return true;
  }

  function lineCompleteValid(line) {
    const s = line.filter(c => c === 'S').length;
    const m = line.filter(c => c === 'M').length;
    return s === half && m === half && noThreeLine(line);
  }

  function getCol(c) { return board.map(r => r[c]); }

  function uniquenessPartialRows() {
    if (!CONFIG.enforceUniqueness) return true;
    const seen = new Set();
    for (const row of board) {
      if (row.some(c => c === null)) continue;
      const key = row.join('');
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  }

  function uniquenessPartialCols() {
    if (!CONFIG.enforceUniqueness) return true;
    const seen = new Set();
    for (let c = 0; c < targetSize; c++) {
      const col = getCol(c);
      if (col.some(c2 => c2 === null)) continue;
      const key = col.join('');
      if (seen.has(key)) return false;
      seen.add(key);
    }
    return true;
  }

  function backtrack(r, c) {
    if (r === targetSize) return true;
    const nr = c === targetSize - 1 ? r + 1 : r;
    const nc = c === targetSize - 1 ? 0 : c + 1;
    const attempt = [...symbols].sort(() => Math.random() - 0.5);

    for (const sym of attempt) {
      board[r][c] = sym;

      if (!noThreeLine(board[r])) { board[r][c] = null; continue; }
      if (!countsOK(board[r])) { board[r][c] = null; continue; }
      if (!uniquenessPartialRows()) { board[r][c] = null; continue; }

      const col = getCol(c);
      if (!noThreeLine(col)) { board[r][c] = null; continue; }
      if (!countsOK(col)) { board[r][c] = null; continue; }
      if (!uniquenessPartialCols()) { board[r][c] = null; continue; }

      if (c === targetSize - 1 && !lineCompleteValid(board[r])) { board[r][c] = null; continue; }
      if (r === targetSize - 1 && !lineCompleteValid(col)) { board[r][c] = null; continue; }

      if (backtrack(nr, nc)) return true;
      board[r][c] = null;
    }
    return false;
  }

  if (!backtrack(0, 0)) throw new Error('Failed to generate solution');
  return board;
}

function applyPrefillFromSolution(full, percentKeep) {
  const total = size * size;
  const toReveal = Math.round((percentKeep / 100) * total);

  const indices = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) indices.push([r, c]);
  indices.sort(() => Math.random() - 0.5);

  const revealSet = new Set(indices.slice(0, toReveal).map(([r, c]) => r + '-' + c));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (revealSet.has(r + '-' + c)) {
        grid[r][c] = full[r][c];
        locked[r][c] = true;
      } else {
        grid[r][c] = null;
        locked[r][c] = false;
      }
    }
  }
}

function validateGrid(includeCompleteness = true) {
  const half = size / 2;
  const invalidCells = new Set();
  const rowIssues = [];
  const colIssues = [];
  const uniquenessIssues = { rows: [], cols: [] };

  function markRow(r) { for (let c = 0; c < size; c++) invalidCells.add(r + '-' + c); }
  function markCol(c) { for (let r = 0; r < size; r++) invalidCells.add(r + '-' + c); }
  function noThree(line) {
    for (let i = 0; i < line.length - 2; i++) {
      if (line[i] && line[i] === line[i + 1] && line[i] === line[i + 2]) return false;
    }
    return true;
  }

  for (let r = 0; r < size; r++) {
    const row = grid[r];
    const s = row.filter(v => v === 'S').length;
    const m = row.filter(v => v === 'M').length;
    const filled = row.every(v => v !== null);
    const threeOk = noThree(row);

    if (!threeOk) { markRow(r); rowIssues.push({ r, reason: 'three' }); }
    if (s > half || m > half) { markRow(r); rowIssues.push({ r, reason: 'overflow' }); }
    if (filled && (s !== half || m !== half)) { markRow(r); rowIssues.push({ r, reason: 'balance' }); }
  }

  for (let c = 0; c < size; c++) {
    const col = grid.map(r => r[c]);
    const s = col.filter(v => v === 'S').length;
    const m = col.filter(v => v === 'M').length;
    const filled = col.every(v => v !== null);
    const threeOk = noThree(col);

    if (!threeOk) { markCol(c); colIssues.push({ c, reason: 'three' }); }
    if (s > half || m > half) { markCol(c); colIssues.push({ c, reason: 'overflow' }); }
    if (filled && (s !== half || m !== half)) { markCol(c); colIssues.push({ c, reason: 'balance' }); }
  }

  if (CONFIG.enforceUniqueness) {
    const rowMap = new Map();
    for (let r = 0; r < size; r++) {
      const row = grid[r];
      if (!row.every(v => v !== null)) continue;
      const key = row.join('');
      if (rowMap.has(key)) {
        uniquenessIssues.rows.push(r);
        uniquenessIssues.rows.push(rowMap.get(key));
        markRow(r);
        markRow(rowMap.get(key));
      } else rowMap.set(key, r);
    }

    const colMap = new Map();
    for (let c = 0; c < size; c++) {
      const col = grid.map(r => r[c]);
      if (!col.every(v => v !== null)) continue;
      const key = col.join('');
      if (colMap.has(key)) {
        uniquenessIssues.cols.push(c);
        uniquenessIssues.cols.push(colMap.get(key));
        markCol(c);
        markCol(colMap.get(key));
      } else colMap.set(key, c);
    }
  }

  const totalFilled = grid.flat().filter(v => v !== null).length;
  const complete = totalFilled === size * size;
  let valid = invalidCells.size === 0;

  if (includeCompleteness && complete && valid) {
    valid = true;
  } else if (includeCompleteness && !complete) {
    valid = false;
  }

  return {
    valid,
    complete,
    invalidCells,
    rowIssues,
    colIssues,
    uniquenessIssues,
    totalFilled
  };
}

function recomputeLayout() {
  const w = canvas.width;
  const h = canvas.height;
  const availW = w - CONFIG.canvasPadding * 2;
  const availH = h - CONFIG.canvasPadding * 2;
  cellSize = Math.floor(Math.min(availW, availH) / size);
  gridOriginX = (w - cellSize * size) / 2;
  gridOriginY = (h - cellSize * size) / 2;
}

function clearCanvas() {
  ctx.fillStyle = CONFIG.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGridLines() {
  ctx.strokeStyle = CONFIG.gridLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(gridOriginX + i * cellSize + 0.5, gridOriginY);
    ctx.lineTo(gridOriginX + i * cellSize + 0.5, gridOriginY + size * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gridOriginX, gridOriginY + i * cellSize + 0.5);
    ctx.lineTo(gridOriginX + size * cellSize, gridOriginY + i * cellSize + 0.5);
    ctx.stroke();
  }
}

function drawSymbols(invalidCells) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const x = gridOriginX + c * cellSize;
      const y = gridOriginY + r * cellSize;
      const centerX = x + cellSize / 2;
      const centerY = y + cellSize / 2;
      if (locked[r][c]) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x, y, cellSize, cellSize);
      }
      if (invalidCells && invalidCells.has(r + '-' + c)) {
        ctx.fillStyle = CONFIG.invalidTint;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
      if (lastClickHighlight && lastClickHighlight.r === r && lastClickHighlight.c === c) {
        const age = performance.now() - lastClickHighlight.time;
        if (age < CONFIG.highlightAnimationMs) {
          const alpha = 1 - age / CONFIG.highlightAnimationMs;
            ctx.fillStyle = `rgba(255,202,56,${0.35 * alpha})`;
            ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          lastClickHighlight = null;
        }
      }
      const val = grid[r][c];
      if (val === 'S') {
        const sun = new SunFace(centerX, centerY, cellSize * 0.38);
        sun.draw();
      } else if (val === 'M') {
        const moon = new MoonStar(centerX, centerY, cellSize * 0.38);
        moon.draw();
      }
    }
  }
}

function drawStatusOverlay(validation) {
  if (CONFIG.enforceUniqueness) {
    ctx.save();
    ctx.fillStyle = CONFIG.conflictTint;
    const dupRows = [...new Set(validation.uniquenessIssues.rows)];
    dupRows.forEach(r => {
      ctx.fillRect(gridOriginX, gridOriginY + r * cellSize, cellSize * size, cellSize);
    });
    const dupCols = [...new Set(validation.uniquenessIssues.cols)];
    dupCols.forEach(c => {
      ctx.fillRect(gridOriginX + c * cellSize, gridOriginY, cellSize, cellSize * size);
    });
    ctx.restore();
  }
}

function render() {
  recomputeLayout();
  clearCanvas();
  const v = validateGrid(false);
  drawStatusOverlay(v);
  drawGridLines();
  drawSymbols(v.invalidCells);
  updateInfo(v);
  requestAnimationFrame(() => {
    if (lastClickHighlight) {
      const age = performance.now() - lastClickHighlight.time;
      if (age < CONFIG.highlightAnimationMs) {
        render();
      }
    }
  });
}

function updateInfo(validation) {
  filledCellsEl.textContent = validation.totalFilled;
  totalCellsEl.textContent = size * size;

  if (validation.complete && validation.invalidCells.size === 0) {
    validStatusEl.textContent = 'Solved';
    validStatusEl.parentElement.className = 'badge good';
  } else if (validation.invalidCells.size === 0) {
    validStatusEl.textContent = 'OK (in progress)';
    validStatusEl.parentElement.className = 'badge';
  } else {
    validStatusEl.textContent = 'Issues';
    validStatusEl.parentElement.className = 'badge bad';
  }
}

function startTimer() {
  stopTimer();
  startTime = performance.now();
  timerHandle = setInterval(() => {
    const ms = performance.now() - startTime;
    timeEl.textContent = formatTime(ms);
  }, 250);
}

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

canvas.addEventListener('click', (e) => {
  if (!grid.length) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const c = Math.floor((x - gridOriginX) / cellSize);
  const r = Math.floor((y - gridOriginY) / cellSize);
  if (r < 0 || c < 0 || r >= size || c >= size) return;
  if (locked[r][c]) {
    flashMessage('Prefilled cell', 'warn', 900);
    return;
  }
  cycleCell(r, c);
  lastClickHighlight = { r, c, time: performance.now() };
  const v = validateGrid();
  if (v.complete && v.invalidCells.size === 0) {
    stopTimer();
    flashMessage('Puzzle solved! Great job ' + (playerNameEl.value.trim() || 'Player') + ' 🎉', 'good', 6000);
    solveBtn.disabled = true;
    hintBtn.disabled = true;
  }
  render();
});

function cycleCell(r, c) {
  const current = grid[r][c];
  if (current === null) grid[r][c] = 'S';
  else if (current === 'S') grid[r][c] = 'M';
  else grid[r][c] = null;
}

hintBtn.addEventListener('click', () => {
  const v = validateGrid(false);
  if (v.invalidCells.size === 0) {
    flashMessage('No structural issues detected yet (might still be logically unsolved).', 'warn', 3000);
  } else {
    flashMessage(`Highlighted ${v.invalidCells.size} invalid cell(s).`, 'bad', 2500);
  }
  lastHintInfo = v;
  render();
});

resetBtn.addEventListener('click', () => {
  if (!solution.length) return;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!locked[r][c]) grid[r][c] = null;
    }
  }
  flashMessage('Board reset to initial puzzle.', 'warn', 1800);
  startTimer();
  solveBtn.disabled = false;
  hintBtn.disabled = false;
  render();
});

solveBtn.addEventListener('click', () => {
  if (!solution.length) return;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      grid[r][c] = solution[r][c];
      locked[r][c] = true;
    }
  }
  stopTimer();
  flashMessage('Solution revealed.', 'bad', 3000);
  render();
  solveBtn.disabled = true;
  hintBtn.disabled = true;
});

newBtn.addEventListener('click', () => {
  newGame();
});

function newGame() {
  size = parseInt(sizeInput.value, 10);
  if (isNaN(size) || size < 4 || size > 20 || size % 2 !== 0) {
    flashMessage('Size must be an even number between 4 and 20.', 'bad', 2600);
    return;
  }
  const prefill = Math.min(Math.max(parseInt(prefillInput.value, 10) || 0, 0), 90);

  initArrays();
  try {
    solution = generateSolution(size);
    applyPrefillFromSolution(solution, prefill);
  } catch (e) {
    flashMessage('Generation failed, try again.', 'bad', 2500);
    return;
  }
  startTimer();
  timeEl.textContent = '00:00';
  flashMessage('New puzzle created.', 'good', 1600);
  resetBtn.disabled = false;
  hintBtn.disabled = false;
  solveBtn.disabled = false;
  render();
}

let messageTimeout = null;
function flashMessage(text, type = '', ms = 2000) {
  messageEl.className = '';
  messageEl.textContent = text;
  if (type) messageEl.classList.add(type);
  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = '';
  }, ms);
}

window.addEventListener('resize', () => {
  setCanvasSize();
  render();
});

setCanvasSize();
newGame();

window._debug = { grid, locked, solution, validateGrid };
