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

    }
    create(){

    }

    update(){

    }

}
