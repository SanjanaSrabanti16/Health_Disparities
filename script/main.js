var data;
var zipSelect;


var color = d3.scale.quantile()
        .range(['#fef0d9', '#fdd49e',
               '#fdbb84', '#fc8d59', '#e34a33']);

d3.csv("data/color.csv", function(dataTotal){
    data = dataTotal;
    data.forEach(function(d) {
        d.total = +d.total;
        //console.log(d.total);
    });


    color.domain([
        d3.min(data, function(d){ return d.total; }),
        d3.max(data, function(d){ return d.total; })
    ]);
});


//Load in GeoJSON data
d3.json("data/mapChicago2.geojson", function(json) {

    //map path and projection

    //Width and height
    var width = $("#map-layer").width();
    //console.log(width);
    var height = $("#map-layer").height();
    var center = [-87.623177, 41.881832];
    var scale = 180;


    var projection = d3.geo.mercator().center(center)
        .scale(width *120)
        .translate([width/1.5, height/2.5]);
    var path = d3.geo.path().projection(projection);


    //Create SVG element
    var svg = d3.select(".map")
        .attr("height", height);

    //Create a tooltip
    var tooltip = d3.select("#tooltip-map")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append('g')
        .selectAll('path')
        .data(json.features)
        .enter().append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('class', 'region-path')
        .style("fill", function(d){
            var val = (d.properties.total/ d.properties.totalPopulation) * 100000;
                    color.domain([0,30]);
                    return color(val);
        })
        .style("stroke", "#636363")
        .style('stroke-width', "1px")
        .on('mouseover', function(d){
            tooltip.transition()
                    .duration(200)
                    .style("opacity",0.9);
            tooltip.html("Zip: \n" + d.properties.zip + "<br>" + "Total Cancer People: " + d.properties.total + "<br>" + "Total Population: " + d.properties.totalPopulation + "<br>"
                        + "Male: " + d.properties.male + "<br>" + "Female: " + d.properties.female)  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);

        })
        .on('click',function(d){

            d3.selectAll(".clicked1")
                        .classed("clicked1", false)
                        .style('stroke', '#636363')
                        .style('stroke-width', "1px");

            d3.select(this)
                        .classed("clicked1", true)
                        .style('stroke', '#1200b1')
                        .style('stroke-width', "4px");
               
            var zipSelect1 = d.properties.zip;

            educationChart(zipSelect1, '#insurancePlot1');
            groceryNumber(zipSelect1, '#groceryNumber1');
            zipHeading(zipSelect1, '#zipPlot1');
            percincomeChart(zipSelect1, '#percapitaIncome1');

        })
        
    legendUpdate();

        //add a legend
    function legendUpdate(){
        var w = 120, h= 200;
        d3.selectAll('.legend').remove();
        d3.selectAll('.cancer-legend-heading').remove();

        var key = d3.select(".map")
            .append("g")
            .attr("width",w)
            .attr("height",h)
            .attr("class","legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id","gradient")
            .attr("x1","100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#e34a33")
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#fef0d9")
            .attr("stop-opacity", 1);




        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            // .style("font-color","2px")
            .attr("transform", "translate(30,380)");

         var y = d3.scale.linear()
                .range([h, 0])
                .domain([0,100]);
        var yAxis = d3.svg.axis().scale(y).orient("right").ticks(8).tickSize(8,0);


        key.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(42,380)")
            .call(yAxis);

    }

});
//end of d3 json file


function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    })
}

//education value
function educationChart(zipSelect, container){

    d3.select(container).selectAll('.educationClass').remove();
    d3.selectAll('.income-heading').remove();

    d3.csv('data/filteredEducationTotal.csv', function(education){
        var educationPercentage = 0;
        if(zipSelect== 77030)
        {
            educationPercentage = ((6117/10258)*100).toFixed(2);            
        }
        else
        {
            for(var i=0;i<education.length;i++)
        {
            if(education[i].zip==zipSelect)
            {
                educationPercentage = ((education[i].total_educated_population/education[i].totalPopulation)*100).toFixed(2);
            }
        }
        }

        var widthIncome = $(container).width();
        d3.select(container)
            .append('svg')
            .attr('width', $(container).width())
            .attr('height',$(container).height())
            .attr('class','educationClass')
            .append('text')
            .attr('x', "50%")
            .attr('y', "70%")
            .style("text-anchor", "middle")
            .attr('fill', 'black')
            .text(function (d) {
                if(educationPercentage==0)
                {
                 return "Educated People: No information"  
                }
                else
                {
                    return "Educated People: " + educationPercentage + "%"
                } 
            })

    })
}

//per capita income
function percincomeChart(zipSelect, container){

    d3.select(container).selectAll('.incomeNumber').remove();
    d3.selectAll('.income-heading').remove();

    d3.csv('data/income.csv', function(income){
        var percapitaIncome = 0;

        if(zipSelect==77030)
        {
            percapitaIncome = 63823;
        }

        for(var i=0;i<income.length;i++)
        {
            if(income[i].zipcode==zipSelect)
            {
                percapitaIncome = income[i].income;
            }
        }
 
        var widthIncome = $(container).width();
        d3.select(container)
            .append('svg')
            .attr('width', $(container).width())
            .attr('height',$(container).height())
            .attr('class','incomeNumber')
            .append('text')
            .attr('x', "50%")
            .attr('y', "70%")
            .style("text-anchor", "middle")
            .attr('fill', 'black')
            .text(function (d) {
                if(percapitaIncome.length==0)
                {
                 return "Per Capita Income: No information"  
                }
                else
                {
                    return "Per Capita Income: " + percapitaIncome + "$" 
                } 
            })

    })
}

//insurance Chart
function insuranceChart(zipSelect, container){

    d3.select(container).selectAll('.insuranceChart').remove();




    d3.csv('data/filteredInsurance.csv', function(insurance){

        var insValue;
        for (var i = 0; i < insurance.length; i++) {
            if (insurance[i]['zip']==zipSelect){
                insValue = insurance[i]['percentInsured'];
            }
        }


        var margin = {
            top: 15,
            right: 10,
            bottom: 50,
            left: 80
        };

        d3.select(container)
            .append('svg')
            .attr('width', $(container).width())
            .attr('height',$(container).height())
            .attr('class','insuranceChart')
            .append("text")
            .attr('x', "50%")
            .attr('y', "70%")
            .style("text-anchor", "middle")
            .text(function(d){
                return "People Insured: " + insValue + "%";
            })
    })
}


//    show grocery in details
function groceryNumber(zipSelect,container) {

    d3.select(container).selectAll('.groceryNumber').remove();

    d3.csv('data/groceryStores.csv', function (grocery) {

        groceryByZIP = d3.nest()
            .key(function (d) { return d.ZIPCODE })
            .rollup(function (v) { return v.length })
            .entries(grocery);

        var groceryValue;
        if(zipSelect==77030)
        {
            groceryValue = 4;
        }
        else
        {
            for (var i = 0; i < groceryByZIP.length; i++){
            if (groceryByZIP[i]["key"] == zipSelect){
                groceryValue = groceryByZIP[i]["values"];
                }
            }
        }
        //console.log(groceryValue);


        d3.select(container)
            .append('svg')
            .attr('width', $(container).width())
            .attr('height',$(container).height())
            .attr('class','groceryNumber')
            .append("text")
            .attr('x', "50%")
            .attr('y', "70%")
            .style("text-anchor", "middle")
            // .attr('fill', '#006d2c')
            .text(function(d){
                // console.log(groceryValue)
                if(typeof groceryValue === "undefined"){
                    return "Grocery Stores: " + 0;
                }
                else{
                return "Grocery Stores: " + groceryValue;}
            });

    })
}
//show grocery in details end



//Race distribution chart starts
function raceChartUIC(zipSelect,container) {
    var p = zipSelect;

    d3.selectAll('.cohortPlot').remove();
    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
    // d3.select('#comparePlot1').selectAll('.racePlot').remove();
    // d3.select('#comparePlot2').selectAll('.racePlot').remove();
    d3.selectAll('.compareLabel1').remove();
    d3.selectAll('.circleLegend').remove();

    cohortHeading('UIC', '#UICtext');

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var raceChart = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "racePlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var yScale = d3.scale.linear()
        .rangeRound([0, height]);

    var color = d3.scale.ordinal()
        .range(["#8dd3c7","#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"]);


    var stack = d3.layout.stack();
    var segmentsStacked = ['White', 'Black', 'American Indian', 'Hispanic', 'Asian', 'Others'];

    d3.csv("data/demographicData.csv", function(race) {


        var raceOriginalDataZipSelect;

        var raceCount = [];
        for(var i =0; i<race.length;i++){

            if((race[i]["cohort"]) == p){
                //console.log(race[i]["cohort"]);
                var total = +(race[i]["White"]) + +(race[i]["Black"]) + +(race[i]["American Indian"]) + +(race[i]["Hispanic"]) +
                 +(race[i]["Asian"]) + +(race[i]["Others"]);

                raceOriginalDataZipSelect = race[i];
                race[i]["White"] = ((+(race[i]["White"])/total) *100).toFixed(2);
                race[i]["Black"] = ((+(race[i]["Black"])/total) *100).toFixed(2);
                race[i]["American Indian"] = ((+(race[i]["American Indian"])/total) *100).toFixed(2);
                race[i]["Hispanic"] = ((+(race[i]["Hispanic"])/total) *100).toFixed(2);
                race[i]["Asian"] = ((+(race[i]["Asian"])/total) *100).toFixed(2);
                race[i]["Others"] = ((+(race[i]["Others"])/total) *100).toFixed(2);

                raceCount.push(race[i]);
            }
        }
        //console.log(raceCount);

        var layers = d3.layout.stack()(segmentsStacked.map(function (c) {
            return raceCount.map(function (d) {
                return {x: +[d.cohort], y: +d[c], component: c};
            });
        }));
        //console.log(layers);



    color.domain(segmentsStacked);

        var tooltipRacePlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    yScale.domain([0, 100]).nice();
    xScale.domain(layers[0].map(function(d) { return d.x; }));


       d3.max(layers, function(d) {return d[0]["y"] + d[0]["y0"];})


        var layer = raceChart.selectAll(".layers")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d,i) {
                return color(i);
        });


    layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) {return yScale(d.y0 ); })
        .attr("height", function(d) {return yScale(d.y + d.y0); })
        .attr("width", xScale.rangeBand())
        .on("mouseover", function (d) {

            tooltipRacePlot.transition()
                .duration(200)
                .style("opacity",0.9);
                var raceTooltipValue = (d["y"] * (total/100)).toFixed(0);

                tooltipRacePlot.html(d["component"] + " : " + raceTooltipValue )
                .style("left", (d3.event.pageX-30) + "px")
                .style("top", (d3.event.pageY+18) + "px");
        })
        .on("mouseout", function(d) {
            tooltipRacePlot.transition()
                .duration(500)
                .style("opacity", 0);

        });;



        var dataL = 0;
        var offset = 40;

    var raceLegend = d3.select('#raceLabel1')
        .append('svg')
        .attr('width', $('#raceLabel1').width())
        .attr('height',$('#raceLabel1').height())
        .attr('class','raceLabel')
        .append("g")
        .attr("transform", "translate(25," + margin.top + ")")
        .selectAll("g")
        .data(segmentsStacked)
        .enter().append("g")
        .attr("transform", function(d, i) {
            if (i === 0) {
                dataL = d.length + offset;
                return "translate(5,0)"
            } else {
                var newdataL = dataL;
                // console.log(d.length)
                dataL +=  d.length + offset;
                return "translate(5," + (newdataL) + ")"
            }

        });

        raceLegend.append("rect")
            .attr("x", -5)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        // Create text for each legend g
        // Use the data that it inherts to create the SVG text
        raceLegend.append("g")
            .attr("transform", "translate(20,0)")
            .append("text")
            .attr("class", "text")
            .attr("text-anchor", "start")
            .attr("x", 10)
            .attr("y", 10)
            .attr("dy", "0.25em")
            .text(function(d) { return d; });
            //.call(wrap, offset);

    });

}
//UIC Race distribution chart ends

//MDACC Race chart
function raceChartMDACC(zipSelect,container) {
    var p = zipSelect;

    d3.selectAll('.cohortPlot').remove();
    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
    // d3.select('#comparePlot1').selectAll('.racePlot').remove();
    // d3.select('#comparePlot2').selectAll('.racePlot').remove();
    d3.selectAll('.compareLabel1').remove();
    d3.selectAll('.circleLegend').remove();

    cohortHeading('MDACC', '#MDACCtext');

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var raceChart = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "racePlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var yScale = d3.scale.linear()
        .rangeRound([0, height]);

    var color = d3.scale.ordinal()
        .range(["#8dd3c7","#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"]);


    var stack = d3.layout.stack();
    var segmentsStacked = ['White', 'Black', 'American Indian', 'Hispanic', 'Asian', 'Others'];

    d3.csv("data/demographicData.csv", function(race) {


        var raceOriginalDataZipSelect;

        var raceCount = [];
        for(var i =0; i<race.length;i++){

            if((race[i]["cohort"]) == p){
                //console.log(race[i]["cohort"]);
                var total = +(race[i]["White"]) + +(race[i]["Black"]) + +(race[i]["American Indian"]) + +(race[i]["Hispanic"]) +
                 +(race[i]["Asian"]) + +(race[i]["Others"]);

                raceOriginalDataZipSelect = race[i];
                race[i]["White"] = ((+(race[i]["White"])/total) *100).toFixed(2);
                race[i]["Black"] = ((+(race[i]["Black"])/total) *100).toFixed(2);
                race[i]["American Indian"] = ((+(race[i]["American Indian"])/total) *100).toFixed(2);
                race[i]["Hispanic"] = ((+(race[i]["Hispanic"])/total) *100).toFixed(2);
                race[i]["Asian"] = ((+(race[i]["Asian"])/total) *100).toFixed(2);
                race[i]["Others"] = ((+(race[i]["Others"])/total) *100).toFixed(2);

                raceCount.push(race[i]);
            }
        }
        //console.log(raceCount);

        var layers = d3.layout.stack()(segmentsStacked.map(function (c) {
            return raceCount.map(function (d) {
                return {x: +[d.cohort], y: +d[c], component: c};
            });
        }));
        //console.log(layers);



    color.domain(segmentsStacked);

        var tooltipRacePlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    yScale.domain([0, 100]).nice();
    xScale.domain(layers[0].map(function(d) { return d.x; }));


       d3.max(layers, function(d) {return d[0]["y"] + d[0]["y0"];})


        var layer = raceChart.selectAll(".layers")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d,i) {
                return color(i);
        });


    layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) {return yScale(d.y0 ); })
        .attr("height", function(d) {return yScale(d.y + d.y0); })
        .attr("width", xScale.rangeBand())
        .on("mouseover", function (d) {

            tooltipRacePlot.transition()
                .duration(200)
                .style("opacity",0.9);
                var raceTooltipValue = (d["y"] * (total/100)).toFixed(0);

                tooltipRacePlot.html(d["component"] + " : " + raceTooltipValue )
                .style("left", (d3.event.pageX-30) + "px")
                .style("top", (d3.event.pageY+18) + "px");
        })
        .on("mouseout", function(d) {
            tooltipRacePlot.transition()
                .duration(500)
                .style("opacity", 0);

        });;

    });

}
//MDACC Race chart end

//UIC gender chart start
function genderChartUIC(zipSelect,container) {
    var p = zipSelect;

    d3.selectAll('.cohortPlot').remove();
    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
    // d3.select('#comparePlot1').selectAll('.racePlot').remove();
    // d3.select('#comparePlot2').selectAll('.racePlot').remove();
    d3.selectAll('.compareLabel1').remove();
    d3.selectAll('.circleLegend').remove();

    cohortHeading('UIC', '#UICtext');

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var genderChart = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "racePlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var yScale = d3.scale.linear()
        .rangeRound([0, height]);

    var color = d3.scale.ordinal()
        .range(["#b3cde3","#fbb4ae","#fdb462"]);


    var stack = d3.layout.stack();
    var segmentsStacked = ['Male', 'Female', 'NAN'];

    d3.csv("data/demographicData.csv", function(gender) {


        var genderOriginalDataZipSelect;

        var genderCount = [];
        for(var i =0; i<gender.length;i++){

            if((gender[i]["cohort"]) == p){
                //console.log(gender[i]["cohort"]);
                var total = +(gender[i]["Male"]) + +(gender[i]["Female"]) + +(gender[i]["NAN"]);

                genderOriginalDataZipSelect = gender[i];
                gender[i]["Male"] = ((+(gender[i]["Male"])/total) *100).toFixed(2);
                gender[i]["Female"] = ((+(gender[i]["Female"])/total) *100).toFixed(2);
                gender[i]["NAN"] = ((+(gender[i]["NAN"])/total) *100).toFixed(2);
        
                genderCount.push(gender[i]);
            }
        }
        //console.log(genderCount);

        var layers = d3.layout.stack()(segmentsStacked.map(function (c) {
            return genderCount.map(function (d) {
                return {x: +[d.cohort], y: +d[c], component: c};
            });
        }));
        //console.log(layers);



    color.domain(segmentsStacked);

        var tooltipgenderPlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    yScale.domain([0, 100]).nice();
    xScale.domain(layers[0].map(function(d) { return d.x; }));


       d3.max(layers, function(d) {return d[0]["y"] + d[0]["y0"];})


        var layer = genderChart.selectAll(".layers")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d,i) {
                return color(i);
        });


    layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) {return yScale(d.y0 ); })
        .attr("height", function(d) {return yScale(d.y + d.y0); })
        .attr("width", xScale.rangeBand())
        .on("mouseover", function (d) {

            tooltipgenderPlot.transition()
                .duration(200)
                .style("opacity",0.9);
                var genderTooltipValue = (d["y"] * (total/100)).toFixed(0);

                tooltipgenderPlot.html(d["component"] + " : " + genderTooltipValue )
                .style("left", (d3.event.pageX-30) + "px")
                .style("top", (d3.event.pageY+18) + "px");
        })
        .on("mouseout", function(d) {
            tooltipgenderPlot.transition()
                .duration(500)
                .style("opacity", 0);

        });;



        var dataL = 0;
        var offset = 40;

    var genderLegend = d3.select('#raceLabel1')
        .append('svg')
        .attr('width', $('#raceLabel1').width())
        .attr('height',$('#raceLabel1').height())
        .attr('class','raceLabel')
        .append("g")
        .attr("transform", "translate(25," + margin.top + ")")
        .selectAll("g")
        .data(segmentsStacked)
        .enter().append("g")
        .attr("transform", function(d, i) {
            if (i === 0) {
                dataL = d.length + offset;
                return "translate(5,0)"
            } else {
                var newdataL = dataL;
                // console.log(d.length)
                dataL +=  d.length + offset;
                return "translate(5," + (newdataL) + ")"
            }

        });

        genderLegend.append("rect")
            .attr("x", -5)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        // Create text for each legend g
        // Use the data that it inherts to create the SVG text
        genderLegend.append("g")
            .attr("transform", "translate(20,0)")
            .append("text")
            .attr("class", "text")
            .attr("text-anchor", "start")
            .attr("x", 10)
            .attr("y", 10)
            .attr("dy", "0.25em")
            .text(function(d) { return d; });
            //.call(wrap, offset);

    });

}//UIC Gender end


//MDACC gender chart
function genderChartMDACC(zipSelect,container) {
    var p = zipSelect;

    d3.selectAll('.cohortPlot').remove();
    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
    // d3.select('#comparePlot1').selectAll('.racePlot').remove();
    // d3.select('#comparePlot2').selectAll('.racePlot').remove();
    d3.selectAll('.compareLabel1').remove();
    d3.selectAll('.circleLegend').remove();

    cohortHeading('MDACC', '#MDACCtext');

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var genderChart = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "racePlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var yScale = d3.scale.linear()
        .rangeRound([0, height]);

    var color = d3.scale.ordinal()
        .range(["#b3cde3","#fbb4ae","#fdb462"]);


    var stack = d3.layout.stack();
    var segmentsStacked = ['Male', 'Female', 'NAN'];

    d3.csv("data/demographicData.csv", function(gender) {


        var genderOriginalDataZipSelect;

        var genderCount = [];
        for(var i =0; i<gender.length;i++){

            if((gender[i]["cohort"]) == p){
                //console.log(gender[i]["cohort"]);
                var total = +(gender[i]["Male"]) + +(gender[i]["Female"]) + +(gender[i]["NAN"]);

                genderOriginalDataZipSelect = gender[i];
                gender[i]["Male"] = ((+(gender[i]["Male"])/total) *100).toFixed(2);
                gender[i]["Female"] = ((+(gender[i]["Female"])/total) *100).toFixed(2);
                //gender[i]["NAN"] = ((+(gender[i]["NAN"])/total) *100).toFixed(2);
                gender[i]["NAN"] = 0;
        
                genderCount.push(gender[i]);
            }
        }
        //console.log(genderCount);

        var layers = d3.layout.stack()(segmentsStacked.map(function (c) {
            return genderCount.map(function (d) {
                return {x: +[d.cohort], y: +d[c], component: c};
            });
        }));
        //console.log(layers);



    color.domain(segmentsStacked);

        var tooltipgenderPlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

    yScale.domain([0, 95]);
    xScale.domain(layers[0].map(function(d) { return d.x; }));


       d3.max(layers, function(d) {return d[0]["y"] + d[0]["y0"];})


        var layer = genderChart.selectAll(".layers")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d,i) {
                return color(i);
        });


    layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d) { return xScale(d.x); })
        .attr("y", function(d) {return yScale(d.y0 ); })
        .attr("height", function(d) {
            if(d.y0==100)
            {
                return yScale(d.y + 12.11);
            }
            else
            {
                return yScale(d.y + d.y0);
            }
        })
        .attr("width", xScale.rangeBand())
        .on("mouseover", function (d) {

            tooltipgenderPlot.transition()
                .duration(200)
                .style("opacity",0.9);
                var genderTooltipValue = (d["y"] * (total/100)).toFixed(0);

                tooltipgenderPlot.html(d["component"] + " : " + genderTooltipValue )
                .style("left", (d3.event.pageX-30) + "px")
                .style("top", (d3.event.pageY+18) + "px");
        })
        .on("mouseout", function(d) {
            tooltipgenderPlot.transition()
                .duration(500)
                .style("opacity", 0);

        });;
    });

}
//MDACC gender chart end

//UIC and MDACC comparison circle plot
function cohortCompare(container) {

    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
    d3.selectAll('#racePlot1').remove();
    d3.selectAll('#racePlot2').remove();
     // d3.selectAll('#comparePlot1').remove();
     // d3.selectAll('#comparePlot2').remove();
    d3.selectAll('.compareLabel1').remove();
    d3.selectAll('.circleLegend').remove();
    d3.selectAll('.cohortPlot').remove();

    cohortHeading('UIC', '#UICtext');
    

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var comparePlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "cohortPlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv('data/comparison.csv',function(circledata){

        var c1 = [];
        
        c1.push(circledata[0].T1,circledata[0].T2,circledata[0].T3,circledata[0].T4,circledata[0].Nx,circledata[0].N0,
        circledata[0].N1,circledata[0].N2,circledata[0].N3,circledata[0].ConcomitantChemoradiation,
        circledata[0].Radiation,circledata[0].OtherTreatment);

        var tooltipcomarePlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

        comparePlot.selectAll("circle").data(c1)
            .enter()
            .append('circle')
            .attr('r', function(d){
            //console.log(d);
            if(d>0 && d<=50)
            {
                return "8px";
            }
            else if (d>50 && d<=100)
            {
                return "12px";
            }
            else if (d>100)
            {
                return "18px"
            }
            //return d*.2
        })
            .attr('cy', function(d,i){
            //  console.log(i)
            var xgap = (12+42*i);
            //console.log(xgap);
            return xgap;
        })
            .attr('cx', width/2)
            .attr("fill","#8dd3c7")
            .attr("opacity", 1)
            .on('mouseover', function(d){
                tooltipcomarePlot.transition()
                        .duration(200)
                        .style("opacity",0.9);
                tooltipcomarePlot.html("Total Patient: \n" + d + "<br>" )  
                        .style("left", (d3.event.pageX) + "px")   
                        .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltipcomarePlot.transition()
                        .duration(500)
                        .style("opacity", 0);

            })

    var textdata = ['T1','T2','T3','T4','Nx','N0','N1','N2','N3','Concomitant Chemoradiation','Radiation','Other Treatment'];
    var compareLegend = d3.select('#compareLabel1')
            .append('svg')
            .attr('width', $('#compareLabel1').width())
            .attr('height',$('#compareLabel1').height())
            .attr('class','compareLabel1')
            .append("g")
            .attr("transform", "translate(25," + margin.top + ")")
            .selectAll("g")
            .data(textdata)
            .enter().append('text')
            .text(function(d){
                //console.log(d)
                return d
                //return Math.round((Math.pow(d,2))*Math.PI)
            })
            .attr('font-size', 12)
            .attr('fill', 'black')
            .attr('x', width)
            .attr('y', function(d,i){
                //  console.log(i)
                var xgap = (20+42*i);
                //console.log(xgap);
                return xgap;
            })
            .attr('text-anchor', 'middle')

    //legend
    var size = d3.scale.sqrt()
        .domain([0, 750])  // What's in the data, let's say it is percentage
        .range([0, 40])


    // Add legend: circles
    var valuesToShow = [50, 100, 600]
    var value = [20,70,180]
    var xCircle = 50
    var xLabel = 120
    var yCircle = 610

    var circleLegend = d3.select('#circleLegend')
        .append('svg')
        .attr('width', $('#circleLegend').width())
        .attr('height',$('#circleLegend').height())
        .attr('class','circleLegend')
        .attr("transform", "translate(20," + margin.top + ")")
        .selectAll("g")
        .data(value)
        .enter()
        .append("circle")
        .attr("cx", width - 40)
        .attr("cy", function(d){ return 40 - size(d)} )
        .attr("r", function(d){ return size(d) })
        .style("fill", "none")
        .attr("stroke", "black")
        

        // Add legend: segments
    circleLegend.append("line")
    .attr('x1', function(d){ return width - 75  } )
    .attr('x2', width -60)
    .attr('y1', function(d,i){ return 40 - size(d) -i*4 } )
    .attr('y2', function(d,i){ return 40 - size(d) -i*4} )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

    })//comparison file load

    

}
//UIC and MDACC comparison circle plot end

//Cohort Mdacc circle
function cohortCompare2(container) {

    d3.select(container).selectAll('.racePlot').remove();
    d3.selectAll('.raceHeading').remove();
    d3.selectAll('.raceLabel').remove();
     d3.selectAll('#racePlot1').remove();
     d3.selectAll('#racePlot2').remove();

     cohortHeading('MDACC', '#MDACCtext');


    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $(container).width() - margin.left - margin.right,
        height = $(container).height() - margin.top - margin.bottom;


    var comparePlot = d3.select(container)
        .append("svg")
        .attr("width", $(container).width())
        .attr("height", $(container).height())
        .attr("class", "cohortPlot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv('data/comparison.csv',function(circledata){

        var c2 = [];
        
        c2.push(circledata[1].T1,circledata[1].T2,circledata[1].T3,circledata[1].T4,circledata[1].Nx,circledata[1].N0,
        circledata[1].N1,circledata[1].N2,circledata[1].N3,circledata[1].ConcomitantChemoradiation,
        circledata[1].Radiation,circledata[1].OtherTreatment);

        var tooltipcomarePlot = d3.select("#tooltip-race-plot")
            .attr("class", "tooltip")
            .style("opacity", 0);

        comparePlot.selectAll("circle").data(c2)
            .enter()
            .append('circle')
            .attr('r', function(d){
            //console.log(d);
            if(d>0 && d<=50)
            {
                return "8px";
            }
            else if (d>50 && d<=100)
            {
                return "12px";
            }
            else if (d>100)
            {
                return "18px"
            }
            //return d*.2
        })
            .attr('cy', function(d,i){
            //  console.log(i)
            var xgap = (12+41.5*i);
            //console.log(xgap);
            return xgap;
        })
            .attr('cx', width/2)
            .attr("fill","#bebada")
            .attr("opacity", 1)
            .on('mouseover', function(d){
                tooltipcomarePlot.transition()
                        .duration(200)
                        .style("opacity",0.9);
                tooltipcomarePlot.html("Total Patient: \n" + d + "<br>" )  
                        .style("left", (d3.event.pageX) + "px")   
                        .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltipcomarePlot.transition()
                        .duration(500)
                        .style("opacity", 0);

            })

    })//comparison file load

    

}
//MDACC cohort circle end


//View Heading
function zipHeading(zipSelect, container){

    d3.select(container).selectAll('.zipHeading').remove();


    d3.select(container)
        .append('svg')
        .attr('width',$(container).width())
        .attr('height',$(container).height())
        .attr('class','zipHeading')
        .append("text")
        .attr('x', "50%")
        .attr('y', "40%")
        .style("text-anchor", "middle")
        .text(function(d){
            return "Zip: " + zipSelect;
        });

}

function cohortHeading(cohort, container){

    d3.select(container).selectAll('.cohortHeading').remove();


    d3.select(container)
        .append('svg')
        .attr('width',$(container).width())
        .attr('height',$(container).height())
        .attr('class','cohortHeading')
        .append("text")
        .attr('x', "50%")
        .attr('y', "40%")
        .style("text-anchor", "middle")
        .attr('fill', 'black')
        .attr('font-size', "large")
        .text(function(d){
            return cohort;
        });

}

//UIC and Mdacc patient individual
var patientID = 10183;
var patientID1 = 947374;

d3.csv('data/patient_info.csv', function (patientdata){
  var pID = [];
  for(var i=0;i<patientdata.length;i++)
  {
    pID.push(patientdata[i].Dummy_ID);
  }
  var dropdownChange = function() {
        var zipSelect1 = 77030;
        var patientID = d3.select(this).property('value');
        //updateMap(cancerType);
        //cohortHeading('MDACC Patient', '#cohortName2');
        getLink(patientID,'#cancerPlots2');
        zipHeading(zipSelect1, '#zipPlot2');
         educationChart(zipSelect1, '#insurancePlot2');
          groceryNumber(zipSelect1, '#groceryNumber2');
         percincomeChart(zipSelect1, '#percapitaIncome2')

         d3.selectAll(".clicked1")
        	.classed("clicked1", false)
        	.style('stroke', '#636363')
        	.style('stroke-width', "1px");

    	d3.selectAll(".clicked2")
        	.classed("clicked2", false)
        	.style('stroke', '#636363')
        	.style('stroke-width', "1px");
    };

        var dropdown = d3.select("#MDACCdropdown")
        .append('g')
        .attr("width", 10)
        .attr("height", 10)
        .attr("class","dropdown")
        .attr("transform", "translate(0,20)")
        .insert("select", "svg")
        .on("change", dropdownChange);

    dropdown.selectAll("option")
        .data(pID)
        .enter().append("option")
        .attr("value", function (d) {return d; })
        .text(function (d) {
            return "MDACC Patient " +d;
        });
})//MDACC dropdown end

function getLink(patientID, container)
{

  //d3.selectAll(".link").remove();
  //d3.selectAll(".node").remove();
  //d3.selectAll("svg").remove();
  d3.select(container).select('.cancerPlots').remove();
  //console.log(patientID)

  var links  = [];
  var nodes = {};
  d3.csv('data/patient_info.csv', function (patientdata) {
  
  for(var i=0;i<patientdata.length;i++)
  {
    if(patientdata[i].Dummy_ID==patientID)
    {
      if(patientdata[i].Overall_Survival==1)
      {
        var survivalstatus = "Alive";
      }
      else if(patientdata[i].Overall_Survival==0)
      {
        var survivalstatus = "Not Alive";
      }
      links = [
      {source: 'Patient ID: ' + patientID, target: patientdata[i].Gender, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: patientdata[i].Race, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: patientdata[i].Therapeutic_combination, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: patientdata[i].N_category, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: 'HPV Status: ' + patientdata[i].HPV, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: patientdata[i].T_category, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: 'Feeding Tube: ' +patientdata[i].Feeding_tube, type: "licensing"},
      {source: 'Patient ID: ' + patientID, target: survivalstatus, type: "licensing"}
      ];
    }
  }
  // Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var width = $(container).width()/1.4;
    height = $(container).height()/1.4;

var margin = {
        top: 30,
        right: 50,
        bottom: 50,
        left: 30
    };

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-300)
    .on("tick", tick)
    .start();

var MDACCpatient = d3.select(container)
        .append("svg")
        .attr('class','cancerPlots')
        .attr("width", margin.left + width + margin.right )
        .attr("height", margin.top + height + margin.bottom )
        .append("g")
        .attr('class', 'cancer-plot-inner-region')
        .attr('transform','translate(' + margin.left + ',0)');

var link = MDACCpatient.selectAll(".link")
    .data(force.links())
    .enter().append("line")
    .attr("class", "link");

var node = MDACCpatient.selectAll(".node")
    .data(force.nodes())
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

node.append("circle")
    .attr("class", "circle")
    .attr("r", 8);

node.append("text")
    .attr("class", "text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name; });

function tick() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function mouseover() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 16);
}

function mouseout() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 8);
}

})

}
//console.log('out loop');
getLink(patientID, '#cancerPlots2');

//UIC
d3.csv('data/UIC.csv', function (patientdata1){
  var pID1 = [];
  for(var i=0;i<patientdata1.length;i++)
  {
    pID1.push(patientdata1[i].record_id);
  }
  var dropdownChange = function() {
        var patientID1 = d3.select(this).property('value');
        //updateMap(cancerType);
        for(var i=0;i<patientdata1.length;i++)
        {
            if(patientdata1[i].record_id===patientID1)
            {
                var zipSelect1 = patientdata1[i].zip_code;
                zipSelect = patientdata1[i].zip_code;
            }
        }
        //cohortHeading('UIC Patient', '#cohortName1');
        getLink1(patientID1, '#cancerPlots1');
        zipHeading(zipSelect1, '#zipPlot1');
        educationChart(zipSelect1, '#insurancePlot1');
        groceryNumber(zipSelect1, '#groceryNumber1');
        percincomeChart(zipSelect1, '#percapitaIncome1');

        d3.selectAll(".clicked1")
        	.classed("clicked1", false)
        	.style('stroke', '#636363')
        	.style('stroke-width', "1px");

    	d3.selectAll(".clicked2")
        	.classed("clicked2", false)
        	.style('stroke', '#636363')
        	.style('stroke-width', "1px");

    };

        var dropdown = d3.select("#UICdropdown")
        .append('g')
        .attr("width", 10)
        .attr("height", 10)
        .attr("class","dropdown")
        .attr("transform", "translate(0,20)")
        .insert("select", "svg")
        .on("change", dropdownChange);

    dropdown.selectAll("option")
        .data(pID1)
        .enter().append("option")
        .attr("value", function (d) {return d; })
        .text(function (d) {
            return "UIC Patient " +d;
        });
})

function getLink1(patientID1, container)
{
  // d3.selectAll(".link1").remove();
  // d3.selectAll(".node1").remove();
  // d3.selectAll("svg").remove();
  d3.select(container).select('.cancerPlots').remove();
  //console.log(patientID1)
  var links1  = [];
  var nodes1 = {};
  d3.csv('data/UIC.csv', function (patientdata) {
  //console.log('in loop');
  for(var i=0;i<patientdata.length;i++)
  {
    if(patientdata[i].record_id==patientID1)
    {
      if(patientdata[i].death==0)
      {
        var survivalstatus = "Alive";
      }
      else if(patientdata[i].death==1)
      {
        var survivalstatus = "Not Alive";
      }
      else if(patientdata[i].death==100)
      {
        var survivalstatus = "Survival Status not known";
      }

      if(patientdata[i].gender==1)
      {
        var gender = "Male";
      }
      else if(patientdata[i].gender==2)
      {
        var gender = "Female";
      }
      else if(patientdata[i].gender==100)
      {
        var gender = "Gender not known";
      }

      if(patientdata[i].ethnicity==1)
      {
        var race = "White";
      }
      else if(patientdata[i].ethnicity==2)
      {
        var race = "Black";
      }
      else if(patientdata[i].ethnicity==3)
      {
        var race = "American Indian";
      }
      else if(patientdata[i].ethnicity==4)
      {
        var race = "Hispanic";
      }
      else if(patientdata[i].ethnicity==5)
      {
        var race = "Asian";
      }
      else if(patientdata[i].ethnicity==6)
      {
        var race = "Others";
      }
      else if(patientdata[i].ethnicity==100)
      {
        var race = "Ethnicity not known";
      }

      if(patientdata[i].hpv_status==1)
      {
        var hpv = "Positive";
      }
      else if(patientdata[i].hpv_status==2)
      {
        var hpv = "Negative";
      }
      else if(patientdata[i].hpv_status==3)
      {
        var hpv = "Not Specified";
      }
      else if(patientdata[i].hpv_status==4)
      {
        var hpv = "Non-contributory";
      }
      else if(patientdata[i].hpv_status==100)
      {
        var hpv = "Not known";
      }


      if(patientdata[i].t_stage_clinical==0)
      {
        var tstatus = "T0";
      }
      else if(patientdata[i].t_stage_clinical==1)
      {
        var tstatus = "Tis";
      }
      else if(patientdata[i].t_stage_clinical==2)
      {
        var tstatus = "Tx";
      }
      else if(patientdata[i].t_stage_clinical==3 || patientdata[i].t_stage_clinical==4 || patientdata[i].t_stage_clinical==5)
      {
        var tstatus = "T1";
      }
      else if(patientdata[i].t_stage_clinical==6)
      {
        var tstatus = "T2";
      }
      else if(patientdata[i].t_stage_clinical==7)
      {
        var tstatus = "T3";
      }
      else if(patientdata[i].t_stage_clinical==8 || patientdata[i].t_stage_clinical==9 || patientdata[i].t_stage_clinical==10)
      {
        var tstatus = "T4";
      }
      else if(patientdata[i].t_stage_clinical==100)
      {
        var tstatus = "T-category not known";
      }


      if(patientdata[i].n_stage_clinical==1)
      {
        var nstatus = "N0";
      }
      else if(patientdata[i].n_stage_clinical==2)
      {
        var nstatus = "N1";
      }
      else if(patientdata[i].n_stage_clinical==3 || patientdata[i].n_stage_clinical==4 || patientdata[i].n_stage_clinical==5 || 
        patientdata[i].n_stage_clinical==6)
      {
        var nstatus = "N2";
      }
      else if(patientdata[i].n_stage_clinical==7)
      {
        var nstatus = "N3";
      }
      else if(patientdata[i].n_stage_clinical==8)
      {
        var nstatus = "Nx";
      }
      else if(patientdata[i].n_stage_clinical==100)
      {
        var nstatus = "N-category not known";
      }

      if(patientdata[i].definitive_concurrent_conc==0)
      {
        var cc = "CC:N0";
      }
      else if(patientdata[i].definitive_concurrent_conc==1)
      {
        var cc = "CC:YES";
      }
      else if(patientdata[i].definitive_concurrent_conc==100)
      {
        var cc = "CC:not known";
      }

      if(patientdata[i].xrt==0)
      {
        var xrt = "Radiation:N0";
      }
      else if(patientdata[i].xrt==1)
      {
        var xrt = "Radiation:YES";
      }
      else if(patientdata[i].xrt==100)
      {
        var xrt = "Radiation:not known";
      }
      
      if(patientdata[i].feeding==0)
      {
        var feedingTube = "Feeding Tube:N";
      }
      else if(patientdata[i].feeding==1)
      {
        var feedingTube = "Feeding Tube:Y";
      }
      else if(patientdata[i].feeding==100)
      {
        var feedingTube = "Feeding Tube:not known";
      }



      links1 = [
      {source: 'Patient ID: ' + patientID1, target: gender, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: race, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: cc, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: xrt, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: nstatus, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: 'HPV Status: ' + hpv, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: tstatus, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: feedingTube, type: "licensing"},
      {source: 'Patient ID: ' + patientID1, target: survivalstatus, type: "licensing"}
      ];
    }
  }
  // Compute the distinct nodes from the links.
links1.forEach(function(link) {
  link.source = nodes1[link.source] || (nodes1[link.source] = {name: link.source});
  link.target = nodes1[link.target] || (nodes1[link.target] = {name: link.target});
});

var width = $(container).width()/1.4;
    height = $(container).height()/1.4;

var margin = {
        top: 30,
        right: 50,
        bottom: 50,
        left: 30
    };

var force = d3.layout.force()
    .nodes(d3.values(nodes1))
    .links(links1)
    .size([width, height])
    .linkDistance(60)
    .charge(-300)
    .on("tick", tick)
    .start();

var UICpatient = d3.select(container)
        .append("svg")
        .attr('class','cancerPlots')
        .attr("width", margin.left + width + margin.right )
        .attr("height", margin.top + height + margin.bottom )
        .append("g")
        .attr('class', 'cancer-plot-inner-region')
        .attr('transform','translate(' + margin.left + ',0)');


var link = UICpatient.selectAll(".link1")
    .data(force.links())
  .enter().append("line")
    .attr("class", "link1");

var node = UICpatient.selectAll(".node1")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node1")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

node.append("circle")
    .attr("r", 8);

node.append('text')
    .attr("class", "text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .attr('fill', 'black')
    .text(function(d) { return d.name; });

function tick() {
  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function mouseover() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 16);
}

function mouseout() {
  d3.select(this).select("circle").transition()
      .duration(750)
      .attr("r", 8);
}

})

}

getLink1(patientID1, '#cancerPlots1');
