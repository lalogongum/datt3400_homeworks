const space = 5;
const totalRects = 360 / space;
const canvasSize = 500;
let start = 0;
let song;
let amp;
let sizes = [];
const maxSize = canvasSize * 1.35;
const particles = [];
const totalParticles = 800;
let speed = 1;

function preload() {
  song = loadSound('this.mp3');
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  angleMode(DEGREES);
  noStroke();

  amp = new p5.Amplitude();
  song.play();

  for (let i = 0; i < totalRects; i++) {
    sizes.push(random(-maxSize, maxSize));
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push({
      x: random(-canvasSize, canvasSize),
      y: random(-canvasSize, canvasSize),
      speedX: random(-2, 2), // random direction
      speedY: random(-2, 2),
      size: random(1, 5),
      color: color(random(255), random(255), random(255)),
    });
  }
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  const vol = amp.getLevel();
  speed = map(vol, 0, 2, 0, 5);

  // Only show glow and repulsion if mouse is over canvas
  let mx, my;
  const mouseInCanvas =
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height;

  if (mouseInCanvas) {
    mx = mouseX - width / 2;
    my = mouseY - height / 2;
    drawMouseGlow(mx, my);
  }

  // PARTICLES
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    // Repel only if mouse is on canvas
    if (mouseInCanvas) {
      const d = dist(p.x, p.y, mx, my);
      if (d < 120 && d > 0.1) {
        const angle = atan2(p.y - my, p.x - mx);
        const force = map(d, 0, 120, 6, 0);
        p.x += cos(angle) * force;
        p.y += sin(angle) * force;
      }
    }

    fill(p.color);
    ellipse(p.x, p.y, p.size);

    p.x += p.speedX * speed;
    p.y += p.speedY * speed;

    // Wrap around canvas edges
    if (p.x > canvasSize) p.x = -canvasSize;
    if (p.x < -canvasSize) p.x = canvasSize;
    if (p.y > canvasSize) p.y = -canvasSize;
    if (p.y < -canvasSize) p.y = canvasSize;
  }

  // CIRCULAR VISUAL STRUCTURE
  for (let i = 0; i < totalRects; i++) {
    const x = map(sin(i * space), -1, 1, 0, 3);
    const y = map(cos(i * space), -1, 1, 0, 3);
    const n = noise(start + x, start + y);

    const targetSize = map(n, 0, 1, -maxSize * 0.5, maxSize * 0.5) * vol;
    sizes[i] = lerp(sizes[i], targetSize, 0.1);
    sizes[i] = constrain(sizes[i], -maxSize, maxSize);

    const r = map(sin(i * space), -1, 1, 100, 200);
    const g = map(sizes[i], -maxSize, maxSize, 0, 150);
    const b = map(n, 0, 1, 200, 255);

    fill(r, g, b);
    rotate(space);
    rect(canvasSize * 0.3, 0, sizes[i], 8, 4);
  }

  start += 0.005;
}
function drawMouseGlow(x, y) {
  const vol = amp.getLevel();
  const pulseSize = map(vol, 0, 1, 10, 30); // Pulse reacts to music
  const glowSize = map(vol, 0, 1, 60, 120); // Glow reacts to music
  
  // Create a more vibrant color palette
  const baseColor1 = color(180, 80, 255); // purple
  const baseColor2 = color(255, 100, 200); // pink
  const highlightColor = color(255, 220, 255); // white-pink
  
  // Outer glow with smoother gradient and color transition
  for (let r = glowSize; r > 0; r -= 2) {
    // Interpolate between colors based on radius
    const lerpAmount = map(r, 0, glowSize, 0, 1);
    const c = lerpColor(baseColor1, baseColor2, lerpAmount);
    
    // Dynamic alpha that pulses with music
    let alpha = map(r, 0, glowSize, 10, 2) * map(vol, 0, 1, 1, 3);
    alpha = constrain(alpha, 0, 40);
    
    fill(red(c), green(c), blue(c), alpha);
    ellipse(x, y, r * 2, r * 2);
    
    // Add some subtle noise to the edges for organic feel
    push();
    translate(x, y);
    rotate(frameCount * 0.5);
    for (let i = 0; i < 4; i++) {
      rotate(90);
      const n = noise(x + frameCount * 0.01) * 5;
      ellipse(r * 0.3, 0, r * 0.2 + n, r * 0.2 + n);
    }
    pop();
  }
  
  // Inner glow with dynamic size
  const innerGlowSize = pulseSize * 1.5;
  for (let r = innerGlowSize; r > 0; r -= 2) {
    let alpha = map(r, 0, innerGlowSize, 100, 10);
    fill(red(baseColor2), green(baseColor2), blue(baseColor2), alpha);
    ellipse(x, y, r * 2);
  }
  
  // Central highlight with pulsing effect
  const pulseFactor = sin(frameCount * 0.2) * 2 + 1;
  fill(highlightColor);
  ellipse(x, y, pulseSize * pulseFactor);
  
  // Add some sparkling particles near the cursor
  if (frameCount % 3 === 0) {
    const sparkle = {
      x: x + random(-20, 20),
      y: y + random(-20, 20),
      size: random(1, 3),
      life: random(10, 30)
    };
    
    fill(255, random(200, 255), random(200, 255));
    ellipse(sparkle.x, sparkle.y, sparkle.size);
  }
}
