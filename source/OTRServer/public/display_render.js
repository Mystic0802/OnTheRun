// ====================================================================================
// INIT
// ====================================================================================
// Canvas Initialization
let cnv = document.getElementById("canvas-parent");
// This is old style initialization apparently.
// The newest build literally doesn't use the initialization given in their documents.
// This took 10 minutes :|
const app = new PIXI.Application({
  width: cnv.offsetWidth,
  height: cnv.offsetHeight,
});
cnv.appendChild(app.view);
window.addEventListener("resize", () => {
  app.renderer.resize(cnv.offsetWidth, cnv.offsetHeight);
});

// ====================================================================================
// RENDERER
// ====================================================================================
class Renderer {
  constructor(__app) {
    this.app = __app;
    this.elements = [];

    // this.app.ticker.add(this.update)
  }

  add_element(__element) {
    try {
        let sprite = __element.sprite
        if (sprite == null) {
            throw new Error("No Sprite found on element.")
        }
        this.elements.push(__element)
        this.app.stage.addChild(sprite)
    }
    catch (e) { 
        console.log(e)
    }

  }

  remove_element(__element) {
    console.log("REMOVE ELEMENT")

  }

  render_elements(__frame_timestamp) {
    console.log("RENDER ELEMENTS");
  }

  update_animations(__frame_timestamp) {
    console.log("UPDATE ANIMATIONS");
  }

  update(__ticker) {
    let frame_timestamp = Date.now();
    // console.log(`Ticker: ${__ticker}, Time: ${frame_timestamp}`);
    // this.update_animations(frame_timestamp);
    // this.render_elements(frame_timestamp)
  }
}

// ====================================================================================
// ELEMENTS
// ====================================================================================

// Render Order:
// Background, Texture Sprite, Inner, Stroke


await PIXI.Assets.load("../BlockBackground.png");
// let block_background = PIXI.Sprite.from("../BlockBackground.png");

await PIXI.Assets.load("../BlockBorder.png");

await PIXI.Assets.load("../PlayerNameTexture.png");
let player_name_texture = PIXI.Sprite.from("../PlayerNameTexture.png");

class Block {
  constructor(__init_coords, __size, __texture_sprite, __inner) {
    /***
     * @param __init_coords: (x, y) (tuple). Initial coordinates of the block, top-left positioned.
     * @param __size: (x, y) (tuple). Size of the block.
     * @param __texture_sprite: Texture to use inside of the block's borders/stroke.
     * @param __inner: Inner elements.
     */
    this.background = PIXI.Sprite.from("../BlockBackground.png");
    this.texture_sprite = __texture_sprite;
    this.border = PIXI.Sprite.from("../BlockBorder.png");
    this.inner = __inner;
    this.x = __init_coords[0]
    this.y = __init_coords[1]
    this.w = __size[0]
    this.h = __size[1]
    // Define Render Order for Block
    let block = new PIXI.Container() 
    block.addChild(this.background)
    block.addChild(this.texture_sprite)
    // block.addChild(this.inner)
    block.addChild(this.border)

    this.sprite = block
  }

  set sprite(__sprite) {
    this.container = __sprite

  }

  get sprite() {
    console.log(this.container)
    return this.container
  }
}


// ====================================================================================
// RUNTIME INIT
// ====================================================================================

let renderer = new Renderer(app);
app.ticker.add((ticker) => {
  // Add update function to Pixi ticker.
  renderer.update(ticker);
});

// ====================================================================================
// STATIC ELEMENTS INITIALIZATION
// ====================================================================================


let player_one = new Block(
    (cnv.offsetWidth / 2, cnv.offsetHeight / 2),
    (185, 73),
    player_name_texture,
    null
)

renderer.add_element(player_one)


