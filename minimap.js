var Minimap = {
    x : width *0.8,
    y : height *0.1,
    height : height/4,
    width : width/8,
    front: [],
    back: [],
    currentX: 0,
    vision: 400,
    scale: 750 ,
    widthLine: width/68,
    radius: width/205,


    update: function(){
        this.x = width * 0.8;
        this.y = height * 0.1;
        this.height = height/4;
        this.width = width/7;
        this.widthLine = width/68;
        this.radius = width/205;
    },
    render: function(playerSegment, playerPercent){
        var dx = (playerSegment.curve*playerPercent);
        var x = 0;
        var n , segment;
        var playerCurrentX = (Player.x * roadWidth)

        for (n=0; n<this.vision ; n++){
            segment  = Road.segments[(playerSegment.index + Road.segments.length + n) % Road.segments.length]; 
            this.front[n] = (x - playerCurrentX )/this.scale;
            dx = dx + segment.curve;
            x = x + dx;  
        }
        dx = (playerSegment.curve*playerPercent);
        x = 0;
        for (n=0; n<this.vision ; n++){
            segment  = Road.segments[(playerSegment.index + Road.segments.length - n) % Road.segments.length]; 
            this.back[n] =  (x - playerCurrentX )/this.scale;
            dx = dx + segment.curve;
            x = x + dx; 
        }

        Render.minimap(ctx, this.x, this.y, this.width, this.height, this.front, this.back, this.currentX,this.radius,this.widthLine); 
        
    },
}