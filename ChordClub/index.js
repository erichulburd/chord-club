/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import { Buffer } from 'buffer';

// https://stackoverflow.com/questions/55226768/error-unable-to-resolve-module-buffer-react-native
global.Buffer = Buffer;

AppRegistry.registerComponent(appName, () => App);
