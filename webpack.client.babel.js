/**
 * COMMON WEBPACK CONFIGURATION
 */

import path from 'path';
import webpack from 'webpack';
import jsonImporter from 'node-sass-json-importer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import globals from './globals';

const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  devtool: isDevelopment ? 'eval-source-map' : 'source-map'
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
    extensions: ['', '.js', '.jsx']
    //, modulesDirectories: ['client', 'shared', 'node_modules']
  }
  , target: 'web' // Make web variables accessible to webpack, e.g. window
  , stats: false // Don't show stats in the console
  , progress: true
  , sassLoader: {importer: jsonImporter}
  , plugins: [
    new webpack.DefinePlugin(Object.assign({}, globals, {GLOBAL_BROWSER: 'true'}))
    //, new webpack.optimize.CommonsChunkPlugin('common.js')
    , isDevelopment ? null : new webpack.optimize.OccurrenceOrderPlugin(true)
    , isDevelopment ? null : new webpack.optimize.DedupePlugin()
    , isDevelopment ? null : new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
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
  ].filter(p => p != null)
  , module: {
    loaders: [{
      test: /\.jsx?$/, // Transform all .js files required somewhere with Babel
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: isDevelopment
          ? ['es2015', 'react', 'react-hmre', 'stage-0']
          : ['es2015', 'react', 'stage-0']
        , plugins: ['babel-root-import', 'transform-class-properties']
      }
    }, {
      // Transform our own .css files with PostCSS and CSS-modules
      test: /(\.css|\.scss)$/,
      exclude: /node_modules/,
      loaders: [
        'style-loader'
        , isDevelopment ? 'css-loader' : 'css-loader'
        // it was: , isDevelopment ? 'css-loader?sourceMap' : 'css-loader'
        // but check this: https://github.com/webpack/css-loader/issues/296
        , isDevelopment ? 'sass-loader?sourceMap' : 'sass-loader'
      ]
    }, {
      // Do not transform vendor's CSS with CSS-modules
      // The point is that they remain in global scope.
      // Since we require these CSS files in our JS or CSS files,
      // they will be a part of our compilation either way.
      // So, no need for ExtractTextPlugin here.
      test: /\.css$/,
      include: /node_modules/,
      loaders: ['style-loader', 'css-loader?minimize=false']
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader'
    }, {
      test: /\.(jpg|png|gif|mp3)$/,
      loader: 'file-loader'
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  }
};
