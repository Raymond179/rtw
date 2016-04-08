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
  'rooms.insert'(userID) {
    Rooms.insert({
      users: [userID, Meteor.userId()],
      createdAt: new Date(),
      game: { 
        players: {
          master: Meteor.userId(),
          mind: userID
        },
        set: ['red', 'blue', 'green', 'yellow'],
        rows: [
          {
            try: ['blue', 'yellow', 'green', 'blue'],
            review: ['white']
          },
          {
            try: ['green', 'blue', 'green', 'yellow'],
            review: ['black']
          }
        ]
      }
    });
  },
  'rooms.remove'() {
    Rooms.remove({});
  }
});