import globals from '../globals';
import path from 'path';
import express from 'express';
import text from './test';

import webpackClientConfig from '../webpack.client.babel';

console.log('NODE_ENV =', GLOBAL_NODE_ENV);

const app = express();

app.set('port', process.env.PORT || 2000);

app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('Press CTRL-C to stop\n');
});

//app.use('/assets', proxy(url.parse('http://localhost:8081/assets')));

//app.use('/*', express.static('dist'))

if (GLOBAL_NODE_ENV === 'production') {
  const clientPath = path.join(process.cwd(), webpackClientConfig.output.path);

  console.log('publicPath', webpackClientConfig.output.publicPath);
  console.log('clientPath', clientPath);

  app.use(webpackClientConfig.output.publicPath, express.static(clientPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));

  //app.use('*', express.static(webpackClientConfig.output.path));

  //app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), webpackClientConfig.output.path, 'index.html')));
} else {
  const clientPath = path.join(process.cwd(), webpackClientConfig.output.path);

  app.use(webpackClientConfig.output.publicPath, express.static(clientPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
}