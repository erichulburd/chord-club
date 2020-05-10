import { Note } from "../types";

export const naturals = [Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B];
export const flatNotes = [undefined, Note.Db, Note.Eb, undefined, Note.Gb, Note.Ab, Note.Bb];
export const sharpNotes = [Note.Cs, Note.Ds, undefined, Note.Fs, Note.Gs, Note.As, undefined];

export type SharpFlat = 'sharp' | 'flat';

const naturalsAndFlats = [
  Note.C, Note.Db, Note.D, Note.Eb, Note.E, Note.F,
  Note.Gb, Note.G, Note.Ab, Note.A, Note.Bb, Note.B,
];

const naturalsAndSharps = [
  Note.C, Note.Cs, Note.D, Note.Ds, Note.E, Note.F,
  Note.Fs, Note.G, Note.Gs, Note.A, Note.As, Note.B,
];

const displayNoteRegex = /^([A-z])(s|#|b)?(\d)?$/i;

export const parseDisplayNote = (n: string): [number | undefined, number | undefined, string] | undefined => {
  const match = n.match(displayNoteRegex);
  if (match === null) {
    return;
  }
  let noteS = match[1].toUpperCase();
  let display = noteS;
  const quality = match[2] || '';
  const octave = match[3] ? parseInt(match[3], 10) : undefined;
  let noteIndex = -1;
  if (quality === '#' || quality === 's') {
    noteS += 's';
    noteIndex = naturalsAndSharps.findIndex((naturalOrSharp) => naturalOrSharp === noteS);
    display += '#';
  } else if (quality === 'b') {
    noteS += 'b'
    noteIndex = naturalsAndFlats.findIndex((naturalOrFlat) => naturalOrFlat === noteS);
    display += 'b';
  } else {
    noteIndex = naturalsAndSharps.findIndex((natural) => natural === noteS);
  }
  if (octave !== undefined) display += octave.toString();
  return [noteIndex, octave, display]
}

export const sharpRegex = /(#|s)/;
export const flatRegex = /b/;

export type Voicing = number[];

const middleC = 3 + 12 * 3;


const getNotesAndIndices = (notes: string) => {
  const notesA = notes.split(' ').map(n => n.trim());
  let lastOctave: number | undefined = undefined;
  const notesAndIndices: [string, number][] = [];
  for (let i=0; i<notesA.length; i++) {
    const data = parseDisplayNote(notesA[i]);
    if (data === undefined || data[0] === undefined) {
      continue;
    }
    let [noteIndex, octave, display] = data;
    if (octave === undefined && lastOctave === undefined) {
      octave = 4;
      lastOctave = octave;
      display += octave.toString();
    } else if (octave === undefined) {
      octave = lastOctave as number;
      display += octave.toString();
    } else {
      lastOctave = octave;
    }
    const keyboardIndex = (octave - 1) * 12 + (noteIndex + 3);
    notesAndIndices.push([display, keyboardIndex]);
  }
  notesAndIndices.sort((a, b) => a[1] - b[1]);
  console.info('notesAndIndices', notesAndIndices)
  return notesAndIndices;
};

export const cleanNotes = (notes: string): string => {
  const notesAndIndices = getNotesAndIndices(notes);
  return notesAndIndices.map(([display, _]) => display).join(' ');
}

export const parseNotesToScore = (notes: string): Score | undefined => {
  const notesAndIndices = getNotesAndIndices(notes);

  console.info('notes and indices', notesAndIndices);
  const staves: Stave[] = [];

  const trebleData = notesAndIndices.filter(d => d[1] >= middleC);
  if (trebleData.length > 0) {
    const trebleNotes = trebleData.map((d) => d[0]).join(' ');
    staves.push({ voices: [{ notes: `(${trebleNotes})/w`}], clef: 'treble' });
  }
  const bassData = notesAndIndices.filter(d => d[1] < middleC);
  if (bassData.length > 0) {
    const bassNotes = bassData.map((d) => d[0]).join(' ');
    staves.push({ voices: [{
      notes: `(${bassNotes})/w`,
      options: {clef: 'bass'}
    }], clef: 'bass' });
  }
  if (staves.length === 0) {
    return undefined;
  }
  return { staves };
}

interface VoiceOptions {
  stem?: 'up' | 'down';
  clef?: 'bass' | 'treble';
}

export interface Voice {
  notes: string;
  options?: VoiceOptions;
}

export interface Stave {
  clef: 'treble' | 'bass';
  timeSignature?: string;
  voices: Voice[];
}

export interface Score {
  staves: Stave[];
}
