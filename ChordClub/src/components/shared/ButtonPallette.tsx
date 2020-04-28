import React from 'react';
import { Button } from '@ui-kitten/components';
import { View, StyleSheet } from 'react-native';

interface Props<T> {
  options: T[];
  selected: T[];
  onSelect: (choice: T) => void;
  size?: string;
  getUniqKey?: (value: T) => string;
  displayValue?: (value: T) => string;
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  button: {
    margin: 5,
  }
});

export const ButtonPallette = <T extends any>({
  options, selected, onSelect, size = 'small',
  getUniqKey = (val) => val.toString(),
  displayValue = (val) => val.toString()
}: Props<T>) => {

  return (
    <View style={styles.container}>
      {options.map((value) => (
        <Button
          key={getUniqKey(value)}
          size={size}
          style={styles.button}
          appearance={selected.some(e => e.id === value.id) ? 'filled' : 'outline'}
          onPress={() => onSelect(value)}
        >{displayValue(value)}</Button>
      ))}
    </View>
  )
};
