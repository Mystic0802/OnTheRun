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
  resizeTo: window,
});
cnv.appendChild(app.view);

await PIXI.Assets.load("../fonts/RobotoMono-Bold.ttf");
await PIXI.Assets.load("../images/BlockBackground.png");
await PIXI.Assets.load("../images/BlockBorder.png");
await PIXI.Assets.load("../images/PlayerNameTexture.png");
await PIXI.Assets.load("../images/MoneyBackground.png");
await PIXI.Assets.load("../images/MoneyBorder.png");
await PIXI.Assets.load("../images/MoneyTexture.png");

// ====================================================================================
// DECORATION CONSTANTS
// ====================================================================================

// Default/Standard text style for the main display.
const DEFAULT_TEXT_STYLE = new PIXI.TextStyle({
  fontFamily: "Roboto Mono",
  fill: "#FFFFFF",
  // fontSize: 48
  // Results in something that is about 48 for most sizes.
  fontSize: cnv.offsetWidth * 0.022,
});

// Alternate, larger, text style.
const BIG_TEXT_STYLE = new PIXI.TextStyle({
  fontFamily: "Roboto Mono",
  fill: "#FFFFFF",
  fontSize: cnv.offsetWidth * 0.022,
});

let layout_columns = 16;
let layout_rows = 12;
let column_value = cnv.offsetWidth / layout_columns;
let row_value = cnv.offsetHeight / layout_rows;

// ====================================================================================
// RENDERER
// ====================================================================================
/**
 * Canvas wrapper and rendering controller.
 * 
 * Singleton instance wrapper which interacts with the display's canvas.
 */
class Renderer {
  /**
   * @param {*} __app: PIXI.js application instance. This is the display's canvas.
   */
  constructor(__app) {
    this.app = __app;
    this.elements = new Map();

    // this.app.ticker.add(this.update)
  }

  /**
   * __! Each element should be added via array-tuples in the following manner: [key, element].
   * Further usage is such: [[key, element], [key, element], ...] !__
   * 
   * __! This does not cause the added elements to be rendered. The associated 'render_elements'
   * method exists for this purpose. !__
   * 
   * Method to append one or many elements to the Renderer's elements list.
   *
   * @param {*} __elements: List of elements for appendage. See above notes for formatting.
   */
  add_elements(__elements) {
    let elements = __elements;
    if (!Array.isArray(elements)) elements = [elements];
    elements.forEach((element) => {
      try {
        let sprite = element[1].sprite;
        if (sprite == null) {
          throw new Error("No Sprite found on element.");
        }
        console.log("Adding: ", element[0]);
        this.elements.set(element[0], element[1]);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * Empties the Renderer's element list.
   */
  clear_elements() {
    this.elements = new Map();
  }

  /**
   * Return's an element from the Renderer's element list if its given key exists.
   * @param {*} __key: Key of the element to search.
   * @returns An element. An error is thrown otherwise.
   */
  get_element(__key) {
    try {
      return this.elements.get(__key);
    } catch (e) {
      console.error(`Could not get element with key: ${__key}`);
      console.error(e);
    }
  }

  /**
   * Render all of the elements in the Renderer's element list.
   * @param {*} __frame_timestamp: Timestamp to use for animations.
   */
  render_elements(__frame_timestamp) {
    this.elements.forEach((element, i) => {
      console.log("Rendering: ", i);
      this.app.stage.addChild(element.sprite);
    });
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

  // ====================================================================================
  // RENDERING MACROS
  // ====================================================================================
  MACRO_JOIN_INIT() {
    let description = new Block(
      [column_value * 1, row_value * 5],
      [column_value * 14, row_value * 2],
      new PIXI.Text("Waiting for Players!", BIG_TEXT_STYLE),
      PIXI.Sprite.from("../images/DescriptionTexture.png"),
      PIXI.Sprite.from("../images/DescriptionBorder.png"),
      PIXI.Sprite.from("../images/DescriptionBackground.png")
    );

    this.add_elements([["description", description]]);
  }

  MACRO_GAME_START_INIT() {
    let player_one_block = new Block(
      [column_value * 1, row_value * 10],
      [column_value * 2.5, row_value * 1.5],
      null,
      PIXI.Sprite.from("../images/PlayerNameTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    let player_two_block = new Block(
      [column_value * 3.5, row_value * 10],
      [column_value * 2.5, row_value * 1.5],
      null,
      PIXI.Sprite.from("../images/PlayerNameTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    let player_three_block = new Block(
      [column_value * 10, row_value * 10],
      [column_value * 2.5, row_value * 1.5],
      null,
      PIXI.Sprite.from("../images/PlayerNameTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    let player_four_block = new Block(
      [column_value * 12.5, row_value * 10],
      [column_value * 2.5, row_value * 1.5],
      null,
      PIXI.Sprite.from("../images/PlayerNameTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    let player_chaser_block = new Block(
      [column_value * 1, row_value * 1],
      [column_value * 2.5, row_value * 1.5],
      null,
      PIXI.Sprite.from("../images/ChaserTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    let money_value = new Block(
      [column_value * 6, row_value * 9.75],
      [column_value * 4, row_value * 2],
      null,
      PIXI.Sprite.from("../images/MoneyTexture.png"),
      PIXI.Sprite.from("../images/MoneyBorder.png"),
      PIXI.Sprite.from("../images/MoneyBackground.png")
    );

    let timer = new Block(
      [column_value * 11, row_value * 1],
      [column_value * 4, row_value * 2],
      null,
      PIXI.Sprite.from("../images/TimerTexture.png"),
      PIXI.Sprite.from("../images/BlockBorder.png"),
      PIXI.Sprite.from("../images/BlockBackground.png")
    );

    this.add_elements([
      ["player_one_block", player_one_block],
      ["player_two_block", player_two_block],
      ["player_three_block", player_three_block],
      ["player_four_block", player_four_block],
      ["player_chaser_block", player_chaser_block],
      ["money_value", money_value],
      ["timer", timer],
    ]);
  }

  MACRO_SET_INIT_GAME_VALUES(
    __player_names,
    __chaser_name,
    __money_value = "£0"
  ) {
    this.elements
      .get("player_one_block")
      .set_new_inner(new PIXI.Text(__player_names[0], DEFAULT_TEXT_STYLE));
    this.elements
      .get("player_two_block")
      .set_new_inner(new PIXI.Text(__player_names[1], DEFAULT_TEXT_STYLE));
    this.elements
      .get("player_three_block")
      .set_new_inner(new PIXI.Text(__player_names[2], DEFAULT_TEXT_STYLE));
    this.elements
      .get("player_four_block")
      .set_new_inner(new PIXI.Text(__player_names[3], DEFAULT_TEXT_STYLE));
    this.elements
      .get("player_chaser_block")
      .set_new_inner(new PIXI.Text(__chaser_name, DEFAULT_TEXT_STYLE));
    this.elements
      .get("money_value")
      .set_new_inner(new PIXI.Text(__money_value, DEFAULT_TEXT_STYLE));
  }
}

// ====================================================================================
// GENERIC ELEMENTS
// ====================================================================================

/**
 * Helper Class for creating homogenous block-like elements for quick rendering.
 */
class Block {
  constructor(
    __init_coords,
    __size,
    __inner,
    __texture_sprite,
    __block_border,
    __background
  ) {
    /***
     * @param __init_coords: (x, y) (array tuple). Initial coordinates of the block, top-left positioned.
     * @param __size: (x, y) (array tuple). Size of the block.
     * @param __texture_sprite: Texture to use inside of the block's borders/stroke.
     * @param __inner: Inner elements.
     * @param __block_border: Texture to use for the block's border. This will normally be a coloured squircle or rectangle.
     * @param __background: Texture to use for the block's background. This will normally be a metallic squircle or rectangle.
     */
    // Set all the variables in case we need them later.
    this.background = __background;
    this.border = __block_border;
    this.texture_sprite = __texture_sprite;
    this.inner = __inner;
    this.x = __init_coords[0];
    this.y = __init_coords[1];
    this.w = __size[0];
    this.h = __size[1];

    // Sizes and Decorative Positioning
    this.background.height = this.h;
    this.background.width = this.w;
    this.border.height = this.h - 8;
    this.border.width = this.w - 8;
    this.texture_sprite.height = this.h - 8;
    this.texture_sprite.width = this.w - 8;
    this.border.position.set(4, 4);
    this.texture_sprite.position.set(4, 4);

    // Define Render Order for Block
    // Basically just add everything together now it has been initialized.
    let block = new PIXI.Container();
    block.addChild(this.background);
    block.addChild(this.texture_sprite);
    if (this.inner || this.inner != null) {
      try {
        // + 4 accounts for border padding
        // DEFINE SOME TEXT SCALING FUNCTION USING A SCALAR WITH A CONSTANT REDUCTION
        this.inner.position.set(
          this.w / 2 - this.inner.width / 2 + 4,
          this.h / 2 - this.inner.height / 2 + 4
        );
        block.addChild(this.inner);
      } catch (e) {
        console.error(`Could not add inner element: ${e}`);
      }
    }
    block.addChild(this.border);

    // Set relative position of the entire block
    block.position.set(__init_coords[0], __init_coords[1]);
    this.sprite = block;
  }

  set sprite(__sprite) {
    this.container = __sprite;
  }

  get sprite() {
    return this.container;
  }

  /**
   * Quick method to change the inner elements of the block with repositioning.
   * @param {*} __inner: New inner element to use.
   */
  set_new_inner(__inner) {
    try {
      if (this.sprite) this.sprite.removeChildren();
      this.inner = __inner;
      this.inner.position.set(
        this.w / 2 - this.inner.width / 2 + 4,
        this.h / 2 - this.inner.height / 2 + 4
      );
      // as everything has been cleared, need to restack everything.
      this.sprite.addChild(this.background);
      this.sprite.addChild(this.texture_sprite);
      // add the inner
      this.sprite.addChild(this.inner);
      this.sprite.addChild(this.border);
    } catch (e) {
      console.error(e);
    }
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
// STATIC ELEMENTS INITIALIZATION | CREATE THE PLAYER BLOCKS!
// ====================================================================================

// renderer.add_elements([["player_one", player_one]]);
// renderer.add_elements("player_two", player_two);
// renderer.add_elements("player_three", player_three);
// renderer.add_elements("player_four", player_four);
// renderer.add_elements("money_value", money_value);
// renderer.add_elements("player_chaser", player_chaser);
// renderer.add_elements("timer", timer);
// renderer.render_elements();

export default { renderer };
