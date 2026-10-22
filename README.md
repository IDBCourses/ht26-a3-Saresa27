# My instrument

**Play it here:** <!-- Paste your GitHub Pages link here, e.g. https://idbcourses.github.io/your-repo-name/ -->

**Name:** <!-- Your name and MAU ID -->

<!-- One or two sentences: what kind of instrument is it, and what is it like to play? -->

## How to play

<!-- Fill in the table with a row for everything the player can do with the pointer: clicking, moving slowly or fast, moving in circles, holding still... Say what happens to the sound and to the shapes. If you added keys, give them rows too. -->

| When you...  | The sound...                         | The shapes... |
| ------------ | ------------------------------------ | ------------- |
| Click or tap | Plays a C4 (the example: replace it) | Nothing yet   |
|              |                                      |               |

<!-- Anything else a player needs to know: how to get started, a good thing to try first. -->

---

## About this assignment

**A3: Functional Prototype.** An individual assignment. You build a musical instrument with Tone.js, played with the **pointer** (mouse, trackpad, touch or pen), with shapes on the page that respond to how you play. The full brief, the due date and the assessment criteria are on Canvas. The A2 oral exam examines this code, so make sure you understand every part of it.

### The brief, in short

- **The pointer shapes the sound.** Use `PointerEvent`s (`pointermove`, `pointerdown`, `pointerup` ...) so the pointer's position and movement continuously change the sound: pitch, volume, a filter, tempo, density ...
- **Visual elements are required.** Shapes on the page must respond to the pointer's movement over time, not only to where it is right now. A keyboard layer is optional and doesn't replace the visuals.
- **Process data over time.** "Pointer X sets the pitch" on its own isn't enough. Use something worked out across many events: speed, direction, distance travelled, or a history of positions.
- **Structure:** use the settings/state and setup/update/use patterns. `script.js` is already set up this way.
- **Readable code:** comments, consistent indentation, and this README filled in.
- **Allowed:** vanilla JavaScript, Tone.js and `shape.js`. **Not allowed:** other libraries, and CSS transitions or animations. Anything that moves is moved by your JavaScript.

Your code must include, at a minimum:

1. An object **or** an array
2. A `for` loop **or** a `while` loop **or** a functional equivalent (e.g. `forEach()`)
3. A constant variable
4. An event handler

### Hand in

On Canvas:

- **Code:** a `.zip` of `main` (on GitHub: **Code → Download ZIP**), and the link to your live page in the submission comment. The link also goes at the top of this README.
- **Reflection:** a `.pdf` of about 250 words on one moment when your code "talked back". See the brief on Canvas.

Having your code on GitHub doesn't count as handing it in. Upload it on Canvas too.

---

## What's in the template

| File         | What goes in it                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `script.js`  | All of your code: settings, state, the sound, `update()`, `use()`, the controls and `setup()`                               |
| `shape.js`   | Ready-made code for shapes on the page. Use `createShape()` and its methods (see below). You don't need to change this file |
| `index.html` | The page. Loads Tone.js and `script.js`                                                                                     |
| `style.css`  | How the page and the shapes look                                                                                            |

`script.js` starts with:

- A `PolySynth` connected to the speakers, ready to play.
- `update()` and `use()`, which each run every 100 milliseconds. Change the state in `update()`, and use it to make sound and move shapes in `use()`.
- A `note` constant in the settings, and a `pointerDown()` handler that plays it every time you click, tap or touch the page. It also starts Tone.js, because browsers only allow sound after the player has done something.
- One example shape near the middle of the window. Replace it with your own.

Playing a note on `pointerdown` is only a starting point. Making the pointer's movement over time shape the sound and the shapes is the assignment.

### Run it

1. Open `index.html`, then run **Live Preview: Show Preview (External Browser)** from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Open the browser's developer tools (`F12`, or `Cmd+Option+I` on a Mac) and click the **Console** tab.
3. You should see a pink circle in the middle of the page. Click anywhere on the page. You should hear a note, and see `Pointer down at` and the pointer's position in the console.

### The live page

Every time something is merged into `main`, GitHub publishes it at the link at the top of this README. It takes a minute or two. To find the link: on github.com, go to **Settings → Pages**. The program has to run without errors there too, not just on your computer.

---

## shape.js

`shape.js` puts shapes on the page and lets you change them from your code. Import what you need at the top of `script.js`:

```js
import { createShape } from "./shape.js";
```

A new shape is a 100 × 100 pink circle (the `.shape` rule in `style.css`), placed at the top-left of the window until you move it.

### `createShape(id, className)`

Makes a new shape, adds it to the page, and returns it.

| Parameter   | Default   | What it is                                                                                                                                                  |
| ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | `null`    | Optional. An id for the element, so you can style it with `#id` in `style.css`. If another element already has that id, `-1`, `-2` ... is added to the end. |
| `className` | `"shape"` | The CSS class (or several, separated by spaces). If you change it, the shape loses the `.shape` look unless you include `shape`.                            |

```js
const dot = createShape("dot");
```

### Methods

Every method changes the shape on the page and stores the new value on the shape. Each one returns the shape, so you can chain them:

```js
dot.setPosition(0.25, 0.5).setSize(40).setColour(200);
```

| Method                                         | What it does                                                                                                                                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setPosition(x, y)`                            | Moves the shape. `x` and `y` go from `0` to `1` across the window: `(0, 0)` is the top-left, `(1, 1)` the bottom-right.                                                                        |
| `setPositionPixels(x, y)`                      | Moves the shape, in pixels from the top-left of the window. Handy with a pointer event's `clientX` and `clientY`.                                                                              |
| `setSize(size)`                                | Makes the shape a square (or circle) `size` pixels across.                                                                                                                                     |
| `setSize(width, height)`                       | Sets the width and height separately, in pixels.                                                                                                                                               |
| `setColour(hue, saturation, lightness, alpha)` | Sets the colour in HSL. `hue` is 0–360 (0 red, 120 green, 240 blue). `saturation` and `lightness` are percentages, 0–100 (defaults `100` and `50`). `alpha` is the opacity, 0–1 (default `1`). |
| `setRotation(degrees)`                         | Turns the shape, in degrees.                                                                                                                                                                   |
| `setRoundedness(amount)`                       | How round the corners are, from `0` (square corners) to `1`. From `0.5` up, a square is a full circle.                                                                                         |
| `setClass(className)`                          | Replaces the shape's CSS classes. Include `shape` to keep the default look.                                                                                                                    |
| `setID(id)`                                    | Changes the element's id. As with `createShape()`, a number is added if the id is taken.                                                                                                       |

Good to know:

- The position is the shape's **top-left corner**, not its centre. To centre a shape on a point, subtract half its width and height.
- The colour, size, rotation and roundedness set by the methods override what's in `style.css`.
- To remove a shape from the page: `dot.element.remove()`.

### Properties

You can read these to find out where a shape is and how it looks:

| Property                                    | What it holds           |
| ------------------------------------------- | ----------------------- |
| `x`, `y`                                    | Position in pixels      |
| `width`, `height`                           | Size in pixels          |
| `hue`, `saturation`, `lightness`, `opacity` | The colour              |
| `rotation`                                  | Rotation in degrees     |
| `roundedness`                               | Roundedness, 0–1        |
| `element`                                   | The `<div>` on the page |

```js
dot.setPositionPixels(dot.x + 5, dot.y); // move 5 pixels to the right
```

Change a shape with its methods, not by setting the properties: `dot.x = 100` changes the number but doesn't move the shape.

A new shape's properties don't come from `style.css`. Until you call a method, they hold starting values (`x` and `y` are the middle of the window, `hue` is `0`, `roundedness` is `0`, `width` and `height` are `100`) that may not match what you see.

---

## Working with Git

This is your own repo, so you don't need anyone to review your work. **`main` must always run**, because it's what you hand in and what the live page shows.

For small changes, commit straight to `main`. Commit small and often, with a message that says what changed, and push at least at the end of every session. Your commit history also helps you in the A2 oral exam.

For a **larger feature**, use a branch:

1. **Make a branch.** Click the branch name in the bottom-left corner of VS Code → **Create new branch…**. Name it after the feature: `pointer-speed`, `trail`, `filter-sweep`.
2. **Commit and push** to the branch. The first time, click **Publish Branch**.
3. **Open a pull request** on github.com (GitHub shows a **Compare & pull request** button after you push). Fill in _What changed_, _How to test it_ and _Anything you're unsure about_. It's a record of what you did and why.
4. **Merge it** yourself: **Merge pull request**, then **Delete branch**.
5. In VS Code, switch back to `main` and click **Sync Changes** (or **Pull**).

### When you get a conflict

A conflict means `main` and your branch changed the same lines, and Git can't tell which version to keep. It's normal, and nothing is lost. You decide.

1. The Source Control panel lists the conflicting files under **Merge Changes**. Open one.
2. Each conflict shows two versions: **Current** (the branch you're on) and **Incoming** (the one you're merging in). Above each one, click **Accept Current Change**, **Accept Incoming Change** or **Accept Both Changes**. Or edit the lines by hand until they're right.
3. Make sure no `<<<<<<<`, `=======` or `>>>>>>>` lines are left in the file.
4. Save, then click **+** next to the file to stage it.
5. When every file is done, click **Commit**, then push.
6. **Run the code.** A conflict you've resolved can still break the program.

If you're stuck, stop and ask a TA or teacher. Don't delete the folder and clone again, and don't force anything.

---

## Resources

- [Tone.js documentation](https://tonejs.github.io/docs/15.1.22/)
- [`PointerEvent` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent)
- [`KeyboardEvent` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
