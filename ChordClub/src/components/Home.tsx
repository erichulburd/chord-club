import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Divider, Layout, Button } from '@ui-kitten/components';
import Title from './Title'
import ChartList from './ChartList';
import ChordCreator from './Home/ChordCreator';
import { ChartType, Chart, ChartQuery, BaseScopes } from '../types';
import ChartEditor from './ChartEditor';
import { AuthConsumerProps, withAuth } from './AuthProvider';
import ChartQueryComponent from './ChartQuery';
import { Column } from './Column';

interface Props extends AuthConsumerProps {
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'space-between', alignItems: 'stretch'
  },
});

enum HomeView {
  ChordList,
  ChordCreator,
  ChordEditor,
}

export const HomeScreen = ({ authState }: Props) => {
  const [view, setView] = useState(HomeView.ChordList);
  const [editingChart, setEditingChart] = useState<Chart | undefined>(undefined);
  const editChart = (chart: Chart) => {
    setEditingChart(chart);
    setView(HomeView.ChordEditor);
  };
  const closeEditor = () => {
    setEditingChart(undefined);
    setView(HomeView.ChordList);
  };
  const [query, updateQuery] = useState<ChartQuery>({
    chartTypes: [ChartType.Chord, ChartType.Progression],
    scopes: [BaseScopes.Public],
  })
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Title
        renderMenu={view === HomeView.ChordList}
      />
      <Divider/>
      <Layout style={styles.container}>
        {view === HomeView.ChordList &&
          <>
            {Boolean(authState.token) &&
              <>
                <ChartQueryComponent
                  query={query}
                  onChange={updateQuery}
                />
                <ChartList
                  query={query}
                  editChart={editChart}
                />
              </>
            }
            <View>
              <Button
                size={'giant'}
                appearance={'ghost'}
                status={'success'}
                onPress={() => setView(HomeView.ChordCreator)}
              >Record new sound</Button>
            </View>
          </>
        }
        {view === HomeView.ChordCreator &&
          <ChordCreator
            close={() => setView(HomeView.ChordList)}
          />
        }
        {(view === HomeView.ChordEditor && editingChart) &&
          <ChartEditor
            chart={editingChart}
            close={closeEditor}
          />
        }
      </Layout>
    </SafeAreaView>
  );
};

export default withAuth(HomeScreen);
