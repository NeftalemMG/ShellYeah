// A simple snake game.
// Dont get your hopes up though.
// The snakes in Nokia 2005 phones looked more like a
// real snake than this.
function startSnakeGame() {
    const gameArea = document.createElement('div');
    gameArea.style.width = '300px';
    gameArea.style.height = '300px';
    gameArea.style.backgroundColor = '#000';
    gameArea.style.position = 'relative';
    gameArea.style.margin = '20px auto';
    gameArea.style.border = '2px solid #00b8d4';
    gameArea.style.borderRadius = '10px';
    gameArea.style.overflow = 'hidden';
  
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.display = 'block';
    startButton.style.margin = '10px auto';
    startButton.style.padding = '10px 20px';
    startButton.style.backgroundColor = '#00b8d4';
    startButton.style.color = '#fff';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
  
    output.appendChild(gameArea);
    output.appendChild(startButton);
  
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 1;
    let dy = 0;
    let gameInterval;
  
    function drawSnake() {
      gameArea.innerHTML = '';
      snake.forEach((segment, index) => {
        const segmentElement = document.createElement('div');
        segmentElement.style.position = 'absolute';
        segmentElement.style.width = '10px';
        segmentElement.style.height = '10px';
        segmentElement.style.backgroundColor = '#00b8d4';
        segmentElement.style.left = `${segment.x * 10}px`;
        segmentElement.style.top = `${segment.y * 10}px`;
        
        // Make the head look like a snake head
        // This is the best I could come up with to make it look more fluid.
        if (index === 0) {
          segmentElement.style.borderRadius = '5px 5px 0 0';
          // Add eyes
          const leftEye = document.createElement('div');
          const rightEye = document.createElement('div');
          [leftEye, rightEye].forEach(eye => {
            eye.style.position = 'absolute';
            eye.style.width = '3px';
            eye.style.height = '3px';
            eye.style.backgroundColor = '#000';
            eye.style.borderRadius = '50%';
            eye.style.top = '2px';
          });
          leftEye.style.left = '2px';
          rightEye.style.right = '2px';
          segmentElement.appendChild(leftEye);
          segmentElement.appendChild(rightEye);
        } else if (index === snake.length - 1) {
          // Make the tail pointy
          segmentElement.style.borderRadius = '0 0 5px 5px';
        } else {
          // Make the body segments slightly rounded
          segmentElement.style.borderRadius = '3px';
        }
        
        gameArea.appendChild(segmentElement);
      });
  
      const foodElement = document.createElement('div');
      foodElement.style.position = 'absolute';
      foodElement.style.width = '10px';
      foodElement.style.height = '10px';
      foodElement.style.backgroundColor = '#ff0000';
      foodElement.style.left = `${food.x * 10}px`;
      foodElement.style.top = `${food.y * 10}px`;
      foodElement.style.borderRadius = '50%';
      gameArea.appendChild(foodElement);
    }
  
    function moveSnake() {
  
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 30 || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      clearInterval(gameInterval);
      
      const gameOverOverlay = document.createElement('div');
      gameOverOverlay.style.position = 'absolute';
      gameOverOverlay.style.top = '0';
      gameOverOverlay.style.left = '0';
      gameOverOverlay.style.width = '100%';
      gameOverOverlay.style.height = '100%';
      gameOverOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      gameOverOverlay.style.display = 'flex';
      gameOverOverlay.style.flexDirection = 'column';
      gameOverOverlay.style.justifyContent = 'center';
      gameOverOverlay.style.alignItems = 'center';
      gameOverOverlay.style.color = '#fff';
      gameOverOverlay.style.fontFamily = 'Arial, sans-serif';
      gameOverOverlay.style.zIndex = '1000';
      
      const gameOverText = document.createElement('h2');
      gameOverText.textContent = 'Game Over!';
      gameOverText.style.fontSize = '24px';
      gameOverText.style.marginBottom = '10px';
      
      const scoreText = document.createElement('p');
      scoreText.textContent = `Your score: ${snake.length - 1}`;
      scoreText.style.fontSize = '18px';
      scoreText.style.marginBottom = '20px';
      
      const restartButton = document.createElement('button');
      restartButton.textContent = 'Restart Game';
      restartButton.style.padding = '10px 20px';
      restartButton.style.fontSize = '16px';
      restartButton.style.backgroundColor = '#00b8d4';
      restartButton.style.color = '#fff';
      restartButton.style.border = 'none';
      restartButton.style.borderRadius = '5px';
      restartButton.style.cursor = 'pointer';
      
      restartButton.addEventListener('click', () => {
        gameArea.removeChild(gameOverOverlay);
        startGame();
      });
      
      gameOverOverlay.appendChild(gameOverText);
      gameOverOverlay.appendChild(scoreText);
      gameOverOverlay.appendChild(restartButton);
      
      gameArea.appendChild(gameOverOverlay);
      return;
    }
      
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        food = {
          x: Math.floor(Math.random() * 30),
          y: Math.floor(Math.random() * 30)
        };
      } else {
        snake.pop();
      }
      drawSnake();
    }
  
    startButton.addEventListener('click', () => {
      snake = [{x: 10, y: 10}];
      food = {x: 15, y: 15};
      dx = 1;
      dy = 0;
      clearInterval(gameInterval);
      gameInterval = setInterval(moveSnake, 100);
      startButton.textContent = 'Restart Game';
    });
  
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
      }
    });
  
    drawSnake();
    return 'Snake game ready! Click the Start Game button to play.';
  }

  



// Create your own constellation and get to name it
function constellationCreator() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.backgroundColor = '#000033';
    canvas.style.cursor = 'crosshair';
  
    const ctx = canvas.getContext('2d');
    const stars = [];
    let isDrawing = false;
    let lastPoint;
    let constellationName = '';
  
    function drawStar(x, y, size = 1) {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  
    function drawConstellation() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => drawStar(star.x, star.y, star.size));
  
      if (isDrawing && lastPoint) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(stars[stars.length - 1].x, stars[stars.length - 1].y);
        ctx.stroke();
      }
  
      for (let i = 1; i < stars.length; i++) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(stars[i - 1].x, stars[i - 1].y);
        ctx.lineTo(stars[i].x, stars[i].y);
        ctx.stroke();
      }
  
      if (constellationName) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(constellationName, 10, 30);
      }
    }
  
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      stars.push({ x, y, size: Math.random() * 2 + 1 });
      lastPoint = { x, y };
      drawConstellation();
    });
  
    canvas.addEventListener('mousemove', (e) => {
      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        lastPoint = { x, y };
        drawConstellation();
      }
    });
  
    canvas.addEventListener('mouseup', () => {
      isDrawing = false;
      lastPoint = null;
      drawConstellation(); 
    });
  
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
  
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Name your constellation';
    nameInput.style.width = '200px';
    nameInput.style.marginTop = '10px';
  
    nameInput.addEventListener('input', (e) => {
      constellationName = e.target.value;
      drawConstellation();
    });
  
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      stars.length = 0;
      constellationName = '';
      nameInput.value = '';
      drawConstellation();
    });
  
    container.appendChild(canvas);
    container.appendChild(nameInput);
    container.appendChild(resetBtn);
    output.appendChild(container);
  
    drawConstellation();
  
    return "Constellation Creator started. Click to place stars, drag to connect them, and name your creation!";
  }





// Some tame fireworks. This is not really a game.
function startFireworks() {
  
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    output.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    class Particle {
      constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.radius = Math.random() * 3 + 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.friction = 0.98;
        this.gravity = 0.2;
      }
  
      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        ctx.fill();
      }
  
      update() {
        this.dx *= this.friction;
        this.dy *= this.friction;
        this.dy += this.gravity;
        this.x += this.dx;
        this.y += this.dy;
        this.alpha -= 0.01;
        this.draw();
      }
    }
  
    let particles = [];
  
    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const hue = Math.random() * 360;
      const particleCount = 200;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, hue));
      }
    }
  
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles = particles.filter(p => p.alpha > 0);
      particles.forEach(p => p.update());
  
      if (Math.random() < 0.05) createFirework();
  
      requestAnimationFrame(animate);
    }
  
    animate();
  
    setTimeout(() => {
      canvas.remove();
      appendOutput('Fireworks show ended!');
    }, 15000);
  
    return 'Fireworks started! (Will auto-stop after 15 seconds)';
}





// A super basic memory match game.
function startMemoryMatch() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    output.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍋', '🍍'];
    let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;
    const cardWidth = 50;
    const cardHeight = 70;
    const gridX = 4;
    const gridY = 4;
  
    function drawCard(x, y, symbol, flipped) {
      ctx.fillStyle = flipped ? '#FFFFFF' : '#00b8d4';
      ctx.fillRect(x, y, cardWidth, cardHeight);
      if (flipped) {
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, x + cardWidth / 2, y + cardHeight / 2);
      }
    }
  
    function drawBoard() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < gridX * gridY; i++) {
        const x = (i % gridX) * (cardWidth + 10) + 50;
        const y = Math.floor(i / gridX) * (cardHeight + 10) + 20;
        drawCard(x, y, cards[i], flippedCards.includes(i) || cards[i] === null);
      }
    }
  
    function handleClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cardX = Math.floor((x - 50) / (cardWidth + 10));
      const cardY = Math.floor((y - 20) / (cardHeight + 10));
      const cardIndex = cardY * gridX + cardX;
  
      if (cardX >= 0 && cardX < gridX && cardY >= 0 && cardY < gridY && 
          cards[cardIndex] !== null && !flippedCards.includes(cardIndex)) {
        flippedCards.push(cardIndex);
        if (flippedCards.length === 2) {
          if (cards[flippedCards[0]] === cards[flippedCards[1]]) {
            matchedPairs++;
            cards[flippedCards[0]] = null;
            cards[flippedCards[1]] = null;
            flippedCards = [];
            if (matchedPairs === symbols.length) {
              setTimeout(() => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Congratulations! You won!', canvas.width / 2, canvas.height / 2);
              }, 500);
            }
          } else {
            setTimeout(() => {
              flippedCards = [];
              drawBoard();
            }, 1000);
          }
        }
        drawBoard();
      }
    }
  
    canvas.addEventListener('click', handleClick);
    drawBoard();
  
    return 'Memory Match game started! Click on cards to flip them and find matching pairs.';
  }





// A simple pong game.
function startPongGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    output.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    const paddleHeight = 60;
    const paddleWidth = 10;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballDX = 3;
    let ballDY = 3;
    const ballRadius = 5;
  
    let playerScore = 0;
    let shellScore = 0;
    let gameOver = false;
  
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    let currentColorIndex = 0;
  
    function drawPaddle(x, y) {
      ctx.fillStyle = colors[currentColorIndex];
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    }
  
    function drawBall() {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors[currentColorIndex];
      ctx.fill();
      ctx.closePath();
    }
  
    function drawScore() {
      ctx.font = '20px Arial';
      ctx.fillStyle = colors[currentColorIndex];
      ctx.fillText(`Player: ${playerScore} | Shell: ${shellScore}`, 10, 30);
    }
  
    function movePaddle(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top - paddleHeight / 2;
      if (mouseY > 0 && mouseY < canvas.height - paddleHeight) {
        rightPaddleY = mouseY;
      }
    }
  
    canvas.addEventListener('mousemove', movePaddle);
  
    function changeColor() {
      currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
  
    function restartGame() {
      playerScore = 0;
      shellScore = 0;
      gameOver = false;
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
      ballDY = 3 * (Math.random() > 0.5 ? 1 : -1);
      update();
    }
  
    function showGameOver() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '30px Arial';
      ctx.fillStyle = colors[currentColorIndex];
      ctx.fillText('Game Over!', canvas.width / 2 - 70, canvas.height / 2 - 30);
      ctx.font = '20px Arial';
      ctx.fillText(`Final Score: ${playerScore} - ${shellScore}`, canvas.width / 2 - 70, canvas.height / 2 + 10);
      ctx.fillText('Click to restart', canvas.width / 2 - 60, canvas.height / 2 + 50);
    }
  
    canvas.addEventListener('click', () => {
      if (gameOver) {
        restartGame();
      }
    });
  
    function update() {
      if (gameOver) {
        showGameOver();
        return;
      }
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawPaddle(0, leftPaddleY);
      drawPaddle(canvas.width - paddleWidth, rightPaddleY);
      drawBall();
      drawScore();
  
      ballX += ballDX;
      ballY += ballDY;
  
      if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballDY = -ballDY;
        changeColor();
      }
  
      if (
        (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
      ) {
        ballDX = -ballDX * 1.1;  // Increase speed slightly
        changeColor();
      }
  
      if (ballX + ballRadius > canvas.width) {
        shellScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballDX = -3;
        changeColor();
      }
  
      if (ballX - ballRadius < 0) {
        playerScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballDX = 3;
        changeColor();
      }
  
      if (shellScore >= 5 || playerScore >= 5) {
        gameOver = true;
      }
  
      leftPaddleY += (ballY - (leftPaddleY + paddleHeight / 2)) * 0.1;
  
      requestAnimationFrame(update);
    }
  
    update();
  
    return 'The Pong game has started! Move your mouse up and down to control the right paddle. First to 5 points wins!';
}





// Scribble around
function startDrawingBoard() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.border = '1px solid white';
    output.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
  
    function draw(e) {
      if (!isDrawing) return;
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }
  
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseout', () => isDrawing = false);
  
    return 'Drawing board started! Click and drag to draw.';
}





// Scibble around but the tip is not a pencil anymore, 
// it is a thick collection of particles.
function startParticleExplorer() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    output.appendChild(canvas);
    const ctx = canvas.getContext('2d');
  
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };
  
    canvas.addEventListener('mousemove', (e) => {
      mouse.x = e.x - canvas.getBoundingClientRect().left;
      mouse.y = e.y - canvas.getBoundingClientRect().top;
    });
  
    function handleParticles() {
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.2;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
        
        if (particles[i].size <= 0.3) {
          particles.splice(i, 1);
          i--;
        }
      }
    }
  
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mouse.x !== null && mouse.y !== null) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
      handleParticles();
      requestAnimationFrame(animate);
    }
  
    animate();
  
    return "Particle Explorer started! Move your mouse over the canvas to create particles.";
}





// Get your fortune.
function fortune() {
    const fortunes = [
      "You will find a bug in your code... and fix it!",
      "A great opportunity will present itself in the form of a challenging project.",
      "Your next commit will solve more problems than it creates.",
      "You will receive praise for your elegant code solution.",
      "A rubber duck will provide profound debugging insights.",
      "You will finally understand that cryptic Stack Overflow answer.",
      "Your code will run perfectly on the first try... in your dreams.",
      "You will discover a new favorite programming language.",
      "A forgotten semicolon will no longer be the bane of your existence.",
      "You will achieve inbox zero... for about 5 minutes."
    ];
    const selectedFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    return `
      <div class="fortune-widget">
        <div class="fortune-header">
          <span class="fortune-icon">🔮</span>
          <span class="fortune-title">Your Tech Fortune</span>
        </div>
        <div class="fortune-content">
          <p class="fortune-text">${selectedFortune}</p>
        </div>
        <div class="fortune-footer">
          <span class="fortune-lucky-number">Lucky Number: ${Math.floor(Math.random() * 100)}</span>
        </div>
      </div>
    `;
}
  