'use strict';

let game;

window.onload = function() {


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

            }

    update(){

    }

}
