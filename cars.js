var Cars = {

    cars: [], 
    totalCars: 20,   // total number of cars on the road

    render: function(segment){
        var i, car, sprite, spriteScale, spriteX, spriteY;
      for(i = 0 ; i < segment.cars.length ; i++) {
        car         = segment.cars[i];
        sprite      = car.sprite;
        spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
        spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
        spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
        Render.sprite(ctx, width, height, resolution, roadWidth, Sprites.sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
      }
    },

    update: function(dt, playerSegment, playerW) {
      var n, car, oldSegment, newSegment;
      for(n = 0 ; n < this.cars.length ; n++) {
        car         = this.cars[n];
        oldSegment  = Road.findSegment(car.z);
        car.offset  = car.offset + this.updateOffset(car, oldSegment, playerSegment, playerW);
        car.z       = Util.increase(car.z, dt * car.speed, trackLength);
        car.percent = Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
        newSegment  = Road.findSegment(car.z);
        if (oldSegment != newSegment) {
          index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    },
    
    updateOffset: function(car, carSegment, playerSegment, playerW) {
      var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

    // optimization, dont bother steering around other cars when 'out of sight' of the player
    if ((carSegment.index - playerSegment.index) > drawDistance)
      return 0;

    for(i = 1 ; i < lookahead ; i++) {
      segment = Road.segments[(carSegment.index+i)%Road.segments.length]; 

      if ((segment === playerSegment) && (car.speed > Player.speed) && (Util.overlap(Player.x, playerW, car.offset, carW, 1.2))) {
        if (Player.x > 0.5)
          dir = -1;
        else if (Player.x < -0.5)
          dir = 1;
        else
          dir = (car.offset > Player.x) ? 1 : -1;
        return dir * 1/i * (car.speed-Player.speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
      }

      for(j = 0 ; j < segment.cars.length ; j++) {
        otherCar  = segment.cars[j];
        otherCarW = otherCar.sprite.w * SPRITES.SCALE;
        if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
          if (otherCar.offset > 0.5)
            dir = -1;
          else if (otherCar.offset < -0.5)
            dir = 1;
          else
            dir = (car.offset > otherCar.offset) ? 1 : -1;
          return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
        }
      }
    }

    // if no cars ahead, but I have somehow ended up off road, then steer back on
    if (car.offset < -0.9)
      return 0.1;
    else if (car.offset > 0.9)
      return -0.1;
    else
      return 0;
    },

    reset: function() {
      this.cars = [];
      var n, car, segment, offset, z, sprite, speed;
      for (var n = 0 ; n < this.totalCars ; n++) {
        offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
        z      = Math.floor(Math.random() * Road.segments.length) * segmentLength;
        sprite = Util.randomChoice(SPRITES.CARS);
        speed  = maxSpeed/4 + Math.random() * maxSpeed/(sprite == SPRITES.SEMI ? 4 : 2);
        car = { offset: offset, z: z, sprite: sprite, speed: speed };
        segment = Road.findSegment(car.z);
        segment.cars.push(car);
        this.cars.push(car);
      }
    }

  }