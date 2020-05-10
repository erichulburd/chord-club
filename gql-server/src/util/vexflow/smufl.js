"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Font = exports.DefaultFontStack = exports.Fonts = undefined;

var _vex = require("./vex");

var _bravura_glyphs = require("./fonts/bravura_glyphs");

var _bravura_metrics = require("./fonts/bravura_metrics");

var _gonville_glyphs = require("./fonts/gonville_glyphs");

var _gonville_metrics = require("./fonts/gonville_metrics");

var _petaluma_glyphs = require("./fonts/petaluma_glyphs");

var _petaluma_metrics = require("./fonts/petaluma_metrics");

var _custom_glyphs = require("./fonts/custom_glyphs");

var _custom_metrics = require("./fonts/custom_metrics");

class Font {
  constructor(name, metrics, fontData) {
    this.name = name;
    this.metrics = metrics;
    this.fontData = fontData;
    this.codePoints = {};
  }

  getName() {
    return this.name;
  }

  getResolution() {
    return this.fontData.resolution;
  }

  getMetrics() {
    return this.metrics;
  }

  lookupMetric(key, defaultValue = undefined) {
    const parts = key.split('.');
    let val = this.metrics; // console.log('lookupMetric:', key);

    for (let i = 0; i < parts.length; i++) {
      if (val[parts[i]] === undefined) {
        if (defaultValue !== undefined) {
          return defaultValue;
        } else {
          throw new _vex.Vex.RERR('INVALID_KEY', `Invalid music font metric key: ${key}`);
        }
      }

      val = val[parts[i]];
    } // console.log('found:', key, val);


    return val;
  }

  getFontData() {
    return this.fontData;
  }

  getGlyphs() {
    return this.fontData.glyphs;
  }

  getCodePoints() {
    return this.codePoints;
  }

  setCodePoints(codePoints) {
    this.codePoints = codePoints;
    return this;
  }

}

const Fonts = {
  Bravura: new Font('Bravura', _bravura_metrics.BravuraMetrics, _bravura_glyphs.BravuraFont),
  Gonville: new Font('Gonville', _gonville_metrics.GonvilleMetrics, _gonville_glyphs.GonvilleFont),
  Petaluma: new Font('Petaluma', _petaluma_metrics.PetalumaMetrics, _petaluma_glyphs.PetalumaFont),
  Custom: new Font('Custom', _custom_metrics.CustomMetrics, _custom_glyphs.CustomFont)
};
const DefaultFontStack = [Fonts.Bravura, Fonts.Gonville, Fonts.Custom];
exports.Fonts = Fonts;
exports.DefaultFontStack = DefaultFontStack;
exports.Font = Font;
//# sourceMappingURL=smufl.js.map