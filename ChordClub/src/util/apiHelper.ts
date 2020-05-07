import {ExtensionType, ExtensionNew} from '../types';

export const extensions: ExtensionNew[] = [
  [9, ExtensionType.Flat],
  [9, ExtensionType.Plain],
  [9, ExtensionType.Sharp],
  [11, ExtensionType.Plain],
  [11, ExtensionType.Sharp],
  [5, ExtensionType.Flat],
  [5, ExtensionType.Sharp],
  [6, ExtensionType.Plain],
  [13, ExtensionType.Flat],
  [13, ExtensionType.Plain],
  [7, ExtensionType.Flat],
  [7, ExtensionType.Plain],
].map(
  ([degree, extensionType]) =>
    ({
      degree,
      extensionType,
    } as ExtensionNew),
);
