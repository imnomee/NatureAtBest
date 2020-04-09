/* eslint-disable */

// const login = async (email, password) => {
//   await axios({
//     method: 'POST',
//     url: 'http://localhost:3000/api/v1/users/login',
//     data: {
//       email,
//       password,
//     },
//   })
//     .then((res) => console.log(res))
//     .catch((err) => console.log(err));
// };

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      }
    });
    console.log(res);
  }catch(err){console.log(err.response.data.message)}
    
};

const form = document.querySelector('.form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
