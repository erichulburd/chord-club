import React, { useState } from 'react';
import { Text, Button, Input, TabBar, Tab, CheckBox } from '@ui-kitten/components';
import { View, Image, StyleSheet } from 'react-native';
import { TouchableHighlight, ScrollView } from 'react-native-gesture-handler';
import { withAuth, AuthConsumerProps } from '../AuthProvider';
import { makeChartNew } from '../../util/forms';
import { ChartType, ChartQuality, Extension, Note, Chart, BaseScopes, ChartNew } from '../../types';
import { Row } from '../shared/Row';
import { ExtensionPalletteBG } from '../shared/ExtensionPalletteBG';
import AudioRecorder from '../AudioRecorder/index';
import { ThemedIcon } from '../FontAwesomeIcons';
import { pickSingleImage, ResizableImage } from '../../util/imagePicker';
import { ModalImage } from '../shared/ModalImage';
import { NoteAutocomplete } from '../shared/NoteAutocomplete';
import { ChartQualityAutocomplete } from '../shared/ChartQualityAutocomplete';
import { upload, FileUploads } from '../../util/api';
import auth from '../../util/auth';
import { useMutation } from '@apollo/react-hooks';
import { last } from 'lodash';
import {
  CREATE_CHART_NEW, CreateChartResponse, CreateChartVariables
} from '../../gql/chart';


interface ManualProps {
  close: () => void;
}

interface Props extends ManualProps, AuthConsumerProps {}

const ChordCreator = ({ close }: Props) => {
  const uid = auth.currentState().uid;
  const [newChart, setChart] = useState(makeChartNew(uid));
  const updateChartType = (ct: ChartType) => setChart({ ...newChart, chartType: ct });
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
  const [audioFilePath, setAudioFilePath] = useState<string | undefined>(undefined);
  const [image, setResizableImage] = useState<ResizableImage | null>(null);
  const [modalImageVisible, setModalImageVisible] = useState<boolean>(false);
  const [fileUploads, setFileUploads] = useState<FileUploads>({});

  const [createChart, { loading, data, error }] =
    useMutation<CreateChartResponse, CreateChartVariables>(CREATE_CHART_NEW);
  const submit = async () => {
    if (!audioFilePath) return;
    const payload = {
      ...newChart,
      abc: '',
      extensionIDs: extensions.map(e => e.id),
    } as ChartNew;

    const uploads: FileUploads = {};
    payload.audioURL = fileUploads[audioFilePath]
    if (!payload.audioURL) {
      uploads.audio = audioFilePath;
    }
    payload.imageURL = fileUploads[image?.uri || ''];
    if (image && !payload.imageURL) {
      uploads.image = image.uri;
    }
    if (Object.keys(uploads).length > 0) {
      const urls = await upload(uploads);
      const update = { [audioFilePath]: urls.audio };
      payload.audioURL = urls.audio;
      if (image?.uri && urls.image) {
        update[image.uri] = urls.image
        payload.imageURL = urls.image;
      }
      setFileUploads({ ...fileUploads, ...update });
    }
    await createChart({ variables: { chartNew: payload }});
    close();
  }

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
            onRecordingComplete={setAudioFilePath}
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
        <Row>
          <CheckBox
            checked={newChart.scope === BaseScopes.Public}
            onChange={checked => setChart({ ...newChart, scope: checked ? BaseScopes.Public : uid })}
          />
          <Text category="label"> Share publicly?</Text>
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
      <Button onPress={submit}>Submit</Button>
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

const submit = async () => {

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
