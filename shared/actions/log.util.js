export const logTarget = (result = [], target) => {
  if (Array.isArray(target)) target.reduce(logTarget, result);
  else if (!!target && !!target.type) result.push(target.type);
  else if (!!target && !!target.id) result.push(target.id);
  else result.push(target);
  return result;
};