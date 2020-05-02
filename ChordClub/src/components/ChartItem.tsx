import React, { useState } from 'react';
import { Card, Text, Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { ReactionType, Chart, ChartType } from '../types';
import { View, ViewProps, StyleSheet } from 'react-native';
import { ChartExtensions } from './ChartExtensions';
import { displayNote } from '../util/strings';
import { ModalImage } from './shared/ModalImage';
import { ResizableImage } from '../util/imagePicker';
import AudioPlayer from './AudioPlayer1';
import { TagCollection } from './TagCollection';
import { withAuth, AuthConsumerProps } from './AuthProvider';
import { useMutation } from 'react-apollo';
import ChartReactions from './ChartReactions';
import { REACT_TO_CHART, ReactToChartResponse, ReactToChartVariables } from '../gql/chart';

interface ManualProps {
  chart: Chart;
  editChart: (chart: Chart) => void;
  onDeleteChart: (chartID: number) => void;
}
interface Props extends ManualProps, AuthConsumerProps {}

const ChartItem = ({ chart, authState, editChart, onDeleteChart }: Props) => {
  const { uid } = authState;
  const [reactToChart, reaction] = useMutation<ReactToChartResponse, ReactToChartVariables>(REACT_TO_CHART);
  const react = (reactionType: ReactionType) => {
    if (reactionType === chart.userReactionType) {
      return;
    }
    reactToChart({ variables: {
      reactionNew: { chartID: chart.id, reactionType, uid  }
    }})
  };
  const userReactionType =  reaction.data?.react.userReactionType || chart.userReactionType;
  const starCount: number = reaction.data?.react.reactionCounts?.stars ||
    chart.reactionCounts.stars;
  const Footer = (props?: ViewProps) => (
    <View {...props} style={[props?.style || {}, styles.footer]}>
      <View style={styles.ownerActions}>
        <Text category="label">{chart.creator?.username}</Text>
        {chart.createdBy === authState.uid &&
          <>
            <Button
              appearance="ghost"
              status="basic"
              size="small"
              accessoryLeft={ThemedIcon('edit')}
              onPress={() => editChart(chart)}
            />
            <Button
              appearance="ghost"
              status="basic"
              size="small"
              accessoryLeft={ThemedIcon('trash')}
              onPress={() => onDeleteChart(chart.id)}
            />
          </>
        }
      </View>
      <ChartReactions chart={chart} />
    </View>
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
      style={styles.card}
      status="basic"
      footer={Footer}
    >
      <View>
        <AudioPlayer audio={chart} />
        <Button
          appearance="ghost"
          status="warning"
          onPress={openImage}
        >View chart</Button>
      </View>
      <TagCollection
        tags={chart.tags}
      />
      {Boolean(chart.description) &&
        <View>
          <View style={styles.attributeHeader}>
            <Text category="label">Description</Text>
            <CaretToggle
              isOpen={accordionState.description}
              toggle={(nextIsOpen) => setAccordionState({ ...accordionState, description: nextIsOpen })}
            />
          </View>
          {accordionState.description && chart.description &&
            <View>
              <Text>{chart.description}</Text>
            </View>
          }
        </View>
      }
      {chart.chartType === ChartType.Chord &&
        <>
          <View>
            <View style={styles.attributeHeader}>
              <Text category="label">{'Tone & Quality'}</Text>
              <CaretToggle
                isOpen={accordionState.toneAndQuality}
                toggle={(nextIsOpen) => setAccordionState({ ...accordionState, toneAndQuality: nextIsOpen })}
              />
            </View>
            {(accordionState.toneAndQuality && chart.root) &&
              <View><Text>{displayNote(chart.root)} {chart.quality}</Text></View>
            }
          </View>
          <View>
            <View style={styles.attributeHeader}>
              <Text category="label">Extensions</Text>
              <CaretToggle
                isOpen={accordionState.extensions}
                toggle={(nextIsOpen) => setAccordionState({ ...accordionState, extensions: nextIsOpen })}
              />
            </View>
            {accordionState.extensions &&
              <View><ChartExtensions chartID={chart.id} /></View>
            }
          </View>
        </>
      }
      {image &&
        <ModalImage
          visible={imageIsOpen}
          image={image}
          close={() => toggleImage(false)}
        />
      }
    </Card>
  );
};

interface CaretToggleProps {
  isOpen: boolean;
  toggle: (on: boolean) => void;
}

const CaretToggle = ({ isOpen, toggle }: CaretToggleProps) => (
  <Button
    appearance="ghost"
    accessoryLeft={isOpen ? ThemedIcon('angle-up') : ThemedIcon('angle-down')}
    onPress={() => toggle(!isOpen)}
  />
)

interface AccordionState {
  description: boolean;
  extensions: boolean;
  toneAndQuality: boolean;
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attributeHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }
})

export default withAuth<ManualProps>(ChartItem);
