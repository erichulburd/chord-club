import React, {useState} from 'react';
import {useQuery} from '@apollo/react-hooks';
import {
  CHART_EXTENSIONS_QUERY,
  ChartExtensionsQueryResponse,
  ChartExtensionsQueryVariables,
} from '../gql/chart';
import {View} from 'react-native';
import {Spinner} from '@ui-kitten/components';
import ErrorText from './ErrorText';
import {ChartType, Extension} from '../types';
import {ExtensionPalletteBG} from './shared/ExtensionPalletteBG';

interface Props {
  chartID: number;
  onUpdate: (exts: Extension[]) => void;
}

export const ChartExtensionsEditor = ({chartID, onUpdate}: Props) => {
  const {loading, data, error, refetch} = useQuery<
    ChartExtensionsQueryResponse,
    ChartExtensionsQueryVariables
  >(CHART_EXTENSIONS_QUERY, {
    variables: {chartID, chartTypes: [ChartType.Chord, ChartType.Progression]},
  });
  const [update, setExtensions] = useState<Extension[] | undefined>(undefined);
  const extensions = data?.charts[0]?.extensions || [];
  const updateExtensions = (e: Extension) => {
    let target = update === undefined ? [...extensions] : [...update];
    const index = target.findIndex((ext) => ext.id === e.id);
    if (index < 0) {
      target.push(e);
    } else {
      target.splice(index, 1);
    }
    setExtensions(target);
    onUpdate(target);
  };

  return (
    <View>
      {loading && <Spinner />}
      {error && (
        <ErrorText
          error={'We could not load extensions for this chart.'}
          retry={refetch}
        />
      )}
      {data && (
        <ExtensionPalletteBG
          selected={update === undefined ? extensions : update}
          onExtensionUpdate={updateExtensions}
        />
      )}
    </View>
  );
};
