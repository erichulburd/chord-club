import React, {useState, useEffect} from 'react';
import {Card, Text, Button} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import moment from 'moment';
import {Chart} from '../types';
import {View, ViewProps, StyleSheet} from 'react-native';
import {ModalImage} from './shared/ModalImage';
import {ResizableImage} from '../util/imagePicker';
import {AudioPlayer} from './AudioPlayer';
import {UserConsumerProps, withUser} from './UserContext';
import ChartOwnerMenu from './ChartOwnerMenu';
import {ChartFooter} from './ChartFooter';
import { formatMs } from './AudioDuration';
import {TagCollection} from './TagCollection';
import { CaretToggle } from './CaretToggle';
import { Row } from './shared/Row';
import ChartReactions from './ChartReactions';
import { openInEditor } from 'reactotron-react-native';

interface ManualProps {
  chart: Chart;
  compact: boolean | undefined;
  editChart: (chart: Chart) => void;
  onDeleteChart: (chartID: number) => void;
  onPlay: (chart: Chart) => void;
  isPlaying: boolean;
}
interface Props extends ManualProps, UserConsumerProps {}

const ProgressionItem = ({
  compact,
  chart,
  userCtx,
  editChart,
  onDeleteChart,
  isPlaying,
  onPlay,
}: Props) => {
  const {authState} = userCtx;
  const [isDetailed, setIsDetailed] = useState(!compact);
  useEffect(() => {
    if (compact && isDetailed) {
      setIsDetailed(false);
    } else if (!compact && !isDetailed) {
      setIsDetailed(true);
    }
  }, [compact]);

  const [image, setImage] = useState<ResizableImage | undefined>(undefined);
  const [imageIsOpen, toggleImage] = useState(false);
  const openImage = async () => {
    if (!image) {
      const im = await ResizableImage.newFromURL(chart.imageURL || '');
      setImage(im);
    }
    toggleImage(true);
  };
  const Footer = (props?: ViewProps) => (
    <View {...props}>
      <View style={styles.progressionDetail}>
        <View style={styles.attributeHeader}>
          <Text category="label">{chart.creator?.username}</Text>
          <Text>{moment(parseInt(chart.createdAt, 10)).fromNow()}</Text>
        </View>
      </View>
      <View style={styles.progressionDetail}>
        <TagCollection navigable tags={chart.tags} />
      </View>
      {Boolean(chart.description) && (
        <View style={styles.progressionDetail}>
          <View style={styles.attributeHeader}>
            <Text category="label">Description</Text>
          </View>
          <View>
            <Text>{chart.description || ''}</Text>
          </View>
        </View>
      )}
      <View style={[styles.actions, styles.progressionDetail]}>
        <ChartReactions chart={chart} />
        {chart.createdBy === authState.uid && (
          <>
            <Button
              appearance="ghost"
              status="basic"
              onPress={() => editChart(chart)}
              accessoryLeft={ThemedIcon('edit')}
            />
            <Button
              appearance="ghost"
              status="basic"
              onPress={() => onDeleteChart(chart.id)}
              accessoryLeft={ThemedIcon('trash')}
            />
          </>
        )}
        {chart.imageURL && (
          <Button
            appearance="ghost"
            status="basic"
            onPress={openImage}
            accessoryLeft={ThemedIcon('music')}
          />
        )}
      </View>
    </View>
  );

  return (
    <View
      style={styles.card}>
      <View style={styles.progressionItem}>
        <View style={[styles.progressionItemCell, styles.progressionItemAction]}>
          <Button
            size="small"
            appearance="ghost"
            status={isPlaying ? 'success' : 'basic'}
            onPress={() => onPlay(chart)}
            accessoryLeft={ThemedIcon('play-circle', {solid: true})}
          />
        </View>
        <View style={[styles.progressionItemCell, styles.progressionItemName]}>
          <Text>{chart.name || ''}</Text>
        </View>
        <View style={[styles.progressionItemCell, styles.progressionItemAudioLength]}>
          <Text>{formatMs(chart.audioLength)}</Text>
        </View>
        <View style={[styles.progressionItemCell, styles.progressionItemAction]}>
          <CaretToggle
            isOpen={isDetailed}
            toggle={() => setIsDetailed(!isDetailed)}
          />
        </View>
      </View>
      {image && (
        <ModalImage
          visible={imageIsOpen}
          image={image}
          close={() => toggleImage(false)}
        />
      )}
      {isDetailed &&
        <Footer />
      }
    </View>
  );
};



const styles = StyleSheet.create({
  progressionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressionItemCell: {
    padding: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  progressionItemAction: {
    flex: 1,
  },
  progressionItemName: {
    flex: 6,
  },
  progressionItemAudioLength: {
    flex: 2,
  },
  progressionDetail: {
    marginTop: 3,
    marginBottom: 3,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  card: {
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  headerAndFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  attributeHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartCreatorAndTime: {
    marginLeft: 10,
  },
});

export default withUser<ManualProps>(ProgressionItem);
