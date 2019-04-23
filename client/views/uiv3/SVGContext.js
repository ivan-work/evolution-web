import React from 'react';

export const SVGContext = React.createContext();

export class SVGContextProvider extends React.PureComponent {
  svgOverlayComponent = null;

  mountSVGOverlay = (svgOverlayComponent) => {
    this.svgOverlayComponent = svgOverlayComponent;
  };

  updateSVGOverlay = () => this.svgOverlayComponent && this.svgOverlayComponent.updateSVG();

  unmountSVGOverlay = () => {
    this.svgOverlayComponent = null;
  };

  mountLinkedTrait = (animalLinkedTraitComponent) => {
    if (this.svgOverlayComponent) {
      this.svgOverlayComponent.mountLinkedTrait(animalLinkedTraitComponent);
    }
  };

  unmountLinkedTrait = (animalLinkedTraitComponent) => {
    if (this.svgOverlayComponent) {
      this.svgOverlayComponent.unmountLinkedTrait(animalLinkedTraitComponent);
    }
  };


  render() {
    return (
      <SVGContext.Provider value={this}>
        {/*<SVGPortal svgRootRef={this.svgRootRef}>*/}
        {/*{this.state.links.map(this.renderLink)}*/}
        {/*<text y={50}>{JSON.stringify(this.state.links, null, ' ')}</text>*/}
        {/*<line x1={0} y1={0} x2={1e3} y2={1e3} style={{*/}
        {/*strokeWidth: 5*/}
        {/*, stroke: 'black'*/}
        {/*}}/>*/}
        {/*</SVGPortal>*/}
        {this.props.children}
      </SVGContext.Provider>
    );
  }
}

export class SVGContextSpy extends React.PureComponent {
  static contextType = SVGContext;

  componentDidUpdate() {
    this.context.updateSVGOverlay();
  }

  render() {
    return null;
    // return <span>{JSON.stringify(this.props.watch)}</span>;
  }
}