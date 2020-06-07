import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import Auth from '../api/auth-api';


interface RegisterProps {
  auth: Auth
  history: any
}

interface RegisterState {
   password: string,
   username: string,
   isButtonDisabled: boolean,
   helperText: string,
   error: boolean
}

export class Register extends React.PureComponent<RegisterProps,RegisterState> {
  classes: any = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      width: 400,
      margin: `${theme.spacing(0)} auto`
    },
    loginBtn: {
      marginTop: theme.spacing(2),
      flexGrow: 1
    },
    header: {
      textAlign: 'center',
      background: '#212121',
      color: '#fff'
    },
    card: {
      marginTop: theme.spacing(10)
    }
  }),);

    state: RegisterState = {
        password: '',
        username: '',
        isButtonDisabled: false,
        helperText: '',
        error: false   
      }

      handlePassword = (password: string) => {
        this.setState({ password: password })
      }

      handleUsername = (userName: string) => {
        this.setState({ username: userName })
      }

      handleIsButtonDisabled = (isButtonDisabled: boolean) => {
        this.setState({ isButtonDisabled: isButtonDisabled })
      }

      handleHelperText = (helperText: string) => {
        this.setState({ helperText: helperText })
      }
    
      handleError = (error: boolean) => {
        this.setState({ error: error })
      }

      handleRegister = async () => {
        try {
        const result =  await this.props.auth.register(this.state.username,this.state.password)
            this.handleError(false);
            this.handleHelperText('User Registered Successfully');
            this.props.history.replace('/');
        } catch(error) {
            this.handleError(true);
            this.handleHelperText('User Could not be saved')
        }
      };
    
       handleKeyPress = async (e:any) => {
        if (e.keyCode === 13 || e.which === 13) {
          this.handleIsButtonDisabled || await this.handleRegister();
        }
      };
    
      render() {
        return (
          <form className={this.classes.container} noValidate autoComplete="off">
            <Card className={this.classes.card}>
              <CardHeader className={this.classes.header} title="Register Password Manager" />
              <CardContent>
                <div>
                  <TextField
                    error={this.state.error}
                    fullWidth
                    id="username"
                    type="email"
                    label="Username"
                    placeholder="Username"
                    margin="normal"
                    onChange={(e)=>this.handleUsername(e.target.value)}
                    onKeyPress={(e)=>this.handleKeyPress(e)}
                  />
                  <TextField
                    error={this.state.error}
                    fullWidth
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Password"
                    margin="normal"
                    helperText={this.state.helperText}
                    onChange={(e)=>this.handlePassword(e.target.value)}
                    onKeyPress={(e)=>this.handleKeyPress(e)}
                  />
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={this.classes.loginBtn}
                  onClick={()=>this.handleRegister()}
                  disabled={this.state.isButtonDisabled}>
                  Register
                </Button>
              </CardActions>
            </Card>
          </form>
     )
    }
};