import React from "react";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

export const EvoCheckbox = ({label, ...props}) => (
  <FormGroup>
    <FormControlLabel
      label={label}
      control={<Checkbox {...props}/>}/>
  </FormGroup>
);

export default EvoCheckbox;