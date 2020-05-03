import React from 'react';
import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { CheckBox, Radio } from '@ui-kitten/components';
import { ChartType } from '../../types';

interface Props<T> {
  choices: T[];
  selected: T[] | T;
  display: (choice: T) => string;
  onToggle: (choice: T, checked: boolean) => void;
  multi?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

function CheckboxGroup<T>({
  choices,
  selected,
  display,
  onToggle,
  multi = false,
  containerStyle = {},
}: Props<T>) {
  return (
    <View style={[containerStyle, styles.container]}>
      {multi &&
        choices.map((c) => (
          <CheckBox
            key={display(c)}
            checked={selected instanceof Array ? selected.includes(c) : false}
            onChange={checked => onToggle(c, checked)}
          >{display(c)}</CheckBox>
        ))
      }
      {!multi &&
        choices.map((c) => (
          <Radio
            key={display(c)}
            checked={selected === c}
            onChange={checked => onToggle(c, checked)}
          >{display(c)}</Radio>
        ))
      }
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
})


export const ChartTypeCheckboxGroup = CheckboxGroup as React.FunctionComponent<Props<ChartType>>;
export const StringCheckboxGroup = CheckboxGroup as React.FunctionComponent<Props<string>>;
