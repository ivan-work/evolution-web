import React from 'react';
import styled from "../../styles/styled";
import Paper from "@material-ui/core/Paper";

export default styled(Paper)(theme => ({
  margin: theme.spacing()
  , padding: theme.spacing()
}))