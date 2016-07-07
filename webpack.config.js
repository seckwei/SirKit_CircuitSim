let jsPath = './js/';

module.exports = {
    entry: {
        app: [
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
                test: /js\\.+\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};