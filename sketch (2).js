let intro_sound;
let introVideo;
let missile_sound;
let explosion_sound;
let game_over_sound;

let currentScene = 'loading';

let player;
let enemies;
let missiles;
let asteroids;

let playerImg;
let missilesImg;
let enemiesImg;
let asteroidsImg;

let gbImg;
let menuBg;
let game_over_bg;
let leaderboard_bg;

let leaderboard_data;
let leaderboard = [];

let enemiesSpeed = 5;

let gb = 0;
let scrolling_speed = 2;

let score = 0;
let playerHealth = 3;

let obstacles_destroyed = 0;

let selectedOption = 0;
let MainMenuOptions = ["Start Game", "Check Scoreboard"];

let player_name = '';

let inputBox;
let startButton;

let inputShown = false;

let bonusText = '';
let bonusTimer = 0;

function preload(){

    intro_sound = loadSound('assets/sounds/intro.wav');
    missile_sound = loadSound('assets/sounds/missile.wav');
    explosion_sound = loadSound('assets/sounds/bubbles.wav');
    game_over_sound = loadSound('assets/sounds/gameover.wav');

    playerImg = loadImage('assets/images/submarine.png');
    enemiesImg = loadImage('assets/images/shark.png');
    asteroidsImg = loadImage('assets/images/piranha.png');
    missilesImg = loadImage('assets/images/torpedo.png');

    gbImg = loadImage('assets/images/ocean_bg.png');
    menuBg = loadImage('assets/images/menu_bg.png');

    game_over_bg = loadImage('assets/images/ocean_bg.png');
    leaderboard_bg = loadImage('assets/images/ocean_bg.png');

    leaderboard_data = loadJSON("leaderboard.json");
}

function setup(){

    createCanvas(4000, 2000);

    introVideo = createVideo('assets/videos/intro.mp4');
    introVideo.hide();
    introVideo.volume(0);
    introVideo.loop();

    leaderboard = Object.values(leaderboard_data);
    leaderboard.sort((a, b) => b.score - a.score);

    player = createSprite(500, height/2);

    player.addImage(playerImg);
    player.scale = 1.5;
    player.rotation = 90;

    enemies = new Group();
    missiles = new Group();
    asteroids = new Group();

    setInterval(spawnEnemy, 1500);
    setInterval(spawnAsteroid, 4000);
}

function draw(){

    background(0);

    if(currentScene == "loading"){

        drawLoadingScene();

    } else if(currentScene == "main menu"){

        cleanNameInput();
        drawMainMenuScene();

    } else if(currentScene == "nameInput"){

        if(!inputShown){
            showNameInput();
            inputShown = true;
        }

        image(menuBg, 0, 0, width, height);

        fill(255);
        textSize(100);
        textAlign(CENTER, CENTER);

        text("ENTER YOUR NAME", width/2, 200);

    } else if(currentScene == "game"){

        cleanNameInput();
        drawGame();

    } else if(currentScene == "game over"){

        cleanNameInput();
        drawGameOver();

    } else if(currentScene == "leaderboard"){

        cleanNameInput();
        drawLeaderboard();
    }
}

function drawLoadingScene(){

    image(introVideo, 0, 0, width, height);

    fill(255);

    textAlign(CENTER, CENTER);

    textFont('Georgia');
    textStyle(BOLD);

    textSize(250);

    text('SUBMARINE SURVIVAL', width/2, height/2 - 200);

    textFont('monospace');

    textSize(80);

    text('Loading...', width/2, height/2 + 100);

    if(millis() > 5000){

        currentScene = 'main menu';
    }
}

function drawMainMenuScene(){

    if(!intro_sound.isPlaying()){
        intro_sound.play();
    }

    image(menuBg, 0, 0, width, height);

    fill('white');

    textFont('Georgia');
    textStyle(BOLD);

    textSize(220);

    textAlign(CENTER, CENTER);

    text('SUBMARINE SURVIVAL', width / 2, 350);

    let options = [

        { text: "Start Game", x: 1500, y: 800},

        { text: "Check leaderboard", x: 1500, y: 1200}
    ];

    for (let i = 0; i < options.length; i++){

        let rectWidth = 1000;
        let rectHeight = 200;

        if(selectedOption == i){

            fill(255, 204, 0);

        } else {

            fill('white');
        }

        rect(options[i].x, options[i].y, rectWidth, rectHeight, 10);

        fill('black');

        textFont('monospace');
        textSize(70);

        textStyle(BOLD);

        textAlign(CENTER, CENTER);

        text(
            options[i].text,
            options[i].x + rectWidth/2,
            options[i].y + rectHeight/2
        );
    }
}

function keyPressed(){

    if(currentScene == "main menu"){

        if(keyCode == UP_ARROW){

            selectedOption =
            (selectedOption - 1 + MainMenuOptions.length)
            % MainMenuOptions.length;

        } else if(keyCode == DOWN_ARROW){

            selectedOption =
            (selectedOption + 1)
            % MainMenuOptions.length;

        } else if(keyCode == ENTER){

            if(selectedOption === 0){

                currentScene = "nameInput";

            } else if(selectedOption === 1){

                currentScene = "leaderboard";
            }
        }

    } else if(currentScene == "nameInput"){

        if(keyCode == ESCAPE){

            cleanNameInput();
            currentScene = "main menu";
        }

    } else if(currentScene === "game"){

        if(keyCode === ENTER){

            launchMissile();
        }

    } else if(currentScene === "game over"){

        if(keyCode === ENTER){

            startGame();

        } else if(keyCode == 32){

            currentScene = "main menu";
        }

    } else if(currentScene == "leaderboard"){

        if(keyCode == ESCAPE){

            currentScene = "main menu";
        }
    }
}

function drawGame(){

    gb -= scrolling_speed;

    if(gb <= -width){
        gb = 0;
    }

    image(gbImg, gb, 0, width + 5, height);
    image(gbImg, gb + width - 2, 0, width + 5, height);

    fill(255);

    textFont('monospace');
    textStyle(BOLD);

    textAlign(LEFT, TOP);

    textSize(55);
    text("Current Score: " + score, 60, 50);

    textSize(45);
    text("Health: " + playerHealth, 60, 120);

    textSize(30);
    text("Captain: " + player_name, 60, 190);

    if(keyIsDown(UP_ARROW)){
        player.position.y -= 8;
    }

    if(keyIsDown(DOWN_ARROW)){
        player.position.y += 8;
    }

    player.position.x = 500;

    player.position.y =
    constrain(player.position.y, 0, height);

    for(let e of enemies){

        e.position.x -= enemiesSpeed;

        if(e.position.x < -50){
            e.remove();
        }
    }

    for(let a of asteroids){

        a.position.x -= enemiesSpeed - 1;

        if(a.position.x < -50){
            a.remove();
        }
    }

    missiles.overlap(enemies, (m,e) => {

        m.remove();
        e.remove();

        explosion_sound.play();

        score += 5;

        scoreBonus();
    });

    missiles.overlap(asteroids, (m,a) => {

        m.remove();
        a.remove();

        explosion_sound.play();

        score += 3;

        scoreBonus();
    });

    if(millis() - bonusTimer < 1000 && bonusText != ''){

        fill(255,255,0);

        textSize(200);

        textStyle(BOLD);

        textAlign(TOP, RIGHT);

        text(bonusText, width - 200, 100);

    } else {

        bonusText = '';
    }

    drawSprites();

    if(frameCount % 300 == 0){
        enemiesSpeed += 0.5;
    }

    player.overlap(enemies, (p,e) => {

        e.remove();

        playerHealth--;

        if(playerHealth <= 0){

            game_over_sound.play();

            currentScene = "game over";
        }
    });

    player.overlap(asteroids, (p,a) => {

        a.remove();

        playerHealth--;

        if(playerHealth <= 0){

            game_over_sound.play();

            currentScene = "game over";
        }
    });
}

function spawnEnemy(){

    let enemy =
    createSprite(width + 50,
    random(200, height - 200));

    enemy.addImage(enemiesImg);

    enemy.scale = random(0.5, 0.9);

    enemies.add(enemy);
}

function spawnAsteroid(){

    let asteroid =
    createSprite(width + 50,
    random(200, height - 200));

    asteroid.addImage(asteroidsImg);

    asteroid.scale = random(0.6, 1.2);

    asteroids.add(asteroid);
}

function launchMissile(){

    missile_sound.play();

    let missile =
    createSprite(player.position.x + 50,
    player.position.y);

    missile.addImage(missilesImg);

    missile.scale = 0.7;

    missile.velocity.x = 20;

    missiles.add(missile);
}

function drawGameOver(){

    image(game_over_bg, 0, 0, width, height);

    fill(255,255,0);

    textFont('Georgia');
    textStyle(BOLD);

    textSize(200);

    textAlign(CENTER, CENTER);

    text("GAME OVER", width/2, 500);

    textSize(80);

    fill(255);

    text(
        'Press ENTER to Play Again!',
        width / 2,
        height / 2 + 200
    );

    textSize(65);

    fill(230);

    text(
        'Press SPACE to return to Main Menu',
        width / 2,
        height / 2 + 320
    );
}

function startGame(){

    intro_sound.stop();

    enemies.removeSprites();
    asteroids.removeSprites();
    missiles.removeSprites();

    player.position.x = 500;
    player.position.y = height / 2;

    enemiesSpeed = 5;

    currentScene = 'game';

    score = 0;

    playerHealth = 3;

    obstacles_destroyed = 0;
}

function scoreBonus(){

    obstacles_destroyed++;

    if(obstacles_destroyed % 10 == 0){

        score += 10;

        bonusText = "+10";

        bonusTimer = millis();
    }
}

function drawLeaderboard(){

    tint(255,255,255,150);

    image(leaderboard_bg, 0, 0, width, height);

    noTint();

    fill(255);

    textAlign(CENTER, TOP);

    textFont('Georgia');

    textSize(200);

    textStyle(BOLD);

    text("LEADERBOARD", width/2, 180);

    textFont('monospace');

    textSize(120);

    fill('yellow');

    text("NAME", width/2 - 400, 450);

    text("SCORE", width/2 + 400, 450);

    fill('white');

    for(let i = 0; i < leaderboard.length; i++){

        textAlign(CENTER, TOP);

        text(
            leaderboard[i].name,
            width/2 - 400,
            600 + i*150
        );

        text(
            leaderboard[i].score,
            width/2 + 400,
            600 + i*150
        );
    }

    textSize(60);

    fill('lightgray');

    text(
        'Press ESC to return to main menu',
        width/2,
        height - 200
    );
}

function showNameInput(){

    if(!inputBox){

        inputBox = createInput('');

        inputBox.position(width/2 - 300, height/2);

        inputBox.size(400,100);

        inputBox.style('font-size', '40px');
    }

    if(!startButton){

        startButton = createButton('Start');

        startButton.position(width / 2 + 250, height / 2);

        startButton.size(150, 100);

        startButton.style('font-size', '40px');

        startButton.mousePressed(() => {

            player_name = inputBox.value().trim();

            if(player_name !== ""){

                cleanNameInput();

                startGame();
            }
        });
    }
}

function cleanNameInput(){

    if(inputBox){

        inputBox.remove();

        inputBox = null;
    }

    if(startButton){

        startButton.remove();

        startButton = null;
    }

    inputShown = false;
}