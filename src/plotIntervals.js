var ReallyPlot = ReallyPlot || {};

ReallyPlot.plotIntervals = function (parent, data, config) {
	var config = $.extend({
		canvasWidth: 1000,
		canvasHeight: 500,
		get paddingX() { return 0.05*this.canvasWidth; },
		get paddingY() { return 0.1*this.canvasHeight; },
		get axisLineStrokeWidth() { return 0.02*this.canvasHeight; },
		get axisLineStrokeColor() { return "orange"; },
		get tickLabelFontSize() { return 2*this.tickLineLength; },
		get tickLabelFontFamily() { return "Courier New"; },
		get tickLabelFontWeight() { return "bold"; },
		get tickLabelOffsetX() { return  0; },
		get tickLabelOffsetY() { return -0.5*this.tickLineLength; },
		get tickLineLength() { return this.axisLineStrokeWidth; },
		get tickLineStrokeWidth() { return this.axisLineStrokeWidth; },
		get tickLineStrokeColor() { return this.axisLineStrokeColor; },
		get intervalBoundRadius() { return this.intervalLineStrokeWidth; },
		get intervalBoundStrokeWidth() { return 0.3*this.intervalLineStrokeWidth; },
		get intervalBoundStrokeColor() { return this.intervalLineStrokeColor; },
		get intervalBoundFillColor() { return this.intervalLineStrokeColor; },
		get intervalLineStrokeWidth() { return 2.5*this.axisLineStrokeWidth; },
		get intervalLineStrokeColor() { return "grey"; },
		scaleX: function(x) {
			var dmin = -data.infty;
			var dmax = data.infty;
			var rmin = this.paddingX;
			var rmax = this.canvasWidth - this.paddingX;
			return rmin + (x-dmin)*(rmax - rmin)/(dmax-dmin);
		},
		scaleY: function(y) {
			var lineHeight = 3*this.intervalLineStrokeWidth;
			return this.paddingY + y*lineHeight;
		},
	}, config);
	
	var canvas = d3.select(parent).append("svg")
		.attr("class", "canvas")
		.attr("width", config.canvasWidth)
		.attr("height", Math.max(config.canvasHeight, config.scaleY(data.levelName.length+1)));

	var coordinate = canvas.append("g")
		.attr("class", "coordinate")
		.attr("transform", "scale(1,-1) translate(0," + (-canvas.attr("height") + 0.5*(config.canvasHeight-config.scaleY(data.levelName.length+1))) + ")");
	
	var axisLine = coordinate
		.append("line")
		.attr("class", "axis-line")
		.attr("x1", config.scaleX(-data.infty))
		.attr("y1", config.scaleY(0))
		.attr("x2", config.scaleX(data.infty))
		.attr("y2", config.scaleY(0))
		.attr("style", "stroke-width: " + config.axisLineStrokeWidth + "; stroke: " + config.axisLineStrokeColor);
	
	var tick = coordinate.selectAll()
		.data(data.ticks)
		.enter()
		.append("g")
		.attr("class", "tick")
		.style("visibility", function(d) {
			return Math.abs(d) == data.infty ? "hidden" : "visible";
		});
	
	var tickLine = tick
		.append("line")
		.attr("class", "tick-line")
		.attr("x1", function(d) { return config.scaleX(d); })
		.attr("y1", function(d) { return config.scaleY(0) - config.axisLineStrokeWidth/2; })
		.attr("x2", function(d) { return config.scaleX(d); })
		.attr("y2", function(d) { return config.scaleY(0) - config.tickLineLength - config.axisLineStrokeWidth/2; })
		.attr("stroke-width", config.tickLineStrokeWidth)
		.attr("stroke", config.tickLineStrokeColor);
	tick
		.append("text")
		.attr("class", "tick-label")
		.attr("x", 0)
		.attr("y", 0)
		.attr("font-family", config.tickLabelFontFamily)
		.attr("font-size", config.tickLabelFontSize)
		.attr("font-weight", config.tickLabelFontWeight)
		.text(function(d) { return d; })
		.attr("transform", function(d) {
			var x = config.scaleX(d) - this.offsetWidth/2 + config.tickLabelOffsetX;
			var y = config.scaleY(0) - config.tickLineLength - this.offsetHeight/2 - config.axisLineStrokeWidth/2 + config.tickLabelOffsetY;
			return "scale(1,-1) translate(" + x + "," + (-y) + ")";
		})
		;
	
	var interval = coordinate.selectAll()
		.data(data.intervals)
		.enter()
		.append("g")
		.attr("class", "interval");
	interval
		.append("circle")
		.attr("class", function(d) { if (d.lclose) return "interval-bound interval-bound-close"; else return "interval-bound interval-bound-open"; })
		.attr("cx", function(d) { return config.scaleX(d.l); })
		.attr("cy", function(d) { return config.scaleY(d.level); })
		.attr("r", config.intervalBoundRadius)
		.attr("stroke-width", config.intervalBoundStrokeWidth)
		.attr("stroke", config.intervalBoundStrokeColor)
		.attr("fill", function(d) { if (d.lclose) return config.intervalBoundFillColor; else return "none"; })
		.style("visibility", function(d) {
			return d.l == -data.infty ? "hidden" : "visible";
		});
	interval
		.append("circle")
		.attr("class", function(d) { if (d.rclose) return "interval-bound interval-bound-close"; else return "interval-bound interval-bound-open"; })
		.attr("cx", function(d) { return config.scaleX(d.r) })
		.attr("cy", function(d) { return config.scaleY(d.level); })
		.attr("r", config.intervalBoundRadius)
		.attr("stroke-width", config.intervalBoundStrokeWidth)
		.attr("stroke", config.intervalBoundStrokeColor)
		.attr("fill", function(d) { if (d.rclose) return config.intervalBoundFillColor; else return "none"; })
		.style("visibility", function(d) {
			return d.r == data.infty ? "hidden" : "visible";
		});
	interval
		.append("line")
		.attr("class", "interval-line")
		.attr("x1", function(d) { if (d.l == -data.infty) return config.scaleX(d.l); else return config.scaleX(d.l) + config.intervalBoundRadius; })
		.attr("y1", function(d) { return config.scaleY(d.level); })
		.attr("x2", function(d) { if (d.r == data.infty) return config.scaleX(d.r); else return config.scaleX(d.r) - config.intervalBoundRadius; })
		.attr("y2", function(d) { return config.scaleY(d.level); })
		.attr("style", "stroke-width: " + config.intervalLineStrokeWidth + "; stroke: " + config.intervalLineStrokeColor);
}