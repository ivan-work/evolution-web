// import styled from "../../../styles/styled";
import GameStyles from "../GameStyles";

import React from 'react';
import T from "i18n-react";
import cn from "classnames";

import Typography from "@material-ui/core/Typography";

import TraitDetails from "../traits/TraitDetails";
import WhiteTooltip from "../../utils/WhiteTooltip";
import styled from "@material-ui/core/styles/styled";

export const StyledTraitBody = styled('div')({
  ...GameStyles.animalTrait
  , willChange: 'background'
  , transition: 'background .5s'
  , ...GameStyles.addTraitColors((colorConfig) => ({
    background: colorConfig.fill
    , '& .text': {
      color: colorConfig.text
      , fontSize: 14
      , display: 'flex'
      , '& .name': {
        ...GameStyles.ellipsis
        , flex: '1 1 0'
      }
    }
    , '&.disabled': {
      background: colorConfig.fillDisabled
      , '& .text': {
        color: colorConfig.textDisabled
      }
    }
    , '&.canStart': {
      background: colorConfig.fillActive
      , cursor: 'pointer'
      , '&.value': {
        '& .text': {
          color: colorConfig.textValue
          , fontWeight: 500
        }
      }
      , '& .text': {
        color: colorConfig.textActive
        , fontWeight: 500
      }
      , '&:hover': {
        background: colorConfig.fillActiveHover
        , '& .text': {
          color: colorConfig.textActiveHover
        }
      }
    }
    , '&.value': {
      background: colorConfig.fillValue
      , '& .text': {
        color: colorConfig.textValue
        , fontWeight: 500
      }
    }
    , '&.source': {
      background: colorConfig.fillSource
      , '& .text': {
        color: colorConfig.textSource
      }
    }
    , '&.isInteracting': {
      background: colorConfig.fillInteracting
      , animation: `interaction-pulsate 1000ms ease-in-out infinite`
      , '& .text': {
        color: colorConfig.textInteracting
      }
    }
    , '&.isOnCooldown': {
      // background: colorConfig.fillCooldown
      // ,
      '& .text': {
        color: colorConfig.textCooldown
      }
    }
  }))
  , '&.animation': {
    background: '#0F0 !important'
  }
});

export class TraitBase extends React.PureComponent {
  onClick = e => {
    const {canStart, startInteraction} = this.props;
    canStart && startInteraction(e);
  };

  render() {
    const {trait, className, canStart, isOnCooldown, value, disabled, textComponent, isInteracting} = this.props;
    const cnTrait = cn(
      'Trait'
      , 'AnimalTrait2'
      , trait.type
      , className
      , {
        canStart
        , value: value || (trait.getDataModel().displayValue && trait.value)
        , source: trait.linkSource
        , disabled: disabled || trait.disabled
        , isOnCooldown
        , isInteracting
      }
    );
    return (
      <WhiteTooltip placement='right' title={<TraitDetails trait={trait} />}>
        <StyledTraitBody className={cnTrait} onClick={this.onClick}>
          <Typography className='text'>{textComponent}</Typography>
        </StyledTraitBody>
      </WhiteTooltip>
    )
  }
}
