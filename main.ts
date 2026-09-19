/**
 * Robby 2000 — Cutebot obstacle-avoiding trundler.
 * 
 * A starts driving, B stops everything, shake plays the greeting.
 * 
 * Driving cycles forever: forward -> back up -> shuffle-turn -> forward.
 */
function startShuffleTurn () {
    phase = Phase.ShuffleTurn
turnDirection = randint(0, 1)
    angle = randint(30, 180)
    phaseUntil = input.runningTime() + angle * MS_PER_DEGREE
    if (turnDirection == 1) {
        cuteBot.motors(TURN_SPEED, 0 - TURN_SPEED)
    } else {
        cuteBot.motors(0 - TURN_SPEED, TURN_SPEED)
    }
}
function stopEverything () {
    running = false
    playing = false
    cuteBot.stopcar()
    cuteBot.closeheadlights()
    music.stopAllSounds()
    basic.clearScreen()
}
input.onButtonPressed(Button.A, function () {
    if (playing) {
        return
    }
    now = input.runningTime()
    nextHeart = now
    nextSound = now + 500
    running = true
    startForward()
})
function redLights () {
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 100, 0, 0)
}
function greenLights () {
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 0, 100, 0)
}
function startBackUp () {
    phase = Phase.BackUp
phaseUntil = input.runningTime() + BACK_UP_TIME
    cuteBot.motors(0 - REVERSE_SPEED, 0 - REVERSE_SPEED)
}
input.onButtonPressed(Button.B, function () {
    stopEverything()
})
input.onGesture(Gesture.Shake, function () {
    if (playing) {
        return
    }
    // Stop before playing, so it stays still when picked up.
    running = false
    playing = true
    cuteBot.stopcar()
    music.stopAllSounds()
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 80, 0, 100)
    basic.showIcon(IconNames.Happy)
    if (playing) {
        soundExpression.giggle.playUntilDone()
    }
    if (playing) {
        basic.showIcon(IconNames.Silly)
    }
    if (playing) {
        music.playTone(988, 100)
    }
    if (playing) {
        music.playTone(1568, 100)
    }
    if (playing) {
        soundExpression.hello.playUntilDone()
    }
    if (playing) {
        basic.showString("HELLO", 90)
    }
    if (playing) {
        basic.showIcon(IconNames.Surprised)
    }
    basic.pause(350)
    if (playing) {
        basic.showIcon(IconNames.Happy)
    }
    basic.pause(350)
    cuteBot.closeheadlights()
    basic.clearScreen()
    playing = false
})
// Each phase sets the motors once on entry, so the loop is not hammering
// the motor driver on every pass while it reads the sonar.
function startForward () {
    phase = Phase.Forward
obstacleHits = 0
    greenLights()
    cuteBot.motors(TRUNDLE_SPEED, TRUNDLE_SPEED)
}
let smallHeart = false
let distance = 0
let now2 = 0
let obstacleHits = 0
let nextSound = 0
let nextHeart = 0
let now = 0
let playing = false
let running = false
let phaseUntil = 0
let angle = 0
let turnDirection = 0
let TURN_SPEED = 0
let REVERSE_SPEED = 0
let TRUNDLE_SPEED = 0
let MS_PER_DEGREE = 0
let BACK_UP_TIME = 0
// Tuning constants.
// cm — anything this close counts as an obstacle
let OBSTACLE_DISTANCE = 10
// consecutive close readings before we believe it
let OBSTACLE_HITS_NEEDED = 3
// ms of reversing before turning
BACK_UP_TIME = 500
// turn calibration; raise it if turns come up short
MS_PER_DEGREE = 6
// medium
TRUNDLE_SPEED = 50
REVERSE_SPEED = 40
TURN_SPEED = 45
enum Phase {
    Forward,
    BackUp,
    ShuffleTurn
}
let phase = Phase.Forward
turnDirection = 1
// Startup: everything off and idle until A is pressed.
cuteBot.stopcar()
cuteBot.closeheadlights()
music.setVolume(120)
basic.showIcon(IconNames.Happy)
basic.clearScreen()
// Driving loop — runs forever, cycling through the three phases.
basic.forever(function () {
    // Also check B while it is held down.
    if (input.buttonIsPressed(Button.B)) {
        stopEverything()
    }
    if (!(running)) {
        basic.pause(50)
        return
    }
    now2 = input.runningTime()
    if (phase == Phase.Forward) {
        distance = cuteBot.ultrasonic(cuteBot.SonarUnit.Centimeters)
        // Zero means no echo came back — nothing in range, so keep going.
        // A single close reading is usually noise, so wait for a few in a row.
        if (distance > 0 && distance <= OBSTACLE_DISTANCE) {
            obstacleHits += 1
        } else {
            obstacleHits = 0
        }
        if (obstacleHits >= OBSTACLE_HITS_NEEDED) {
            cuteBot.stopcar()
            redLights()
            music.playTone(262, 120)
            // Recheck in case B or a shake landed during the tone.
            if (running) {
                startBackUp()
            }
        }
    } else if (phase == Phase.BackUp) {
        if (now2 >= phaseUntil) {
            startShuffleTurn()
        }
    } else {
        if (now2 >= phaseUntil) {
            startForward()
        }
    }
    // Sonar needs a breather between pings.
    basic.pause(60)
})
// Heart animation — independent of the driving phase.
basic.forever(function () {
    if (running && !(playing) && input.runningTime() >= nextHeart) {
        smallHeart = !(smallHeart)
        if (smallHeart) {
            basic.showIcon(IconNames.SmallHeart, 0)
        } else {
            basic.showIcon(IconNames.Heart, 0)
        }
        nextHeart = input.runningTime() + 300
    }
    basic.pause(50)
})
// Ambient squeaks and bleeps — also independent of the driving phase.
basic.forever(function () {
    if (running && !(playing) && input.runningTime() >= nextSound) {
        music.playTone(randint(700, 2200), 70)
        nextSound = input.runningTime() + randint(700, 1800)
    }
    basic.pause(50)
})
