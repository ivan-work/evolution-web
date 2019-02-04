/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require('path');

const globals = require('./globals');

const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const jsonImporter = require('node-sass-json-importer');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProfiling = process.env.PROFILE === 'true';

module.exports = {
  mode: isDevelopment ? 'development' : 'production'
  , devtool: isDevelopment ? 'eval' : 'source-map'
  , entry: isDevelopment
    ? ['webpack-hot-middleware/client'
      , './client/index.jsx']
    : './client/index.jsx'
  , output: { // Compile into js/build.js
    path: path.join(__dirname, 'dist/client/')
    , publicPath: isDevelopment ? '/' : '/'
    , filename: isDevelopment ? '[name].js' : '[name].[chunkhash].js'
    , chunkFilename: isDevelopment ? '[name].js' : '[name].[chunkhash].js'
  }
  , resolve: {
    extensions: ['.js', '.jsx']
    //, modulesDirectories: ['client', 'shared', 'node_modules']
  }
  , target: 'web' // Make web variables accessible to webpack, e.g. window
  // , stats: false // Don't show stats in the console
  , optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
  , plugins: [
    new webpack.DefinePlugin(Object.assign({}, globals, {GLOBAL_BROWSER: 'true'}))
    , new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    , new webpack.IgnorePlugin(/^\.\/(?!en)(.+)$/, /validatorjs\/src\/lang/)
    //, new webpack.optimize.CommonsChunkPlugin('common.js')
    , isDevelopment ? new webpack.HotModuleReplacementPlugin({quiet: false}) : null
    , new HtmlWebpackPlugin({
      template: 'client/index.html'
      , inject: true
      , favicon: 'favicon.ico'
      , minify: isDevelopment ? null : {
        removeComments: true
        , collapseWhitespace: true
        , removeRedundantAttributes: true
        , useShortDoctype: true
        , removeEmptyAttributes: true
        , removeStyleLinkTypeAttributes: true
        , keepClosingSlash: true
        , minifyJS: true
        , minifyCSS: true
        , minifyURLs: true
      }
    })
    , isProfiling ? new BundleAnalyzerPlugin({analyzerMode: 'static'}) : null
  ].filter(p => p != null)
  , module: {
    rules: [{
      test: /\.jsx?$/, // Transform all .js files required somewhere with Babel
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      // Transform our own .css files with PostCSS and CSS-modules
      test: /(\.css|\.scss)$/,
      exclude: /node_modules/,
      use: [
        {loader: 'style-loader'}
        , {loader: 'css-loader'}
        , {
          loader: 'sass-loader'
          , options: {
            sourceMap: isDevelopment
            , importer: jsonImporter()
          }
        }]
    }, {
      // Do not transform vendor's CSS with CSS-modules
      // The point is that they remain in global scope.
      // Since we require these CSS files in our JS or CSS files,
      // they will be a part of our compilation either way.
      // So, no need for ExtractTextPlugin here.
      test: /\.css$/,
      include: /node_modules/,
      loaders: ['style-loader', 'css-loader']
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader'
    }, {
      test: /\.(jpg|png|gif|mp3)$/,
      loader: 'file-loader'
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }]
  }
};
