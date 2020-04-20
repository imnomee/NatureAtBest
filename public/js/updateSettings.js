import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updatepassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated Successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const updateSettings = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://localhost:3000/api/v1/users/updateMe',
//       data: {
//         name,
//         email,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'Data updated Successfully');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
