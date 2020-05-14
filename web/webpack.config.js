const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: path.resolve(__dirname, 'src/index.ts'),
    styles: path.resolve(__dirname, 'src/styles.js')
  },
  output: {
    filename: isProduction ? "assets/[name].[hash].js" : "assets/[name].js",
    path: path.resolve(__dirname, "dist")
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: "ts-loader" }
        ],
        exclude: /node_modules/,
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.s?css$/,
        use: [
          // fallback to style-loader in development
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },

    ],
  },
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {},
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: isProduction ? "assets/[name].[hash].js" : "assets/[name].js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        default: {
          minChunks: 1,
          reuseExistingChunk: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    },
    minimize: isProduction
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['dist/'],
      root: __dirname,
      verbose: true
    }),
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' },
      { from: 'node_modules/bootstrap/dist/css/bootstrap.min.css', to: 'assets' },
    ]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: isProduction ? 'assets/[name].[hash].css' : 'assets/[name].css',
      chunkFilename: 'assets/[id].css',
    }),
    // new HardSourceWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      excludeAssets: isProduction ? [/styles.*.js/] : [],
      inject: false,
      title: 'Title'
    }),
  ],
};
