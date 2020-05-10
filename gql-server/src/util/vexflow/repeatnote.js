"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RepeatNote = undefined;

var _glyphnote = require("./glyphnote");

var _glyph = require("./glyph");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
class RepeatNote extends _glyphnote.GlyphNote {
  constructor(type, noteStruct, options) {
    // Smufl Codes
    const CODES = {
      '1': 'repeat1Bar',
      '2': 'repeat2Bars',
      '4': 'repeat4Bars',
      'slash': 'repeatBarSlash'
    };
    noteStruct = {
      duration: 'q',
      align_center: type !== 'slash',
      ...noteStruct
    };
    super(null, {
      duration: 'q',
      align_center: type !== 'slash',
      ...noteStruct
    }, options);
    this.setAttribute('type', 'RepeatNote');
    const glyphCode = CODES[type] || 'repeat1Bar';
    const glyph = new _glyph.Glyph(glyphCode, this.musicFont.lookupMetric('repeatNote.point', 40), {
      category: 'repeatNote'
    });
    this.setGlyph(glyph);
  }

}

exports.RepeatNote = RepeatNote;
//# sourceMappingURL=repeatnote.js.map