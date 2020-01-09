import LinkedTrait from "./LinkedTrait";
import React from "react";

const LinkedTraitWrapper = (props) => {
  if (props.trait.isLinked()) {
    return (
      <LinkedTrait trait={props.trait}>
        {props.children}
      </LinkedTrait>
    );
  }
  return props.children;
};

export default LinkedTraitWrapper;