declare const config: {
    appId: string;
    appName: string;
    webDir: string;
    server: {
        androidScheme: string;
    };
    android: {
        backgroundColor: string;
        allowMixedContent: boolean;
    };
    plugins: {
        SplashScreen: {
            launchShowDuration: number;
            backgroundColor: string;
            androidSplashResourceName: string;
            showSpinner: boolean;
        };
        StatusBar: {
            style: string;
            backgroundColor: string;
        };
    };
};
export default config;
