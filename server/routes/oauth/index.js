const router = require('express').Router();
import VK from './vk';

router.get('/', (req, res) => res.json('oauth'));

router.use('/vk', VK);

// router.get('/vk', function (req, res, next) {
//   res.json('vk');
// });

export default router;