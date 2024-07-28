// Overall Structure and Animation of bar graph was inspired by this link
// https://www.d3-graph-gallery.com/graph/barplot_basic.html

var barChartDiv = document.querySelector("#chart");

// Dimensions
var margin = { top: 10, right: 60, bottom: 160, left: 150 },
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

  // Get unique series names and sort by rating in descending order
  const uniqueSeries = Array.from(new Set(data.map(d => d.series_title)))
    .map(series_title => {
      return {
        series_title: series_title,
        rating: Math.max(...data.filter(d => d.series_title === series_title).map(d => +d.rating)),
        genre: data.find(d => d.series_title === series_title).genre
      };
    });

  // Sort data by rating in descending order and keep only top 100
  const top100Series = uniqueSeries.sort((a, b) => d3.descending(a.rating, b.rating))
    .slice(0, 100);

  // X and Y plus Axes
  var x = d3.scaleBand()
    .domain(top100Series.map(d => d.series_title))
    .range([0, width])
    .padding(0.2);

  var y = d3.scaleLinear()
    .domain([8.5, 10]) // Set y-axis from 0 to 10
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
  var genres = Array.from(new Set(top100Series.map(d => d.genre)));

  // Color coding the values based on genre
  var color = d3.scaleOrdinal()
    .domain(genres)
    .range(d3.schemeTableau10);

  // Initializing Bars
  svg.selectAll("rect")
    .data(top100Series)
    .enter()
    .append("rect")
    .attr("x", d => x(d.series_title))
    .attr("y", d => y(0)) // Start bars at the baseline
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(0)) // Start bars with height 0
    .attr("fill", d => color(d.genre))
    .attr("opacity", 0.5);

  // Loading Bars with Animation
  svg.selectAll("rect")
    .transition()
    .duration(500)
    .attr("y", d => y(d.rating))
    .attr("height", d => height - y(d.rating))
    .delay((d, i) => i * 100);

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
    .on("mouseover", function (event, d) {
      d3.select(this).style("opacity", 1);
      tooltip.style("opacity", 1);
    })
    .on("mousemove", function (event, d) {
      tooltip.html('<u>' + d.series_title + '</u>' +
        "<br>" + "Rating: " + d.rating +
        "<br>" + "Genre: " + d.genre)
        .style('top', (event.pageY + 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    })
    .on("mouseout", function (d) {
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
    .attr("y", (d, i) => height / 20 + i * (size + 5))
    .attr("width", size)
    .attr("height", size)
    .style("fill", d => color(d));

  svg.selectAll("labels")
    .data(genres)
    .enter()
    .append("text")
    .attr("x", width * 0.85 + size * 1.2)
    .attr("y", (d, i) => height / 20 + i * (size + 5) + (size * 0.5))
    .style("fill", "black")
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

}).catch(error => {
  console.error("Error loading the CSV file:", error);
});
