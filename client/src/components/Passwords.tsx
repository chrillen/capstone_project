import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPassword, deletePassword, getPasswords, patchPassword } from '../api/passwords-api'
import Auth from '../auth/Auth'
import { Password } from '../types/Password'

interface PasswordsProps {
  auth: Auth
  history: History
}

interface PasswordsState {
  passwords: Password[]
  newPasswordTitle: string,
  newPasswordUserName: string,
  newPasswordPassword: string,
  newPasswordUrl: string,
  loadingPasswords: boolean
}

export class Passwords extends React.PureComponent<PasswordsProps, PasswordsState> {
  state: PasswordsState = {
    passwords: [],
    newPasswordTitle: '',
    newPasswordUserName: '',
    newPasswordPassword: '',
    newPasswordUrl: '',
    loadingPasswords: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPasswordTitle: event.target.value })
  }

  handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPasswordUserName: event.target.value })
  }

  handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPasswordPassword: event.target.value })
  }

  handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPasswordUrl: event.target.value })
  }

  onEditButtonClick = (passwordId: string) => {
    this.props.history.push(`/passwords/${passwordId}/edit`)
  }

  onPasswordCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newPassword = await createPassword(this.props.auth.getIdToken(), {
        title: this.state.newPasswordTitle,
        userName: this.state.newPasswordUserName,
        password: this.state.newPasswordPassword,
        url: this.state.newPasswordUrl || ''
      })
      this.setState({
        passwords: [...this.state.passwords, newPassword],
        newPasswordTitle: '',
        newPasswordPassword: '',
        newPasswordUrl: '',
        newPasswordUserName: ''
      })
    } catch {
      alert('Password creation failed')
    }
  }

  onPasswordDelete = async (passwordId: string) => {
    try {
      await deletePassword(this.props.auth.getIdToken(), passwordId)
      this.setState({
        passwords: this.state.passwords.filter(password => password.passwordId != passwordId)
      })
    } catch {
      alert('Password deletion failed')
    }
  }

  onPasswordCheck = async (pos: number) => {
    /*
    try {
      const password = this.state.passwords[pos]
      await patchTodo(this.props.auth.getIdToken(), password.passwordId, {
        title: password.title,
        userName: password.userName,
        password: password.passwordId,
        url: password.url || ''
      })
      this.setState({
        todos: update(this.state.passwords, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }*/
  }

  async componentDidMount() {
    try {
      const passwords = await getPasswords(this.props.auth.getIdToken())
      this.setState({
        passwords,
        loadingPasswords: false
      })
    } catch (e) {
      alert(`Failed to fetch passwords: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Password Manager</Header>

      <Grid.Row>
        {this.renderCreatePasswordTitleInput()}
        <br />
        {this.renderCreatePasswordUserNameInput()}
        <br />
        {this.renderCreatePasswordPasswordInput()}
        <br />
        {this.renderCreatePasswordUrlInput()}
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>

        {this.renderPasswordsList()}
      </div>
    )
  }

  renderCreatePasswordTitleInput() {
    return (
      <Grid.Column width={16}>
      <Input
        action={{
          color: 'teal',
          labelPosition: 'left',
          icon: 'add',
          content: 'Add New Record',
          onClick: this.onPasswordCreate
        }}
        fluid
        actionPosition="left"
        placeholder="Name of the site password belongs to"
        onChange={this.handleTitleChange}
      />
      </Grid.Column>
    )
  }

  renderCreatePasswordUserNameInput() {
    return (
    <Grid.Column width={16}>
      <Input
        fluid
        placeholder="Name of the site password belongs to"
        onChange={this.handleUserNameChange}
      />
    </Grid.Column>
    )
  }

  renderCreatePasswordPasswordInput() {
    return (
    <Grid.Column width={16}>
      <Input
        fluid
        type="password"
        placeholder="Password for the site"
        onChange={this.handlePasswordChange}
      />
    </Grid.Column>
    )
  }

  renderCreatePasswordUrlInput() {
    return (
    <Grid.Column width={16}>
      <Input
        fluid
        placeholder="Url of the site password belong to"
        onChange={this.handleUrlChange}
      />
    </Grid.Column>
    )
  }



  renderPasswords() {
    if (this.state.loadingPasswords) {
      return this.renderLoading()
    }

    return this.renderPasswordsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Passwords
        </Loader>
      </Grid.Row>
    )
  }

  renderPasswordsList() {
    return (
      <Grid padded>
        {this.state.passwords.map((password, pos) => {
          return (
            <Grid.Row key={password.passwordId}>
              {/* Will fix this later
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox                
                  onChange={() => this.onPasswordCheck(pos)}
                  checked={todo.done}                  
                />
              </Grid.Column>
                */}
              <Grid.Column width={3}>
                {password.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {password.userName}
              </Grid.Column>
              <Grid.Column width={3}  floated="right">
                {password.password} 
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {password.url}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(password.passwordId)}>
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPasswordDelete(password.passwordId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {password.attachmentUrl && (
                <Image src={password.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
