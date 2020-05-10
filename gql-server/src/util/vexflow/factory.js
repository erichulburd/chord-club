"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Factory = exports.X = undefined;

var _vex = require("./vex");

var _accidental = require("./accidental");

var _articulation = require("./articulation");

var _annotation = require("./annotation");

var _formatter = require("./formatter");

var _frethandfinger = require("./frethandfinger");

var _stringnumber = require("./stringnumber");

var _textdynamics = require("./textdynamics");

var _modifiercontext = require("./modifiercontext");

var _multimeasurerest = require("./multimeasurerest");

var _renderer = require("./renderer");

var _stave = require("./stave");

var _stavetie = require("./stavetie");

var _staveline = require("./staveline");

var _stavenote = require("./stavenote");

var _glyphnote = require("./glyphnote");

var _repeatnote = require("./repeatnote");

var _staveconnector = require("./staveconnector");

var _system = require("./system");

var _tickcontext = require("./tickcontext");

var _tuplet = require("./tuplet");

var _voice = require("./voice");

var _beam = require("./beam");

var _curve = require("./curve");

var _gracenote = require("./gracenote");

var _gracenotegroup = require("./gracenotegroup");

var _notesubgroup = require("./notesubgroup");

var _easyscore = require("./easyscore");

var _timesignote = require("./timesignote");

var _keysignote = require("./keysignote");

var _clefnote = require("./clefnote");

var _pedalmarking = require("./pedalmarking");

var _textbracket = require("./textbracket");

var _vibratobracket = require("./vibratobracket");

var _ghostnote = require("./ghostnote");

var _barnote = require("./barnote");

var _tabnote = require("./tabnote");

var _tabstave = require("./tabstave");

var _textnote = require("./textnote");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// @author Mohit Cheppudira
//
// ## Description
//
// This file implements a high level API around VexFlow. It will eventually
// become the canonical way to use VexFlow.
//
// *This API is currently DRAFT*
// To enable logging for this class. Set `Vex.Flow.Factory.DEBUG` to `true`.
function L(...args) {
  if (Factory.DEBUG) _vex.Vex.L('Vex.Flow.Factory', args);
}

const X = exports.X = _vex.Vex.MakeException('FactoryError');

function setDefaults(params = {}, defaults) {
  const default_options = defaults.options;
  params = Object.assign(defaults, params);
  params.options = Object.assign(default_options, params.options);
  return params;
}

class Factory {
  constructor(options) {
    L('New factory: ', options);
    const defaults = {
      stave: {
        space: 10
      },
      renderer: {
        context: null,
        elementId: '',
        backend: _renderer.Renderer.Backends.SVG,
        width: 500,
        height: 200,
        background: '#FFF'
      },
      font: {
        face: 'Arial',
        point: 10,
        style: ''
      }
    };
    this.options = defaults;
    this.setOptions(options);
  }

  static newFromElementId(elementId, width = 500, height = 200) {
    return new Factory({
      renderer: {
        elementId,
        width,
        height
      }
    });
  }

  reset() {
    this.renderQ = [];
    this.systems = [];
    this.staves = [];
    this.voices = [];
    this.stave = null; // current stave
  }

  getOptions() {
    return this.options;
  }

  setOptions(options) {
    for (const key of ['stave', 'renderer', 'font']) {
      Object.assign(this.options[key], options[key]);
    }

    if (this.options.renderer.elementId !== null || this.options.renderer.context) {
      this.initRenderer();
    }

    this.reset();
  }

  initRenderer() {
    const {
      elementId,
      backend,
      width,
      height,
      background
    } = this.options.renderer;

    if (elementId === '') {
      throw new X('HTML DOM element not set in Factory');
    }

    this.context = _renderer.Renderer.buildContext(elementId, backend, width, height, background);
  }

  getContext() {
    return this.context;
  }

  setContext(context) {
    this.context = context;
    return this;
  }

  getStave() {
    return this.stave;
  }

  getVoices() {
    return this.voices;
  } // Returns pixels from current stave spacing.


  space(spacing) {
    return this.options.stave.space * spacing;
  }

  Stave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space
      }
    });
    const stave = new _stave.Stave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  TabStave(params) {
    params = setDefaults(params, {
      x: 0,
      y: 0,
      width: this.options.renderer.width - this.space(1),
      options: {
        spacing_between_lines_px: this.options.stave.space * 1.3
      }
    });
    const stave = new _tabstave.TabStave(params.x, params.y, params.width, params.options);
    this.staves.push(stave);
    stave.setContext(this.context);
    this.stave = stave;
    return stave;
  }

  StaveNote(noteStruct) {
    const note = new _stavenote.StaveNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GlyphNote(glyph, noteStruct, options) {
    const note = new _glyphnote.GlyphNote(glyph, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  RepeatNote(type, noteStruct, options) {
    const note = new _repeatnote.RepeatNote(type, noteStruct, options);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GhostNote(noteStruct) {
    const ghostNote = new _ghostnote.GhostNote(noteStruct);
    if (this.stave) ghostNote.setStave(this.stave);
    ghostNote.setContext(this.context);
    this.renderQ.push(ghostNote);
    return ghostNote;
  }

  TextNote(textNoteStruct) {
    const textNote = new _textnote.TextNote(textNoteStruct);
    if (this.stave) textNote.setStave(this.stave);
    textNote.setContext(this.context);
    this.renderQ.push(textNote);
    return textNote;
  }

  BarNote(params) {
    params = setDefaults(params, {
      type: 'single',
      options: {}
    });
    const barNote = new _barnote.BarNote(params.type);
    if (this.stave) barNote.setStave(this.stave);
    barNote.setContext(this.context);
    this.renderQ.push(barNote);
    return barNote;
  }

  ClefNote(params) {
    params = setDefaults(params, {
      type: 'treble',
      options: {
        size: 'default'
      }
    });
    const clefNote = new _clefnote.ClefNote(params.type, params.options.size, params.options.annotation);
    if (this.stave) clefNote.setStave(this.stave);
    clefNote.setContext(this.context);
    this.renderQ.push(clefNote);
    return clefNote;
  }

  TimeSigNote(params) {
    params = setDefaults(params, {
      time: '4/4',
      options: {}
    });
    const timeSigNote = new _timesignote.TimeSigNote(params.time);
    if (this.stave) timeSigNote.setStave(this.stave);
    timeSigNote.setContext(this.context);
    this.renderQ.push(timeSigNote);
    return timeSigNote;
  }

  KeySigNote(params) {
    const keySigNote = new _keysignote.KeySigNote(params.key, params.cancelKey, params.alterKey);
    if (this.stave) keySigNote.setStave(this.stave);
    keySigNote.setContext(this.context);
    this.renderQ.push(keySigNote);
    return keySigNote;
  }

  TabNote(noteStruct) {
    const note = new _tabnote.TabNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    this.renderQ.push(note);
    return note;
  }

  GraceNote(noteStruct) {
    const note = new _gracenote.GraceNote(noteStruct);
    if (this.stave) note.setStave(this.stave);
    note.setContext(this.context);
    return note;
  }

  GraceNoteGroup(params) {
    const group = new _gracenotegroup.GraceNoteGroup(params.notes, params.slur);
    group.setContext(this.context);
    return group;
  }

  Accidental(params) {
    params = setDefaults(params, {
      type: null,
      options: {}
    });
    const accid = new _accidental.Accidental(params.type);
    accid.setContext(this.context);
    return accid;
  }

  Annotation(params) {
    params = setDefaults(params, {
      text: 'p',
      vJustify: 'below',
      hJustify: 'center',
      fontFamily: 'Times',
      fontSize: 14,
      fontWeight: 'bold italic',
      options: {}
    });
    const annotation = new _annotation.Annotation(params.text);
    annotation.setJustification(params.hJustify);
    annotation.setVerticalJustification(params.vJustify);
    annotation.setFont(params.fontFamily, params.fontSize, params.fontWeight);
    annotation.setContext(this.context);
    return annotation;
  }

  Articulation(params) {
    params = setDefaults(params, {
      type: 'a.',
      position: 'above',
      options: {}
    });
    const articulation = new _articulation.Articulation(params.type);
    articulation.setPosition(params.position);
    articulation.setContext(this.context);
    return articulation;
  }

  TextDynamics(params) {
    params = setDefaults(params, {
      text: 'p',
      duration: 'q',
      dots: 0,
      line: 0,
      options: {}
    });
    const text = new _textdynamics.TextDynamics({
      text: params.text,
      line: params.line,
      duration: params.duration,
      dots: params.dots
    });
    if (this.stave) text.setStave(this.stave);
    text.setContext(this.context);
    this.renderQ.push(text);
    return text;
  }

  Fingering(params) {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {}
    });
    const fingering = new _frethandfinger.FretHandFinger(params.number);
    fingering.setPosition(params.position);
    fingering.setContext(this.context);
    return fingering;
  }

  StringNumber(params) {
    params = setDefaults(params, {
      number: '0',
      position: 'left',
      options: {}
    });
    const stringNumber = new _stringnumber.StringNumber(params.number);
    stringNumber.setPosition(params.position);
    stringNumber.setContext(this.context);
    return stringNumber;
  }

  TickContext() {
    return new _tickcontext.TickContext().setContext(this.context);
  }

  ModifierContext() {
    return new _modifiercontext.ModifierContext();
  }

  MultiMeasureRest(params) {
    const multimeasurerest = new _multimeasurerest.MultiMeasureRest(params.number_of_measures, params);
    multimeasurerest.setContext(this.context);
    this.renderQ.push(multimeasurerest);
    return multimeasurerest;
  }

  Voice(params) {
    params = setDefaults(params, {
      time: '4/4',
      options: {}
    });
    const voice = new _voice.Voice(params.time, params.options);
    this.voices.push(voice);
    return voice;
  }

  StaveConnector(params) {
    params = setDefaults(params, {
      top_stave: null,
      bottom_stave: null,
      type: 'double',
      options: {}
    });
    const connector = new _staveconnector.StaveConnector(params.top_stave, params.bottom_stave);
    connector.setType(params.type).setContext(this.context);
    this.renderQ.push(connector);
    return connector;
  }

  Formatter() {
    return new _formatter.Formatter();
  }

  Tuplet(params) {
    params = setDefaults(params, {
      notes: [],
      options: {}
    });
    const tuplet = new _tuplet.Tuplet(params.notes, params.options).setContext(this.context);
    this.renderQ.push(tuplet);
    return tuplet;
  }

  Beam(params) {
    params = setDefaults(params, {
      notes: [],
      options: {
        autoStem: false,
        secondaryBeamBreaks: []
      }
    });
    const beam = new _beam.Beam(params.notes, params.options.autoStem).setContext(this.context);
    beam.breakSecondaryAt(params.options.secondaryBeamBreaks);
    this.renderQ.push(beam);
    return beam;
  }

  Curve(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {}
    });
    const curve = new _curve.Curve(params.from, params.to, params.options).setContext(this.context);
    this.renderQ.push(curve);
    return curve;
  }

  StaveTie(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      text: null,
      options: {
        direction: undefined
      }
    });
    const tie = new _stavetie.StaveTie({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices
    }, params.text);
    if (params.options.direction) tie.setDirection(params.options.direction);
    tie.setContext(this.context);
    this.renderQ.push(tie);
    return tie;
  }

  StaveLine(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      first_indices: [0],
      last_indices: [0],
      options: {}
    });
    const line = new _staveline.StaveLine({
      first_note: params.from,
      last_note: params.to,
      first_indices: params.first_indices,
      last_indices: params.last_indices
    });
    if (params.options.text) line.setText(params.options.text);
    if (params.options.font) line.setFont(params.options.font);
    line.setContext(this.context);
    this.renderQ.push(line);
    return line;
  }

  VibratoBracket(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      options: {
        harsh: false
      }
    });
    const vibratoBracket = new _vibratobracket.VibratoBracket({
      start: params.from,
      stop: params.to
    });
    if (params.options.line) vibratoBracket.setLine(params.options.line);
    if (params.options.harsh) vibratoBracket.setHarsh(params.options.harsh);
    vibratoBracket.setContext(this.context);
    this.renderQ.push(vibratoBracket);
    return vibratoBracket;
  }

  TextBracket(params) {
    params = setDefaults(params, {
      from: null,
      to: null,
      text: '',
      options: {
        superscript: '',
        position: 1
      }
    });
    const textBracket = new _textbracket.TextBracket({
      start: params.from,
      stop: params.to,
      text: params.text,
      superscript: params.options.superscript,
      position: params.options.position
    });
    if (params.options.line) textBracket.setLine(params.options.line);
    if (params.options.font) textBracket.setFont(params.options.font);
    textBracket.setContext(this.context);
    this.renderQ.push(textBracket);
    return textBracket;
  }

  System(params = {}) {
    params.factory = this;
    const system = new _system.System(params).setContext(this.context);
    this.systems.push(system);
    return system;
  }

  EasyScore(params = {}) {
    params.factory = this;
    return new _easyscore.EasyScore(params);
  }

  PedalMarking(params = {}) {
    params = setDefaults(params, {
      notes: [],
      options: {
        style: 'mixed'
      }
    });
    const pedal = new _pedalmarking.PedalMarking(params.notes);
    pedal.setStyle(_pedalmarking.PedalMarking.StylesString[params.options.style]);
    pedal.setContext(this.context);
    this.renderQ.push(pedal);
    return pedal;
  }

  NoteSubGroup(params = {}) {
    params = setDefaults(params, {
      notes: [],
      options: {}
    });
    const group = new _notesubgroup.NoteSubGroup(params.notes);
    group.setContext(this.context);
    return group;
  }

  draw() {
    this.systems.forEach(i => i.setContext(this.context).format());
    this.staves.forEach(i => i.setContext(this.context).draw());
    this.voices.forEach(i => i.setContext(this.context).draw());
    this.renderQ.forEach(i => {
      if (!i.isRendered()) i.setContext(this.context).draw();
    });
    this.systems.forEach(i => i.setContext(this.context).draw());
    this.reset();
  }

}

exports.Factory = Factory;
//# sourceMappingURL=factory.js.map