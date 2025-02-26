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

    organisation: {
      name: '',
      leader_id: '',
      description: '',
      id: '',
      image_path: '',

      notifications: false,
      events: [],
      posts: [],
    },

    forms: {
      visible: false,
      image_url: '',

      editting_existing: false,
      editting_id: 0,

      type: "post",

      event_data: {
        title: '',
        message: '',
        deadline: '',
      },
      post_data: {
        title: '',
        message: '',
        public: false,
      },
      attendees: {
      },
      edit_organisation_data: {
        name: '',
        description: '',
      },
    },

    attenders: [],

    main: {
      type: "post",
    },
  },
  methods: {
    fetchMembership() {
      if (this.user.authorised) {
        fetch(`/organisation/check-membership/${this.user.user_id}/${this.organisation.id}`, {
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
            this.user.joined_organisation = data.length ? true : false;
            if (this.user.joined_organisation) {
              this.organisation.notifications = data[0].get_notifications ? true : false;
            }



          })
          .catch(error => {
            console.error('Error checking session:', error);
          });
      }

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
    fetchOrganisationInfo() {
      this.currentPath = window.location.pathname;
      const pathArray = this.currentPath.split('/');
      const view_organisation_id = pathArray[pathArray.length - 1];

      fetch(`/organisation/get_info/${view_organisation_id}`, {
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
          this.organisation = {
            name: data.org_name,
            leader_id: data.leader_user_id,
            description: data.org_description,
            id: data.org_id,
            image_path: data.image_path,
            posts: [],
            events: []
          };

          this.forms.edit_organisation_data.name = data.org_name;
          this.forms.edit_organisation_data.description = data.org_description;

          if (this.user.authorised) {
            this.fetchMembership();
          }
          this.fetchOrganisationPosts();
          this.fetchOrganisationEvents();

        })
        .catch(error => {
          console.error('Error fetching organisation info:', error);
        });
    },
    fetchOrganisationPosts() {
      fetch(`/organisation/get_posts/${this.organisation.id}`, {
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
          this.organisation.posts = data;
        })
        .catch(error => {
          console.error('Error fetching organisation posts:', error);
        });
    },
    fetchOrganisationEvents() {
      fetch(`/organisation/get_events/${this.organisation.id}`, {
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
          this.organisation.events = data;

          this.organisation.events.forEach(element => {
            element.deadline = this.formatDateToLocalISO(element.deadline);
          });
          this.fetchRSVP();
        })
        .catch(error => {
          console.error('Error fetching organisation events:', error);
        });
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
    toggleForm(type, context, id, index) {
      if (context === "edit") {
        if (this.forms.context == "edit" && this.forms.editting_id == id) {
          this.forms.visible = false;
          this.forms.context = "close"
        } else {
          this.forms.visible = true;
          this.forms.context = "edit"
          this.forms.editting_existing = true;
          this.forms.editting_id = id;
          this.forms.type = type;

          if (type == "event") {
            this.forms.event_data.deadline = this.organisation.events[index].deadline;
            this.forms.event_data.message = this.organisation.events[index].content;
            this.forms.event_data.title = this.organisation.events[index].title;
          } else if (type == "post") {
            this.forms.post_data.message = this.organisation.posts[index].content;
            this.forms.post_data.title = this.organisation.posts[index].title;
            this.forms.post_data.public = this.organisation.posts[index].public;
          }
        }
      } else if (context === "create") {
        if (this.forms.context == "create" && this.forms.type == type) {
          this.forms.visible = false;
          this.forms.context = "close"
        } else {
          this.forms.visible = true;
          this.forms.context = "create"
        }
        this.forms.type = type;
        this.forms.editting_existing = false;
        this.forms.editting_id = -1;

        this.forms.event_data = {
          title: '',
          message: '',
          deadline: '',
        };
        this.forms.post_data = {
          title: '',
          message: '',
          public: false,
        };
      } else if (context === "close") {
        this.forms.visible = false;
        this.forms.editting_existing = false;
        this.forms.editting_id = -1;

        this.forms.event_data = {
          title: '',
          message: '',
          deadline: '',
        };
        this.forms.post_data = {
          title: '',
          message: '',
          public: false,
        };
      } else if (context === "show") {
        if (this.forms.context == "show") {
          this.forms.visible = false;
          this.forms.context = "close"
        } else {
          this.forms.visible = true;
          this.forms.context = "show"
          this.forms.type = type;
        }

      } else if (type === "edit-organisation") {
        if (this.forms.context == "edit-organisation") {
          this.forms.visible = false;
          this.forms.context = "close"
        } else {
          this.forms.visible = true;
          this.forms.context = "edit-organisation"
          this.forms.type = type;
        }
      }
    },
    toggleMain(type) {
      this.main.type = type;
    },
    submitEventForm() {
      // Prepare data to send
      const formData = {
        title: this.forms.event_data.title,
        message: this.forms.event_data.message,
        deadline: this.forms.event_data.deadline,
      };

      if (this.forms.editting_existing) {
        if (this.forms.type == "event") {
          // Make POST request to backend
          fetch(`/organisation/edit_event_info/${this.forms.editting_id}`, {
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
              this.forms.visible = false;
              this.forms.context = "close";

              this.forms.editting_existing = false;
              this.forms.editting_id = -1;

              this.forms.event_data = {
                title: '',
                message: '',
                deadline: '',
              };
              this.forms.post_data = {
                title: '',
                message: '',
                public: false,
              };


              this.fetchOrganisationEvents();
            })
            .catch(error => {
              console.error('Error creating post:', error);
            });
        }

      } else {
        fetch(`/organisation/create_event/${this.organisation.id}`, {
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
            this.forms.visible = false;
            this.forms.context = "close";

            this.forms.editting_existing = false;
            this.forms.editting_id = -1;

            this.forms.event_data = {
              title: '',
              message: '',
              deadline: '',
            };
            this.forms.post_data = {
              title: '',
              message: '',
              public: false,
            };
            this.fetchOrganisationEvents();
          })
          .catch(error => {
            console.error('Error creating event:', error);
          });

      }
    },
    submitPostForm() {
      // Prepare data to send
      const formData = {
        title: this.forms.post_data.title,
        message: this.forms.post_data.message,
        public: this.forms.post_data.public ? 1 : 0,
      };

      if (this.forms.editting_existing) {
        if (this.forms.type == "post") {
          // Make POST request to backend
          fetch(`/organisation/edit_post_info/${this.forms.editting_id}`, {
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
              this.forms.visible = false;
              this.forms.context = "close";

              this.forms.editting_existing = false;
              this.forms.editting_id = -1;

              this.forms.event_data = {
                title: '',
                message: '',
                deadline: '',
              };
              this.forms.post_data = {
                title: '',
                message: '',
                public: false,
              };


              this.fetchOrganisationPosts();
            })
            .catch(error => {
              console.error('Error creating post:', error);
            });
        }


      } else {
        fetch(`/organisation/create_post/${this.organisation.id}`, {
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
            this.forms.visible = false;
            this.forms.context = "close";

            this.forms.editting_existing = false;
            this.forms.editting_id = -1;

            this.forms.event_data = {
              title: '',
              message: '',
              deadline: '',
            };
            this.forms.post_data = {
              title: '',
              message: '',
              public: false,
            };
            this.fetchOrganisationPosts();
          })
          .catch(error => {
            console.error('Error creating event:', error);
          });
      }
    },
    submitOrganisationForm() {
      const formData = {
        name: this.forms.edit_organisation_data.name,
        description: this.forms.edit_organisation_data.description,
      };

      fetch(`/organisation/edit_organisation/${this.organisation.id}`, {
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
          this.forms.visible = false;
          this.forms.context = "close";

          this.forms.editting_existing = false;
          this.forms.editting_id = -1;

          this.forms.event_data = {
            title: '',
            message: '',
            deadline: '',
          };
          this.forms.post_data = {
            title: '',
            message: '',
            public: false,
          };
          this.fetchOrganisationInfo();
        })
        .catch(error => {
          console.error('Error creating event:', error);
        });

    },
    toggleMembership() {
      fetch(`/organisation/toggle_membership/${this.user.user_id}/${this.organisation.id}`, {
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
          if (data.status === 'joined') {
            this.user.joined_organisation = true;
          } else if (data.status === 'left') {
            this.user.joined_organisation = false;
          }

          this.fetchOrganisationInfo();
        })
        .catch(error => {
          console.error('Error fetching organisation events:', error);
        });
    },
    toggleNotifications() {
      fetch(`/organisation/toggle_notifications/${this.user.user_id}/${this.organisation.id}`, {
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
          this.organisation.notifications = data.status === 1;
          const button = document.getElementById('notification-button');
          if (button) {
            button.innerHTML = this.organisation.notifications ? `<i class="fa-solid fa-bell"></i>` : `<i class="fa-solid fa-bell-slash selected"></i>`;
          }
        })
        .catch(error => {
          console.error('Error toggling notifications:', error);
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
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    deletePost(post_id) {
      fetch(`/organisation/delete_post/${post_id}`, {
        method: 'POST',
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
          this.fetchOrganisationPosts();
        })
        .catch(error => {
          console.error('Error deleting post:', error);
        });
    },
    deleteEvent(event_id) {
      fetch(`/organisation/delete_event/${event_id}`, {
        method: 'POST',
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
          this.fetchOrganisationEvents();
        })
        .catch(error => {
          console.error('Error deleting event:', error);
        });
    },
    seeAttenders(event_id) {
      fetch(`/organisation/see_rsvp_members/${event_id}`, {
        method: 'GET',
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
          this.attenders = data;

          this.toggleForm('attenders', 'show', -1, -1)
        })
        .catch(error => {
          console.error('Error deleting event:', error);
        });
    },
    formatDateToLocalISO(dateString) {
      const date = new Date(dateString);

      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },


    uploadImage(organisation_id) {
      const form = document.getElementById('uploadForm');
      if (!form) {
        console.error('Form element not found');
        return;
      }
      const formData = new FormData(form);

      fetch(`/images/upload/${organisation_id}`, {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(data => {
          this.fetchOrganisationInfo();
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  },
  mounted() {
    this.fetchCheckSession();
    this.fetchOrganisationInfo();
  },
});


window.addEventListener("scroll", function () {
  var header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 0);
});
