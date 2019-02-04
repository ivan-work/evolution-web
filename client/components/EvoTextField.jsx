import React from "react";

import FormControl from "@material-ui/core/FormControl/FormControl";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Input from "@material-ui/core/Input/Input";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";

export const EvoTextField = ({id, label, value, onChange, error}) => (
  <FormControl error={!!error}>
    <InputLabel htmlFor={id}>{label}</InputLabel>
    <Input id={id} name={id} value={value} onChange={onChange}/>
    <FormHelperText id={id + '-error'}>{error}</FormHelperText>
  </FormControl>
);

export default EvoTextField;