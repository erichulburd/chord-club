import React, {useState} from 'react';
import {UserConsumerProps, withUser} from './UserContext';
import {Card, Button, Input, Text} from '@ui-kitten/components';
import {ViewProps, View, StyleSheet} from 'react-native';
import {ModalContextProps, withModalContext} from './ModalProvider';
import {useMutation} from 'react-apollo';
import {DELETE_USER} from '../gql/user';
import ErrorText from './ErrorText';

interface Props extends UserConsumerProps, ModalContextProps {}

const Account = ({userCtx, modalCtx}: Props) => {
  const [username, setUsername] = useState(userCtx.user?.username || '');
  const [deleteUser, deleteUserResult] = useMutation(DELETE_USER);
  const confirmDeleteAccount = () => {
    modalCtx.message(
      {
        msg:
          'Once you delete your account, we cannot recoer your data. Please confirm your intention below.',
        status: 'danger',
      },
      {
        confirm: () => {
          deleteUser();
        },
        cancel: () => {},
      },
    );
  };
  const save = () => {
    userCtx.updateUsername(username);
  };
  const Footer = (props: ViewProps | undefined) => (
    <View {...props}>
      <Button
        disabled={deleteUserResult.loading}
        size="giant"
        status="danger"
        appearance="outline"
        onPress={confirmDeleteAccount}>
        Delete Account
      </Button>
    </View>
  );
  const loading = userCtx.userUpdateLoading || deleteUserResult.loading;
  return (
    <Card disabled status="basic" footer={Footer} style={styles.container}>
      <View style={styles.formRow}>
        <Text>Username</Text>
      </View>
      <View style={styles.formRow}>
        <Input
          autoCapitalize="none"
          value={username}
          onChangeText={(update) => setUsername(update)}
        />
      </View>
      <View style={[styles.controlContainer, styles.formRow]}>
        <Button
          appearance="outline"
          size="small"
          disabled={loading}
          onPress={save}>
          Save
        </Button>
        <Button
          appearance="outline"
          size="small"
          status="warning"
          onPress={() => setUsername(userCtx.user?.username || '')}
          disabled={loading}>
          Cancel
        </Button>
      </View>
      {userCtx.userUpdateError && <ErrorText error={userCtx.userUpdateError} />}
    </Card>
  );
};

const styles = StyleSheet.create({
  controlContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  formRow: {
    marginTop: 5,
    marginBottom: 5,
  },
});

export default withUser<{}>(withModalContext<UserConsumerProps>(Account));
