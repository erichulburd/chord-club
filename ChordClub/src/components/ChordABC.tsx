import React, { useState, createElement } from 'react';
import { Input } from '@ui-kitten/components';
import { Keyboard } from './Keyboard';
import { StyleSheet, ImageProps, View } from 'react-native';
import { Note } from '../types';
import { displayNote } from '../util/strings';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { ThemedIcon } from './FontAwesomeIcons';
import throttle from 'lodash/throttle';
import { SvgXml } from 'react-native-svg';
import { parseNotesToScore, cleanNotes } from '../util/voicing';
import { vexflow } from '../util/api';
import { Row } from './shared/Row';

interface Props {
  abc: string;
  updateABC: (abc: string) => void;
}

export const ChordABC = ({
  abc, updateABC,
}: Props) => {
  const [sharpFlat, setSharpFlat] = useState<'sharp' | 'flat'>('sharp')
  const [throttleVex, setThrottleVex] = useState(() => {
    return throttle(async (notes: string) => {
      const score = parseNotesToScore(notes);
      if (score) {
        console.info('SCORE', JSON.stringify(score, null, 2));
        const resultSVG = await vexflow(score);
        setSVG(resultSVG);
      }
    }, 1000);
  });
  const addNote = (n: Note, octave: number) => {
    let update = abc.trim();
    const note = displayNote(n) + octave.toString();
    if (update.split(' ').includes(note)) {
      return;
    }
    const notes = cleanNotes(`${update} ${note}`);
    updateABC(notes);
    throttleVex(notes);
  };
  const [svg, setSVG] = useState<string | undefined>(undefined);

  const ClearABCAccessory = (props: Partial<ImageProps> = {}) => (
    <TouchableWithoutFeedback onPress={() => updateABC('')}>
      {createElement(ThemedIcon('times'), props)}
    </TouchableWithoutFeedback>
  );
  const cleanABC = () => {
    const notes = cleanNotes(abc);
    updateABC(notes);
    throttleVex(notes);
  };
  // console.info('svg', svg);
  return (
    <>
      {svg &&
        <View style={{ backgroundColor: 'white' }}>
          <SvgXml xml={svg} />
        </View>
      }
      <Row>
        <Keyboard
          sharpFlat={'sharp'}
          onKeyPress={addNote}
        />
      </Row>
      <Row style={{flexDirection: 'column', alignSelf: 'stretch'}}>
        <Input
          textStyle={styles.input}
          placeholder="Voicing"
          value={abc}
          onChangeText={updateABC}
          onBlur={cleanABC}
          accessoryRight={ClearABCAccessory}
        />
      </Row>
    </>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tabBar: {height: 50},
  input: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
});
