let jsPath = './js/';

module.exports = {
    entry: [
        jsPath+'app.js', 
        jsPath+'Utility.js',
        jsPath+'Board.js',
        jsPath+'Slot.js',
        jsPath+'Component.js',
        jsPath+'ComponentType.js',
        jsPath+'Traverser.js'
    ],
	output: {
	    path: './dist',
	    filename: 'app.bundle.js'
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