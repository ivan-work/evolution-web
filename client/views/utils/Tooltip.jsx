import React from 'react'
import Tooltip from 'rc-tooltip';

export default ({children, overlay, ...props}) => (overlay === null ? null
  : <Tooltip
  {...props}
  destroyTooltipOnHide={true}
  overlay={<span>{overlay}</span>}>
  {children}
</Tooltip>);