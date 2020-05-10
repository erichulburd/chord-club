"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VoiceGroup = undefined;

var _vex = require("./vex");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.

/** @constructor */
class VoiceGroup {
  constructor() {
    this.voices = [];
    this.modifierContexts = [];
  } // Every tickable must be associated with a voiceGroup. This allows formatters
  // and preformatters to associate them with the right modifierContexts.


  getVoices() {
    return this.voices;
  }

  getModifierContexts() {
    return this.modifierContexts;
  }

  addVoice(voice) {
    if (!voice) throw new _vex.Vex.RERR('BadArguments', 'Voice cannot be null.');
    this.voices.push(voice);
    voice.setVoiceGroup(this);
  }

}

exports.VoiceGroup = VoiceGroup;
//# sourceMappingURL=voicegroup.js.map