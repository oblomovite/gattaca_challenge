import type { Options } from '@wdio/types';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { startEmulator, 
//    stopEmulator, 
    installAllApks,
    waitForDevice,
} from './utils/adbCommands'

dotenv.config();

process.env.ANDROID_HOME = process.env.ANDROID_HOME || '/Users/rob/Library/Android/sdk';
process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT || '/Users/rob/Library/Android/sdk';
process.env.ANDROID_AVD_HOME = process.env.ANDROID_AVD_HOME || '/Users/rob/.android/avd';
process

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './test/tsconfig.json',
      transpileOnly: true,
    },
  },

  port: 4723,
  specs: ['./test/specs/**/*.ts'],
  exclude: [],
  maxInstances: 10,

  capabilities: [{
      'appium:deviceName': process.env.EMULATOR_NAME,
      'appium:platformVersion': '12.0',
      'appium:automationName': 'UiAutomator2',
      'appium:noReset': true,
      maxInstances: 3,
      browserName: 'chrome',
      browserVersion: 'stable',
      platformName: 'Android',
      //   'appium:app': path.resolve(
      //     __dirname,
      //     process.env.APK_PATH || './apks/lichess.apk'
      //   ),
    },],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  baseUrl: 'http://localhost',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

    onPrepare: async () => {
        console.log('Preparing environment...');
        // Add emulator directory to PATH
        process.env.PATH = `${process.env.ANDROID_HOME}/emulator:${process.env.ANDROID_HOME}/platform-tools:${process.env.PATH}`;
        try {
            await startEmulator();
            await waitForDevice(); // Ensure the device is ready
            console.log('Emulator started and ready. Installing APKs...');
            await installAllApks(path.resolve(__dirname, './apks'));
            console.log('APKs installed.');
        } catch (error) {
            console.error(`Error in onPrepare: ${error}`);
        }
    },
    onComplete: async () => {
        console.log('Cleaning up environment...');
        try {
            console.log('Stopping emulator...');
            // await stopEmulator();
        } catch (error) {
            console.error(`Error in onComplete: ${error}`);
        }
    },
};

