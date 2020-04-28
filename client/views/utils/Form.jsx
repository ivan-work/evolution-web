import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import Validator from 'validatorjs';

import EvoTextField from "../../components/EvoTextField";
import EvoCheckbox from "../../components/EvoCheckbox";
import Button from "@material-ui/core/Button";

export const FormContext = React.createContext();

export default class Form extends React.Component {
  static propTypes = {
    i18nPath: PropTypes.string.isRequired
    , model: PropTypes.object.isRequired
    , onSubmit: PropTypes.func.isRequired
    , rules: PropTypes.object
    , disabled: PropTypes.bool
  };

  constructor(props) {
    super(props);
    const {model, rules} = props;
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      model
      , validation: new Validator(model, rules)
      , dirty: false
    };
  }

  componentWillReceiveProps({model, disabled}) {
    // update disabled form for other users
    if (disabled) {
      this.setState({model})
    }
  }

  onChange(name, value) {
    const {disabled, rules} = this.props;
    const {model} = this.state;
    if (!disabled && model[name] != value) {
      return this.setState(({model}) => {
        const newModel = {...model, [name]: value};
        const validation = new Validator(newModel, rules);
        validation.passes();
        return {
          model: newModel
          , validation
          , dirty: true
        }
      });
    }
  }

  onSubmit() {
    const {onSubmit} = this.props;
    const {model} = this.state;
    this.setState({model, dirty: false});
    onSubmit(model);
  }

  render() {
    const {i18nPath, disabled} = this.props;
    const {model, validation, dirty} = this.state;

    const childContext = {
      i18nPath
      , model
      , validation
      , dirty
      , disabled
      , onChange: this.onChange
      , onSubmit: this.onSubmit
    };

    return <form>
      <FormContext.Provider value={childContext}>
        {this.props.children}
      </FormContext.Provider>
    </form>
  }
}

export class Textfield extends React.Component {
  static propTypes = {name: PropTypes.string.isRequired};
  static contextType = FormContext;

  onInputChange = ({target}) => {
    this.context.onChange(target.name, target.value);
  };

  render() {
    const {name} = this.props;
    const {i18nPath, model, validation, disabled} = this.context;

    return (<EvoTextField
      name={name}
      label={T.translate(i18nPath + '.' + name)}
      value={model[name] || ''}
      disabled={disabled}
      error={validation.errors.errors[name]}
      onChange={this.onInputChange}
      {...this.props}
    />);
  }
}

export class Checkbox extends React.Component {
  static propTypes = {name: PropTypes.string.isRequired};
  static contextType = FormContext;

  onInputChange = ({target}) => {
    this.context.onChange(target.value, target.checked); // HTML Checkbox API is awesome /s
  };

  render() {
    const {name, disabled: thisDisabled, ...props} = this.props;
    const {i18nPath, model, disabled: formDisabled, onChange} = this.context;
    return (
      <EvoCheckbox checked={model[name]}
                   value={name}
                   label={T.translate(i18nPath + '.' + name)}
                   disabled={thisDisabled || formDisabled}
                   onChange={this.onInputChange}
                   {...props}
      />
    );
  }
}

export class Submit extends React.Component {
  static contextType = FormContext;

  render() {
    const {children, ...props} = this.props;
    const {validation, dirty, disabled, onSubmit} = this.context;
    return (<Button disabled={disabled || !dirty || validation.fails()}
                    onClick={onSubmit}
                    {...props}>
      {children}
    </Button>);
  }
}













