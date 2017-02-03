import webpack from 'webpack';
import cssnano from 'cssnano';
import config from '../config';
import _debug from 'debug';

const debug = _debug('app:webpack:config');
const paths = config.utils_paths;

debug('Create generic configuration.');

const webpackConfig = {
    devtool: config.compiler_devtool,
    resolve: {
        modules: [
            paths.src(),
            'node_modules',
        ],
        extensions: [
            '.js',
            '.jsx',
            '.json',
        ],
    },
    module: {
        rules: [],
    },
};

webpackConfig.plugins = [
    new webpack.DefinePlugin(config.globals),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.LoaderOptionsPlugin({
        options: {
            context: __dirname,
            postcss: [
                cssnano({
                    autoprefixer: {
                        add: true,
                        remove: true,
                        browsers: ['last 2 versions'],
                    },
                    discardComments: {
                        removeAll: true,
                    },
                    discardUnused: false,
                    mergeIdents: false,
                    reduceIdents: false,
                    safe: true,
                    sourcemap: true,
                }),
            ],
            sassLoader: {
                includePaths: paths.src('styles'),
            },
        }
    }),
];

webpackConfig.module.rules = [{
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
    options: {
        cacheDirectory: true,
        plugins: [
            'transform-runtime',
            'transform-decorators-legacy',
            'add-react-displayname',
        ],
        env: {
            development: {
                presets: [
                    [
                        'es2015',
                        {
                            modules: false,
                        },
                    ],
                    'react',
                    'stage-0',
                ],
            },
            production: {
                presets: [
                    [
                        'es2015',
                        {
                            modules: false,
                        },
                    ],
                    'react',
                    'stage-0',
                    'react-optimize',
                ],
            },
        },
    },
}];

// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css-loader?sourceMap&-minimize';

// Add any packge names here whose styles need to be treated as CSS modules.
// These paths will be combined into a single regex.
const PATHS_TO_TREAT_AS_CSS_MODULES = [
  // 'react-toolbox', (example)
];

// If config has CSS modules enabled, treat this project's styles as CSS modules.
if (config.compiler_css_modules) {
    PATHS_TO_TREAT_AS_CSS_MODULES.push(
    paths.src().replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&') // eslint-disable-line
  );
}

const isUsingCSSModules = !!PATHS_TO_TREAT_AS_CSS_MODULES.length;
const cssModulesRegex = new RegExp(`(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`);

// Loaders for styles that need to be treated as CSS modules.
if (isUsingCSSModules) {
    const cssModulesLoader = [
        BASE_CSS_LOADER,
        'modules',
        'importLoaders=1',
        'localIdentName=[name]__[local]___[hash:base64:5]',
    ].join('&');

    webpackConfig.module.rules.push({
        test: /\.scss$/,
        include: cssModulesRegex,
        use: [
            'simple-universal-style-loader',
            cssModulesLoader,
            'postcss-loader',
            'sass-loader?sourceMap',
        ],
    });

    webpackConfig.module.rules.push({
        test: /\.css$/,
        include: cssModulesRegex,
        use: [
            'simple-universal-style-loader',
            cssModulesLoader,
            'postcss-loader',
        ],
    });
}

// Loaders for files that should not be treated as CSS modules.
const excludeCSSModules = isUsingCSSModules ? cssModulesRegex : false;

webpackConfig.module.rules.push({
    test: /\.scss$/,
    exclude: excludeCSSModules,
    use: [
        'simple-universal-style',
        BASE_CSS_LOADER,
        'postcss-loader',
        'sass?sourceMap',
    ],
});

webpackConfig.module.rules.push({
    test: /\.css$/,
    exclude: excludeCSSModules,
    use: [
        'simple-universal-style',
        BASE_CSS_LOADER,
        'postcss-loader',
    ],
});

/* eslint-disable */
webpackConfig.module.rules.push(
  { test: /\.woff(\?.*)?$/,  use: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
  { test: /\.woff2(\?.*)?$/, use: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
  { test: /\.otf(\?.*)?$/,   use: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
  { test: /\.ttf(\?.*)?$/,   use: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
  { test: /\.eot(\?.*)?$/,   use: 'file-loader?prefix=fonts/&name=[path][name].[ext]' },
  { test: /\.svg(\?.*)?$/,   use: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
  { test: /\.(png|jpg)$/,    use: 'url-loader?limit=8192' }
)
/* eslint-enable */

export default webpackConfig;
