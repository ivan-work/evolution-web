import React from 'react';
import T from 'i18n-react';
import * as MDL from 'react-mdl'
import Validator from 'validatorjs';
import shallowEqual from 'fbjs/lib/shallowEqual'

export default class Form extends React.Component {
  static propTypes = {
    i18nPath: React.PropTypes.string.isRequired
    , model: React.PropTypes.object.isRequired
    , onSubmit: React.PropTypes.func.isRequired
    , disabled: React.PropTypes.bool
  };

  static childContextTypes = {form: React.PropTypes.object};

  getChildContext() {
    return {form: this};
  }

  constructor(props) {
    super(props);
    const {model, rules} = props;
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.initialModel = model;
    this.state = {};
    this.state.model = model;
    this.state.validation = new Validator(this.state.model, rules);
    this.state.dirty = false;
  }

  componentWillReceiveProps({model}) {
    if (this.props.disabled) {
      this.setState({model})
    }
  }

  onChange(name, value) {
    const {model} = this.state;
    if (!this.props.disabled && model[name] != value) {
      model[name] = value;
      const validation = new Validator(model, this.props.rules);
      validation.passes();
      this.setState({model, validation, dirty: true});
    }
  }

  onSubmit() {
    const model = this.state.model;
    this.setState({model, dirty: false});
    this.props.onSubmit(model);
  }

  render() {
    return <div>
      {this.props.children}
    </div>
  }
}

export class Textfield extends React.Component {
  static propTypes = {name: React.PropTypes.string.isRequired};

  static contextTypes = {form: React.PropTypes.object.isRequired};

  render() {
    const {name} = this.props;
    const onChange = this.context.form.onChange;
    const {i18nPath, disabled} = this.context.form.props;
    const {model, validation} = this.context.form.state;
    return (<MDL.Textfield floatingLabel
                           label={T.translate(i18nPath + '.' + name)}
                           value={model[name]}
                           disabled={disabled}
                           error={validation.errors.errors[name]}
                           onChange={({target}) => onChange(name, target.value)}/>)
  }
}

export class RadioGroup extends React.Component {
  static propTypes = {name: React.PropTypes.string.isRequired};

  static contextTypes = {form: React.PropTypes.object.isRequired};

  render() {
    const {name} = this.props;
    const onChange = this.context.form.onChange;
    const {model, validation} = this.context.form.state;
    return (<MDL.RadioGroup
      name={name}
      value={model[name]}
      onChange={({target}) => onChange(name, target.value)}>
      {this.props.children}
    </MDL.RadioGroup>);
  }
}

export class Checkbox extends React.Component {
  static propTypes = {name: React.PropTypes.string.isRequired};

  static contextTypes = {form: React.PropTypes.object.isRequired};

  render() {
    const {name} = this.props;
    const onChange = this.context.form.onChange;
    const {i18nPath, disabled} = this.context.form.props;
    const {model, validation} = this.context.form.state;
    return (<MDL.Checkbox ripple
                          checked={model[name]}
                          label={T.translate(i18nPath + '.' + name)}
                          value={name}
                          disabled={disabled}
                          onChange={({target}) => onChange(name, target.checked)}/>)
  }
}

export class Submit extends React.Component {
  static propTypes = {id: React.PropTypes.string.isRequired};

  static contextTypes = {form: React.PropTypes.object.isRequired};

  render() {
    const {children, id} = this.props;
    const onSubmit = this.context.form.onSubmit;
    const {disabled} = this.context.form.props;
    const {model, validation, dirty} = this.context.form.state;
    return (<MDL.Button primary raised
                        id={id}
                        disabled={disabled || !dirty || validation.fails()}
                        onClick={onSubmit}>
      {children}
    </MDL.Button>);
  }
}

Form.Textfield = Textfield;
Form.RadioGroup = RadioGroup;
Form.Submit = Submit;
Form.Checkbox = Checkbox;













