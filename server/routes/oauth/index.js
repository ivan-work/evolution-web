var router = require('express').Router();

router.get('/vk', function (req, res, next) {
  console.log(req.query)
  res.json(req.query);
});

export default router;