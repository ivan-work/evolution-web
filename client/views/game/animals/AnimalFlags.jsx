import React from "react";
import T from "i18n-react";

import {TRAIT_ANIMAL_FLAG} from "../../../../shared/models/game/evolution/constants";

import Tooltip from "@material-ui/core/Tooltip";

import IconFlagPoisoned from '@material-ui/icons/SmokingRooms';
import IconFlagHibernated from '@material-ui/icons/Snooze';
import IconFlagShell from '@material-ui/icons/Home';
import IconFlagRegeneration from '@material-ui/icons/GetApp';
import IconFlagShy from '@material-ui/icons/Report';
import {IconCover} from '../food/Cover';

const IconMap = {
  [TRAIT_ANIMAL_FLAG.POISONED]: IconFlagPoisoned
  , [TRAIT_ANIMAL_FLAG.REGENERATION]: IconFlagRegeneration
  , [TRAIT_ANIMAL_FLAG.IN_COVER]: IconCover
  , [TRAIT_ANIMAL_FLAG.HIBERNATED]: IconFlagHibernated
  , [TRAIT_ANIMAL_FLAG.SHELL]: IconFlagShell
  , [TRAIT_ANIMAL_FLAG.SHY]: IconFlagShy
};

const IconColor = {
  [TRAIT_ANIMAL_FLAG.POISONED]: 'bad'
  , [TRAIT_ANIMAL_FLAG.REGENERATION]: 'bad'
  , [TRAIT_ANIMAL_FLAG.IN_COVER]: 'good'
  , [TRAIT_ANIMAL_FLAG.HIBERNATED]: 'good'
  , [TRAIT_ANIMAL_FLAG.SHELL]: 'good'
  , [TRAIT_ANIMAL_FLAG.SHY]: 'good'
};

export const AnimalFlag = ({flag, Icon, color}) => {
  const IconComponent = IconMap[flag];
  return (
    <Tooltip title={T.translate(`Game.AnimalFlag.${flag}`)}>
      <IconComponent className={`AnimalIcon AnimalFlag ${IconColor[flag]}`} />
    </Tooltip>
  );
};

export default ({animal, debug}) => (
  <>
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.POISONED} />}
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.REGENERATION} />}
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.IN_COVER)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.IN_COVER} />}
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.HIBERNATED} />}
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.SHELL} />}
    {(debug || animal.hasFlag(TRAIT_ANIMAL_FLAG.SHY)) && <AnimalFlag flag={TRAIT_ANIMAL_FLAG.SHY} />}
  </>
);