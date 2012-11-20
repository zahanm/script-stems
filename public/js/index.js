
(function (exports) {
  "use strict";

  var width = 1000;
  var height = 568;

  var canvas = d3.select("#scripttree").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + 30 + "," + 20 + ")");

  var diagonal = d3.svg.diagonal();

  var tree = d3.layout.tree()
    .size([width - 75, 5.0 / 3.0 * height - 120]);

  var fulldataset = null;
  var displaydepth = 2;
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

    // title
    // SVG does not support word wrap, so put in HTML <foreignobject>
    var w = 160;
    entrance.append("foreignObject")
      .attr("width", w)
      .attr("height", 56)
      .attr("x", -w/2)
      .attr("y", 20)
    .append("xhtml:body")
      .attr("class", "title")
      .html(function (d) { return d.title; });

    d3.select("#info-heads-up .title").html(displayroot.title);
    if (displayroot.family)
      d3.select("#info-heads-up .family").html(displayroot.family + " <small>family</small>");
    else
      d3.select("#info-heads-up .family").html("");
    if (displayroot.subfamily)
      d3.select("#info-heads-up .subfamily").html(displayroot.subfamily + " <small>sub-family</small>");
    else
      d3.select("#info-heads-up .subfamily").html("");
    if (displayroot.desc)
      d3.select("#info-heads-up .desc").html(displayroot.desc + " <small>description</small>");
    else
      d3.select("#info-heads-up .desc").html("");

    highlightMinimapNode(displayroot.title);

    d3.event && d3.event.stopPropagation();
  }

  function minimap(root) {
    root = root || fulldataset;

    var w = 190, h = height;

    var sidecanvas = d3.select("#minimap").append("svg")
      .attr("width", w)
      .attr("height", h)
    .append("g")
      .attr("transform", "translate(" + 10 + "," + 10 + ")");

    var skeletontree = d3.layout.tree()
      .size([w - 20, h - 20]);

    var nodes = skeletontree.nodes(root);

    sidecanvas.selectAll("path.link")
      .data(tree.links(nodes), function (d) {
        return d.source.title + " " + d.target.title;
      })
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

    sidecanvas.selectAll("circle.node")
      .data(nodes, function (d) { return d.title; })
    .enter().append("circle")
      .attr("class", "node")
      .attr("data-title", function (d) { return d.title; })
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", 2.5);
  }

  function highlightMinimapNode(title) {
    var old = document.querySelector("#minimap circle.node.active");
    if (old) { old.classList.remove('active'); }
    var root = document.querySelector("#minimap circle.node[data-title=\"" + title + "\"]");
    if (root) { root.classList.add('active'); }
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

  function findParentOfNodeWithTitle(title, root) {
    if (!root) { root = fulldataset; }
    if (root.title === title) {
      // gone too far
      return root;
    }
    var childTitles = root.children.map(function (child) { return child.title; });
    if (childTitles.indexOf(title) >= 0) {
      return root;
    } else {
      return root.children.reduce(function (prev, child) {
        if (prev) { return prev; }
        return findParentOfNodeWithTitle(title, child);
      }, null);
    }
  }

  /**
   * Button handlers
   * --------------
   */

   d3.select("#control-up").on("click", function () {
     updateTree(findParentOfNodeWithTitle(displayroot.title));
   });
   d3.select("#control-reset").on("click", function () { updateTree(null); });

  /**
   * Initial data acquisition
   * ------------------------
   */
  d3.json("data/scripts.json", function (json) {
    fulldataset = json;
    minimap(null);
    updateTree(null);
  });

}(window));
