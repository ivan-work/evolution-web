import validator from 'validator';
import ExtendableError from '~/shared/utils/ExtendableError';

const RE_TEXT_USERNAME = /[^0-9a-zA-ZА-я]/g;
const validateUserResponse = (data) => {
  if (!data) throw new VKError('invalid_response');
  if (!data.response) throw new VKError('invalid_response');
  if (!data.response[0]) throw new VKError('invalid_response');
  const user = data.response[0];
  if (!user.uid) throw new VKError('invalid_response');
  if (!user.first_name) throw new VKError('invalid_response');
  if (!user.last_name) throw new VKError('invalid_response');

  if (!(user.uid > 0 && user.uid < Number.MAX_VALUE)) throw new VKError('invalid_response');
  if (typeof user.first_name !== 'string') throw new VKError('invalid_response');
  if (!validator.isLength(user.first_name, {min: 1})) throw new VKError('invalid_response');
  if (typeof user.last_name !== 'string') throw new VKError('invalid_response');
  if (!validator.isLength(user.last_name, {min: 1})) throw new VKError('invalid_response');

  user.first_name = user.first_name.replace(RE_TEXT_USERNAME, '').substring(0, 0xF);
  user.last_name = user.last_name.replace(RE_TEXT_USERNAME, '').substring(0, 0xF);
};

class VKError extends ExtendableError {}

export default {
  VKError
  , parseUser(data) {
    validateUserResponse(data);
    const vkUser = data.response[0];
    return {
      id: vkUser.uid
      , name: vkUser.first_name + ' ' + vkUser.last_name
    };
  }
}