const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

const src = path.join(__dirname, 'src');
const dist = path.join(__dirname, 'dist');

const isDev = process.env.NODE_ENV !== 'production';
const publicPath = isDev ? '/' : '/static';

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
const lessLoader = {
  test: /\.less$/,
  use: [
    ...cssLoader.use,
    'less-loader',
  ],
};
const fileLoader = {
  test: /\.(png|woff|woff2|eot|ttf|svg)$/,
  use: [{
    loader: 'file-loader',
    options: {
      publicPath,
      name: '[folder]/[name].[ext]',
    },
  }],
}

module.exports = {
  mode: isDev ? 'development' : 'production',
  name: 'main',
  target: 'web',
  devtool: 'cheap-module-inline-source-map',
  entry: path.join(src, 'index.tsx'),
  output: {
    path: dist,
    filename: 'script.js',
    publicPath,
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
  },
  module: {
    rules: [
      typescriptLoader,
      lessLoader,
      cssLoader,
      fileLoader,
    ].filter(r => !!r),
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
    new DotenvPlugin({ systemvars: true }),
    isDev && new webpack.HotModuleReplacementPlugin(),
  ].filter(p => !!p),
  devServer: {
    hot: true,
    historyApiFallback: true,
  },
};