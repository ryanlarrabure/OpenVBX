require('../../assets/j/upgrade.js');

describe("upgrade page", function() {
	var jQuery_mock;
	var setTimeout_mock;
	
	beforeEach(function(){
		jQuery_mock = jasmine.createSpy('jQuery');
		setTimeout_mock = jasmine.createSpy('setTimeout');
	});
	
	it("should be defined", function() {
		expect(upgrade_handler).toBeDefined();
	});
	
	it("will act on the '#upgrade-steps' DOM object", function() {
		jQuery_mock.andReturn({
			'Steps' : function() {},
			'text' : function() {}
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		expect(jQuery_mock.argsForCall[0][0]).toEqual("#upgrade-steps");
	});
	
	it("will call the Steps method", function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {}
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		expect(
			steps_mock
		).toHaveBeenCalled();
	});
	
	it("will call Steps with an object with validateCallback objects",
		function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {}
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		var first_args = steps_mock.mostRecentCall.args[0];
		expect(first_args['validateCallbacks']).toBeDefined();
		['prev',
		 'next',
		 'submit'].forEach(function(member) {
			expect(first_args['validateCallbacks'][member]).toBeDefined(); 
		 });
	});
	it("will call Steps with a stepLoadCallback",
		function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {}
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		var first_args = steps_mock.mostRecentCall.args[0];
		expect(first_args['stepLoadCallback']).toBeDefined();
	});
	
	it("will check for an error", function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {}
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		expect(jQuery_mock.mostRecentCall.args[0]).toEqual(".error");
	});
	
	it("will handle errors correctly", function() {
		var steps_mock = jasmine.createSpy('steps');
		steps_mock.toggleError = jasmine.createSpy('toggleError');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() { return "Error"; }
		});
		upgrade_handler({'$' : jQuery_mock, 'setTimeout' : setTimeout_mock})();
		expect(typeof(setTimeout_mock.mostRecentCall.args[0])).toEqual(
			"function"
		);
		expect(setTimeout_mock.mostRecentCall.args[1]).toEqual(1000);
		setTimeout_mock.mostRecentCall.args[0]();
		expect(jQuery_mock.mostRecentCall.args[0]).toEqual('#upgrade-steps');
		expect(steps_mock.toggleError.mostRecentCall.args[0]).toEqual(true);
	});
	
	it("will handle ajax errors correctly", function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.ajax = jasmine.createSpy('ajax');
		jQuery_mock.ajax.andCallFake(function (args) {
			args['error'] ({}, "error text", "HTTP Error");
		});
		var triggerError_mock = jasmine.createSpy('triggerError');
		steps_mock.setButtonLoading = jasmine.createSpy('setButtonLoading');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {},
			'triggerError' : triggerError_mock
		});
		upgrade_handler({
			'$' : jQuery_mock, 
			'setTimeout' : setTimeout_mock,
			'OpenVBX' : {
				'home' : "somewhere"
			}
		})();
		var first_args = steps_mock.mostRecentCall.args[0];
		var validateCallbacks = first_args['validateCallbacks'];
		var res = validateCallbacks['submit'](1, 2);
		expect(
			typeof(triggerError_mock.mostRecentCall.args[0])
		).toEqual("string");
	});
	it("will handle success handler errors correctly", function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.ajax = jasmine.createSpy('ajax');
		jQuery_mock.ajax.andCallFake(function (args) {
			args['success'] ({
				'success' : false,
				'message' : "Error"
			});
		});
		var triggerError_mock = jasmine.createSpy('triggerError');
		steps_mock.setButtonLoading = jasmine.createSpy('setButtonLoading');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {},
			'triggerError' : triggerError_mock
		});
		upgrade_handler({
			'$' : jQuery_mock, 
			'setTimeout' : setTimeout_mock,
			'OpenVBX' : {
				'home' : "somewhere"
			}
		})();
		var first_args = steps_mock.mostRecentCall.args[0];
		var validateCallbacks = first_args['validateCallbacks'];
		var res = validateCallbacks['submit'](1, 2);
		expect(triggerError_mock.mostRecentCall.args[0]).toEqual("Error");
	});
	it("will ask for the right url", function() {
		var steps_mock = jasmine.createSpy('steps');
		jQuery_mock.ajax = jasmine.createSpy('ajax');
		steps_mock.setButtonLoading = jasmine.createSpy('setButtonLoading');
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {},
			'triggerError' : function () {}
		});
		upgrade_handler({
			'$' : jQuery_mock, 
			'setTimeout' : setTimeout_mock,
			'OpenVBX' : {
				'home' : "somewhere"
			}
		})();
		var first_args = steps_mock.mostRecentCall.args[0];
		var validateCallbacks = first_args['validateCallbacks'];
		var res = validateCallbacks['submit'](1, 2);
		expect(jQuery_mock.ajax.mostRecentCall.args[0]['url']).toEqual(
			"somewhere/upgrade/setup"
		);
		expect(jQuery_mock.ajax.mostRecentCall.args[0]['type']).toEqual(
			"post"
		);
	});
	
	it("will correctly set the loading state of the submit button", function() {
		var steps_mock = jasmine.createSpy('steps');
		var button_states = [];
		steps_mock.setButtonLoading = jasmine.createSpy('setButtonLoading');
		steps_mock.setButtonLoading.andCallFake(function(target, bool) {
			button_states.push({
				'target' : target,
				'bool' : bool
			});
		});
		jQuery_mock.ajax = function () {};
		jQuery_mock.andReturn({
			'Steps' : steps_mock,
			'text' : function() {},
			'triggerError' : function () {}
		});
		upgrade_handler({
			'$' : jQuery_mock, 
			'setTimeout' : setTimeout_mock,
			'OpenVBX' : {
				'home' : "somewhere"
			}
		})();
		var first_args = steps_mock.mostRecentCall.args[0];
		var validateCallbacks = first_args['validateCallbacks'];
		var res = validateCallbacks['submit'](1, 2);
		[{'target':'submit', 'bool': true},
		 {'target':'submit', 'bool': false}].forEach(function(exp, index) {
			 expect(button_states[index]['target']).toEqual(
					 exp['target']
			);
			expect(button_states[index]['bool']).toEqual(
					 exp['bool']
			);
		 });
	});
});