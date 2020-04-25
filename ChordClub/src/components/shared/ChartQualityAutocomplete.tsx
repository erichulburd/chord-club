import React, { createElement } from 'react';
import { Autocomplete, AutocompleteItem, IconProps } from '@ui-kitten/components';
import { ChartQuality } from '../../types';
import zip from 'lodash/zip';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { ThemedIcon } from '../FontAwesomeIcons';
import { TextStyle, StyleProp } from 'react-native';

const allChartQualities = Object.keys(ChartQuality);
const qualityRegexs = allChartQualities.map((cq) => new RegExp(cq, 'i'));
const options = zip(allChartQualities, qualityRegexs) as [string, RegExp][];
const filterQualities = (query: string) => {
  return options
    .filter(([_chartQuality, re]) => re.test(query))
    .map(([chartQuality, _re]) => chartQuality);
};
const strToChartQuality: { [k: string]: ChartQuality } = allChartQualities.reduce((prev, cq) => ({
  ...prev,
  [cq]: cq.toUpperCase(),
}), {});

interface Props {
  onSelect: (note: ChartQuality) => void;
  initialValue?: ChartQuality;
  disabled?: boolean;
  style?: StyleProp<TextStyle>;
  placeholder?: string;
}

export const ChartQualityAutocomplete = ({
  onSelect, initialValue, disabled, style,
  placeholder = 'Chord quality',
}: Props) => {
  const [query, setQuery] = React.useState(initialValue?.toString() || '');
  const [qualities, setQualities] = React.useState(allChartQualities);

  const onChangeText = (txt: string) => {
    setQuery(txt);
    setQualities(filterQualities(txt));
  };

  const clearInput = () => {
    setQuery('');
    setQualities(allChartQualities);
  };

  const renderCloseIcon = (props: IconProps) => (
    <TouchableWithoutFeedback onPress={clearInput}>
      {createElement(ThemedIcon('times'), props)}
    </TouchableWithoutFeedback>
  );

  const updateSelection = (index: number) => {
    onSelect(strToChartQuality[qualities[index]]);
    setQuery(qualities[index]);
  }

  return (
    <Autocomplete
      style={style}
      placeholder={placeholder}
      value={query}
      disabled={disabled}
      accessoryRight={renderCloseIcon}
      onChangeText={onChangeText}
      onSelect={updateSelection}
    >
      {qualities.map((quality) =>(
        <AutocompleteItem
          key={quality}
          title={quality}
        />
      ))}
    </Autocomplete>
  );
}
