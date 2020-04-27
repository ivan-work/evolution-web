import React from "react";
import {compose, fromRenderProps, withHandlers, withProps} from "recompose";

export const InteractionContext = React.createContext();

const stopEvent = e => {
  //https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

export const InteractionSource = (type, {getIID = () => 0, help, canStart, onStart}) => compose(
  fromRenderProps(InteractionContext.Consumer, (im) => ({im}))
  , withProps((props) => ({
      canStart: canStart(props)
      , isInteracting: props.im.interaction && props.im.interaction.iid && props.im.interaction.iid === getIID(props)
    })
  )
  , withHandlers({
    startInteraction: ({im, canStart, ...props}) => (e) => {
      stopEvent(e);
      if (canStart) {
        const interactionItem = onStart(props);
        if (interactionItem !== false) {
          // console.log(`im.startInteraction`, type, interactionItem);
          return im.startInteraction({
            type
            , iid: getIID(props)
            , item: interactionItem
            , help
          });
        }
      }
    }
  })
);

const defaultCanInteract = () => true;
const defaultOnInteract = Promise.resolve(true);

export const InteractionTarget = (types = [], {
  canInteract = defaultCanInteract
  , onInteract = defaultOnInteract
}) => compose(
  fromRenderProps(InteractionContext.Consumer, (im) => ({im}))
  , withProps(({im, ...props}) => ({
    canInteract: im.interaction && ~types.indexOf(im.interaction.type) && canInteract(props, im.interaction)
  }))
  , withHandlers({
    acceptInteraction: ({im, canInteract, ...props}) => (e) => {
      if (canInteract) {
        stopEvent(e);
        Promise.resolve(onInteract(props, im.interaction))
          .then((interactionResult) => {
            // console.log('Interaction ended with:', interactionResult);
            if (interactionResult && typeof interactionResult === 'object') {
              return im.startInteraction(interactionResult);
            } else {
              return im.cancelInteraction();
            }
          });
      }
    }
  })
);

export class InteractionManagerProvider extends React.PureComponent {
  state = {interaction: null};

  startInteraction = ({type, iid, item, help}) => this.setState({
    interaction: {
      type: type
      , iid
      , item
      , help: help || type
    }
  });

  cancelInteraction = () => this.setState({interaction: null});

  handleGlobalClick = () => {
    if (this.state.interaction) {
      // console.log(`im.handleGlobalClick`, this.state.interaction.type, this.state.interaction.data);
      this.cancelInteraction();
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.handleGlobalClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleGlobalClick);
  }

  render() {
    const im = {
      interaction: this.state.interaction
      , startInteraction: this.startInteraction
      , cancelInteraction: this.cancelInteraction
    };

    return (
      <InteractionContext.Provider value={im}>
        {this.props.children}
      </InteractionContext.Provider>
    );
  }
}