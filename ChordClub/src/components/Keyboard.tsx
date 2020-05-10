import React from 'react';
import { Note } from '../types';
import { StyleSheet, View } from 'react-native';
import range from 'lodash/range';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { Text } from '@ui-kitten/components';

interface OctaveProps {
  from?: number;
  to?: number;
  sharpFlat: 'sharp' | 'flat';
  octave: number;
  onKeyPress: (n: Note, octave: number) => void;
}

export const Octave = ({
  from = 0,
  to = 7,
  sharpFlat,
  octave,
  onKeyPress,
}: OctaveProps) => {
  const onBlackKeyPress = (i: number) => {
    const note = getBlackKeyNote(i, sharpFlat);
    if (note !== undefined) {
      onKeyPress(note, octave)
    }
  }
  return (
    <View>
      <View style={styles.keys}>
        {range(from, to).map((i) => (
          <View
            key={i}
            style={{ position: 'relative' }}
          >
            {i===0 &&
              <View style={styles.octaveLabel}>
                <Text category="label" style={styles.octaveLabelText}>{`C${octave}`}</Text>
              </View>
            }
            <TouchableOpacity
              style={{ minWidth: 50, height: 100 }}
              onPress={() => onKeyPress(getWhiteKeyNote(i), octave)}
            >
              <View style={styles.whiteKey} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.blackKeys}>
          {range(from, to - 1).map((i) => (
            <TouchableOpacity
              style={{ minWidth: 34, height: 50 }}
              key={i}
              onPress={() => onBlackKeyPress(i)}
            >
              <View style={getBlackKeyStyles(i)} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const notes = [Note.C, Note.D, Note.E, Note.F, Note.G, Note.A, Note.B];
const flatNotes = [undefined, Note.Db, Note.Eb, undefined, Note.Gb, Note.Ab, Note.Bb];
const sharpNotes = [Note.Cs, Note.Ds, undefined, Note.Fs, Note.Gs, Note.As, undefined];
const getWhiteKeyNote = (i: number) => {
  return notes[i];
};
const getBlackKeyNote = (i: number, sharpFlat: 'sharp' | 'flat') => {
  if (sharpFlat === 'sharp') {
    return sharpNotes[i]
  }
  return flatNotes[i];
};

const getBlackKeyStyles = (i: number) => {
  if (i === 2) {
    return [styles.blackKey, styles.hiddenKey];
  }
  return [styles.blackKey];
}

interface Props {
  sharpFlat: 'sharp' | 'flat';
  onKeyPress: (n: Note, octave: number) => void;

}

export const Keyboard = ({
  sharpFlat,
  onKeyPress
}: Props) => {
  return (
    <ScrollView
      horizontal
      contentOffset={{ x: 1000, y: 0 }}
    >
      <Octave
        octave={0}
        from={5}
        sharpFlat={sharpFlat}
        onKeyPress={onKeyPress}
      />
      {range(7).map(i => (
        <Octave
          key={i}
          octave={i+1}
          sharpFlat={sharpFlat}
          onKeyPress={onKeyPress}
        />
      ))}
      <Octave
        octave={8}
        from={0}
        to={1}
        sharpFlat={sharpFlat}
        onKeyPress={onKeyPress}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  keys: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 100,
  },
  whiteKeys: {

  },
  whiteKey: {
    height: 100,
    minWidth: 49,
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginLeft: 1,
  },
  blackKey: {
    minWidth: 34,
    height: 50,
    backgroundColor: 'black',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginRight: 2 * (25 - 34 / 2),
  },
  hiddenKey: {
    height: 0,
  },
  blackKeys: {
    marginLeft: 25 + (25 - 34 / 2),
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
  },
  octaveLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    marginLeft: 1,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 49 - (34 / 2),
    zIndex: 1,
  },
  octaveLabelText: {
    color: 'black',
  }
})
