import React, {useState} from 'react';
import {Button, Modal, Text, Input, Spinner} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';

import {useMutation, useQuery} from '@apollo/react-hooks';
import {CREATE_USER, CreateUserVariables, GetMeData, GET_ME} from '../gql/user';
import ErrorText from './ErrorText';

const UsernameForm = ({done}: {done: () => void}) => {
  const [createUser, {loading, data, error}] = useMutation<
    {},
    CreateUserVariables
  >(CREATE_USER);
  const [username, setUsername] = useState('');

  return (
    <View>
      <Text category={'label'}>Please enter a username</Text>
      <Input
        disabled={loading || Boolean(data)}
        placeholder={'Username'}
        value={username}
        onChangeText={setUsername}
        autoCapitalize={'none'}
      />
      {error && <ErrorText error={error} />}
      {data && <Button onPress={done}>Ok,let's go!</Button>}
      {!data && (
        <Button
          disabled={loading}
          onPress={() => createUser({variables: {newUser: {username}}})}>
          Save
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

const UserModal = ({}) => {
  const {data, loading, error, refetch} = useQuery<GetMeData>(GET_ME);
  return (
    <Modal visible={!data?.me.username} backdropStyle={styles.backdrop}>
      {loading && <Spinner size={'giant'} />}
      {error && <ErrorText retry={refetch} error={error} />}
      {!loading && !error && <UsernameForm done={refetch} />}
    </Modal>
  );
};

export default UserModal;
