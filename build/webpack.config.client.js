import webpack from 'webpack';
import webpackConfig from './webpack.config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import clone from 'clone';
import config from '../config';
import _debug from 'debug';
import layout from '../config/layout';

const debug = _debug('app:webpack:config');
const paths = config.utils_paths;
const {
    __DEV__,
    __PROD__,
    __TEST__,
} = config.globals;

debug('Create client configuration.');
const webpackConfigClient = clone(webpackConfig);
webpackConfigClient.name = 'client';
webpackConfigClient.target = 'web';

const APP_ENTRY_PATHS = [
    paths.src(config.entry_client),
];

webpackConfigClient.entry = {
    app: __DEV__
    ? APP_ENTRY_PATHS.concat(`webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr`)
    : APP_ENTRY_PATHS,
    vendor: config.compiler_vendor,
};

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfigClient.output = {
    filename: `[name].[${config.compiler_hash_type}].js`,
    path: paths.public(),
    publicPath: config.compiler_public_path,
};

if (__DEV__) {
    debug('Enable plugins for live development (HMR, NoErrors).');

    webpackConfigClient.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    );
};

if (__PROD__) {
    debug('Enable plugins for production');

    webpackConfigClient.plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
            },
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
            },
            comments: false,
        }),
    );
};

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
    webpackConfigClient.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor'],
        })
    );
}

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809

const CSS_LOADER_REGEX = /css/;

if (!__DEV__) {
    debug('Apply ExtractTextPlugin to CSS loaders.');

    webpackConfigClient.module.rules.filter(loader => {
        return loader.use && Array.isArray(loader.use) && loader.use.find(name => {
            const cssLoader = CSS_LOADER_REGEX.test(name.split('?')[0]);
            return cssLoader;
        });
    })
    .forEach(cssLoader => {
        const [ first, ...rest ] = cssLoader.use;

        cssLoader.loader = ExtractTextPlugin.extract({
            fallbackLoader: first,
            loader: rest.join('!'),
        });

        Reflect.deleteProperty(cssLoader, 'use');
    })

    webpackConfigClient.plugins.push(
        new ExtractTextPlugin({
            filename: '[name].[contenthash].css',
            allChunks: true,
            disable: false,
        }),
    );
}

export default webpackConfigClient;
