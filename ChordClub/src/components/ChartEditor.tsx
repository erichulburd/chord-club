import React, {useState, useEffect} from 'react';
import {
  Text,
  Button,
  Input,
  TabBar,
  Tab,
  CheckBox,
  Toggle,
} from '@ui-kitten/components';
import {View, Image, StyleSheet} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {withUser, UserConsumerProps} from './UserContext';
import {areTagsEqual} from '../util/forms';
import {
  ChartType,
  Extension,
  Note,
  BaseScopes,
  TagNew,
  Tag,
  Chart,
  ChartUpdate,
} from '../types';
import {Row} from './shared/Row';
import {AudioRecorder} from './AudioRecorder';
import {ThemedIcon} from './FontAwesomeIcons';
import {pickSingleImage, ResizableImage} from '../util/imagePicker';
import {ModalImage} from './shared/ModalImage';
import {NoteAutocomplete} from './shared/NoteAutocomplete';
import {ChartQualityAutocomplete} from './shared/ChartQualityAutocomplete';
import {useMutation} from '@apollo/react-hooks';
import {
  UpdateChartResponse,
  UPDATE_CHART,
  UpdateChartVariables,
} from '../gql/chart';
import {FileURLCache, uploadFilesIfNecessary} from '../util/uploads';
import {withModalContext, ModalContextProps} from './ModalProvider';
import TagAutocomplete from './TagAutocomplete';
import {TagCollection} from './TagCollection';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {ChartExtensionsEditor} from './ChartExtensionsEditor';
import {Audioable} from '../util/audio';

interface ManualProps {
  chart: Chart;
  close: () => void;
  mountID: string;
}

interface Props extends ManualProps, UserConsumerProps, ModalContextProps {}

const ChartEditor = ({close, modalCtx, userCtx, chart, mountID}: Props) => {
  const {uid} = userCtx.authState;

  const defaultChartUpdate = omit(chart, [
    '__typename',
    'extensions',
    'createdAt',
    'updatedAt',
    'createdBy',
    'creator',
    'reactionCounts',
    'userReactionType',
    'chartType',
  ]);
  const [chartUpdate, setChart] = useState<ChartUpdate>(defaultChartUpdate);
  const chartID = chart?.id;
  useEffect(() => {
    reset();
  }, [mountID, chartID]);
  const updateChartExtensions = (exts: Extension[]) => {
    setChart({...chartUpdate, extensionIDs: exts.map((e) => e.id)});
  };
  const updateChartRoot = (n: Note) => setChart({...chartUpdate, root: n});
  const [audioFilePath, setAudioFilePath] = useState<string | undefined>(
    undefined,
  );
  const [audioLength, setAudioLength] = useState<number | undefined>(undefined);
  const onRecordingComplete = (audio: Audioable | undefined) => {
    setAudioFilePath(audio?.audioURL);
    setAudioLength(audio?.audioLength || 0);
  };
  const [image, setResizableImage] = useState<ResizableImage | null>(null);
  const [modalImageVisible, setModalImageVisible] = useState<boolean>(false);
  const [urlCache, setFileURLCache] = useState<FileURLCache>({});

  const [fileUpdates, setFileUpdates] = useState({
    image: false,
  });

  const [updateChart, {}] = useMutation<
    UpdateChartResponse,
    UpdateChartVariables
  >(UPDATE_CHART);
  const submit = async () => {
    modalCtx.wait();
    const payload = {
      ...chartUpdate,
      abc: '',
    } as ChartUpdate;

    try {
      if (audioFilePath || fileUpdates.image) {
        const filePaths = {
          audioURL: audioFilePath || '',
          imageURL: image?.uri || '',
        };
        const {urls, didUpload, cache} = await uploadFilesIfNecessary(
          filePaths,
          urlCache,
        );

        payload.audioURL = audioFilePath ? urls.audioURL : chart.audioURL;
        payload.audioLength = audioLength || chartUpdate.audioLength;
        payload.imageURL = fileUpdates.image ? urls.imageURL : chart.imageURL;
        if (didUpload) {
          setFileURLCache(cache);
        }
      }
      payload.tags = payload.tags?.map(
        (t) => pick(t, ['displayName', 'scope', 'tagType']) as TagNew,
      );

      await updateChart({variables: {chartUpdate: payload}});
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

  const reset = () => {
    setChart(defaultChartUpdate);
    setAudioFilePath(undefined);
    setAudioLength(undefined);
    setResizableImage(null);
    setModalImageVisible(false);
    setFileURLCache({});
  };

  const addTag = (tagNew: TagNew | Tag) => {
    const tags: TagNew[] = chartUpdate.tags || [];
    const entry = pick(tagNew, ['displayName', 'scope', 'tagType']) as TagNew;
    if (!tags.some((t) => areTagsEqual(t as Tag, entry))) {
      setChart({...chartUpdate, tags: [...tags, entry]});
    }
  };
  const removeTag = (tagNew: Tag | TagNew) => {
    const tags: TagNew[] = chartUpdate.tags || [];
    if (tags.some((t) => areTagsEqual(t as Tag, tagNew))) {
      setChart({
        ...chartUpdate,
        tags: tags.filter((t) => !areTagsEqual(t as Tag, tagNew)),
      });
    }
  };
  const updatePublic = (isPublic: boolean) => {
    const tags: TagNew[] = chartUpdate.tags || [];
    if (!isPublic && tags.some((t) => t.scope === BaseScopes.Public)) {
      modalCtx.message(
        {
          msg:
            'Your public tags for this chart will be lost if you make it private.',
          status: 'warning',
        },
        {
          confirm: () => {
            const allTags = chartUpdate.tags || [];
            const privateTags = allTags.filter(
              (t: TagNew) => t.scope !== BaseScopes.Public,
            );
            setChart({...chartUpdate, scope: uid, tags: privateTags});
          },
          cancel: () => {},
        },
      );
      return;
    }
    setChart({...chartUpdate, scope: isPublic ? BaseScopes.Public : uid});
  };

  return (
    <View style={styles.container}>
      <TabBar
        style={styles.tabBar}
        selectedIndex={chart.chartType === ChartType.Chord ? 0 : 1}>
        <Tab title="CHORD" disabled />
        <Tab title="PROGRESSION" disabled />
      </TabBar>
      <KeyboardAwareScrollView>
        <Row style={styles.fullWidth}>
          <AudioRecorder
            recorderID={chart.id.toString()}
            preRecordedAudio={chart}
            onRecordComplete={onRecordingComplete}
          />
        </Row>
        <Row>
          <Toggle
            checked={fileUpdates.image}
            onChange={(checked) =>
              setFileUpdates({...fileUpdates, image: checked})
            }>
            Update image
          </Toggle>
        </Row>
        {image && (
          <Row>
            {fileUpdates.image && (
              <TouchableHighlight onPress={() => setModalImageVisible(true)}>
                <Image
                  resizeMode="contain"
                  style={image.coverDimensions({height: 200})}
                  source={{uri: image.uri}}
                />
              </TouchableHighlight>
            )}
          </Row>
        )}
        <Row>
          {fileUpdates.image && (
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
          )}
        </Row>
        <Row>
          <CheckBox
            checked={chartUpdate.scope === BaseScopes.Public}
            onChange={updatePublic}
          />
          <Text category="label"> Share publicly?</Text>
        </Row>
        {chart.chartType === ChartType.Chord && (
          <>
            <Row style={{flexDirection: 'column', alignItems: 'stretch'}}>
              <Row>
                <View style={styles.chordTone}>
                  <NoteAutocomplete
                    mountID={mountID}
                    placeholder={'Tone'}
                    onSelect={updateChartRoot}
                    initialValue={chart.root}
                  />
                </View>
                <View style={styles.chordQuality}>
                  <ChartQualityAutocomplete
                    mountID={mountID}
                    placeholder={'Quality'}
                    onSelect={(cq) => setChart({...chartUpdate, quality: cq})}
                    initialValue={chart.quality}
                  />
                </View>
              </Row>
            </Row>
            <Row>
              <Text category="label">Extensions</Text>
            </Row>
            <Row>
              <ChartExtensionsEditor
                chartID={chart.id}
                onUpdate={updateChartExtensions}
              />
            </Row>
          </>
        )}
        <Row style={styles.fullWidth}>
          <TagAutocomplete
            containerStyle={{width: '100%'}}
            onSelect={addTag}
            includePublic={chartUpdate.scope === BaseScopes.Public}
          />
          <TagCollection tags={chartUpdate.tags || []} onDelete={removeTag} />
        </Row>
        {chart.chartType === ChartType.Progression && (
          <Row style={styles.fullWidth}>
            <Input
              textStyle={styles.input}
              placeholder="Name"
              value={chartUpdate.name || ''}
              onChangeText={(txt: string) =>
                setChart({...chartUpdate, name: txt})
              }
            />
          </Row>
        )}
        <Row style={styles.fullWidth}>
          <Input
            multiline
            textStyle={[styles.input, styles.inputMultiline]}
            placeholder="Description"
            value={chartUpdate.description || ''}
            onChangeText={(txt: string) =>
              setChart({...chartUpdate, description: txt})
            }
          />
        </Row>
      </KeyboardAwareScrollView>
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
  withUser<ManualProps & ModalContextProps>(ChartEditor),
);
