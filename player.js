var Player = {
    x: 0,
    y: null,
    z: null,

    speed: 0,                   // current speed
    accel: maxSpeed/5,         // acceleration rate - tuned until it 'felt' right
    decel: -maxSpeed/5,        // deceleration rate when braking
    offRoadDecel: -maxSpeed/2, // off road deceleration is somewhere in between
    offRoadLimit: maxSpeed/4,  // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    breaking: -maxSpeed,

    render: function(segment, playerSegment, playerPercent){
      
        if (segment == playerSegment) {
            Render.player(ctx, width, height, resolution, roadWidth, Sprites.sprites, this.speed/maxSpeed,
                        cameraDepth/this.z,
                        width/2,
                        (height/2) - (cameraDepth/this.z * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                        this.speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
    },

    update: function(dt,dx,playerSegment, playerW,speedPercent) {
        var sprite, spriteW;
        if (keyLeft)
            this.x = this.x - dx;
        else if (keyRight)
            this.x = this.x + dx;

        this.x = this.x - (dx * speedPercent * playerSegment.curve * centrifugal);

        if (keyFaster)
            this.speed = Util.accelerate(this.speed, this.accel, dt);
        else if (keySlower)
            this.speed = Util.accelerate(this.speed, this.breaking, dt);
        else
            this.speed = Util.accelerate(this.speed, this.decel, dt);


        if ((this.x < -1) || (this.x > 1)) {

            if (this.speed > this.offRoadLimit)
            this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt);

            for(n = 0 ; n < playerSegment.sprites.length ; n++) {
                sprite  = playerSegment.sprites[n];
                spriteW = sprite.source.w * SPRITES.SCALE;
                if (Util.overlap(this.x, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
                    this.speed = maxSpeed/5;
                    Camera.position = Util.increase(playerSegment.p1.world.z, -this.z, trackLength); // stop in front of sprite (at front of segment)
                    break;
                }
            }
        }
        for(n = 0 ; n < playerSegment.cars.length ; n++) {
            car  = playerSegment.cars[n];
            carW = car.sprite.w * SPRITES.SCALE;
            if (this.speed > car.speed) {
                if (Util.overlap(this.x, playerW, car.offset, carW, 0.8)) {
                    this.speed    = car.speed * (car.speed/this.speed);
                    Camera.position = Util.increase(car.z, -this.z, trackLength);
                    break;
                }
            }
        }
        this.x = Util.limit(this.x, -3, 3);     // dont ever let it go too far out of bounds
        this.speed   = Util.limit(this.speed, 0, maxSpeed); // or exceed maxSpeed
    }

}

