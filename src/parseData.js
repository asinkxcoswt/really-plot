var ReallyPlot = ReallyPlot || {};

ReallyPlot.parseData = function(rawData) {
	return {
		intervals: null,
		infty: null,
		ticks: null,
		levelName: parseLevelName(rawData),
		init: function() {
			this.infty = findInfty(rawData);
			this.intervals = parseIntervals(rawData, this.infty);
			this.ticks = determineTicks(this.intervals, this.inf);
			return this;
		}
	}.init();
	
	function findInfty(rawData) {
		return Math.max.apply(null, rawData.map(function(d) {
			return d.intervals.match(/-?\d+(?:\.\d+?)?/g);
		}).reduce(function(a,b) {
			return a.concat(b);
		}).map(function(d) {
			return Math.abs(parseFloat(d));
		})) + 1;
	}

	function determineTicks(intervals, infty) {
		return intervals.map(function(interval) {
			return [interval.l,interval.r];
		}).reduce(function(a, b) {
			return a.concat(b);
		}).filter(function(d) {
			return Math.abs(d) != infty;
		}).filter(function onlyUnique(value, index, self) { 
		    return self.indexOf(value) === index;
		});
	}

	function parseLevelName(rawData) {
		return rawData.map(function(singleLevel) {
			return singleLevel.name;
		});
	}

	function parseIntervals(rawData, infty) {
		var intervals = [];
		rawData.forEach(function(singleLevel, i) {
			singleLevel.intervals.split(/ *, *(?=[\[\(])/).forEach(function(singleInterval) {
				var parts = singleInterval.match(/^ *([\[\(]) *(.+) *, *(.+) *([\]\)]) *$/);
				if (parts.length != 5) {
					throw "Input might not be in the correct format.";
				}
				var interval = {
						lclose: (parts[1]=="["), 
						l: parseNumber(parts[2]), 
						r: parseNumber(parts[3]), 
						rclose: (parts[4]=="]"), 
						level: i+1
					};
				
				if (interval.l > interval.r) {
					throw "Invalid interval: " + parts[1] + parts[2] + "," + parts[3] + parts[4] + ", lower bound is greater than upper bound.";
				}
				intervals.push(interval);
			});
		});
		return intervals;
		
		function parseNumber(x) {
			x = x.replace(/ /g, '');
			var signum = 1;
			if (x.startsWith("-")) {
				signum = -1;
				x = x.substring(1);
			}
			if (x.match(/^(infinity|infty|inft|inf|infinit|infinite|infity)$/) != null) {
				return signum*infty;
			} else {
				return signum*parseFloat(x);
			}
		}
	}


}

