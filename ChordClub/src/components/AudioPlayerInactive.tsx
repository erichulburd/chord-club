import React, { useContext } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContexts';
import { Button } from '@ui-kitten/components';
import { View } from 'react-native';
import { ThemedIcon } from './FontAwesomeIcons';

interface Props {
  audio: Audioable;
}

export const AudioPlayerInactive = ({
  audio,
}: Props) => {
  const audioCtx = useContext(AudioContext);
  return (
    <View>
      <Button
        accessoryLeft={ThemedIcon('play-circle')}
        onPress={() => audioCtx.play(audio)}
      />
    </View>
  );
};
