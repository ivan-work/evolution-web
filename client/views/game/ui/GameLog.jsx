import React from 'react'
import T from 'i18n-react'
import {IconButton, Tooltip} from 'react-mdl';
import {DialogTitle, DialogContent} from 'react-mdl';
import {Dialog} from '../../utils/Dialog.jsx';

import User from '../../utils/User.jsx';
import AnimalText from '../animals/AnimalText.jsx';

import TimeService from '../../../services/TimeService';
import Promise from '../../utils/Promise.jsx';

const DATA_REGEX = /!(\w+)/g;
const VIEW_REGEX = /(\$[\w\-@]+)/g;

const format = (str, arr) => str.replace(DATA_REGEX, (match, number) => typeof arr[number] != 'undefined' ? arr[number] : match);
import replace from 'react-string-replace';

import './GameLog.scss';

const customLog = {
  gameGiveCards: (message, values) => {
    const n = values[1];
    const plural = (n <= 0) ? 3
      : (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
    // http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms
    return T.translate('Game.Log.' + message, {context: plural, ...values})
  }
  , gameDeployTrait: (message, [userId, traitType, animal, another]) => {
    return T.translate('Game.Log.' + message, {context: another ? 2 : 1, ...[userId, traitType, animal, another]})
  }
  , traitNotify_Start: (message, [source, traitType, target]) => {
    return T.translate('Game.Log.' + message, {context: target ? 1 : 0, ...[source, traitType, target]})
  }
  , traitMoveFood: (message, [amount, sourceType, animal, another]) => {
    // const n = values[1];
    // const plural = (n <= 0) ? 3
    //   : (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
    // http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms
    return T.translate('Game.Log.' + message + '.' + sourceType, {context: amount, ...[amount, sourceType, animal, another]})
  }
  , animalDeath: (message, [type, animal, data]) => {
    // const n = values[1];
    // const plural = (n <= 0) ? 3
    //   : (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
    // http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html?id=l10n/pluralforms
    return T.translate('Game.Log.' + message + '.' + type, {context: animal, ...[type, animal, data]})
  }
  , default: (message, values) => T.translate('Game.Log.' + message, {...values})
};

export default class GameLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showLog: false};
    this.showLog = () => this.setState({showLog: true});
    this.hideLog = () => this.setState({showLog: false});
  }

  static LogItemToText([message, ...values]) {
    // values come as userId or as ['$Animal', ...traits] or ['$Trait', index, ...traits of animal]
    const valuesToInsertAsText = values.map((value, index) =>
      Array.isArray(value) ? value[0] + '@' + index
        : value);
    // So we convert arrays to $Animal@index

    // Then we process
    const logItemWithData = (customLog[message] ? customLog[message](message, valuesToInsertAsText)
      : customLog.default(message, valuesToInsertAsText));


    return replace(logItemWithData, VIEW_REGEX, (match, index) => {
      if (/\$Player@([\w\-]+)/.test(match)) {
        return <strong key={match.slice(8)}><User id={match.slice(8)}/></strong>;
      } else if (/\$Animal@(\d)/.test(match)) {
        const valueIndex = match.slice(8, 9);
        return <AnimalText key={index} animal={values[valueIndex]}/>;
      } else if (/\$(Trait\w+)/.test(match)) {
        return T.translate('Game.Trait.' + match.slice(1))
      } else if (/\$A/.test(match)) {
        return <AnimalText key={index}/>
      } else if (/\$F/.test(match)) {
        return <i key={index} className='icon material-icons'>spa</i>
      } else {
        return match;
      }
    })
  }

  render() {
    const {game} = this.props;
    return (<div>
      <Tooltip label={T.translate('Game.Log.Label')}>
        <IconButton raised
                    onClick={this.showLog}
                    name={'list'}/>
      </Tooltip>
      <Dialog onBackdropClick={this.hideLog} show={this.state.showLog}>
        <DialogTitle>{T.translate('Game.Log.Label')}</DialogTitle>
        <DialogContent className='GameLog'>
          {game.log.map((logItem, index) => (
            <div className='LogItem' key={index}>
              <span className='LogTime'>[{TimeService.formatTimeOfDay(logItem.timestamp)}]</span>&nbsp;
              <span className='LogMessage'>{GameLog.LogItemToText(logItem.message)}</span>
            </div>))}
        </DialogContent>
      </Dialog>
    </div>);
  }
}