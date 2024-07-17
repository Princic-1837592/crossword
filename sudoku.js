function emptySudoku(_event) {
    rows.value = "9";
    cols.value = "9";
    crossword.innerHTML = "";
    crossword.className = "";
    crossword.classList.add("floating");
    crossword.classList.add("sudoku");
    horizontals.style.visibility = "hidden";
    verticals.style.visibility = "hidden";
    for (let i = 0; i < rows.value; i++) {
        const row = document.createElement("div");
        row.id = `row-${i}`;
        row.className = "row";
        for (let j = 0; j < cols.value; j++) {
            const cell = document.createElement("div");
            cell.id = `cell-${i}-${j}`;
            cell.className = "cell";
            cell.addEventListener("contextmenu", e => {
                e.preventDefault();
            });
            row.appendChild(cell)

            for (let n = 1; n <= 9; n++) {
                const annotation = document.createElement("span");
                annotation.id = `annotation-${i}-${j}-${n}`;
                annotation.classList.add("annotation");
                annotation.classList.add(`annotation-${n}`);
                cell.appendChild(annotation);
            }

            const input = document.createElement("input");
            input.id = `input-${i}-${j}`;
            input.className = "input";
            input.autocomplete = "off";
            input.maxLength = 1;
            input.addEventListener("keydown", onInputSudoku);
            cell.appendChild(input);
        }
        crossword.appendChild(row);
    }
}

function onInputSudoku(event) {
    event.preventDefault();
    if (/^[1-9]$/.test(event.key)) {
        if (event.ctrlKey || event.altKey) {
            event.target.parentElement.querySelectorAll(".annotation")[parseInt(event.key) - 1].classList.toggle("visible");
            event.target.value = "";
        } else {
            event.target.value = event.key;
            for (const annotation of event.target.parentElement.querySelectorAll(".annotation")) {
                annotation.classList.remove("visible");
            }
        }
    } else if (event.key === "Backspace") {
        event.target.value = "";
        event.target.parentElement.classList.remove("error");
    } else if (/^Arrow/.test(event.key)) {
        const [i, j] = this.id.split("-").slice(1);
        handleArrowMove(event, i, j);
    }
}

function checkSudoku(_event) {
    if (!crossword.classList.contains("sudoku")) {
        return;
    }
    // https://gist.github.com/micmmakarov/cb0bc71938321e2935022ccc7e763977
    const boardWidth = 9;
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    for (let y = 0; y < boardWidth; y++) {
        for (let x = 0; x < boardWidth; x++) {
            const input = document.getElementById(`input-${y}-${x}`);
            if (input.value !== "") {
                board[y][x] = parseInt(input.value);
            }
        }
    }
    const smallSquareSize = Math.sqrt(boardWidth)
    const boardSize = boardWidth ** 2;
    const boardArray = new Array(3 * boardSize + boardWidth);
    for (let i = 0; i < boardWidth; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (board[i][j] !== 0) {
                let addressCol = j * boardWidth + board[i][j];
                let addressRow = boardSize + i * boardWidth + board[i][j];
                let addressSquare = boardSize * 2 + (Math.floor((i + 1) / smallSquareSize - 0.1) * smallSquareSize + Math.floor((j + 1) / smallSquareSize - 0.1)) * boardWidth + board[i][j];
                if (boardArray[addressSquare] !== undefined || boardArray[addressCol] !== undefined || boardArray[addressRow] !== undefined || board[i][j] > boardWidth || board[i][j] < 0) {
                    document.getElementById(`cell-${i}-${j}`).classList.add("error");
                } else {
                    boardArray[addressCol] = true;
                    boardArray[addressRow] = true;
                    boardArray[addressSquare] = true;
                }
            }
        }
    }
}

window.addEventListener(
    "load",
    () => {
        document.getElementById("sudoku").addEventListener("click", emptySudoku);

        document.getElementById("check-sudoku").addEventListener("click", checkSudoku);
    }
);
