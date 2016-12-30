const router = require('express').Router();
import {server$oauthVKRegister} from '../../actions/oauth';


router.get('/vk', function (req, res, next) {
  req.app.get('store').dispatch(server$oauthVKRegister(req.headers.host, req.query.code))
    // .then((token) => {
    //   console.log('redirecting')
    //   console.log('/login?token=' + token)
    //   return token;
    // })
    .then((token) => res.redirect('/login?token=' + token))
    .catch(err => res.redirect('/login?error=' + err));
});

export default router;