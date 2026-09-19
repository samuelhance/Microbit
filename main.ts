// Robby 2000 — Cutebot obstacle-avoiding trundler.
//
// A starts driving, B stops everything, shake plays the greeting.
// Driving cycles forever: forward -> back up -> shuffle-turn -> forward.

// Tuning constants.
const OBSTACLE_DISTANCE = 10        // cm — anything this close counts as an obstacle
const OBSTACLE_HITS_NEEDED = 3      // consecutive close readings before we believe it
const BACK_UP_TIME = 500            // ms of reversing before turning
const MS_PER_DEGREE = 6             // turn calibration; raise it if turns come up short
const TRUNDLE_SPEED = 50            // medium
const REVERSE_SPEED = 40
const TURN_SPEED = 45

// Shake detection. Gesture.Shake fires on trundle vibration, so instead we
// count hard jolts: the force has to spike, fall away, and spike again,
// SHAKE_JOLTS_NEEDED times inside SHAKE_WINDOW. Resting force is ~1024 mg.
const SHAKE_FORCE = 2500            // mg — a spike this hard counts as one jolt
const SHAKE_RELEASE = 1500          // mg — must fall back past this before the next jolt
const SHAKE_JOLTS_NEEDED = 3        // jolts required to trigger the greeting
const SHAKE_WINDOW = 1200           // ms — they all have to land inside this

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
let obstacleHits = 0
let shakeJolts = 0
let shakeWindowEnds = 0
let shakeArmed = true
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
    obstacleHits = 0
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

function startGreeting() {
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
}

// Startup: everything off and idle until A is pressed.
cuteBot.stopcar()
cuteBot.closeheadlights()
input.setAccelerometerRange(AcceleratorRange.EightG)
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

// Shake detection — deliberately hard to trigger, so trundling never sets it off.
basic.forever(function () {
    if (playing) {
        shakeJolts = 0
        basic.pause(50)
        return
    }
    const now = input.runningTime()
    if (now > shakeWindowEnds) {
        shakeJolts = 0
    }
    const force = input.acceleration(Dimension.Strength)
    if (shakeArmed && force >= SHAKE_FORCE) {
        shakeArmed = false
        if (shakeJolts == 0) {
            shakeWindowEnds = now + SHAKE_WINDOW
        }
        shakeJolts += 1
        if (shakeJolts >= SHAKE_JOLTS_NEEDED) {
            shakeJolts = 0
            startGreeting()
        }
    } else if (!shakeArmed && force <= SHAKE_RELEASE) {
        shakeArmed = true
    }
    basic.pause(20)
})