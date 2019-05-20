import React from 'react';

export default WrapperComponent => BaseComponent => props => (
  <WrapperComponent {...props}>
    <BaseComponent {...props}/>
  </WrapperComponent>
);