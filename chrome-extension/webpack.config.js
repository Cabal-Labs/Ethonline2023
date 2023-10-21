const path = require("path");

module.exports = {
    // Define multiple entry points
    entry: "./src/index.js",
    // Output configurations
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    resolve: {
        modules: ['node_modules'],  
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer/"),
            stream: require.resolve("stream-browserify"),
			ethUtil: require.resolve("ethereumjs-util"),
			'uint8array-tools': require.resolve("uint8array-tools"),
			
        },
    },

    // Source map for better debugging
    devtool: "inline-source-map",
	
};
