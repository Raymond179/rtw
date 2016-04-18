import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import { Rooms } from '../api/tasks.js';

import './user.js'; 
import './room.js'; 
import './body.html';
import './game/game.html';
import './game/nogame.html';
import './game/master-helper.html';
import './game/mind-helper.html';
import './router.js';
import './login.js';
import './register.js';

Template.main.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('users');
  Meteor.subscribe('rooms');
});

Template.main.helpers({
  users() {
    var user = Session.get('foundUser');
    return Meteor.users.find({username: user});
  },
  rooms() {
    console.log(Rooms.find({}).fetch())
    var opponents = Template.room.__helpers.get('getOpponent')(Meteor.userId());
    return opponents;
  },
  'getCurrentUser': function() {
    return Meteor.user().username;
  },
  'lrActive': function(value) {
    var url = window.location.href;
    var current = Router.current().route.path();
    return current === value;
  }
});

Template.game.helpers({
  rows() {
    if (Session.get('roomID') != null) {
      // Find the room with the current roomID
      var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
      return currentRoom.game[currentRoom.game.length - 1].rows;
    }
  },
  set() {
    if (Session.get('roomID') != null) {
      var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
      // Return the set
      return currentRoom.game[currentRoom.game.length - 1].set;
    }
  },
  'ifMaster': function() {
    if (Session.get('roomID') != null) {
      var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
      // If current user is the master
      if (currentRoom.game[currentRoom.game.length - 1].players.master == Meteor.userId()) {
        return true;
      }
    }
  },
  'ifTurn': function() {
    if (Session.get('roomID') != null) {
      var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
      if (currentRoom.game[currentRoom.game.length - 1].players.turn == Meteor.userId()) {
        return true;
      }
    }
  },
  'returnOpponent': function() {
    var opponent = Template.room.__helpers.get('getOpponentId')(Session.get('roomID'));
    var user = Meteor.users.findOne({_id: opponent});
    return user.username;
  }
});

Template.main.events({
  'click .user'(event) {
    Session.set('foundUser', null);
    // Meteor.call('rooms.remove')
    var res = Rooms.findOne({users: {$all: [this._id, Meteor.userId()]}})
    if (res) {
      Router.go('/game/'+res._id);
    } else {
      Meteor.call('rooms.insert', this._id);
      var newRoom = Rooms.findOne({users: {$all: [this._id, Meteor.userId()]}})
      Router.go('/game/' + newRoom._id);
    }
  },
  'click .room'(event) {
    Session.set('roomID', this._id);
  },
  'click .select'(event) {
    var color = event.currentTarget.getAttribute('color');
    var selected = document.querySelectorAll('.selected')[0];
    selected.className = 'selected '+ color;
  },
  'click .hamburger'(event) {
    var menu = document.getElementsByTagName('aside')[0];
    var overlay = document.querySelector('.overlay');

    menu.className = 'menu-open';
    overlay.className = 'overlay-active';
  },
  'click .overlay-active'(event) {
    var menu = document.getElementsByTagName('aside')[0];
    var overlay = document.querySelector('.overlay-active');

    menu.className = '';
    overlay.className = 'overlay';
  },
  'submit .submit-users'(event) {
    // Prevent default browser form submit
    event.preventDefault();
    var user = event.target.text.value;
 
    Session.set('foundUser', user);
  },
  'click .cross'(event) {
    Meteor.call('rooms.removeRoom', this._id);
    Router.go('/');
  },
  'click .logout': function(event) {
    event.preventDefault();
    Meteor.logout();
  }
});

Template.main.events({
  'click .empty-pin'(event) {
    var selected = document.querySelectorAll('.selected')[0];
    var classes = selected.className;
    var color = classes.replace('selected ', '');

    event.currentTarget.className = 'pin empty-pin '+ color;
  },
  'click .empty-dot'(event) {
    var selected = document.querySelectorAll('.selected')[0];
    var classes = selected.className;
    var color = classes.replace('selected ', '');

    event.currentTarget.className = 'dot empty-dot '+ color;
  },
  'click .submit-mind'(event) {
    var attempt = [];
    var colors = document.querySelectorAll('.empty-pin');
    for (var i = 0; i < colors.length; i++) {
      var classes = colors[i].className;
      var color = classes.replace('pin empty-pin ', '');
      // Check if all pins are filled in
      if (color === 'pin empty-pin') {
        alert('fill in all pins')
        return false;
      }
      attempt.push(color)
    }
    Meteor.call('rooms.addTry', Session.get('roomID'), attempt);
    // Clear pins
    for (var i = 0; i < colors.length; i++) {
      colors[i].className = 'pin empty-pin';
    }
    // Pass turn to other player
    var opponent = Template.room.__helpers.get('getOpponentId')(Session.get('roomID'));
    Meteor.call('rooms.updateTurn', Session.get('roomID'), opponent);
  },
  'click .submit-master'(event) {
    var attempt = [];
    var colors = document.querySelectorAll('.empty-dot');
    for (var i = 0; i < colors.length; i++) {
      var classes = colors[i].className;
      var color = classes.replace('dot empty-dot ', '');
      attempt.push(color)
    }
    // Count how many rows there are
    var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
    var number = currentRoom.game[currentRoom.game.length - 1].rows.length - 1;
    // Set the review in the right row
    var setModifier = { $set: {} };
    setModifier.$set['game.$.rows.'+number+'.review'] = attempt;

    Meteor.call('rooms.addReview', Session.get('roomID'), attempt, setModifier);
    // Check if the mind has it right
    var checkResult = function() {
        for (var i = 0; i < attempt.length; i++)
            if (attempt[i] != 'white') {
                return false;
            }
        return true;
    };
    // Define opponent
    var opponent = Template.room.__helpers.get('getOpponentId')(Session.get('roomID'));
    // Check if the combination is right
    if (checkResult() === true) {
      // alert('Great! The code has been cracked');
      Meteor.call('rooms.removeCurrentGame', Session.get('roomID'));
      Meteor.call('rooms.addGame', Session.get('roomID'), opponent);
      console.log(Rooms.find({}).fetch())
    }
    // Pass turn to other player
    Meteor.call('rooms.updateTurn', Session.get('roomID'), opponent);
  },
  'click .submit-set'(event) {
    var attempt = [];
    var colors = document.querySelectorAll('.empty-pin');
    for (var i = 0; i < colors.length; i++) {
      var classes = colors[i].className;
      var color = classes.replace('pin empty-pin ', '');
      attempt.push(color)
    }
    Meteor.call('rooms.addSet', Session.get('roomID'), attempt);
    // Pass turn to other player
    var opponent = Template.room.__helpers.get('getOpponentId')(Session.get('roomID'));
    Meteor.call('rooms.updateTurn', Session.get('roomID'), opponent);
  }
});