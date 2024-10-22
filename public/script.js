let scene, camera, renderer, cube, innerText;
let particles = [];
let textParticles = [];
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cubeRotation = { x: 0, y: 0 };
const CUBE_SIZE = 4;
const PARTICLE_COUNT = 2000;
const TEXT_PARTICLE_COUNT = 1000;
const COLORS = [
    '#4fc3f7', // light blue
    '#2196f3', // blue
    '#1976d2', // dark blue
    '#64ffda', // teal
    '#00bcd4', // cyan
];

// Create circular texture for particles
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(8, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const particleTexture = createParticleTexture();

    // Create cube outline
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x4fc3f7,
        size: 0.08,
        transparent: true,
        map: particleTexture,
        alphaTest: 0.1
    });

    // Generate cube vertices
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const face = Math.floor(Math.random() * 6);
        let x, y, z;

        switch (face) {
            case 0: // front
                x = (Math.random() - 0.5) * CUBE_SIZE;
                y = (Math.random() - 0.5) * CUBE_SIZE;
                z = CUBE_SIZE / 2;
                break;
            case 1: // back
                x = (Math.random() - 0.5) * CUBE_SIZE;
                y = (Math.random() - 0.5) * CUBE_SIZE;
                z = -CUBE_SIZE / 2;
                break;
            case 2: // top
                x = (Math.random() - 0.5) * CUBE_SIZE;
                y = CUBE_SIZE / 2;
                z = (Math.random() - 0.5) * CUBE_SIZE;
                break;
            case 3: // bottom
                x = (Math.random() - 0.5) * CUBE_SIZE;
                y = -CUBE_SIZE / 2;
                z = (Math.random() - 0.5) * CUBE_SIZE;
                break;
            case 4: // right
                x = CUBE_SIZE / 2;
                y = (Math.random() - 0.5) * CUBE_SIZE;
                z = (Math.random() - 0.5) * CUBE_SIZE;
                break;
            case 5: // left
                x = -CUBE_SIZE / 2;
                y = (Math.random() - 0.5) * CUBE_SIZE;
                z = (Math.random() - 0.5) * CUBE_SIZE;
                break;
        }

        positions.push(x, y, z);
        particles.push({
            initialPosition: { x, y, z },
            offset: Math.random() * Math.PI * 2
        });
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    cube = new THREE.Points(geometry, particleMaterial);
    scene.add(cube);

    // Create inner text particles
    const textGeometry = new THREE.BufferGeometry();
    const textPositions = [];
    const textColors = [];
    const colorArray = COLORS.map(color => new THREE.Color(color));

    // Create "MATTHEW" using point clusters
    const letterData = [
        // M
        [-1.5, 0.5, 0], [-1.3, -0.5, 0], [-1.1, 0.5, 0], [-0.9, -0.5, 0], [-0.7, 0.5, 0],
        // A
        [-0.3, -0.5, 0], [-0.1, 0.5, 0], [0.1, -0.5, 0], [-0.2, 0, 0], [0, 0, 0],
        // T
        [0.3, 0.5, 0], [0.5, 0.5, 0], [0.7, 0.5, 0], [0.5, -0.5, 0], [0.5, 0, 0],
        // T
        [0.9, 0.5, 0], [1.1, 0.5, 0], [1.3, 0.5, 0], [1.1, -0.5, 0], [1.1, 0, 0],
        // H
        [1.5, 0.5, 0], [1.5, -0.5, 0], [1.7, 0, 0], [1.9, 0.5, 0], [1.9, -0.5, 0],
        // E
        [2.1, 0.5, 0], [2.3, 0.5, 0], [2.1, 0, 0], [2.3, 0, 0], [2.1, -0.5, 0], [2.3, -0.5, 0],
        // W
        [2.5, 0.5, 0], [2.7, -0.5, 0], [2.9, 0, 0], [3.1, -0.5, 0], [3.3, 0.5, 0]
    ];

    for (let i = 0; i < TEXT_PARTICLE_COUNT; i++) {
        const basePoint = letterData[Math.floor(Math.random() * letterData.length)];
        const spread = 0.1;
        const x = basePoint[0] + (Math.random() - 0.5) * spread;
        const y = basePoint[1] + (Math.random() - 0.5) * spread;
        const z = basePoint[2] + (Math.random() - 0.5) * spread;

        textPositions.push(x, y, z);
        const color = colorArray[Math.floor(Math.random() * colorArray.length)];
        textColors.push(color.r, color.g, color.b);

        textParticles.push({
            initialPosition: { x, y, z },
            offset: Math.random() * Math.PI * 2
        });
    }

    textGeometry.setAttribute('position', new THREE.Float32BufferAttribute(textPositions, 3));
    textGeometry.setAttribute('color', new THREE.Float32BufferAttribute(textColors, 3));

    const textMaterial = new THREE.PointsMaterial({
        size: 0.05,
        transparent: true,
        map: particleTexture,
        alphaTest: 0.1,
        vertexColors: true
    });

    innerText = new THREE.Points(textGeometry, textMaterial);
    scene.add(innerText);

    camera.position.z = 10;

    // Event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('wheel', onMouseWheel, false);

    animate();
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    cubeRotation.x += deltaMove.y * 0.005;
    cubeRotation.y += deltaMove.x * 0.005;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

function onMouseWheel(event) {
    const zoomSpeed = 0.1;
    camera.position.z += event.deltaY * zoomSpeed;
    camera.position.z = Math.max(2, Math.min(20, camera.position.z));

    // Fade out instructions when zoomed in
    const overlay = document.querySelector('.overlay');
    if (camera.position.z < 5) {
        overlay.classList.add('fade-out');
    } else {
        overlay.classList.remove('fade-out');
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate cube particles
    const positions = cube.geometry.attributes.position.array;
    const textPositions = innerText.geometry.attributes.position.array;
    const time = Date.now() * 0.001;

    // Animate cube outline
    for (let i = 0; i < particles.length; i++) {
        const i3 = i * 3;
        const particle = particles[i];
        
        positions[i3] = particle.initialPosition.x + Math.sin(time + particle.offset) * 0.1;
        positions[i3 + 1] = particle.initialPosition.y + Math.cos(time + particle.offset) * 0.1;
        positions[i3 + 2] = particle.initialPosition.z + Math.sin(time + particle.offset) * 0.1;
    }

    // Animate text particles
    for (let i = 0; i < textParticles.length; i++) {
        const i3 = i * 3;
        const particle = textParticles[i];
        
        textPositions[i3] = particle.initialPosition.x + Math.sin(time + particle.offset) * 0.05;
        textPositions[i3 + 1] = particle.initialPosition.y + Math.cos(time + particle.offset) * 0.05;
        textPositions[i3 + 2] = particle.initialPosition.z + Math.sin(time * 0.5 + particle.offset) * 0.05;
    }

    cube.geometry.attributes.position.needsUpdate = true;
    innerText.geometry.attributes.position.needsUpdate = true;

    cube.rotation.x = cubeRotation.x;
    cube.rotation.y = cubeRotation.y;
    innerText.rotation.x = cubeRotation.x;
    innerText.rotation.y = cubeRotation.y;

    renderer.render(scene, camera);
}

init();