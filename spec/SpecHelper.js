beforeEach(function() {
  this.addMatchers({
    toContainText: function(expected) {
			var actual = this.actual;
      var notText = this.isNot ? " not" : "";

			this.message = function () {
        return "Expected '" + actual.text() + "'" + notText + " to contain '" + expected + "'";
      }

      return this.actual.text().match(expected);
    },

		toBeShown: function() {
			var actual = this.actual;
      var notText = this.isNot ? " not" : "";

			this.message = function () {
        return "Expected " + actual.selector + notText + " to be shown, but it is hidden.";
      }

      return this.actual.is(':visible');
		}
  });
});
