import React, {useState} from 'react';
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
import {TagCollection} from './TagCollection';

interface ManualProps {
  chart: Chart;
  compact: boolean | undefined;
  editChart: (chart: Chart) => void;
  onDeleteChart: (chartID: number) => void;
  next: () => void;
}
interface Props extends ManualProps, UserConsumerProps {}

const ProgressionItem = ({
  compact,
  chart,
  userCtx,
  editChart,
  onDeleteChart,
  next,
}: Props) => {
  const {authState} = userCtx;
  const Header = (props?: ViewProps) => (
    <View {...props} style={styles.headerAndFooter}>
      <View style={styles.chartCreatorAndTime}>
        <Text>{chart.creator?.username}</Text>
        <Text>{moment(parseInt(chart.createdAt, 10)).fromNow()}</Text>
      </View>
      {chart.createdBy === authState.uid && (
        <ChartOwnerMenu
          chart={chart}
          editChart={editChart}
          deleteChart={onDeleteChart}
        />
      )}
    </View>
  );
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
    <ChartFooter
      viewProps={props}
      chart={chart}
      next={next}
      openImage={openImage}
    />
  );

  return (
    <Card
      disabled
      style={styles.card}
      status="success"
      footer={compact ? undefined : Footer}
      header={compact ? undefined : Header}>
      <View>
        <Text>{chart.name || 'Unnamed'}</Text>
        <AudioPlayer audio={chart} />
      </View>
      <TagCollection tags={chart.tags} />
      {image && (
        <ModalImage
          visible={imageIsOpen}
          image={image}
          close={() => toggleImage(false)}
        />
      )}
    </Card>
  );
};
const styles = StyleSheet.create({
  card: {
    margin: 10,
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
