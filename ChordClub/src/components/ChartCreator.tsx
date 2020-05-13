import React, {useState, useEffect} from 'react';
import {
  Text,
  Button,
  Input,
  TabBar,
  Tab,
  CheckBox,
} from '@ui-kitten/components';
import {View, Image, StyleSheet} from 'react-native';
import {TouchableHighlight, ScrollView} from 'react-native-gesture-handler';
import {withUser, UserConsumerProps} from './UserContext';
import {makeChartNew, ChartURLs, areTagsEqual} from '../util/forms';
import {
  ChartType,
  Extension,
  Note,
  BaseScopes,
  ChartNew,
  TagNew,
  Tag,
} from '../types';
import {Row} from './shared/Row';
import {ExtensionPalletteBG} from './shared/ExtensionPalletteBG';
import {AudioRecorder} from './AudioRecorder';
import {ThemedIcon} from './FontAwesomeIcons';
import {pickSingleImage, ResizableImage} from '../util/imagePicker';
import {ModalImage} from './shared/ModalImage';
import {NoteAutocomplete} from './shared/NoteAutocomplete';
import {ChartQualityAutocomplete} from './shared/ChartQualityAutocomplete';
import {useMutation} from '@apollo/react-hooks';
import {
  CREATE_CHART_NEW,
  CreateChartResponse,
  CreateChartVariables,
} from '../gql/chart';
import {FileURLCache, uploadFilesIfNecessary} from '../util/uploads';
import {withModalContext, ModalContextProps} from './ModalProvider';
import TagAutocomplete from './TagAutocomplete';
import {TagCollection} from './TagCollection';
import omit from 'lodash/omit';
import {useRoute} from '@react-navigation/native';
import {AppRouteProp} from './AppScreen';
import {Audioable} from '../util/audio';

interface ManualProps {
  close: () => void;
  mountID: string;
}

interface Props extends ManualProps, UserConsumerProps, ModalContextProps {}

const ChartCreator = ({close, modalCtx, userCtx, mountID}: Props) => {
  const {uid} = userCtx.authState;
  const route = useRoute<AppRouteProp<'CreateAChart'>>();
  const defaultChartType =
    route.params?.chartType === undefined
      ? ChartType.Chord
      : route.params?.chartType;
  const [newChart, setChart] = useState(
    makeChartNew(uid, {
      chartType: defaultChartType,
    }),
  );
  const updateChartType = (ct: ChartType) =>
    setChart({...newChart, chartType: ct});
  useEffect(() => {
    updateChartType(defaultChartType);
  }, [defaultChartType]);

  const updateChartRoot = (n: Note) => setChart({...newChart, root: n});
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const updateExtensions = (e: Extension) => {
    if (extensions.indexOf(e) < 0) {
      setExtensions([...extensions, e]);
      return;
    }
    extensions.splice(extensions.indexOf(e), 1);
    setExtensions([...extensions]);
  };
  const [audioFilePath, setAudioFilePath] = useState<string | undefined>(
    undefined,
  );
  const onRecordingComplete = (audio: Audioable | undefined) => {
    if (audio === undefined) {
      setAudioFilePath(undefined);
      setChart({...newChart, audioLength: 0});
      return;
    }
    setAudioFilePath(audio.audioURL);
    setChart({...newChart, audioLength: audio.audioLength});
  };
  const [image, setResizableImage] = useState<ResizableImage | null>(null);
  const [modalImageVisible, setModalImageVisible] = useState<boolean>(false);
  const [urlCache, setFileURLCache] = useState<FileURLCache>({});

  const reset = () => {
    setChart(
      makeChartNew(uid, {
        chartType: defaultChartType,
      }),
    );
    setExtensions([]);
    setAudioFilePath(undefined);
    setResizableImage(null);
    setModalImageVisible(false);
    setFileURLCache({});
  };

  const [createChart, {}] = useMutation<
    CreateChartResponse,
    CreateChartVariables
  >(CREATE_CHART_NEW);
  const submit = async () => {
    if (!audioFilePath) {
      modalCtx.message({msg: 'You must upload audio.', status: 'danger'});
      return;
    }
    modalCtx.wait();
    const payload = {
      ...newChart,
      abc: '',
      extensionIDs: extensions.map((e) => e.id),
    } as ChartNew;

    const filePaths: ChartURLs = {
      audioURL: audioFilePath,
      imageURL: image?.uri || '',
    };
    try {
      const {urls, didUpload, cache} = await uploadFilesIfNecessary(
        filePaths,
        urlCache,
      );

      Object.assign(payload, urls);
      if (didUpload) {
        setFileURLCache(cache);
      }

      await createChart({
        variables: {chartNew: payload},
      });
      modalCtx.wait(false);
      reset();
      close();
    } catch (err) {
      modalCtx.wait(false);
      modalCtx.message({msg: err.message, status: 'danger'});
    }
  };
  const cancel = () => {
    reset();
    close();
  };

  const updateImagePath = async () => {
    const image = await pickSingleImage();
    if (image) {
      await setResizableImage(image);
    }
  };

  const addTag = (tagNew: TagNew | Tag) => {
    const tags = newChart.tags || [];
    const entry = omit(tagNew, ['id', '__typename', 'munge']) as TagNew;
    if (!tags.some((t) => areTagsEqual(t as Tag, entry))) {
      setChart({...newChart, tags: [...tags, entry]});
    }
  };
  const removeTag = (tagNew: Tag | TagNew) => {
    const tags = newChart.tags || [];
    if (tags.some((t) => areTagsEqual(t as Tag, tagNew))) {
      setChart({
        ...newChart,
        tags: tags.filter((t) => !areTagsEqual(t as Tag, tagNew)),
      });
    }
  };
  const updatePublic = (isPublic: boolean) => {
    if (
      !isPublic &&
      newChart.tags?.some((t) => t.scope === BaseScopes.Public)
    ) {
      modalCtx.message(
        {
          msg:
            'Your public tags for this chart will be lost if you make it private.',
          status: 'warning',
        },
        {
          confirm: () => {
            const tags = (newChart.tags || []).filter(
              (t) => t.scope !== BaseScopes.Public,
            );
            setChart({...newChart, scope: uid, tags});
          },
          cancel: () => {},
        },
      );
      return;
    }
    setChart({...newChart, scope: isPublic ? BaseScopes.Public : uid});
  };

  return (
    <View style={styles.container}>
      <TabBar
        style={styles.tabBar}
        selectedIndex={newChart.chartType === ChartType.Chord ? 0 : 1}
        onSelect={(index) =>
          updateChartType(index === 0 ? ChartType.Chord : ChartType.Progression)
        }>
        <Tab title="CHORD" />
        <Tab title="PROGRESSION" />
      </TabBar>
      <ScrollView style={{height: '80%'}}>
        <Row style={styles.fullWidth}>
          <AudioRecorder
            recorderID={'0'}
            onRecordComplete={onRecordingComplete}
          />
        </Row>
        {image && (
          <Row>
            <TouchableHighlight onPress={() => setModalImageVisible(true)}>
              <Image
                resizeMode="contain"
                style={image.coverDimensions({height: 200})}
                source={{uri: image.uri}}
              />
            </TouchableHighlight>
          </Row>
        )}
        <Row>
          <Button
            size="small"
            appearance="outline"
            status={image ? 'danger' : 'primary'}
            onPress={image ? () => setResizableImage(null) : updateImagePath}
            accessoryLeft={
              image ? ThemedIcon('times') : ThemedIcon('file-image')
            }>
            {image ? 'Remove' : 'Upload Chart'}
          </Button>
        </Row>
        <Row>
          <CheckBox
            checked={newChart.scope === BaseScopes.Public}
            onChange={updatePublic}
          />
          <Text category="label"> Share publicly?</Text>
        </Row>
        {newChart.chartType === ChartType.Chord && (
          <>
            <Row style={styles.fullWidth}>
              <Row>
                <View style={styles.chordTone}>
                  <NoteAutocomplete
                    mountID={mountID}
                    initialValue={undefined}
                    placeholder={'Tone'}
                    onSelect={updateChartRoot}
                  />
                </View>
                <View style={styles.chordQuality}>
                  <ChartQualityAutocomplete
                    mountID={mountID}
                    initialValue={undefined}
                    placeholder={'Quality'}
                    onSelect={(cq) => setChart({...newChart, quality: cq})}
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
        )}
        <Row style={styles.fullWidth}>
          <TagAutocomplete
            containerStyle={{width: '100%'}}
            onSelect={addTag}
            includePublic={newChart.scope === BaseScopes.Public}
          />
          <TagCollection tags={newChart.tags || []} onDelete={removeTag} />
        </Row>
        {newChart.chartType === ChartType.Progression && (
          <Row style={styles.fullWidth}>
            <Input
              textStyle={styles.input}
              placeholder="Name"
              value={newChart.name || ''}
              onChangeText={(txt: string) => setChart({...newChart, name: txt})}
            />
          </Row>
        )}
        <Row style={styles.fullWidth}>
          <Input
            multiline
            textStyle={[styles.input, styles.inputMultiline]}
            placeholder="Description"
            value={newChart.description || ''}
            onChangeText={(txt: string) =>
              setChart({...newChart, description: txt})
            }
          />
        </Row>
      </ScrollView>
      <View style={styles.formControls}>
        <>
          <View style={styles.formControl}>
            <Button
              appearance="ghost"
              size="large"
              status="success"
              onPress={submit}>
              Submit
            </Button>
          </View>
          <View style={styles.formControl}>
            <Button
              appearance="ghost"
              size="large"
              status="warning"
              onPress={cancel}>
              Cancel
            </Button>
          </View>
        </>
      </View>
      {image && (
        <ModalImage
          visible={modalImageVisible}
          close={() => setModalImageVisible(false)}
          image={image}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tabBar: {height: 50},
  input: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  inputMultiline: {
    minHeight: 64,
  },
  chordTone: {flex: 1, flexShrink: 1, flexGrow: 1, flexBasis: 1},
  chordQuality: {flex: 2, flexShrink: 2, flexGrow: 2, flexBasis: 2},
  formControl: {
    flex: 1,
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'red',
  },
  formControls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullWidth: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});

export default withModalContext(
  withUser<ManualProps & ModalContextProps>(ChartCreator),
);
