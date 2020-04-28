import React from "react";

import TextField from "@material-ui/core/TextField";

export const EvoTextField = ({name, error, ...props}) => (
  <TextField
    {...props}
    id={name}
    name={name}
    error={!!error}
    helperText={error}
    margin='normal'
  />
  // <FormControl error={!!error} {...props}>
  //   <InputLabel htmlFor={name}>{label}</InputLabel>
  //   <Input id={name} name={name} value={value} onChange={onChange} />
  //   <FormHelperText id={name + '-error'}>{error}</FormHelperText>
  // </FormControl>
);

export default EvoTextField;