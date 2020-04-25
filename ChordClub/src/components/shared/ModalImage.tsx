import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Modal } from '@ui-kitten/components';
import { ResizableImage } from '../../util/imagePicker';

interface Props {
  visible: boolean;
  image: ResizableImage;
  close: () => void;
}

export const ModalImage = ({ image, visible, close }: Props) => {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={close}>
      <View>
        <Image
          resizeMode={'contain'}
          source={{ uri: image.uri }}
          style={[image.coverDimensions()]}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
