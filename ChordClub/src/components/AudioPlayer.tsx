import React, { useContext, useEffect } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContextProvider';
import { AudioPlayerInactive } from './AudioPlayerInactive';
import { AudioPlayerActive } from './AudioPlayerActive';
import { useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { styles } from './audioPlayerStyles';

interface Props {
  audio: Audioable;
}

export const AudioPlayer = ({ audio }: Props) => {
  const audioCtx = useContext(AudioContext);
  const isPlaying = audioCtx.focusedAudioURL === audio.audioURL;

  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioCtx.stopPlay();
      }
    }
  });

  if (!isPlaying) {
    return (
      <AudioPlayerInactive
        audio={audio}
      />
    );
  }
  return (
    <AudioPlayerActive />
  );
}
