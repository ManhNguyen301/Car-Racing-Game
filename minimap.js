var Minimap = {
    x : width  * 0.8,
    y : height* 0.1,
    height : 200,
    width : 150,
    front: [],
    back: [],
    currentX: 0,
    vision: 200,
    scale: 0 ,

    render: function(playerSegment, playerPercent){
        var a =0;
        
        var dx = (playerSegment.curve*playerPercent);
        var x = 0;
        var n , segment;
        var playerCurrentX = (Player.x * roadWidth)
        //this.front[0] = dx;
        

        for (n=0; n<this.vision ; n++){
            segment  = Road.segments[(playerSegment.index + Road.segments.length + n) % Road.segments.length]; 
            this.front[n] = (x - playerCurrentX )/700;
            dx = dx + segment.curve;
            x = x + dx;
            
        }
        dx = (playerSegment.curve*playerPercent);
        x = 0;
        for (n=0; n<this.vision ; n++){
            segment  = Road.segments[(playerSegment.index + Road.segments.length - n) % Road.segments.length]; 
            this.back[n] =  (x - playerCurrentX )/700;
            dx = dx + segment.curve;
            x = x + dx;
            
        }

        Render.minimap(ctx, this.x, this.y, this.width, this.height, this.front, this.back, this.currentX); 
        
    },
}