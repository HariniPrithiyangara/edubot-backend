const axios = require('axios');
async function testChat() {
  try {
    const signupRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testprod123@gmail.com',
      password: 'password123'
    });
    const token = signupRes.data.token;
    await axios.post('http://localhost:5000/api/chat', {
       text: 'Hello, what is your name?',
       subject: 'math'
    }, { headers: { Authorization: 'Bearer ' + token } });
  } catch (err) {
    console.error('Test Chat Error:', err.response ? err.response.data : err.message);
  }
}
testChat();
