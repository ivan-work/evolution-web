import React from 'react'
import Tooltip from 'rc-tooltip';

export default ({children, overlay, ...props}) => (!overlay ? children
  : <Tooltip
  {...props}
  mouseEnterDelay={props.mouseEnterDelay !== void 0 ? props.mouseEnterDelay : .5}
  mouseLeaveDelay={props.mouseLeaveDelay !== void 0 ? props.mouseLeaveDelay : 0}
  destroyTooltipOnHide={true}
  overlay={<span>{overlay}</span>}>
  {children}
</Tooltip>);