/** @format */

import {AppRegistry} from 'react-native';
import CameraView from './views/CameraView';
import {name as appName} from './app.json';

console.disableYellowBox = true;
AppRegistry.registerComponent(appName, () => CameraView);
