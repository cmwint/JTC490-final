// Hey Dani, So I did follow a tutorial for this; I may have been in over my head with this project!
// But I annotated the code to show I understand what it is doing even though much of this is from a 
// tutorial, minus a couple style changes I made. I apologize if this has been/will be a hassle to grade,  
// but I really learned a lot about d3 and it motivated me to actually start learning this stuff! 


// This also won't work in browsers(except for Safari) unless loaded on to a server. It will give you a 
// "XMLHttpRequest cannot load" error. Browsers block the request because it thinks it is a cross site
// attack. And it doesn't want people to read my hard drive from my browser window. (Definitely had to look
// up what that error meant and how to work around it!)

// setting up the outer canvas that the graph is being placed it, and using 
// an array called margin to define it. The width and height are the 
// inner dimmensions of the graphic, taking into account the outer graphic
var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// creating four variables to converting the dates and wages from the tsv file
// and converting them both to something d3 can use 
var parseDate = d3.time.format("%d-%b-%y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return "$" + formatValue(d); };

// treating the x-axis as time, specifying the range that the values will
// be within
var x = d3.time.scale().range([0, width]);

// same thing with wages on the y-axis
var y = d3.scale.linear().range([height, 0]);

// creating an SVG to draw the x-axis, shown at the bottom
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

// creating an SVG to draw the y-axis, shown to the left-hand side
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// getting information from the data file and adding it to a function
// called line
var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

// selecting the DOM element "body" and adding and SVG element and then
// grouping it with the "g" element, while adding stylistic changes with
// the attribute method
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// grabbing the data.tsv file inthe same directory as index.html, the function
// will be performed on the file that was called, 
d3.tsv("data.tsv", function(error, data) {
  // this is going through all the data and grabbing each value. For each,
  // it recieves a date and a wage(close) and performs the two operations
  // to format it correctly for d3
  data.forEach(function(d) {
    // turning the date into a format d3 can read and process
    d.date = parseDate(d.date);
    // setting the wage to a numeric value
    d.close = +d.close;
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  // setting the domains to ensure the graph axis scale with the graph
  // data properly
  x.domain([data[0].date, data[data.length - 1].date]);
  y.domain(d3.extent(data, function(d) { return d.close; }));

  // finally drawing the axes that we created earlier by attaching them
  // to the DOM with the append and attribute methods
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // drawing y axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Wage ($)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  // creating variable to hold styles/attributes of the pointer
  // when you hover over a point on the graph
  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  // appending the focus variable to the DOM and defining styles
  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);
  
  // Determining what will show up when you mouseover a data point
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
    focus.select("text").text(formatCurrency(d.close));
  }
});
