"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GhostNote = undefined;

var _vex = require("./vex");

var _stemmablenote = require("./stemmablenote");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
class GhostNote extends _stemmablenote.StemmableNote {
  /** @constructor */
  constructor(parameter) {
    // Sanity check
    if (!parameter) {
      throw new _vex.Vex.RuntimeError('BadArguments', 'Ghost note must have valid initialization data to identify ' + 'duration.');
    }

    let note_struct; // Preserve backwards-compatibility

    if (typeof parameter === 'string') {
      note_struct = {
        duration: parameter
      };
    } else if (typeof parameter === 'object') {
      note_struct = parameter;
    } else {
      throw new _vex.Vex.RuntimeError('BadArguments', 'Ghost note must have valid initialization data to identify ' + 'duration.');
    }

    super(note_struct);
    this.setAttribute('type', 'GhostNote'); // Note properties

    this.setWidth(0);
  }

  isRest() {
    return true;
  }

  setStave(stave) {
    super.setStave(stave);
  }

  addToModifierContext() {
    /* intentionally overridden */
    return this;
  }

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    if (!this.stave) throw new _vex.Vex.RERR('NoStave', "Can't draw without a stave."); // Draw the modifiers

    this.setRendered();

    for (let i = 0; i < this.modifiers.length; ++i) {
      const modifier = this.modifiers[i];
      modifier.setContext(this.context);
      modifier.drawWithStyle();
    }
  }

}

exports.GhostNote = GhostNote;
//# sourceMappingURL=ghostnote.js.map