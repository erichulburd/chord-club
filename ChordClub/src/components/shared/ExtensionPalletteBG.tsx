import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_EXTENSIONS, GetExtensionsData } from '../../gql/extension';
import { ButtonPallette } from './ButtonPallette';
import { Extension, ExtensionType } from '../../types';
import { Spinner } from '@ui-kitten/components';
import ErrorText from '../ErrorText';

const displayExtentionType = (et: ExtensionType) => {
  switch(et) {
    case ExtensionType.Flat:
      return 'b';
    case ExtensionType.Sharp:
      return '#';
    default:
      return '';
  }
}

const displayExtension = (e: Extension) => (
  `${displayExtentionType(e.extensionType)}${e.degree}`
);

interface Props {
  selected: Extension[];
  onExtensionUpdate: (e: Extension) => void;
}

export const ExtensionPalletteBG = ({ selected, onExtensionUpdate }: Props) => {
  const { data, loading, error } = useQuery<GetExtensionsData>(GET_EXTENSIONS)
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <ErrorText error={error} />;
  }
  return (
    <ButtonPallette
      getUniqKey={(e => displayExtension(e))}
      options={data?.extensions || []}
      selected={selected}
      displayValue={displayExtension}
      onSelect={onExtensionUpdate}
    />
  );
};

