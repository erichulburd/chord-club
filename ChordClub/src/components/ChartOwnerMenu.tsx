import React, {useState} from 'react';
import {
  OverflowMenu,
  MenuItem,
  TopNavigationAction,
} from '@ui-kitten/components';
import {Chart} from '../types';
import {ThemedIcon} from './FontAwesomeIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface ManualProps {
  chart: Chart;
  editChart: (chart: Chart) => void;
  deleteChart: (chartID: number) => void;
}

interface Props extends ManualProps {}

const ChartOwnerMenu = ({chart, deleteChart, editChart}: Props) => {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
  const renderActionMenu = () => (
    <TopNavigationAction onPress={toggleMenu} icon={ThemedIcon('caret-down')} />
  );
  const onEditChart = () => {
    setOpen(false);
    editChart(chart);
  };
  const onDeleteChart = () => {
    setOpen(false);
    deleteChart(chart.id);
  };
  return (
    <OverflowMenu
      anchor={renderActionMenu}
      visible={open}
      onBackdropPress={toggleMenu}>
      <TouchableOpacity onPress={onEditChart}>
        <MenuItem accessoryLeft={ThemedIcon('edit')} title="Edit" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDeleteChart}>
        <MenuItem accessoryLeft={ThemedIcon('trash')} title="Delete" />
      </TouchableOpacity>
    </OverflowMenu>
  );
};

export default ChartOwnerMenu;
