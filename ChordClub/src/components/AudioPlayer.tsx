import React, {useContext, useEffect} from 'react';
import {Audioable} from '../util/audio';
import {AudioContext} from './AudioContextProvider';
import {AudioPlayerInactive} from './AudioPlayerInactive';
import {AudioPlayerActive} from './AudioPlayerActive';
import {AudioAction} from './AudioControls';

interface Props {
  audio: Audioable;
  extraActions?: AudioAction[];
}

export const AudioPlayer = ({audio, extraActions}: Props) => {
  const audioCtx = useContext(AudioContext);
  const isPlaying = audioCtx.focusedAudioURL === audio.audioURL;

  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioCtx.stopPlay();
      }
    };
  });

  if (!isPlaying) {
    return <AudioPlayerInactive audio={audio} extraActions={extraActions} />;
  }
  return <AudioPlayerActive extraActions={extraActions} />;
};
