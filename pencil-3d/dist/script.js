const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 🎛️ Controls
const sizeInput = document.getElementById("pencilSize");
const colorInput = document.getElementById("pencilColor");

let pencilSize = 5;
let pencilColor = "#ffffff";
let drawing = false;

// 🧠 History system
let undoStack = [];
let redoStack = [];

// Save canvas state
function saveState() {
    undoStack.push(canvas.toDataURL());
    redoStack = []; // clear redo after new action
}

// Restore canvas
function restoreState(stack, oppositeStack) {
    if (stack.length === 0) return;

    oppositeStack.push(canvas.toDataURL());

    const img = new Image();
    img.src = stack.pop();

    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

// 🎛️ Controls update
sizeInput.addEventListener("input", (e) => {
    pencilSize = e.target.value;
});

colorInput.addEventListener("input", (e) => {
    pencilColor = e.target.value;
});

// 🖌️ Start drawing
canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);

    saveState(); // save before new stroke starts
});

// 🖌️ Draw
canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    ctx.strokeStyle = pencilColor;
    ctx.lineWidth = pencilSize;
    ctx.lineCap = "round";

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
});

// 🛑 Stop drawing
canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mouseleave", () => {
    drawing = false;
});

// ⌨️ Undo / Redo shortcuts
document.addEventListener("keydown", (e) => {

    // CTRL + Z → Undo
    if (e.ctrlKey && e.key === "z") {
        restoreState(undoStack, redoStack);
    }

    // CTRL + Y → Redo
    if (e.ctrlKey && e.key === "y") {
        restoreState(redoStack, undoStack);
    }
});

function undo() {
    restoreState(undoStack, redoStack);
}

function redo() {
    restoreState(redoStack, undoStack);
}