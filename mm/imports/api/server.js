import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
 
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
      game: [{
        currentGame: true,
        players: {
          master: Meteor.userId(),
          mind: userID,
          turn: Meteor.userId()
        },
        set: [],
        rows: []
      }]
    });
  },
  'rooms.addTry'(roomID, attempt) {
    Rooms.update({_id: roomID, "game.currentGame": true}, 
      {$push: {
        "game.$.rows": { try: attempt }
      }
    })
  },
  'rooms.addReview'(roomID, attempt, modifier) {
    Rooms.upsert({_id: roomID, "game.currentGame": true}, modifier)
  },
  'rooms.addSet'(roomID, attempt) {
    Rooms.update({_id: roomID, "game.currentGame": true}, 
      {$set: {
        "game.$.set": attempt
      }
    })
  },
  'rooms.updateTurn'(roomID, userID) {
    Rooms.update({_id: roomID, "game.currentGame": true}, 
      {$set: {
        "game.$.players.turn": userID
      }
    })
  },
  'rooms.removeCurrentGame'(roomID) {
    Rooms.update({_id: roomID, "game.currentGame": true}, 
      {$set: {
        "game.$.currentGame": false
      }
    })
  },
  'rooms.addGame'(roomID, userID) {
    Rooms.update({_id: roomID}, 
      {$push: {
        "game": {
          currentGame: true,
          players: {
            master: Meteor.userId(),
            mind: userID,
            turn: Meteor.userId()
          },
          set: [],
          rows: []
        }

      }
    })
  },
  'rooms.removeRoom'(roomID) {
    Rooms.remove({_id: roomID});
  },
  'rooms.remove'() {
    Rooms.remove({});
  }
});