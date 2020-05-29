var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.csv("./assets/data/data.csv").then(function(stateData){

    console.log(stateData);

    stateData.forEach(function(d) {
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
    });
        

    var xLinearScale = d3.scaleLinear().range([0, width]).domain([8,d3.max(stateData, d=>d.poverty + 2)]);
    var yLinearScale = d3.scaleLinear().range([height, 0]).domain([4,d3.max(stateData, d=>d.healthcare + 2)]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.append("g")
        .attr("transform",`translate(0,${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r","15")
        .attr("stroke","black")
        .attr("fill","turquoise")
        .attr("opacity","0.5");

    var circleLabels = chartGroup.selectAll(null)
        .data(stateData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("font-size", 10)
        .attr("dx", d => xLinearScale(d.poverty))
        .attr("dy",d => yLinearScale(d.healthcare)+5)
        .style("text-anchor","middle");

    chartGroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height/2))
        .attr("dy","1em")
        .attr("class","axisText")
        .style("text-anchor","middle")
        .attr("font-weight",700)
        .text("Lacks Healthcare (%)");

    chartGroup.append("text")
        .attr("transform",`translate(${width/2},${height + margin.top +30})`)
        .attr("class","axisText")
        .style("text-anchor","middle") 
        .attr("font-weight",700)       
        .text("In Poverty (%)");
        

}).catch(err => console.log(err));
