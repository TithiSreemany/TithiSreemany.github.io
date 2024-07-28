// Set the dimensions and margins of the graph
var margin = {top: 20, right: 250, bottom: 100, left: 90},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append the svg object to the div called 'chart'
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Color scale
var color = d3.scaleOrdinal()
  .domain(['Comedy', 'Family', 'Western', 'Drama', 'Adventure', 'Crime', 'Action', 'Mystery', 'Romance', 'Fantasy', 'Animation', 'Sci-Fi', 'Thriller'])
  .range(['#ff69b4', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#8dd3c7', '#9e9ac8']);

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
        console.log(d)
        tooltip.html("Genre: " + d.genre + "<br>Decade: " + d.decade + "<br>Count: " + d.count)
          .style('top', (d3.event.pageY + 10) + 'px')
          .style('left', (d3.event.pageX + 10) + 'px');
        return;
      default:
        tooltip.style("opacity", 0);
    }
}


// Load the data
d3.csv("tv_series.csv").then(function(data) {
  // Filter the data to only include relevant genres and ratings greater than 5
  var genres = ['Comedy', 'Family', 'Western', 'Drama', 'Adventure', 'Crime', 'Action', 'Mystery', 'Romance', 'Fantasy', 'Animation', 'Sci-Fi', 'Thriller'];
//   var genres = ['Comedy']
  data = data.filter(function(d) { return genres.includes(d.genre) && +d.rating > 5; });


//   Prepare data: group by genre and decade, and count number of series
  var nestedData = d3.nest()
    .key(function(d) { return d.genre; })
    .key(function(d) { return d.decade; })
    .rollup(function(v) { return v.length; })
    .entries(data);


  // Ensure each genre has a point for each decade
  var decades = ['1950-1960', '1960-1970', '1970-1980', '1980-1990', '1990-2000', '2000-2010', '2010-2020'];
  var decade_dict = {};
   nestedData.forEach(function(genreData) {
    // Filter out values that are not in the specified decades
    genreData.values = genreData.values.filter(function(d) {
      return decades.includes(d.key);
    });
    
    // make a dictionary for all decades iterating over all genres and find maxcount for each decade
    var decadeDict = {}
    decades.forEach(function(decade) {
        decadeDict[decade] = 0;
    });
    genreData.values.forEach(function(d) {
        decadeDict[d.key] = d.value;
    }
    );
    console.log(decadeDict);


    // Add missing decades with value 0
    decades.forEach(function(decade) {
      if (!genreData.values.some(function(d) { return d.key === decade; })) {
        genreData.values.push({key: decade, value: 0});
      }
    });
    // Sort values by decade
    genreData.values.sort(function(a, b) { return decades.indexOf(a.key) - decades.indexOf(b.key); });

    genreData.values.forEach(function(d) {
        // if d.value is not in decade_dict add it 
        if(!(d.key in decade_dict)){
            decade_dict[d.key] = {value : d.value, key : genreData.key};
        }
        if(d.value > decade_dict[d.key].value){
            decade_dict[d.key] = {value : d.value, key : genreData.key};
        }
      }); 
  });

//   console.log(nestedData)

  // declare a dict

  
  
  console.log(decade_dict);


  // Prepare the data for the line chart
  var lineData = genres.map(function(genre) {
    return {
      genre: genre,
      values: nestedData.find(function(d) { return d.key === genre; }).values.map(function(d) {
        return {decade: d.key, count: d.value, genre:genre};
      })
    };
  });

  // X axis
  var x = d3.scalePoint()
    .domain(decades)
    .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(lineData, function(c) { return d3.max(c.values, function(d) { return d.count; }); })])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  // Line generator
  var line = d3.line()
    .x(function(d) { return x(d.decade); })
    .y(function(d) { return y(d.count); });

  // Add lines
  var genreLines = svg.selectAll(".line")
    .data(lineData)
    .enter()
    .append("g")
    .attr("class", "line");




  genreLines.append("path")
    .transition()
    .duration(1000)
    .attr("fill", "none")
    .attr("stroke", function(d) { return color(d.genre); })
    .attr("stroke-width", 2.5)
    .attr("d", function(d) { return line(d.values); })
    .delay(function(d,i) { return (i*200); });

  // Add points
  genreLines.selectAll("circle")
    .data(function(d) { return d.values; })
    .enter()
    .append("circle")
    .attr("cx", function(d) { return x(d.decade); })
    .attr("cy", function(d) { return y(d.count); })
    .attr("r", 5)
    .attr("fill", function(d) { return color(this.parentNode.__data__.genre); });


    console.log(nestedData[1].values)

//create a list of count for a particular decade from nestedData
var countList = nestedData[1].values.map(function(d) { return d.value; });
// iterating over all genres and find genre where it has max_count of web series  do it for all decades and maintain a dict



 // Add text annotation for the highest value for the last decade
  var maxValue = 0 ;
  // iterate over all the values in the dict and find the max value
    for (const [key, value] of Object.entries(decade_dict)) {
        if(value.value > maxValue){
            maxValue = value.value;
        }
    }
//   maxValue = 1283
//   console.log(nestedData)
  console.log(maxValue);
  
  // Append text to the bar with the maximum value
  svg.selectAll("circle")
      .filter(function(d) { return d.count === maxValue; })
      .each(function(d) {
          console.log(d.count, maxValue);
          svg.append("text")
              .attr("x", x(d.decade) + x.bandwidth() / 2)  // Center the text on the bar
              .attr("y", y(d.count) - 20)  // Position the text above the bar
              .attr("dy", ".75em")
              .attr("text-anchor", "middle")
              .text(d.genre + " leads with highest count of "+ d.count + " releases")  // Display the value (modify according to your data)
              .attr("fill", "red");  // Set text color (can be modified)
      });


svg.selectAll("circle")
    .on("mouseover", function(d) { this.style.opacity = 1; tooltipFunction(d, "over");})
    .on("mousemove", function(d) { tooltipFunction(d, "move");})
    .on("mouseout", function(d) { this.style.opacity = 0.5; tooltipFunction(d, "out");})

  // Add a legend
  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      var height = 20;
      var offset = height * color.domain().length / 2;
      var horz = width + 100; // Move the legend further to the right
      var vert = i * height - offset + 150; // Move the legend down
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
