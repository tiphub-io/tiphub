const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

const src = path.join(__dirname, 'src');
const dist = path.join(__dirname, 'dist');

const typescriptLoader = {
  test: /\.tsx?$/,
  use: [
    {
      loader: 'ts-loader',
      options: { transpileOnly: isDev },
    },
  ],
};
const cssLoader = {
  test: /\.css$/,
  use: [
    isDev && 'style-loader',
    !isDev && MiniCssExtractPlugin.loader,
    'css-loader',
  ].filter(Boolean),
};
const sassLoader = {
  test: /\.less$/,
  use: [
    ...cssLoader.use,
    'sass-loader',
  ],
};

module.exports = {
  mode: isDev ? 'development' : 'production',
  name: 'main',
  target: 'web',
  devtool: 'cheap-module-inline-source-map',
  entry: path.join(src, 'index.tsx'),
  output: {
    path: dist,
    filename: 'script.js',
    publicPath: isDev ? '/' : '.',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },
  module: {
    rules: [
      typescriptLoader,
      sassLoader,
      cssLoader,
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    modules: [src, path.join(__dirname, 'node_modules')],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[name].[hash:8].css',
    }),
    new HtmlWebpackPlugin({
      template: `${src}/index.html`,
      inject: true,
    }),
    isDev && new webpack.HotModuleReplacementPlugin(),
  ].filter(p => !!p),
  devServer: {
    hot: true,
  },
};