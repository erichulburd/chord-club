const cssContext = require.context(__dirname, true, /\.s?css$/);
cssContext.keys().forEach(cssContext);
