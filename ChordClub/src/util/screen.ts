
import { Dimensions } from 'react-native';

export const getCalRatio = () => {
  const { width, height } = Dimensions.get('window');
  let calRatio = width <= height ? 16 * (width / height) : 16 * (height / width);
  if (width <= height) {
    if (calRatio < 9) {
      calRatio = width / 9;
    } else {
      calRatio = height / 18;
    }
  } else {
    if (calRatio < 9) {
      calRatio = height / 9;
    } else {
      calRatio = width / 18;
    }
  }

  return {
    width, height, ratio: calRatio / (360 / 9),
  };
};
