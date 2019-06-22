// chart set up 
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3;
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;

// Create the svg wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");
var circRadius;
function circleGet() {
  if (width <= 530) {
    circRadius = 10;
  }
  else {
    circRadius = 15;
  }
}
circleGet();
svg.append("g").attr("class", "xTxt");
// xTxt will allows us to select the group without excess code.
var xTxt = d3.select(".xTxt");

// assgin xTxt at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function TxtRefresher() {
  xTxt.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
TxtRefresher();
// creating xTxt to append three text SVG files, 
// with y coordinates specified to space out the values.
// first, "Poverty"
xTxt
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
// second "Age"
xTxt
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
// third "Income"
xTxt
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// B) Left Axis
// identifing the variables.
var leftTxtX = margin + tPadLeft;
var leftTxtY = (height + labelArea) / 2 - labelArea;

// adding a second label group, for the axis left of the chart.
svg.append("g").attr("class", "yTxt");

//assgin yTxt to allows the selection of the group without excess code.
var yTxt = d3.select(".yTxt");

// the same as previously, we nest the group's transform attr in a function
// to make changing it on window change an easy operation.
function yTxtRefresher() {
  yTxt.attr(
    "transform",
    "translate(" + leftTxtX + ", " + leftTxtY + ")rotate(-90)"
  );
}
yTxtRefresher();
// first "Obesity"
yTxt
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");
// second "Smokes"
yTxt
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");
// third "Lacks Healthcare"
yTxt
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");
// Importing data csv file.
d3.csv("assets/data/data.csv").then(function(data) {
  visualize(data);
});
// Creating visualization function
function visualize(theData) {
  var curX = "poverty";
  var curY = "obesity";
  // This function allows us to set up tooltip rules (see d3-tip.js).
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      // x key
      var theX;
      // Grab the state name.
      var theState = "<div>" + d.state + "</div>";
      // Snatch the y value's key and value.
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
      // If the x key is poverty
      if (curX === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      }
      else {
        // Otherwise
        // Grab the x key and a version of the value formatted to include commas after every third digit.
        theX = "<div>" +
          curX +
          ": " +
          parseFloat(d[curX]).toLocaleString("en") +
          "</div>";
      }
      // Display what we capture.
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip);
  // a. change the min and max for x
  function xMinMax() {
    // min will grab the smallest datum from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  // b. change the min and max for y
  function yMinMax() {
    // min will grab the smallest datum from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // .max will grab the largest datum from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  // c. change the classes (and appearance) of label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Part 3: Instantiate the Scatter Plot
  // ====================================
  // This will add the first placement of our data and axes to the scatter plot.

  // First grab the min and max values of x and y.
  xMinMax();
  yMinMax();

  // With the min and max values now defined, we can create our scales.
  // Notice in the range method how we include the margin and word area.
  // This tells d3 to place our circles in an area starting after the margin and word area.
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverses due to how d3 calc's y-axis placement
    .range([height - margin - labelArea, margin]);

  // We pass the scales into the axis methods to create the axes.
  // Note: D3 4.0 made this a lot less cumbersome then before. Kudos to mbostock.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);
  // Determine x and y tick counts.
  // Note: Saved as a function for easy mobile updates.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");
  // grouping for the dots and the labels.
  var theCircles = svg.selectAll("g theCircles").data(theData).enter();
  // appending circles for each row of data.
  theCircles
    .append("circle")
    // These attr's will specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // applying Hover rules to create mouse moving lable 
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    // applying mouseout rules to take out the mousae moving lable
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });
  //creating matching lables for the circles on the graph
  theCircles
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    // placing a text inside bubles 
    .attr("dx", function(d) {
      return xScale(d[curX]);
    })
    //choosing the size of the text inside the bubles 
    .attr("dy", function(d) {
      return yScale(d[curY]) + circRadius / 3;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // applying the same Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    // applying the same rules as previously. 
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  //Make the Graph Dynamic
  // This section will allow the user to click on any label
  // and display the related data.
  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);
    // only running inactive lables. 
    if (self.classed("inactive")) {
      // recall the name and axis saved in label.
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");
      if (axis === "x") {
        curX = name;
        xMinMax();
        xScale.domain([xMin, xMax]);
        svg.select(".xAxis").transition().duration(300).call(xAxis);
        // updating the location of the state circles.
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });
        // changing the location of the state texts
        d3.selectAll(".stateText").each(function() {
          // give each state text the same motion as its related circle.
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[curX]);
            })
            .duration(300);
        });
        // change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        curY = name;
        yMinMax();
        // Update the domain of y.
        yScale.domain([yMin, yMax]);
        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);
        // same as previous loop, but we changing the states circle this time.
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[curY]);
            })
            .duration(300);
        });
        //change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          // repeating the same process fo Y axis
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[curY]) + circRadius / 3;
            })
            .duration(300);
        });
        // changing the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });
}
