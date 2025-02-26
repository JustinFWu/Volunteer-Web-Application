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
    },

    // Contains information on all joined organisations
    organisations: [],

    // Page state E.G {organisation, manage, profile}
    right_content: "profile",

    // Organisation information
    highlightedIndex: -1,
    viewing: 'post',
    organisation: {
      posts: [],
      events: [],
    },

    // Profile information
    profile: {
      username: '',
      email: '',
      id: '',
      display_name: '',
      first_name: '',
      last_name: ''
    },

    // Manage information
    manage: {
      users: [],
      relations: [],
      organisation_leaders: [],
      manage_state: 0,
    },

    form: {
      visible: false,
      context: "organisation",

      profile_info: {
        display_name: '',
        first_name: '',
        last_name: '',
        user_id: 0,
      }
    }
  },
  methods: {
    highlight(index) {
      this.highlightedIndex = index;
      this.fetchOrganisationPostsAndEvents();
    },
    handleItemClick(item) {
      if (item === 'manage') {
        this.fetchManageData();
      }
      this.right_content = item;
    },
    toggleEventOrPost() {
      if (this.viewing == 'post') {
        this.viewing = 'event';
      } else {
        this.viewing = 'post';
      }
    },


    // Fetch all necessary data for managing organisations
    fetchManageData() {
      this.fetchGetAllUsers();
      this.fetchGetConnections();
      this.fetchOrganisationLeader();
    },

    // Fetch organisations user is part of
    fetchOrganisations() {
      this.fetchData('/organisation/get_organisations', (data) => {


        if (Object.keys(data).length > 0) {


          const organisationCount = data.names.length;


          this.organisations = [];

          var orgs_part_of = 0;
          for (let i = 0; i < organisationCount; i++) {

            const organisation = {
              name: data.names[i],
              ids: data.ids[i],
              description: data.description[i],
              is_member: data.is_member[i]
            };
            if (data.is_member[i]) {
              orgs_part_of++;
            }
            this.organisations.push(organisation);
          }

          if (orgs_part_of > 0) {
            this.highlightedIndex = 0;
            this.fetchOrganisationPostsAndEvents();
          }
        }
      }, 'Error fetching organisations');
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
            this.fetchProfileInfo();
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
    joinOrganisation(organisation_id) {
      this.fetchData(`/organisation/join_organisation/${organisation_id}`, () => {
        this.fetchOrganisations();
      }, 'Error joining organization', 'GET');
    },
    leaveOrganisation(organisation_id) {
      this.fetchData(`/organisation/leave_organisation/${organisation_id}`, () => {
        this.fetchOrganisations();
      }, 'Error leaving organization', 'GET');
    },

    // Organisation actions
    fetchOrganisationPostsAndEvents() {
      this.fetchData(`/organisation/get_posts/${this.organisations[this.highlightedIndex].ids}`, (data) => {
        this.organisation.posts = data;
        this.organisation.posts.forEach(post => {
          post.post_date = this.formatDeadline(post.post_date);
        });
      }, 'Error fetching posts');
      this.fetchData(`/organisation/get_events/${this.organisations[this.highlightedIndex].ids}`, (data) => {
        this.organisation.events = data;
        this.organisation.events.forEach(event => {
          event.deadline = this.formatDeadline(event.deadline);
        });
        this.fetchRSVP();
      }, 'Error fetching events');
    },
    fetchRSVP() {
      this.organisation.events.forEach((event, index) => {
        fetch(`/organisation/check_rsvp/${event.id}`, {
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
            // Add the rsvp property to the corresponding event
            this.$set(this.organisation.events, index, {
              ...event,
              rsvp: data['rsvp_count'] ? true : false
            });
          })
          .catch(error => {
            console.error('Error fetching RSVP:', error);
          });
      });
    },

    // Profile actions

    // Initialise profile variables
    fetchProfileInfo() {
      fetch(`/users/get_info/${this.user.user_id}`, {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          this.profile = {
            username: data[0].username,
            email: data[0].email,
            id: data[0].id,
            display_name: data[0].display_name,
            first_name: data[0].first_name,
            last_name: data[0].last_name,
          };
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
        });
    },
    ProfileFormSubmit() {
      const userId = this.profile.id;
      const { display_name, first_name, last_name, username, email } = this.profile;

      this.fetchData(`/users/edit_info/${userId}`, () => {
        console.log('User information updated successfully!');
      }, 'Error updating user information', 'PUT', {
        display_name, first_name, last_name, username, email
      });
    },

    // Manage actions

    // Initialise manage variables
    fetchGetAllUsers() {
      this.fetchData('/users/get_all', data => {
        this.manage.users = data;
      }, 'Error fetching users');
    },
    fetchGetConnections() {
      this.fetchData('/organisation/get_user_relations', data => {
        this.manage.relations = data;
      }, 'Error fetching user relations');
    },
    fetchOrganisationLeader() {
      this.fetchData('/organisation/get_organisation_leaders', data => {
        this.manage.organisation_leaders = data;
      }, 'Error fetching organisation leaders');
    },

    removeConnection(user_id, organisation_id) {
      this.fetchData(`/organisation/remove_user_relation/${user_id}/${organisation_id}`, () => {
        this.fetchManageData();
      }, 'Error removing connection', 'GET');
    },
    removeUser(user_id) {
      this.fetchData(`/users/remove_user/${user_id}`, () => {
        this.fetchGetAllUsers();
      }, 'Error removing user', 'GET');
    },
    leaderOptions(organisationId, userId) {
      if (!Array.isArray(this.manage.relations)) {
        return [];
      }
      return this.manage.relations
        .filter(relation => relation.organisation_id === organisationId && relation.user_id !== userId)
        .map(user => ({
          id: user.user_id,
          name: user.user_display_name,
          user_id: user.user_id,
        }));
    },
    submitLeaderChange(user) {
      const newLeaderId = user.newLeaderId;
      this.fetchData(`/organisation/change_leader/${user.organisation_id}`, () => {
        console.log('Leader changed successfully!');
        user.editing = false;
        this.fetchManageData();
      }, 'Error changing leader', 'POST', { newLeaderId });
    },
    handleManageState(index) {
      this.manage.manage_state = parseInt(index);
    },

    fetchData(url, onSuccess, errorMessage, method = 'GET', body = null) {
      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok.');
          }
          return response.json();
        })
        .then(onSuccess)
        .catch(error => {
          console.error(errorMessage, error);
        });
    },
    toggleRSVP(eventId) {
      fetch(`/organisation/rsvp/${eventId}`, {
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
          this.fetchRSVP();
        })
        .catch(error => {
          console.error('Error fetching organisation events:', error);
        });
    },
    toggleForm(context) {
      if (this.form.context == context) {
        this.form.visible = !this.form.visible;
      } else {
        this.form.visible = true;
      }
      this.form.context = context;
    },



    submitOrganisationForm() {
      const form = document.querySelector('#add-organisation-form form');
      const formData = {
        name: form.querySelector('#name').value,
        description: form.querySelector('#description').value
      };

      fetch(`/organisation/create_organisation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          this.fetchOrganisationLeader();
          this.toggleForm("organisation");
        })
        .catch(error => {
          console.error('Error creating event:', error);
        });
    },
    promote(userId) {
      console.log(userId);

      fetch(`/users/promote/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          this.fetchGetAllUsers();
        })
        .catch(error => {
          console.error('Error creating event:', error);
        });
    },
    userProfileForm(index) {
      this.form.profile_info = {
        display_name: this.manage.users[index].display_name,
        first_name: this.manage.users[index].first_name,
        last_name: this.manage.users[index].last_name,
        user_id: this.manage.users[index].id,
      }

      this.toggleForm('profile');
    },
    submitEditUserForm() {
      const formData = {
        display_name: this.form.profile_info.display_name,
        first_name: this.form.profile_info.first_name,
        last_name: this.form.profile_info.last_name,
        user_id: this.form.profile_info.id,
      };

      fetch(`/users/edit_info/${this.form.profile_info.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          this.fetchGetAllUsers();
          this.toggleForm("profile");
        })
        .catch(error => {
          console.error('Error creating event:', error);
        });
    },
    deleteOrganisation(orgId) {

      fetch(`/organisation/delete_organisation/${orgId}`, {
        method: 'PUT',
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
          this.fetchOrganisationLeader();
        })
        .catch(error => {
          console.error('Error deleting organisation:', error);
        });
    },

    formatDeadline(deadline) {
      const date = new Date(deadline);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }
  },
  mounted() {
    this.fetchCheckSession();

    this.fetchOrganisations();
    if (this.user.isAdmin || this.user.isLeader) {
      this.fetchManageData();
    }
  }
});