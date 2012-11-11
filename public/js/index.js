
(function () {

  var width = 960;
  var height = 700;

  var canvas = d3.select("#scripttree").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + 30 + "," + 20 + ")");

  var diagonal = d3.svg.diagonal();

  var tree = d3.layout.tree()
    .size([width - 100, 525]);

  d3.json("/data/scripts.json", function (json) {
    var nodes = tree.nodes(json);

    var link = canvas.selectAll("path.link")
      .data(tree.links(nodes))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

    var node = canvas.selectAll("g.node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) { console.log(d); return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
      .attr("r", 10);

    node.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("dy", 30)
      .text(function (d) { return d.title; });

    /*
    SVG does not support word wrap, do put "desc" in HTML <foreignobject>
    -------
    */

    node.append("foreignObject")
      .attr("width", 270)
      .attr("height", 100)
      .attr("x", -135)
      .attr("y", 40)
    .append("xhtml:body")
      .attr("class", "desc")
      .html(function (d) { return d.desc; });

  });

}());
