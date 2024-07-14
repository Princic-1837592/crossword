let container = null;
let crossword = null;
let rows = null;
let cols = null;
let horizontal = true;
let fileHandler = null;

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
            input.addEventListener("auxclick", onWheelClicked)
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
        if (this.value === "") {
            const pi = parseInt(i) - (horizontal ? 0 : 1);
            const pj = parseInt(j) - (horizontal ? 1 : 0);
            const prev = document.getElementById(`cell-${pi}-${pj}`);
            if (prev && !prev.classList.contains("black")) {
                const prevInput = document.getElementById(`input-${pi}-${pj}`);
                prevInput.value = "";
                prevInput.focus();
            } else {
                this.blur();
            }
        } else {
            this.value = "";
        }
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

function onOrientationsClicked(event) {
    event.preventDefault();
    changeOrientation();
}

function onWheelClicked(event) {
    event.preventDefault();
    if (event.which === 2) {
        changeOrientation();
    }
}

function changeOrientation() {
    for (const o of document.getElementsByClassName("orientation")) {
        o.classList.toggle("selected");
    }
    horizontal = !horizontal;
}

function handleSubmit(event) {
    event.preventDefault();
    const reader = new FileReader();
    reader.readAsText(fileHandler.files[0]);
    reader.onload = loadFromFile;
}

function loadFromFile(event) {
    const data = JSON.parse(event.target.result);
    const cells = data.cells;
    const blacks = data.blacks;
    const numbers = data.numbers;
    if (![cells.length, blacks.length, numbers.length].every(v => v === data.rows)) {
        alert("Wrong number of rows detected");
        return;
    }
    if (![cells[0].length, blacks[0].length, numbers[0].length].every(v => v === data.cols)) {
        alert("Wrong number of columns detected");
        return;
    }
    rows.value = data.rows;
    cols.value = data.cols;
    emptyGrid();
    for (let i = 0; i < data.rows; i++) {
        for (let j = 0; j < data.cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (blacks[i][j]) {
                cell.classList.add("black");
            }
            const number = document.getElementById(`number-${i}-${j}`);
            number.textContent = numbers[i][j];
            const input = document.getElementById(`input-${i}-${j}`);
            input.value = cells[i][j];
        }
    }
}

function autoSubmit(event) {
    event.preventDefault();
    document.getElementById("upload-form").requestSubmit();
}

function download(_event) {
    const currentRows = parseInt(rows.value);
    const currentCols = parseInt(cols.value);
    const json = {
        rows: currentRows,
        cols: currentCols,
        cells: Array(currentRows).fill(null).map(() => Array(currentCols).fill(null)),
        blacks: Array(currentRows).fill(null).map(() => Array(currentCols).fill(null)),
        numbers: Array(currentRows).fill(null).map(() => Array(currentCols).fill(null)),
    };
    json.rows = currentRows;
    json.cols = currentCols;
    for (let i = 0; i < json.rows; i++) {
        for (let j = 0; j < json.cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            const number = document.getElementById(`number-${i}-${j}`);
            const input = document.getElementById(`input-${i}-${j}`);
            json.cells[i][j] = input.value;
            json.blacks[i][j] = cell.classList.contains("black");
            json.numbers[i][j] = number.textContent;
        }
    }

    // from https://gist.github.com/romgrk/40c89ba3cd077c4f4f42b63ddcf20735
    const fileBlob = new Blob([JSON.stringify(json, null, 2)], {type: "application/json"})
    const url = URL.createObjectURL(fileBlob)

    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', "crossword.json")

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents')
        event.initEvent('click', true, true)
        link.dispatchEvent(event)
    } else {
        link.click()
    }

    if (URL.revokeObjectURL) {
        URL.revokeObjectURL(url)
    }
}

window.onload = function () {
    container = document.getElementById("container");
    crossword = document.getElementById("crossword");
    rows = document.getElementById("rows");
    cols = document.getElementById("cols");

    document.getElementById("start").addEventListener("click", emptyGrid);

    document.getElementById("fill").addEventListener("click", fill);

    document.getElementById("orientations").addEventListener("mouseup", onOrientationsClicked);
    const selected = document.getElementById(horizontal ? "horizontal" : "vertical");
    selected.classList.add("selected");

    document.getElementById("upload-form").addEventListener("submit", handleSubmit);
    fileHandler = document.getElementById("upload");
    fileHandler.addEventListener("change", autoSubmit);

    document.getElementById("download").addEventListener("click", download);

    emptyGrid();
}
