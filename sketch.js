let font;
let font2;
let textLayer;

let canvasWidth;
let canvasHeight;

let userStartX;
let userStartY;

let userEndX;
let userEndY;

let dragDirectionX = 0;
let dragDirectionY = 0;
let alreadyDragged = false;

let textCoordX;
let textCoordY;

let strokes = [];

let textSizeValue = 150;
let copyTextSizeValue = 50;

let letters = ["S", "M", "E", "A", "R"];
let letterOffsets = [];
let letterPositions = [];

let letterJitter = 100;
let tracking = 20;

let bgColor = ["#fff0f0", "#e5efff","#1d1816","#fffcf0", "#43143c","#160160"];
let textColor = ["#7300ff","#db0042","#00a87e",];
let smearColor = ["#fda3ff","#ffd500","#42c0ff"]

let selectedBgColor;
let selectedTextColor;
let selectedSmearColor;
let selectedSmearColor2;
let selectedSmearColor3;

async function setup() {
  //make canvas same size as window
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;

  createCanvas(canvasWidth, canvasHeight, WEBGL);

  brush.add("myBrush", {
    type: "marker",
    weight: 0.1,
    scatter: 0.5,
    sharpness: 0.3,
    grain: 0.9,
    opacity: 170,
    spacing: 0.1,
    noise: 0,
    pressure: [1.1, 0.9],
    rotate: "natural",
  }); //brush for fade out

  brush.add("myBrush2", {
    type: "marker",
    weight: 0.1,
    scatter: 0.5,
    sharpness: 0.3,
    grain: 0.9,
    opacity: 170,
    spacing: 0.1,
    noise: 0,
    pressure: [1.1, 0.9],
    rotate: "natural",
    markerTip: false
  }); //brush for inbetween marker and fade out brush

  brush.add("myBrush3", {
    type:    "spray",
    weight:  0.1,
    scatter: 10,
    sharpness: 0.3,
    grain:     500,
    opacity: 200,
    spacing: 2,
    noise:   1,
    pressure: [5, 5],
    rotate:  "random",
  }); //brush for base strokes  

  font = await loadFont("ABCFavoritTrial-Ultra.otf");
  font2 = await loadFont("ABCFavoritTrial-Medium.otf");

  updateTextSize(); //makes  text proportional to canvas size

  textFont(font);
  textSize(textSizeValue);
  textAlign(CENTER, CENTER);

  createTextLayer(); //makes offscreen canvas with same dimensions as canvas
  randomizeTextPosition();

  brush.scaleBrushes(3);

  noLoop();
}

function updateTextSize() {
  textSizeValue = width * (100 / 1000);
  copyTextSizeValue = width * (10 / 1000);
} // Scale text with canvas width; main text is 1200px at a reference width of 1000px REMEMBER TO CHANGE IF NEED DIFF RATIOS

function createTextLayer() {
  textLayer = createGraphics(width, height);
  textLayer.pixelDensity(1);

  textLayer.textFont(font);
  textLayer.textSize(textSizeValue);
  textLayer.textAlign(CENTER, CENTER);
}

// randomize position of smear text for later
function randomizeTextPosition() {
  textLayer.textFont(font);
  textLayer.textSize(textSizeValue);
  textLayer.textAlign(CENTER, CENTER);

  // Calculate width of the full word
  let totalWordWidth = 0;

  for (let letter of letters) {
    totalWordWidth += textLayer.textWidth(letter);
  }

  totalWordWidth += tracking * (letters.length - 1);

  // Center SMEAR horizontally
  let halfWordWidth = totalWordWidth / 2;
  textCoordX = width / 2;

  // Keep the randomized position away from the top and bottom
  let marginY = min(height * 0.15, 200);

  textCoordY = random(
    marginY + letterJitter,
    max(
      marginY + letterJitter + 1,
      height - marginY - letterJitter
    )
  );

  // Give each letter random vertical offset from centered pos
  letterOffsets = [];

  for (let i = 0; i < letters.length; i++) {
    letterOffsets.push(random(-letterJitter, letterJitter));
  }

  //record position of each letter
  letterPositions = [];

  let currentX = textCoordX - halfWordWidth;

  for (let i = 0; i < letters.length; i++) {
    let letterWidth = textLayer.textWidth(letters[i]);

    letterPositions.push({
      letter: letters[i],
      x: currentX + letterWidth / 2,
      y: textCoordY + letterOffsets[i]
    });

    currentX += letterWidth + tracking;
  }

  //redo offscreen canvas with offset positions of letters
  textLayer.clear();
  textLayer.background(255);
  textLayer.fill(0);
  textLayer.noStroke();
  textLayer.textFont(font);
  textLayer.textSize(textSizeValue);
  textLayer.textAlign(CENTER, CENTER);

  for (let p of letterPositions) {
    textLayer.text(p.letter, p.x, p.y);
  }

  textLayer.loadPixels();
}

function draw() {
  background(selectedBgColor);

  c = color(selectedTextColor);
  c2 = color(selectedSmearColor);

  //draw smear on onscreen canvas so user can see
  fill(c);
  noStroke();
  textFont(font);
  textSize(textSizeValue);
  textAlign(CENTER, CENTER);

  for (let p of letterPositions) {
    text(
      p.letter,
      p.x - width / 2,
      p.y - height / 2
    );
  }

  // Draw copy text after the smear is done
   if (alreadyDragged) {
    let verticalMargin = min(height * 0.10, 200);

    // Calculate the left and right edges of SMEAR.
    let textW = 0;

    for (let letter of letters) {
      textW += textLayer.textWidth(letter);
    }

    textW += tracking * (letters.length - 1);

    let wordLeft = textCoordX - textW / 2;
    let wordRight = textCoordX + textW / 2;

    // get coord for lining up description text to left of smear
    let labelX = wordLeft - width / 2;

    // get coord for lining up text to right of smear
    let rightLabelX = wordRight - width / 2;

    // get coord for text on side of the user's drag direction.
    let labelY = dragDirectionY >= 0
      ? height/2 - verticalMargin
      : -height/2 + verticalMargin;

    fill(selectedTextColor);
    noStroke();
    textFont(font2);
    textSize(copyTextSizeValue);
    textLeading(copyTextSizeValue * 1.3);

    //flush left text
    textAlign(LEFT, CENTER);

    text(
      "This poster records artifacts of digital \n" +
      "movement in the same way that using \n" +
      "analog media leaves smudges and smears.",
      labelX,
      random(-labelY)
    );


    //flush right text for name + class
    textAlign(RIGHT, CENTER);

    text(
      "April Wang \nIntro to Computation\nRISD Fall 2026",
      rightLabelX,
      -labelY
    );
  }

  // fade out brush strokes
  brush.set("myBrush", color(red(selectedSmearColor), green(selectedSmearColor), blue(selectedSmearColor), 100), 3);

  let startOffset = -50;

  for (let s of strokes) {
    let originalLength = abs(s.y2 - s.y1);

    let newLength = random(
      originalLength * 0.8,
      originalLength * 1
    );
    
    let direction;

    if (s.y2 >= s.y1) {
      direction = 1;
    } 
  
    else {
      direction = -1;
    } // if s.y2 is greater the s.y1, return 1, else return -1

    let startX = s.x1;
    let startY = s.y1;

    let endX = s.x1;
    let endY = s.y1 + direction * newLength;

    brush.line(startX, startY - direction * startOffset, endX, endY);
  }

  // shorter marker strokes for start of smear
  brush.set("myBrush3", color(red(selectedSmearColor3),green(selectedSmearColor3),blue(selectedSmearColor3),100), 0.05);


  for (let s of strokes) {
    let originalLength = abs(s.y2 - s.y1);

    let newLength = random(originalLength * 0.2, originalLength * 0.6);

    let direction = s.y2 >= s.y1 ? 1 : -1;

    let startX = s.x1;
    let startY = s.y1;

    let endX = s.x1;
    let endY = s.y1 + direction * newLength;

    brush.line(startX, startY, endX, endY);
  }

  //medium length brush strokes blending marker and fade out

  brush.set("myBrush2", color(red(selectedSmearColor2),green(selectedSmearColor2),blue(selectedSmearColor2),100), 2);

  for (let s of strokes) {
    let originalLength = abs(s.y2 - s.y1);

    let newLength = random(originalLength * 0.6, originalLength * 0.8);

    let direction = s.y2 >= s.y1 ? 1 : -1;

    let startX = s.x1;
    let startY = s.y1;

    let endX = s.x1;
    let endY = s.y1 + direction * newLength;

    brush.line(startX, startY - direction * startOffset, endX, endY);
  }

  //shortest strokes
  brush.set("marker", color(red(selectedTextColor),green(selectedTextColor),blue(selectedTextColor),100), 2);


  for (let s of strokes) {
    let originalLength = abs(s.y2 - s.y1);

    let newLength = random(originalLength * 0, originalLength * 0.2);

    let direction = s.y2 >= s.y1 ? 1 : -1;

    let startX = s.x1;
    let startY = s.y1;

    let endX = s.x1;
    let endY = s.y1 + direction * newLength;

    brush.line(startX, startY, endX, endY);
  }

}

function mousePressed() {
  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) {
    return;
  }

  // reset the drawing when user clicks; randomizes colors and text position
  strokes = [];
  randomizeTextPosition();
  randomizeColors(); 

  userStartX = mouseX;
  userStartY = mouseY;

  userEndX = undefined;
  userEndY = undefined;

  alreadyDragged = false;

  redraw();
}

function mouseReleased() {
  if (userStartX === undefined) {
    return;
  }
  

  let dx = mouseX - userStartX;
  let dy = mouseY - userStartY;

  dragDirectionX = dx;
  dragDirectionY = dy;

  let lineLength = sqrt(dx * dx + dy * dy);

  if (lineLength < 1) {
    userStartX = undefined;
    userStartY = undefined;
    userEndX = undefined;
    userEndY = undefined;
    alreadyDragged = false;

    redraw();
    return;
  }

  alreadyDragged = true;

  userEndX = mouseX;
  userEndY = mouseY;

  // when user drags up, strokes go up, vice versa
  let offsetY = dy >= 0 ? lineLength : -lineLength;

  // get width of the full word
  let textW = 0;

  for (let letter of letters) {
    textW += textLayer.textWidth(letter);
  }

  textW += tracking * (letters.length - 1);

  // Scan the area with word
  let minX = max(0, floor(textCoordX - textW / 2 - 20)); //

  let maxX = min(width, ceil(textCoordX + textW / 2 + 20));

  // Account for text size and how much jitter in vertical pos
  let verticalExtent = textSizeValue / 2 + letterJitter;

  let minY = max(0, floor(textCoordY - verticalExtent));

  let maxY = min(height, ceil(textCoordY + verticalExtent));

  let pixelStep = 9;

  strokes = [];

  for (let y = minY; y < maxY; y += pixelStep) {
    for (let x = minX; x < maxX; x += pixelStep) {
      let index = 4 * (y * textLayer.width + x);

      let r = textLayer.pixels[index];
      let g = textLayer.pixels[index + 1];
      let b = textLayer.pixels[index + 2];
      let a = textLayer.pixels[index + 3];

      if (r < 128 && g < 128 && b < 128 && a > 0) {
        // Convert coords to WEBGL coords
        let startX = x - width / 2;
        let startY = y - height / 2;

        strokes.push({
          x1: startX,
          y1: startY,
          x2: startX,
          y2: startY + offsetY
        });
      }
    }
  }

  redraw();

  userStartX = undefined;
  userStartY = undefined;
}

function windowResized() {
  //resize canvas to window size
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;

  resizeCanvas(canvasWidth, canvasHeight);

  updateTextSize();
  createTextLayer();
  randomizeTextPosition();

  strokes = [];
  alreadyDragged = false;

  userStartX = undefined;
  userStartY = undefined;

  redraw();
}

function randomizeColors() {
  selectedBgColor = random(bgColor);
  selectedTextColor = random(textColor);
  selectedSmearColor = random(smearColor);

  selectedSmearColor2 = lerpColor(color(selectedTextColor), color(selectedSmearColor), 0.66); //closer to smear color

  selectedSmearColor3 = lerpColor(color(selectedTextColor),color(selectedSmearColor),0.33); //closer to text color
}