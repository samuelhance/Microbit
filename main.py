def on_button_pressed_a():
    global turn_until, next_move, next_heart, next_sound, running
    if not (playing):
        turn_until = 0
        next_move = 0
        next_heart = 0
        next_sound = input.running_time() + 500
        running = True
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_gesture_shake():
    global running, playing
    if playing:
        return
    # Stop before playing, so it stays still when picked up.
    running = False
    playing = True
    cuteBot.stopcar()
    music.stop_all_sounds()
    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 80, 0, 100)
    basic.show_icon(IconNames.HAPPY)
    if playing:
        soundExpression.giggle.play_until_done()
    if playing:
        basic.show_icon(IconNames.SILLY)
    if playing:
        music.play_tone(988, 100)
    if playing:
        music.play_tone(1568, 100)
    if playing:
        soundExpression.hello.play_until_done()
    if playing:
        basic.show_string("HELLO", 90)
    if playing:
        basic.show_icon(IconNames.SURPRISED)
    basic.pause(350)
    if playing:
        basic.show_icon(IconNames.HAPPY)
    basic.pause(350)
    cuteBot.closeheadlights()
    basic.clear_screen()
    playing = False
input.on_gesture(Gesture.SHAKE, on_gesture_shake)

def on_button_pressed_b():
    global running, playing
    running = False
    playing = False
    cuteBot.stopcar()
    cuteBot.closeheadlights()
    music.stop_all_sounds()
    basic.clear_screen()
small_heart = False
move_style = 0
running = False
next_sound = 0
next_heart = 0
next_move = 0
turn_until = 0
playing = False
turn_direction = 1
# Increase this if your robot turns too close to walls.
obstacle_distance = 25
input.on_button_pressed(Button.B, on_button_pressed_b)
cuteBot.stopcar()
cuteBot.closeheadlights()
music.set_volume(120)
basic.show_icon(IconNames.HAPPY)

def on_forever():
    global turn_direction, turn_until, next_move, move_style, small_heart, next_heart, next_sound
    # Also check B while it is held down.
    if input.button_is_pressed(Button.B):
        on_button_pressed_b()
    if running:
        now = input.running_time()
        if now < turn_until:
            # Short turn on the spot to face away from an obstacle.
            if turn_direction == 1:
                cuteBot.motors(30, -30)
            else:
                cuteBot.motors(-30, 30)
        else:
            distance = cuteBot.ultrasonic(cuteBot.SonarUnit.CENTIMETERS)
            # Recheck in case B or shake occurred during the reading.
            if running:
                if distance <= obstacle_distance:
                    # Zero means no usable echo: turn cautiously.
                    cuteBot.stopcar()
                    turn_direction = randint(0, 1)
                    turn_until = input.running_time() + randint(350, 650)
                    next_move = 0
                    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 100, 0, 0)
                else:
                    if now >= next_move:
                        move_style = randint(0, 2)
                        next_move = now + randint(2500, 4500)
                    if move_style == 0:
                        # Explore forwards.
                        cuteBot.motors(35, 35)
                    elif move_style == 1:
                        # Circle left.
                        cuteBot.motors(18, 40)
                    else:
                        # Circle right.
                        cuteBot.motors(40, 18)
                    cuteBot.singleheadlights(cuteBot.RGBLights.ALL, 0, 70, 100)
        if running and now >= next_heart:
            small_heart = not (small_heart)
            if small_heart:
                basic.show_icon(IconNames.SMALL_HEART, 0)
            else:
                basic.show_icon(IconNames.HEART, 0)
            next_heart = now + 300
        if running and now >= next_sound:
            # A mixture of high squeaks and lower bleeps.
            music.play_tone(randint(700, 2200), 70)
            next_sound = input.running_time() + randint(700, 1800)
    basic.pause(50)
basic.forever(on_forever)
