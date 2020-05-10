"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeySigNote = undefined;

var _note = require("./note");

var _keysignature = require("./keysignature");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Mark Meeus 2019
class KeySigNote extends _note.Note {
  constructor(keySpec, cancelKeySpec, alterKeySpec) {
    super({
      duration: 'b'
    });
    this.setAttribute('type', 'KeySigNote');
    this.keySignature = new _keysignature.KeySignature(keySpec, cancelKeySpec, alterKeySpec); // Note properties

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
    this.keySignature.setStave(this.stave);
    this.keySignature.format();
    this.setWidth(this.keySignature.width);
    return this;
  }

  draw() {
    this.stave.checkContext();
    this.setRendered();
    this.keySignature.x = this.getAbsoluteX();
    this.keySignature.setContext(this.context);
    this.keySignature.draw();
  }

}

exports.KeySigNote = KeySigNote;
//# sourceMappingURL=keysignote.js.map