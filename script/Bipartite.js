var Bipartite = function (container, query) {
  this.container = container;
  this.myQuery = query ? query: window.query;

  this.minRadio = 5;
  this.radioWeight = 5;
};

var minRadio = 5;
var radioWeight = 5;

Bipartite.prototype.matchCategory = function(link) {
  return (((this.myQuery.category == "All") ||
           (link.categories.indexOf(this.myQuery.category) != -1)) &&
          (((this.myQuery.groupcategory == "All") ||
           (link.categoryGroups.indexOf(this.myQuery.groupcategory) != -1))))
}

Bipartite.prototype.sortBy = function(field, reverse, primer) {
   var key = primer ? 
            function(x) {return primer(x[field])} : 
       function(x) {return x[field]};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
          return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        } 
}

Bipartite.prototype.destroy = function() {
  this.tip.hide();
  this.svg.remove();
}

Bipartite.prototype.draw = function() {
  this.filteredApps = [];
  this.filteredDomains = [];
  this.filteredLinks = [];

  for (linkID = 0; linkID < data.links.length; linkID++) {
    if(this.myQuery.platform == "All") {
      if (this.myQuery.trackers && this.myQuery.domains) {
        if (this.matchCategory(data.links[linkID])) {
          this.filteredLinks.push(data.links[linkID]);
          this.filteredApps.push(data.links[linkID].app);
          this.filteredDomains.push(data.links[linkID].domain);
        }
      }
      else if (this.myQuery.trackers) {
        if (data.links[linkID].tracker) {
          if (this.matchCategory(data.links[linkID])) {
            this.filteredLinks.push(data.links[linkID]);
            this.filteredApps.push(data.links[linkID].app);
            this.filteredDomains.push(data.links[linkID].domain);
          }
        }
      } else {
        if (!data.links[linkID].tracker) {
          if (this.matchCategory(data.links[linkID])) {
            this.filteredLinks.push(data.links[linkID]);
            this.filteredApps.push(data.links[linkID].app);
            this.filteredDomains.push(data.links[linkID].domain);
          }
        }
      } 
    } else { // filter by platform 
      if (this.myQuery.platform == data.links[linkID].platform) {
        if (this.myQuery.trackers && this.myQuery.domains) {
          if (this.matchCategory(data.links[linkID])) {
            this.filteredLinks.push(data.links[linkID]);
            this.filteredApps.push(data.links[linkID].app);
            this.filteredDomains.push(data.links[linkID].domain);
          }
        }
        else if (this.myQuery.trackers) {
          if (data.links[linkID].tracker) {
            if (this.matchCategory(data.links[linkID])) {
              this.filteredLinks.push(data.links[linkID]);
              this.filteredApps.push(data.links[linkID].app);
              this.filteredDomains.push(data.links[linkID].domain);
            }
          }
        } else {
          if (!data.links[linkID].tracker) {
            if (this.matchCategory(data.links[linkID])) {
              this.filteredLinks.push(data.links[linkID]);
              this.filteredApps.push(data.links[linkID].app);
              this.filteredDomains.push(data.links[linkID].domain);
            }
          }
        }
      }
    }
  }

  this.filteredLinks = this.filteredLinks.sort(this.sortBy('app', false, function(a){return a.toUpperCase()}));
  this.filteredApps.sort();

  for (var c=0; c < this.filteredLinks.length; c++)
    this.filteredDomains.push(this.filteredLinks[c].domain);

  var svgHeight = 500 + (this.filteredLinks.length * 14);

  var margin = {top: 20, right: 0, bottom: 20, left: 0},
                width = 1200 - margin.left - margin.right,
                height = svgHeight - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
                  .domain([0, 1])
                  .rangePoints([0, width], 1);

  var y1 = d3.scale.ordinal()
                   .domain(this.filteredApps)
                   .rangePoints([0, height]);

  var y2 = d3.scale.ordinal()
                   .domain(this.filteredDomains)
                   .rangePoints([0, height]);

  this.y1 = y1;
  this.y2 = y2;

  this.svg = d3.select("#" + this.container).append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  this.yAxisG1 = this.svg.append("g")
     .attr("transform", "translate(" + x(0) + ",0)")
     .attr("class", "axis")
     .call(d3.svg.axis()
     .scale(y1)
     .tickPadding(25)
     .tickSize(20)
     .orient("left"));

  this.yAxisG2 = this.svg.append("g")
     .attr("transform", "translate(" + x(1) + ",0)")
     .attr("class", "axis")
     .call(d3.svg.axis()
     .scale(y2)
     .tickSize(20)
     .tickPadding(25)
     .orient("right"));

  var instance = this;
  this.svg.selectAll('.slopes')
     .data(this.filteredLinks).enter().append('svg:line')
     .attr('x1', x(0))
     .attr('x2', x(1))
     .attr('y1', function(d,i){
                   return y1(d.app)
                  })
     .attr('y2', function(d,i){
                   return y2(d.domain)
                 })
     .attr("class", function(d,i) {return((d.tracker == true) ? "lineDefaultBlue" : "lineDefaultGreen")})
     .on("mouseover", function(d, i) {
       instance.tip.html(instance.filteredLinks[i].categories);
       offset = Math.abs(instance.y2(instance.filteredLinks[i].domain) - instance.y1(instance.filteredLinks[i].app))/2;
       instance.tip.offset([offset-10, 0]);
       instance.tip.show();

       //We need to include "d", since the index will 
       //always be the second value passed in to the function
    
       instance.yAxisG1.selectAll(".tick").each(function (app, index){
         if (app == d.app){
           d3.select(this).style("fill", "red").style("font-size","12px");
           instance.svg.select("circle:nth-of-type(" + (index+1) +")").style("opacity", 1).style("fill", "red");
         } else {
          d3.select(this).style("fill", "black").style("font-size","8px");
          instance.svg.select("circle:nth-of-type(" + (index+1) +")").style("opacity", 0.2).style("fill", "blue");
         }
       });

       instance.yAxisG2.selectAll(".tick").each(function (domain, index){
         if (domain == d.domain){
           d3.select(this).style("fill", "red").style("font-size","12px");
           instance.svg.select("circle:nth-of-type(" + (index + instance.yAxisG1.selectAll(".tick")[0].length + 1) +")").style("opacity", 1).style("fill", "red");
         } else {
           d3.select(this).style("fill", "black").style("font-size","8px");
           instance.svg.select("circle:nth-of-type(" + (index + instance.yAxisG1.selectAll(".tick")[0].length + 1) +")").style("opacity", 0.2).style("fill", "blue");
         }
       });
       instance.svg.selectAll(".highlight").classed("highlight", false);
       instance.svg.select("line:nth-of-type(" + (i+1) +")").classed("highlight", true);
     });

    this.tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; })

    this.svg.call(instance.tip)
      
    this.yAxisG1.selectAll(".tick").each(function (app, index){
      apps = 0;
      for (var i=0; i < instance.filteredLinks.length; i++)
        if (instance.filteredLinks[i].app == app)
          apps++;
          instance.svg.append("circle")
         .attr("cx", x(0))
         .attr("cy", y1(app))
         .attr("r", instance.minRadio + (instance.radioWeight*Math.sqrt(apps-1))).style("fill", "blue").style("opacity", 0.2);
    });
    this.yAxisG2.selectAll(".tick").each(function (domain, index){
      domains = 0;
      for (var i=0; i < instance.filteredLinks.length; i++)
        if (instance.filteredLinks[i].domain == domain)
          domains++;
      instance.svg.append("circle")
         .attr("cx", x(1))
         .attr("cy", y2(domain))
         .attr("r", instance.minRadio + (instance.radioWeight*Math.sqrt(domains-1))).style("fill", "blue").style("opacity", 0.2);
    });
}
