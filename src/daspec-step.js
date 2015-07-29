/*global module, require*/
module.exports = function (regexMatcher, processFunction) {
	'use strict';
	var self = this,
		Assertion = require('./assertion');

	self.match = function (stepText) {
		return regexMatcher.test(stepText);
	};
	self.execute = function (stepText, attachment) {
		var match = stepText.match(regexMatcher),
			stepArgs = match.slice(1),
			result = {
				matcher: regexMatcher,
				stepText: stepText,
				attachment: attachment,
				assertions: []
			},
			StepContext = function () {
				var self = this,
					ListUtil = require('./list-util'),
					listUtil = new ListUtil();
				self.assertEquals = function (expected, actual, optionalOutputIndex) {
					var	passed = expected == actual;
					result.assertions.push(new Assertion(expected,
						actual,
						passed, optionalOutputIndex));
				};
				self.assertSetEquals = function (expected, actual, optionalOutputIndex) {
					var listResult = listUtil.unorderedMatch(expected, actual);
					result.assertions.push(new Assertion(expected,
						listResult,
						listResult.matches, optionalOutputIndex));
				};
			};

		if (attachment) { /* we know it's a list and the symbol */
			stepArgs.push(attachment);
		}

		try {
			processFunction.apply(new StepContext(), stepArgs);
		} catch (e) {
			/* geniuine error, not assertion fail */
			result.exception = e;
		}


		return result;
	};
};
