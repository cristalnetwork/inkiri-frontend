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
      modifyVars: { '@primary-color': '#1DA57A' },
      ident: 'postcss',
      sourceMap: true, // should skip in production
      importLoaders: true,
            
    }),
    addWebpackAlias({
      '@app': path.resolve(__dirname, 'src/')
    })
);