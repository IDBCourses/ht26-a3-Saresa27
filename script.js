/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
const settings = {
  heatGain: 0.02, // how much heat is added per unit of pointer speed
  coolRate: 0.008, // how much heat is lost every update when the pointer is away
  passiveHeatRate: 0.005, // how much heat is gained every update while the pointer rests inside of a circle
  minSize: 150, // shape size when fully cold
  maxSize: 300, // shape size when fully hot
  minVolume: -20, // volume when fully cold
  maxVolume: 0, // volume when fully hot
  coldHue: 200, // color hue when fully cold
  hotHue: 10, // color hue when fully hot
};

// ---------- State ----------
// State variables are the parts of your program that change over time.

// Last known pointer position and time, used to calculate pointer speed
let lastX = 0;
let lastY = 0;
let lastTime = 0;

// Full state for each shape
let hotSpots = [
  {
    isInside: false, // is the pointer currently over the shape?
    isPlaying: false, // is the note currently sounding?
    heat: 0, // 0 (cold) to 1 (hot), what makes the shape grow, change color, and volume
    position: { x: 0.35, y: 0.4 }, // position of the shape
    notes: ["C4", "E4", "G4"], // the note the shape plays
    shape: createShape(), // the visual element
    synth: new Tone.PolySynth(Tone.Synth).toDestination(), // the sound source for this shape
  },
  {
    isInside: false,
    isPlaying: false,
    heat: 0,
    position: { x: 0.5, y: 0.5 },
    notes: ["A3", "C4", "E4"],
    shape: createShape(),
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
  },
  {
    isInside: false,
    isPlaying: false,
    heat: 0,
    position: { x: 0.65, y: 0.4 },
    notes: ["F3", "A3", "C4"],
    shape: createShape(),
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
  },
];

// ---------- Update ----------
// Update the state. This is called every 10ms.
function update() {
  setTimeout(update, 10); // schedule next call

  // go through every hot spot and heat it up or cool it down
  for (let i = 0; i < hotSpots.length; i++) {
    if (hotSpots[i].isInside === true) {
      if (hotSpots[i].heat < 1) {
        // heat up while mouse is inside
        hotSpots[i].heat += settings.passiveHeatRate;
        if (hotSpots[i].heat > 1)
          // sets a ceiling for heat so it doesn't go above 1
          hotSpots[i].heat = 1;
      }
    } else {
      // shrinks slowly
      if (hotSpots[i].heat > 0) {
        // cooldown while heat is postive
        hotSpots[i].heat -= settings.coolRate;
        if (hotSpots[i].heat < 0)
          // sets a floor for heat so it doesn't go below 0
          hotSpots[i].heat = 0;
      }
    }
  }
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 10ms.
function use() {
  setTimeout(use, 10); // schedule next call

  for (let i = 0; i < hotSpots.length; i++) {
    let heat = hotSpots[i].heat;
    // Use heat to scale the shape size between "min" and "max"
    // heat 0 gives min size, heat 1 gives max size
    let shape = hotSpots[i].shape;
    let size = settings.minSize + (settings.maxSize - settings.minSize) * heat;
    shape.setSize(size);

    // Keep the shape positioned on its center
    // The size is in pixels, convert it to a fraction of the screen first
    // Then move the shape left and up by half its size so it grows from the middle of the shape
    const sizeXNorm = size / window.innerWidth;
    const sizeYNorm = size / window.innerHeight;
    shape.setPosition(
      hotSpots[i].position.x - sizeXNorm / 2,
      hotSpots[i].position.y - sizeYNorm / 2,
    );

    // Change color, from cold hue to hot hue as heat goes from 0 to 1
    shape.setColour(
      settings.coldHue + (settings.hotHue - settings.coldHue) * heat,
    );

    // Change volume, from quiet volume to loud volume as heat goes from 0 to 1
    let synth = hotSpots[i].synth;
    synth.volume.value =
      settings.minVolume + heat * (settings.maxVolume - settings.minVolume);

    // stops the note once the shape has fully cooled down and the pointer is gone
    let playing = hotSpots[i].isPlaying;
    let inside = hotSpots[i].isInside;
    if (playing && !inside && heat === 0) {
      synth.triggerRelease(hotSpots[i].notes
      );
      hotSpots[i].isPlaying = false;
    }
  }
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
}

// converts a pixel position into a fraction of the screen (0 to 1), so math doesn't depend on the window size.
function normalizePosition(x, y) {
  return {
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  };
}

// runs when the pointer enters a shape.
function shapeEnter(event, hotSpots) {
  hotSpots.isInside = true;
  // remembers where and when the pointer entered, so first speed measurement has something to compare to
  const normPos = normalizePosition(event.x, event.y);
  lastX = normPos.x;
  lastY = normPos.y;
  lastTime = Date.now();

  // starts the note, but only if it isn't already sounding
  if (!hotSpots.isPlaying) {
    hotSpots.synth.triggerAttack(hotSpots.notes); // play the note
    hotSpots.isPlaying = true;
  }
}

// Runs when the pointer leaves a shape. The note keeps playing while the shape cools down
// update() handles the cooling and use() releases the note once heat reaches 0
function shapeLeave(hotSpots) {
  hotSpots.isInside = false;
}

// Runs every time the pointer moves over a shape. faster movement adds more heat
function shapeMove(event, hotSpots) {
  // ignores movement if the pointer isn't inside the shape
  if (!hotSpots.isInside) {
    return;
  }

  const normPos = normalizePosition(event.x, event.y);

  let now = Date.now(); // current time in milliseconds
  let distance = Math.hypot(normPos.x - lastX, normPos.y - lastY); // the straight line distance between pointer was and where it is now
  let seconds = (now - lastTime) / 1000; // time since last event converted into seconds

  if (seconds === 0) {
    // requires time to have passed to avoid dividing by 0
    return;
  }

  // speed = distance / time (in screen-widths per second)
  let speed = distance / seconds;
  lastX = normPos.x; // saving last normalX value
  lastY = normPos.y; // saving last normalY value
  lastTime = now; // all three save the position so the next event can compare against them

  // add heat in proportion to speed, faster movement means more heat
  if (hotSpots.heat < 1) {
    // heat up if heat is less than 1
    hotSpots.heat += speed * settings.heatGain;
    if (hotSpots.heat > 1)
      // sets a cap for heat so it doesn't go above 1
      hotSpots.heat = 1;
  }
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  // Initialize each shape and attach its listeners
  for (let i = 0; i < hotSpots.length; i++) {
    // gives each shape its starting position, size and color
    let shape = hotSpots[i].shape;
    shape.setPosition(hotSpots[i].position.x, hotSpots[i].position.y);
    shape.setSize(settings.minSize);
    shape.setColour(settings.coldHue);

    // listens for the pointer entering, leaving and moving over this shape
    // the arrow function pass along hotSpots[i] so each handler knows which shape it belongs to
    shape.element.addEventListener("pointerenter", (event) =>
      shapeEnter(event, hotSpots[i]),
    );
    shape.element.addEventListener("pointerleave", () =>
      shapeLeave(hotSpots[i]),
    );
    shape.element.addEventListener("pointermove", (event) =>
      shapeMove(event, hotSpots[i]),
    );
  }

  window.addEventListener("pointerdown", pointerDown); // event listener for pointer down on the window

  update(); // start the update loop
  use(); // start the use loop
}

setup(); // Always remember to call setup()!
