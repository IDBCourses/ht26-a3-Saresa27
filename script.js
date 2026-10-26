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
const coolRate = 0.1;
const heatShape = createShape("heatShape");

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let inside = false;
let heat = 0;
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let speed = [];

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start() // browsers only allow sound after the player has pressed something

}

function pointerEnter(event) {
  inside = true;


  console.log(event.clientX, event.clientY);
  synth.triggerAttackRelease(note, "8n"); // play the note for an eighth note
}
function pointerLeave(event) {
  inside = false;
  console.log(event.clientX, event.clientY)
}
function pointerMove(event) {
  if (!inside) {
    return;
  }
    let normX = event.clientX / window.innerWidth;
    let normY = event.clientY / window.innerHeight;
    let now = Date.now();
    let distance = Math.hypot(normX - lastX, normY - lastY);
    let seconds = (now- lastTime) / 1000;
  if (seconds === 0) {
    return;
  }
    let speed = distance / seconds;
    console.log(speed);
    lastX = normX
    lastY = normY
    lastTime = now
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  heatShape.setPosition(0.4, 0.3);
  heatShape.setSize(100);
  update(); // start the update loop
  use(); // start the use loop




  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  heatShape.element.addEventListener("pointerenter", pointerEnter);
  heatShape.element.addEventListener("pointerleave", pointerLeave);
}

setup(); // Always remember to call setup()!
