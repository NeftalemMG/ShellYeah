function breakShell() {
    const container = document.querySelector('.container');
    container.style.display = 'none';

    const animationContainer = document.createElement('div');
    animationContainer.style.position = 'fixed';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100vw';
    animationContainer.style.height = '100vh';
    animationContainer.style.backgroundColor = '#1e1e1e';
    animationContainer.style.overflow = 'hidden';
    document.body.appendChild(animationContainer);

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    animationContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 3;
            this.speedY = (Math.random() - 0.5) * 3;
            this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.size > 0.2) this.size -= 0.01;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particles = Array(200).fill().map(() => new Particle());

    const commands = [
        '$ shutdown -h now',
        '> Stopping system services...',
        '> Unmounting file systems...',
        '> Deactivating swap...',
        '> Sending SIGTERM to all processes',
        '> Sending SIGKILL to all processes',
        '> Powering off'
    ];

    function drawCommandLine(progress) {
        const x = canvas.width * 0.1;
        let y = canvas.height * 0.2;

        ctx.font = '18px "Courier New", monospace';
        ctx.fillStyle = '#00ff00';

        commands.forEach((cmd, index) => {
            const cmdProgress = (progress - index / commands.length) * commands.length;
            if (cmdProgress > 0) {
                let text = cmd.slice(0, Math.floor(cmd.length * Math.min(cmdProgress, 1)));
                
                // Apply glitch effect to "Powering off" message
                if (index === commands.length - 1 && cmdProgress > 0.5) {
                    text = applyTextGlitch(text);
                }
                
                ctx.fillText(text, x, y);
                y += 30;
            }
        });
    }

    function applyTextGlitch(text) {
        return text.split('').map(char => 
            Math.random() < 0.1 ? String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 5) - 2) : char
        ).join('');
    }

    function drawProgressBar(progress) {
        const barWidth = canvas.width * 0.8;
        const barHeight = 4;
        const x = (canvas.width - barWidth) / 2;
        const y = canvas.height * 0.8;

        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x, y, barWidth * progress, barHeight);
    }

    function applyGlitchEffect() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            if (Math.random() < 0.01) {
                pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.random() < 0.5 ? 0 : 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    let progress = 0;

    function animate() {
        ctx.fillStyle = 'rgba(30, 30, 30, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawCommandLine(progress);
        drawProgressBar(progress);

        if (Math.random() < 0.05) {
            applyGlitchEffect();
        }

        progress += 0.001;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            endAnimation();
        }
    }

    function endAnimation() {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const messageElement = document.createElement('div');
        messageElement.innerHTML = 'A true shell never <span style="color: #ff0000;">breaks</span>';
        messageElement.style.color = '#00ff00';
        messageElement.style.fontFamily = '"Courier New", monospace';
        messageElement.style.fontSize = '32px';
        messageElement.style.position = 'absolute';
        messageElement.style.top = '50%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translate(-50%, -50%)';
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 1s ease-in';
        animationContainer.appendChild(messageElement);

        setTimeout(() => {
            messageElement.style.opacity = '1';
            glitchFinalMessage(messageElement);
        }, 100);

        setTimeout(() => {
            animationContainer.remove();
            container.style.display = '';
        }, 8000);
    }

    function glitchFinalMessage(element) {
        let originalText = element.innerHTML;
        let glitchInterval = setInterval(() => {
            element.innerHTML = applyTextGlitch(originalText);
        }, 100);

        setTimeout(() => {
            clearInterval(glitchInterval);
            element.innerHTML = originalText;
        }, 2000);
    }

    animate();
}

