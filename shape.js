/**
 * Return an id not used by any other element, appending -1, -2 ... if needed.
 * @param {string} id - Desired id.
 * @param {HTMLElement|null} [current=null] - Element allowed to keep the id.
 * @returns {string}
 */
function uniqueId(id, current = null) {
  let newId = id;
  let counter = 1;
  while (
    document.getElementById(newId) &&
    document.getElementById(newId) !== current
  ) {
    newId = `${id}-${counter++}`;
  }
  return newId;
}

/**
 * A shape: a DOM element plus its own state, with methods to change both.
 * Setter methods return the shape so calls can be chained.
 */
export class Shape {
  /** @param {HTMLElement} element - The element this shape controls. */
  constructor(element) {
    this.element = element;
    this.x = (window.innerWidth || 0) * 0.5;
    this.y = (window.innerHeight || 0) * 0.5;
    this.hue = 0;
    this.saturation = 100;
    this.lightness = 50;
    this.opacity = 1;
    this.width = 100;
    this.height = 100;
    this.roundedness = 0;
    this.rotation = 0;
  }

  /** Set the colour using HSL(A): h 0..360, s and l in percent, a 0..1. */
  setColour(h, s = 100, l = 50, a = 1) {
    this.hue = h;
    this.saturation = s;
    this.lightness = l;
    this.opacity = a;
    this.element.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%, ${a})`;
    return this;
  }

  /** Set position using normalized coordinates (0..1 of the window size). */
  setPosition(x, y) {
    return this.setPositionPixels(
      x * (window.innerWidth || 1),
      y * (window.innerHeight || 1),
    );
  }

  /** Set position in pixels from the top-left of the window. */
  setPositionPixels(px, py) {
    this.x = px;
    this.y = py;
    this.element.style.translate = `${px}px ${py}px`;
    return this;
  }

  /**
   * Set the size: setSize(size) for a square, setSize(width, height) otherwise.
   */
  setSize(sizeOrWidth, height = null) {
    this.width = sizeOrWidth;
    this.height = height === null ? sizeOrWidth : height;
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    return this;
  }

  /** Set the rotation in degrees. */
  setRotation(rotation) {
    this.rotation = rotation;
    this.element.style.rotate = `${rotation}deg`;
    return this;
  }

  /** Set the roundedness as a fraction (0..1); 1 is 100% border-radius. */
  setRoundedness(roundedness) {
    this.roundedness = roundedness;
    this.element.style.borderRadius = `${roundedness * 100}%`;
    return this;
  }

  /**
   * Replace all CSS classes on the element. Inline styles set by the other
   * setters still override class rules.
   * @param {string} className - One or more space-separated class names.
   */
  setClass(className) {
    this.element.className = className;
    return this;
  }

  /**
   * Set the element id. If the id is taken by another element, a numeric
   * suffix is appended (e.g. "id-1").
   * @param {string} id
   */
  setID(id) {
    this.element.id = uniqueId(id, this.element);
    return this;
  }
}

/**
 * Create a new shape: a div appended to the document body, wrapped in a Shape.
 *
 * @param {string|null} [id=null] - Optional id. If already taken, a numeric
 *   suffix is appended (e.g. "id-1").
 * @param {string} [className="shape"] - CSS class to apply to the element.
 * @returns {Shape} The created shape. Its element is `shape.element`.
 */
export function createShape(id = null, className = "shape") {
  const el = document.createElement("div");

  if (className) {
    el.className = className;
  }

  if (id) {
    el.id = uniqueId(id);
  }

  // Append to document body so it's visible by default. Styling should come
  // from the stylesheet (.shape or #shape) rather than inline defaults.
  document.body.appendChild(el);

  return new Shape(el);
}
