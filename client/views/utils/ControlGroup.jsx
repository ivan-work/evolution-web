import React from 'react';
import PropTypes from 'prop-types'

import './ControlGroup.scss';
import Typography from "@material-ui/core/Typography";

export const ControlGroup = ({name, children}) => (
  <div className='ControlGroup'>
    <Typography className='title' color={"inherit"} variant={'button'}>{name}: </Typography>
    <div className='body'>{children}</div>
  </div>
);

export default ControlGroup;