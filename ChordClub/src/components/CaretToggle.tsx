import React from 'react';
import { Button } from '@ui-kitten/components';
import { ThemedIcon } from './FontAwesomeIcons';


interface CaretToggleProps {
  isOpen: boolean;
  toggle: (on: boolean) => void;
  disabled?: boolean;
}

export const CaretToggle = ({isOpen, toggle, disabled=false}: CaretToggleProps) => (
  <Button
    appearance="ghost"
    status={disabled ? 'basic' : 'primary'}
    accessoryLeft={isOpen ? ThemedIcon('angle-up') : ThemedIcon('angle-down')}
    onPress={disabled ? undefined : () => toggle(!isOpen)}
  />
);
