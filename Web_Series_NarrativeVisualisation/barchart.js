// Overall Structure and Animation of bar graph was inspired by this link
// https://www.d3-graph-gallery.com/graph/barplot_basic.html

var barChartDiv = document.querySelector("#chart");

// Dimensions
var margin = {top: 10, right: 60, bottom: 160, left: 150},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Creating svg object
var svg = d3.select(barChartDiv)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("tv_series.csv").then(function(data) {

  // Data Filtering: Keep only series with rating >= 8.5
  data = data.filter(function(d) { return d.rating >= 8.5; });

  // X and Y plus Axes
  var x = d3.scaleBand()
    .domain(data.map(function(d) { return d.series_title; }))
    .range([0, width])
    .padding(0.2);

  var y = d3.scaleLinear()
    .domain([8.5, d3.max(data, function(d) { return +d.rating; })])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(y));

  // Coloring Bars
  var genres = Array.from(new Set(data.map(function(d) { return d.genre; })));

  // Color coding the values based on genre
  var color = d3.scaleOrdinal()
    .domain(genres)
    .range(d3.schemeTableau10);

  // Initializing Bars
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.series_title); })
    .attr("y", function(d) { return y(8.5); }) // Start bars at the baseline
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(8.5); }) // Start bars with height 0
    .attr("fill", function(d) { return color(d.genre); })
    .attr("opacity", 0.5);

  // Loading Bars with Animation
  svg.selectAll("rect")
    .transition()
    .duration(500)
    .attr("y", function(d) { return y(d.rating); })
    .attr("height", function(d) { return height - y(d.rating); })
    .delay(function(d, i) { return (i * 100); });

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
    .on("mouseover", function(event, d) {
      d3.select(this).style("opacity", 1);
      tooltip.style("opacity", 1);
    })
    .on("mousemove", function(event, d) {
      tooltip.html('<u>' + d.series_title + '</u>' +
        "<br>" + "Rating: " + d.rating +
        "<br>" + "Genre: " + d.genre)
        .style('top', (event.pageY + 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 0.5);
      tooltip.style("opacity", 0);
    });

  // Legend Code
  var size = 20;
  svg.selectAll("dots")
    .data(genres)
    .enter()
    .append("rect")
    .attr("x", width * 0.85)
    .attr("y", function(d, i) { return height / 20 + i * (size + 5); })
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d) { return color(d); });

  svg.selectAll("labels")
    .data(genres)
    .enter()
    .append("text")
    .attr("x", width * 0.85 + size * 1.2)
    .attr("y", function(d, i) { return height / 20 + i * (size + 5) + (size * 0.5); })
    .style("fill", "black")
    .text(function(d) { return d; })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
});
