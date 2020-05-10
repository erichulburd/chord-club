"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModifierContext = undefined;

var _vex = require("./vex");

var _stavenote = require("./stavenote");

var _dot = require("./dot");

var _frethandfinger = require("./frethandfinger");

var _accidental = require("./accidental");

var _notesubgroup = require("./notesubgroup");

var _gracenotegroup = require("./gracenotegroup");

var _strokes = require("./strokes");

var _stringnumber = require("./stringnumber");

var _articulation = require("./articulation");

var _ornament = require("./ornament");

var _annotation = require("./annotation");

var _bend = require("./bend");

var _vibrato = require("./vibrato");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
//
// This class implements various types of modifiers to notes (e.g. bends,
// fingering positions etc.)
// To enable logging for this class. Set `Vex.Flow.ModifierContext.DEBUG` to `true`.
function L(...args) {
  if (ModifierContext.DEBUG) _vex.Vex.L('Vex.Flow.ModifierContext', args);
}

class ModifierContext {
  constructor() {
    // Current modifiers
    this.modifiers = {}; // Formatting data.

    this.preFormatted = false;
    this.postFormatted = false;
    this.width = 0;
    this.spacing = 0;
    this.state = {
      left_shift: 0,
      right_shift: 0,
      text_line: 0,
      top_text_line: 0
    }; // Add new modifiers to this array. The ordering is significant -- lower
    // modifiers are formatted and rendered before higher ones.

    this.PREFORMAT = [_stavenote.StaveNote, _dot.Dot, _frethandfinger.FretHandFinger, _accidental.Accidental, _strokes.Stroke, _gracenotegroup.GraceNoteGroup, _notesubgroup.NoteSubGroup, _stringnumber.StringNumber, _articulation.Articulation, _ornament.Ornament, _annotation.Annotation, _bend.Bend, _vibrato.Vibrato]; // If post-formatting is required for an element, add it to this array.

    this.POSTFORMAT = [_stavenote.StaveNote];
  }

  addModifier(modifier) {
    const type = modifier.getCategory();
    if (!this.modifiers[type]) this.modifiers[type] = [];
    this.modifiers[type].push(modifier);
    modifier.setModifierContext(this);
    this.preFormatted = false;
    return this;
  }

  getModifiers(type) {
    return this.modifiers[type];
  }

  getWidth() {
    return this.width;
  }

  getLeftShift() {
    return this.state.left_shift;
  }

  getRightShift() {
    return this.state.right_shift;
  }

  getState() {
    return this.state;
  }

  getMetrics() {
    if (!this.formatted) {
      throw new _vex.Vex.RERR('UnformattedModifier', 'Unformatted modifier has no metrics.');
    }

    return {
      width: this.state.left_shift + this.state.right_shift + this.spacing,
      spacing: this.spacing
    };
  }

  preFormat() {
    if (this.preFormatted) return;
    this.PREFORMAT.forEach(modifier => {
      L('Preformatting ModifierContext: ', modifier.CATEGORY);
      modifier.format(this.getModifiers(modifier.CATEGORY), this.state, this);
    }); // Update width of this modifier context

    this.width = this.state.left_shift + this.state.right_shift;
    this.preFormatted = true;
  }

  postFormat() {
    if (this.postFormatted) return;
    this.POSTFORMAT.forEach(modifier => {
      L('Postformatting ModifierContext: ', modifier.CATEGORY);
      modifier.postFormat(this.getModifiers(modifier.CATEGORY), this);
    });
  }

}

exports.ModifierContext = ModifierContext;
//# sourceMappingURL=modifiercontext.js.map