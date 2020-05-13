import React, {useState} from 'react';
import {Card, Text, Button} from '@ui-kitten/components';
import {ThemedIcon} from './FontAwesomeIcons';
import moment from 'moment';
import {Chart, ChartType} from '../types';
import {View, ViewProps, StyleSheet} from 'react-native';
import {ChartExtensions} from './ChartExtensions';
import {displayNote} from '../util/strings';
import {ModalImage} from './shared/ModalImage';
import {ResizableImage} from '../util/imagePicker';
import {AudioPlayer} from './AudioPlayer';
import {TagCollection} from './TagCollection';
import {UserConsumerProps, withUser} from './UserContext';
import ChartOwnerMenu from './ChartOwnerMenu';
import {ChartFooter} from './ChartFooter';

interface ManualProps {
  chart: Chart;
  compact: boolean;
  editChart: (chart: Chart) => void;
  onDeleteChart: (chartID: number) => void;
  next: () => void;
}
interface Props extends ManualProps, UserConsumerProps {}

const ChordItem = ({
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
  const Footer = (props?: ViewProps) => (
    <ChartFooter
      viewProps={props}
      chart={chart}
      next={next}
      openImage={openImage}
    />
  );
  const [accordionState, setAccordionState] = useState<AccordionState>({
    description: false,
    extensions: false,
    toneAndQuality: false,
  });
  const [image, setImage] = useState<ResizableImage | undefined>(undefined);
  const [imageIsOpen, toggleImage] = useState(false);
  const openImage = async () => {
    if (!image) {
      const im = await ResizableImage.newFromURL(chart.imageURL || '');
      setImage(im);
    }
    toggleImage(true);
  };
  return (
    <Card
      disabled
      style={styles.card}
      status="success"
      footer={compact ? undefined : Footer}
      header={compact ? undefined : Header}>
      <View>
        <AudioPlayer audio={chart} />
      </View>
      <TagCollection tags={chart.tags} />
      {Boolean(chart.description) && (
        <View>
          <View style={styles.attributeHeader}>
            <Text category="label">Description</Text>
            <CaretToggle
              isOpen={accordionState.description}
              toggle={(nextIsOpen) =>
                setAccordionState({...accordionState, description: nextIsOpen})
              }
            />
          </View>
          {accordionState.description && chart.description && (
            <View>
              <Text>{chart.description}</Text>
            </View>
          )}
        </View>
      )}
      {chart.chartType === ChartType.Chord && (
        <>
          <View>
            <View style={styles.attributeHeader}>
              <Text category="label">{'Tone & Quality'}</Text>
              <CaretToggle
                isOpen={accordionState.toneAndQuality}
                toggle={(nextIsOpen) =>
                  setAccordionState({
                    ...accordionState,
                    toneAndQuality: nextIsOpen,
                  })
                }
              />
            </View>
            {accordionState.toneAndQuality && chart.root && (
              <View>
                <Text>
                  {displayNote(chart.root)} {chart.quality}
                </Text>
              </View>
            )}
          </View>
          <View>
            <View style={styles.attributeHeader}>
              <Text category="label">Extensions</Text>
              <CaretToggle
                isOpen={accordionState.extensions}
                toggle={(nextIsOpen) =>
                  setAccordionState({...accordionState, extensions: nextIsOpen})
                }
              />
            </View>
            {accordionState.extensions && (
              <View>
                <ChartExtensions chartID={chart.id} />
              </View>
            )}
          </View>
        </>
      )}
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

interface CaretToggleProps {
  isOpen: boolean;
  toggle: (on: boolean) => void;
}

const CaretToggle = ({isOpen, toggle}: CaretToggleProps) => (
  <Button
    appearance="ghost"
    accessoryLeft={isOpen ? ThemedIcon('angle-up') : ThemedIcon('angle-down')}
    onPress={() => toggle(!isOpen)}
  />
);

interface AccordionState {
  description: boolean;
  extensions: boolean;
  toneAndQuality: boolean;
}

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

export default withUser<ManualProps>(ChordItem);
