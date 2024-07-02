import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Wrapper for running adb commands
function runAdbCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
                return;
            }
            console.log(`stdout: ${stdout}`);
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

// Wrapper for running adb install command
function runAdbInstall(apkPath: string) {
    return new Promise<void>((resolve, reject) => {
        console.log(`Installing APK from path: ${apkPath}...`);
        const adbInstall = spawn('adb', ['install', '-r', apkPath]);

        adbInstall.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        adbInstall.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        adbInstall.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`adb install process exited with code ${code}`));
            }
        });
    });
}

// install all apks in the /apks folder
export async function installApks() {
    const apks = fs.readdirSync(`${process.env.APK_DIR}`).filter(file => file.endsWith('.apk'));
    for (const apk of apks) {
        const apkPath = path.join(`${process.env.APK_DIR}`, apk);
        await runAdbInstall(apkPath);
    }
}

// Get package name from APK
export async function getPackageName(apkPath: string) {
    const command = `aapt dump badging ${apkPath} | grep package:\\ name`;
    const output = await runAdbCommand(command);
    const match = output.match(/name='([^']+)'/);
    if (match && match[1]) {
        return match[1];
    }
    throw new Error(`Failed to get package name from APK: ${apkPath}`);
}

// Check if package is installed
export async function isPackageInstalled(packageName: string) {
    const output = await runAdbCommand(`adb shell pm list packages ${packageName}`);
    return output.includes(packageName);
}

// Start emulator
export async function startEmulator() {
    console.log('Starting emulator...');
    const emulatorPath = `${process.env.ANDROID_HOME}/emulator/emulator`;
    const avdName = process.env.EMULATOR_NAME;
    const command = `${emulatorPath} -avd ${avdName} -no-boot-anim -no-snapshot-load -wipe-data -no-audio`;
    console.log(`Emulator command: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting emulator: ${error}`);
            return;
        }
        console.log(`Emulator stdout: ${stdout}`);
        console.error(`Emulator stderr: ${stderr}`);
    });

    console.log('Waiting for emulator to be ready...');
    await waitForDevice();
}

// Wait for device to be ready
export async function waitForDevice() {
    let attempts = 0;
    const maxAttempts = 20;
    while (attempts < maxAttempts) {
        try {
            await runAdbCommand('adb wait-for-device');
            const bootComplete = await runAdbCommand('adb shell getprop sys.boot_completed');
            const bootAnim = await runAdbCommand('adb shell getprop init.svc.bootanim');
            if (bootComplete.trim() === '1' && bootAnim.trim() === 'stopped') {
                console.log('Device is fully booted.');
                // Wait for an additional 10 seconds to ensure all services are running
                await new Promise(resolve => setTimeout(resolve, 10000));
                return;
            }
        } catch (error) {
            console.log(`Waiting for device... Attempt ${attempts + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        attempts += 1;
    }
    throw new Error('Device did not become ready in time.');
}

// Stop emulator
export async function stopEmulator() {
    console.log('Stopping emulator...');
    await runAdbCommand('adb emu kill');
}

// Enable internet
export async function enableInternet() {
    console.log('Enabling internet...');
    try {
        await runAdbCommand('adb shell svc wifi enable');
        await runAdbCommand('adb shell svc data enable');
    } catch (error) {
        console.error('Failed to enable internet using svc, trying alternative method.');
        try {
            await runAdbCommand('adb shell settings put global airplane_mode_on 0');
            await runAdbCommand('adb shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state false');
        } catch (error) {
            console.error('Failed to enable internet using alternative method.', error);
        }
    }
}

// Disable internet
export async function disableInternet() {
    console.log('Disabling internet...');
    try {
        await runAdbCommand('adb shell svc wifi disable');
        await runAdbCommand('adb shell svc data disable');
    } catch (error) {
        console.error('Failed to disable internet using svc, trying alternative method.');
        try {
            await runAdbCommand('adb shell settings put global airplane_mode_on 1');
            await runAdbCommand('adb shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true');
        } catch (error) {
            console.error('Failed to disable internet using alternative method.', error);
        }
    }
}

let logcatProcess: ChildProcessWithoutNullStreams | null;
export async function startLogcat() {
    console.log('Starting logcat...');
    logcatProcess = spawn('adb', ['logcat']);

    logcatProcess.stdout.on('data', (data) => {
        console.log(`logcat: ${data}`);
    });

    logcatProcess.stderr.on('data', (data) => {
        console.error(`logcat error: ${data}`);
    });
}

// Stop logcat
export async function stopLogcat() {
    if (logcatProcess) {
        console.log('Stopping logcat...');
        logcatProcess.kill();
        logcatProcess = null;
    }
}

