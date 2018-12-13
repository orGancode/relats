const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: './main.js',
  plugins: [
    new CleanWebpackPlugin(['dist/']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:8].css",
    }),
    new CopyWebpackPlugin([
      { from: 'src/images', to: 'images/' }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../dist/css'             //可以配置输出的css文件路径
            }
          },
          "css-loader",
          'sass-loader'
        ]
      }, {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: __dirname + 'node_modules'
      }, {
        test: /\.(png|jpeg|jpg|gif)$/,
        use: [
          { loader: 'url-loader' }
        ]
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist')    //定义输出文件夹dist路径
  }
};
