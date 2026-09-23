// Robby 2000 — Cutebot obstacle-avoiding trundler.
//
// A starts driving, B stops everything, shake plays the greeting.
// Driving cycles forever: forward -> back up -> shuffle-turn -> forward.

// Tuning constants.
const OBSTACLE_DISTANCE = 10        // cm — anything this close counts as an obstacle
const BACK_UP_TIME = 500            // ms of reversing before turning
const MS_PER_DEGREE = 6             // turn calibration; raise it if turns come up short
const MAX_TRUNDLE_TIME = 5000       // ms — turn anyway after this long driving forward
const TRUNDLE_SPEED = 50            // medium
const REVERSE_SPEED = 40
const TURN_SPEED = 45

enum Phase {
    Forward,
    BackUp,
    ShuffleTurn
}

let running = false
let playing = false
let phase = Phase.Forward
let phaseUntil = 0
let turnDirection = 1
let nextHeart = 0
let nextSound = 0
let smallHeart = false

function greenLights() {
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 0, 100, 0)
}

function redLights() {
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 100, 0, 0)
}

// Each phase sets the motors once on entry, so the loop is not hammering
// the motor driver on every pass while it reads the sonar.
function startForward() {
    phase = Phase.Forward
    phaseUntil = input.runningTime() + MAX_TRUNDLE_TIME
    greenLights()
    cuteBot.motors(TRUNDLE_SPEED, TRUNDLE_SPEED)
}

function startBackUp() {
    phase = Phase.BackUp
    phaseUntil = input.runningTime() + BACK_UP_TIME
    cuteBot.motors(-REVERSE_SPEED, -REVERSE_SPEED)
}

function startShuffleTurn() {
    phase = Phase.ShuffleTurn
    turnDirection = randint(0, 1)
    const angle = randint(30, 180)
    phaseUntil = input.runningTime() + angle * MS_PER_DEGREE
    if (turnDirection == 1) {
        cuteBot.motors(TURN_SPEED, -TURN_SPEED)
    } else {
        cuteBot.motors(-TURN_SPEED, TURN_SPEED)
    }
}

function stopEverything() {
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
    const now = input.runningTime()
    nextHeart = now
    nextSound = now + 500
    running = true
    startForward()
})

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
    if (!running) {
        basic.pause(50)
        return
    }

    const now = input.runningTime()

    if (phase == Phase.Forward) {
        const distance = cuteBot.ultrasonic(cuteBot.SonarUnit.Centimeters)
        // Zero means no usable echo: treat it as an obstacle to be safe.
        const blocked = distance <= OBSTACLE_DISTANCE
        if (blocked || now >= phaseUntil) {
            cuteBot.stopcar()
            redLights()
            music.playTone(262, 120)
            // Recheck in case B or a shake landed during the tone.
            if (running) {
                startBackUp()
            }
        }
    } else if (phase == Phase.BackUp) {
        if (now >= phaseUntil) {
            startShuffleTurn()
        }
    } else {
        if (now >= phaseUntil) {
            startForward()
        }
    }

    // Sonar needs a breather between pings.
    basic.pause(60)
})

// Heart animation — independent of the driving phase.
basic.forever(function () {
    if (running && !playing && input.runningTime() >= nextHeart) {
        smallHeart = !smallHeart
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
    if (running && !playing && input.runningTime() >= nextSound) {
        music.playTone(randint(700, 2200), 70)
        nextSound = input.runningTime() + randint(700, 1800)
    }
    basic.pause(50)
})