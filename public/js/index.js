
(function () {

  var width = 960;
  var height = 600;

  var canvas = d3.select("#scripttree")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32, " + (height / 2) + ")");

    var text = canvas.selectAll("text")
    .data([10, 20, 30])

    text.enter()
    .append("text")
      .attr("class", "enter")
      .attr("x", function (d, i) { return d*10; })
      .attr("y", 0)
      .text(function (d) { return d; });

}());
