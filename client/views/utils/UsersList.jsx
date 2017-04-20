import React from 'react';
import {List} from 'react-mdl';
import User from './User.jsx';

export default ({className = 'UsersList', list, children}) => (<List className={className}>
  {list.map(uid => <User key={uid} id={uid}>{children || User.asListItem}</User>)}
</List>);