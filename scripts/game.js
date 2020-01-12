'use strict';
let HGscore = 0;
let game;

// objet avec les variables globales
let gameOptions = {
    platformStartSpeed: 350,
    spawnRange: [100, 350],
    platformSizeRange: [50, 250],
    playerGravity: 900,
    jumpForce: 400,
    playerStartPosition: 200,
    jumps: 2,
};

window.onload = function() {

    // objet de configuration
    let gameConfig = {
        type: Phaser.AUTO,
        width: 1334,
        height: 750,
        scene: playGame,
        backgroundColor: 0x414045,
        style: { font: '20px Arial', fill: '#fff' },

        // physique
        physics: {
            default: "arcade"
        }
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    window.addEventListener("resize", resize, false);
};


// playGame scene
class playGame extends Phaser.Scene{

    preload(){
        this.load.image("platformWhite", "ressources/graphics/platformWhite.png");
        this.load.image("platformBlack", "ressources/graphics/platformBlack.png");
        this.load.image("player", "ressources/graphics/player.png");
        this.load.audio("gameover", 'ressources/sound/gameover.wav');
        this.load.audio("jump", 'ressources/sound/jump.wav');

    }
    create(){

        //score
        this.score = 0;
        this.scoreText = this.add.text(20, 20,'current score: '+this.score, this.style);
        this.HGscoreText = this.add.text(20, 40, 'highest score: '+  HGscore, this.style);
        // this.pauseText = this.add.text(40,20, 'Press Esc to pause', this.style);

        // plateformes actives
        this.platformGroup = this.add.group({

            // après être sortie du groupe actif, les plateformes sont envoyées dans le pool
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        // pool de plateformes
        this.platformPool = this.add.group({

            // après être sortie du pool, la plateforme retourne dans le groupe actif
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        // init le compteur de saut
        this.playerJumps = 0;

        // ajout des platformes, prends en param largeur et  position X
        this.addPlatform(game.config.width, game.config.width / 2);

        // création du joueur;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player");
        this.player.setGravityY(gameOptions.playerGravity);

        // collision entre le joueur et le groupe de platform
        this.physics.add.collider(this.player, this.platformGroup);

        // les touches pour sauter
        this.input.on('pointerdown', this.jump, this);
        this.input.keyboard.on('keydown_SPACE', this.jump, this);
        this.input.keyboard.on('keydown_UP', this.jump, this);
        this.input.keyboard.on('keydown_Z', this.jump, this);

        //gestion pause
        //this.input.keyboard.on('keydown_ESC', this.pause);

    }

    update(){
        this.scoreF();

        //game over
        if(this.player.y > game.config.height){
            this.sound.play('gameover')
            this.scene.restart("PlayGame");

            if(HGscore<this.score){
                HGscore = this.score;
                this.scoreText.setText('score: '+this.score);
            }
        }
        this.player.x = gameOptions.playerStartPosition;

        // recyclage des platforms
        let minDistance = game.config.width;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            minDistance = Math.min(minDistance, platformDistance);
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        //ajout de nouvelles platformes
        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2);
        }


    }

    // pause(){
    //     this.scene.launch('pauseGame');
    // }

    //gestion saut
    jump(){
        if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)){
            if(this.player.body.touching.down){
                this.playerJumps = 0;
            }
            this.sound.play('jump');
            this.player.setVelocityY(gameOptions.jumpForce * -1);
            this.playerJumps ++;
        }
    }

    //protoype de fonction de rotation au saut, marche pas est fais planter le navigateur apres quelques secondes
    rotateJump(){
        let value = this.player.angle + 45;
        while (!(this.player.body.touching.down)|| this.player.angle < value)
            this.player.angle +=10;
    }

    scoreF(){
        //incrementation du score
        this.score += 1;
        //affichage du score
        this.scoreText.setText('score: '+this.score);
    }

    // ajout/creation des plateformes
    addPlatform(platformWidth, posX){
        let platform;
        let temp;

        if(this.score<100){
            temp = "platformWhite";
            this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#414045");
            // this.style = Phaser.Display.Color.HexStringToColor("#919099");
        }else{
            temp = "platformBlack";
            this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#919099");
            // this.style = Phaser.Display.Color.HexStringToColor("#414045");
        }
        // console.log(this.style);

        if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
        }
        else{
            platform = this.physics.add.sprite(posX, game.config.height * 0.8, temp);
            platform.setImmovable(true);
            platform.setVelocityX(gameOptions.platformStartSpeed * -1);
            this.platformGroup.add(platform);
        }
        platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }
}

//pour bonne adaptation avec le navigateur
function resize(){
    let canvas = document.querySelector("canvas");
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let windowRatio = windowWidth / windowHeight;
    let gameRatio = game.config.width / game.config.height;
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else{
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}

//pause scene
/*class pauseGame extends playGame{
    preload(){
        this.load.image("pauseScreen", "ressources/graphics/pause.PNG");
        this.load.audio("ambient", "ressources/sound/ambient.mp3");
    }
    create() {
        this.input.keyboard.on('keydown_ESC', this.resume());
    }
    update(){}
    resume(){
        playGame.scene.launch('playGame');
    }
}*/
