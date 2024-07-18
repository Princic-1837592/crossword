let sudoku = null;
let sudokuRows = null;
let sudokuCols = null;
let sudokuSquares = null;

function emptySudoku(_event) {
    crosswordContainer.innerHTML = "";

    rows.value = "9";
    cols.value = "9";

    sudoku = document.createElement("div");
    sudoku.id = "crossword";
    sudoku.classList.add("sudoku", "floating");
    crosswordContainer.appendChild(sudoku);

    sudokuRows = document.createElement("div");
    sudokuRows.id = "sudoku-rows";
    sudokuRows.classList.add("floating", "pass-through");
    crosswordContainer.appendChild(sudokuRows);

    sudokuCols = document.createElement("div");
    sudokuCols.id = "sudoku-cols";
    sudokuCols.classList.add("floating", "pass-through");
    crosswordContainer.appendChild(sudokuCols);

    sudokuSquares = document.createElement("div");
    sudokuSquares.id = "sudoku-squares";
    sudokuSquares.classList.add("floating", "pass-through");
    crosswordContainer.appendChild(sudokuSquares);

    for (let i = 0; i < 9; i++) {
        const row = document.createElement("div");
        row.id = `row-${i}`;
        row.className = "row";
        for (let j = 0; j < 9; j++) {
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
        sudoku.appendChild(row);
    }

    for (let i = 0; i < 9; i++) {
        const r = document.createElement("div");
        r.id = `sudoku-row-${i}`;
        r.classList.add("sudoku-row", "overlay", "pass-through");
        sudokuRows.appendChild(r);
    }
    for (let j = 0; j < 9; j++) {
        const c = document.createElement("div");
        c.id = `sudoku-col-${j}`;
        c.classList.add("sudoku-col", "overlay", "pass-through");
        sudokuCols.appendChild(c);
    }
    for (let i = 0; i < 3; i++) {
        const ssr = document.createElement("div");
        ssr.id = `sudoku-square-row-${i}`;
        ssr.className = "sudoku-square-row";
        sudokuSquares.appendChild(ssr);
        for (let j = 0; j < 3; j++) {
            const ss = document.createElement("div");
            ss.id = `sudoku-square-${i}-${j}`;
            ss.classList.add("sudoku-square", "overlay", "pass-through");
            ssr.appendChild(ss);
        }
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
    if (document.querySelector(".sudoku") === null) {
        return;
    }
    // https://gist.github.com/micmmakarov/cb0bc71938321e2935022ccc7e763977
    const boardWidth = 9;
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    for (let i = 0; i < boardWidth; i++) {
        for (let j = 0; j < boardWidth; j++) {
            const input = document.getElementById(`input-${i}-${j}`);
            if (input.value !== "") {
                board[i][j] = parseInt(input.value);
            }
        }
    }
    const smallSquareSize = Math.sqrt(boardWidth)
    const boardSize = boardWidth ** 2;
    const boardArray = new Array(3 * boardSize + boardWidth).fill(false);
    for (let i = 0; i < boardWidth; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (board[i][j] !== 0) {
                let addressCol = j * boardWidth + board[i][j];
                let addressRow = boardSize + i * boardWidth + board[i][j];
                let addressSquare = boardSize * 2 + (Math.floor((i + 1) / smallSquareSize - 0.1) * smallSquareSize + Math.floor((j + 1) / smallSquareSize - 0.1)) * boardWidth + board[i][j];
                if (boardArray[addressSquare]) {
                    document.getElementById(`sudoku-square-${Math.floor(i / 3)}-${Math.floor(j / 3)}`).classList.add("error");
                }
                if (boardArray[addressCol]) {
                    document.getElementById(`sudoku-col-${j}`).classList.add("error");
                }
                if (boardArray[addressRow]) {
                    document.getElementById(`sudoku-row-${i}`).classList.add("error");
                }
                boardArray[addressCol] = true;
                boardArray[addressRow] = true;
                boardArray[addressSquare] = true;
            }
        }
    }
    setTimeout(
        () => {
            for (const error of document.querySelectorAll(".error")) {
                error.classList.remove("error");
            }
        },
        5000
    );
}

window.addEventListener(
    "load",
    () => {
        document.getElementById("sudoku-button").addEventListener("click", emptySudoku);

        document.getElementById("check-sudoku").addEventListener("click", checkSudoku);
    }
);
