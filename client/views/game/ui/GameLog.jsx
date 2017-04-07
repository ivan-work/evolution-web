import React from 'react'
import T from 'i18n-react'
import {Button} from 'react-mdl';
import {DialogTitle, DialogContent} from 'react-mdl';
import {Dialog} from '../../utils/Dialog.jsx';

export default class GameLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showLog: false};
    this.showLog = () => this.setState({showLog: true});
    this.hideLog = () => this.setState({showLog: false});
    this.format = (str, arr) => str.replace(/{(\d+)}/g, (match, number) => typeof arr[number] != 'undefined' ? arr[number] : match);
  }

  render() {
    const {game} = this.props;
    return (<div>
      <Button onClick={this.showLog}>{T.translate('Game.UI.Log.Label')}</Button>
      <Dialog onBackdropClick={this.hideLog} show={this.state.showLog}>
        <DialogTitle>{T.translate('Game.UI.Log.Label')}</DialogTitle>
        <DialogContent>
          {game.log.map(([message, ...values], index) => (
            <div key={index}>{this.format(T.translate('Game.Log.' + message), values)}</div>))}
        </DialogContent>
      </Dialog>
    </div>);
  }
}