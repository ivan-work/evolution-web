import React from "react";
import {compose} from 'recompose';
import {connect} from 'react-redux';
import Validator from "validatorjs";
import uniqueId from 'lodash/uniqueId';
import debounce from 'lodash/debounce';
import {formValidationClear} from "../../shared/actions/generic";

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function ({
                           form
                           , rules
                           , onSubmit
                           , debounceTime = 500
                         }) {
  return compose(
    connect(
      state => ({forms: state.app.get('forms')})
      , {formValidationClear}
    )
    , (function withForm(WrappedComponent) {
      class WithForm extends React.PureComponent {
        state = {
          form: {
            id: uniqueId('form-')
            , ...form
          }
          , errors: {}
        };

        static getDerivedStateFromProps(props, state) {
          const form = props.forms.get(state.form.id);
          if (form) {
            return {
              ...state
              , errors: {...state.errors, ...form.toJS()}
            }
          } else {
            return null;
          }
        }

        formOnChange = (e) => {
          const {name, value} = e.target;
          const form = {...this.state.form};
          form[name] = value;
          this.setState({form});
          this.debounceValidateForm(form);
        };

        validateForm = (form) => {
          const validation = new Validator(form, rules);
          validation.check();
          console.log(validation.errors.errors);
          this.setState({errors: validation.errors.errors});
        };

        debounceValidateForm = debounce(this.validateForm, debounceTime);

        formOnSubmit = e => {
          e.preventDefault();
          onSubmit(this.state.form, this.props);
        };

        componentWillUnmount() {
          this.debounceValidateForm.cancel();
          this.props.formValidationClear(this.state.form.id);
        }

        render() {
          return <WrappedComponent
            {...this.state}
            formOnChange={this.formOnChange}
            formOnSubmit={this.formOnSubmit}
            {...this.props}
          />
        }
      }

      WithForm.displayName = `WithForm(${getDisplayName(WrappedComponent)})`;

      return WithForm;
    })
  )
}