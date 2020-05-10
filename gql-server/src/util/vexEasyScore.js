const { Flow }= require('./vexflow').default;
const {JSDOM} = require('jsdom');
const { v4 } = require('uuid');
const last = require('lodash/last');
const { vexFlowRenderingError } = require('./errors');

const targetID = 'target';
const html = `<!DOCTYPE html><html><body><div id="${targetID}"></div></body></html>`;

const dom = new JSDOM(html);
const parent = dom.window.document.getElementById(targetID);

globalThis.window = dom.window;
globalThis.document = dom.window.document;

const drawScore = (score, width, ) => {
  const div = document.createElement('DIV');
  const divID = 'id_' + v4().replace(/-/g, '');
  div.setAttribute('id', divID);
  div.setAttribute('width', 300);
  div.setAttribute('height', 300);

  parent.appendChild(div);
  div = document.getElementById(divID);
  if (div === null) {
    throw vexFlowRenderingError('DIV not found on DOM')
  }
  try {
    const renderer = new Flow.Renderer(div, Flow.Renderer.Backends.SVG);
    renderer.resize(300, 500)

    var vf = new Flow.Factory({ renderer });
    const easyScore = vf.EasyScore();
    const system = vf.System();

    score.staves.forEach((stave) => {
      system.addStave({
        voices: stave.voices.map((voice) => easyScore.voice(
          easyScore.notes(voice.notes, voice.options || {}),
        )),
      }).addClef(stave.clef)
    });

    if (score.staves.length > 1) {
      system.addConnector();
    }

    vf.draw();
    const svgs = document.querySelectorAll(`#${divID} svg`);
    if (svgs.length < 1) {
      throw vexFlowRenderingError('SVG not found in DIV.')
    }
    const svg = last(Object.values(svgs))
    return svg.outerHTML;
  } finally {
    parent.removeChild(div);
  }
};

module.exports = { drawScore };
