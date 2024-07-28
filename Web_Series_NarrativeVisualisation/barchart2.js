// Set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 70, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the div called 'chart'
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var color = d3.scaleOrdinal()
  .domain(['Comedy', 'Family', 'Western', 'Drama', 'Adventure', 'Crime', 'Action', 'Mystery', 'Romance', 'Fantasy', 'Animation', 'Sci-Fi', 'Thriller', 'Other'])
  .range(['#ff69b4', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#8dd3c7', '#9e9ac8', '#636363']);


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

function tooltipFunction(d, action) {

    switch (action) {
      case "over":
        tooltip.style("opacity", 1);
        return;
      case "move":

        tooltip.html("Genre: " + d.key + "<br>Average Rating: " + d.value.avgRating.toFixed(2) + "<br>Count: " + d.value.count)
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
  window.updateChart = function(decade) {
    // Filter data for the selected decade
    var filteredData = data.filter(function(d) { return d.decade === decade && +d.rating > 5; });

    // Count the number of series per genre and calculate average rating per genre
    var genreCounts = d3.nest()
      .key(function(d) { return d.genre; })
      .rollup(function(v) { return {count: v.length, avgRating: d3.mean(v, function(d) { return +d.rating; })}; })
      .entries(filteredData);

    // Sort genres by count in descending order and keep top 10
    genreCounts.sort(function(a, b) { return b.value.count - a.value.count; });
    var topGenres = genreCounts.slice(0, 10);

    // Clear previous chart
    svg.selectAll("*").remove();

    // X axis
    var x = d3.scaleBand()
      .range([0, width])
      .domain(topGenres.map(function(d) { return d.key; }))
      .padding(0.1);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleLinear()
      .domain([6, 9])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    var bars = svg.selectAll("rect")
      .data(topGenres);

    bars.enter()
      .append("rect")
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", function(d) { return color(d.key); })
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("y", function(d) { return y(d.value.avgRating); })
      .attr("height", function(d) { return height - y(d.value.avgRating); });

    // // Tooltip
    // bars.on("mouseover", function(event, d) {
    //   tooltip.transition()
    //     .duration(200)
    //     .style("opacity", 1);
    //   tooltip.html("Genre: " + d.key + "<br>Average Rating: " + d.value.avgRating.toFixed(2))
    //     .style("left", (event.pageX + 5) + "px")
    //     .style("top", (event.pageY - 28) + "px");
    // })
    // .on("mouseout", function(d) {
    //   tooltip.transition()
    //     .duration(500)
    //     .style("opacity", 0);
    // });

    svg.selectAll("rect")
    .on("mouseover", function(d) { this.style.opacity = 1; tooltipFunction(d, "over");})
    .on("mousemove", function(d) { tooltipFunction(d, "move");})
    .on("mouseout", function(d) { this.style.opacity = 0.5; tooltipFunction(d, "out");})


    // Remove old bars
    bars.exit().remove();

    // Add a legend
    var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        var height = 20;
        var offset = height * color.domain().length / 2;
        var horz = -2 * radius + 20;
        var vert = i * height - offset;
        return "translate(" + (width + 50) + "," + vert + ")";
      });
  }

  // Initialize the chart with the first decade
  updateChart("1950-1960");
});
