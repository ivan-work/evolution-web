import {List} from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import T from 'i18n-react';
import cn from 'classnames';
import {connect} from 'react-redux';

import PlayersList from './PlayersList.jsx';

export default ({game}) => <PlayersList game={game}/>;