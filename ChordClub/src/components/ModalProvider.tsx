import React, { createContext, PropsWithChildren } from 'react';
import { Status } from '../util/themeHelpers';
import { StyleSheet, View, StyleProp, ViewProps } from 'react-native';
import { Spinner, Text, Modal, Card, Button } from '@ui-kitten/components';

interface Message {
  msg: string;
  status?: Status;
}

interface State {
  message?: Message;
  waiting: boolean;
}

interface ModalContextValue {
  state: State;
  wait: (waiting?: boolean) => void;
  message: (msg: Message) => void;
  clearMessage: () => void;
}

const initialState = { waiting: false };

export const ModalContext = createContext<ModalContextValue>({
  state: initialState,
  wait: (_waiting?: boolean) => undefined,
  message: (_msg?: Message) => undefined,
  clearMessage: () => undefined,
});


export class ModalProvider extends React.Component<{}, State> {
  public state: State = initialState;

  public wait = (waiting: boolean = true) => {
    this.setState({ waiting });
  }

  public message = ({ msg, status = 'primary' }: Message) => {
    this.setState({ message: { msg, status } });
  }

  public clearMessage = () => {
    this.setState({ message: undefined });
  }

  public render() {
    const { waiting, message } = this.state;
    const value = {
      state: this.state,
      wait: this.wait,
      message: this.message,
      clearMessage: this.clearMessage,
    };
    const Footer = (props: ViewProps = {}) => (
      <View {...props}>
        <Button size={'small'} appearance={'outline'} onPress={this.clearMessage}>OK</Button>
      </View>
    );
    return (
      <ModalContext.Provider value={value}>
        {this.props.children}
        <Modal
          visible={waiting || Boolean(message)}
          backdropStyle={styles.backdrop}
        >
            {waiting &&
              <Spinner />
            }
            {message &&
              <Card status={message?.status || 'info'} footer={Footer}>
                <View>
                  <Text status={message.status}>{message.msg}</Text>
                </View>
              </Card>
            }
        </Modal>
      </ModalContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});


export interface ModalContextProps {
  modalCtx: ModalContextValue;
}

export const withModalContext = <P extends {}>(Component: React.ComponentType<P & ModalContextProps>) => {
  return (props: PropsWithChildren<P>) => (
    <ModalContext.Consumer>
      {(value: ModalContextValue) => (
        <Component
          modalCtx={value}
          {...props}
        />
      )}
    </ModalContext.Consumer>
  );
};
