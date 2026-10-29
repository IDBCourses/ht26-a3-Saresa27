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
let shapes2 = [
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

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.

// ---------- Update ----------
// Update the state. This is called every 10ms.
function update() {
  setTimeout(update, 10); // schedule next call

  for (let i = 0; i < shapes2.length; i++) {
    if (shapes2[i].heat > 0) {
      // cooldown while heat is postive
      shapes2[i].heat -= settings.coolRate;
      if (shapes2[i].heat < 0)
        // sets a floor for heat so it doesn't go below 0
        shapes2[i].heat = 0;
    }
  }
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 10ms.
function use() {
  setTimeout(use, 10); // schedule next call

  for (let i = 0; i < shapes2.length; i++) {
    let heat = shapes2[i].heat;
    // Use heat to scale the shape size between "min" and "max"
    let shape = shapes2[i].shape;
    let size = settings.minSize + (settings.maxSize - settings.minSize) * heat;
    shape.setSize(size);

    // Keep the shape positioned on its center
    const sizeXNorm = size / window.innerWidth;
    const sizeYNorm = size / window.innerHeight;
    shape.setPosition(
      shapes2[i].position.x - sizeXNorm / 2,
      shapes2[i].position.y - sizeYNorm / 2,
    );

    // Change color
    shape.setColour(
      settings.coldHue + (settings.hotHue - settings.coldHue) * heat,
    );

    // Change volume
    let synth = shapes2[i].synth;
    synth.volume.value =
      settings.minVolume + heat * (settings.maxVolume - settings.minVolume);

    let playing = shapes2[i].isPlaying;
    let inside = shapes2[i].isInside;
    if (playing && !inside && heat === 0) {
      synth.triggerRelease(shapes2[i].note);
      shapes2[i].isPlaying = false;
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

function shapeEnter(event, shapeIndex) {
  shapes2[shapeIndex].isInside = true;
  const normPos = normalizePosition(event.x, event.y);
  lastX = normPos.x;
  lastY = normPos.y;
  lastTime = Date.now();

  if (!shapes2[shapeIndex].isPlaying) {
    shapes2[shapeIndex].synth.triggerAttack(shapes2[shapeIndex].note); // play the note
    shapes2[shapeIndex].isPlaying = true;
  }
}

function pointerEnter1(event) {
  shapeEnter(event, 0);
}

function pointerEnter2(event) {
  shapeEnter(event, 1);
}

function pointerEnter3(event) {
  shapeEnter(event, 2);
}

function shapeLeave(shapeIndex) {
  shapes2[shapeIndex].isInside = false;
}

function pointerLeave1(event) {
  shapeLeave(0);
}

function pointerLeave2(event) {
  shapeLeave(1);
}

function pointerLeave3(event) {
  shapeLeave(2);
}

function shapeMove(event, shapeIndex) {
  if (!shapes2[shapeIndex].isInside) {
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

  if (shapes2[shapeIndex].heat < 1) {
    // heat up if heat is less than 1
    shapes2[shapeIndex].heat += speed * settings.heatGain;
    if (shapes2[shapeIndex].heat > 1)
      // sets a cap for heat so it doesn't go above 1
      shapes2[shapeIndex].heat = 1;
  }
}

function pointerMove1(event) {
  shapeMove(event, 0);
}

function pointerMove2(event) {
  shapeMove(event, 1);
}

function pointerMove3(event) {
  shapeMove(event, 2);
}
// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  // Initialize shape
  for (let i = 0; i < shapes2.length; i++) {
    let shape = shapes2[i].shape;
    shape.setPosition(shapes2[i].position.x, shapes2[i].position.y);
    shape.setSize(settings.minSize);
    shape.setColour(settings.coldHue);
  }

  update(); // start the update loop
  use(); // start the use loop

  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  // window.addEventListener("pointermove", pointerMove);

  shapes2[0].shape.element.addEventListener("pointerenter", pointerEnter1);
  shapes2[1].shape.element.addEventListener("pointerenter", pointerEnter2);
  shapes2[2].shape.element.addEventListener("pointerenter", pointerEnter3);
  shapes2[0].shape.element.addEventListener("pointerleave", pointerLeave1);
  shapes2[1].shape.element.addEventListener("pointerleave", pointerLeave2);
  shapes2[2].shape.element.addEventListener("pointerleave", pointerLeave3);
  shapes2[0].shape.element.addEventListener("pointermove", pointerMove1);
  shapes2[1].shape.element.addEventListener("pointermove", pointerMove2);
  shapes2[2].shape.element.addEventListener("pointermove", pointerMove3);
}

setup(); // Always remember to call setup()!
