//=========================================================================
// BUILD ROAD GEOMETRY
//=========================================================================

var Road = {
    segments:[],

    render: function(baseSegment,basePercent){
      
      var x  = 0;
      var maxy = height;
      var dx = - (baseSegment.curve * basePercent);
      var n, segment ;
      for(n = 0 ; n < drawDistance ; n++) {

        segment        = this.segments[(baseSegment.index + n) % this.segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
        segment.clip   = maxy;

        Util.project(segment.p1, (Player.x * roadWidth) - x,      Player.y + cameraHeight, Camera.position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (Player.x * roadWidth) - x - dx, Player.y + cameraHeight, Camera.position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        x  = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= cameraDepth)         || // behind us
            (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
            (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
          continue;

        Render.segment(ctx, width, lanes,
                      segment.p1.screen.x,
                      segment.p1.screen.y,
                      segment.p1.screen.w,
                      segment.p2.screen.x,
                      segment.p2.screen.y,
                      segment.p2.screen.w,
                      segment.fog,
                      segment.color);

        maxy = segment.p1.screen.y;
      }
    },

    addSegment: function(curve, y) {
      var n = this.segments.length;
      this.segments.push({
          index: n,
            p1: { world: { y: this.lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
            p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
          curve: curve,
          sprites: [],
          cars: [],
          color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
      });
    },
    addRoad: function(enter, hold, leave, curve, y) {
      var startY   = this.lastY();
      var endY     = startY + (Util.toInt(y, 0) * segmentLength);
      var n, total = enter + hold + leave;
      for(n = 0 ; n < enter ; n++)
        this.addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
      for(n = 0 ; n < hold  ; n++)
        this.addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
      for(n = 0 ; n < leave ; n++)
        this.addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
    },

    addStraight: function(num) {
      num = num || ROAD.LENGTH.MEDIUM;
      this.addRoad(num, num, num, 0, 0);
    },

    addHill: function(num, height) {
      num    = num    || ROAD.LENGTH.MEDIUM;
      height = height || ROAD.HILL.MEDIUM;
      this.addRoad(num, num, num, 0, height);
    },

    addCurve: function(num, curve, height) {
      num    = num    || ROAD.LENGTH.MEDIUM;
      curve  = curve  || ROAD.CURVE.MEDIUM;
      height = height || ROAD.HILL.NONE;
      this.addRoad(num, num, num, curve, height);
    },
        
    addLowRollingHills: function(num, height) {
      num    = num    || ROAD.LENGTH.SHORT;
      height = height || ROAD.HILL.LOW;
      this.addRoad(num, num, num,  0,                height/2);
      this.addRoad(num, num, num,  0,               -height);
      this.addRoad(num, num, num,  ROAD.CURVE.EASY,  height);
      this.addRoad(num, num, num,  0,                0);
      this.addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2);
      this.addRoad(num, num, num,  0,                0);
    },

    addSCurves: function() {
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
      this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
    },

    addBumps: function() {
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -2);
      this.addRoad(10, 10, 10, 0, -5);
      this.addRoad(10, 10, 10, 0,  8);
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -7);
      this.addRoad(10, 10, 10, 0,  5);
      this.addRoad(10, 10, 10, 0, -2);
    },

    addDownhillToEnd: function(num) {
      num = num || 200;
      this.addRoad(num, num, num, -ROAD.CURVE.EASY, -this.lastY()/segmentLength);
    },

    resetRoad: function() {
      this.segments = [];

      this.addStraight(ROAD.LENGTH.SHORT);
      this.addLowRollingHills();
      this.addSCurves();
      this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
      this.addBumps();
      this.addLowRollingHills();
      this.addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
      this.addStraight();
      this.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
      this.addSCurves();
      this.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
      this.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
      this.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
      this.addBumps();
      this.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
      this.addStraight();
      this.addSCurves();
      this.addDownhillToEnd();

      Sprites.reset();
      Cars.reset();

      this.segments[this.findSegment(Player.z).index + 2].color = COLORS.START;
      this.segments[this.findSegment(Player.z).index + 3].color = COLORS.START;
      for(var n = 0 ; n < rumbleLength ; n++)
        this.segments[this.segments.length-1-n].color = COLORS.FINISH;

      trackLength = this.segments.length * segmentLength;
    },
    findSegment: function(z) {
      return this.segments[Math.floor(z/segmentLength) % Road.segments.length]; 
    },
    lastY: function() { return (Road.segments.length == 0) ? 0 : Road.segments[Road.segments.length-1].p2.world.y; }
}