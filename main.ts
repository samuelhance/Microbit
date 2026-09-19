input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    if (!playing) {
        turn_until = 0
        next_move = 0
        next_heart = 0
        next_sound = input.runningTime() + 500
        running = true
    }
    
})
input.onGesture(Gesture.Shake, function on_gesture_shake() {
    
    if (playing) {
        return
    }
    
    //  Stop before playing, so it stays still when picked up.
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
function on_button_pressed_b() {
    
    running = false
    playing = false
    cuteBot.stopcar()
    cuteBot.closeheadlights()
    music.stopAllSounds()
    basic.clearScreen()
}

let small_heart = false
let move_style = 0
let running = false
let next_sound = 0
let next_heart = 0
let next_move = 0
let turn_until = 0
let playing = false
let turn_direction = 1
//  Increase this if your robot turns too close to walls.
let obstacle_distance = 25
input.onButtonPressed(Button.B, on_button_pressed_b)
cuteBot.stopcar()
cuteBot.closeheadlights()
music.setVolume(120)
basic.showIcon(IconNames.Happy)
basic.forever(function on_forever() {
    let now: number;
    let distance: number;
    
    //  Also check B while it is held down.
    if (input.buttonIsPressed(Button.B)) {
        on_button_pressed_b()
    }
    
    if (running) {
        now = input.runningTime()
        if (now < turn_until) {
            //  Short turn on the spot to face away from an obstacle.
            if (turn_direction == 1) {
                cuteBot.motors(30, -30)
            } else {
                cuteBot.motors(-30, 30)
            }
            
        } else {
            distance = cuteBot.ultrasonic(cuteBot.SonarUnit.Centimeters)
            //  Recheck in case B or shake occurred during the reading.
            if (running) {
                if (distance <= obstacle_distance) {
                    //  Zero means no usable echo: turn cautiously.
                    cuteBot.stopcar()
                    turn_direction = randint(0, 1)
                    turn_until = input.runningTime() + randint(350, 650)
                    next_move = 0
                    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 100, 0, 0)
                } else {
                    if (now >= next_move) {
                        move_style = randint(0, 2)
                        next_move = now + randint(2500, 4500)
                    }
                    
                    if (move_style == 0) {
                        //  Explore forwards.
                        cuteBot.motors(35, 35)
                    } else if (move_style == 1) {
                        //  Circle left.
                        cuteBot.motors(18, 40)
                    } else {
                        //  Circle right.
                        cuteBot.motors(40, 18)
                    }
                    
                    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 0, 70, 100)
                }
                
            }
            
        }
        
        if (running && now >= next_heart) {
            small_heart = !small_heart
            if (small_heart) {
                basic.showIcon(IconNames.SmallHeart, 0)
            } else {
                basic.showIcon(IconNames.Heart, 0)
            }
            
            next_heart = now + 300
        }
        
        if (running && now >= next_sound) {
            //  A mixture of high squeaks and lower bleeps.
            music.playTone(randint(700, 2200), 70)
            next_sound = input.runningTime() + randint(700, 1800)
        }
        
    }
    
    basic.pause(50)
})
