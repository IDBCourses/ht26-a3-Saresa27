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
const notes = ["C4", "E4", "G4"]; // the note played when the pointer goes down
const settings = {
  heatGain: 0.05,
  coolRate: 0.01,
  minSize: 100, // minimum size value
  maxSize: 200, // max size value
  minVolume: -20,
  maxVolume: 0,
  coldHue: 200,
  hotHue: 10,
  positions: [
    { x: 0.3, y: 0.4 },
    { x: 0.5, y: 0.5 },
    { x: 0.7, y: 0.4 },
  ],
};

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let isInside = [false, false, false];
let heats = [0, 0, 0];
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let isPlaying = [false, false, false];

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth1 = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once
const synth2 = new Tone.PolySynth(Tone.Synth).toDestination();
const synth3 = new Tone.PolySynth(Tone.Synth).toDestination();
const synths = [synth1, synth2, synth3];

// ---------- Shapes ----------
const shape1 = createShape();
const shape2 = createShape();
const shape3 = createShape();
const shapes = [shape1, shape2, shape3];

// ---------- Update ----------
// Update the state. This is called every 10ms.
function update() {
  setTimeout(update, 10); // schedule next call

  for (let i = 0; i < heats.length; i++) {
    if (heats[i] > 0) {
      // cooldown while heat is postive
      heats[i] -= settings.coolRate;
      if (heats[i] < 0)
        // sets a floor for heat so it doesn't go below 0
        heats[i] = 0;
    }
  }
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 10ms.
function use() {
  setTimeout(use, 10); // schedule next call

  for (let i = 0; i < shapes.length; i++) {
    let heat = heats[i];
    // Use heat to scale the shape size between "min" and "max"
    let shape = shapes[i];
    let size =
      settings.minSize + (settings.maxSize - settings.minSize) * heat;
    shape.setSize(size);


    // Keep the shape positioned on its center
    const sizeXNorm = size / window.innerWidth;
    const sizeYNorm = size / window.innerHeight;
    shape.setPosition(
      settings.positions[i].x - sizeXNorm / 2,
      settings.positions[i].y - sizeYNorm / 2,
    );

    // Change color
    shape.setColour(
      settings.coldHue + (settings.hotHue - settings.coldHue) * heat,
    );

    // Change volume
    let synth = synths[i];
    synth.volume.value = settings.minVolume + heat * (settings.maxVolume - settings.minVolume);

    let playing = isPlaying[i];
    let inside = isInside[i];
    if (playing && !inside && heat === 0) {
      synth.triggerRelease(notes[i]);
      isPlaying[i] = false;
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
  isInside[shapeIndex] = true;
  const normPos = normalizePosition(event.x, event.y);
  lastX = normPos.x;
  lastY = normPos.y;
  lastTime = Date.now();

  if (!isPlaying[shapeIndex]) {
    synths[shapeIndex].triggerAttack(notes[shapeIndex]); // play the note
    isPlaying[shapeIndex] = true;
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
  isInside[shapeIndex] = false;
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
  if (!isInside[shapeIndex]) {
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

  if (heats[shapeIndex] < 1) {
    // heat up if heat is less than 1
    heats[shapeIndex] += speed * settings.heatGain;
    if (heats[shapeIndex] > 1)
      // sets a cap for heat so it doesn't go above 1
      heats[shapeIndex] = 1;
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
  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    shape.setPosition(settings.positions[i].x, settings.positions[i].y);
    shape.setSize(settings.minSize);
    shape.setColour(settings.coldHue);
  }

  update(); // start the update loop
  use(); // start the use loop

  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  // window.addEventListener("pointermove", pointerMove);

  shapes[0].element.addEventListener("pointerenter", pointerEnter1);
  shapes[1].element.addEventListener("pointerenter", pointerEnter2);
  shapes[2].element.addEventListener("pointerenter", pointerEnter3);
  shapes[0].element.addEventListener("pointerleave", pointerLeave1);
  shapes[1].element.addEventListener("pointerleave", pointerLeave2);
  shapes[2].element.addEventListener("pointerleave", pointerLeave3);
  shapes[0].element.addEventListener("pointermove", pointerMove1);
  shapes[1].element.addEventListener("pointermove", pointerMove2);
  shapes[2].element.addEventListener("pointermove", pointerMove3);
}

setup(); // Always remember to call setup()!
