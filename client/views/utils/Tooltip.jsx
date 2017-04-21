import React from 'react'
import Tooltip from 'rc-tooltip';

export default ({
                  children
                  , overlay
                  , placement
                  , mouseEnterDelay = .5
                  , mouseLeaveDelay = 0
                }) => (overlay === null ? null
  : <Tooltip
    mouseEnterDelay={mouseEnterDelay}
    mouseLeaveDelay={mouseLeaveDelay}
    placement={placement}
    destroyTooltipOnHide={true}
    overlay={<span>{overlay}</span>}>
    {children}
  </Tooltip>)