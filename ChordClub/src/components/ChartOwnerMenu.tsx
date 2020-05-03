import React, { useState } from 'react';
import { OverflowMenu, MenuItem, TopNavigationAction } from '@ui-kitten/components';
import { Chart } from '../types';
import { ThemedIcon } from './FontAwesomeIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface ManualProps {
  chart: Chart;
  editChart: (chart: Chart) => void;
  onDeleteChart: (chartID: number) => void;
}

interface Props extends ManualProps {}

const ChartOwnerMenu = ({ chart, onDeleteChart, editChart }: Props) => {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
  const renderActionMenu = () => (
    <TopNavigationAction
      onPress={toggleMenu}
      icon={ThemedIcon('ellipsis-v')}
    />
  );
  return (
    <OverflowMenu
      anchor={renderActionMenu}
      visible={open}
      onBackdropPress={toggleMenu}
    >
      <TouchableOpacity
        onPress={() => editChart(chart)}
      >
        <MenuItem
          accessoryLeft={ThemedIcon('edit')}
          title='Edit'
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDeleteChart(chart.id)}
      >
        <MenuItem
          accessoryLeft={ThemedIcon('trash')}
          title='Delete'
        />
      </TouchableOpacity>
    </OverflowMenu>
  );
}

export default ChartOwnerMenu;
