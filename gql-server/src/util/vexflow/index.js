"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vex = require("./vex");

var _tables = require("./tables");

var _element = require("./element");

var _fraction = require("./fraction");

var _renderer = require("./renderer");

var _formatter = require("./formatter");

var _music = require("./music");

var _glyph = require("./glyph");

var _stave = require("./stave");

var _stavenote = require("./stavenote");

var _stavemodifier = require("./stavemodifier");

var _stavetempo = require("./stavetempo");

var _voice = require("./voice");

var _accidental = require("./accidental");

var _beam = require("./beam");

var _stavetie = require("./stavetie");

var _tabstave = require("./tabstave");

var _tabnote = require("./tabnote");

var _bend = require("./bend");

var _vibrato = require("./vibrato");

var _vibratobracket = require("./vibratobracket");

var _note = require("./note");

var _modifiercontext = require("./modifiercontext");

var _multimeasurerest = require("./multimeasurerest");

var _tickcontext = require("./tickcontext");

var _articulation = require("./articulation");

var _annotation = require("./annotation");

var _stavebarline = require("./stavebarline");

var _notehead = require("./notehead");

var _staveconnector = require("./staveconnector");

var _clefnote = require("./clefnote");

var _keysignature = require("./keysignature");

var _keysignote = require("./keysignote");

var _timesignature = require("./timesignature");

var _timesignote = require("./timesignote");

var _stem = require("./stem");

var _tabtie = require("./tabtie");

var _clef = require("./clef");

var _dot = require("./dot");

var _modifier = require("./modifier");

var _tabslide = require("./tabslide");

var _tuplet = require("./tuplet");

var _gracenote = require("./gracenote");

var _gracetabnote = require("./gracetabnote");

var _tuning = require("./tuning");

var _keymanager = require("./keymanager");

var _stavehairpin = require("./stavehairpin");

var _boundingbox = require("./boundingbox");

var _strokes = require("./strokes");

var _textnote = require("./textnote");

var _curve = require("./curve");

var _textdynamics = require("./textdynamics");

var _staveline = require("./staveline");

var _ornament = require("./ornament");

var _pedalmarking = require("./pedalmarking");

var _textbracket = require("./textbracket");

var _frethandfinger = require("./frethandfinger");

var _staverepetition = require("./staverepetition");

var _barnote = require("./barnote");

var _ghostnote = require("./ghostnote");

var _notesubgroup = require("./notesubgroup");

var _gracenotegroup = require("./gracenotegroup");

var _tremolo = require("./tremolo");

var _stringnumber = require("./stringnumber");

var _crescendo = require("./crescendo");

var _stavevolta = require("./stavevolta");

var _system = require("./system");

var _factory = require("./factory");

var _parser = require("./parser");

var _easyscore = require("./easyscore");

var _registry = require("./registry");

var _stavetext = require("./stavetext");

var _glyphnote = require("./glyphnote");

var _repeatnote = require("./repeatnote");

var _smufl = require("./smufl");

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
_vex.Vex.Flow = _tables.Flow;
_vex.Vex.Flow.Element = _element.Element;
_vex.Vex.Flow.Fraction = _fraction.Fraction;
_vex.Vex.Flow.Renderer = _renderer.Renderer;
_vex.Vex.Flow.Formatter = _formatter.Formatter;
_vex.Vex.Flow.Music = _music.Music;
_vex.Vex.Flow.Glyph = _glyph.Glyph;
_vex.Vex.Flow.Stave = _stave.Stave;
_vex.Vex.Flow.StaveNote = _stavenote.StaveNote;
_vex.Vex.Flow.StaveModifier = _stavemodifier.StaveModifier;
_vex.Vex.Flow.StaveTempo = _stavetempo.StaveTempo;
_vex.Vex.Flow.Voice = _voice.Voice;
_vex.Vex.Flow.Accidental = _accidental.Accidental;
_vex.Vex.Flow.Beam = _beam.Beam;
_vex.Vex.Flow.StaveTie = _stavetie.StaveTie;
_vex.Vex.Flow.TabStave = _tabstave.TabStave;
_vex.Vex.Flow.TabNote = _tabnote.TabNote;
_vex.Vex.Flow.Bend = _bend.Bend;
_vex.Vex.Flow.Vibrato = _vibrato.Vibrato;
_vex.Vex.Flow.VibratoBracket = _vibratobracket.VibratoBracket;
_vex.Vex.Flow.Note = _note.Note;
_vex.Vex.Flow.ModifierContext = _modifiercontext.ModifierContext;
_vex.Vex.Flow.MultiMeasureRest = _multimeasurerest.MultiMeasureRest;
_vex.Vex.Flow.TickContext = _tickcontext.TickContext;
_vex.Vex.Flow.Articulation = _articulation.Articulation;
_vex.Vex.Flow.Annotation = _annotation.Annotation;
_vex.Vex.Flow.Barline = _stavebarline.Barline;
_vex.Vex.Flow.NoteHead = _notehead.NoteHead;
_vex.Vex.Flow.StaveConnector = _staveconnector.StaveConnector;
_vex.Vex.Flow.ClefNote = _clefnote.ClefNote;
_vex.Vex.Flow.KeySignature = _keysignature.KeySignature;
_vex.Vex.Flow.KeySigNote = _keysignote.KeySigNote;
_vex.Vex.Flow.TimeSignature = _timesignature.TimeSignature;
_vex.Vex.Flow.TimeSigNote = _timesignote.TimeSigNote;
_vex.Vex.Flow.Stem = _stem.Stem;
_vex.Vex.Flow.TabTie = _tabtie.TabTie;
_vex.Vex.Flow.Clef = _clef.Clef;
_vex.Vex.Flow.Dot = _dot.Dot;
_vex.Vex.Flow.Modifier = _modifier.Modifier;
_vex.Vex.Flow.TabSlide = _tabslide.TabSlide;
_vex.Vex.Flow.Tuplet = _tuplet.Tuplet;
_vex.Vex.Flow.GraceNote = _gracenote.GraceNote;
_vex.Vex.Flow.GraceTabNote = _gracetabnote.GraceTabNote;
_vex.Vex.Flow.Tuning = _tuning.Tuning;
_vex.Vex.Flow.KeyManager = _keymanager.KeyManager;
_vex.Vex.Flow.StaveHairpin = _stavehairpin.StaveHairpin;
_vex.Vex.Flow.BoundingBox = _boundingbox.BoundingBox;
_vex.Vex.Flow.Stroke = _strokes.Stroke;
_vex.Vex.Flow.TextNote = _textnote.TextNote;
_vex.Vex.Flow.Curve = _curve.Curve;
_vex.Vex.Flow.TextDynamics = _textdynamics.TextDynamics;
_vex.Vex.Flow.StaveLine = _staveline.StaveLine;
_vex.Vex.Flow.Ornament = _ornament.Ornament;
_vex.Vex.Flow.PedalMarking = _pedalmarking.PedalMarking;
_vex.Vex.Flow.TextBracket = _textbracket.TextBracket;
_vex.Vex.Flow.FretHandFinger = _frethandfinger.FretHandFinger;
_vex.Vex.Flow.Repetition = _staverepetition.Repetition;
_vex.Vex.Flow.BarNote = _barnote.BarNote;
_vex.Vex.Flow.GhostNote = _ghostnote.GhostNote;
_vex.Vex.Flow.NoteSubGroup = _notesubgroup.NoteSubGroup;
_vex.Vex.Flow.GraceNoteGroup = _gracenotegroup.GraceNoteGroup;
_vex.Vex.Flow.Tremolo = _tremolo.Tremolo;
_vex.Vex.Flow.StringNumber = _stringnumber.StringNumber;
_vex.Vex.Flow.Crescendo = _crescendo.Crescendo;
_vex.Vex.Flow.Volta = _stavevolta.Volta;
_vex.Vex.Flow.System = _system.System;
_vex.Vex.Flow.Factory = _factory.Factory;
_vex.Vex.Flow.Parser = _parser.Parser;
_vex.Vex.Flow.EasyScore = _easyscore.EasyScore;
_vex.Vex.Flow.Registry = _registry.Registry;
_vex.Vex.Flow.StaveText = _stavetext.StaveText;
_vex.Vex.Flow.GlyphNote = _glyphnote.GlyphNote;
_vex.Vex.Flow.RepeatNote = _repeatnote.RepeatNote;
_vex.Vex.Flow.Font = _smufl.Font;
_vex.Vex.Flow.Fonts = _smufl.Fonts;
_vex.Vex.Flow.DefaultFontStack = _smufl.DefaultFontStack;
exports.default = _vex.Vex;
//# sourceMappingURL=index.js.map