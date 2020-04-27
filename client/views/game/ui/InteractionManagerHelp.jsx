import React from "react";
import T from "i18n-react";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import {InteractionContext} from "../InteractionManager";
import {withStyles} from "@material-ui/core/styles";

export const CurrentInteractionDebug = () => (
  <InteractionContext.Consumer>
    {context => (
      <pre onClick={e => context.cancelInteraction()}>
        Context: {JSON.stringify(context.interaction ? context.interaction : null, null, ' ')}
      </pre>
    )}
  </InteractionContext.Consumer>
);

const StyledPaper = withStyles(theme => ({
  root: {
    position: 'fixed'
    , top: 55, right: 0, left: 0
    , zIndex: theme.zIndex.appBar + 1
    , margin: 2
    , padding: 2
    , background: '#FC8'
    , textAlign: 'center'
  }
}))(Paper);

export const CurrentInteractionHelp = () => (
  <InteractionContext.Consumer>
    {({interaction}) => (
      !interaction ? null : (
        <StyledPaper>
          <Typography>
            {T.translate(`Game.UI.IM.Help.${interaction.help}`)}
          </Typography>
        </StyledPaper>
      )
    )}
  </InteractionContext.Consumer>
);