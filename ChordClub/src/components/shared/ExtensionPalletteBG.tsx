import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { GET_EXTENSIONS, GetExtensionsData } from '../../gql/extension';
import { ButtonPallette } from './ButtonPallette';
import { Extension } from '../../types';
import { Spinner } from '@ui-kitten/components';
import ErrorText from '../ErrorText';
import { displayExtension } from '../../util/strings';

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

