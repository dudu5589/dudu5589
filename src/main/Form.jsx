import React, { Component } from 'react';
import '../App.css';

import Name from '../components/Name';
import validate from '../components/validate';
import Email from '../components/Email';
import Select from '../components/Select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

class App extends Component {

  constructor() {
    super();

    this.state = {
      chatStatus: false,
      error: false,
      isLoading: true,
      showError: false,
      formIsValid: false,
      formControls: {

        name: {
          value: '',
          placeholder: 'Name',
          valid: "false",
          validationRules: {
            minLength: 4,
            isRequired: true
          },
          touched: "false"
        },
        phone: {
          value: '',
          placeholder: 'Phone number',
          valid: "true",
          touched: "true"
        },
        email: {
          value: '',
          placeholder: 'Email',
          valid: "false",
          validationRules: {
            isRequired: true,
            isEmail: true
          },
          touched: "false"
        },
        department: {
          value: '',
          placeholder: 'Department',
          valid: "false",
          touched: "true",
          validationRules: {
            isRequired: true,
          },
          options: [
            { value: '', displayValue: 'Select a Department' },
            { value: 'support', displayValue: 'Support' },
            { value: 'sales', displayValue: 'Sales' }
          ]
        }

      }

    }

  }

  changeHandler = event => {

    const name = event.target.name;
    const value = event.target.value;

    const updatedControls = {
      ...this.state.formControls
    };
    const updatedFormElement = {
      ...updatedControls[name]
    };
    updatedFormElement.value = value;
    updatedFormElement.touched = "true";
    updatedFormElement.valid = validate(value, updatedFormElement.validationRules);

    updatedControls[name] = updatedFormElement;

    let formIsValid = true;
    for (let inputIdentifier in updatedControls) {
      formIsValid = updatedControls[inputIdentifier].valid && formIsValid;
    }

    this.setState({
      formControls: updatedControls,
      formIsValid: formIsValid
    });

    this.formSendDataToChat()

  }

  formSubmitHandler = () => {
    const formData = {};
    for (let formElementId in this.state.formControls) {
      formData[formElementId] = this.state.formControls[formElementId].value;
    }
    console.dir(formData);

  }

  formSendDataToChat = () => {

    window.jivo_api.setContactInfo(
      {
        name: this.state.formControls.name.value,
        email: this.state.formControls.email.value,
        phone: this.state.formControls.phone.value,
        description: ''
      }
    );
  }

  formSendProactiveInvitation = () => {

    var clientName = window.jivo_api.getContactInfo().client_name;
    window.jivo_api.showProactiveInvitation('Hello, dear ' + clientName + '! How can I help you today?')

  }

  startChat = () => {
    if (this.state.chatStatus) {  
      this.formSubmitHandler()
      this.formSendProactiveInvitation()
    }
    else if (!this.state.chatStatus) {
      this.setState({...this.state, showError:true})
      setTimeout(() => {this.setState({...this.state, showError:false})}, 2000)
      window.jivo_init()
    }
    else {this.setState({...this.state, chatStatus: false, isLoading: true, error: true})}
  }

  async componentDidMount() {
    try {
      const status = await fetch("http://node136.jivosite.com/widget/status/497422/ZLM6UIaTWf")
      const response = await status.json()
      const isOnline = Boolean(response.agents && response.agents.length)

      this.setState({...this.state, chatStatus: isOnline, isLoading: false})
      console.log(isOnline)
    }
    catch(e) {
      this.setState({...this.state, chatStatus: false, isLoading: true, error: true})
    }
  }

  render() {

    return (

      <div className="App">

        {this.state.isLoading && <p>Loading, please wait</p>}
        {!this.state.chatStatus && !this.state.isLoading && <p>Chat Offline</p>}
        {this.state.error && <p>Failed to load, please refresh to try again.</p>}

        <form disabled={this.state.isLoading || !this.state.chatStatus}>
          
          <Name name="name" disabled={this.state.isLoading || !this.state.chatStatus}
            placeholder={this.state.formControls.name.placeholder}
            value={this.state.formControls.name.value}
            onChange={this.changeHandler}
            touched={this.state.formControls.name.touched}
            valid={this.state.formControls.name.valid}
          />

          <PhoneInput name="phone" disabled={this.state.isLoading || !this.state.chatStatus}
            country={'us'}
            placeholder={this.state.formControls.phone.placeholder}
            value={this.state.phone}
            onChange={phone => this.setState({ phone })}
            touched={this.state.formControls.phone.touched}
            valid={this.state.formControls.phone.valid}
          />

          <Email name="email" disabled={this.state.isLoading || !this.state.chatStatus}
            placeholder={this.state.formControls.email.placeholder}
            value={this.state.formControls.email.value}
            onChange={this.changeHandler}
            touched={this.state.formControls.email.touched}
            valid={this.state.formControls.email.valid}
          />

          <Select name="department" disabled selected disabled={this.state.isLoading || !this.state.chatStatus}
            placeholder={this.state.formControls.department.placeholder}
            value={this.state.formControls.department.value}
            onChange={this.changeHandler}
            options={this.state.formControls.department.options}
            touched={this.state.formControls.department.touched}
            valid={this.state.formControls.department.valid}
          />

          <button type="submit" id="startChatButton" disabled={!this.state.formIsValid || this.state.isLoading || !this.state.chatStatus}
            onClick={this.startChat}
          >
            <span disabled={!this.state.formIsValid || this.state.isLoading || !this.state.chatStatus}>
              Start Chat
            </span>
          </button>

          {this.state.showError && <div id="startChatButtonError">
            <span id="errorMessageChatOffline">
              We're currently offline. Please try again later.
            </span>
          </div>}
        </form>
      </div>
    )
  }
}

export default App;