let container = null;
let crossword = null;
let rows = 12;
let cols = 22;

function emptyGrid() {
    crossword.innerHTML = "";
    for (let i = 0; i < rows; i++) {
        const row = document.createElement("div");
        row.id = `row-${i}`;
        row.className = "row";
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("div");
            cell.id = `cell-${i}-${j}`;
            cell.className = "cell";
            cell.addEventListener("contextmenu", toggleBlack);
            row.appendChild(cell)

            const number = document.createElement("div");
            number.id = `number-${i}-${j}`;
            number.className = "number";
            cell.appendChild(number);

            const input = document.createElement("input");
            input.id = `input-${i}-${j}`;
            input.className = "input";
            input.onkeydown = onInput;
            cell.appendChild(input);

        }
        crossword.appendChild(row);
    }
}

function onInput(event) {
    event.preventDefault();
    const [i, j] = this.id.split("-").slice(1);
    const cell = document.getElementById(`cell-${i}-${j}`);
    const number = document.getElementById(`number-${i}-${j}`);
    if (/^[a-zA-Z]$/.test(event.key)) {
        this.value = event.key.toUpperCase();
    } else if (event.key === "Backspace") {
        this.value = "";
    } else if (event.key === " ") {
        number.textContent = "";
    } else if (/^[0-9]$/.test(event.key) && number.textContent.length < 2) {
        number.textContent += event.key;
    } else if (event.key === "?") {
        cell.classList.toggle("maybe");
    } else if (/^Arrow/.test(event.key)) {
        let ni = parseInt(i);
        let nj = parseInt(j);
        if (event.key === "ArrowRight") {
            nj += 1;
        } else if (event.key === "ArrowLeft") {
            nj -= 1;
        } else if (event.key === "ArrowDown") {
            ni += 1;
        } else if (event.key === "ArrowUp") {
            ni -= 1;
        }
        if (ni < 0 || ni >= rows || nj < 0 || nj >= cols) {
            return;
        }
        const next = document.getElementById(`input-${ni}-${nj}`);
        next.focus();
    }
}

function toggleBlack(event) {
    event.preventDefault();
    this.classList.toggle("black");
    const [i, j] = this.id.split("-").slice(1);
    const input = document.getElementById(`input-${i}-${j}`);
    input.value = "";
    if (!this.classList.contains("black")) {
        input.focus()
    }
}

window.onload = function () {
    container = document.getElementById('container');
    crossword = document.getElementById('crossword');
    emptyGrid();
}
