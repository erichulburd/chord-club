import {
  AudioSet,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {Platform} from 'react-native';
import {v4} from 'react-native-uuid';
import * as rnfs from 'react-native-fs';
import { User } from '../types';

export interface Audioable {
  name?: string | undefined | null;
  creator?: User | undefined | null;
  audioURL: string;
  audioLength: number;
}

export const audioSet: AudioSet = {
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
};

export const makeFileName = () => {
  const uuid = v4();
  return Platform.select({
    ios: `${rnfs.DocumentDirectoryPath}/${uuid}.m4a`,
    android: `${rnfs.DocumentDirectoryPath}/${uuid}.mp4`,
    default: `${rnfs.DocumentDirectoryPath}/${uuid}.m4a`,
  });
};
