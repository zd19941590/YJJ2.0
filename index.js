/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import {
    AppRegistry
} from 'react-native';

import storage from './config/storage.config';
import './config/axios.config';
import App from './APP.js';

global.storage = storage;

AppRegistry.registerComponent('YJJApp', () => App);
