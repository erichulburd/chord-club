
const strings: { [key: string]: string } = {
  PLAY: 'Play',
  PAUSE: 'Pause',
  STOP: 'Stop',
  RECORD: 'Record',
};

export const getString = (str: string) => {
  return strings[str];
};
