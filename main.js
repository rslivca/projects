const screen = document.getElementById("screen");
const ctx = screen.getContext("2d");
screen.addEventListener("mousemove", onMouseMove);
screen.addEventListener("mouseleave", onMouseLeave);
screen.addEventListener("click", onClickEvent);
const startButton = document.getElementById("start");
startButton.addEventListener("click", start);
document.getElementById("randomize").addEventListener("click", randomize);
document.getElementById("reset").addEventListener("click", reset);
const speed = document.getElementById("speed");
speed.addEventListener("input", handleSpeed);

const PXL_CLICKED_COLOR = "rgb(41, 41, 41)";
const DEFAULT_PXL_COLOR = "rgb(156, 165, 217)"
const MOUSEOVER_PXL_COLOR = "rgb(196, 205, 255)";
const MOUSEOVER_CLICKED_PXL_COLOR = "rgb(81, 81, 81)";

// canvas.width / (squareSize + squaregap) needs to be a whole number
let SQUARE_SIZE = 19;
let SQUARE_GAP_SIZE = 1;
const ROW_COUNT = screen.width / (SQUARE_SIZE + SQUARE_GAP_SIZE);
const pixels = [];
let cycles = 0;
let startButtonClicked = false;
let cyclesPerUpdate = speed.value;
let lastPixel;

class Pixel {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }
}

function onClickEvent(event) {
    if (startButtonClicked) {
        return;
    }
    const rect = screen.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let multiplier = 800 / rect.width;
    console.log(multiplier);
    mouseX *= multiplier;
    mouseY *= multiplier;

    let i = parseInt((mouseY / (SQUARE_SIZE + SQUARE_GAP_SIZE)))
    let j =  parseInt((mouseX / (SQUARE_SIZE + SQUARE_GAP_SIZE)));

    if (isCursorOverRectangle(mouseX, mouseY, pixels[i][j])) {
        let color = "";
        if (pixels[i][j].getColor() == MOUSEOVER_PXL_COLOR) {
            color = MOUSEOVER_CLICKED_PXL_COLOR;
        } else {
            color = MOUSEOVER_PXL_COLOR;
        }
        pixels[i][j].setColor(color);
    }
    draw();
}

function onMouseMove(event) {
    if (startButtonClicked) {
        return;
    }
    const rect = screen.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let multiplier = 800 / rect.width;
    console.log(multiplier);
    mouseX *= multiplier;
    mouseY *= multiplier;
    let i = parseInt((mouseY / (SQUARE_SIZE + SQUARE_GAP_SIZE)))
    let j =  parseInt((mouseX / (SQUARE_SIZE + SQUARE_GAP_SIZE)));

    if (isCursorOverRectangle(mouseX, mouseY, pixels[i][j])) {
        if (pixels[i][j].getColor() == PXL_CLICKED_COLOR) {
            pixels[i][j].setColor(MOUSEOVER_CLICKED_PXL_COLOR);
        } else if (pixels[i][j].getColor() != MOUSEOVER_CLICKED_PXL_COLOR) {
            pixels[i][j].setColor(MOUSEOVER_PXL_COLOR);
        }
    } else {
        if (pixels[i][j].getColor() == MOUSEOVER_CLICKED_PXL_COLOR) {
            pixels[i][j].setColor(PXL_CLICKED_COLOR);
        } else if (pixels[i][j].getColor() == MOUSEOVER_PXL_COLOR) {
            pixels[i][j].setColor(DEFAULT_PXL_COLOR);
        }
    }
    if (lastPixel != pixels[i][j]) {
        if (lastPixel.getColor() == MOUSEOVER_CLICKED_PXL_COLOR) {
            lastPixel.setColor(PXL_CLICKED_COLOR);
        } else if (lastPixel.getColor() == MOUSEOVER_PXL_COLOR) {
            lastPixel.setColor(DEFAULT_PXL_COLOR);
        }
        lastPixel = pixels[i][j];
    }
    draw();
}

function onMouseLeave() {
    if (startButtonClicked) {
        return;
    }
    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            if (pixels[i][j].getColor() == MOUSEOVER_CLICKED_PXL_COLOR) {
                pixels[i][j].setColor(PXL_CLICKED_COLOR);
            } else if (pixels[i][j].getColor() == MOUSEOVER_PXL_COLOR) {
                pixels[i][j].setColor(DEFAULT_PXL_COLOR);
            }
        }
    }
    draw();
}

function isCursorOverRectangle(x, y, pixel) {
    let xMin = pixel.getX();
    let xMax = xMin + SQUARE_SIZE;
    let yMin = pixel.getY();
    let yMax = yMin + SQUARE_SIZE;
    if (x >= xMin && x <= xMax &&
        y >= yMin && y <= yMax) {
        return true;
    }
}

function init() {
    ctx.fillStyle = DEFAULT_PXL_COLOR;
    for (let i = 0; i < ROW_COUNT; i++) {
        let temp = [];
        pixels.push(temp);
        for (let j = 0; j < ROW_COUNT; j++) {
            let x = j * (SQUARE_SIZE + SQUARE_GAP_SIZE);
            let y = i * (SQUARE_SIZE + SQUARE_GAP_SIZE);
            let pxl = new Pixel(x, y, DEFAULT_PXL_COLOR);
            temp.push(pxl);
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
    lastPixel = new Pixel();
}

init();

function reset() {
    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            pixels[i][j].setColor(DEFAULT_PXL_COLOR);
        }
    }
    startButtonClicked = false;
    startButton.textContent = "Start";
    draw();
}

function start() {
    if (startButtonClicked === false) {
        startButton.textContent = "Stop";
        requestAnimationFrame(gameLoop);
    } else {
        startButton.textContent = "Start";
    }
    startButtonClicked = !startButtonClicked;
}

function randomize() {
    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            random = Math.round((Math.random() - .33));
            if (random == 1) {
                pixels[i][j].setColor(PXL_CLICKED_COLOR);
            } else {
                pixels[i][j].setColor(DEFAULT_PXL_COLOR);
            }
        }
    }
    draw();
}

function gameLoop() {
    cycles++;
    if (cycles % cyclesPerUpdate == 0) {
        cycles = 0;
        let temp = [];
        for (let i = 0; i < pixels.length; i++) {
            let temp2 = [];
            temp.push(temp2);
            for (let j = 0; j < pixels.length; j++) {
                const pixel = pixels[i][j];
                var neighbors = 0;
                // check on top
                if (i > 0) {
                    if (pixels[i - 1][j].color == PXL_CLICKED_COLOR) {
                        neighbors++;
                    }
                }
                // check below
                if (i < pixels.length - 1) {
                    if (pixels[i + 1][j].color == PXL_CLICKED_COLOR) {
                        neighbors++;
                    }
                }
                // check to the right
                if (j < pixels[i].length - 1) {
                    if (pixels[i][j + 1].color == PXL_CLICKED_COLOR) {
                        neighbors++;
                    }
                    // check top right
                    if (i > 0) {
                        if (pixels[i - 1][j + 1].color == PXL_CLICKED_COLOR) {
                            neighbors++;
                        }
                    }
                    // check bottom right
                    if (i < pixels.length - 1) {
                        if (pixels[i + 1][j + 1].color == PXL_CLICKED_COLOR) {
                            neighbors++;
                        }
                    }
                }
                // check to the left
                if (j > 0) {
                    if (pixels[i][j - 1].color == PXL_CLICKED_COLOR) {
                        neighbors++;
                    }
                    // check top left
                    if (i > 0) {
                        if (pixels[i - 1][j - 1].color == PXL_CLICKED_COLOR) {
                            neighbors++;
                        }
                    }
                    // check botton left
                    if (i < pixels.length - 1) {
                        if (pixels[i + 1][j - 1].color == PXL_CLICKED_COLOR) {
                            neighbors++;
                        }
                    }
                }
                if (pixel.color === DEFAULT_PXL_COLOR && neighbors === 3) {
                    temp2.push(PXL_CLICKED_COLOR);
                } else if (pixel.color === PXL_CLICKED_COLOR && (neighbors < 2 || neighbors > 3)) {
                    temp2.push(DEFAULT_PXL_COLOR);
                } else if (pixel.color === PXL_CLICKED_COLOR) {
                    temp2.push(PXL_CLICKED_COLOR);
                } else {
                    temp2.push(DEFAULT_PXL_COLOR);
                }
            }
        }
        let b = false;
        for (let i = 0; i < pixels.length; i++) {
            for (let j = 0; j < pixels[i].length; j++) {
                pixels[i][j].setColor(temp[i][j]);
                if (temp[i][j] == PXL_CLICKED_COLOR) {
                    b = true;
                }
            }
        }
        draw();
        if (!b) {
            start();
        }
    }
    if (startButtonClicked) {
        requestAnimationFrame(gameLoop);
    }
}

function handleSpeed() {
    cyclesPerUpdate = parseInt((10 / speed.value) * 200);
}

function draw() {
    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            let x = pixels[i][j].getX();
            let y = pixels[i][j].getY();
            ctx.fillStyle = pixels[i][j].color;
            ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}