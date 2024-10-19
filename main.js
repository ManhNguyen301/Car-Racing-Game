
var fps            = 60;                      // how many 'update' frames per second
var step           = 1/fps;                   // how long is each frame (in seconds)
var width          = 1024;                    // logical canvas width
var height         = 768;                     // logical canvas height
var centrifugal    = 0.3;                     // centrifugal force multiplier when going around curves

var stats          = Game.stats('fps');       // mr.doobs FPS counter
var canvas         = Dom.get('canvas');       // our canvas...
var ctx            = canvas.getContext('2d'); // ...and its drawing context

var resolution     = null;                    // scaling factor to provide resolution independence (computed)
var roadWidth      = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
var segmentLength  = 200;                     // length of a single segment
var rumbleLength   = 3;                       // number of Road.segments per red/white rumble strip
var trackLength    = null;                    // z length of entire track (computed)
var lanes          = 3;                       // number of lanes
var fieldOfView    = 100;                     // angle (degrees) for field of view
var cameraHeight   = 1000;                    // z height of camera
var cameraDepth    = null;                    // z distance camera is from screen (computed)
var drawDistance   = 300;                     // number of Road.segments to draw

var fogDensity     = 5;                       // exponential fog density

var maxSpeed       = segmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)

var currentLapTime = 0;                       // current lap time
var lastLapTime    = null;                    // last lap time


var displaySetting = false;                   // 
var displayInstruction = false;
var finish = false;
var limitedTime = 180;

var keyLeft        = false;
var keyRight       = false;
var keyFaster      = false;
var keySlower      = false;

var hud = {
    speed:            { value: null, dom: Dom.get('speed_value')            },
    current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
    last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value')    },
    fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value')    }
}

//=========================================================================
// UPDATE THE GAME WORLD
//=========================================================================

function update(dt) {

    var playerSegment = Road.findSegment(Camera.position+Player.z);
    var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
    var speedPercent  = Player.speed/maxSpeed;
    var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
    var startPosition = Camera.position;
    
    // update Cars 
    Cars.update(dt, playerSegment, playerW);

    // update camera world z
    Camera.position = Util.increase(Camera.position, dt * Player.speed, trackLength);
    
    // update player's car coordinate when move by arrow key
    Player.update(dt, dx, playerSegment, playerW, speedPercent);

    //update background 
    Background.update(playerSegment, Camera.position, startPosition);
    
    Minimap.update();
    // update HUD
    if (Camera.position > Player.z && !finish) {
        
        if (currentLapTime && (startPosition < Player.z)) {
            lastLapTime    = currentLapTime;
            currentLapTime = 0;
            if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
                Dom.storage.fast_lap_time = lastLapTime;
                updateHud('fast_lap_time', formatTime(lastLapTime));
                Dom.addClassName('fast_lap_time', 'fastest');
                Dom.addClassName('last_lap_time', 'fastest');
            }
            else {
                Dom.removeClassName('fast_lap_time', 'fastest');
                Dom.removeClassName('last_lap_time', 'fastest');
            }
            updateHud('last_lap_time', formatTime(lastLapTime));
            Dom.show('last_lap_time');

            Game.handleWin();
        }
        else {
            currentLapTime += dt;
        }
        if (currentLapTime > limitedTime){
            Game.handleLose();
        }
    }

    updateHud('speed',            5 * Math.round(Player.speed/500));
    updateHud('current_lap_time', formatTime(limitedTime - currentLapTime));
}


function updateHud(key, value) { // accessing DOM can be slow, so only do it if value has changed
    if (hud[key].value !== value) {
        hud[key].value = value;
        Dom.set(hud[key].dom, value);
    }
}

function formatTime(dt) {
    var minutes = Math.floor(dt/60);
    var seconds = Math.floor(dt - (minutes * 60));
    var tenths  = Math.floor(10 * (dt - Math.floor(dt)));
    if (minutes > 0)
        return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
    else
        return seconds + "." + tenths;
}

//=========================================================================
// RENDER THE GAME WORLD
//=========================================================================

function render() {

    var baseSegment   = Road.findSegment(Camera.position);
    var basePercent   = Util.percentRemaining(Camera.position, segmentLength);
    var playerSegment = Road.findSegment(Camera.position+Player.z);
    var playerPercent = Util.percentRemaining(Camera.position+Player.z, segmentLength);
    Player.y       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
    
    ctx.clearRect(0, 0, width, height);  // clear everything on screen

    // render background
    Background.render();

    var n, segment;

    // render Road
    Road.render(baseSegment,basePercent);

    for(n = (drawDistance-1) ; n > 0 ; n--) {
        segment = Road.segments[(baseSegment.index + n) % Road.segments.length];
        //render Cars
        Cars.render(segment);
        //render sprites (tree, billboard,...)
        Sprites.render(segment);
        //render main Car
        Player.render(segment, playerSegment, playerPercent);
    }
    Minimap.render(playerSegment, playerPercent);
}



//=========================================================================
// THE GAME LOOP
//=========================================================================

Game.run({
    canvas: canvas, render: render, update: update, stats: stats, step: step,
    images: ["background", "sprites"],
    keys: [
        { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
        { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
        { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
        { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } }
    ],
    ready: function(images) {
        Background.background = images[0];
        Sprites.sprites    = images[1];
        reset();
        Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || 180;
        updateHud('fast_lap_time', formatTime(Util.toFloat(Dom.storage.fast_lap_time)));
    }
});

function reset(options) {
    options       = options || {};
    canvas.width  = width  = Util.toInt(options.width,          width);
    canvas.height = height = Util.toInt(options.height,         height);
    lanes                  = Util.toInt(options.lanes,          lanes);
    roadWidth              = Util.toInt(options.roadWidth,      roadWidth);
    cameraHeight           = Util.toInt(options.cameraHeight,   cameraHeight);
    drawDistance           = Util.toInt(options.drawDistance,   drawDistance);
    fogDensity             = Util.toInt(options.fogDensity,     fogDensity);
    fieldOfView            = Util.toInt(options.fieldOfView,    fieldOfView);
    segmentLength          = Util.toInt(options.segmentLength,  segmentLength);
    rumbleLength           = Util.toInt(options.rumbleLength,   rumbleLength);
    cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
    Player.z                = (cameraHeight * cameraDepth);
    resolution             = height/480;
    refreshTweakUI();

    if ((Road.segments.length==0) || (options.segmentLength) || (options.rumbleLength))
        Road.resetRoad(); // only rebuild road when necessary
}

//=========================================================================
// TWEAK UI HANDLERS
//=========================================================================
Dom.on('restart','click',function(){location.reload();});

Dom.on('fullscreen','click', function(){
    var racer = Dom.get("racer");
    if (racer.requestFullscreen) {
        racer.requestFullscreen();
    } else if (racer.mozRequestFullScreen) { // Firefox
        racer.mozRequestFullScreen();
    } else if (racer.webkitRequestFullscreen) { // Chrome, Safari and Opera
        racer.webkitRequestFullscreen();
    } else if (racer.msRequestFullscreen) { // IE/Edge
        racer.msRequestFullscreen();
    }
}); 

Dom.on('setting','click', function(){
    displaySetting = !displaySetting;
    
    if (displaySetting){
        Dom.get("controls").style.visibility = 'visible';
    }
    else{
        Dom.get("controls").style.visibility = 'hidden';
    }
})

Dom.on('guide','click', function(){
    displayInstruction = !displayInstruction;
    if (displayInstruction){
        Dom.get("instructions").style.visibility = 'visible';
    }
    else{
        Dom.get("instructions").style.visibility = 'hidden';
    }
})

Dom.on('resolution', 'change', function(ev) {
    var w, h, ratio;
    switch(ev.target.options[ev.target.selectedIndex].value) {
        case 'fine':   w = 1280; h = 960;  ratio=w/width; break;
        case 'high':   w = 1024; h = 768;  ratio=w/width; break;
        case 'medium': w = 640;  h = 480;  ratio=w/width; break;
        case 'low':    w = 480;  h = 360;  ratio=w/width; break;
    }
    reset({ width: w, height: h })
    Dom.blur(ev);
});

Dom.on('lanes',          'change', function(ev) { Dom.blur(ev); reset({ lanes:         ev.target.options[ev.target.selectedIndex].value }); });
Dom.on('roadWidth',      'change', function(ev) { Dom.blur(ev); reset({ roadWidth:     Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
Dom.on('cameraHeight',   'change', function(ev) { Dom.blur(ev); reset({ cameraHeight:  Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
Dom.on('drawDistance',   'change', function(ev) { Dom.blur(ev); reset({ drawDistance:  Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
Dom.on('fieldOfView',    'change', function(ev) { Dom.blur(ev); reset({ fieldOfView:   Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
Dom.on('fogDensity',     'change', function(ev) { Dom.blur(ev); reset({ fogDensity:    Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });

function refreshTweakUI() {
    Dom.get('lanes').selectedIndex = lanes-1;
    Dom.get('currentRoadWidth').innerHTML      = Dom.get('roadWidth').value      = roadWidth;
    Dom.get('currentCameraHeight').innerHTML   = Dom.get('cameraHeight').value   = cameraHeight;
    Dom.get('currentDrawDistance').innerHTML   = Dom.get('drawDistance').value   = drawDistance;
    Dom.get('currentFieldOfView').innerHTML    = Dom.get('fieldOfView').value    = fieldOfView;
    Dom.get('currentFogDensity').innerHTML     = Dom.get('fogDensity').value     = fogDensity;
}

//=========================================================================
