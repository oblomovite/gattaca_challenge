import { expect } from 'chai';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { getPackageName, isPackageInstalled, disableInternet, enableInternet, startLogcat } from '../../utils/adbCommands';

describe('Internet Connectivity Tests', () => {
    before(async () => {
        await disableInternet();
    });

    // verify that the internet is disabled
    it('should verify that the internet is disabled', async () => {
        const wifiState = execSync('adb shell dumpsys wifi | grep "Wi-Fi is"').toString();
        const dataState = execSync('adb shell dumpsys connectivity | grep "Active network"').toString();
        expect(wifiState).to.include('Wi-Fi is disabled');
        expect(dataState).to.not.include('Active network:');

    });

    // verify that the "offline" text is displayed
    it('should display "offline" text when internet is disabled', async () => {
        const isOffline = await driver.$('android=new UiSelector().textContains("offline")');
        const isDisplayed = await isOffline.isDisplayed();
        expect(isDisplayed).to.be.true;
    });

    after(async () => {
        await enableInternet();
    });
});


describe('Internet Connectivity Tests', () => {
    before(async () => {
        await enableInternet();
    });

   // verify that the internet is enabled
    it('should verify that the internet is enabled', async () => {
        const wifiState = execSync('adb shell dumpsys wifi | grep "Wi-Fi is"').toString();
        const dataState = execSync('adb shell dumpsys connectivity | grep "Active network"').toString();

        expect(wifiState).to.include('Wi-Fi is enabled');
        expect(dataState).to.include('Active network:');
    });
    

    // verify no "offline" text is displayed
    it('should not display "offline" text when internet is enabled', async () => {
        const isOffline = await driver.$('android=new UiSelector().textContains("offline")');
        const isDisplayed = await isOffline.isDisplayed();
        expect(isDisplayed).to.be.false;
    });
});


describe('APK Installation Verification', () => {
    const apkDir = path.resolve(__dirname, '../../apks');
    const apks = fs.readdirSync(apkDir).filter(file => file.endsWith('.apk'));

    apks.forEach(apk => {
        it(`should verify that ${apk} is installed`, async () => {
            const apkPath = path.join(apkDir, apk);
            const packageName = await getPackageName(apkPath);
            const installed = await isPackageInstalled(packageName);
            expect(installed).to.be.true;
        });
    });
});

describe('Internet Connectivity Tests', () => {
    const apks = fs.readdirSync(`${process.env.APK_DIR}`).filter(file => file.endsWith('.apk'));

    before(async () => {
        console.log('Disabling internet...');
        await disableInternet();
        await startLogcat();

    });

    apks.forEach(apk => {
        it(`should display "offline" text when internet is disabled for ${apk}`, async () => {
            const apkPath = path.join(`${process.env.APK_DIR}`, apk);
            console.log(`Processing APK: ${apk}`);
            const packageName = await getPackageName(apkPath);
            const installed = await isPackageInstalled(packageName);

            if (installed) {
                console.log(`Package ${packageName} is installed. Launching app...`);
                await driver.activateApp(packageName);

                console.log('Checking for "offline" text...');
                const isOffline = await driver.$('android=new UiSelector().textContains("offline")');
                const isDisplayed = await isOffline.isDisplayed();

                if (isDisplayed) {
                    console.log(`"offline" text is displayed for ${packageName}`);
                } else {
                    console.log(`"offline" text is NOT displayed for ${packageName}`);
                }

                expect(isDisplayed).to.be.true;

                console.log(`Terminating app ${packageName}...`);
                await driver.terminateApp(packageName);
            } else {
                console.log(`Package ${packageName} is not installed.`);
                throw new Error(`APK ${apk} is not installed.`);
            }
        });
    });

    after(async () => {
        console.log('Enabling internet...');
        await enableInternet();

    });
});