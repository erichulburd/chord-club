import React from 'react';
import { StyleSheet } from 'react-native';
import FontAwesome5, { FontAwesome5IconProps } from 'react-native-vector-icons/FontAwesome5';
import { IconProps, Icon } from '@ui-kitten/components';

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

const IconProvider = (name: string) => ({
  toReactElement: (props: IconProps) => FontAwesomeIcon({ name, ...props }),
});


function FontAwesomeIcon({ name, style, ...props }: IconProps & FontAwesome5IconProps) {
  const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
  return (
    <FontAwesome5 {...props} name={name} size={height} color={tintColor} style={iconStyle} />
  );
}

export const ThemedIcon = (name: string) =>
(props: Partial<IconProps & FontAwesome5IconProps> = {}) => (
  <Icon {...props} name={name} />
);
