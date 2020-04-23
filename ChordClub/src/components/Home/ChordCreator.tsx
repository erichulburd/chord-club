import React, { useState } from 'react';
import { Text, Button } from '@ui-kitten/components';
import { View, Image, Dimensions } from 'react-native';
import { v4 } from 'react-native-uuid';
import { withAuth, AuthConsumerProps } from '../AuthProvider';
import { makeChartNew } from '../../util/forms';
import { ChartTypeBG } from '../shared/ChartTypeBG';
import { ChartType, ChartQuality, Extension, Note } from '../../types';
import { Row } from '../shared/Row';
import { ButtonPallette } from '../shared/ButtonPallette';
import { ExtensionPalletteBG } from '../shared/ExtensionPalletteBG';
import AudioRecorder, { getRecordingPath } from '../AudioRecorder/index';
import { ThemedIcon } from '../FontAwesomeIcons';
import { pickSingleImage, ResizableImage } from '../../util/imagePicker';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ModalImage } from '../shared/ModalImage';


interface ManualProps {
  close: () => void;
}

const WINDOW_WIDTH = Dimensions.get('window').width;

interface Props extends ManualProps, AuthConsumerProps {}

const ChordCreator = ({ close }: Props) => {
  const [newChart, setChart] = useState(makeChartNew('authState.uid'));
  const updateChartType = (ct: ChartType) => setChart({ ...newChart, chartType: ct });
  const updateChartQuality = (q: ChartQuality) => setChart({ ...newChart, quality: q });
  const updateChartRoot = (n: Note) => setChart({ ...newChart, root: n });
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const updateExtensions = (e: Extension) => {
    if (extensions.indexOf(e) < 0) {
      setExtensions([...extensions, e]);
      return;
    }
    extensions.splice(extensions.indexOf(e), 1);
    setExtensions([...extensions]);
  };
  const [audioFilePath, _] = useState<string>(getRecordingPath(v4()));
  const [audioReady, setAudioReady] = useState<boolean>(false);
  const [image, setResizableImage] = useState<ResizableImage | null>(null);
  const [modalImageVisible, setModalImageVisible] = useState<boolean>(false);
  const updateImagePath = async () => {
    const image = await pickSingleImage();
    if (image) await setResizableImage(image);
  };

  return (
    <View>
      <Text>Chord Creator</Text>
      <View>
        <Row>
          <ChartTypeBG chartType={newChart.chartType} onChange={updateChartType} />
        </Row>
        {image &&
          <Row>
            <TouchableHighlight
              onPress={() => setModalImageVisible(true)}
            >
              <Image
                resizeMode="contain"
                style={image.coverDimensions({ height: 200 })}
                source={{ uri: image.uri }}
              />
            </TouchableHighlight>
          </Row>
        }
        <Row>
          <Button
            size="small"
            onPress={updateImagePath}
            accessoryLeft={ThemedIcon('file-image')}
          >Chart</Button>
          <Button
            size="small"
            disabled={image === null}
            status="danger"
            onPress={() => setResizableImage(null)}
          >X</Button>
        </Row>
        <Row>
          <AudioRecorder
            filePath={audioFilePath}
            onRecordingComplete={() => setAudioReady(true)}
          />
        </Row>
        <Row>
          <Text category="label">Chord Quality</Text>
        </Row>
        <Row>
          <ButtonPallette
            options={Object.values(ChartQuality)}
            selected={[newChart.quality]}
            onSelect={updateChartQuality}
          />
        </Row>
        <Row>
          <Text category="label">Root</Text>
        </Row>
        <Row>
          <ButtonPallette
            options={Object.values(Note).sort()}
            selected={[newChart.root]}
            onSelect={updateChartRoot}
          />
        </Row>
        <Row>
          <Text category="label">Extensions</Text>
        </Row>
        <Row>
          <ExtensionPalletteBG
            selected={Array.from(extensions)}
            onExtensionUpdate={updateExtensions}
          />
        </Row>
      </View>
      <Button onPress={close}>Close</Button>
      {image &&
        <ModalImage
          visible={modalImageVisible}
          close={() => setModalImageVisible(false)}
          image={image}
        />
      }
    </View>
  );
};

export default withAuth<ManualProps>(ChordCreator);
