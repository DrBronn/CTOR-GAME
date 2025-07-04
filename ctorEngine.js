function cloneBoard(board) {
  return board.map(row => row.slice());
}

function isInside(x, y) {
  return x >= 0 && x < 19 && y >= 0 && y < 19;
}

function getOpponent(player) {
  return player === "black" ? "white" : "black";
}

// Проверка окрестности 3x3 вокруг (cx, cy)
function convertOpponent(board, cx, cy, player, converted) {
  if (board[cy][cx] !== getOpponent(player)) return;

  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (isInside(nx, ny) && board[ny][nx] === player) {
        count++;
      }
    }
  }

  if (count >= 5) {
    board[cy][cx] = player;
    converted.push([cx, cy]);
  }
}

// Проверка после действия
function checkConversions(board, player, converted) {
  const opp = getOpponent(player);
  for (let y = 0; y < 19; y++) {
    for (let x = 0; x < 19; x++) {
      convertOpponent(board, x, y, player, converted);
    }
  }
}

function applyTurn(board, turnArray, player) {
  const newBoard = cloneBoard(board);
  const converted = [];

  for (const action of turnArray) {
    const type = action.type;

    if (type === "place") {
      const [x, y] = action.at;
      if (!isInside(x, y) || newBoard[y][x] !== null)
        throw new Error(`Недопустимое размещение на (${x}, ${y})`);
      newBoard[y][x] = player;
      checkConversions(newBoard, player, converted);
    }

    else if (type === "move") {
      const [fx, fy] = action.from;
      const [tx, ty] = action.to;
      const dx = Math.abs(tx - fx);
      const dy = Math.abs(ty - fy);

      if (!isInside(fx, fy) || !isInside(tx, ty))
        throw new Error("Выход за пределы доски");

      if (newBoard[fy][fx] !== player)
        throw new Error("Фишка на начальной позиции не принадлежит игроку");

      if (newBoard[ty][tx] !== null)
        throw new Error("Целевая клетка занята");

      if (!((dx === 0 && (dy === 1 || dy === 2)) || (dy === 0 && (dx === 1 || dx === 2))))
        throw new Error("Допустимо только движение на 1 или 2 клетки по прямой");

      newBoard[fy][fx] = null;
      newBoard[ty][tx] = player;
      checkConversions(newBoard, player, converted);
    }

    else if (type === "combine") {
      const [a, b] = action.sources;
      const [ax, ay] = a;
      const [bx, by] = b;
      const [tx, ty] = action.target;

      if (
        !isInside(ax, ay) || !isInside(bx, by) || !isInside(tx, ty) ||
        newBoard[ay][ax] !== player || newBoard[by][bx] !== player ||
        newBoard[ty][tx] !== null
      ) {
        throw new Error("Недопустимое объединение");
      }

      newBoard[ay][ax] = null;
      newBoard[by][bx] = null;
      newBoard[ty][tx] = player;
      checkConversions(newBoard, player, converted);
    }

    else {
      throw new Error(`Неизвестный тип действия: ${type}`);
    }
  }

  return { board: newBoard, converted };
}