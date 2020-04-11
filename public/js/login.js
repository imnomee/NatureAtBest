/* eslint-disable */
import axios from 'axios'
import { showAlert, hideAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', `Hello ${res.data.data.user.name}. Logged In Successfully`)
      setTimeout(() => {
        location.assign('/');
      }, 1500)
    }
  }catch(err){showAlert('error', `Incorret username or password`)}
    
};

export const logout = async () => {
  try {
    const res = await axios({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/users/logout',
      });
    if (res.data.status === 'success') {
      location.reload(true);
    }
  }catch(err){showAlert('error', 'Error logging out! try again.')}
}