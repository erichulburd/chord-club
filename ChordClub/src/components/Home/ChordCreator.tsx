import React, { useState } from 'react';
import { Text, Button, BottomNavigation, BottomNavigationTab, Input, TopNavigation, TabBar, Tab } from '@ui-kitten/components';
import { View, Image, StyleSheet } from 'react-native';
import { v4 } from 'react-native-uuid';
import { TouchableHighlight, ScrollView } from 'react-native-gesture-handler';
import { withAuth, AuthConsumerProps } from '../AuthProvider';
import { makeChartNew } from '../../util/forms';
import { ChartTypeBG } from '../shared/ChartTypeBG';
import { ChartType, ChartQuality, Extension, Note } from '../../types';
import { Row } from '../shared/Row';
import { ExtensionPalletteBG } from '../shared/ExtensionPalletteBG';
import AudioRecorder, { getRecordingPath } from '../AudioRecorder/index';
import { ThemedIcon } from '../FontAwesomeIcons';
import { pickSingleImage, ResizableImage } from '../../util/imagePicker';
import { ModalImage } from '../shared/ModalImage';
import { NoteAutocomplete } from '../shared/NoteAutocomplete';
import { ChartQualityAutocomplete } from '../shared/ChartQualityAutocomplete';


interface ManualProps {
  close: () => void;
}

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
    <View style={styles.container}>
      <TabBar
        style={styles.tabBar}
        selectedIndex={newChart.chartType === ChartType.Chord ? 0 : 1}
        onSelect={index => updateChartType(index === 0 ? ChartType.Chord : ChartType.Progression)}
      >
        <Tab title='CHORD'/>
        <Tab title='PROGRESSION'/>
      </TabBar>
      <ScrollView style={{ height: '80%' }}>
        <Row>
          <AudioRecorder
            filePath={audioFilePath}
            onRecordingComplete={() => setAudioReady(true)}
          />
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
            appearance="outline"
            status={image ? 'danger' : 'primary'}
            onPress={image ? () => setResizableImage(null) : updateImagePath}
            accessoryLeft={image ? ThemedIcon('times') : ThemedIcon('file-image')}
          >{image ? 'Remove' : 'Upload Chart'}</Button>
        </Row>
        {newChart.chartType === ChartType.Chord &&
          <>
            <Row style={{ flexDirection: 'column', alignItems: 'stretch'}}>
              <Row>
                <View
                  style={styles.chordTone}
                >
                  <NoteAutocomplete
                    placeholder={'Tone'}
                    onSelect={updateChartRoot}
                  />
                </View>
                <View
                  style={styles.chordQuality}
                >
                  <ChartQualityAutocomplete
                    placeholder={'Quality'}
                    onSelect={cq => setChart({ ...newChart, quality: cq })}
                  />
                </View>
              </Row>
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
          </>
        }
        <Row style={{ flexDirection: 'column', alignSelf: 'stretch' }}>
          <Input
            multiline
            textStyle={styles.input}
            placeholder='Description'
            value={newChart.notes || ''}
            onChangeText={(txt: string) => setChart({ ...newChart, notes: txt })}
          />
        </Row>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
  },
  tabBar: { height: 50 },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 64,
  },
  chordTone: { flex: 1, flexShrink: 1, flexGrow: 1, flexBasis: 1 },
  chordQuality: { flex: 2, flexShrink: 2, flexGrow: 2, flexBasis: 2 }
});

export default withAuth<ManualProps>(ChordCreator);
