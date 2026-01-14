const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const extraExposes = {};

const getRoutes = () => {
  if (process.env.USE_LOCAL_RASA && process.env.USE_LOCAL_RASA !== '') {
    return {
      '/api/virtual-assistant/v2': { host: 'http://localhost:5000' },
    };
  }

  return [
    {
      context: ['/apps/assisted-installer-ui-chatbot'],
      target: 'http://localhost:7003',
      changeOrigin: true,
      secure: false,
    },
    {
      context: ['/api/chrome-service/v1/static/fed-modules-generated.json'],
      target: 'https://prod.foo.redhat.com:1337', // Point to the base domain/port
      pathRewrite: {
        '^/api/chrome-service/v1/static/fed-modules-generated.json': '/apps/virtual-assistant/fed-modules-generated.json'
      },
      changeOrigin: true,
      secure: false,
    },
  ];
};

module.exports = {
  appUrl: ['/go-to-landing-page'],
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  routes: getRoutes(),
  interceptChromeConfig: false,
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
    exposes: {
      './AstroVirtualAssistant': path.resolve(__dirname, './src/SharedComponents/AstroVirtualAssistant/AstroVirtualAssistant.tsx'),
      './useArhChatbot': path.resolve(__dirname, './src/aiClients/useArhClient.ts'),
      './useRhelChatbot': path.resolve(__dirname, './src/aiClients/useRhelLightSpeedManager.ts'),
      './useVaChatbot': path.resolve(__dirname, './src/aiClients/useVaManager.ts'),
      './state/globalState': path.resolve(__dirname, './src/utils/VirtualAssistantStateSingleton.ts'),
      ...extraExposes,
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "fed-modules-generated.json"),
          to: "fed-modules-generated.json",
        },
      ],
    }),
  ],
  sassPrefix: '.virtualAssistant',
  hotReload: process.env.HOT === 'true',
};
