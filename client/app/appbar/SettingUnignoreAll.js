import React from "react";
import T from 'i18n-react';
import {connect} from "react-redux";
import {compose} from "recompose";

import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import MenuItem from "@material-ui/core/MenuItem";

import {appUnignoreAll} from "../../actions/app";

const SettingUnignoreAll = ({ignoreList, appUnignoreAll}) => (
  <MenuItem onClick={appUnignoreAll} disabled={ignoreList.size === 0}>
    {T.translate('App.Misc.UnignoreAll')} ({ignoreList.size})
  </MenuItem>
);

export default compose(
  connect(
    (state) => ({
      ignoreList: state.getIn(['app', 'ignoreList'])
    })
    , {appUnignoreAll}
  )
)(SettingUnignoreAll);