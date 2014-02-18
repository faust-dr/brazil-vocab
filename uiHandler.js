UiHandler = {
	init: function() {
		return this;
	},

	setupLessonCheckboxes: function(lessons) {
		$(".lessons").text('');
		_.each(lessons, function(lesson) {
			$(".lessons").append('<div class="lesson"><input type="checkbox" name="' + lesson + '" checked="true">' + lesson + '</div>');
		});
	},

	setKeyboardFocus: function() {
		$("input.answer").focus();
	},

	clearInput: function() {
		$("input.answer").val("");
	},

	registerTypeEvent: function(callback) {
		this.evaluateCallback = callback;
		$("input.answer").keyup(_.bind(this.sendAnswer, this));
	},

	registerEnterEvent: function(callback) {
		this.sendEnterCallback = callback;
		$("input.answer").keyup(_.bind(function(e) {
			if(e.keyCode === 13) {
				this.sendEnter();
			}
		}, this));
	},

	registerCheckboxEvent: function(callback) {
		this.checkboxCallback = callback;
		$("input[type=checkbox]").click(_.bind(this.checkboxClicked, this));
	},

	registerSkipEvent: function(callback) {
		this.skipCallback = callback;
		$("input.skip").click(_.bind(this.sendSkip, this));
	},

	sendAnswer: function() {
		if(!this.evaluateCallback) {
			throw("No type callback method set from UiHandler to Brazilmemo.");
		}
		this.evaluateCallback($("input.answer").val());
	},

	sendEnter: function() {
		if(!this.sendEnterCallback) {
			throw("No enter callback method set from UiHandler to Brazilmemo.");
		}
		this.sendEnterCallback();
	},
	
	sendSkip: function() {
		if(!this.skipCallback) {
			throw("No skip callback method set from UiHandler to Brazilmemo.");
		}
		this.skipCallback();
	},

	checkboxClicked: function() {
		if(!this.checkboxCallback) {
			throw("No clicking checkbox callback method set from UiHandler to Brazilmemo.");
		}

		var lessons = {};
		_.each($("input[type=checkbox]"), function(checkbox) {
			lessons[checkbox.name] = checkbox.checked;
		});

		this.checkboxCallback(lessons);
	},

	setQuery: function(query) {
		$(".port").text(query);
	},

	setInstructions: function(instructions) {
		$(".instruction").text(instructions);
	},

	showHint: function(hint) {
		$(".hint").text(hint);
	},

	showPronunciation: function(pronunciation) {
		$(".pronunciation").text(pronunciation);
		$(".pronunciation-container").show();
	},

	showExplanation: function(explanation) {
		$(".explanation").text(explanation);
		$(".explanation").show();
	},

	showAlternateMeanings: function(meanings) {
		$(".alternate-meanings").text(meanings);
		$(".alternate-meanings").show();
	},

	showCongrats: function(congrats) {
		$(".congrats").text(congrats);
		$(".congrats").show();
	},

	clearHint: function() {
		$(".hint").text('');
	},

	hidePronunciation: function() {
		$(".pronunciation-container").hide();
	},

	hideExplanation: function() {
		$(".explanation").hide();
	},

	hideCongrats: function() {
		$(".congrats").hide();
	},

	hideAlternateMeanings: function() {
		$(".alternate-meanings").hide();
	},

	typeInAnswerForUser: function(answer) {
		$("input.answer").val(answer);
		this.setKeyboardFocus();
	}
};
