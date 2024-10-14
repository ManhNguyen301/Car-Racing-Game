Sprites = {
    sprites : null,

    render: function(segment){
      var i,sprite, spriteScale, spriteX, spriteY;
      for(i = 0 ; i < segment.sprites.length ; i++) {
        sprite      = segment.sprites[i];
        spriteScale = segment.p1.screen.scale;
        spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
        spriteY     = segment.p1.screen.y;
        Render.sprite(ctx, width, height, resolution, roadWidth, this.sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
      }
    },

    addSprite: function(n, sprite, offset) {
      Road.segments[n].sprites.push({ source: sprite, offset: offset });
    },

    reset: function() {
      var n, i;

      this.addSprite(20,  SPRITES.BILLBOARD07, -1);
      this.addSprite(40,  SPRITES.BILLBOARD06, -1);
      this.addSprite(60,  SPRITES.BILLBOARD08, -1);
      this.addSprite(80,  SPRITES.BILLBOARD09, -1);
      this.addSprite(100, SPRITES.BILLBOARD01, -1);
      this.addSprite(120, SPRITES.BILLBOARD02, -1);
      this.addSprite(140, SPRITES.BILLBOARD03, -1);
      this.addSprite(160, SPRITES.BILLBOARD04, -1);
      this.addSprite(180, SPRITES.BILLBOARD05, -1);

      this.addSprite(240,                  SPRITES.BILLBOARD07, -1.2);
      this.addSprite(240,                  SPRITES.BILLBOARD06,  1.2);
      this.addSprite(Road.segments.length - 25, SPRITES.BILLBOARD07, -1.2);
      this.addSprite(Road.segments.length - 25, SPRITES.BILLBOARD06,  1.2);

      for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
        this.addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
        this.addSprite(n, SPRITES.PALM_TREE,   1 + Math.random()*2);
      }

      for(n = 250 ; n < 1000 ; n += 5) {
        this.addSprite(n,     SPRITES.COLUMN, 1.1);
        this.addSprite(n + Util.randomInt(0,5), SPRITES.TREE1, -1 - (Math.random() * 2));
        this.addSprite(n + Util.randomInt(0,5), SPRITES.TREE2, -1 - (Math.random() * 2));
      }

      for(n = 200 ; n < Road.segments.length ; n += 3) {
        this.addSprite(n, Util.randomChoice(SPRITES.PLANTS), Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
      }

      var side, sprite, offset;
      for(n = 1000 ; n < (Road.segments.length-50) ; n += 100) {
        side      = Util.randomChoice([1, -1]);
        this.addSprite(n + Util.randomInt(0, 50), Util.randomChoice(SPRITES.BILLBOARDS), -side);
        for(i = 0 ; i < 20 ; i++) {
          sprite = Util.randomChoice(SPRITES.PLANTS);
          offset = side * (1.5 + Math.random());
          this.addSprite(n + Util.randomInt(0, 50), sprite, offset);
        } 
      }
    }
  }