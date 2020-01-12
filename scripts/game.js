'use strict';

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
        // ajout des platformes, prends en param largeur et  position X
        this.addPlatform(game.config.width, game.config.width / 2);

        // création du joueur;
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player");
        this.player.setGravityY(gameOptions.playerGravity);
        // collision entre le joueur et le groupe de platform
        this.physics.add.collider(this.player, this.platformGroup);
    update(){
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