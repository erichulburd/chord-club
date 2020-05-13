import React, { useContext, useEffect } from 'react';
import { Audioable } from '../util/audio';
import { AudioContext } from './AudioContexts';
import { AudioPlayerInactive } from './AudioPlayerInactive';
import { AudioPlayerActive } from './AudioPlayerActive';
import { useRoute } from '@react-navigation/native';

interface Props {
  audio: Audioable;
}

export const AudioPlayer = ({ audio }: Props) => {
  const audioCtx = useContext(AudioContext);
  const isPlaying = audioCtx.focusedAudioURL === audio.audioURL;
  /*
  useEffect(() => {
    if (!onScreen && isPlaying) {
      audioCtx.stop();
    }
  }, [onScreen]);
  */
  const route = useRoute();
  useEffect(() => {
    if (isPlaying) {
      audioCtx.stop();
    }
  }, [route.key]);
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
