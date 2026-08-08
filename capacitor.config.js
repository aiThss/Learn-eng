const config = {
    appId: 'com.englishup.app',
    appName: 'EnglishUp',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
    android: {
        backgroundColor: '#0f172a',
        allowMixedContent: false,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#0f172a',
            androidSplashResourceName: 'splash',
            showSpinner: false,
        },
        StatusBar: {
            style: 'LIGHT',
            backgroundColor: '#0f172a',
        },
    },
};
export default config;
