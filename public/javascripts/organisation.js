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
      account_type: "local",
      joined_organisation: false,
    },
    organisations: [],
  },
  methods: {
    fetchOrganisations() {
      fetch('/organisation/get_organisations', {
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
          this.organisations = data;
        })
        .catch(error => {
          console.error('Error fetching organisations:', error);
        });
    },
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
    viewOrganisation(index) {
      window.location.href = `/organisation/homepage/${index}`;
    },
  },
  mounted() {
    this.fetchCheckSession();
    this.fetchOrganisations();
  }
});

window.addEventListener("scroll", function () {
  var header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 0);
});

