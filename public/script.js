const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Cursor position tracking
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let trackMouse = true; // Flag to track whether mouse tracking is active

window.addEventListener('mousemove', (e) => {
    if (trackMouse) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

// Toggle mouse tracking on click
window.addEventListener('click', () => {
    trackMouse = !trackMouse; // Toggle the flag on click
});

class Node {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseVx = (Math.random() - 0.5) * 2; // Base speed
        this.baseVy = (Math.random() - 0.5) * 2; // Base speed
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        const slowZone = 80;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const centeringStrength = 0.005; // Strength of centering force

        // Repel from cursor logic (only when tracking is enabled)
        if (trackMouse && distance < maxDistance) {
            const angle = Math.atan2(dy, dx);

            if (distance < slowZone) {
                const slowSpeed = 2;
                this.vx = Math.cos(angle) * slowSpeed;
                this.vy = Math.sin(angle) * slowSpeed;
            } else {
                const repelSpeed = 3;
                this.vx = Math.cos(angle) * repelSpeed;
                this.vy = Math.sin(angle) * repelSpeed;
            }
        } else {
            this.vx = this.baseVx;
            this.vy = this.baseVy;
        }

        // Apply centering force towards the middle of the canvas
        this.vx += (centerX - this.x) * centeringStrength;
        this.vy += (centerY - this.y) * centeringStrength;

        // Repelling from edges logic
        const edgeRepelZone = 50; // Repel from edges when within this distance
        const cornerRepelFactor = 1.5; // Stronger repulsion near corners

        if (this.x < edgeRepelZone) {
            this.vx += (edgeRepelZone - this.x) / 50 * cornerRepelFactor;
        } else if (this.x > canvas.width - edgeRepelZone) {
            this.vx -= (this.x - (canvas.width - edgeRepelZone)) / 50 * cornerRepelFactor;
        }

        if (this.y < edgeRepelZone) {
            this.vy += (edgeRepelZone - this.y) / 50 * cornerRepelFactor;
        } else if (this.y > canvas.height - edgeRepelZone) {
            this.vy -= (this.y - (canvas.height - edgeRepelZone)) / 50 * cornerRepelFactor;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges if they manage to get too close
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -1;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}

const nodes = Array.from({ length: 150 }, () => new Node());

function animate() {
    // Clear the canvas without leaving a trail
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    nodes.forEach((node, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {  // Connection vicinity
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(200, 220, 255, ${1 - distance / 150})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animate);
}

animate();
