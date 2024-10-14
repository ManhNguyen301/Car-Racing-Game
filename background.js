var Background = {
    background:null ,
    skySpeed: 0.001 ,
    hillSpeed: 0.002,
    treeSpeed: 0.003,

    skyOffset: 0,
    hillOffset: 0,
    treeOffset: 0,

    update: function(playerSegment, position, startPosition) {
      this.skyOffset  = Util.increase(this.skyOffset,  this.skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
      this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
      this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
    },

    render: function(playerY){
      Render.background(ctx, this.background, width, height, BACKGROUND.SKY,   this.skyOffset,  resolution * this.skySpeed  * playerY);
      Render.background(ctx, this.background, width, height, BACKGROUND.HILLS, this.hillOffset, resolution * this.hillSpeed * playerY);
      Render.background(ctx, this.background, width, height, BACKGROUND.TREES, this.treeOffset, resolution * this.treeSpeed * playerY);

    }

  }