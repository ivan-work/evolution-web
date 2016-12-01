const https = require('https');
const validator = require('validator');
const ExtendableError = require('../../../shared/utils/ExtendableError');
const VK_API = 'https://oauth.vk.com/'

const requestAccessToken = (code) => {
  const params = [
    'client_id=' + process.env.VK_API_ID
    , 'client_secret=' + process.env.VK_API_SECRET
    , 'code=' + code
    , 'redirect_uri=' + 'http://localhost:3000/api/oauth/vk'
  ];
  const requestUri = `https://oauth.vk.com/access_token?${params.join('&')}`;

};


const code = (req, res, next) => {
  if (typeof req.query.code !== 'string') throw new Error(400);
  if (!validator.isAlphanumeric(req.query.code)) throw new Error(400);

  res.json([process.env.VK_API_ID, process.env.VK_API_SECRET]);
};


const router = require('express').Router();
router.get('/', code);
router.get('/req', (req, res) => {
  https.request('https://google.com', (...args) => {
    console.log(args);
    res.send('ok!');
  });
});
export default router;


// class VKError extends ExtendableError {}
//
// export default {
//   VKError
//   , getCode() {
//
//   }
//   , parseUser(data) {
//     // validateUserResponse(data);
//     const vkUser = data.response[0];
//     return {
//       id: vkUser.uid
//       , name: vkUser.first_name + ' ' + vkUser.last_name
//     };
//   }
// }

// const RE_TEXT_USERNAME = /[^0-9a-zA-ZА-я]/g;
// const validateUserResponse = (data) => {
//   if (!data) throw new VKError('invalid_response');
//   if (!data.response) throw new VKError('invalid_response');
//   if (!data.response[0]) throw new VKError('invalid_response');
//   const user = data.response[0];
//   if (!user.uid) throw new VKError('invalid_response');
//   if (!user.first_name) throw new VKError('invalid_response');
//   if (!user.last_name) throw new VKError('invalid_response');
//
//   if (!(user.uid > 0 && user.uid < Number.MAX_VALUE)) throw new VKError('invalid_response');
//   if (typeof user.first_name !== 'string') throw new VKError('invalid_response');
//   if (!validator.isLength(user.first_name, {min: 1})) throw new VKError('invalid_response');
//   if (typeof user.last_name !== 'string') throw new VKError('invalid_response');
//   if (!validator.isLength(user.last_name, {min: 1})) throw new VKError('invalid_response');
//
//   user.first_name = user.first_name.replace(RE_TEXT_USERNAME, '').substring(0, 0xF);
//   user.last_name = user.last_name.replace(RE_TEXT_USERNAME, '').substring(0, 0xF);
// };