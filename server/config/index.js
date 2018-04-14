'use strict'

const postcssScss = require('postcss-scss');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path')

const fs = require('fs')
const dotenv = require('dotenv')
const envConfig = dotenv.parse(fs.readFileSync('../backend/.env'),function (err) {if (err) return console.log(err);});
for (var k in envConfig) process.env[k] = envConfig[k]

const config={
  //backend
  http:       process.env.HTTP_BACKEND||'http',
  host:       process.env.HOST_BACKEND||'vuepress.com',
  port:       process.env.PORT_BACKEND||'80',

  //client
  clienthttp: process.env.HTTP_ADMIN_CLIENT||'http',
  clienthost: process.env.HOST_ADMIN_CLIENT||'localhost',
  clientport: process.env.PORT_ADMIN_CLIENT||'8081',
};

const updCfg = require('./updateConfigs');
updCfg.updateConfigServer(config);

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: '../../backend/public/admin',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    autoOpenBrowser: false,
    assetsSubDirectory: '../static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api-noauth': {
        target: config.http+'://'+config.host+':'+config.port,
        changeOrigin: true,
        pathRewrite: {
          '^/api-noauth': ''
        }
      },

      '/api': {
        target: config.http+'://'+config.host+':'+config.port,
        changeOrigin: true,
      },

      '/favicon.ico': {
        target: config.http+'://'+config.host+':'+config.port,
        changeOrigin: true,
        pathRewrite: {
          '^favicon.ico': '/static/favicon.ico'
        }
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false,
		host: config.clienthost,
    port: config.clientport,
    allowedHosts: [
      config.host
    ],
  },



  module:
  {
    loaders:
    [
      {
        test: /\.?tmpl.pug$/,
        use:[
          {loader:'raw-loader'},
          {loader:'pug-html-loader'}
        ],
        exclude: /node_modules/
      },

      //scss
      {
        test: /\.scss$/,
        use:[
          {loader:'style-loader'},
          {loader:'css-loader',options:{importLoaders:2}},
          {loader:'postcss-loader',options:{parser:'postcss-scss'}},
        ]
      },

      //css
      {
        test: /\.css$/,
        use:[
          {loader:'style-loader'},
          {loader:'css-loader',options:{importLoaders:1}},
          {loader:'postcss-loader',options:{}}
        ]
      },

      //images
      {
        test: /\.(jpe|jpg|png|gif)(\?.*$|$)/,
        exclude: /\/node_modules\//,
        include: /images/,
        use:[{loader: 'url-loader',options:{importLoaders:1,limit:100000}}]
      },

      //woff-fonts
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },

      //svg
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      }
    ]
  },

  plugins:[
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true,
      options:
      {
        postcss: [
          autoprefixer({
            browsers: ['last 2 version', 'Explorer >= 10', 'Android >= 4']
          }),
          postcssScss
        ],
        sassLoader: {
        },
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}
