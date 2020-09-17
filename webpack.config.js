const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "./src"),
  public: path.join(__dirname, "./public"),
  dist: path.join(__dirname, "./dist"),
  static: "static",
};

const baseConfig = {
  externals: {
    paths: PATHS,
  },
  entry: {
    app: PATHS.src,
  },
  output: {
    path: PATHS.dist,
    filename: `${PATHS.static}/js/[name].[hash].js`,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file",
        options: {
          name: "[name].[ext]",
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot)/,
        loader: "file",
        options: {
          name: "[name].[ext]",
        },
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css",
            options: {
              modules: true,
              sourceMap: true,
            },
          },
          {
            loader: "sass",
            options: { sourceMap: true },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  resolveLoader: {
    moduleExtensions: ["-loader"],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: "vendors",
          test: /node_modules/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: `${PATHS.static}/css/[name].[contenthash].css`,
    }),
    new HtmlWebpackPlugin({
      hash: false,
      template: `${PATHS.public}/index.html`,
      filename: "index.html",
    }),
    new CopyWebpackPlugin([
      { from: `${PATHS.src}/assets/images`, to: "static/media" },
      { from: `${PATHS.src}/assets/fonts`, to: "static/fonts" },
    ]),
  ],
};

const devConfig = merge(baseConfig, {
  mode: "development",
  devServer: {
    contentBase: `${baseConfig.externals.paths.dist}`,
    compress: true,
    port: 8081,
    watchContentBase: true,
    progress: true,
    hot: true,
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel",
          options: {
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: ["@babel/plugin-transform-react-jsx"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: { modules: true },
          },
          "postcss-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: "file",
        options: {
          name: "[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "[file].map",
    }),
  ],
});

const prodConfig = merge(baseConfig, {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel",
          options: {
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: ["@babel/plugin-transform-react-jsx"],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: { modules: true },
          },
          "postcss-loader",
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new CompressionPlugin({
      test: /\.js$|\.html$/,
      filename: "[path].gz[query]",
      threshold: 10240,
    }),
  ],
});

module.exports = (env, argv) => {
  switch (argv.mode) {
    case "production":
      return prodConfig;
    default:
      return devConfig;
  }
};
