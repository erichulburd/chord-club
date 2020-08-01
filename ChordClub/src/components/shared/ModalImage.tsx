import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Modal, Button} from '@ui-kitten/components';
import {ResizableImage} from '../../util/imagePicker';
import { ThemedIcon } from '../FontAwesomeIcons';

interface Props {
  visible: boolean;
  image: ResizableImage;
  close: () => void;
}

export const ModalImage = ({image, visible, close}: Props) => {
  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={close}
      >
      <View style={styles.imageContainer}>

        <Image
          resizeMode={'contain'}
          source={{uri: image.uri}}
          style={[image.coverDimensions()]}
        />
        <Button
          style={styles.close}
          size="large"
          status="danger"
          appearance="ghost"
          onPress={close}
          accessoryRight={ThemedIcon('times')}
        ></Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  imageContainer: {
    position: 'relative',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
});
