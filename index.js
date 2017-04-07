import globals from './globals';

// Client
import WebpackDevServer from "webpack-dev-server";
import webpack from "webpack";
import configClient from './webpack.client.babel';
import configServer from './webpack.server.babel';

console.log('Webpack Dev Server launching: NODE_ENV=', GLOBAL_NODE_ENV)

if (GLOBAL_NODE_ENV === 'development') {
  //server(PORT);
  const client = new WebpackDevServer(webpack(configClient), {
    hot: true
    , contentBase: configClient.output.path
    , publicPath: configClient.output.publicPath
    , proxy: {"*": 'http://localhost:' + GLOBAL_SERVER_PORT}
    , historyApiFallback: true
    , stats: {colors: true}
    , quiet: false
    , noInfo: true
  });
  client.listen(GLOBAL_SERVER_PORT - 1, (error) => {
    if (error) console.error(error);
  });
} else {
  console.error(`Don't launch this if not developing`)
}