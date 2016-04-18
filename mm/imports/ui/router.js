import { Session } from 'meteor/session';

Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
	template: 'nogame',
	data: function() {
		Session.set('roomID', null);
	}
});

Router.route('/login', {
	template: 'login'
});

Router.route('/register', {
	template: 'register'
});

Router.route('/game/:_id', {
	template: 'game',
    data: function(){
        Session.set('roomID', this.params._id);
    }
});