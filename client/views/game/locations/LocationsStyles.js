import React from 'react';

import IconLaurasia from '@material-ui/icons/Nature';
import IconGondwana from '@material-ui/icons/Terrain';
import IconOcean from '@material-ui/icons/Waves';

import {LOCATION} from '../../../../shared/models/game/evolution/locations';

export const LocationColors = {
  [LOCATION.LAURASIA]: {
    main: '#2E7D32'
    , light: '#EEF7EE'
    , border: '#81C784'
  }
  , [LOCATION.GONDWANA]: {
    main: '#A65400'
    , light: '#FFF4E5'
    , border: '#FFB74D'
  }
  , [LOCATION.OCEAN]: {
    main: '#1565C0'
    , light: '#EAF3FD'
    , border: '#64B5F6'
  }
};

const LocationIcons = {
  [LOCATION.LAURASIA]: IconLaurasia
  , [LOCATION.GONDWANA]: IconGondwana
  , [LOCATION.OCEAN]: IconOcean
};

export const LocationIcon = ({location, ...props}) => {
  const Icon = LocationIcons[location];
  return <Icon {...props} style={{color: LocationColors[location].main, ...props.style}} />;
};
