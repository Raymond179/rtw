import { Template } from 'meteor/templating';

import './register.html';

Template.register.events({
	'submit form'(event, template) {
		event.preventDefault();

		var username = template.find('#username').value;
		var password = template.find('#password').value;
		Accounts.createUser({
			username: username,
			password: password
		});

		Router.go('/');
	}
})