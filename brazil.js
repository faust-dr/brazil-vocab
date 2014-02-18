Brazilmemo = {
	init: function(uiHandler) {
		this.currentQuery = undefined;

		uiHandler.hideCongrats();
		uiHandler.hidePronunciation();
		uiHandler.hideExplanation();
		uiHandler.hideAlternateMeanings();

		uiHandler.setKeyboardFocus();
		uiHandler.registerTypeEvent(_.bind(this.evaluateCallback, this));
		uiHandler.registerEnterEvent(_.bind(this.sendEnterCallback, this));
		uiHandler.registerSkipEvent(_.bind(this.skipCallback, this));

		this.uiHandler = uiHandler;

		return this;
	},
	
	evaluateCallback: function(answer) {
		this.answer(answer);
	},

	sendEnterCallback: function() {
		this.finishQuery();
	},

	skipCallback: function() {
		this.uiHandler.showPronunciation(this.currentQuery.pronunciation);
		this.uiHandler.typeInAnswerForUser(this.correctAnswer());
	},

	clickCheckboxCallback: function(selectedLessons) {
		this.filterLessons(everyLesson, selectedLessons);
	},

	filterLessons: function(all, selected) {
		var lessonsToLoad =	_.select(all, function(lesson) {
			return _.find(all, function(l) {
				return selected[lesson.name];
			});
		});
		this.loadFromFile(lessonsToLoad);
		this.nextQuery();
	},

	loadLessonTitles: function(list) {
		this.uiHandler.setupLessonCheckboxes(_.pluck(list, 'name'));
		this.uiHandler.registerCheckboxEvent(_.bind(this.clickCheckboxCallback, this));
	},

	loadFromFile: function(list) {
		this.load(this.generateLessonList(list));
	},

	load: function(listToLoad) {
		this.lessons = listToLoad;
	},

	generateLessonList: function(lessons) {
		return _.compact(_.map(lessons, function(lesson) {
			return lesson.contents;
		}));
	},

	nextQuery: function() {
		if(this.lessons.length === 0) {
			throw('Failed to load nextQuery: No lessons set.');
			return false;
		}

		var lesson = this.getRandomLesson();
		var entry = this.getRandomQueryFromLesson(lesson);

		this.currentQuery = entry;

		var direction = this.translateIntoPortuguese() ? 'ep' : 'pe';
		this.translationDirection = direction;

		if(direction == 'ep') {
			this.uiHandler.setQuery(entry.english);
		} else {
			this.uiHandler.setQuery(entry.port);
		}

		this.uiHandler.setInstructions(this.instructions(direction));
	},

	getRandomLesson: function() {
		var id = this.random(this.lessons.length);
		return this.lessons[id];
	},

	getRandomQueryFromLesson: function(lesson) {
		var id = this.random(lesson.length);
		return lesson[id];
	},

	instructions: function(direction) {
		if(direction == 'pe') {
			return "Pronounce, then type translation";
		} else {
			return "Type translation";
		}
	},

	random: function(limit) {
		return Math.floor(Math.random() * limit);
	},

	answer: function(answer) {
		this.answeredCorrectly = false;
		var correct = this.isAnswerCorrect(answer);
		var response = {
			hint: this.hint(answer),
			correct: correct
		};

		this.answeredCorrectly = correct;

		if(correct) {
			this.uiHandler.showPronunciation(this.currentQuery.pronunciation);
			this.uiHandler.showCongrats();

			this.showExplanation();
			this.showAlternateMeanings();

			response.pronunciation = this.pronunciation();
		} else {
			this.uiHandler.hidePronunciation();
			this.uiHandler.hideCongrats();
			this.uiHandler.hideExplanation();
			this.uiHandler.hideAlternateMeanings();
		}

		if(!this.isParticle()) {
			this.uiHandler.showHint(this.hint(answer));
		}

		return response;
	},

	showExplanation: function() {
		if(this.currentQuery.explanation) {
			this.uiHandler.showExplanation(this.currentQuery.explanation);
		}
	}, 

	showAlternateMeanings: function() {
		if(typeof this.currentQuery.english === 'object') {
			this.uiHandler.showAlternateMeanings(this.currentQuery.english);
		}
	},

	finishQuery: function() {
		if(this.answeredCorrectly && !this.isParticle()) {
			this.hideInfo();
			this.nextQuery();
		}

		if(this.isParticle()) {
			this.showInfo();

			if(this.particleShown) {
				this.hideInfo();
				this.nextQuery();
				this.particleShown = false;
			} else {
				this.particleShown = true;
			}
		}
	},

	showInfo: function() {
		this.uiHandler.showCongrats();
		this.uiHandler.showPronunciation(this.currentQuery.pronunciation);
		this.showExplanation();
		this.showAlternateMeanings();
	},

	hideInfo: function() {
		this.uiHandler.hideCongrats();
		this.uiHandler.hidePronunciation();
		this.uiHandler.hideExplanation();
		this.uiHandler.hideAlternateMeanings();

		this.uiHandler.clearInput();
		this.uiHandler.clearHint();
	},

	isParticle: function() {
		return !this.currentQuery.english && !this.currentQuery.german;
	},

	hint: function(answer) {
		var text = "";

		for(i = 0; i < answer.length; i++) {
			var correctLetters = this.getCorrectLetters(this.correctAnswer(), i, answer);
			var typedLetter = answer.charAt(i);
			if(_.contains(correctLetters, typedLetter)) {
				text += typedLetter;
			} else {
				text += '_';
			}
		}

		return text;
	},

	getCorrectLetters: function(correctAnswers, i, answer) {
		if(typeof correctAnswers === "string") {
			for(j = 0; j < i ; j++) {
				if(correctAnswers.charAt(j) != answer.charAt(j)) {
					return false;
				}
			}
			return [correctAnswers.charAt(i)];
		}

		return _.compact(_.flatten(_.map(correctAnswers, function(items) {
			return this.getCorrectLetters(items, i, answer);
		}, this)));
	},

	isAnswerCorrect: function(answer) {
		return this.answerExplainedRec(this.correctAnswer(), answer);
	},

	answerExplainedRec: function(correctAnswer, answer) {
		if(!correctAnswer && this.answerExplained) {
			return true;
		}

		if(typeof correctAnswer === "string") {
			return answer === correctAnswer;
		}

		return _.find(correctAnswer, function(item) {
			if(this.answerExplainedRec(item, answer)) {
				return true;
			}
		}, this);
	},

	correctAnswer: function() {
		if(this.translationDirection == 'pe') {
			return this.currentQuery.english;
		} else {
			return this.currentQuery.port
		}
	},

	pronunciation: function() {
		return this.currentQuery.pronunciation;
	},

	translateIntoPortuguese: function() {
		return true;
	}
};
