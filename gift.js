const canvas = document.querySelector("#fireworks");
const ctx = canvas.getContext("2d");
const colors = ["#f4c46e", "#f4a3a1", "#9be0c8", "#fffaf3", "#d8b5ff"];
const rockets = [];
const particles = [];

let width = 0;
let height = 0;
let lastLaunch = 0;

function resize() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function launchFirework() {
  rockets.push({
    x: random(width * 0.18, width * 0.82),
    y: height + 20,
    targetY: random(height * 0.16, height * 0.48),
    speed: random(7, 10),
    color: colors[Math.floor(Math.random() * colors.length)],
    drift: random(-0.8, 0.8),
  });
}

function createBurst(x, y, color) {
  burst({
    x,
    y,
    color,
  });
}

function burst(rocket) {
  const count = Math.floor(random(52, 86));

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = random(1.6, 5.8);

    particles.push({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed + random(-0.45, 0.45),
      vy: Math.sin(angle) * speed + random(-0.45, 0.45),
      life: random(54, 84),
      maxLife: 84,
      color: rocket.color,
      size: random(1.4, 2.8),
    });
  }
}

function updateRockets() {
  for (let i = rockets.length - 1; i >= 0; i -= 1) {
    const rocket = rockets[i];
    rocket.y -= rocket.speed;
    rocket.x += rocket.drift;

    ctx.beginPath();
    ctx.arc(rocket.x, rocket.y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = rocket.color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(rocket.x, rocket.y + 6);
    ctx.lineTo(rocket.x - rocket.drift * 4, rocket.y + 28);
    ctx.strokeStyle = "rgba(255, 250, 243, 0.42)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    if (rocket.y <= rocket.targetY) {
      burst(rocket);
      rockets.splice(i, 1);
    }
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.045;
    particle.vx *= 0.988;
    particle.vy *= 0.988;
    particle.life -= 1;

    const alpha = Math.max(particle.life / particle.maxLife, 0);
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 3.6, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = alpha * 0.16;
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function animate(time) {
  ctx.fillStyle = "rgba(4, 7, 12, 0.14)";
  ctx.fillRect(0, 0, width, height);

  if (time - lastLaunch > 620) {
    launchFirework();
    if (Math.random() > 0.55) launchFirework();
    lastLaunch = time;
  }

  updateRockets();
  updateParticles();
  window.requestAnimationFrame(animate);
}

resize();
window.addEventListener("resize", resize);

createBurst(width * 0.2, height * 0.26, "#f4c46e");
createBurst(width * 0.82, height * 0.22, "#f4a3a1");
createBurst(width * 0.5, height * 0.14, "#9be0c8");

for (let i = 0; i < 5; i += 1) {
  window.setTimeout(launchFirework, i * 220);
}

window.requestAnimationFrame(animate);
