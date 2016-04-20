import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Rooms } from '../api/server.js';

import './user.js'; 
import './room.js'; 
import './body.html';
import './game/game.js';
import './game/nogame.html';
import './game/master-helper.html';
import './game/mind-helper.html';
import './router.js';
import './login.js';
import './register.js';
import './game/highscore.js';

// When main template is created
Template.main.onCreated(function bodyOnCreated() {
  Meteor.subscribe('users');
  Meteor.subscribe('rooms');
});

// Helper function available for every template
Template.registerHelper('ifGameFinished', function() {
  var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
  if (currentRoom.game[currentRoom.game.length - 1].currentGame === false) {
    return true;
  } else {
    return false
  };
});

Template.registerHelper('ifActive2', function(value) {
  var current = Router.current().route.path();
  return current === value;
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
    var current = Router.current().route.path();
    return current === value;
  }
});

Template.main.events({
  'click .user'(event) {
    Session.set('foundUser', null);
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
  'click .remove-room'(event) {
    Meteor.call('rooms.removeRoom', this._id);
    Router.go('/');
  },
  'click .logout'(event) {
    event.preventDefault();
    Meteor.logout();
  },
  'click .help'(event) {
    var helpModal = document.querySelectorAll('.help-modal')[0];
    helpModal.className = 'help-modal help-modal-active';

    var overlay = document.querySelectorAll('.overlay')[0];
    overlay.className = 'overlay-active';
  },
  'click .close-help'(event) {
    var helpModal = document.querySelectorAll('.help-modal')[0];
    helpModal.className = 'help-modal';

    var overlay = document.querySelectorAll('.overlay-active')[0];
    overlay.className = 'overlay';
  }
});