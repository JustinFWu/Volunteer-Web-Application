/* eslint-disable no-undef */

const vueinst = new Vue({
  el: '#app',
  data: {
    user: {
      authorised: false,
      username: "guest",
      user_id: "",
      isAdmin: false,
      isLeader: false,
      account_type: "local"
    },
    formData: {
      username: '',
      password: '',
      email: '',
      student_id: '',
      display_name: '',
      first_name: '',
      last_name: ''
    },

  },
  methods: {
    fetchCheckSession() {
      fetch('/check-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          if (data.sessionExists) {
            this.user = {
              authorised: true,
              username: data.username,
              user_id: data.userId,
              isAdmin: data.isAdmin,
              isLeader: data.isLeader,
              account_type: data.account_type,
            };
          } else {
            this.user = {
              authorised: false,
              username: "guest",
              user_id: "",
              isAdmin: false,
              isLeader: false,
              account_type: "local",

            };
          }
        })
        .catch(error => {
          console.error('Error checking session:', error);
        });
    },
    submitForm() {
      fetch('/users/sign_up/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.formData)
      })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
          if (result.status >= 200 && result.status < 300) {
            if (result.body.success) {
              window.location.href = result.body.redirect;
            } else {
              this.errorMessage = result.body.error || 'Unknown error occurred';
            }
          } else {
            this.errorMessage = result.body.error || 'Unknown error occurred';
          }
        })
        .catch(error => {
          this.errorMessage = 'Error during sign up';
          console.error('Error:', error);
        });
    }
  },
  mounted() {
    this.fetchCheckSession();
  }
});
