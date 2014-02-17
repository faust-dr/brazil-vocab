describe('Thaimemo', function() {
	var app;
	var uiHandler;
	var testList;

	beforeEach(function() {
		uiHandler = {
			setupLessonCheckboxes: jasmine.createSpy('setupLessonCheckboxes'),
			setQuery: jasmine.createSpy('setQuery'),
			setInstructions: jasmine.createSpy('setInstructions'),
			clearInput: jasmine.createSpy('clearInput'),
			clearHint: jasmine.createSpy('clearHint'),
			hideCongrats: jasmine.createSpy('hideCongrats'),
			hidePronunciation: jasmine.createSpy('hidePronunciation'),
			hideExplanation: jasmine.createSpy('hideExplanation'),
			hideAlternateMeanings: jasmine.createSpy('hideAlternateMeanings'),
			setKeyboardFocus: jasmine.createSpy('setKeyboardFocus'),
			registerTypeEvent: jasmine.createSpy('registerTypeEvent'),
			registerEnterEvent: jasmine.createSpy('registerEnterEvent'),
			registerCheckboxEvent: jasmine.createSpy('registerCheckboxEvent'),
			registerSkipEvent: jasmine.createSpy('registerSkipEvent'),
			showPronunciation: jasmine.createSpy('showPronunciation'),
			typeInAnswerForUser: jasmine.createSpy('typeInAnswerForUser'),
			showCongrats: jasmine.createSpy('showCongrats'),
			showExplanation: jasmine.createSpy('showExplanation'),
			showAlternateMeanings: jasmine.createSpy('showAlternateMeanings'),
			showHint: jasmine.createSpy('showHint'),
		};

		app = Thaimemo.init(uiHandler);
		testList = [ [ { english: "cost", thai: "ค่า", pronunciation: "kah" } ] ];
		app.load(testList);
	});

	describe('initialize', function() {
		it('hides Congrats, Pronunciation, Explanation, Alternate Meanings', function() {
			expect(uiHandler.hideCongrats).toHaveBeenCalled();
			expect(uiHandler.hidePronunciation).toHaveBeenCalled();
			expect(uiHandler.hideExplanation).toHaveBeenCalled();
			expect(uiHandler.hideAlternateMeanings).toHaveBeenCalled();
		});

		it('sets keyboard focus on the input field', function() {
			expect(uiHandler.setKeyboardFocus).toHaveBeenCalled();
		});

		it('registers the keyup event on the input field with a callback', function() {
			expect(uiHandler.registerTypeEvent).toHaveBeenCalled();
		});

		it('registers the enter key event on the input field with a callback', function() {
			expect(uiHandler.registerEnterEvent).toHaveBeenCalled();
		});

		it('registers the skip button event with a callback', function() {
			expect(uiHandler.registerSkipEvent).toHaveBeenCalled();
		});
	});

	describe('loading the lesson titles', function() {
		var allLessons = [ { name: "Lesson A", contents: [ { english: "abc", thai: "ฟิแ"} ] }, { name: "Lesson B", contents: [ 'blub' ] } ];
		beforeEach(function() {
			app.loadLessonTitles(allLessons);
		});

		it('registers the event for clicking a checkbox', function() {
			expect(uiHandler.registerCheckboxEvent).toHaveBeenCalled();
		});
	});

	describe('loading a lesson list', function() {
		var allLessons = [ { name: "Lesson A", contents: [ { english: "abc", thai: "ฟิแ"} ] }, { name: "Lesson B", contents: [ 'blub' ] } ];
		beforeEach(function() {
			app.loadFromFile(allLessons);
		});

		it('filters the list', function() {
			app.filterLessons(allLessons, {
				'Lesson A': true,
				'Lesson B': false,
			});

			expect(app.lessons).toEqual([ [ { english: "abc", thai: "ฟิแ"} ] ]);
		});

		it('fetches the next query', function() {
			spyOn(app, 'nextQuery');
			app.filterLessons(allLessons, { 'Lesson A': true, 'Lesson B': false, });
			expect(app.nextQuery).toHaveBeenCalled();
		});
	});

	describe('re-formatting the word list', function() {
		it('produces the right format', function() {
			var oneLesson = [
				{ english: "menu", thai: "เมนู", pronunciation: "may-nuh" },
				{ english: "like to", thai: "อยากจะ", pronunciation: "yahk ja" },
				{ explanation: "(formal)", english: "to eat", thai: "ทาน", pronunciation: "tahn" },
			];

			var everyLesson = [
				{ name: "The test lesson", contents: oneLesson },
			];

			expect(app.generateLessonList(everyLesson)).toEqual([
				[
					{ english: "menu", thai: "เมนู", pronunciation: "may-nuh" },
					{ english: "like to", thai: "อยากจะ", pronunciation: "yahk ja" },
					{ explanation: "(formal)", english: "to eat", thai: "ทาน", pronunciation: "tahn" },
				]
			]);
		});
	});
	
	describe('when asking for a query', function() {
		it('shows a word', function() {
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('ค่า');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then type translation');
		});
	});

	describe('different instructions for different queries', function() {
		it('shows a word', function() {
			var testList = [ [ { english: "cost", thai: "ค่า", pronunciation: "kah" } ] ];
			app.load(testList);
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('ค่า');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then type translation');
		});

		it('shows a particle', function() {
			var testList = [ [ { explanation: "(male polite particle)", thai: "ครับ", pronunciation: "krap" } ] ];
			app.load(testList);
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('ครับ');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then hit enter');
		});

		it('shows a consonant/vowel', function() {
			var testList = [ [ { german: "k", thai: "ฆ", pronunciation: "ko (low)" } ] ];
			app.load(testList);
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('ฆ');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then type romanization');
		});
	});

	describe('user enters an answer', function() {
		beforeEach(function() {
			app.nextQuery();
		});

		describe('answer is correct', function() {
			it('shows that the answer is correct', function() {
				app.answer('cost');
				expect(uiHandler.showPronunciation).toHaveBeenCalled();
				expect(uiHandler.showCongrats).toHaveBeenCalled();
			});

			describe('user changes the answer to be incorrect', function() {
				it('it removes the info', function() {
					uiHandler.hidePronunciation.reset();
					uiHandler.hideCongrats.reset();

					app.answer('costf');

					expect(uiHandler.hidePronunciation).toHaveBeenCalled();
					expect(uiHandler.hideCongrats).toHaveBeenCalled();
				});
			});
		});

		it('returns that the answer is incorrect', function() {
			app.answer('fish');
			expect(uiHandler.showPronunciation).not.toHaveBeenCalled();
			expect(uiHandler.showCongrats).not.toHaveBeenCalled();
		});

		it('returns that the answer is partially correct', function() {
			app.answer('coll');
			expect(uiHandler.showPronunciation).not.toHaveBeenCalled();
			expect(uiHandler.showCongrats).not.toHaveBeenCalled();
		});

		it('shows the appropriate hint', function() {
			app.answer('coll');
			expect(uiHandler.showHint).toHaveBeenCalled();
		});

		describe('query is particle', function() {
			it('does not show hints', function() {
				var testList = [ [ { explanation: "blah", thai: "ฆ", pronunciation: "ko (low)" } ] ];
				app.load(testList);
				app.nextQuery();

				app.answer('coll');
				expect(uiHandler.showHint).not.toHaveBeenCalled();
			});
		});
	});

	describe('user hits enter', function() {
		beforeEach(function() {
			app.nextQuery();
		});

		describe('answer is incorrect', function() {
			it('does not do anything', function() {
				spyOn(app, 'nextQuery').andCallThrough();
				app.answer('farquard');
				app.sendEnterCallback();
				expect(app.nextQuery).not.toHaveBeenCalled();
			});
		});

		describe('answer is correct', function() {
			beforeEach(function() {
				spyOn(app, 'nextQuery').andCallThrough();
				uiHandler.hideCongrats = jasmine.createSpy('hideCongrats');
				uiHandler.hidePronunciation = jasmine.createSpy('hidePronunciation');
				uiHandler.hideExplanation = jasmine.createSpy('hideExplanation');
				uiHandler.hideAlternateMeanings = jasmine.createSpy('hideAlternateMeanings');

				app.answer('cost');
				app.sendEnterCallback();
			});

			it('shows the next query', function() {
				expect(app.nextQuery).toHaveBeenCalled();
				expect(uiHandler.clearInput).toHaveBeenCalled();
			});

			it('hides all the previous info', function() {
				expect(uiHandler.clearHint).toHaveBeenCalled();
				expect(uiHandler.hideCongrats).toHaveBeenCalled();
				expect(uiHandler.hidePronunciation).toHaveBeenCalled();
				expect(uiHandler.hideExplanation).toHaveBeenCalled();
				expect(uiHandler.hideAlternateMeanings).toHaveBeenCalled();
			});
		});

		describe('query is a particle', function() {
			beforeEach(function() {
				testList = [ [ { explanation: "it is so", thai: "ค่า", pronunciation: "kah" } ] ];
				app.load(testList);
				app.nextQuery();
				spyOn(app, 'nextQuery').andCallThrough();
				app.sendEnterCallback();
			});

			it('does not display the next query', function() {
				expect(app.nextQuery).not.toHaveBeenCalled();
			});

			it('displays the relevant information', function() {
				expect(uiHandler.showCongrats).toHaveBeenCalled();
				expect(uiHandler.showPronunciation).toHaveBeenCalled();
				expect(uiHandler.showExplanation).toHaveBeenCalled();
			});

			describe('when the user hits enter again', function() {
				beforeEach(function() {
					app.sendEnterCallback();
				});

				it('shows the next query', function() {
					expect(app.nextQuery).toHaveBeenCalled();
					expect(uiHandler.clearInput).toHaveBeenCalled();
				});

				it('hides all the previous info', function() {
					expect(uiHandler.clearHint).toHaveBeenCalled();
					expect(uiHandler.hideCongrats).toHaveBeenCalled();
					expect(uiHandler.hidePronunciation).toHaveBeenCalled();
					expect(uiHandler.hideExplanation).toHaveBeenCalled();
					expect(uiHandler.hideAlternateMeanings).toHaveBeenCalled();
				});
			});
		});
	});

	describe('different kinds of information for answers', function() {
		it('has an explanation', function() {
			var testList = [ [ { explanation: "an explanation", english: "cost", thai: "ค่า", pronunciation: "kah" } ] ];
			app.load(testList);
			app.nextQuery();
			app.answer('cost');
			expect(uiHandler.showExplanation).toHaveBeenCalledWith('an explanation');
		});

		it('has no explanation', function() {
			app.nextQuery();
			app.answer('cost');
			expect(uiHandler.showExplanation).not.toHaveBeenCalled();
		});

		it('has alternate meanings', function() {
			var testList = [ [ { english: ["cost", "testMeaning"], thai: "ค่า", pronunciation: "kah" } ] ];
			app.load(testList);
			app.nextQuery();
			app.answer('cost');
			expect(uiHandler.showAlternateMeanings).toHaveBeenCalledWith(["cost", "testMeaning"]);
		});

		it('has no alternate meanings', function() {
			app.load(testList);
			app.nextQuery();
			app.answer('cost');
			expect(uiHandler.showAlternateMeanings).not.toHaveBeenCalled();
		});
	});

	describe('skipping a word', function() {
		beforeEach(function() {
			app.nextQuery();
		});

		it('shows the answer', function() {
			app.skipCallback();

			expect(uiHandler.showPronunciation).toHaveBeenCalledWith('kah');
			expect(uiHandler.typeInAnswerForUser).toHaveBeenCalledWith('cost');

			expect(uiHandler.showCongrats).not.toHaveBeenCalled();
		});
	});
});
