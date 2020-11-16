const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    } 
    return config; 
};

const cssLoaders = extra => {
    const loaders = [ {
        loader: MiniCssExtractPlugin.loader,
        options: {
            hmr: isDev,
            reloadAll: true
        }
    }, 'css-loader'];

    if(extra) {
        loaders.push(extra);
    }

    return loaders;
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: './app.ts',
    //entry: './plugin/slider.ts',
    output: {
       filename: 'bundle.js',
       path: path.resolve(__dirname, 'dist'),
       //libraryTarget: 'umd',
       //umdNamedDefine: true
       //publicPath: 'dist' 
    },
    devtool: isDev ? 'source-map' : '',
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js", ".css"],
        alias: {
            '@styles': path.resolve(__dirname, 'src/styles'),
            '@': path.resolve(__dirname, 'src'),
        }
    },
    //optimization: optimization(),
    //externals: /^(jquery|\$)$/i,
    module: {
        rules: [            
            // {
            //     test: /\.ts$/,
            //     use: 'ts-loader',
            //     exclude: /node_modules/
            // },
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.ts$/,                
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript'
                        ],
                        plugins: [ '@babel/plugin-transform-typescript', 
                                  '@babel/plugin-proposal-class-properties']
                    }
                }
            },            
        ]
    },
    devServer: {
        port: 8081,
        hot: false,
        contentBase: path.join(__dirname, 'dist'),
        writeToDisk: true     
    }, 
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/favicon.ico'),
                to: path.resolve(__dirname, 'dist')
            }
        ]),
        new MiniCssExtractPlugin({
            filename: 'app.css'
            //filename: '[name][contenthash].css'
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        })
    ]
}