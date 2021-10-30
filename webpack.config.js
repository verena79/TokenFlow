var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {

  const mode = argv.mode || 'development';

  const config = {
    mode,
    entry: {
      modeler: './src/modeler.js',
      viewer: './src/viewer.js'
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/dist'
    },
    module: {
      rules: [
        {
          test: /\.bpmn$/,
          use: {
            loader: 'raw-loader'
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: './node_modules/bpmn-js/dist/assets', to: 'dist/vendor/bpmn-js/assets' },
          { from: './node_modules/bpmn-js-token-simulation/assets', to: 'dist/vendor/bpmn-js-token-simulation/assets' }
        ]
      })
    ]
  };

  if (mode === 'production') {
    config.devtool = 'source-map';
  }

  return config;
};
