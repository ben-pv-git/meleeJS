class Sprite {
    constructor({
        position,
        imageSrc,
        scale,
        framesMax = 1,
        offset = { x: 0, y: 0 },
        dimensions = { width: 0, height: 0 }
    }) {
        this.position = position
        this.width = dimensions.width
        this.height = dimensions.height
        this.image = new Image()
        this.image.src = imageSrc
        this.scale = scale
        // max amount of frames in an image
        this.framesMax = framesMax
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 11
        this.offset = offset
    }

    // draw boxes
    draw() {
        // canvas is weird, crop size of an image is first 4 args after image
        // first 2 are starting position of crop, next 2 are width and height
        c.drawImage(
            this.image,
            this.framesCurrent * (this.image.width / this.framesMax),
            0,
            // divide by framesMax cause theres a different num of
            // frames in shop image vs background image
            this.image.width / this.framesMax,
            this.image.height,
            this.position.x - this.offset.x,
            this.position.y - this.offset.y,
            (this.image.width / this.framesMax) * this.scale,
            this.image.height * this.scale
        )
    }

    animateFrames() {
        // this is jank, basically just makes animations run
        // as fast as "expected"
        this.framesElapsed++
        this.framesElapsed++
        this.framesElapsed++
        this.framesElapsed++

        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++
            } else {
                this.framesCurrent = 0
            }
        }
    }
    // update hurtbox location
    update() {
        this.draw()
        this.animateFrames()
    }
}

class Fighter extends Sprite {
    constructor({
        character,
        position,
        velocity,
        color = 'blue',
        imageSrc,
        scale = 1,
        framesMax = 1,
        offset = { x: 0, y: 0 },
        sprites,
        hitBox  = { offset: {}, width: undefined, height: undefined }
    }) {
        super({
            position,
            imageSrc,
            scale,
            framesMax,
            offset
        })
        this.character = character
        this.velocity = velocity
        this.width = character.width
        this.height = character.height
        this.lastKey
        this.hitBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset: hitBox.offset,
            width: hitBox.width,
            height: hitBox.height
        }
        this.color = color
        this.isAttacking
        this.health = 100
        this.framesCurrent = 0
        this.framesElapsed = 0
        this.framesHold = 40
        this.sprites = sprites
        this.dead = false

        for (const sprite in this.sprites) {
            sprites[sprite].image = new Image()
            sprites[sprite].image.src = sprites[sprite].imageSrc
        }
    }

    // update hurtbox location
    update() {
        this.draw()
        if (!this.dead) this.animateFrames()

        // hitbox position starts from starting Sprite position,
        // update it as Sprite position changes
        this.hitBox.position.x = this.position.x + this.hitBox.offset.x
        this.hitBox.position.y = this.position.y + this.hitBox.offset.y

        // show hurtbox
        c.fillStyle = ('rgba(0, 0 , 255, 0.4)')
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

        // update x and y coordinates based on velocity
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // gravity function
        // if hurtbox is at or past bottom of screen vertically, stop falling.
        // else, accelerate with gravity
        if (this.position.y + this.height + this.velocity.y >= canvas.height - 198) {
            this.velocity.y = 0
            // 270 is "height of the stage" from the bottom of the screen
            this.position.y = canvas.height - 198 - this.height
        } else this.velocity.y += gravity
    }

    // Sprite attack
    attack() {
        this.switchSprite('attack1')
        this.isAttacking = true
    }

    takeHit() {
        this.health -= 20

        if (this.health <= 0) {
            this.switchSprite('death')
        } else this.switchSprite('takeHit')
    }

    switchSprite(sprite) {
        if (this.image === this.sprites.death.image) {
            if (this.framesCurrent === this.sprites.death.framesMax - 1)
                this.dead = true
            return
        }

        // override all animations with attack animation
        if (
            this.image === this.sprites.attack1.image &&
            this.framesCurrent < this.sprites.attack1.framesMax - 1
        )
            return

        // override when fighter takes hit
        if (
            this.image === this.sprites.takeHit.image &&
            this.framesCurrent < this.sprites.takeHit.framesMax - 1
        )
            return

        switch (sprite) {
            case 'idle':
                if (this.image !== this.sprites.idle.image) {
                    this.image = this.sprites.idle.image
                    this.framesMax = this.sprites.idle.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'run':
                if (this.image !== this.sprites.run.image) {
                    this.image = this.sprites.run.image
                    this.framesMax = this.sprites.run.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'jump':
                if (this.image !== this.sprites.jump.image) {
                    this.image = this.sprites.jump.image
                    this.framesMax = this.sprites.jump.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'fall':
                if (this.image !== this.sprites.fall.image) {
                    this.image = this.sprites.fall.image
                    this.framesMax = this.sprites.fall.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'attack1':
                if (this.image !== this.sprites.attack1.image) {
                    this.image = this.sprites.attack1.image
                    this.framesMax = this.sprites.attack1.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'takeHit':
                if (this.image !== this.sprites.takeHit.image) {
                    this.image = this.sprites.takeHit.image
                    this.framesMax = this.sprites.takeHit.framesMax
                    this.framesCurrent = 0
                }
                break;
            case 'death':
                if (this.image !== this.sprites.death.image) {
                    this.image = this.sprites.death.image
                    this.framesMax = this.sprites.death.framesMax
                    this.framesCurrent = 0
                }
                break;
        }
    }
}