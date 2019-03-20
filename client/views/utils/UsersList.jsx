import React from 'react';

import List from '@material-ui/core/List';

import User, {UserAsListItem} from './User.jsx';

export default ({list, children}) => (<List>
  {list.map(uid => <User key={uid} id={uid}>{children || UserAsListItem}</User>)}
</List>);