import express from 'express';
import fs from 'fs';
import path from 'path';
import serialize from 'serialize-javascript';

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3000;
const BUILD_PATH = path.resolve(path.resolve(), 'build');
const filePath = path.resolve(BUILD_PATH, 'index.html');

// need to add docstrings and type defs
const renderer = (Request, res) => {
  const preloadedState = serialize({
    obj: { foo: 'foo' },
  });

  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      // console.error('err', err);
      return res.status(404).end();
    }
    return res.send(
      htmlData.replace(
        '<div id="reveal-root"></div>',
        `<div id="reveal-root"></div><script>window.__PRELOADED_STATE__=${preloadedState}</script>`
      )
    );
  });
};

router.use('^/$', renderer);

// other static resources should just be served as they are
router.use(express.static(BUILD_PATH, { maxAge: '30d' }));

// sends other routes to be handled by React Router
router.use('*', renderer);

// tell the app to use the above rules
app.use(router);

app.listen(PORT, () => {
  // console.log(`Example app listening on port ${PORT}!`)
});
