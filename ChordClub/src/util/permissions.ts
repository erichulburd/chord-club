import {PermissionsAndroid, Platform} from 'react-native';

export const getRecordingPermissions = async () => {
  if (Platform.OS === 'android') {
    return getRecordPermissionsAndroid();
  }
  return true;
};

const getRecordPermissionsAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Record access',
        message: 'Give permission to use your mic for recording',
        buttonPositive: 'ok',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('permission denied');
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
  return true;
};
