import React from 'react';
import { View, Image, Dimensions, StyleSheet } from 'react-native';

interface Props {
  imageFilePath: string;
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  }
})

export const LightboxImage = ({ imageFilePath }: Props) => (
  <View>
    <LightBox
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Image
        resizeMode="contain"
        style={{ flex: 1, width: '100%' }}
        source={{ uri: imageFilePath }}
      />
    </LightBox>
  </View>

)
