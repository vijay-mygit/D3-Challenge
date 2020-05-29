// Create the Space for the graph
var svgWidth = 960;
var svgHeight = 500;

// Define the Margins for the plot
var margin = {
    top: 40,
    right: 60,
    bottom: 100,
    left: 100
};

// Define the width and height of the actual plot
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// Creating SVG wrapper
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append svg group and shift it as per the requirement 
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Intial x and y axis
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// Function to create and update the x-scale upon clicking
function xScale(stateData,chosenXaxis) {
    var xLinearScale = d3.scaleLinear().range([0,width])
        .domain([d3.min(stateData,d=>d[chosenXaxis])* 0.8, d3.max(stateData,d=>d[chosenXaxis])* 1.1]);
    return xLinearScale;
}

// Function to create and update the y-scale upon clicking
function yScale(stateData,chosenYaxis) {
    var yLinearScale = d3.scaleLinear().range([height,0])
        .domain([d3.min(stateData,d=>d[chosenYaxis]), d3.max(stateData,d=>d[chosenYaxis])]);
    return yLinearScale;
}

// Function to create and update the x-axis when it is clicked
function renderXAxes(newXscale,xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);
    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// Function to create and update the y-axis when it is clicked
function renderYAxes(newYscale,yAxis) {
    var leftAxis = d3.axisLeft(newYscale);
    yAxis.transition()
        .duration(500)
        .call(leftAxis);

    return yAxis;
}

// Function to update the circles with the new axes with a transistion to new values.
function renderCircles(circlesGroup,newXscale,chosenXaxis,newYscale,chosenYaxis) {
    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXscale(d[chosenXaxis]))
        .attr("cy", d => newYscale(d[chosenYaxis]));

    return circlesGroup;
}

// Function to update the labels inside the circles with the new axes with a transistion to new values.
function renderCircleLabels(circleLabels,newXscale,chosenXaxis,newYscale,chosenYaxis) {
    circleLabels.transition()
        .duration(500)
        .attr("dx", d => newXscale(d[chosenXaxis]))
        .attr("dy", d => newYscale(d[chosenYaxis]));

    return circleLabels;
}

// Function to update circles group with new tooltip values
function updateTooltip(chosenXaxis,circlesGroup) {
    
    var xlabel;
    var ylabel;
    if (chosenXaxis === "poverty"){
        xlabel = "Poverty:";
    }
    else if (chosenXaxis === "age") {
        xlabel = "Age:";
    }
    else if (chosenXaxis === "income"){
        xlabel = "Income:";
    }
    if (chosenYaxis === "healthcare"){
        ylabel = "Lacks Healthcare:";
    }
    else if (chosenYaxis === "obesity") {
        ylabel = "Obesity:";
    }
    else if (chosenYaxis === "smokes"){
        ylabel = "Smokes:"
    }

    // Change the suffix of the text within the tooltip based on the x-axis selected.(Not all are %)
    if (chosenXaxis === "income"){
        var toolTip = d3.tip().attr("class","d3-tip")
        .offset([0,-10])
        .html(d => `${d.state}<br>${xlabel} $${d[chosenXaxis]}<br>${ylabel} ${d[chosenYaxis]}%`);
    circlesGroup.call(toolTip);
    }
    else if (chosenXaxis === "age"){
        var toolTip = d3.tip().attr("class","d3-tip")
        .offset([0,-10])
        .html(d => `${d.state}<br>${xlabel} ${d[chosenXaxis]} years<br>${ylabel} ${d[chosenYaxis]}%`);
    circlesGroup.call(toolTip);
    }    
    else {
        var toolTip = d3.tip().attr("class","d3-tip")
        .offset([0,-10])
        .html(d => `${d.state}<br>${xlabel} ${d[chosenXaxis]}%<br>${ylabel} ${d[chosenYaxis]}%`);
    circlesGroup.call(toolTip);

    }
    
    // Define mouseover and mouseout event
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })
        .on("mouseout", function(data,index){
            toolTip.hide(data);
        });
    return circlesGroup;
}

// Retreving the data from the csv
d3.csv("./assets/data/data.csv").then(function(stateData,err){
    if(err) throw err;

    console.log(stateData);

    // Parsing the required data
    stateData.forEach(function(d) {
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
        d.income = +d.income
        d.obesity = +d.obesity;
        d.age = +d.age;
        d.smokes = +d.smokes;        
    });
        
    // Setting the X and Y scale using the data from the csv
    var xLinearScale = xScale(stateData,chosenXaxis);
    var yLinearScale = yScale(stateData,chosenYaxis);

    // Creating the x and y axis using the data from the csv
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Appending the x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform",`translate(0,${height})`)
        .call(bottomAxis);

    // Appending the y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis",true)
        .call(leftAxis);

    // Creating and appending the initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r","12")
        .attr("stroke","black")
        .attr("fill","turquoise")
        .attr("opacity","0.5");

    // Creating and appending the initial text within the circles
    var circleLabels = chartGroup.selectAll(null)
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("font-size", 9)
        .attr("dx", d => xLinearScale(d[chosenXaxis]))
        .attr("dy", d => yLinearScale(d[chosenYaxis])+5)
        .style("text-anchor","middle");

    // Creating the group for the x axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform",`translate(${width/2},${height + 20})`);
    
    // Creating the 3 different x axis labels which get the values from the event listener
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value","poverty")
        .classed("active",true)
        .style("text-anchor","middle")
        .attr("font-weight",700) 
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value","age")
        .classed("inactive",true)
        .style("text-anchor","middle")
        .attr("font-weight",700) 
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value","income")
        .classed("inactive",true)
        .style("text-anchor","middle")
        .attr("font-weight",700) 
        .text("Household Income (Median)");

    // Creating the group for the y axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform","rotate(-90)");

    // Creating the 3 different y axis labels which get the values from the event listener
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height/2))
        .attr("value","healthcare")
        .classed("active",true)
        .style("text-anchor","middle")
        .attr("font-weight",700)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height/2))
        .attr("value","smokes")
        .classed("inactive",true)
        .style("text-anchor","middle")
        .attr("font-weight",700)
        .text("Smokes(%)");

    var obeseLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height/2))
        .attr("value","obesity")
        .classed("inactive",true)
        .style("text-anchor","middle")
        .attr("font-weight",700)
        .text("Obese(%)");

    // Intial value for the tooltip function
    updateTooltip(chosenXaxis,circlesGroup);

    // Event listener for the x axis labels
    labelsGroup.selectAll("text")
        .on("click",function(){

            // Obtaining the value of the selection
            var value = d3.select(this).attr("value");
            if(value !== chosenXaxis){
                chosenXaxis = value;

                // Updating all the functions with the new selected data

                // Update x scale for the new data
                xLinearScale = xScale(stateData,chosenXaxis);
                // Update x axis with transition
                xAxis = renderXAxes(xLinearScale,xAxis);
                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis);
                // Update the text within the circles with new x values
                circleLabels = renderCircleLabels(circleLabels,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis)
                // Update the tooltips with the new update data
                circlesGroup = updateTooltip(chosenXaxis,circlesGroup);
                

                // Changing the classes to change clicked axis label to bold text
                if (chosenXaxis === "age"){
                    ageLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    povertyLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    incomeLabel
                        .classed("active",false)
                        .classed("inactive",true);
                }
                else if (chosenXaxis === "poverty"){
                    ageLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    povertyLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    incomeLabel
                        .classed("active",false)
                        .classed("inactive",true);
                }
                else {
                    ageLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    povertyLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    incomeLabel
                        .classed("active",true)
                        .classed("inactive",false);
                }
            }
        });
    
    // Event listener for the Y axis labels
    // Performing the same steps for the Y axis
    ylabelsGroup.selectAll("text")
        .on("click",function(){

            var value = d3.select(this).attr("value");
            if(value !== chosenYaxis){
                chosenYaxis = value;

                yLinearScale = yScale(stateData,chosenYaxis);
                yAxis = renderYAxes(yLinearScale,yAxis);
                circlesGroup = renderCircles(circlesGroup,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis);
                circleLabels = renderCircleLabels(circleLabels,xLinearScale,chosenXaxis,yLinearScale,chosenYaxis)
                circlesGroup = updateTooltip(chosenXaxis,circlesGroup);

                if (chosenYaxis === "healthcare"){
                    healthcareLabel
                        .classed("active",true)
                        .classed("inactive",false);
                    smokesLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    obeseLabel
                        .classed("active",false)
                        .classed("inactive",true);
                }
                else if(chosenYaxis === "smokes"){
                    healthcareLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    smokesLabel
                        .classed("active",true)
                        .classed("inactive",false);  
                    obeseLabel
                        .classed("active",false)
                        .classed("inactive",true);                 
                }
                else {
                    healthcareLabel
                        .classed("active",false)
                        .classed("inactive",true);
                    smokesLabel
                        .classed("active",false)
                        .classed("inactive",true);  
                    obeseLabel
                        .classed("active",true)
                        .classed("inactive",false);
                }

            }
        });        

}).catch(err => console.log(err));