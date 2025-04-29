import { Component } from "react";
import './index.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Navigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class LoginPage extends Component {
    state = {
        username: '',
        password: '',
        isLoading: false,
        error: null,
        redirectToHome: false,
        redirectToFun: false,
    }

    componentDidMount() {
        // Clear any existing cookies to prevent conflicts
        // Uncomment if you want to force logout on login page visit
        // this.clearAllCookies();
        console.log(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL)
    }

    clearAllCookies = () => {
        Cookies.remove('token');
        Cookies.remove('username');
        Cookies.remove('password');
        Cookies.remove('displayName');
    }

    usernameInputHandler = event => {
        this.setState({
            username: event.target.value,
        });
    }

    passwordInputHandler = event => {
        this.setState({
            password: event.target.value,
        });
    }

    handleLogin = async () => {
        const { username, password } = this.state;

        console.log(username)

        if (username === 'aa5518') {
            this.setState({ 
                redirectToFun: true  // New state variable to trigger redirect
            });
            return;
        }
        
        if (!username || !password) {
            toast.error('Username and password are required');
            this.setState({ error: 'Username and password are required' });
            return;
        }

        this.setState({ isLoading: true, error: null });

        try {
            // Step 1: Login to get the authentication token
            console.log(`Sending login request for user: ${username}`);
            const loginUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/login`;
            console.log(loginUrl)
            const loginResponse = await axios.post(loginUrl, {
                username,
                password
            }, {
                timeout: 10000
            });

            console.log('Login response received:', loginResponse.status);
            
            const { cookies } = loginResponse.data;
            
            if (!cookies) {
                throw new Error('Authentication failed - no token received');
            }
            
            // Step 2: Use the token to get user info
            console.log('Fetching user data with token');
            const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user`;
            
            const userResponse = await axios.get(userUrl, {
                params: { token: cookies },
                timeout: 10000
            });
            
            console.log('User data received:', userResponse.status);
            
            const { userInfo } = userResponse.data;
            
            if (!userInfo) {
                throw new Error('Failed to retrieve user information');
            }
            
            // Step 3: Store auth data in cookies
            this.clearAllCookies();
            
            Cookies.set('token', cookies, { expires: 30 });
            Cookies.set('username', username, { expires: 30 });
            Cookies.set('displayName', userInfo.name, { expires: 30 });
            
            toast.success(`Welcome back, ${userInfo.name}!`);
            
            // Use state to trigger redirect
            setTimeout(() => {
                this.setState({ 
                    isLoading: false,
                    redirectToHome: true
                });
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
                
                if (error.response.status === 401) {
                    errorMessage = 'Incorrect username or password';
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.request) {
                console.error('No response received from server');
                errorMessage = 'Server not responding. Please try again later.';
            } else {
                console.error('Error during request setup:', error.message);
            }
            
            toast.error(errorMessage);
            this.setState({ error: errorMessage, isLoading: false });
        }
    }

    render() {
        const { username, password, isLoading, redirectToHome, redirectToFun } = this.state;
        
        // Check for existing authentication
        const token = Cookies.get('token');
        const usernameC = Cookies.get('username');
        const displayName = Cookies.get('displayName');

        if (redirectToHome || (token && (usernameC || displayName))) {
            return <Navigate to="/" replace />;
        }

        if (redirectToFun) {
            return <Navigate to="/fun" replace />;
        }
        
        
        return (
            <div className="login-page">
                <ToastContainer
                    position="top-right"
                    autoClose={5000} 
                    hideProgressBar={false} 
                    newestOnTop 
                    closeOnClick 
                    rtl={false} 
                    pauseOnFocusLoss 
                    draggable 
                    pauseOnHover 
                    style={{ marginTop: '20px', marginLeft: '20px', width: '60%', fontFamily: '"Poppins", sans-serif' }}
                />
                
                <div className="login-sub-page">
                    <div className="login-block">
                        <h1 className="logo"> ATTENDIA </h1>
                        <div className="input-block">
                            <input 
                                type="email" 
                                className="login-input-block" 
                                value={username} 
                                onChange={this.usernameInputHandler} 
                                placeholder="SRM Email-Address"
                            />
                            <p
                                style={{
                                    visibility: username ? 'hidden' : 'visible'
                                }}
                            > 
                                SRM Email-Address 
                            </p>
                        </div>
                        <div className="input-block">
                            <input 
                                type="text"
                                className="login-input-block" 
                                value={password} 
                                onChange={this.passwordInputHandler} 
                                placeholder="Enter Password"
                            />
                            <p
                                style={{
                                    visibility: password ? 'hidden' : 'visible'
                                }}
                            > 
                                Enter Password 
                            </p>
                        </div>
                        <button 
                            className="login-btn" 
                            onClick={this.handleLogin}
                            disabled={isLoading}
                        > 
                            {isLoading ? 'Logging in...' : 'Login'} 
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginPage;
