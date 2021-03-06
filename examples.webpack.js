var webpack = require("webpack"),
    DedupePlugin = webpack.optimize.DedupePlugin,
    Clean = require('clean-webpack-plugin'),
    path = require('path'),
    fs = require('fs'),
    getPackageJson = function () {
        return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    },
    pkg = getPackageJson();

var config = {
    cache: true,
    debug: true,
    devtool: 'sourcemap',
    entry: {
        'examples/simple/dist/simple-bundle': './examples/simple/src/simple.js'
    },
    output: {
        path: './',
        filename: '[name].js',
        library: 'kompo-customelement',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['', '.js', '.json'],
        modulesDirectories: ["node_modules"]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new DedupePlugin()
    ]
};

module.exports = config;

