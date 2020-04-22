import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Divider, Layout, Text, Button } from '@ui-kitten/components';
import { NavigationProp } from '@react-navigation/native';
import Title from './Title'
import ChordList from './Home/ChordList';
import ChordCreator from './Home/ChordCreator';

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
            <ChordList
            />
            <View>
              <Button
                size={'giant'}
                status={'primary'}
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
