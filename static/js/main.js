window.addEventListener("load", function() {
  // get the data
  d3.csv("./static/data/battles.csv", function(error, links) {
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
      link.source =
        nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target =
        nodes[link.target] || (nodes[link.target] = { name: link.target });
      link.value = +link.value;
    });

    //setup our window
    var width = window.innerWidth,
      height = window.innerHeight;

    //build the layout
    var force = d3.layout
      .force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(100)
      .charge(-1800)
      .on("tick", tick)
      .start();

    var svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    //add hovercard
    var hovercard = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("width", 400);

    // build the arrow.
    svg
      .append("svg:defs")
      .selectAll("marker")
      .data(["end"]) // Different link/path types can be defined here
      .enter()
      .append("svg:marker") // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .attr("fill", "#404040")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

    // add the links and the arrows
    var path = svg
      .append("svg:g")
      .selectAll("path")
      .data(force.links())
      .enter()
      .append("svg:path")
      .attr("class", function(d) {
        return "link " + d.type;
      })
      .attr("class", "link")
      .attr("marker-end", "url(#end)");

    // define the nodes
    var node = svg
      .selectAll(".node")
      .data(force.nodes())
      .enter()
      .append("g")
      .attr("class", "node")
      .call(force.drag);

    // add the nodes matching the images
    // node.append("circle")
    //     .attr("r", 25)
    node
      .append("image")
      .attr("xlink:href", function(d) {
        return (
          "https://code-institute.s3-eu-west-1.amazonaws.com/GoT-imgs/" +
          encodeURI(d.name)
            .toLowerCase()
            .replace(/'/g, "") +
          ".png"
        );
      })
      .attr("x", function(d) {
        return -25;
      })
      .attr("y", function(d) {
        return -25;
      })
      .attr("height", 50)
      .attr("width", 50);

    // add the text
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("y", -32)
      .text(function(d) {
        return d.name;
      });

    // add the curvy lines
    function tick() {
      path.attr("d", function(d, i) {
        var dx = d.target.x - d.source.x + i * 10, //separate the lines
          dy = d.target.y - d.source.y + i * 10,
          dr = Math.sqrt(dx * dx + dy * dy);
        return (
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          d.target.x +
          "," +
          d.target.y
        );
      });

      path.attr("class", function(d) {
        return "link " + d.attacker_outcome;
      });

      path.on("mouseover", function(d) {
        hovercard
          .transition()
          .duration(500)
          .style("opacity", 1);

        var tip =
          "<h2>" +
          d.name +
          "</h2>" +
          "<h4> " +
          d.source.name +
          " attacked " +
          d.target.name +
          " and the outcome was a " +
          d.attacker_outcome +
          "</h4>" +
          "<h3>Details</h3>" +
          "<strong> Attacker King: </strong>" +
          d.attacker_king +
          "<br/>" +
          "<strong> Battle Type: </strong>" +
          d.battle_type +
          "<br/>" +
          "<strong> Major Death?: </strong>" +
          d.major_death +
          "<br/>" +
          "<strong> Major Capture?: </strong>" +
          d.major_capture +
          "<br/>" +
          "<strong> Attacker Size: </strong>" +
          d.value +
          "<br/>" +
          "<strong> Defender Size: </strong>" +
          d.defender_size +
          "<br/>" +
          "<strong> Region / Location: </strong>" +
          d.region +
          " / " +
          d.location +
          "<br/>" +
          "<strong> Attacking Commander: </strong>" +
          d.attacker_commander +
          "<br/>" +
          "<strong> Defending Commander: </strong>" +
          d.defender_commander;

        hovercard
          .html(tip)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      });

      path.on("mouseout", function(d) {
        hovercard
          .transition()
          .duration(500)
          .style("opacity", 0);
      });

      node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
  });
});
