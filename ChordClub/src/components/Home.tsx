import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Divider, Layout, Button } from '@ui-kitten/components';
import { NavigationProp } from '@react-navigation/native';
import Title from './Title'
import { ChartList } from './ChartList';
import ChordCreator from './Home/ChordCreator';
import { ChartType } from '../types';

interface NavProp {}

interface Props {
  navigation: NavigationProp<{ [key: string]: NavProp }>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'space-between', alignItems: 'stretch'
  },
});

enum HomeView {
  ChordList,
  ChordCreator,
}

export const HomeScreen = ({ navigation }: Props) => {
  const [view, setView] = useState(HomeView.ChordList);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Title
        renderMenu={view === HomeView.ChordList}
      />
      <Divider/>
      <Layout style={styles.container}>
        {view === HomeView.ChordList &&
          <>
            <ChartList query={{ chartTypes: [ChartType.Chord, ChartType.Progression]}} />
            <View>
              <Button
                size={'giant'}
                appearance={'ghost'}
                status={'success'}
                onPress={() => setView(HomeView.ChordCreator)}
              >New chord</Button>
            </View>
          </>
        }
        {view === HomeView.ChordCreator &&
          <ChordCreator
            close={() => setView(HomeView.ChordList)}
          />
        }
      </Layout>
    </SafeAreaView>
  );
};
