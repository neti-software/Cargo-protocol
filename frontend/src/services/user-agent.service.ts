export enum MobileDevice {
    ios = 'ios',
    android = 'android',
    unknown = 'unknown',
}

export default class UserAgentService {
    static getUserAgent(): MobileDevice {
        // @ts-ignore
        const userAgent = navigator.userAgent || navigator.vendor || window['opera'];

        if (userAgent.match(/iPhone/i)) {
            return MobileDevice.ios;
        } else if (userAgent.match(/Android/i)) {
            return MobileDevice.android;
        } else {
            return MobileDevice.unknown;
        }
    }

    static isMobile(): boolean {
        const userAgent = this.getUserAgent();

        return userAgent !== MobileDevice.unknown;
    }
}
