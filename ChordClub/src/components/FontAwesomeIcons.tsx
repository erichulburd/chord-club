import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageProps } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { IconProps, Icon } from '@ui-kitten/components';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export const FontAwesome5IconsPack = {
  name: 'fontAwesome5',
  icons: createIconsMap(),
};

function createIconsMap() {
  return new Proxy({}, {
    get(_target, name: string) {
      return IconProvider(name);
    },
  });
}

interface FontAwesome5Props extends ViewStyle, TextStyle {
  height: number;
  tintColor: string;
}

const IconProvider = (name: string) => ({
  toReactElement: (props: IconProps) => FontAwesomeIcon({ name, ...props }),
});

interface Props {
  name: string;
  style: StyleProp<FontAwesome5Props>;
}

function FontAwesomeIcon({ name, style }: Props) {
  const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
  return (
    <FontAwesome5 name={name} size={height} color={tintColor} style={iconStyle} />
  );
}

export const ThemedIcon = (name: string) =>
(props: Partial<ImageProps> = {}) => (
  <Icon {...props} name={name} />
);
