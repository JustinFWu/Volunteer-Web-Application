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
    public_posts: [],
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
    fetchPublicPosts() {
      fetch('/organisation/get_public_posts', {
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
          this.public_posts = data;
        })
        .catch(error => {
          console.error('Error checking session:', error);
        });
    },
    setupCarousel() {
      const carousel = document.querySelector('#news-carousel');
      const items = carousel.querySelectorAll('.carousel-item');
      let currentIndex = 0;

      function showItem(index) {
        items[currentIndex].classList.remove('active');
        currentIndex = index;
        items[currentIndex].classList.add('active');
      }

      function nextItem() {
        const nextIndex = (currentIndex === items.length - 1) ? 0 : currentIndex + 1;
        showItem(nextIndex);
      }

      carousel.querySelector('.carousel-control-prev').addEventListener('click', function (event) {
        event.preventDefault();
        const prevIndex = (currentIndex === 0) ? items.length - 1 : currentIndex - 1;
        showItem(prevIndex);
      });

      carousel.querySelector('.carousel-control-next').addEventListener('click', function (event) {
        event.preventDefault();
        nextItem();
      });

      setInterval(nextItem, 3000);
    }
  },
  mounted() {
    this.fetchCheckSession();
    this.fetchPublicPosts();
    this.setupCarousel();
  }
});

window.addEventListener("scroll", function () {
  var header = document.querySelector("header");
  header.classList.toggle("sticky", window.scrollY > 0);
});
