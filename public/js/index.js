
(function (exports) {
  "use strict";

  var width = 1100;
  var height = 600;

  var canvas = d3.select("#scripttree").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", function () { updateTree(null); })
  .append("g")
    .attr("transform", "translate(" + 30 + "," + 20 + ")");

  var diagonal = d3.svg.diagonal();

  var tree = d3.layout.tree()
    .size([width - 100, height - 175]);

  var fulldataset = null;
  var displaydepth = 1;
  var displayroot = null;
  var animatime = 2000;

  /**
   * Tree updating
   * -------------
   */
  function updateTree(root) {

    root = root || fulldataset;

    if (typeof root === "string") {
      root = findNodeWithTitle(root);
    }

    if (displayroot && displayroot.title == root.title) {
      return;
    }
    displayroot = pruneTree(root, displaydepth);

    var nodes = tree.nodes(displayroot);

    // update path
    var link = canvas.selectAll("path.link")
      .data(tree.links(nodes), function (d) {
        return d.source.title + " " + d.target.title;
      });

    // update animation
    link.transition()
      .duration(animatime)
      .attr("d", diagonal);

    // exit path
    link.exit().remove();

    // enter path
    link.enter().insert("path", ":first-child")
      .attr("class", "link")
      .attr("stroke-opacity", 0.0)
      .attr("d", diagonal)
    .transition()
      .duration(animatime)
      .attr("stroke-opacity", 1.0);

    // update selection
    var node = canvas.selectAll("g.node")
      .data(nodes, function (d) { return d.title; });

    // update animation
    node.transition()
      .duration(animatime)
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    // exit selection
    node.exit().remove();

    // enter selection
    var entrance = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function (d) { return "translate(" + d.x + "," + height + ")"; });

    entrance.transition()
      .duration(animatime)
      .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

    entrance.append("circle")
      .attr("r", 15)
      .on("click", function (d) { updateTree(d.title); });

    entrance.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("dy", 30)
      .text(function (d) { return d.title; });

    // SVG does not support word wrap, so put "desc" in HTML <foreignobject>
    var w = 270;
    entrance.append("foreignObject")
      .attr("width", w)
      .attr("height", 100)
      .attr("x", -w/2)
      .attr("y", 40)
    .append("xhtml:body")
      .attr("class", "desc")
      .html(function (d) { return d.desc; });

    console.log("Updated");
    d3.event && d3.event.stopPropagation();
  }

  /**
   * Tree Pruning
   * -------------
   */
  function pruneTree(root, depth) {
    var pruned = {}, k = null;

    for (k in root) {
      if (root.hasOwnProperty(k) && k !== "children") {
        pruned[k] = root[k];
      }
    }

    if (depth !== 0) {
      pruned.children = root.children.map(function (child) {
        return pruneTree(child, depth - 1);
      });
    } else {
      // base case
      pruned.children = [];
    }

    return pruned;
  }

  function findNodeWithTitle(title, root) {
    if (!root) { root = fulldataset; }
    if (root.title === title) {
      // base case
      return root
    }
    return root.children.reduce(function (prev, child) {
      if (prev) { return prev; }
      return findNodeWithTitle(title, child);
    }, null);
  }

  /**
   * Event handlers
   * --------------
   */

  /**
   * Initial data acquisition
   * ------------------------
   */
  d3.json("data/scripts.json", function (json) {
    fulldataset = json;

    updateTree(null);

  });

}(window));
