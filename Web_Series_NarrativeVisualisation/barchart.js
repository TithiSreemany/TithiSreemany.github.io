// Overall Structure and Animation of bar graph was inspired by this link
// https://www.d3-graph-gallery.com/graph/barplot_basic.html

var barChartDiv = document.querySelector("#chart");

// Dimensions
var margin = { top: 40, right: 60, bottom: 160, left: 150 },
  width = 1200 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// Creating svg object
var svg = d3.select(barChartDiv)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Path to your CSV file
var csvFilePath = "tv_series.csv"; // Ensure the correct path to the CSV file

// Load the CSV file
d3.csv(csvFilePath).then(function (data) {
  console.log("CSV Data Loaded:", data);

  // Process data to count unique series titles per decade
  var decadeCounts = d3.nest()
    .key(function (d) { return d.decade; })
    .rollup(function (v) {
      return d3.set(v.map(function (d) { return d.series_title; })).size();
    })
    .entries(data)
    .map(function (d) {
      return {
        decade: d.key,
        count: d.value
      };
    });

  // Sort the data by decade
  decadeCounts.sort(function (a, b) {
    return d3.ascending(a.decade, b.decade);
  });

  // X and Y plus Axes
  var x = d3.scaleBand()
    .domain(decadeCounts.map(function (d) { return d.decade; }))
    .range([0, width])
    .padding(0.2);

  var y = d3.scaleLinear()
    .domain([0, d3.max(decadeCounts, function (d) { return d.count; })]) // Set y-axis based on max count
    .range([height, 0]);

  svg.append("g")
    .attr("transform", "translate(0," + height+ ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));
  // Initializing Bars
  svg.selectAll("rect")
    .data(decadeCounts)
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.decade); })
    .attr("y", function (d) { return y(0); }) // Start bars at the baseline
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
       return height - y(0); }) // Start bars with height 0
    .attr("fill", "pink")
    .attr("opacity", 0.5);

  // Find the maximum value
  var maxValue = d3.max(decadeCounts, function(d) { return d.count; });
  
  // Append text to the bar with the maximum value
  svg.selectAll("rect")
      .filter(function(d) { return d.count === maxValue; })
      .each(function(d) {
          console.log(d.count, maxValue);
          svg.append("text")
              .attr("x", x(d.decade) + x.bandwidth() / 2)  // Center the text on the bar
              .attr("y", y(d.count) - 20)  // Position the text above the bar
              .attr("dy", ".75em")
              .attr("text-anchor", "middle")
              .text("Steady Rise in Web-Series Releases with the highest count of "+ d.count)  // Display the value (modify according to your data)
              .attr("fill", "red");  // Set text color (can be modified)
      });

  // Loading Bars with Animation
  svg.selectAll("rect")
    .data(decadeCounts)
    .transition()
    .duration(500)
    .attr("y", function (d) { return y(d.count); })
    .attr("height", function (d) { return height - y(d.count); })
    .delay(function (d, i) { return i * 100; });

  // Tooltip code
  var tooltip = d3.select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

    svg.selectAll("rect")
    .data(decadeCounts)
    .on("mouseover", function(d) { this.style.opacity = 1; tooltipFunction(d, "over");})
    .on("mousemove", function(d) { tooltipFunction(d, "move");})
    .on("mouseout", function(d) { this.style.opacity = 0.5; tooltipFunction(d, "out");})

    function tooltipFunction(d, action) {

      switch (action) {
        case "over":
          tooltip.style("opacity", 1);
          return;
        case "move":

          tooltip.html('<u>' + d.decade + '</u>'
                      + "<br>" + "Number of Web Series Released: "+ d.count)
            .style('top', (d3.event.pageY + 10) + 'px')
            .style('left', (d3.event.pageX + 10) + 'px');
          return;
        default:
          tooltip.style("opacity", 0);
      }
  }
}).catch(function (error) {
  console.error("Error loading the CSV file:", error);
});
