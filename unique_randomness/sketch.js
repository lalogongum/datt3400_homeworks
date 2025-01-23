let dataset;
let randomNumbers = [];
let lines = [];
let currentIndex = 0;
const delay = 30;
let lineLifetime = 10;
let maxLifetime = 500;
let lifetimeIncreasing = true;

function preload() {
  dataset = loadTable('random_numbers.csv', 'csv', 'noHeader');
}

function setup() {
  createCanvas(800, 400);
  frameRate(60);

  for (let col = 0; col < dataset.getColumnCount(); col++) {
    randomNumbers.push(dataset.getNum(0, col));
  }
}

function draw() {
  background(0, 20);

  if (frameCount % delay === 0) {
    const currentValue = randomNumbers[currentIndex];
    const amplitude = map(currentValue, 0, 100, 10, 100);
    lines.push({ amplitude, phase: 0, lifetime: lineLifetime });

    if (lifetimeIncreasing) {
      lineLifetime += 10;
      if (lineLifetime >= maxLifetime) {
        lifetimeIncreasing = false;
      }
    } else {
      lineLifetime -= 10;
      if (lineLifetime <= 10) {
        lifetimeIncreasing = true;
      }
    }

    currentIndex = (currentIndex + 1) % randomNumbers.length;
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    let linee = lines[i];
    linee.lifetime--;

    let alpha = map(linee.lifetime, 0, lineLifetime, 0, 255);

    stroke(255, alpha);
    noFill();
    beginShape();
    for (let x = 0; x < width; x += 10) {
      const y = height / 2 + sin(x * 0.01 + linee.phase) * linee.amplitude;
      vertex(x, y);
    }
    endShape();

    linee.phase += 0.02;

    if (linee.lifetime <= 0) {
      lines.splice(i, 1);
    }
  }
}
