import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import logger from './logger';

if (Reactotron.log && Reactotron.logImportant) {
  logger.appendLogger({
    log: Reactotron.log.bind(Reactotron),
    info: Reactotron.log.bind(Reactotron),
    debug: Reactotron.log.bind(Reactotron),
    warn: Reactotron.logImportant.bind(Reactotron),
    error: Reactotron.logImportant.bind(Reactotron),
  })
}

let r = Reactotron;
if (r.setAsyncStorageHandler) {
  r = r.setAsyncStorageHandler(AsyncStorage)
}
r.configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .connect() // let's connect!
