

d3.json("oahu.json", function(error, oahu) {
  d3.csv("honolulu_matlab3.csv", function(data_island) {
    d3.csv("cumulativePermits_mengyang.csv",type,function(data){

      textYear.attr('visibility','visible') ;
      textMonth.attr('visibility','visible') ;

      //----------------------------------------
      // CREATE THE BASE POPULATION DENSITY MAP
      //----------------------------------------
      // create a first guess for the projection
      geoData = topojson.feature(oahu,oahu.objects.oahu) ;

      var center = d3.geo.centroid(geoData)
      var scale  = 150;
      var offset = [width/2, height/2];
      projection = d3.geo.mercator()
        .scale(scale)
        .center(center)
        .translate(offset);

      // create the path
      path = d3.geo.path()
        .projection(projection);

      // using the path determine the bounds of the current map and use 
      // these to determine better values for the scale and translation

      var bounds  = path.bounds(geoData);
      var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
      var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
      var scale   = (hscale < vscale) ? hscale : vscale;
      var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                        height - (bounds[0][1] + bounds[1][1])/2];

      // new projection
      projection = d3.geo.mercator()
        .center(center)
        .scale(scale*0.95)
        .translate(offset);
      path = path.projection(projection);

      // Calculate the range of population values
      var minVal = d3.min(geoData.features,function(currentValue,index) {
        var population = currentValue.properties.population ;
        var area = path.area(currentValue.geometry) ;
        //console.log(population / area) ;
        return population / area ;
      }) ;

      var maxVal = d3.max(geoData.features,function(currentValue,index) {
        var population = currentValue.properties.population ;
        var area = path.area(currentValue.geometry) ;
        return population / area ;
      }) ;

      color = d3.scale.linear()
                .domain([minVal, maxVal])
                .range(["white", "red"]) ;

      svg.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d,i) {
          var population = d.properties.population ;
          var area = path.area(d.geometry) ;
          ratio = population / area ;
          return color(ratio) ;
        })
        .style("stroke-width", 0.5) ;
        // .style("stroke", "grey");

        svg.append("path")
          .datum(topojson.merge(oahu, oahu.objects.oahu.geometries))
          .attr("d", path)
          .style('fill', 'none')
          .style("stroke-width", 0.5)
          .style("stroke", "black");

        //---------------------------------------------------
        // PLOT THE TIME-APPEARING LOCATIONS OF EarthQuake
        //---------------------------------------------------
   
        earthquakeData = data_island.filter(function(d) {
            if (d.id <= 15000) {
                return true ;
            }
        })

        data_island.map(function(d,i) {
            d.completeddate = +timeFormat.parse(d.completeddate);
            return d ;
        })

        earthquake = svg.selectAll("circle")
            .data(earthquakeData)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([+d.Latitude, +d.Longitude])[0];
            })
            .attr("cy", function(d) {
                return projection([+d.Latitude, +d.Longitude])[1];
            })
            .attr("r", 1.5)
            .style("fill", "blue")
            .attr("stroke","blue")
            .attr("stroke-width",0)
            .style("opacity", 0.25)
            .attr("visibility","hidden")

      // Start Button
      var bX = 30, 
          bY = 0.8*height,
          bWidth = 45,
          bHeight = 20 
          bdx = 8,
          rx = 5 ;


      // Pace.stop() ;
        Pace.on("done", function() {
          svg.attr("visibility","visible") ;
        })


restart = 0;

var playButton = svg.append("g").attr("id","playButton");

        playButton.append("rect")
        .attr("class","button")
        .attr("x",bX)
        .attr("y",bY)
        .attr("width",bWidth)
        .attr("height",bHeight)
        .attr("rx",rx) ;


      playButton.append("text")
        .attr("x",bX + bdx)
        .attr("y",bY + bHeight/2)
        .attr("fill","white")
        .attr("stroke","none")
        .attr("text-anchor","start")
        .attr("alignment-baseline","central")
        .classed("buttonText text",true)
        .style('pointer-events', 'none')
        .style("-webkit-user-select", "none")
        .text("start") ;

 playButton.on("click",function(){
          svg.selectAll(".circle").attr("visibility","hidden");

          plotEarthQuake();
          plotLine();
          //restart = 1;
          if (restart==0){
              d3.select("#playButton rect").attr("width",bWidth+15);
              d3.select("#playButton text").text("restart");
          }else{
              restart =1;
          }
        }) ;


function plotLine(){
  d3.select('rect.curtain').remove();

    line_svg.append('rect')
    .attr('x', -0.995 * line_width)
    .attr('y', -0.997 * line_height)
    .attr('height', line_height)
    .attr('width', line_width)
    .attr('class', 'curtain')
    .attr('transform', 'rotate(180)')
    .style('fill', '#ffffff')
    .transition().duration(20000).ease("linear").attr('width',0);

  }

  
      })
    })
})

// Parse dates and numbers. We assume values are sorted by date.
function type(d) {
  d.date = parseTime(d.date);
  d.number = +d.number;
  return d;
}

function plotEarthQuake() {
  console.log("REACHED");
  

        var ii = -1 ;

        earthquake.transition()
            .duration(20000)
            .ease("linear")
            .attrTween("visibility",function(d, i, a){
                return function(t) {
                    if (ii !== t) {
                        var cDate = new Date(dateInterp(t))
                        textYear.text(cDate.getFullYear().toString()) ;
                        textMonth.text(monthNames[cDate.getMonth()]) ; // + " " + cDate.getDate().toString()]) ;
                        ii = t ;
                    }

                    if (d.completeddate <= dateInterp(t)) {
                        return "visible" ;
                    } else {
                        return "hidden" ;
                    }
                }
            })
}

