let container = null;
let crossword = null;
let rows = null;
let cols = null;
let horizontal = true;
let fileHandler = null;
let blackCounter = null;
let horizontals = null;
let verticals = null;
let instructions = null;

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
            input.addEventListener("focusin", selectOverlay);
            cell.appendChild(input);
        }
        crossword.appendChild(row);
    }
    horizontals.innerHTML = "";
    verticals.innerHTML = "";
    for (let i = 0; i < rows.value; i++) {
        const h = document.createElement("div");
        h.id = `horizontal-${i}`;
        h.classList.add("overlay", "horizontal");
        horizontals.appendChild(h);
    }
    for (let j = 0; j < cols.value; j++) {
        const v = document.createElement("div");
        v.id = `vertical-${j}`;
        v.classList.add("overlay", "vertical");
        verticals.appendChild(v);
    }
    blackCounter.textContent = "0";
}

function selectOverlay(event) {
    for (const overlay of document.getElementsByClassName("overlay")) {
        overlay.classList.remove("selected");
    }
    const [i, j] = event.target.id.split("-").slice(1);
    if (horizontal) {
        document.getElementById(`horizontal-${i}`).classList.add("selected");
    } else {
        document.getElementById(`vertical-${j}`).classList.add("selected");
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
        blackCounter.textContent = `${parseInt(blackCounter.textContent) - 1}`;
    } else {
        blackCounter.textContent = `${parseInt(blackCounter.textContent) + 1}`;
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
        selectOverlay(event);
    }
}

function changeOrientation() {
    for (const o of document.getElementsByClassName("orientation")) {
        o.classList.toggle("selected");
    }
    horizontal = !horizontal;
    const selected = document.querySelector(".overlay.selected");
    if (selected) {
        selected.classList.remove("selected");
    }
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
    let currentBlacks = 0;
    for (let i = 0; i < data.rows; i++) {
        for (let j = 0; j < data.cols; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (blacks[i][j]) {
                cell.classList.add("black");
                currentBlacks += 1;
            }
            const number = document.getElementById(`number-${i}-${j}`);
            number.textContent = numbers[i][j];
            const input = document.getElementById(`input-${i}-${j}`);
            input.value = cells[i][j];
        }
    }
    blackCounter.textContent = `${currentBlacks}`;
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

function cornici(_event) {
    rows.value = "13";
    cols.value = "13";
    emptyGrid();
    document.getElementById("cell-6-6").classList.add("black");
    blackCounter.textContent = "1";
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < 13; j++) {
            if (i % 2 === 1 && (i <= j && j < 13 - i || 13 - i <= j && j <= i) || j % 2 === 1 && (j <= i && i < 13 - j || 13 - j <= i && i <= j)) {
                document.getElementById(`cell-${i}-${j}`).classList.add("cornice");
            }
        }
    }
    for (let i = 0; i < 13; i++) {
        document.getElementById(`number-${i}-0`).textContent = `${i + 1}`;
    }
    for (let c = 0; c < 6; c++) {
        document.getElementById(`number-${c}-${c}`).textContent = `${c + 1}`;
        document.getElementById(`number-${c}-${13 - c - 1}`).textContent = `${c + 1}`;
        document.getElementById(`number-${13 - c - 1}-${c}`).textContent = `${c + 1}`;
        document.getElementById(`number-${13 - c - 1}-${13 - c - 1}`).textContent = `${c + 1}`;
    }
}

function schemaLibero(_event) {
    rows.value = "12";
    cols.value = "22";
    emptyGrid();
}

function senzaSchema(_event) {
    schemaLibero(null);
    for (let i = 0; i < parseInt(rows.value); i++) {
        document.getElementById(`number-${i}-0`).textContent = `${i + 1}`;
    }
    for (let j = 0; j < parseInt(cols.value); j++) {
        document.getElementById(`number-0-${j}`).textContent = `${j + 1}`;
    }
}

function toggleInstructions() {
    console.log(2);
    instructions.classList.toggle("visible");
}

window.onload = function () {
    container = document.getElementById("container");
    crossword = document.getElementById("crossword");
    horizontals = document.getElementById("horizontals");
    verticals = document.getElementById("verticals");
    rows = document.getElementById("rows");
    cols = document.getElementById("cols");

    document.getElementById("start").addEventListener("click", emptyGrid);

    document.getElementById("fill").addEventListener("click", fill);
    blackCounter = document.getElementById("blacks");

    document.getElementById("orientations").addEventListener("mouseup", onOrientationsClicked);
    const selected = document.getElementById(horizontal ? "horizontal" : "vertical");
    selected.classList.add("selected");

    document.getElementById("upload-form").addEventListener("submit", handleSubmit);
    fileHandler = document.getElementById("upload");
    fileHandler.addEventListener("change", autoSubmit);

    document.getElementById("download").addEventListener("click", download);

    document.getElementById("cornici").addEventListener("click", cornici);
    document.getElementById("schema-libero").addEventListener("click", schemaLibero);
    document.getElementById("senza-schema").addEventListener("click", senzaSchema);

    instructions = document.getElementById("instructions");
    document.getElementById("toggle-instructions").addEventListener("click", toggleInstructions);

    emptyGrid();
}
