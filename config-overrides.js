const { override, fixBabelImports, addLessLoader, addWebpackAlias } = require('customize-cra');
const path = require("path");

module.exports = override(
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
    addLessLoader({
      javascriptEnabled: true,
      modifyVars: { 
        // '@primary-color': '#1DA57A' 
        , '@font-family': "'Proxima Nova', -apple-system,'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif ;"
        , '@code-family': "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;"
        // , '@shadow-color' : 'transparent'

      },
      ident: 'postcss',
      sourceMap: true, // should skip in production
      importLoaders: true,
            
    }),
    addWebpackAlias({
      '@app': path.resolve(__dirname, 'src/')
    })
);