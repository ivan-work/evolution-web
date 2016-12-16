import globals from '../globals';
import path from 'path';
import http from 'http';
import express from 'express';
import compression from 'compression';

console.log('NODE_ENV =', process.env.NODE_ENV);

import webpackClientConfig from '../webpack.client.babel';
import configureStore from './configureStore';
const app = express();
const server = http.createServer(app);
app.set('port', process.env.PORT || 2000);

configureStore(server, app);

require('./routes/index')(app);

//app.use('/assets', proxy(url.parse('http://localhost:8081/assets')));
//app.use('/*', express.static('dist'))


if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(process.cwd(), webpackClientConfig.output.path);

  app.use(compression());

  app.use(webpackClientConfig.output.publicPath, express.static(clientPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
}

server.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});