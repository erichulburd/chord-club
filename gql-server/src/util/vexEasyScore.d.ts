import { DOMWindow } from 'jsdom';

declare module './vexEasyScore' {
  export interface Voice {
    notes: string;
    options?: {
      stem: 'up' | 'down',
    };
  }

  export interface Stave {
    cleff: 'treble' | 'bass';
    timeSignature?: string;
    voices: Voice[];
  }

  export interface Score {
    staves: Stave[];
  }

  export function drawScore(score: Score): string;
}
