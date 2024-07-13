let container = null;
let crossword = null;
let rows = null;
let cols = null;
let horizontal = true;

function emptyGrid() {
    crossword.innerHTML = "";
    for (let i = 0; i < rows.value; i++) {
        const row = document.createElement("div");
        row.id = `row-${i}`;
        row.className = "row";
        for (let j = 0; j < cols.value; j++) {
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
            input.autocomplete = "off";
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
        const ni = parseInt(i) + (horizontal ? 0 : 1);
        const nj = parseInt(j) + (horizontal ? 1 : 0);
        const next = document.getElementById(`cell-${ni}-${nj}`);
        if (next && !next.classList.contains("black")) {
            document.getElementById(`input-${ni}-${nj}`).focus();
        } else {
            this.blur();
        }
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
        if (ni < 0 || ni >= rows.value || nj < 0 || nj >= cols.value) {
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
    if (!this.classList.contains("black")) {
        input.focus()
    }
}

function fill() {
    let n = 1;
    for (let i = 0; i < rows.value; i++) {
        for (let j = 0; j < cols.value; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            const number = document.getElementById(`number-${i}-${j}`);
            number.textContent = "";
            if (!cell.classList.contains("black")) {
                const hasFixedBeforeH = j === 0 ||
                    document.getElementById(`cell-${i}-${j - 1}`).classList.contains("black");
                const hasSpaceAfterH = j < cols.value - 1 &&
                    !document.getElementById(`cell-${i}-${j + 1}`).classList.contains("black");
                const hasFixedBeforeV = i === 0 ||
                    document.getElementById(`cell-${i - 1}-${j}`).classList.contains("black");
                const hasSpaceAfterV = i < rows.value - 1 &&
                    !document.getElementById(`cell-${i + 1}-${j}`).classList.contains("black");
                if (hasFixedBeforeH && hasSpaceAfterH || hasFixedBeforeV && hasSpaceAfterV) {
                    number.textContent = `${n}`;
                    n += 1;
                }
            }
        }
    }
}

function changeOrientation() {
    for (const o of this.children) {
        o.classList.toggle("selected");
    }
    horizontal = !horizontal;
}

window.onload = function () {
    container = document.getElementById("container");
    crossword = document.getElementById("crossword");
    rows = document.getElementById("rows");
    cols = document.getElementById("cols");
    document.getElementById("start").addEventListener("click", emptyGrid);
    document.getElementById("fill").addEventListener("click", fill);
    document.getElementById("orientations").addEventListener("mouseup", changeOrientation);
    const selected = document.getElementById(horizontal ? "horizontal" : "vertical");
    selected.classList.add("selected");
    emptyGrid();
}
