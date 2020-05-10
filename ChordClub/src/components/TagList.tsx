import React, { useContext } from 'react';
import { TagQuery, BaseScopes, TagType, TagQueryOrder, Tag, ChartType } from '../types';
import { AuthContext } from './UserContext';
import { useQuery } from 'react-apollo';
import { GET_TAGS, GetTagsData, GetTagsVariables } from '../gql/tag';
import { CenteredSpinner } from './CenteredSpinner';
import ErrorText from './ErrorText';
import { ApolloError } from 'apollo-client';
import { List, ListItem, Button } from '@ui-kitten/components';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screens } from './AppScreen';
import { ThemedIcon } from './FontAwesomeIcons';

const makeTagQuery = (scopes: string[]): TagQuery => ({
  scopes,
  tagTypes: [TagType.Descriptor, TagType.List],
  order: TagQueryOrder.DisplayName,
  asc: true,
});

interface Props {

}

export const TagList = ({}: Props) => {
  const userCtx = useContext(AuthContext);
  const uid = userCtx.user?.uid;
  const scopes = uid ?
    [uid, BaseScopes.Public] :
    [BaseScopes.Public];

  const query = makeTagQuery(scopes);
  const { data, loading, error } = useQuery<GetTagsData, GetTagsVariables>(GET_TAGS, {
    variables: { query }
  });
  const { navigate } = useNavigation();
  if (!data) {
    if (loading) {
      return <CenteredSpinner />;
    }
    const e = error || new ApolloError({
      errorMessage: 'We failed to load tags from server.',
    });
    return <ErrorText error={e} />;
  }
  const goToChordTag = (tag: Tag) => {
    userCtx.updateChartQuery('chords', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Chord],
      scopes: query.scopes,
    });
    navigate(Screens.Chords)
  };
  const goToProgressionTag = (tag: Tag) => {
    userCtx.updateChartQuery('progressions', {
      tagIDs: [tag.id],
      chartTypes: [ChartType.Progression],
      scopes: query.scopes,
    });
    navigate(Screens.Progressions)
  };
  const TagLinks = (t: Tag) => (_props: ViewProps = {}) => (
    <View style={styles.tagLinks}>
      <Button
        size="tiny"
        appearance="ghost"
        status="basic"
        onPress={() => goToChordTag(t)}
      >Chords</Button>
      <Button
        size="tiny"
        appearance="ghost"
        status="basic"
        onPress={() => goToProgressionTag(t)}
      >Progressions</Button>
    </View>
  );
  const renderItem = ({ item }: { item: Tag, index: number }) => (
    <ListItem
      disabled
      accessoryLeft={ThemedIcon(item.scope === uid ? 'user-lock' : 'users')}
      title={item.displayName}
      accessoryRight={TagLinks(item)}
    />
  );
  return (
    <View>
      <List
        data={data.tags}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tagLinks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
})
