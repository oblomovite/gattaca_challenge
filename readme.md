# Overview

This project is code challenge for a job application.

The goal of this project is to scaffold a cli to automate testing of android applications.

## Requirements

The cli should be able to:

- Install an apk on a device
- Toggle the device's wifi (starting in the off state)
- Log information about the status of the apk
- Run tests on that apk

## Installation

- clone the repository
- run `npm install`

## Requirements

- android studio
- apks to test
- appium server

## Configuration

- configure the environment variables in the `.env` file replacing the placeholders with the actual values
- ensure `ADB` is in your path

```bash
# on macos
ANDROID_HOME= #/Users/<user>/Library/Android/sdk
ANDROID_SDK_ROOT= #/Users/<user>/Library/Android/sdk
ANDROID_AVD_HOME= #/Users/<user>/.android/avd
EMULATOR_NAME= #Pixel_5_API_32
```

## Run the cli

- Run the appium server with a chromedriver autodownload flag

```bash
npx appium --allow-insecure chromedriver_autodownload
```

- Run the tests

```bash
npx wdio run wdio.conf.js
```

## TODOS

- [x] install apks on a device
- [x] toggle the device's wifi
- [x] log information about the status of the apk
- [x] run tests on that apk
- [ ] fix environment variables for appium server

## Enhancements List

- [ ] Streamline apk folder inflation with a script
- [ ] Provide LLM integration
- [ ] Enable app logging to track the app's behavior
- [ ] Add a report generator
- [ ] Add a test coverage tool
- [ ] Use LLMs to generate wdio configuration files for each apk

## Tech

- `wdio` because it is popular and has a lot of plugins
- `appium` because it is a popular tool for testing mobile applications

## Design (what I would have done differently)

- Factory pattern to generate the wdio configuration files for each apk using LLMs
- App logging to track the app's behavior

## Known Bugs

- Sometimes the apks do not install if the emulator is not already running and requires running the tests twice
- Appium server doesn't interact with emulator due to some issue, so this project is incomplete
