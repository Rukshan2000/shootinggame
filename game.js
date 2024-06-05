var spaceship;
var bullets = [];
var asteroids = [];
var score;
var backgroundMusic;
var shootSound;
var explosionSound;
var level;
var gameOverText;
var spaceshipDirection = 0; // Angle of the spaceship

function startGame() {
    spaceship = new component(30, 30, "blue", 220, 250);
    score = new component("24px", "Consolas", "white", 10, 40, "text");
    level = 1;
    gameArea.start();
    backgroundMusic = new sound("background.mp3");
    shootSound = new sound("shoot.wav");
    explosionSound = new sound("explosion.wav");
    backgroundMusic.play();
}

var gameArea = {
    canvas: document.getElementById("gameCanvas"),
    start: function() {
        this.canvas.width = 1080;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function(e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function(e) {
            gameArea.keys[e.keyCode] = false;
        })
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        backgroundMusic.stop();
        showGameOver();
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = gameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(spaceshipDirection * Math.PI / 180);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-this.width / 2, this.height / 2);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(-this.width / 2, -this.height / 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    };
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    };
}

function updateGameArea() {
    var x, y;
    for (i = 0; i < asteroids.length; i += 1) {
        if (spaceship.crashWith(asteroids[i])) {
            gameArea.stop();
            explosionSound.play();
            return;
        }
    }
    for (i = 0; i < bullets.length; i += 1) {
        for (j = 0; j < asteroids.length; j += 1) {
            if (bullets[i].crashWith(asteroids[j])) {
                asteroids.splice(j, 1);
                bullets.splice(i, 1);
                score.value += 10;
                explosionSound.play();
                break;
            }
        }
    }
    gameArea.clear();
    gameArea.frameNo += 1;
    if (gameArea.frameNo == 1 || everyinterval(150 / level)) {
        x = gameArea.canvas.width;
        y = Math.floor(Math.random() * gameArea.canvas.height);
        asteroids.push(new component(30, 30, "grey", x, y));
    }

    if (gameArea.keys && gameArea.keys[37]) {
        spaceship.speedX = -2;
        if (spaceship.x <= 0) spaceship.speedX = 0;
        spaceshipDirection = 0; // Rotate up

    } else if (gameArea.keys && gameArea.keys[39]) {
        spaceship.speedX = 2;
        if (spaceship.x + spaceship.width >= gameArea.canvas.width) spaceship.speedX = 0;
        spaceshipDirection = 0; // Rotate up
    } else {
        spaceship.speedX = 0;
    }

    if (gameArea.keys && gameArea.keys[38]) {
        spaceship.speedY = -2;
        if (spaceship.y <= 0) spaceship.speedY = 0;
        spaceshipDirection = 0; // Rotate up
    } else if (gameArea.keys && gameArea.keys[40]) {
        spaceship.speedY = 2;  
        if (spaceship.y + spaceship.height >= gameArea.canvas.height) spaceship.speedY = 0;
        spaceshipDirection =0; // Rotate up
    } else {
        spaceship.speedY = 0;
    }

    if (gameArea.keys && gameArea.keys[32]) { shoot(); }

    spaceship.newPos();
    spaceship.update();
    for (i = 0; i < bullets.length; i += 1) {
        bullets[i].x += Math.cos(bullets[i].direction * Math.PI / 180) * 3;
        bullets[i].y += Math.sin(bullets[i].direction * Math.PI / 180) * 3;
        bullets[i].update();
    }
    for (i = 0; i < asteroids.length; i += 1) {
        asteroids[i].x += -1 - (level * 0.1);
        asteroids[i].update();
    }
    score.text = "SCORE: " + gameArea.frameNo;
    score.update();

    if (gameArea.frameNo % 1000 === 0) {
        level += 1;
    }
}

function everyinterval(n) {
    if ((gameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function shoot() {
    var bulletDirection = spaceshipDirection;
    var bullet = new component(10, 10, "yellow", spaceship.x + spaceship.width / 2, spaceship.y + spaceship.height / 2);
    bullet.direction = bulletDirection;
    bullets.push(bullet);
    shootSound.play();
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
        this.sound.currentTime = 0; // Reset sound to the beginning
    }
}

function showGameOver() {
    gameOverText = document.createElement("div");
    gameOverText.classList.add("game-over");
    gameOverText.innerHTML = `Game Over<br>Score: ${score.text.split(" ")[1]}<br><button onclick="restartGame()">Restart</button>`;
    document.body.appendChild(gameOverText);
}

function restartGame() {
    document.body.removeChild(gameOverText);
    document.location.reload();
}

startGame();
       