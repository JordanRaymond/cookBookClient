import React, { Component } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { useHistory, Link } from "react-router-dom"

import Container from "react-bootstrap/Container"
import Input from "./forms/Input"
import { Redirect } from "react-router-dom"
import ReactLoading from "react-loading"

import FormInputs from "../lib/Validation/FormInputs"
import FormInput from "../lib/Validation/Input"
import {
  IsRequired,
  MinLength,
  IsEmail
} from "../lib/Validation/rulesStrategies"

class Login extends Component {
  static contextType = AuthContext

  constructor(props) {
    super(props)

    this.state = {
      isAuth: false, // TODO
      is2ndTitleHover: false,
      waitingForRes: false,
      errors: [],
      formInputs: new FormInputs({
        email: new FormInput([new IsRequired(), new IsEmail()]),
        password: new FormInput([new IsRequired(), new MinLength(6)])
      })
    }
  }

  componentDidMount() {
    let { user } = this.context
    this.setState({ isAuth: user != null })
  }

  handleInputChange = event => {
    let formCopy = Object.assign(
      Object.create(this.state.formInputs),
      this.state.formInputs
    )
    formCopy.updateInput(event)

    const inputName = event.target.name

    formCopy.input(inputName).validate()
    formCopy.input(inputName).isTouched = true

    this.setState({
      formInputs: formCopy
    })
  }

  handleInputBlur = event => {
    let formCopy = Object.assign(
      Object.create(this.state.formInputs),
      this.state.formInputs
    )

    formCopy.validate()

    this.setState({
      formInputs: formCopy
    })
  }

  handleSubmit = async (event, formInputs) => {
    event.preventDefault()

    let formCopy = Object.assign(
      Object.create(this.state.formInputs),
      this.state.formInputs
    )
    const formIsValid = formCopy.validate()

    if (formIsValid) {
      try {
        const { login } = this.context
        this.setState({ waitingForRes: true })

        const { successful, message } = await login(
          formCopy.input("email").value,
          formCopy.input("password").value
        )

        if (successful) {
          this.props.history.push("/")
        } else {
          let errors = []
          errors.push(`Login failed: ${message}`)

          this.setState({ waitingForRes: false, formInputs: formCopy, errors })
        }
      } catch (err) {
        console.log(`Login.js: login err: ${err}`)
        let errors = []
        errors.push(`Login failed: ${err.message}`)

        this.setState({ waitingForRes: false, formInputs: formCopy, errors })
      }
    } else {
      formCopy.validateAllInputs()
      this.setState({ formInputs: formCopy })
    }
  }

  handleKeyDown = event => {
    // 13 is the enter key
    if (event.keyCode === 13) {
      let formCopy = Object.assign(
        Object.create(this.state.formInputs),
        this.state.formInputs
      )
      const inputName = event.target.name

      formCopy.input(inputName).validate()

      this.setState({ formInput: formCopy })

      this.handleSubmit(event, formCopy)
    }
  }

  handleTitleOver = event => {
    this.setState({ is2ndTitleHover: true })
  }

  handleTitleExit = event => {
    this.setState({ is2ndTitleHover: false })
  }

  render() {
    const formInputs = this.state.formInputs
    const { user } = this.context

    const isTitleSelected = this.state.is2ndTitleHover

    return user != null ? (
      <Redirect to={"/"} push={true} />
    ) : (
      <Container>
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
            <div className="card card my-5">
              <div className="card-body">
                <div className="row">
                  <h5
                    className={`card-title ${!isTitleSelected && `selected`}`}
                  >
                    {"Sign In "}
                  </h5>
                  <p className={"px-2"}>{" or"}</p>
                  <Link to="/register">
                    <h5
                      className={`card-title ${isTitleSelected && `selected`}`}
                      onMouseOver={this.handleTitleOver}
                      onMouseLeave={this.handleTitleExit}
                    >
                      {"Sign Up"}
                    </h5>
                  </Link>
                </div>
                <form className="form">
                  {this.state.errors.length > 0 &&
                    this.state.errors.map(err => (
                      <p className="invalid" key={err}>
                        {err}
                      </p>
                    ))}
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email"
                    fullWith
                    required
                    name="email"
                    isValid={formInputs.input("email").isValid}
                    errors={formInputs.input("email").errors}
                    value={formInputs.input("email").value}
                    onChange={this.handleInputChange}
                    handleInputBlur={this.handleInputBlur}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="password"
                    required
                    fullWith
                    name="password"
                    isValid={formInputs.input("password").isValid}
                    errors={formInputs.input("password").errors}
                    value={formInputs.input("password").value}
                    onChange={this.handleInputChange}
                    handleInputBlur={this.handleInputBlur}
                    onKeyDown={this.handleKeyDown}
                  />
                  <div className="custom-control custom-checkbox mb-3">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="customCheck1"
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheck1"
                    >
                      Remember password
                    </label>
                  </div>

                  <button
                    className="btn btn-lg btn-primary btn-block text-uppercase"
                    onClick={this.handleSubmit}
                    type="submit"
                  >
                    {this.state.waitingForRes ? (
                      <div class="lds-ellipsis">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                  <hr className="my-4" />

                  <button
                    className="btn btn-lg btn-google btn-block text-uppercase"
                    disabled
                    type="submit"
                  >
                    <i className="fab fa-google mr-2"></i> Sign in with Google
                  </button>
                  <button
                    className="btn btn-lg btn-facebook btn-block text-uppercase"
                    disabled
                    type="submit"
                  >
                    <i className="fab fa-facebook-f mr-2"></i> Sign in with
                    Facebook
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Container>
    )
  }
}

export default Login
