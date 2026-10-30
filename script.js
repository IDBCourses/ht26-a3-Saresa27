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
  heatGain: 0.05,
  coolRate: 0.01,
  minSize: 100, // minimum size value
  maxSize: 200, // max size value
  minVolume: -20,
  maxVolume: 0,
  coldHue: 200,
  hotHue: 10,
};

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let hotSpot = [
  {
    isInside: false,
    isPlaying: false,
    heat: 0,
    position: { x: 0.3, y: 0.4 },
    note: "C4",
    shape: createShape(),
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
  },
  {
    isInside: false,
    isPlaying: false,
    heat: 0,
    position: { x: 0.5, y: 0.5 },
    note: "E4",
    shape: createShape(),
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
  },
  {
    isInside: false,
    isPlaying: false,
    heat: 0,
    position: { x: 0.7, y: 0.4 },
    note: "G4",
    shape: createShape(),
    synth: new Tone.PolySynth(Tone.Synth).toDestination(),
  },
];


// ---------- Update ----------
// Update the state. This is called every 10ms.
function update() {
  setTimeout(update, 10); // schedule next call

  for (let i = 0; i < hotSpot.length; i++) {
    if (hotSpot[i].heat > 0) {
      // cooldown while heat is postive
      hotSpot[i].heat -= settings.coolRate;
      if (hotSpot[i].heat < 0)
        // sets a floor for heat so it doesn't go below 0
        hotSpot[i].heat = 0;
    }
  }
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 10ms.
function use() {
  setTimeout(use, 10); // schedule next call

  for (let i = 0; i < hotSpot.length; i++) {
    let heat = hotSpot[i].heat;
    // Use heat to scale the shape size between "min" and "max"
    let shape = hotSpot[i].shape;
    let size = settings.minSize + (settings.maxSize - settings.minSize) * heat;
    shape.setSize(size);

    // Keep the shape positioned on its center
    const sizeXNorm = size / window.innerWidth;
    const sizeYNorm = size / window.innerHeight;
    shape.setPosition(
      hotSpot[i].position.x - sizeXNorm / 2,
      hotSpot[i].position.y - sizeYNorm / 2,
    );

    // Change color
    shape.setColour(
      settings.coldHue + (settings.hotHue - settings.coldHue) * heat,
    );

    // Change volume
    let synth = hotSpot[i].synth;
    synth.volume.value =
      settings.minVolume + heat * (settings.maxVolume - settings.minVolume);

    let playing = hotSpot[i].isPlaying;
    let inside = hotSpot[i].isInside;
    if (playing && !inside && heat === 0) {
      synth.triggerRelease(hotSpot[i].note);
      hotSpot[i].isPlaying = false;
    }
  }
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
}

function normalizePosition(x, y) {
  return {
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  };
}

function shapeEnter(event, hotSpot) {
  hotSpot.isInside = true;
  const normPos = normalizePosition(event.x, event.y);
  lastX = normPos.x;
  lastY = normPos.y;
  lastTime = Date.now();

  if (!hotSpot.isPlaying) {
    hotSpot.synth.triggerAttack(hotSpot.note); // play the note
    hotSpot.isPlaying = true;
  }
}


function shapeLeave(hotSpot) {
  hotSpot.isInside = false;
}


function shapeMove(event, hotSpot) {
  if (!hotSpot.isInside) {
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

  let speed = distance / seconds;
  lastX = normPos.x; // saving last normalX value
  lastY = normPos.y; // saving last normalY value
  lastTime = now; // all three save the position so the next event can compare against them

  if (hotSpot.heat < 1) {
    // heat up if heat is less than 1
    hotSpot.heat += speed * settings.heatGain;
    if (hotSpot.heat > 1)
      // sets a cap for heat so it doesn't go above 1
      hotSpot.heat = 1;
  }
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  // Initialize each shape and attaches it's listener
  for (let i = 0; i < hotSpot.length; i++) {
    let shape = hotSpot[i].shape;
    shape.setPosition(hotSpot[i].position.x, hotSpot[i].position.y);
    shape.setSize(settings.minSize);
    shape.setColour(settings.coldHue);

    shape.element.addEventListener("pointerenter", (event) => shapeEnter(event, hotSpot[i]));
    shape.element.addEventListener("pointerleave", () => shapeLeave(hotSpot[i]));
    shape.element.addEventListener("pointermove", (event) => shapeMove(event, hotSpot[i]));
  }

  window.addEventListener("pointerdown", pointerDown); // event listener for pointer down on the window

  update(); // start the update loop
  use(); // start the use loop
}

setup(); // Always remember to call setup()!
