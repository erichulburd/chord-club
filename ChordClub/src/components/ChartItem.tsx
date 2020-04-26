import React, { useEffect, useState } from 'react';
import { Card, Text, Button, Toggle } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';
import { ReactionType, Chart, ChartType } from '../types';
import { View, ViewProps, StyleSheet } from 'react-native';
import { ChartExtensions } from './ChartExtensions';
import { displayNote } from '../util/strings';
import { ModalImage } from './shared/ModalImage';
import { ResizableImage } from '../util/imagePicker';

export const ChartItem = ({ chart }: { chart: Chart }) => {
  const Footer = (props?: ViewProps) => (
    <View {...props} style={[props?.style || {}, styles.footer]}>
      <Text category="label">{chart.creator?.username}</Text>
      <View style={styles.reactions}>
        <Button
          size="small"
          status="warning"
          appearance={chart.userReactionType === ReactionType.Star ? 'outline' : 'ghost'}
          accessoryRight={ThemedIcon('star')}
        >{chart.reactionCounts.stars.toString()}</Button>
        <Button
          size="small"
          status="danger"
          appearance={chart.userReactionType === ReactionType.Flag ? 'outline' : 'ghost'}
          accessoryLeft={ThemedIcon('flag')}
        />
      </View>
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
        <Button
          appearance="ghost"
          status="warning"
          onPress={openImage}
        >View chart</Button>
      </View>
      {Boolean(chart.notes) &&
        <View>
          <View style={styles.attributeHeader}>
            <Text category="label">Description</Text>
            <CaretToggle
              isOpen={accordionState.description}
              toggle={(nextIsOpen) => setAccordionState({ ...accordionState, description: nextIsOpen })}
            />
          </View>
          {accordionState.description &&
            <View><Text>{chart.notes || 'NO DESCRIPTION'}</Text></View>
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
            {accordionState.toneAndQuality &&
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
  reactions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  attributeHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
})
