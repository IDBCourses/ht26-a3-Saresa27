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
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
const note = "C4"; // the note played when the pointer goes down
const heatGain = 0.1;
const coolRate = 0.05;
const heatShape = createShape("heatShape");
const minSize = 50; // minimum size value
const maxSize = 100; // max size value

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let inside = false;
let heat = 0;
let lastX = 0;
let lastY = 0;
let lastTime = 0;


// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
  if (heat > 0) { // cooldown while heat is postive
  heat -= coolRate;
    if (heat < 0) // sets a floor for heat so it doesn't go below 0
      heat = 0;
  }
  console.log(heat);
}


// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
  // fact: heat is a value between 0 and 1
  // use heat to scale the shape size from "min" to "max" (lerp)
  let size = minSize + ((maxSize - minSize) * heat);
  heatShape.setSize(size);

}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start() // browsers only allow sound after the player has pressed something

}

function normalize(x, y) {
  return {
    x: x / window.innerWidth,
    y: y / window.innerHeight
  }
}

function pointerEnter(event) {
  inside = true;


  console.log(normalize(event.clientX, event.clientY));
  synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note
}
function pointerLeave(event) {
  inside = false;
  console.log(normalize(event.clientX, event.clientY))
}

function pointerMove(event) {
  if (!inside) {
    return;
  }

  const normalized = normalize(event.x, event.y)

  let normX = normalized.x
  let normY = normalized.y
  let now = Date.now(); // current time in milliseconds
  let distance = Math.hypot(normX - lastX, normY - lastY); // the sstraight line distance between pointer was and where it is now
  let seconds = (now- lastTime) / 1000; // time since last event converted into seconds

  if (seconds === 0) { // requires time to have passed to avoid dividing by 0
    return;
  }

  let speed = distance / seconds;
  console.log(speed);
  lastX = normX // saving last normalX value
  lastY = normY // saving last normalY value
  lastTime = now // all three save the position so the next event can compare against them

  if (heat < 1) { // heat up if heat is less than 1 
    heat += (speed * heatGain);
    if (heat > 1) // sets a cap for heat so it doesn't go above 1
      heat = 1;
 }
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  heatShape.setPosition(0.4, 0.3);
  heatShape.setSize();
  update(); // start the update loop
  use(); // start the use loop




  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  heatShape.element.addEventListener("pointerenter", pointerEnter);
  heatShape.element.addEventListener("pointerleave", pointerLeave);
}

setup(); // Always remember to call setup()!
