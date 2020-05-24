import React from 'react';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';


interface CaretToggleProps {
  isOpen: boolean;
  toggle: (on: boolean) => void;
}

export const CaretToggle = ({isOpen, toggle}: CaretToggleProps) => (
  <Button
    appearance="ghost"
    accessoryLeft={isOpen ? ThemedIcon('angle-up') : ThemedIcon('angle-down')}
    onPress={() => toggle(!isOpen)}
  />
);
