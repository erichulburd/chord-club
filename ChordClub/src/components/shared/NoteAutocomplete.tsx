import React, {createElement} from 'react';
import {Autocomplete, AutocompleteItem, IconProps} from '@ui-kitten/components';
import {Note} from '../../types';
import zip from 'lodash/zip';
import flatten from 'lodash/flatten';
import trim from 'lodash/trim';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {ThemedIcon} from '../FontAwesomeIcons';
import {StyleProp, TextStyle} from 'react-native';

const flatRegex = /^[A-z](b|f)/;
const sharpRegex = /^[A-z](#|s)/;
const naturals = 'ABCDEFG'.split('');
const sharps = naturals.map((l) => `${l}#`);
const flats = naturals.map((l) => `${l}b`);
const allNotes = flatten(zip(naturals, sharps, flats)) as string[];
const filterNotes = (query: string) => {
  if (!query) {
    return allNotes;
  }
  const trimmed = trim(query);
  const natural = trimmed[0];
  if (trimmed.length === 1) {
    return [
      natural.toUpperCase(),
      `${natural.toUpperCase()}#`,
      `${natural.toUpperCase()}b`,
    ];
  } else if (flatRegex.test(trimmed)) {
    return [`${natural.toUpperCase()}b`];
  } else if (sharpRegex.test(trimmed)) {
    return [`${natural.toUpperCase()}#`];
  }
  return [];
};

const strToNote = (n: string) =>
  (sharpRegex.test(n) ? n.replace('#', 's') : n) as Note;

interface Props {
  onSelect: (note: Note) => void;
  initialValue?: Note | undefined | null;
  disabled?: boolean;
  style?: StyleProp<TextStyle>;
  placeholder?: string;
}

export const NoteAutocomplete = ({
  onSelect,
  initialValue,
  disabled,
  placeholder = 'Note',
  style = {},
}: Props) => {
  const [query, setQuery] = React.useState(initialValue?.toString() || '');
  const [notes, setNotes] = React.useState(allNotes);

  const onChangeText = (txt: string) => {
    setQuery(txt);
    setNotes(filterNotes(txt));
  };

  const clearInput = () => {
    setQuery('');
    setNotes(allNotes);
  };

  const renderCloseIcon = (props: IconProps) => (
    <TouchableWithoutFeedback onPress={clearInput}>
      {createElement(ThemedIcon('times'), props)}
    </TouchableWithoutFeedback>
  );

  const updateSelection = (index: number) => {
    onSelect(strToNote(notes[index]));
    setQuery(notes[index]);
  };

  return (
    <Autocomplete
      autoCapitalize={'none'}
      style={style}
      placeholder={placeholder}
      value={query}
      disabled={disabled}
      accessoryRight={renderCloseIcon}
      onChangeText={onChangeText}
      onSelect={updateSelection}>
      {notes.map((note) => (
        <AutocompleteItem key={note} title={note} />
      ))}
    </Autocomplete>
  );
};
