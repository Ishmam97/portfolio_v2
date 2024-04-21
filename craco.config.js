// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig, { env, paths }) => {
        // Example customization:
        // Add support for loading .mjs files
        webpackConfig.module.rules.push({
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        });
  
        // Return the modified configuration
        return webpackConfig;
      }
    }
  };
  