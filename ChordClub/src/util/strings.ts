import {ExtensionType, Extension, Note} from '../types';

const displayExtentionType = (et: ExtensionType) => {
  switch (et) {
    case ExtensionType.Flat:
      return 'b';
    case ExtensionType.Sharp:
      return '#';
    default:
      return '';
  }
};

export const displayExtension = (e: Extension) =>
  `${displayExtentionType(e.extensionType)}${e.degree}`;

export const displayNote = (n: Note) => n.toString().replace('s', '#');
