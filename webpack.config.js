let jsPath = './js/';

module.exports = {
    entry: {
        app: [
            'babel-polyfill',
            jsPath+'app.js', 
            jsPath+'Utility.js',
            jsPath+'Board.js',
            jsPath+'Slot.js',
            jsPath+'Component.js',
            jsPath+'ComponentType.js',
            jsPath+'Traverser.js'
        ],
        spec: [
            './spec/spec.js'
        ]
    },
	output: {
	    path: './dist',
	    filename: '[name].bundle.js'
	},
    module: {
        loaders : [
            {
                test: /(js|spec)\\.+\.js$/,
                exclude: /(node_modules|babel-polyfill)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};