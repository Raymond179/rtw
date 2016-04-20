import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
 
import { Rooms } from '../../api/server.js';
 
import './game.html';

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

Template.game.events({
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
        alert('You need to fill in all pins')
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
      // Set current game to false
      Meteor.call('rooms.removeCurrentGame', Session.get('roomID'));
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
  },
  'click .ok-mind'(event) {
    // Define opponent
    var opponent = Template.room.__helpers.get('getOpponentId')(Session.get('roomID'));
    // Add new game
    Meteor.call('rooms.addGame', Session.get('roomID'), opponent);
  },
  'click .ok-master'(event) {
    var message = document.querySelectorAll('.message')[0];
    message.remove();

    var overlay = document.querySelectorAll('.overlay-active')[0];
    overlay.className = 'overlay';
  },
});