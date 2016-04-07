import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
export const Tasks = new Mongo.Collection('tasks');
export const Rooms = new Mongo.Collection('rooms');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('users', function tasksPublication() {
    return Meteor.users.find();
  });

  Meteor.publish('rooms', function tasksPublication() {
    return Rooms.find();
  });
}

Meteor.methods({
  'rooms.insert'(userID, username) {
    Rooms.insert({
      users: [userID, Meteor.userId()],
      createdAt: new Date(),
      opponent: username,
      rows: [
        {
          try: 'YELLOW',
          review: 'white'
        },
        {
          try: 'blue',
          review: 'black'
        }
      ]
    });
  },
  'rooms.remove'() {
    Rooms.remove({});
  }
});