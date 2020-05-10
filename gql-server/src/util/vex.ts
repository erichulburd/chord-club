import { drawScore, Score, Stave } from './vexEasyScore';

export const makeSVG = async (score: Score, ) => {
  return drawScore(score);
}

export const voicingToVex = (bassNotes: string, trebleNotes: string): Score => {
  const staves: Stave[] = [
    { voices: [{ notes: trebleNotes}], cleff: 'treble' },
    { voices: [{ notes: bassNotes}], cleff: 'bass' },
  ];
  return { staves };
}
