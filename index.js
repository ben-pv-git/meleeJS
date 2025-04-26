const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// set screen dimensions
canvas.width = 1024
canvas.height = 768

// fill background
c.fillRect(0, 0, canvas.width, canvas.height)

// gravity multiplier
let gravity = 1

// declare player
const player = new Fighter({
    character: new Falco(),
    position: {
        x: 149,
        y: 460
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: './img/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 175
    },
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    hitBox: {
        offset: {
            x: 100,
            y: 34
        },
        width: 150,
        height: 50
    }
})

// declare enemy
const enemy = new Fighter({
    character: new Fox(),
    position: {
        x: canvas.width - 200,
        y: 420
    },
    velocity: {
        x: 0,
        y: 0
    },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 170
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './img/kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 7
        }
    },
    hitBox: {
        offset: {
            x: -165,
            y: 50
        },
        width: 140,
        height: 50
    }
})

// holders for movement key states
const keys = {
    // player keys
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    s: {
        pressed: false
    },

    // enemy keys
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

decreaseTimer()

/* 
FRAMERATE CALCULATION REFERENCE: 
https://chriscourses.com/blog/standardize-your-javascript-games-framerate-for-different-monitors
*/

// set time in ms from page load until now
let msPrev = window.performance.now()

// constants for framerate
const fps = 60
const msPerFrame = 1000 / fps

// start frame counter at 0
// let frames = 0
function animate() {
    // recursively call animation frames
    window.requestAnimationFrame(animate)

    // get how many ms have passed since previous game loop
    // if its less than ms per frame, dont update animations
    const msNow = window.performance.now()
    const msPassed = msNow - msPrev
    if (msPassed < msPerFrame) return

    // get left over time between game loop iterations
    // subtract left over time from next loop using msPrev
    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    // add to frame counter
    // frames++

    // color background and floor
    c.fillStyle = 'rgb(5, 0, 80)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'rgb(0, 0, 0)'
    c.fillRect(0, 570, canvas.width, canvas.height)

    // update characters
    player.update()
    enemy.update()

    // Sprites dont move if no keys pressed
    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -player.character.runSpeed
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = player.character.runSpeed
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // player jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
        if (keys.s.pressed && player.lastKey === 's') {
            gravity = 1.2
        }
    }

    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -enemy.character.runSpeed
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = enemy.character.runSpeed
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // enemy jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // detect player attack collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        // check framesCurrent for first active hitbox frame
        player.isAttacking && player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false
        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // detect enemy attack collision & player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        // check framesCurrent for first active hitbox frame
        enemy.isAttacking && enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

// log frame counter
// setInterval(() => {
//     console.log(frames)
//   }, 1000)

animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            // player keys
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'
                break
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'w':
                player.velocity.y = -17
                break
            case 's':
                keys.s.pressed = true
                player.lastKey = 's'
                break
            case ' ':
                player.attack()
                break
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            // enemy keys
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowUp':
                enemy.velocity.y = -17
                break
            case 'ArrowDown':
                enemy.attack()
                break
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        // player keys
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break

        // enemy keys
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
    }
})
