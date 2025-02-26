// routes/organisation.js
const express = require('express');
const path = require('path');
const { connection } = require('../db');
const { isAuth, isLeader, isAdmin } = require('../authMiddleware');
const { resourceLimits } = require('worker_threads');

const router = express.Router();

router.post('/create_organisation', isAdmin, (req, res) => {
  const insertQuery = `INSERT INTO organisations (name, user_id, description) VALUES (?, ?, ?)`;
  const { name, description } = req.body;

  connection.query(insertQuery, [name, req.session.passport.user.id, description], (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }

    const created_id = result.insertId;

    const insertQuery2 = `INSERT INTO organisation_user_relations (user_id, organisation_id) VALUES (?, ?)`;
    connection.query(insertQuery2, [req.session.passport.user.id, created_id], (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }

      res.status(200).send(result);
    });
  });
});

router.put('/edit_organisation/:org_id', isAuth, (req, res) => {
  const leaderQuery = 'SELECT * FROM organisations WHERE user_id = ? AND id = ?';
  const orgId = req.params.org_id;
  const { name, description } = req.body;

  connection.query(leaderQuery, [req.session.passport.user.id, orgId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });

    }
    if (result.length == 1 || req.session.passport.user.isAdmin) {
      const updateQuery = 'UPDATE organisations SET name = ?, description = ? WHERE id = ?';
      connection.query(updateQuery, [name, description, orgId], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        return res.json({ message: 'Updated organisation info', status: 'success' });
      });
    }
  });
});

router.put('/delete_organisation/:org_id', isAdmin, (req, res) => {
  const orgId = req.params.org_id;

  Promise.all([
    new Promise((resolve, reject) => {
      const deleteEventRSVPQuery = `
        DELETE e_rsvp
        FROM events e
        JOIN event_rsvp e_rsvp ON e_rsvp.event_id = e.id
        WHERE e.organisation_id = ?;`;

      connection.query(deleteEventRSVPQuery, [orgId], (err, result) => {
        if (err) {
          console.log("Error deleting event RSVP:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    }),
    new Promise((resolve, reject) => {
      const deleteEventsQuery = `
        DELETE FROM events
        WHERE organisation_id = ?;`;

      connection.query(deleteEventsQuery, [orgId], (err, result) => {
        if (err) {
          console.log("Error deleting events:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    }),
    new Promise((resolve, reject) => {
      const deletePostsQuery = `
        DELETE FROM posts
        WHERE organisation_id = ?;`;

      connection.query(deletePostsQuery, [orgId], (err, result) => {
        if (err) {
          console.log("Error deleting posts:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    }),
    new Promise((resolve, reject) => {
      const deleteMembershipsQuery = `
        DELETE FROM organisation_user_relations
        WHERE organisation_id = ?;`;

      connection.query(deleteMembershipsQuery, [orgId], (err, result) => {
        if (err) {
          console.log("Error deleting memberships:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    }),
    new Promise((resolve, reject) => {
      const deleteOrganisationQuery = `
        DELETE FROM organisations
        WHERE id = ?;`;

      connection.query(deleteOrganisationQuery, [orgId], (err, result) => {
        if (err) {
          console.log("Error deleting organisation:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    })
  ])
    .then(() => {
      res.status(200).json({ message: 'Organisation deleted successfully.' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// gets organisations the user is apart of
router.get('/get_organisations', (req, res) => {
  let user_id = 0;

  // Check if user is logged in
  if (req.session.passport && req.session.passport.user) {
    user_id = req.session.passport.user.id;
  }

  const query = `
        SELECT o.name, o.id, o.description, o.image_path,
        CASE
            WHEN our.user_id IS NOT NULL THEN 1
            ELSE 0
        END AS is_member
        FROM organisations o
        LEFT JOIN organisation_user_relations our ON o.id = our.organisation_id AND our.user_id = ?
        `;

  connection.query(query, [user_id], (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    const organisations = {
      names: result.map(row => row.name),
      ids: result.map(row => row.id),
      description: result.map(row => row.description),
      image_path: result.map(row => row.image_path),
      is_member: result.map(row => row.is_member)
    };
    res.status(200).send(organisations);
  });
});

// for admin/organisation leader gets the memberships
router.get('/get_user_relations', (req, res) => {
  if (req.session.passport.user.isAdmin == 1) {
    const query = `
            SELECT o.name AS organisation_name, u.display_name AS user_display_name, o.id AS organisation_id, u.id AS user_id
            FROM organisation_user_relations our
            JOIN organisations o ON our.organisation_id = o.id
            JOIN users u ON our.user_id = u.id`;

    connection.query(query, (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }
      res.status(200).send(result);
    });
  } else if (req.session.passport.user.isLeader == 1) {
    const query = `
            SELECT o.name AS organisation_name, u.display_name AS user_display_name, o.id AS organisation_id, u.id AS user_id
            FROM users u
            JOIN organisation_user_relations our ON u.id = our.user_id
            JOIN organisations o ON our.organisation_id = o.id
            WHERE o.user_id = ?`;

    connection.query(query, [req.session.passport.user.id], (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }
      res.status(200).send(result);
    });
  } else {
    res.redirect('/dashboard');
  }
});

router.get('/check-membership/:userId/:orgId', (req, res) => {
  const { userId, orgId } = req.params;

  const membershipQuery = `SELECT * FROM organisation_user_relations WHERE user_id = ? AND organisation_id = ?`;
  connection.query(membershipQuery, [userId, orgId], (err, membershipResult) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.status(200).send(membershipResult);
  });
});

router.get('/toggle_membership/:userId/:orgId', (req, res) => {
  const { userId, orgId } = req.params;

  const checkLeaderQuery = `
  SELECT user_id AS leader_id FROM organisations WHERE id = ? AND user_id = ?
  `;

  connection.query(checkLeaderQuery, [orgId, userId], (leaderErr, leaderResult) => {
    if (leaderErr) {
      return res.status(500).send({ error: leaderErr.message });
    }

    if (leaderResult.length === 1) {
      return res.status(403).send({ error: 'User is the leader of the organization' });
    }

    const membershipQuery = `SELECT COUNT(*) AS count FROM organisation_user_relations WHERE user_id = ? AND organisation_id = ?`;
    connection.query(membershipQuery, [userId, orgId], (err, membershipResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const count = membershipResult[0].count;

      if (count === 0) {
        const insertQuery = `INSERT INTO organisation_user_relations (organisation_id, user_id, get_notifications) VALUES (?, ?, ?)`;
        connection.query(insertQuery, [orgId, userId, 1], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          return res.json({ message: 'User added to organization', status: 'joined' });
        });
      } else if (count === 1) {
        const user_id = req.params.userId;
        const organisation_id = req.params.orgId;

        const delete_posts_query = "DELETE FROM posts WHERE user_id = ? AND organisation_id = ?";
        const delete_events_rsvp_query = `
          DELETE FROM event_rsvp
          WHERE event_id IN (
            SELECT e.id
            FROM events e
            WHERE e.user_id = ? AND e.organisation_id = ?
          );`;
        const delete_events_query = "DELETE FROM events WHERE organisation_id = ? AND user_id = ?";
        const delete_organisation_user_relation_query = "DELETE FROM organisation_user_relations WHERE organisation_id = ? AND user_id = ?";

        connection.query(delete_posts_query, [user_id, organisation_id], (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          connection.query(delete_events_rsvp_query, [user_id, organisation_id], (err, result) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            connection.query(delete_events_query, [organisation_id, user_id], (err, result) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              connection.query(delete_organisation_user_relation_query, [organisation_id, user_id], (err, result) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                return res.json({ message: 'User removed from organization', status: 'left' });
              });
            });
          });
        });
      } else {
        res.status(500).json({ error: 'Unexpected count value' });
      }
    });
  });
});

router.get('/toggle_notifications/:userId/:orgId', (req, res) => {
  const { userId, orgId } = req.params;

  const membershipQuery = `SELECT * FROM organisation_user_relations WHERE user_id = ? AND organisation_id = ?`;
  connection.query(membershipQuery, [userId, orgId], (err, membershipResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const count = membershipResult.length;


    if (count === 0) {
      return res.status(500).json({ error: "User not in organisation" });
    } else if (count === 1) {
      const notificationQuery = 'UPDATE organisation_user_relations SET get_notifications = ? WHERE user_id = ? AND organisation_id = ?';
      var toggle_val;
      if (membershipResult[0].get_notifications == 1) {
        toggle_val = 0;
      } else {
        toggle_val = 1;
      }
      connection.query(notificationQuery, [toggle_val, userId, orgId], (err, membershipResult) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.json({ message: 'Notification toggled', status: toggle_val });
      });

    } else {
      res.status(500).json({ error: 'Unexpected count value' });
    }
  });
});

router.get('/remove_user_relation/:user_id/:organisation_id', (req, res) => {
  const user_id = req.params.user_id;
  const organisation_id = req.params.organisation_id;

  const checkLeaderQuery = `
        SELECT user_id AS leader_id FROM organisations WHERE id = ? AND user_id = ?
    `;

  connection.query(checkLeaderQuery, [organisation_id, user_id], (leaderErr, leaderResult) => {
    if (leaderErr) {
      return res.status(500).send({ error: leaderErr.message });
    }

    if (leaderResult.length === 1) {
      return res.status(403).send({ error: 'User is the leader of the organization' });
    }

    checkUserMembership(user_id, organisation_id)
      .then(isMember => {
        if (!isMember) {
          return res.status(403).send({ error: 'User is not a member of the organization' });
        }

        const deleteQuery = 'DELETE FROM organisation_user_relations WHERE user_id = ? AND organisation_id = ?';
        const deleteValues = [user_id, organisation_id];

        connection.query(deleteQuery, deleteValues, (deleteErr, deleteResult) => {
          if (deleteErr) {
            return res.status(500).send({ error: deleteErr.message });
          }
          res.status(200).send({ message: 'Relation removed.' });
        });
      })
      .catch(checkErr => {
        res.status(500).send({ error: checkErr.message });
      });
  });
});

router.get('/get_info/:id', function (req, res, next) {
  serveOrganisationPage(req.params.id, res);
});

router.post('/create_event/:id', isAuth, function (req, res, next) {
  const userId = req.session.passport.user.id;
  const orgId = req.params.id;

  checkUserMembership(userId, orgId)
    .then(isMember => {
      if (isMember) {
        const { title, message, deadline } = req.body;

        const query = "INSERT INTO events (title, content, user_id, deadline, organisation_id) VALUES (?, ?, ?, ?, ?)";
        const values = [title, message, userId, deadline, orgId];

        connection.query(query, values, (err, result) => {
          if (err) {
            return res.status(500).send({ error: err.message });
          }

          email("event", orgId, userId);
          return res.status(200).send({ message: "Post created successfully!" });
        });
      } else {
        res.status(404).send({ error: "You are not a member of this organisation." });
      }
    })
    .catch(err => {
      res.status(500).send({ error: err.message });
    });
});

router.post('/create_post/:id', isAuth, function (req, res, next) {
  const userId = req.session.passport.user.id;
  const orgId = req.params.id;

  checkUserMembership(userId, orgId)
    .then(isMember => {
      if (isMember) {
        const { title, message, public } = req.body;

        const query = "INSERT INTO posts (title, content, user_id, organisation_id, public) VALUES (?, ?, ?, ?, ?)";
        const values = [title, message, userId, orgId, public];

        connection.query(query, values, (err, result) => {
          if (err) {
            return res.status(500).send({ error: err.message });
          }

          email("post", orgId, userId);
          return res.status(200).send({ message: "Post created successfully!" });
        });
      } else {
        res.status(404).send({ error: "You are not a member of this organisation." });
      }
    })
    .catch(err => {
      res.status(500).send({ error: err.message });
    });
});

router.post('/delete_event/:id', isAuth, function (req, res, next) {
  const userId = req.session.passport.user.id;
  const eventId = req.params.id;

  const query = `
    SELECT COUNT(*) FROM events WHERE events.user_id = ? AND events.id = ?;`;
  const values = [userId, eventId];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }

    var found = result[0]['COUNT(*)'] ? true : false;

    if (!found) {
      return res.status(500).send({ err: "Event does not exist / belong to that user" });
    }

    const query2 = `
      DELETE
      FROM event_rsvp
      WHERE event_id = ?`;

    const values2 = [eventId];

    connection.query(query2, values2, (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }

      const query3 = `
        DELETE
        FROM events
        WHERE events.user_id = ? AND events.id = ?;`;

      const values3 = [userId, eventId];

      connection.query(query3, values3, (err, result) => {
        if (err) {
          return res.status(500).send({ err: err });
        }

        res.status(200).send({ message: 'Event and associated RSVP successfully deleted.' });
      });
    });
  });
});

router.post('/delete_post/:id', isAuth, function (req, res, next) {
  const userId = req.session.passport.user.id;
  const postId = req.params.id;

  const query = `
    DELETE
    FROM posts
    WHERE posts.user_id = ? AND posts.id = ?;`;

  const values = [userId, postId];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.status(200).send({ message: 'Post successfully deleted.' });
  });
});

router.get('/get_events/:id', function (req, res, next) {
  const orgId = req.params.id;
  getEvents(orgId, res);
});

router.get('/get_posts/:id', function (req, res, next) {
  const orgId = req.params.id;
  if (req.isAuthenticated()) {
    const userId = req.session.passport.user.id;
    checkUserMembership(userId, orgId)
      .then(isMember => {
        if (!isMember) {
          getPublicPosts(orgId, res);
        } else {
          const query =
            ` SELECT p.id, p.title, p.content, p.user_id, p.post_date, p.organisation_id, p.public, u.display_name
            FROM posts p
            JOIN users u
            WHERE p.user_id = u.id AND organisation_id = ?`;
          const values = [orgId];

          connection.query(query, values, (err, result) => {
            if (err) {
              return res.status(500).send({ error: err.message });
            }

            return res.status(200).send(result);
          });
        }
      })
      .catch(error => {
        res.status(500).send({ error: error });
      });
  } else {
    getPublicPosts(orgId, res);
  }

});

function getPublicPosts(organisation_id, res) {
  const query = `
  SELECT p.id, p.title, p.content, p.user_id, p.post_date, p.organisation_id, u.display_name
  FROM posts p
  JOIN users u
  WHERE p.user_id = u.id AND organisation_id = ? AND public = 1`;
  const values = [organisation_id];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    return res.status(200).send(result);
  });
}

router.get('/get_public_posts', function (req, res, next) {
  const query =
    `SELECT
        p.id,
        p.title,
        p.content,
        p.user_id,
        p.post_date,
        p.organisation_id,
        u.display_name
    FROM
        posts p
    JOIN
        users u ON p.user_id = u.id
    WHERE
        p.public = 1
    ORDER BY
        p.post_date DESC
    LIMIT 12;`;


  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    return res.status(200).send(result);
  });
});

router.get('/get_post_info/:organisation_id/:post_id', function (req, res, next) {
  const postId = req.params.post_id;
  getPostInfo(postId, res);
});

router.put('/edit_post_info/:post_id', isAuth, (req, res) => {
  const postId = parseInt(req.params.post_id);
  const { title, message } = req.body;

  const query = 'SELECT user_id FROM posts WHERE id = ?';
  const values = [postId];

  var ownerId;

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }

    ownerId = result[0].user_id;

    if (req.session.passport.user.id !== ownerId) {
      return res.status(403).send({ error: 'Unauthorized access.' });
    }

    const query2 = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    const values2 = [title, message, postId];

    connection.query(query2, values2, (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }
      res.status(200).send({ message: 'Post information updated successfully.' });
    });
  });
});

router.put('/edit_event_info/:event_id', isAuth, (req, res) => {
  const eventId = parseInt(req.params.event_id);
  const { title, message, deadline } = req.body;

  const query = 'SELECT user_id FROM events WHERE id = ?';
  const values = [eventId];

  var ownerId;

  connection.query(query, values, (err, result) => {

    if (err) {
      return res.status(500).send({ err: err });
    }


    ownerId = result[0].user_id;

    if (req.session.passport.user.id !== ownerId) {
      return res.status(403).send({ error: 'Unauthorized access.' });
    }

    const query2 = 'UPDATE events SET title = ?, content = ?, deadline = ? WHERE id = ?';
    const values2 = [title, message, deadline, eventId];

    connection.query(query2, values2, (err, result) => {
      if (err) {
        return res.status(500).send({ err: err });
      }
      res.status(200).send({ message: 'Event information updated successfully.' });
    });
  });
});

router.get('/get_organisation_leaders', isAuth, isAdmin, function (req, res, next) {
  const query = `
      SELECT
          u.display_name AS leader_display_name,
          u.id AS leader_id,
          o.id AS organisation_id,
          o.name AS organisation_name
      FROM
          organisations o
      JOIN
          users u ON u.id = o.user_id
    `;

  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).send({ error: err });
    }
    res.status(200).send(result);
  });
});

router.post('/change_leader/:organisation_id', isAuth, isAdmin, function (req, res, next) {
  const organisationId = req.params.organisation_id;
  const { newLeaderId } = req.body;

  const getCurrentLeaderQuery = `
        SELECT user_id FROM organisations WHERE id = ?
    `;

  connection.query(getCurrentLeaderQuery, [organisationId], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err });
    }

    const oldLeaderId = parseInt(result[0].user_id);
    if (oldLeaderId === parseInt(newLeaderId)) {
      return res.status(400).send({ error: 'New leader cannot be the same as the old leader' });
    }

    checkUserMembership(newLeaderId, organisationId)
      .then(isMember => {
        if (!isMember) {
          return res.status(400).send({ error: 'New leader is not a member of the organization' });
        }

        const updateLeaderQuery = `
                    UPDATE organisations
                    SET user_id = ?
                    WHERE id = ?
                `;

        connection.query(updateLeaderQuery, [newLeaderId, organisationId], (updateErr, updateResult) => {
          if (updateErr) {
            return res.status(500).send({ error: updateErr });
          }

          res.status(200).send({ message: 'Leader changed successfully!' });
        });
      })
      .catch(error => {
        res.status(500).send({ error: error });
      });
  });
});

router.get('/see_rsvp_members/:event_id', function (req, res, next) {
  const userId = req.session.passport.user.id;
  const eventId = req.params.event_id;

  const queryEventOwner = `SELECT * FROM events WHERE id = ? and user_id = ?`;

  connection.query(queryEventOwner, [eventId, userId], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err });
    }

    if (result.length == 1) {
      const queryRSVP = `SELECT u.display_name, u.id
      FROM event_rsvp e
      JOIN users u ON u.id = e.user_id
      WHERE e.event_id = ?`;

      connection.query(queryRSVP, [eventId], (err, result) => {
        if (err) {
          return res.status(500).send({ error: err });
        }


        res.status(200).send(result);

      });
    }
  });
});

router.get('/rsvp/:event_id', function (req, res, next) {
  const userId = req.session.passport.user.id;
  const eventId = req.params.event_id;

  const queryOrgId = `SELECT organisation_id FROM events WHERE id = ?`;

  connection.query(queryOrgId, [eventId], (err, orgResult) => {
    if (err) {
      return res.status(500).send({ error: err });
    }

    if (orgResult.length === 0) {
      return res.status(404).send({ error: "Event not found." });
    }

    const orgId = orgResult[0].organisation_id;

    checkUserMembership(userId, orgId)
      .then(isMember => {
        if (!isMember) {
          return res.status(404).send({ error: "You are not a member of this organisation." });
        }


        const queryRsvp = `SELECT * FROM event_rsvp WHERE user_id = ? AND event_id = ?`;
        connection.query(queryRsvp, [userId, eventId], (err, rsvpResult) => {
          if (err) {
            return res.status(500).send({ error: err });
          }

          if (rsvpResult.length === 1) {
            const deleteQuery = `DELETE FROM event_rsvp WHERE user_id = ? AND event_id = ?`;
            connection.query(deleteQuery, [userId, eventId], (err, deleteResult) => {
              if (err) {
                return res.status(500).send({ error: err });
              }
              res.status(200).send({ message: "RSVP deleted successfully." });
            });
          } else {
            const insertQuery = `INSERT INTO event_rsvp (user_id, event_id) VALUES (?, ?)`;
            connection.query(insertQuery, [userId, eventId], (err, insertResult) => {
              if (err) {
                return res.status(500).send({ error: err });
              }
              res.status(200).send({ message: "RSVP added successfully." });
            });
          }
        });
      })
      .catch(err => {
        res.status(500).send({ error: err.message });
      });
  });
});

router.get('/check_rsvp/:post_id', function (req, res, next) {
  const userId = req.session.passport.user.id;
  const postId = req.params.post_id;

  const queryOrgId = `SELECT organisation_id FROM events WHERE id = ?`;

  connection.query(queryOrgId, [postId], (err, orgResult) => {
    if (err) {
      return res.status(500).send({ error: err });
    }

    if (orgResult.length === 0) {
      return res.status(404).send({ error: "Event not found." });
    }

    const orgId = orgResult[0].organisation_id;

    checkUserMembership(userId, orgId)
      .then(isMember => {
        if (!isMember) {
          return res.status(404).send({ error: "You are not a member of this organisation." });
        }

        const queryRsvpCount = `SELECT COUNT(*) AS rsvp_count FROM event_rsvp WHERE user_id = ? AND event_id = ?`;

        connection.query(queryRsvpCount, [userId, postId], (err, rsvpResult) => {
          if (err) {
            return res.status(500).send({ error: err });
          }

          const rsvpCount = rsvpResult[0].rsvp_count;
          res.status(200).send({ rsvp_count: rsvpCount });
        });
      })
      .catch(err => {
        res.status(500).send({ error: err.message });
      });
  });
});

function getEvents(organisation_id, res) {
  const query = `
  SELECT e.id, e.title, e.content, e.user_id, e.deadline, e.organisation_id, u.display_name
  FROM events e
  JOIN users u
  WHERE e.user_id = u.id AND organisation_id = ?`;
  const values = [organisation_id];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    return res.status(200).send(result);
  });
}

function getPostInfo(post_id, res) {
  const query = "SELECT * FROM events WHERE id = ?";
  const values = [post_id];

  connection.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    return res.status(200).send(result);
  });
}

function serveOrganisationPage(organisation_id, res) {
  const query = 'SELECT description AS org_description, id AS org_id, name AS org_name, user_id AS leader_user_id, image_path AS image_path FROM organisations WHERE id = ?';
  connection.query(query, [organisation_id], (err, result) => {
    if (err) {
      return res.status(500).send({ err: err });
    }
    res.status(200).send(result[0]);
  });
}

function checkUserMembership(userId, orgId) {
  return new Promise((resolve, reject) => {
    const membershipQuery = `SELECT COUNT(*) AS count FROM organisation_user_relations WHERE user_id = ? AND organisation_id = ?`;
    connection.query(membershipQuery, [userId, orgId], (err, membershipResult) => {
      if (err) {
        reject(err);
      } else {
        resolve(membershipResult.length > 0 && membershipResult[0].count === 1);
      }
    });
  });
}

// STUFF FOR NODE MAILER

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'group82wdcproject@gmail.com',
    pass: 'dlkgwgsrahsyrikb',
  },
});

function email(type, orgId, userId) {
  var mailOptions = {
    from: 'group82wdcproject@gmail.com',
    to: '',
    subject: '',
    text: '',
    html: ''
  };

  if (type == "event") {
    mailOptions.subject = "New Event";
  } else if (type == "post") {
    mailOptions.subject = "New Post";
  }

  const displayNameQuery = `SELECT display_name FROM users WHERE id = ?`;

  connection.query(displayNameQuery, [userId], (err, displayNameResult) => {
    if (err) {
      console.error('Error fetching user:', err);
      return;
    }

    if (displayNameResult.length != 1) {
      console.error('Error fetching user:', err);
      return;
    }

    var user_display_name = displayNameResult[0].display_name;

    mailOptions.html =
      `<p>${user_display_name} has posted</p>
    <a href="http://localhost:8080/organisation/homepage/${orgId}">See Here</a>`;

    const memberQuery = `
    SELECT u.email
    FROM organisation_user_relations our
    JOIN users u
    ON u.id = our.user_id
    WHERE our.organisation_id = ? AND our.get_notifications = 1`;

    connection.query(memberQuery, [orgId], (err, memberResults) => {
      if (err) {
        console.error('Error fetching member emails:', err);
        return;
      }

      const emailAddresses = memberResults.map(member => member.email).join(',');
      mailOptions.to = emailAddresses;

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  });
}


module.exports = router;