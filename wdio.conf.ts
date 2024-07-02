import dotenv from 'dotenv';
import {
  disableInternet,
  installApks,
  startEmulator,
  stopLogcat,
  waitForDevice,
} from './utils/adbCommands';

dotenv.config();

process.env.ANDROID_HOME =
  process.env.ANDROID_HOME || '/Users/rob/Library/Android/sdk';
process.env.ANDROID_SDK_ROOT =
  process.env.ANDROID_SDK_ROOT || '/Users/rob/Library/Android/sdk';
process.env.ANDROID_AVD_HOME =
  process.env.ANDROID_AVD_HOME || '/Users/rob/.android/avd';
process.env.EMULATOR_NAME = process.env.EMULATOR_NAME || 'Pixel_5_API_32';

// TODO: fix type
export const config: any = {
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
  maxInstances: 1,

  capabilities: [
    {
      maxInstances: 3,
      browserName: 'chrome',
      browserVersion: 'stable',
      platformName: 'Android',
      'appium:deviceName': `${process.env.EMULATOR_NAME}`,
      'appium:platformVersion': `${process.env.EMULATOR_VERSION}`,
      'appium:orientation': 'PORTRAIT',
      'appium:automationName': 'UiAutomator2',
    },
  ],

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

  services: [
    [
      'appium',
      {
        args: {
          address: 'localhost',
          port: 4723,
          log: './appium.log',
          allowInsecure: ['chromedriver_autodownload'],
        },
      },
    ],
  ],

  onPrepare: async () => {
    console.log('Preparing environment...');
    // Add emulator directory to PATH
    process.env.PATH = `${process.env.ANDROID_HOME}/emulator:${process.env.ANDROID_HOME}/platform-tools:${process.env.PATH}`;

    try {
      console.log('Starting emulator...');
      await startEmulator();
      console.log('Emulator started. Waiting for device to be ready...');
      await waitForDevice();
      console.log('Disabling internet...');
      await disableInternet();
      console.log('Emulator started and ready. Installing APKs...');
      await installApks();
    } catch (error) {
      console.error(`Error in onPrepare: ${error}`);
    }
  },
  onComplete: async () => {
    console.log('Cleaning up environment...');
    try {
      console.log('Stopping emulator...');
      // TODO: re-enable to stop emulator
      //      await stopEmulator();
      await stopLogcat();
    } catch (error) {
      console.error(`Error in onComplete: ${error}`);
    }
  },
};
