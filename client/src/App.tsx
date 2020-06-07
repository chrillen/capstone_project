import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import { Login } from './components/Login'
import { Register } from './components/Register'
import { EditPassword } from './components/EditPassword'
import { NotFound } from './components/NotFound'
import { Passwords } from './components/Passwords'
import Auth from './api/auth-api'
import { runInThisContext } from 'vm'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {
  callingRegOrNot: boolean
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleRegister = this.handleRegister.bind(this)
  }

  state: AppState = { 
    callingRegOrNot: false
  }


  handleRegister() {
    this.setState({ callingRegOrNot: true })
    return <Register history={this.props.history} auth={this.props.auth} />
  }

  handleLogin() {    
    this.setState({ callingRegOrNot: false })
    return <Login history={this.props.history} auth={this.props.auth} />
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Menu>{this.registerButton()}</Menu.Menu>
        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  registerButton() {
    if (this.props.auth.isAuthenticated() === false) {
      return (
        <Menu.Item name="register" onClick={this.handleRegister}>
          Register
        </Menu.Item>
      )
    } 
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated() && this.state.callingRegOrNot === false) {
      return <Login history={this.props.history} auth={this.props.auth} />
    }

    if (!this.props.auth.isAuthenticated() && this.state.callingRegOrNot === true) {
      return <Register history={this.props.history} auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Passwords {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/passwords/:passwordId/edit"
          exact
          render={props => {
            return <EditPassword {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
