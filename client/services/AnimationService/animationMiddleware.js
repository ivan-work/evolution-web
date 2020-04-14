import AnimationManager from './AnimationManager';
import Velocity from 'velocity-animate';

export const animationComponentSubscribe = (name, html) => ({type: 'animationComponentSubscribe', data: {name, html}});
export const animationComponentUnsubscribe = (name) => ({type: 'animationComponentUnsubscribe', data: {name}});

export default (subscriptions = {}) => {
  let ID = 0;
  const queue = [];
  const manager = new AnimationManager();
  const animations = new Set(); // ES6 Set, beware

  return ({dispatch, getState}) => {
    const drainQueue = () => {
      const queueCopy = queue.slice();
      queue.length = 0;
      queueCopy.forEach(dispatch);
    };
    document.addEventListener('click', (e) => {
      if (animations.size > 0) {
        Velocity(document.getElementsByClassName('animation-stoppable'), 'stop');
        e.stopPropagation();
        animations.clear();
        drainQueue();
      }
    }, true);

    return next => action => {
      switch (action.type) {
        case 'animationComponentSubscribe': {
          const {name, html} = action.data;
          manager.addComponent(name, html);
          // next(action);
          break;
        }
        case 'animationComponentUnsubscribe': {
          const {name} = action.data;
          manager.removeComponent(name);
          // next(action);
          break;
        }
        default: {
          // console.log(action.type, animations.size, !!subscriptions[action.type]);
          if (animations.size > 0) {
            queue.push(action);
          } else {
            let animationArray = subscriptions[action.type];

            if (animationArray) {
              const id = ID++;
              animations.add(id);
              // console.log(action.type, 'started', id);
              Promise.all(
                animationArray
                  .map(fn => Promise.resolve(fn(manager, action.data)))
              )
                .then((result) => {
                  // console.log(action.type, 'resolved', id, result);
                  next(action);
                  animations.delete(id);
                  if (animations.size === 0) {
                    drainQueue();
                  }
                })
                .catch((error) => {
                  console.error('Animation error', error);
                  next(action);
                  animations.delete(id);
                  if (animations.size === 0) {
                    drainQueue();
                  }
                });
            } else {
              next(action);
            }
          }
        }
      }
    };
  }
};