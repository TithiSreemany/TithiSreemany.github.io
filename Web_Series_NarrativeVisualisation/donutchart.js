// Set the dimensions and margins of the graph
var width = 1200,
    height = 500,
    margin = 50;

// Radius
var radius = Math.min(width, height) / 2 - margin;

// Append the svg object to the div called 'chart'
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal()
  .domain(['Comedy', 'Family', 'Western', 'Drama', 'Adventure', 'Crime', 'Action', 'Mystery', 'Romance', 'Fantasy', 'Animation', 'Sci-Fi', 'Thriller', 'Other'])
  .range(['#ff69b4', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#8dd3c7', '#9e9ac8', '#636363']);

// Create a tooltip
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// Tooltip helper function
function tooltipFunction(d, action, pieData) {
  switch (action) {
    case "over":
      tooltip.style("opacity", 1);
      return;
    case "move":
      var total = d3.sum(pieData.map(function(d) {
        return d.value;
      }));
      var percentage = Math.round(1000 * d.data.value / total) / 10;
      tooltip.html("Genre: " + d.data.key + "<br>Percentage: " + percentage + "%" + "<br>Count : " + d.data.value)
        .style('top', (d3.event.pageY + 10) + 'px')
        .style('left', (d3.event.pageX + 10) + 'px');
      return;
    default:
      tooltip.style("opacity", 0);
  }
}

// Load the data
d3.csv("tv_series.csv").then(function(data) {

  // Function to update the chart
  function updateChart(decade) {
    // Filter data for the selected decade
    var filteredData = data.filter(function(d) { return d.decade === decade && +d.rating > 5; });

    // Count the number of series per genre
    var genreCounts = d3.nest()
      .key(function(d) { return d.genre; })
      .rollup(function(v) { return v.length; })
      .entries(filteredData);

    // Sort genres by count and keep top 5 + "Other"
    genreCounts.sort(function(a, b) { return b.value - a.value; });
    var topGenres = genreCounts.slice(0, 10);
    var otherCount = d3.sum(genreCounts.slice(10), function(d) { return d.value; });
    topGenres.push({ key: "Other", value: otherCount });

    // Convert data to the format required for the donut chart
    var pieData = d3.pie()
      .value(function(d) { return d.value; })(topGenres);

    // Mapping Data to arcs
    var u = svg.selectAll("path")
      .data(pieData);

    // Creating Donut chart with arcs
    u.enter()
      .append('path')
      .merge(u)
      .transition()
      .duration(1000)
      .attr('d', d3.arc()
        .innerRadius(100)
        .outerRadius(radius)
      )
      .attr('fill', function(d) { return color(d.data.key); })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    // Tooltip
    u.on('mouseover', function(d) { tooltipFunction(d, "over", pieData); })
      .on('mousemove', function(d) { tooltipFunction(d, "move", pieData); })
      .on('mouseout', function(d) { tooltipFunction(d, "out", pieData); });

    // Remove old arcs
    u.exit().remove();
  }

  // Initialize the chart with the first decade
  updateChart("1950-1960");

  // Expose the updateChart function to the global scope
  window.updateChart = updateChart;

  // Add a legend
  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      var height = 20;
      var offset = height * color.domain().length / 2;
      var horz = -2 * radius - 20;
      var vert = i * height - offset;
      return "translate(" + horz + "," + vert + ")";
    });

  legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color)
    .style("stroke", color);

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) { return d; });
});
