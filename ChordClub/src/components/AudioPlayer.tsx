import React, {useContext, useEffect} from 'react';
import {Audioable} from '../util/audio';
import {AudioContext} from './AudioContextProvider';
import {AudioPlayerInactive} from './AudioPlayerInactive';
import {AudioPlayerActive} from './AudioPlayerActive';
import {AudioAction} from './AudioControls';
import { View } from 'react-native';
import { Text } from '@ui-kitten/components';

interface Props {
  displayAudioNameAndCreator?: boolean;
  audio: Audioable;
  extraActions?: AudioAction[];
}

export const AudioPlayer = ({
  audio, extraActions,
  displayAudioNameAndCreator=false,
}: Props) => {
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
    return (
      <>
        {displayAudioNameAndCreator && <DisplayAudio audio={audio} />}
        <AudioPlayerInactive audio={audio} extraActions={extraActions} />
      </>
    );
  }
  return (
    <>
      {displayAudioNameAndCreator && <DisplayAudio audio={audio} />}
      <AudioPlayerActive extraActions={extraActions} />
    </>
  );
};

const DisplayAudio = ({audio}: {audio: Audioable}) => {
  const parts: string[] = [];
  if (audio.creator?.username) {
    parts.push(audio.creator.username);
  }
  if (audio.name) {
    parts.push(audio.name);
  }
  if (parts.length === 0) {
    return null;
  }
  return (
    <View>
      <Text>{parts.join(' - ')}</Text>
    </View>
  );
}
