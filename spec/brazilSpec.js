describe('Brazilmemo', function() {
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

		app = Brazilmemo.init(uiHandler);
		testList = [ [ { english: "cost", port: "custa" } ] ];
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
		var allLessons = [ { name: "Lesson A", contents: [ { english: "abc", port: "ฟิแ"} ] }, { name: "Lesson B", contents: [ 'blub' ] } ];
		beforeEach(function() {
			app.loadLessonTitles(allLessons);
		});

		it('registers the event for clicking a checkbox', function() {
			expect(uiHandler.registerCheckboxEvent).toHaveBeenCalled();
		});
	});

	describe('loading a lesson list', function() {
		var allLessons = [ { name: "Lesson A", contents: [ { english: "abc", port: "ฟิแ"} ] }, { name: "Lesson B", contents: [ 'blub' ] } ];
		beforeEach(function() {
			app.loadFromFile(allLessons);
		});

		it('filters the list', function() {
			app.filterLessons(allLessons, {
				'Lesson A': true,
				'Lesson B': false,
			});

			expect(app.lessons).toEqual([ [ { english: "abc", port: "ฟิแ"} ] ]);
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
				{ english: "menu", port: "เมนู", pronunciation: "may-nuh" },
				{ english: "like to", port: "อยากจะ", pronunciation: "yahk ja" },
				{ explanation: "(formal)", english: "to eat", port: "ทาน", pronunciation: "tahn" },
			];

			var everyLesson = [
				{ name: "The test lesson", contents: oneLesson },
			];

			expect(app.generateLessonList(everyLesson)).toEqual([
				[
					{ english: "menu", port: "เมนู", pronunciation: "may-nuh" },
					{ english: "like to", port: "อยากจะ", pronunciation: "yahk ja" },
					{ explanation: "(formal)", english: "to eat", port: "ทาน", pronunciation: "tahn" },
				]
			]);
		});
	});
	
	describe('when asking for a query', function() {
		describe('portuguese to english', function() {
			it('shows a portuguese word', function() {
				spyOn(app, 'translateIntoPortuguese').andReturn(false);
				app.nextQuery();
				expect(uiHandler.setQuery).toHaveBeenCalledWith('custa');
				expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then type translation');
			});
		});

		describe('english to portuguese', function() {
			it('shows an english word', function() {
				spyOn(app, 'translateIntoPortuguese').andReturn(true);
				app.nextQuery();
				expect(uiHandler.setQuery).toHaveBeenCalledWith('cost');
				expect(uiHandler.setInstructions).toHaveBeenCalledWith('Type translation');
			});
		});
	});

	describe('different instructions for different queries', function() {
		it('shows a portuguese word', function() {
			spyOn(app, 'translateIntoPortuguese').andReturn(false);
			var testList = [ [ { english: "cost", port: "ค่า", pronunciation: "kah" } ] ];
			app.load(testList);
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('ค่า');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Pronounce, then type translation');
		});

		it('shows an english word', function() {
			spyOn(app, 'translateIntoPortuguese').andReturn(true);
			var testList = [ [ { english: "cost", port: "ค่า", pronunciation: "kah" } ] ];
			app.load(testList);
			app.nextQuery();
			expect(uiHandler.setQuery).toHaveBeenCalledWith('cost');
			expect(uiHandler.setInstructions).toHaveBeenCalledWith('Type translation');
		});
	});

	describe('user enters an answer', function() {
		beforeEach(function() {
			spyOn(app, 'translateIntoPortuguese').andReturn(false);
			app.nextQuery();
		});

		describe('answer is correct', function() {
			it('shows that the answer is correct', function() {
				app.answer('cost');
				expect(uiHandler.showPronunciation).toHaveBeenCalled();
				expect(uiHandler.showCongrats).toHaveBeenCalled();
			});

			it('accepts differences in capitalization', function() {
				app.answer('Cost');
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
			expect(uiHandler.showHint).toHaveBeenCalledWith('co__');
		});

		it('shows the appropriate hint for different capitalization', function() {
			app.answer('Coll');
			expect(uiHandler.showHint).toHaveBeenCalledWith('Co__');
		});
	});

	describe('user enters an answer', function() {
		describe('reverse translation direction', function() {
			it('shows that the answer is correct', function() {
				spyOn(app, 'translateIntoPortuguese').andReturn(true);
				app.nextQuery();
				app.answer('custa');
				expect(uiHandler.showPronunciation).toHaveBeenCalled();
				expect(uiHandler.showCongrats).toHaveBeenCalled();
			});
		});
	});

	describe('user hits enter', function() {
		beforeEach(function() {
			spyOn(app, 'translateIntoPortuguese').andReturn(false);
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
	});

	describe('different kinds of information for answers', function() {
		beforeEach(function() {
			spyOn(app, 'translateIntoPortuguese').andReturn(false);
		});

		it('has an explanation', function() {
			var testList = [ [ { explanation: "an explanation", english: "cost", port: "ค่า", pronunciation: "kah" } ] ];
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
			var testList = [ [ { english: ["cost", "testMeaning"], port: "ค่า", pronunciation: "kah" } ] ];
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
			spyOn(app, 'translateIntoPortuguese').andReturn(false);
			app.nextQuery();
		});

		it('shows the answer', function() {
			app.skipCallback();

			expect(uiHandler.typeInAnswerForUser).toHaveBeenCalledWith('cost');
			expect(uiHandler.showCongrats).not.toHaveBeenCalled();
		});
	});
});
