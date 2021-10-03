/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let goodBlockRatio = 0.25;
let blockSpawnRate = 500;

window.addEventListener('keydown', (e) => {
    
    if(e.key === '1') {
        goodBlockRatio = 0.35;
        blockSpawnRate = 500;
        console.log(goodBlockRatio, blockSpawnRate);
    }
    if(e.key === '2') {
        goodBlockRatio = 0.25;
        blockSpawnRate = 400;
        console.log(goodBlockRatio, blockSpawnRate);
    }
    if(e.key === '3') {
        goodBlockRatio = 0.17;
        blockSpawnRate = 350;
        console.log(goodBlockRatio, blockSpawnRate);
    }
    if(e.key === '4') {
        goodBlockRatio = 0.07;
        blockSpawnRate = 100;
        console.log(goodBlockRatio, blockSpawnRate);
    }
});

const BLOCK_SIZE = 32;

let sbImage = new Image();
sbImage.src = "../Images/scoreboard.png";


let player = {
    x: 400,
    y: canvas.height - BLOCK_SIZE * 3,
    width: BLOCK_SIZE * 2,
    height: BLOCK_SIZE / 2,

    isShifting: false,
    isMovingLeft: false,
    isMocingRight: false,
    speed: 10,

    update: function() {
        //move left or move right if moving?
        if(this.isMovingLeft) this.x -= this.speed;
        if(this.isMovingRight) this.x += this.speed;
        if(this.isShifting)
        {this.speed = 20;}
        //if you are shifting then you will go twice the speed (this.speed = 20 instead of 10)
        else{ this.speed = 10;}
        //make sure we are not off the canvas
        if(this.x <0) this.x = 0;
        if(this.x > canvas.width - this.width) this.x = canvas.width - this.width;

    },
    render: function() {
        ctx.save();      
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    },

};

let scoreBoard = {
    goodTally: 0,
    badTally: 0,
    goodBlocks: [],
    badBlocks: [],
    x: 8,
    y: 544,
    scoreBlockY: 552,
    victoryBlockX: 384,

    scoreBlock: function(block) {
        let goodStartingX = 16;
        let badStartingX = 752;
        let scoreBlockSpacing = 40;
        let spacingMultiplier = 0;
        
        if(block.isGoodBlock) {
            this.goodTally++;
            this.goodBlocks.push(block);
            spacingMultiplier = this.goodBlocks.length - 1;
            if (spacingMultiplier < 8) {
				block.x = goodStartingX + spacingMultiplier * scoreBlockSpacing;
			} else {
				block.x = this.victoryBlockX;
				this.isGameOver = true;
				didPlayerWin = true;
            }
        }else {
            this.badTally++;
            this.badBlocks.push(block);
            spacingMultiplier = this.badBlocks.length - 1;
            
            if (spacingMultiplier < 8) {
				block.x = badStartingX - spacingMultiplier * scoreBlockSpacing;
			} else {
				block.x = this.victoryBlockX;
				this.isGameOver = true;
				didPlayerWin = false;
            }
        }
        block.isScored = true;
        block.y = this.scoreBlockY;
    },
    update: function() {},
    render: function() {
        ctx.save();
        ctx.drawImage(sbImage, this.x, this.y);
        this.goodBlocks.forEach(block => block.render());
        this.badBlocks.forEach(block => block.render());
        ctx.restore();
    },

};

window.addEventListener('keydown', (e) => {
    //console.log(e.key);
    if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        player.isMovingLeft = true;
    if(e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        player.isMovingRight = true;
    if(e.key === "Shift") player.isShifting = true;
});

window.addEventListener('keyup', (e) => {
    //console.log(e.key);
    if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
        player.isMovingLeft = false;
    if(e.key === "ArrowRight" || e.key === "d" || e.key === "D")
        player.isMovingRight = false;
    if(e.key === "Shift") player.isShifting = false;
});


class Block {
    constructor() {
        this.width = BLOCK_SIZE;
        this.height = this.width;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 0 - this.height;  // off screen to start
        this.speed = Math.random() * 10 + 1;
        // multiplies the random speed of the block by ten to make it a variable between 0 and ten and add a 1 to let it not be 0.
        this.isGoodBlock = Math.random() <= goodBlockRatio;
        this.isOffScreen = false;
        this.isCaught = false;
        this.isScored = false;
        
        
        this.isFading = false;
        this.opacity = 1;

        this.color = this.isGoodBlock ? 123 : 0;
        // the color of the green blocks is 123 on the hsla, which is green. 0 is red.
    }


    update() {
        this.y += this.speed;
        // this.y = this.y + this.speed
        //the position of the block is always moving and always being refreshed or updated.
        this.isOffScreen = this.y >= canvas.height;
        //if(this.y >= canvas.height) this.isOffScreen = true;
        this.checkForCatch();
        if(this.isFading) this.opacity -= .08;
    }
    
    render() {
        ctx.save();

        ctx.fillStyle = `hsla(${this.color}, 100%, 50%, ${this.opacity})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.restore();
        
    }

    checkForCatch() {
        let bottom = this.y + this.height;

        //if I am abouve the bottom of the block, return
        if(bottom < player.y) return;
        if(this.isFading || this.isOffScreen || this.isCaught) return;

        let rhs = this.x + this.width;
        if(rhs < player.x || this.x > player.x + player.width) {
            this.isFading = true;
            return;
        }

        scoreBoard.scoreBlock(this);
        this.isCaught = true;

    }
}



//let myBlock = new Block();
//console.log (myBlock);


let blocks = [ new Block() ];
let currentTime = 0;
let timeScinceLastBlock = 0;

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let changeInTime = timestamp - currentTime;
    currentTime = timestamp;

        timeScinceLastBlock += changeInTime;
    if(timeScinceLastBlock >= blockSpawnRate) {
        timeScinceLastBlock = 0;
        blocks.push(new Block());
        //this block of code greatly changes the amount of blocks spawned everysecond
        
    }
    
    blocks.forEach((block) => {
        block.update();
        block.render();
        //each block updates and renders
    });

    blocks = blocks.filter(b => !b.isOffScreen && !b.isCaught);
//console.log(blocks);

player.update();
player.render();

scoreBoard.update();
scoreBoard.render();

if(!scoreBoard.isGameOver)
    requestAnimationFrame(gameLoop);
    
}

requestAnimationFrame(gameLoop);




//ctx.fillStyle = "red";

//let y = 0;

//function animate() {
//    ctx.clearRect(0,0, canvas.width, canvas.height)
//    ctx.fillRect(100, y, 75, 75);
//    y = y + 1;
//    requestAnimationFrame(animate);
// }

// animate();
