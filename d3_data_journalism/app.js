// Setup first chart dimension
var svgWidth = 650;
var svgHeight = 500;

var margin = { top: 30, right: 40, bottom: 60, left: 120 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Setup SVG and append group
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = svg.append("g");

// Import CSV and bind to function
d3.csv("data_d3.csv", function(err, myData) {
  if (err) throw err;

  myData.forEach(function(data) {
    data.obesityHigh = +data.obesityHigh;
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
    data.age = +data.age
    data.income = +data.income
  });

// Create axis
  var yLinearScale = d3.scaleLinear().range([height, 0]);
  var xLinearScale = d3.scaleLinear().range([0, width]);
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  xLinearScale.domain([5, d3.max(myData, function(data) {
    return +data.poverty;
  })]);
  yLinearScale.domain([20, d3.max(myData, function(data) {
    return +data.obesityHigh; 
  })]);

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([10, 0])
    .html(function(data) {
      var state = data.state;
      var obesityHighData = +data.obesityHigh;
      var povertyData = +data.poverty;
      return (state + "<br> obesityHigh: " + obesityHighData + "<br> poverty: " + incomeData);
    });

  chart.call(toolTip);

// Create scatter Plot circles  
  chart.selectAll("circle")
    .data(myData)
    .enter().append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(data.poverty);
    })
    .attr("cy", function(data, index) {
      return yLinearScale(data.obesityHigh);
    })
    .attr("r", "12")
    .attr("fill", "lightblue")
    .attr("stroke","white")
    .on("click", function(data) {
      toolTip.show(data);
    })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  chart.append("g")
    .attr("transform", "translate(0, "+ height + ")")
    .call(bottomAxis);

  chart.append("g")
    .call(leftAxis);

// Create axis labels   
  chart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height - 200))
    .attr("class", "axisText")
    .text("Obesity (%)");

  chart.append("text")
    .attr("transform", "translate(" + (width - 280) + " ," + (height + margin.top + 10) + ")")
    .attr("class", "axisText")
    .text("In Poverty Level (%)");

// Create circle text
  chart.selectAll("text")
    .data(myData)
    .enter()
    .append("text")
    .attr("x",function(data, index) {
      return xLinearScale(data.poverty);
    })
    .attr("y",function(data, index) {
      return yLinearScale(data.obesityHigh);
    })
    .text(function(data) {
      return (data.abbr);
    })
    .attr("font-size", "8px", "serif")
    .attr("text-anchor", "middle")


});

