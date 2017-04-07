import path from 'path';
import express from 'express';
import compression from 'compression';

export default (options, app) => {
  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());

  app.use(options.output.publicPath, express.static(options.output.path));

  app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), options.output.path, 'index.html')));
};