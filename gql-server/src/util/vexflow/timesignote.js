"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TimeSigNote = undefined;

var _note = require("./note");

var _timesignature = require("./timesignature");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2014
class TimeSigNote extends _note.Note {
  constructor(timeSpec, customPadding) {
    super({
      duration: 'b'
    });
    this.setAttribute('type', 'TimeSigNote');
    const timeSignature = new _timesignature.TimeSignature(timeSpec, customPadding);
    this.timeSig = timeSignature.getTimeSig();
    this.setWidth(this.timeSig.glyph.getMetrics().width); // Note properties

    this.ignore_ticks = true;
  }

  getBoundingBox() {
    return super.getBoundingBox();
  }

  addToModifierContext() {
    /* overridden to ignore */
    return this;
  }

  preFormat() {
    this.setPreFormatted(true);
    return this;
  }

  draw() {
    this.stave.checkContext();
    this.setRendered();

    if (!this.timeSig.glyph.getContext()) {
      this.timeSig.glyph.setContext(this.context);
    }

    this.timeSig.glyph.setStave(this.stave);
    this.timeSig.glyph.setYShift(this.stave.getYForLine(this.timeSig.line) - this.stave.getYForGlyphs());
    this.timeSig.glyph.renderToStave(this.getAbsoluteX());
  }

}

exports.TimeSigNote = TimeSigNote;
//# sourceMappingURL=timesignote.js.map