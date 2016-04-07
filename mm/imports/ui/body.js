import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import { Rooms } from '../api/tasks.js';

import './user.js'; 
import './room.js'; 
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('users');
  Meteor.subscribe('rooms');
});

 
Template.body.helpers({
  users() {
    return Meteor.users.find({_id:{$ne: Meteor.userId()}});
  },
  rooms() {
    var opponents = Template.room.__helpers.get('getOpponent')(Meteor.userId());
    return opponents;
  },
  rows() {
    if (Session.get('roomID') != null) {
      var currentRoom = Rooms.findOne({_id: Session.get('roomID')});
      return currentRoom.rows;
    }
  }
});

Template.body.events({
  'click .user'(event) {
    var res = Rooms.findOne({users: {$all: [this._id, Meteor.userId()]}})
    if (res) {
      Session.set('roomID', res._id);
    } else {
      var newRoom = Meteor.call('rooms.insert', this._id, this.username);
      Session.set('roomID', newRoom);
    }
  },
  'click .room'(event) {
    Session.set('roomID', this._id);
  }
});