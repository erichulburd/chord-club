"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NoteSubGroup = undefined;

var _vex = require("./vex");

var _tables = require("./tables");

var _modifier = require("./modifier");

var _formatter = require("./formatter");

var _voice = require("./voice");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Taehoon Moon 2016
//
// ## Description
//
// This file implements `NoteSubGroup` which is used to format and
// render notes as a `Modifier`
// ex) ClefNote, TimeSigNote and BarNote.
class NoteSubGroup extends _modifier.Modifier {
  static get CATEGORY() {
    return 'notesubgroup';
  } // Arrange groups inside a `ModifierContext`


  static format(groups, state) {
    if (!groups || groups.length === 0) return false;
    let width = 0;

    for (let i = 0; i < groups.length; ++i) {
      const group = groups[i];
      group.preFormat();
      width += group.getWidth();
    }

    state.left_shift += width;
    return true;
  }

  constructor(subNotes) {
    super();
    this.setAttribute('type', 'NoteSubGroup');
    this.note = null;
    this.index = null;
    this.position = _modifier.Modifier.Position.LEFT;
    this.subNotes = subNotes;
    this.subNotes.forEach(subNote => {
      subNote.ignore_ticks = false;
    });
    this.width = 0;
    this.preFormatted = false;
    this.formatter = new _formatter.Formatter();
    this.voice = new _voice.Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: _tables.Flow.RESOLUTION
    }).setStrict(false);
    this.voice.addTickables(this.subNotes);
    return this;
  }

  getCategory() {
    return NoteSubGroup.CATEGORY;
  }

  preFormat() {
    if (this.preFormatted) return;
    this.formatter.joinVoices([this.voice]).format([this.voice], 0);
    this.setWidth(this.formatter.getMinTotalWidth());
    this.preFormatted = true;
  }

  setNote(note) {
    this.note = note;
  }

  setWidth(width) {
    this.width = width;
  }

  getWidth() {
    return this.width;
  }

  draw() {
    this.checkContext();
    const note = this.getNote();

    if (!(note && this.index !== null)) {
      throw new _vex.Vex.RuntimeError('NoAttachedNote', "Can't draw notes without a parent note and parent note index.");
    }

    this.setRendered();
    this.alignSubNotesWithNote(this.subNotes, note); // Modifier function
    // Draw notes

    this.subNotes.forEach(subNote => subNote.setContext(this.context).drawWithStyle());
  }

}

exports.NoteSubGroup = NoteSubGroup;
//# sourceMappingURL=notesubgroup.js.map