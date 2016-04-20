import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { Rooms } from '../../api/server.js';

import './highscore.html';

Template.highscore.helpers({
	'highscore': function() {
		var roomID = Session.get('highscoreRoom');
		if (!roomID) {
			return false;
		}
		var room = Rooms.findOne({_id: roomID});

		var opponentGames = 0;
		var youGames = 0;
		var opponentTries = 0;
		var youTries = 0;

		for (var i = 0; i < room.game.length; i++) {
			var game = room.game[i];
			if (game.currentGame === false) {
				if (game.players.mind === Meteor.userId()) {
					youGames++;
					youTries += game.rows.length;
				} else if (game.players.mind != Meteor.userId()) {
					opponentGames++;
					opponentTries += game.rows.length;
				}
			}
		}

		var opponentId = Template.room.__helpers.get('getOpponentId')(roomID);
		var user = Meteor.users.findOne({_id: opponentId});
		var username = user.username;

		var highscore = {
			opponentTries: opponentTries,
			opponentGames: opponentGames,
			youTries: youTries,
			youGames: youGames,
			opponent: username
		}
		return highscore;
	},
	rooms() {
		var opponents = Template.room.__helpers.get('getOpponent')(Meteor.userId());
		return opponents;
	}
});

Template.highscore.events({
	'click .highscore-user'(event) {
		Session.set('highscoreRoom', this._id);
		var highscoreUsers = document.querySelectorAll('.highscore-user');
		for (var i = 0; i < highscoreUsers.length; i++) {
			highscoreUsers[i].className = 'highscore-user';
		};
		event.currentTarget.className = 'highscore-user highscore-user-active';
	}
});