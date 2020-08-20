(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce.plugins.table.Plugin","tinymce.core.dom.TreeWalker","tinymce.core.Env","tinymce.core.PluginManager","tinymce.core.util.Tools","tinymce.core.util.VK","tinymce.plugins.table.model.TableGrid","tinymce.plugins.table.selection.CellSelection","tinymce.plugins.table.ui.Dialogs","tinymce.plugins.table.ui.ResizeBars","tinymce.plugins.table.util.Quirks","global!tinymce.util.Tools.resolve","tinymce.plugins.table.util.Utils","tinymce.plugins.table.model.SplitCols","tinymce.core.util.Delay"]
jsc*/
defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);
/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.TreeWalker',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.dom.TreeWalker');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.Env',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.Env');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.PluginManager',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.PluginManager');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Tools',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Tools');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.VK',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.VK');
  }
);

/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Various utility functions.
 *
 * @class tinymce.table.util.Utils
 * @private
 */
define(
  'tinymce.plugins.table.util.Utils',
  [
    'tinymce.core.Env'
  ],
  function (Env) {
    var setSpanVal = function (name) {
      return function (td, val) {
        if (td) {
          val = parseInt(val, 10);

          if (val === 1 || val === 0) {
            td.removeAttribute(name, 1);
          } else {
            td.setAttribute(name, val, 1);
          }
        }
      };
    };

    var getSpanVal = function (name) {
      return function (td) {
        return parseInt(td.getAttribute(name) || 1, 10);
      };
    };

    function paddCell(cell) {
      if (!Env.ie || Env.ie > 9) {
        if (!cell.hasChildNodes()) {
          cell.innerHTML = '<br data-mce-bogus="1" />';
        }
      }
    }

    return {
      setColSpan: setSpanVal('colSpan'),
      setRowSpan: setSpanVal('rowspan'),
      getColSpan: getSpanVal('colSpan'),
      getRowSpan: getSpanVal('rowSpan'),
      setSpanVal: function (td, name, value) {
        setSpanVal(name)(td, value);
      },
      getSpanVal: function (td, name) {
        return getSpanVal(name)(td);
      },
      paddCell: paddCell
    };
  }
);

/**
 * SplitCols.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains logic for handling splitting of merged rows.
 *
 * @class tinymce.table.model.SplitCols
 * @private
 */
define(
  'tinymce.plugins.table.model.SplitCols',
  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.table.util.Utils'
  ],
  function (Tools, Utils) {
    var getCellAt = function (grid, x, y) {
      return grid[y] ? grid[y][x] : null;
    };

    var getCellElmAt = function (grid, x, y) {
      var cell = getCellAt(grid, x, y);
      return cell ? cell.elm : null;
    };

    var countHoles = function (grid, x, y, delta) {
      var y2, cell, count = 0, elm = getCellElmAt(grid, x, y);

      for (y2 = y; delta > 0 ? y2 < grid.length : y2 >= 0; y2 += delta) {
        cell = getCellAt(grid, x, y2);
        if (elm !== cell.elm) {
          break;
        }

        count++;
      }

      return count;
    };

    var findRealElm = function (grid, x, y) {
      var cell, row = grid[y];

      for (var x2 = x; x2 < row.length; x2++) {
        cell = row[x2];
        if (cell.real) {
          return cell.elm;
        }
      }

      return null;
    };

    var getRowSplitInfo = function (grid, y) {
      var cell, result = [], row = grid[y];

      for (var x = 0; x < row.length; x++) {
        cell = row[x];
        result.push({
          elm: cell.elm,
          above: countHoles(grid, x, y, -1) - 1,
          below: countHoles(grid, x, y, 1) - 1
        });

        x += Utils.getColSpan(cell.elm) - 1;
      }

      return result;
    };

    var createCell = function (info, rowSpan) {
      var doc = info.elm.ownerDocument;
      var newCell = doc.createElement('td');

      Utils.setColSpan(newCell, Utils.getColSpan(info.elm));
      Utils.setRowSpan(newCell, rowSpan);
      Utils.paddCell(newCell);

      return newCell;
    };

    var insertOrAppendCell = function (grid, newCell, x, y) {
      var realCellElm = findRealElm(grid, x + 1, y);

      if (!realCellElm) {
        realCellElm = findRealElm(grid, 0, y);
        realCellElm.parentNode.appendChild(newCell);
      } else {
        realCellElm.parentNode.insertBefore(newCell, realCellElm);
      }
    };

    var splitAbove = function (grid, info, x, y) {
      if (info.above !== 0) {
        Utils.setRowSpan(info.elm, info.above);
        var cell = createCell(info, info.below + 1);
        insertOrAppendCell(grid, cell, x, y);
        return cell;
      }

      return null;
    };

    var splitBelow = function (grid, info, x, y) {
      if (info.below !== 0) {
        Utils.setRowSpan(info.elm, info.above + 1);
        var cell = createCell(info, info.below);
        insertOrAppendCell(grid, cell, x, y + 1);
        return cell;
      }

      return null;
    };

    var splitAt = function (grid, x, y, before) {
      var rowInfos = getRowSplitInfo(grid, y);
      var rowElm = getCellElmAt(grid, x, y).parentNode;
      var cells = [];

      Tools.each(rowInfos, function (info, x) {
        var cell = before ? splitAbove(grid, info, x, y) : splitBelow(grid, info, x, y);
        if (cell !== null) {
          cells.push(cells);
        }
      });

      return {
        cells: cells,
        row: rowElm
      };
    };

    return {
      splitAt: splitAt
    };
  }
);

/**
 * TableGrid.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a grid out of a table element. This
 * makes it a whole lot easier to handle complex tables with
 * col/row spans.
 *
 * @class tinymce.table.model.TableGrid
 * @private
 */
define(
  'tinymce.plugins.table.model.TableGrid',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.Env',
    'tinymce.plugins.table.util.Utils',
    'tinymce.plugins.table.model.SplitCols'
  ],
  function (Tools, Env, Utils, SplitCols) {
    var each = Tools.each, getSpanVal = Utils.getSpanVal, setSpanVal = Utils.setSpanVal;

    return function (editor, table, selectedCell) {
      var grid, gridWidth, startPos, endPos, selection = editor.selection, dom = selection.dom;

      function removeCellSelection() {
        editor.$('td[data-mce-selected],th[data-mce-selected]').removeAttr('data-mce-selected');
      }

      function isEditorBody(node) {
        return node === editor.getBody();
      }

      function getChildrenByName(node, names) {
        if (!node) {
          return [];
        }

        names = Tools.map(names.split(','), function (name) {
          return name.toLowerCase();
        });

        return Tools.grep(node.childNodes, function (node) {
          return Tools.inArray(names, node.nodeName.toLowerCase()) !== -1;
        });
      }

      function buildGrid() {
        var startY = 0;

        grid = [];
        gridWidth = 0;

        each(['thead', 'tbody', 'tfoot'], function (part) {
          var partElm = getChildrenByName(table, part)[0];
          var rows = getChildrenByName(partElm, 'tr');

          each(rows, function (tr, y) {
            y += startY;

            each(getChildrenByName(tr, 'td,th'), function (td, x) {
              var x2, y2, rowspan, colspan;

              // Skip over existing cells produced by rowspan
              if (grid[y]) {
                while (grid[y][x]) {
                  x++;
                }
              }

              // Get col/rowspan from cell
              rowspan = getSpanVal(td, 'rowspan');
              colspan = getSpanVal(td, 'colspan');

              // Fill out rowspan/colspan right and down
              for (y2 = y; y2 < y + rowspan; y2++) {
                if (!grid[y2]) {
                  grid[y2] = [];
                }

                for (x2 = x; x2 < x + colspan; x2++) {
                  grid[y2][x2] = {
                    part: part,
                    real: y2 == y && x2 == x,
                    elm: td,
                    rowspan: rowspan,
                    colspan: colspan
                  };
                }
              }

              gridWidth = Math.max(gridWidth, x + 1);
            });
          });

          startY += rows.length;
        });
      }

      function fireNewRow(node) {
        editor.fire('newrow', {
          node: node
        });

        return node;
      }

      function fireNewCell(node) {
        editor.fire('newcell', {
          node: node
        });

        return node;
      }

      function cloneNode(node, children) {
        node = node.cloneNode(children);
        node.removeAttribute('id');

        return node;
      }

      function getCell(x, y) {
        var row;

        row = grid[y];
        if (row) {
          return row[x];
        }
      }

      function getRow(grid, y) {
        return grid[y] ? grid[y] : null;
      }

      function getColumn(grid, x) {
        var out = [];

        for (var y = 0; y < grid.length; y++) {
          out.push(getCell(x, y));
        }

        return out;
      }

      function isCellSelected(cell) {
        return cell && (!!dom.getAttrib(cell.elm, 'data-mce-selected') || cell == selectedCell);
      }

      function getSelectedRows() {
        var rows = [];

        each(table.rows, function (row) {
          each(row.cells, function (cell) {
            if (dom.getAttrib(cell, 'data-mce-selected') || (selectedCell && cell == selectedCell.elm)) {
              rows.push(row);
              return false;
            }
          });
        });

        return rows;
      }

      function countSelectedCols() {
        var cols = 0;

        each(grid, function (row) {
          each(row, function (cell) {
            if (isCellSelected(cell)) {
              cols++;
            }
          });
          if (cols) {
            return false;
          }
        });

        return cols;
      }

      function deleteTable() {
        var rng = dom.createRng();

        if (isEditorBody(table)) {
          return;
        }

        rng.setStartAfter(table);
        rng.setEndAfter(table);

        selection.setRng(rng);

        dom.remove(table);
      }

      function cloneCell(cell) {
        var formatNode, cloneFormats = {};

        if (editor.settings.table_clone_elements !== false) {
          cloneFormats = Tools.makeMap(
            (editor.settings.table_clone_elements || 'strong em b i span font h1 h2 h3 h4 h5 h6 p div').toUpperCase(),
            /[ ,]/
          );
        }

        // Clone formats
        Tools.walk(cell, function (node) {
          var curNode;

          if (node.nodeType == 3) {
            each(dom.getParents(node.parentNode, null, cell).reverse(), function (node) {
              if (!cloneFormats[node.nodeName]) {
                return;
              }

              node = cloneNode(node, false);

              if (!formatNode) {
                formatNode = curNode = node;
              } else if (curNode) {
                curNode.appendChild(node);
              }

              curNode = node;
            });

            // Add something to the inner node
            if (curNode) {
              curNode.innerHTML = Env.ie && Env.ie < 10 ? '&nbsp;' : '<br data-mce-bogus="1" />';
            }

            return false;
          }
        }, 'childNodes');

        cell = cloneNode(cell, false);
        fireNewCell(cell);

        setSpanVal(cell, 'rowSpan', 1);
        setSpanVal(cell, 'colSpan', 1);

        if (formatNode) {
          cell.appendChild(formatNode);
        } else {
          Utils.paddCell(cell);
        }

        return cell;
      }

      function cleanup() {
        var rng = dom.createRng(), row;

        // Empty rows
        each(dom.select('tr', table), function (tr) {
          if (tr.cells.length === 0) {
            dom.remove(tr);
          }
        });

        // Empty table
        if (dom.select('tr', table).length === 0) {
          rng.setStartBefore(table);
          rng.setEndBefore(table);
          selection.setRng(rng);
          dom.remove(table);
          return;
        }

        // Empty header/body/footer
        each(dom.select('thead,tbody,tfoot', table), function (part) {
          if (part.rows.length === 0) {
            dom.remove(part);
          }
        });

        // Restore selection to start position if it still exists
        buildGrid();

        // If we have a valid startPos object
        if (startPos) {
          // Restore the selection to the closest table position
          row = grid[Math.min(grid.length - 1, startPos.y)];
          if (row) {
            selection.select(row[Math.min(row.length - 1, startPos.x)].elm, true);
            selection.collapse(true);
          }
        }
      }

      function fillLeftDown(x, y, rows, cols) {
        var tr, x2, r, c, cell;

        tr = grid[y][x].elm.parentNode;
        for (r = 1; r <= rows; r++) {
          tr = dom.getNext(tr, 'tr');

          if (tr) {
            // Loop left to find real cell
            for (x2 = x; x2 >= 0; x2--) {
              cell = grid[y + r][x2].elm;

              if (cell.parentNode == tr) {
                // Append clones after
                for (c = 1; c <= cols; c++) {
                  dom.insertAfter(cloneCell(cell), cell);
                }

                break;
              }
            }

            if (x2 == -1) {
              // Insert nodes before first cell
              for (c = 1; c <= cols; c++) {
                tr.insertBefore(cloneCell(tr.cells[0]), tr.cells[0]);
              }
            }
          }
        }
      }

      function split() {
        each(grid, function (row, y) {
          each(row, function (cell, x) {
            var colSpan, rowSpan, i;

            if (isCellSelected(cell)) {
              cell = cell.elm;
              colSpan = getSpanVal(cell, 'colspan');
              rowSpan = getSpanVal(cell, 'rowspan');

              if (colSpan > 1 || rowSpan > 1) {
                setSpanVal(cell, 'rowSpan', 1);
                setSpanVal(cell, 'colSpan', 1);

                // Insert cells right
                for (i = 0; i < colSpan - 1; i++) {
                  dom.insertAfter(cloneCell(cell), cell);
                }

                fillLeftDown(x, y, rowSpan - 1, colSpan);
              }
            }
          });
        });
      }

      function findItemsOutsideOfRange(items, start, end) {
        var out = [];

        for (var i = 0; i < items.length; i++) {
          if (i < start || i > end) {
            out.push(items[i]);
          }
        }

        return out;
      }

      function getFakeCells(cells) {
        return Tools.grep(cells, function (cell) {
          return cell.real === false;
        });
      }

      function getUniqueElms(cells) {
        var elms = [];

        for (var i = 0; i < cells.length; i++) {
          var elm = cells[i].elm;
          if (elms[elms.length - 1] !== elm) {
            elms.push(elm);
          }
        }

        return elms;
      }

      function reduceRowSpans(grid, startX, startY, endX, endY) {
        var count = 0;

        if (endY - startY < 1) {
          return 0;
        }

        for (var y = startY + 1; y <= endY; y++) {
          var allCells = findItemsOutsideOfRange(getRow(grid, y), startX, endX);
          var fakeCells = getFakeCells(allCells);

          if (allCells.length === fakeCells.length) {
            Tools.each(getUniqueElms(fakeCells), function (elm) {
              Utils.setRowSpan(elm, Utils.getRowSpan(elm) - 1);
            });

            count++;
          }
        }

        return count;
      }

      function reduceColSpans(grid, startX, startY, endX, endY) {
        var count = 0;

        if (endX - startX < 1) {
          return 0;
        }

        for (var x = startX + 1; x <= endX; x++) {
          var allCells = findItemsOutsideOfRange(getColumn(grid, x), startY, endY);
          var fakeCells = getFakeCells(allCells);

          if (allCells.length === fakeCells.length) {
            Tools.each(getUniqueElms(fakeCells), function (elm) {
              Utils.setColSpan(elm, Utils.getColSpan(elm) - 1);
            });

            count++;
          }
        }

        return count;
      }

      function merge(cell, cols, rows) {
        var pos, startX, startY, endX, endY, x, y, startCell, endCell, children, count, reducedRows, reducedCols;

        // Use specified cell and cols/rows
        if (cell) {
          pos = getPos(cell);
          startX = pos.x;
          startY = pos.y;
          endX = startX + (cols - 1);
          endY = startY + (rows - 1);
        } else {
          startPos = endPos = null;

          // Calculate start/end pos by checking for selected cells in grid works better with context menu
          each(grid, function (row, y) {
            each(row, function (cell, x) {
              if (isCellSelected(cell)) {
                if (!startPos) {
                  startPos = { x: x, y: y };
                }

                endPos = { x: x, y: y };
              }
            });
          });

          // Use selection, but make sure startPos is valid before accessing
          if (startPos) {
            startX = startPos.x;
            startY = startPos.y;
            endX = endPos.x;
            endY = endPos.y;
          }
        }

        // Find start/end cells
        startCell = getCell(startX, startY);
        endCell = getCell(endX, endY);

        // Check if the cells exists and if they are of the same part for example tbody = tbody
        if (startCell && endCell && startCell.part == endCell.part) {
          // Split and rebuild grid
          split();
          buildGrid();

          reducedRows = reduceRowSpans(grid, startX, startY, endX, endY);
          reducedCols = reduceColSpans(grid, startX, startY, endX, endY);

          // Set row/col span to start cell
          startCell = getCell(startX, startY).elm;
          var colSpan = (endX - startX - reducedCols) + 1;
          var rowSpan = (endY - startY - reducedRows) + 1;

          // All cells in table selected then just make it a table with one cell
          if (colSpan === gridWidth && rowSpan === grid.length) {
            colSpan = 1;
            rowSpan = 1;
          }

          // Multiple whole rows selected then just make it one rowSpan
          if (colSpan === gridWidth && rowSpan > 1) {
            rowSpan = 1;
          }

          setSpanVal(startCell, 'colSpan', colSpan);
          setSpanVal(startCell, 'rowSpan', rowSpan);

          // Remove other cells and add it's contents to the start cell
          for (y = startY; y <= endY; y++) {
            for (x = startX; x <= endX; x++) {
              if (!grid[y] || !grid[y][x]) {
                continue;
              }

              cell = grid[y][x].elm;

              /*jshint loopfunc:true */
              /*eslint no-loop-func:0 */
              if (cell != startCell) {
                // Move children to startCell
                children = Tools.grep(cell.childNodes);
                each(children, function (node) {
                  startCell.appendChild(node);
                });

                // Remove bogus nodes if there is children in the target cell
                if (children.length) {
                  children = Tools.grep(startCell.childNodes);
                  count = 0;
                  each(children, function (node) {
                    if (node.nodeName == 'BR' && count++ < children.length - 1) {
                      startCell.removeChild(node);
                    }
                  });
                }

                dom.remove(cell);
              }
            }
          }

          // Remove empty rows etc and restore caret location
          cleanup();
        }
      }

      function insertRow(before) {
        var posY, cell, lastCell, x, rowElm, newRow, newCell, otherCell, rowSpan, spanValue;

        // Find first/last row
        each(grid, function (row, y) {
          each(row, function (cell) {
            if (isCellSelected(cell)) {
              cell = cell.elm;
              rowElm = cell.parentNode;
              newRow = fireNewRow(cloneNode(rowElm, false));
              posY = y;

              if (before) {
                return false;
              }
            }
          });

          if (before) {
            return posY === undefined;
          }
        });

        // If posY is undefined there is nothing for us to do here...just return to avoid crashing below
        if (posY === undefined) {
          return;
        }

        for (x = 0, spanValue = 0; x < grid[0].length; x += spanValue) {
          // Cell not found could be because of an invalid table structure
          if (!grid[posY][x]) {
            continue;
          }

          cell = grid[posY][x].elm;
          spanValue = getSpanVal(cell, 'colspan');

          if (cell != lastCell) {
            if (!before) {
              rowSpan = getSpanVal(cell, 'rowspan');
              if (rowSpan > 1) {
                setSpanVal(cell, 'rowSpan', rowSpan + 1);
                continue;
              }
            } else {
              // Check if cell above can be expanded
              if (posY > 0 && grid[posY - 1][x]) {
                otherCell = grid[posY - 1][x].elm;
                rowSpan = getSpanVal(otherCell, 'rowSpan');
                if (rowSpan > 1) {
                  setSpanVal(otherCell, 'rowSpan', rowSpan + 1);
                  continue;
                }
              }
            }

            // Insert new cell into new row
            newCell = cloneCell(cell);
            setSpanVal(newCell, 'colSpan', cell.colSpan);

            newRow.appendChild(newCell);

            lastCell = cell;
          }
        }

        if (newRow.hasChildNodes()) {
          if (!before) {
            dom.insertAfter(newRow, rowElm);
          } else {
            rowElm.parentNode.insertBefore(newRow, rowElm);
          }
        }
      }

      function insertRows(before, num) {
        num = num || getSelectedRows().length || 1;
        for (var i = 0; i < num; i++) {
          insertRow(before);
        }
      }

      function insertCol(before) {
        var posX, lastCell;

        // Find first/last column
        each(grid, function (row) {
          each(row, function (cell, x) {
            if (isCellSelected(cell)) {
              posX = x;

              if (before) {
                return false;
              }
            }
          });

          if (before) {
            return posX === undefined;
          }
        });

        each(grid, function (row, y) {
          var cell, rowSpan, colSpan;

          if (!row[posX]) {
            return;
          }

          cell = row[posX].elm;
          if (cell != lastCell) {
            colSpan = getSpanVal(cell, 'colspan');
            rowSpan = getSpanVal(cell, 'rowspan');

            if (colSpan == 1) {
              if (!before) {
                dom.insertAfter(cloneCell(cell), cell);
                fillLeftDown(posX, y, rowSpan - 1, colSpan);
              } else {
                cell.parentNode.insertBefore(cloneCell(cell), cell);
                fillLeftDown(posX, y, rowSpan - 1, colSpan);
              }
            } else {
              setSpanVal(cell, 'colSpan', cell.colSpan + 1);
            }

            lastCell = cell;
          }
        });
      }

      function insertCols(before, num) {
        num = num || countSelectedCols() || 1;
        for (var i = 0; i < num; i++) {
          insertCol(before);
        }
      }

      function getSelectedCells(grid) {
        return Tools.grep(getAllCells(grid), isCellSelected);
      }

      function getAllCells(grid) {
        var cells = [];

        each(grid, function (row) {
          each(row, function (cell) {
            cells.push(cell);
          });
        });

        return cells;
      }

      function deleteCols() {
        var cols = [];

        if (isEditorBody(table)) {
          if (grid[0].length == 1) {
            return;
          }

          if (getSelectedCells(grid).length == getAllCells(grid).length) {
            return;
          }
        }

        // Get selected column indexes
        each(grid, function (row) {
          each(row, function (cell, x) {
            if (isCellSelected(cell) && Tools.inArray(cols, x) === -1) {
              each(grid, function (row) {
                var cell = row[x].elm, colSpan;

                colSpan = getSpanVal(cell, 'colSpan');

                if (colSpan > 1) {
                  setSpanVal(cell, 'colSpan', colSpan - 1);
                } else {
                  dom.remove(cell);
                }
              });

              cols.push(x);
            }
          });
        });

        cleanup();
      }

      function deleteRows() {
        var rows;

        function deleteRow(tr) {
          var pos, lastCell;

          // Move down row spanned cells
          each(tr.cells, function (cell) {
            var rowSpan = getSpanVal(cell, 'rowSpan');

            if (rowSpan > 1) {
              setSpanVal(cell, 'rowSpan', rowSpan - 1);
              pos = getPos(cell);
              fillLeftDown(pos.x, pos.y, 1, 1);
            }
          });

          // Delete cells
          pos = getPos(tr.cells[0]);
          each(grid[pos.y], function (cell) {
            var rowSpan;

            cell = cell.elm;

            if (cell != lastCell) {
              rowSpan = getSpanVal(cell, 'rowSpan');

              if (rowSpan <= 1) {
                dom.remove(cell);
              } else {
                setSpanVal(cell, 'rowSpan', rowSpan - 1);
              }

              lastCell = cell;
            }
          });
        }

        // Get selected rows and move selection out of scope
        rows = getSelectedRows();

        if (isEditorBody(table) && rows.length == table.rows.length) {
          return;
        }

        // Delete all selected rows
        each(rows.reverse(), function (tr) {
          deleteRow(tr);
        });

        cleanup();
      }

      function cutRows() {
        var rows = getSelectedRows();

        if (isEditorBody(table) && rows.length == table.rows.length) {
          return;
        }

        dom.remove(rows);
        cleanup();

        return rows;
      }

      function copyRows() {
        var rows = getSelectedRows();

        each(rows, function (row, i) {
          rows[i] = cloneNode(row, true);
        });

        return rows;
      }

      function pasteRows(rows, before) {
        var splitResult, targetRow, newRows;

        // indices of the rows where rowspans expire (a way to handle multiple rowspans in the same row)
        var rowSpansDueAt = [];

        // Nothing to paste
        if (!rows) {
          return;
        }

        splitResult = SplitCols.splitAt(grid, startPos.x, startPos.y, before);
        targetRow = splitResult.row;
        Tools.each(splitResult.cells, fireNewCell);

        newRows = Tools.map(rows, function (row) {
          return row.cloneNode(true);
        });

        each(newRows, function (row, y, rows) {
          var x, cellCount = row.cells.length, cell, colCount = 0, rowSpan, colSpan;

          fireNewRow(row);

          for (x = 0; x < cellCount; x++) {
            cell = row.cells[x];

            colSpan = getSpanVal(cell, 'colspan');
            rowSpan = getSpanVal(cell, 'rowspan');

            colCount += colSpan;

            if (rowSpan > 1) {
              colCount--; // decrement for every activated rowspan (count will be adjusted below)

              if (y + rowSpan > rows.length) {
                // adjust rowspan to the number of available rows
                rowSpan = rows.length - y;
                setSpanVal(cell, 'rowSpan', rowSpan);
                rowSpansDueAt.push(rows.length - 1);
              } else {
                rowSpansDueAt.push(y + rowSpan - 1);
              }
            }

            fireNewCell(cell);
          }

          // take into account currently active rowspans
          each(rowSpansDueAt, function (dueY) {
            if (y <= dueY) {
              colCount++;
            }
          });

          // Needs more cells
          for (x = colCount; x < gridWidth; x++) {
            row.appendChild(cloneCell(row.cells[cellCount - 1]));
          }

          // Needs less cells
          for (x = gridWidth; x < colCount; x++) {
            cell = row.cells[row.cells.length - 1];
            colSpan = getSpanVal(cell, 'colspan');
            if (colSpan > 1) {
              setSpanVal(cell, 'colSpan', colSpan - 1);
            } else {
              dom.remove(cell);
            }
          }

          // Add before/after
          if (before) {
            targetRow.parentNode.insertBefore(row, targetRow);
          } else {
            targetRow = dom.insertAfter(row, targetRow);
          }
        });

        removeCellSelection();
      }

      function getPos(target) {
        var pos;

        each(grid, function (row, y) {
          each(row, function (cell, x) {
            if (cell.elm == target) {
              pos = { x: x, y: y };
              return false;
            }
          });

          return !pos;
        });

        return pos;
      }

      function setStartCell(cell) {
        startPos = getPos(cell);
      }

      function findEndPos() {
        var maxX, maxY;

        maxX = maxY = 0;

        each(grid, function (row, y) {
          each(row, function (cell, x) {
            var colSpan, rowSpan;

            if (isCellSelected(cell)) {
              cell = grid[y][x];

              if (x > maxX) {
                maxX = x;
              }

              if (y > maxY) {
                maxY = y;
              }

              if (cell.real) {
                colSpan = cell.colspan - 1;
                rowSpan = cell.rowspan - 1;

                if (colSpan) {
                  if (x + colSpan > maxX) {
                    maxX = x + colSpan;
                  }
                }

                if (rowSpan) {
                  if (y + rowSpan > maxY) {
                    maxY = y + rowSpan;
                  }
                }
              }
            }
          });
        });

        return { x: maxX, y: maxY };
      }

      function setEndCell(cell) {
        var startX, startY, endX, endY, maxX, maxY, colSpan, rowSpan, x, y;

        endPos = getPos(cell);

        if (startPos && endPos) {
          // Get start/end positions
          startX = Math.min(startPos.x, endPos.x);
          startY = Math.min(startPos.y, endPos.y);
          endX = Math.max(startPos.x, endPos.x);
          endY = Math.max(startPos.y, endPos.y);

          // Expand end position to include spans
          maxX = endX;
          maxY = endY;

          // This logic tried to expand the selection to always be a rectangle
          // Expand startX
          /*for (y = startY; y <= maxY; y++) {
            cell = grid[y][startX];

            if (!cell.real) {
              newX = startX - (cell.colspan - 1);
              if (newX < startX && newX >= 0) {
                startX = newX;
              }
            }
          }

          // Expand startY
          for (x = startX; x <= maxX; x++) {
            cell = grid[startY][x];

            if (!cell.real) {
              newY = startY - (cell.rowspan - 1);
              if (newY < startY && newY >= 0) {
                startY = newY;
              }
            }
          }*/

          // Find max X, Y
          for (y = startY; y <= endY; y++) {
            for (x = startX; x <= endX; x++) {
              cell = grid[y][x];

              if (cell.real) {
                colSpan = cell.colspan - 1;
                rowSpan = cell.rowspan - 1;

                if (colSpan) {
                  if (x + colSpan > maxX) {
                    maxX = x + colSpan;
                  }
                }

                if (rowSpan) {
                  if (y + rowSpan > maxY) {
                    maxY = y + rowSpan;
                  }
                }
              }
            }
          }

          removeCellSelection();

          // Add new selection
          for (y = startY; y <= maxY; y++) {
            for (x = startX; x <= maxX; x++) {
              if (grid[y][x]) {
                dom.setAttrib(grid[y][x].elm, 'data-mce-selected', '1');
              }
            }
          }
        }
      }

      function moveRelIdx(cellElm, delta) {
        var pos, index, cell;

        pos = getPos(cellElm);
        index = pos.y * gridWidth + pos.x;

        do {
          index += delta;
          cell = getCell(index % gridWidth, Math.floor(index / gridWidth));

          if (!cell) {
            break;
          }

          if (cell.elm != cellElm) {
            selection.select(cell.elm, true);

            if (dom.isEmpty(cell.elm)) {
              selection.collapse(true);
            }

            return true;
          }
        } while (cell.elm == cellElm);

        return false;
      }

      function splitCols(before) {
        if (startPos) {
          var splitResult = SplitCols.splitAt(grid, startPos.x, startPos.y, before);
          Tools.each(splitResult.cells, fireNewCell);
        }
      }

      table = table || dom.getParent(selection.getStart(true), 'table');

      buildGrid();

      selectedCell = selectedCell || dom.getParent(selection.getStart(true), 'th,td');

      if (selectedCell) {
        startPos = getPos(selectedCell);
        endPos = findEndPos();
        selectedCell = getCell(startPos.x, startPos.y);
      }

      Tools.extend(this, {
        deleteTable: deleteTable,
        split: split,
        merge: merge,
        insertRow: insertRow,
        insertRows: insertRows,
        insertCol: insertCol,
        insertCols: insertCols,
        splitCols: splitCols,
        deleteCols: deleteCols,
        deleteRows: deleteRows,
        cutRows: cutRows,
        copyRows: copyRows,
        pasteRows: pasteRows,
        getPos: getPos,
        setStartCell: setStartCell,
        setEndCell: setEndCell,
        moveRelIdx: moveRelIdx,
        refresh: buildGrid
      });
    };
  }
);

/**
 * CellSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles table cell selection by faking it using a css class that gets applied
 * to cells when dragging the mouse from one cell to another.
 *
 * @class tinymce.table.selection.CellSelection
 * @private
 */
define(
  'tinymce.plugins.table.selection.CellSelection',
  [
    'tinymce.plugins.table.model.TableGrid',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.util.Tools'
  ],
  function (TableGrid, TreeWalker, Tools) {
    return function (editor, selectionChange) {
      var dom = editor.dom, tableGrid, startCell, startTable, lastMouseOverTarget, hasCellSelection = true, resizing, dragging;

      function clear(force) {
        // Restore selection possibilities
        editor.getBody().style.webkitUserSelect = '';

        if (force || hasCellSelection) {
          editor.$('td[data-mce-selected],th[data-mce-selected]').removeAttr('data-mce-selected');
          hasCellSelection = false;
        }
      }

      var endSelection = function () {
        startCell = tableGrid = startTable = lastMouseOverTarget = null;
        selectionChange(false);
      };

      function isCellInTable(table, cell) {
        if (!table || !cell) {
          return false;
        }

        return table === dom.getParent(cell, 'table');
      }

      function cellSelectionHandler(e) {
        var sel, target = e.target, currentCell;

        if (resizing || dragging) {
          return;
        }

        // Fake mouse enter by keeping track of last mouse over
        if (target === lastMouseOverTarget) {
          return;
        }

        lastMouseOverTarget = target;

        if (startTable && startCell) {
          currentCell = dom.getParent(target, 'td,th');

          if (!isCellInTable(startTable, currentCell)) {
            currentCell = dom.getParent(startTable, 'td,th');
          }

          // Selection inside first cell is normal until we have expanted
          if (startCell === currentCell && !hasCellSelection) {
            return;
          }

          selectionChange(true);

          if (isCellInTable(startTable, currentCell)) {
            e.preventDefault();

            if (!tableGrid) {
              tableGrid = new TableGrid(editor, startTable, startCell);
              editor.getBody().style.webkitUserSelect = 'none';
            }

            tableGrid.setEndCell(currentCell);
            hasCellSelection = true;

            // Remove current selection
            sel = editor.selection.getSel();

            try {
              if (sel.removeAllRanges) {
                sel.removeAllRanges();
              } else {
                sel.empty();
              }
            } catch (ex) {
              // IE9 might throw errors here
            }
          }
        }
      }

      editor.on('SelectionChange', function (e) {
        if (hasCellSelection) {
          e.stopImmediatePropagation();
        }
      }, true);

      // Add cell selection logic
      editor.on('MouseDown', function (e) {
        if (e.button != 2 && !resizing && !dragging) {
          clear();

          startCell = dom.getParent(e.target, 'td,th');
          startTable = dom.getParent(startCell, 'table');
        }
      });

      editor.on('mouseover', cellSelectionHandler);

      editor.on('remove', function () {
        dom.unbind(editor.getDoc(), 'mouseover', cellSelectionHandler);
        clear();
      });

      editor.on('MouseUp', function () {
        var rng, sel = editor.selection, selectedCells, walker, node, lastNode;

        function setPoint(node, start) {
          var walker = new TreeWalker(node, node);

          do {
            // Text node
            if (node.nodeType == 3 && Tools.trim(node.nodeValue).length !== 0) {
              if (start) {
                rng.setStart(node, 0);
              } else {
                rng.setEnd(node, node.nodeValue.length);
              }

              return;
            }

            // BR element
            if (node.nodeName == 'BR') {
              if (start) {
                rng.setStartBefore(node);
              } else {
                rng.setEndBefore(node);
              }

              return;
            }
          } while ((node = (start ? walker.next() : walker.prev())));
        }

        // Move selection to startCell
        if (startCell) {
          if (tableGrid) {
            editor.getBody().style.webkitUserSelect = '';
          }

          // Try to expand text selection as much as we can only Gecko supports cell selection
          selectedCells = dom.select('td[data-mce-selected],th[data-mce-selected]');
          if (selectedCells.length > 0) {
            rng = dom.createRng();
            node = selectedCells[0];
            rng.setStartBefore(node);
            rng.setEndAfter(node);

            setPoint(node, 1);
            walker = new TreeWalker(node, dom.getParent(selectedCells[0], 'table'));

            do {
              if (node.nodeName == 'TD' || node.nodeName == 'TH') {
                if (!dom.getAttrib(node, 'data-mce-selected')) {
                  break;
                }

                lastNode = node;
              }
            } while ((node = walker.next()));

            setPoint(lastNode);

            sel.setRng(rng);
          }

          editor.nodeChanged();
          endSelection();
        }
      });

      editor.on('KeyUp Drop SetContent', function (e) {
        clear(e.type == 'setcontent');
        endSelection();
        resizing = false;
      });

      editor.on('ObjectResizeStart ObjectResized', function (e) {
        resizing = e.type != 'objectresized';
      });

      editor.on('dragstart', function () {
        dragging = true;
      });

      editor.on('drop dragend', function () {
        dragging = false;
      });

      return {
        clear: clear
      };
    };
  }
);

/**
 * Dialogs.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint dot-notation:0*/

/**
 * ...
 *
 * @class tinymce.table.ui.Dialogs
 * @private
 */
define(
  'tinymce.plugins.table.ui.Dialogs',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.Env'
  ],
  function (Tools, Env) {
    var each = Tools.each;

    return function (editor) {
      var self = this;

      function createColorPickAction() {
        var colorPickerCallback = editor.settings.color_picker_callback;

        if (colorPickerCallback) {
          return function () {
            var self = this;

            colorPickerCallback.call(
              editor,
              function (value) {
                self.value(value).fire('change');
              },
              self.value()
            );
          };
        }
      }

      function createStyleForm(dom) {
        return {
          title: 'Advanced',
          type: 'form',
          defaults: {
            onchange: function () {
              updateStyle(dom, this.parents().reverse()[0], this.name() == "style");
            }
          },
          items: [
            {
              label: 'Style',
              name: 'style',
              type: 'textbox'
            },

            {
              type: 'form',
              padding: 0,
              formItemDefaults: {
                layout: 'grid',
                alignH: ['start', 'right']
              },
              defaults: {
                size: 7
              },
              items: [
                {
                  label: 'Border color',
                  type: 'colorbox',
                  name: 'borderColor',
                  onaction: createColorPickAction()
                },

                {
                  label: 'Background color',
                  type: 'colorbox',
                  name: 'backgroundColor',
                  onaction: createColorPickAction()
                }
              ]
            }
          ]
        };
      }

      function removePxSuffix(size) {
        return size ? size.replace(/px$/, '') : "";
      }

      function addSizeSuffix(size) {
        if (/^[0-9]+$/.test(size)) {
          size += "px";
        }

        return size;
      }

      function unApplyAlign(elm) {
        each('left center right'.split(' '), function (name) {
          editor.formatter.remove('align' + name, {}, elm);
        });
      }

      function unApplyVAlign(elm) {
        each('top middle bottom'.split(' '), function (name) {
          editor.formatter.remove('valign' + name, {}, elm);
        });
      }

      function buildListItems(inputList, itemCallback, startItems) {
        function appendItems(values, output) {
          output = output || [];

          Tools.each(values, function (item) {
            var menuItem = { text: item.text || item.title };

            if (item.menu) {
              menuItem.menu = appendItems(item.menu);
            } else {
              menuItem.value = item.value;

              if (itemCallback) {
                itemCallback(menuItem);
              }
            }

            output.push(menuItem);
          });

          return output;
        }

        return appendItems(inputList, startItems || []);
      }

      function updateStyle(dom, win, isStyleCtrl) {
        var data = win.toJSON();
        var css = dom.parseStyle(data.style);

        if (isStyleCtrl) {
          win.find('#borderColor').value(css["border-color"] || '')[0].fire('change');
          win.find('#backgroundColor').value(css["background-color"] || '')[0].fire('change');
        } else {
          css["border-color"] = data.borderColor;
          css["background-color"] = data.backgroundColor;
        }

        win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
      }

      function appendStylesToData(dom, data, elm) {
        var css = dom.parseStyle(dom.getAttrib(elm, 'style'));

        if (css["border-color"]) {
          data.borderColor = css["border-color"];
        }

        if (css["background-color"]) {
          data.backgroundColor = css["background-color"];
        }

        data.style = dom.serializeStyle(css);
      }

      function mergeStyles(dom, elm, styles) {
        var css = dom.parseStyle(dom.getAttrib(elm, 'style'));

        each(styles, function (s‚ ÁU@ @d@	(¥DDY#¨¤Š
pC!GšBàt‚	˜; D5 `"‹E]Šp !€ ’P)è€ÄŠF'"Ya)Ğ
%%BH`(0G ™2ˆDQ Æ P&‘z°-„ @õPb¸ ¿ßo/î­|6øß›ç«›½òwêw&;?9±õéúoÇáS&œ·<õY'a[ı­ïOÜk÷
ìòœ”–Ã÷õŸışßô/£-/àO~óë'—¬§LÙ}-·¼Ûÿ–?ÒÅ·ß¿sá¯¿X¦“o;ó_ÚÕÅ•?é^Äûtö¿¦¾—ÿóN©Wé¿
.Ş>V{õÌ¬wfï¾0&mŞAeÖá‰.ÁÜÒîíÛØ«LùÇTïÛ«Gz•â:óM†JğUnk¹³8ÿnæÏ4çóÇŞÏ÷»ûïüõİäéşıåğué³Ù'¿XÆï¿“ßWß›E½ŞÏ“sS÷Ä^Ç“Æú­Çf÷ë6ziŠr*P(ˆX0äH¨Õ`ò˜ç.bÃ"‘† *E$”ª0€ [

‚8(D‹a½‘@h.1ÆÈP”Â,5¢\@¥"  qåfdIl à2G²Â "P!#Á‚«ƒP$§‹åx”][º¼Œ	ÿ÷>ëUÎ÷yïOÿÆÙ¸éÛ–y}³?tgŸv—Æ|ƒX¶¯g§•âŸfÆ?ó=ŸŠºÆû.½ÜP_±WÏß_o±&>.òXæØ>Ï—ì·Á~óZéWİ—7×Ã‡[{}¯¥ì‘øû÷Ûíûù‹ò_cÑ?B•’‰s‹àQ1‚%H0’¢  :aXc12!œ±` P”r$§V¡@ Àè'Blbµv@º ‹è%‡•h¢’$…¸NRM À) ²Ğ„c»CC+ Tˆà3 ’S â `,`E@¨#B@””Jrƒ €`M<‚n ä†„†2d €bÜH„¤À‡&`åƒ’à:ˆS°€êÌ J‚œ†T€e(§p 4Ë0€ õ `€”S¢„  bË’ HX  ÄözÃ]‹^¿ÍÿÛ¾-¾ö¶zûãEJë±™wOo½˜R­ëÙffû,kÿ—m}ËCNÖë7ÙRßíÚ&ì1}§-2uSUÛ®Õõ}ÃŸpÉ×Üè²ûİG\¤õ?öé{³¦¿7¼‘ı_n™ÓÿK¯ôMcúÁ¯uqğ›ÕÍ¶¼«è´ıX’ğw -@ ll$“H D‡Ò²€J+à„j«Bˆ€ÂÒB€ˆCFTfÄ‘ à´éæ²( ³ 1  v
00Â1„4@
”R”…8€ğ ğ C ˆ!" !LD¡€«2@R":@F3ÀwÕë¡}w¿ë_õîïñ¿|Ø|òÓÉû–î!Õc—Úîú.g¯¯ÓÎáò'-âÚİşŠ~şï»}Ÿ¿ÿû²yåvé?5®Sî©ÿInß3=zuî„À³ëá3ïÊ§~÷—J¾9ÿ×æ—pwËt~ß¾ó<ıwÿ¼?Û¿ÕÌı¯ìä×mûƒ}ÉT§¾tÇ½_ÿ^LĞ#Ÿî1ÍÊWÀmñöÚğ7»³—ùÜ=µÚgOd}g_¯÷OyVÏmÏ-µ¾†T,øÿoÆ×{¼©;İ×WT¿ü?.Sß µ™Ç½ºOşYCuû5ßƒ™o7®§‚\WW«‡OÛæ—MouÏÑˆË%"mÜQ‡"V¥¸ *T(€t€3aJ¸Q$*PĞ¨9%À, 2é(”0`ùÓŒÂP¨jà Vµ‚""`e1€€|1Š‚£A†)k[± €8 æ€<8&"Ê‚Á(V@
0ä"‘w€#‚û€‰ı”¬áÌ]»? îŞv“Ûã±ğ‡y÷Ûšf¿†ÿúÏõNŸÇåGbî@ô7şÿ¿ì±÷¾×™½†;ãŸß>šñ¯İÛW\·ùC=Güu‚rüÚõÉ·—~Ÿ­ÒõGñ÷okyÿÃş',õZ~ş×îÖßßûó(´şsò®éŞºÇ·İ§İZ 0T ¨PW Š(  êT@! ÃD†–ÆQ6†X(~²(`»p* 0®B_’ĞŒ‰b~ÊZÁA ³C U™àL	Å$8€À6 €#Pa ˆX …Â€™hPB  ,#b`¢2$‹E¢ "$D	0p‹†™@++:dKÁã "#†( „Æ%âš p± €³J@  QKÍÖˆØ‚’Òâ  °F)eIœ ˆÂx†’É‘ l(±„À$¨ÒÂ.Ùó6d]x÷~MççßËìŞİãïwÙëNC÷·VÚ~ïŠå¾^âªÅgòñá”ÿ/¾¾Ñ}G¯şl‡çê]õ•i÷õÔşÅ?g¬Îû³K2„õŸõÖñ¾¥ÿ¶Ÿï#ÿÌ¾8u¾şß¹¯ÿÑß»ù[Õîë÷¸>šÏ#ıæw§1ÛàDDÌ¤I CE]2¦‹° A%à	ı<UFB`Àq‰  !ŠqòFQP±(G€€D4`I* !ˆ@` 	B+Ä(sƒd 2Z'NØ ˆReT€†ùH$c¤µ 'BÂ0ÅVà	ˆ¤Ò«¤õGÛ\–-«½®şzb·ÿù“çF½ó¢i‡ˆƒ—}w¢?1ªå_İ¨ëmNdN•g9ÏıßÆo©ğüçkÇ½aßıû½;[Ş9ë÷µ·_Á½Ï¡Û}Qÿ^Hgû·Î¯_ŸÉ|ß;â«¿&ıÜ÷våéÇOğòŸ§Ö³víÿÜüÿıñĞÌäñl;ôÿ¿¼øU}û†#İ¦¿“–ÿøÅiüÿlõıö¿ñ·õ”äòW»mß»{¦~_å>Ï„'[|ìûì¾YÑB£äÜõşİUB/smCş"ŸïošuO¿½¯«^ÿÆúÆv¬êø½Ûß¢Œú€ù"Ã	@ˆÑ 7`((I -Â0€$Œağ  d0à €h†@xKIE $€DRS
­² ˆªNÄâJ¬P7Ii ¦B	 €°Uà×@¢BB1ƒ
@RGˆ &©‘¢pàh¼¿4<ı¬£Ø|ßÔıÿê‰ïş&³nÙooÿöÏ _Õue}ùÿËÀ]ğ9¿Ï‡£3@»¿ï›1×—åı<Æ?|á.çÿÿ\P_5ûGşÍçt§ÍQÔSûÆŞçäé™â?Ë^Ïïİë²w«æKìÑ¿÷WÏÖG³ÛÿÿM×Êÿô[¼ÿßÎP"Pƒ…q€EğR|ƒ‚-$X9 |pC$€Bà *
¬=EDT` Î1“©`Pˆ„† €…DIÙ@XPIÔ`˜H•  
@Ã¨$XP 
ô„CZ ª  œ† @ €(XÕ Z´‰ `>È‘èÀ˜	CV¥b’@‚ˆHB œ²% Ì% 1(„X"*@ # P0X Á @ â-ğË2â@„á` ĞT	GÄP   d”ã Ah`€¤@L!@4J D‚8p ¡(  … !   341«÷õëéËOï¼Ò‡{—ítk°ÇÜ“c+}šùß¹ÿç8ÏsÙ¡tüoŸ¯úÍ]¿×ËÿŞcœ7ÿy7Küx¬_ü•Â?KÁÔî¿Ô³Sß;çóŞÇûöu	Ã’ì÷â[®ş.T÷ı»ı×¬/{?{'^ÿlî3Îâ_O÷¦~­³sà–@$€&¡
 ! ‚% VXˆ•(IH`¡&„’‚(¥\p‹TÓ†4 !°dÀÒ¤ ¢EüĞÁˆaBP[ \DÕ
€ +’:€FŒ4˜€† Hè0ÂP‡`—Kš5r•ç÷éúôŸEW¬Õ~nuşŞÄô×÷µóÿ¯Ù“!ÿ–E‘ëKsµM¾{w¶‹¯Ètô>Ú²q¿ğçÿZ_‡–ç¿n Ë³íÍ¾œÕ¯é.Ù/ô_ıÿÑÛÓıü>Ç¾-“¾ÄîN…?º»-së]Û?W=ÓWö¿€³È‡·Úi?İ_öš1/²¹áYo’“ë~ù<*=ô¶Y¡Æ«İ—ÈşñüaÒSìÅ÷ÛN5&tİ‡]Ûî
Èz¿ÿ¨ÛesÏşá¿ªŸÁÉøïk}ÜÓ{_\{ï§¸Ëï¾úOíõú›:ùşÿ÷÷ÿ÷-‡^şÒê£+*u9]?¯xkoÿûõVÎk7ş0e5(Jåa0dN*&hM"  L–$ ÔC½q" ‹ÈPxÀP)@PBbÉ0
` àaP6$4‚P àŒÀ:¯…ƒÕÅ4DÄ	Ò À ,a*V8ƒ!4c¢0©0h‚ Á!¨ …€	ı½ÿi¿ØêõÿÿÛæ•œ½½¿¿¿± [=ÓV÷^”•‹¯c¿µŸL‰ĞuŸ¤CÓŞ‰óÇ/õ^Ë}ØÏBuÿİæ¤}ûû«':ÎÍô,ß7YÃòT.Qj.é7÷±Ü|lW¿÷1İ£nîm=Wÿ`÷Çæµ×xz¢mc·ß?öl 90ÒŠÙ2 `ybO
Ø+VÁ0¤òˆŠ¦‘ˆd‚!Ä:ÉîÄd© ˆU~üPMNa>Sp€² #™^˜Š­a „3 1FØAgB#î  ĞˆC
³³Aê0øH ğ ‘  $@\BbF0(WªdÀ£@D0 Ä'ˆà)Å@‰¡1¨‚H€~†0 Ó£Ñ
à!/@0Fªê  ¸‘$‚\lH!ºR6!èBCÀ9À”CPrÈ(†f `•LC  „ªÍ C‡âH²@®Šx Q š²"›MÔıå×—›_Üû36Û=vÿ¶®Ø§öú¹Ûô·œÕI¥İ;µã {vïîš³^uï—öòû-§îó„öæ¿ş6]iÑ®ªÍãö¹Ó‡Ÿw–Ë¬ûn»ş¯ì†ÛËŞnºOş»	ŒüÃMÏ^_Æ¸sÿòTÆûÃn7«Sy              }
            }

            return firstChildStyle;

          }

          firstChildStyle = checkChildren(firstChildStyle, cells);

          return firstChildStyle;
        }

        if (isProps === true) {
          tableElm = dom.getParent(editor.selection.getStart(), 'table');

          if (tableElm) {
            data = {
              width: removePxSuffix(dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width')),
              height: removePxSuffix(dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height')),
              cellspacing: removePxSuffix(dom.getStyle(tableElm, 'border-spacing') ||
                dom.getAttrib(tableElm, 'cellspacing')),
              cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') ||
              getTDTHOverallStyle(tableElm, 'padding'),
              border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') ||
              getTDTHOverallStyle(tableElm, 'border'),
              borderColor: dom.getAttrib(tableElm, 'data-mce-border-color'),
              caption: !!dom.select('caption', tableElm)[0],
              'class': dom.getAttrib(tableElm, 'class')
            };

            each('left center right'.split(' '), function (name) {
              if (editor.formatter.matchNode(tableElm, 'align' + name)) {
                data.align = name;
              }
            });
          }
        } else {
          colsCtrl = { label: 'Cols', name: 'cols' };
          rowsCtrl = { label: 'Rows', name: 'rows' };
        }

        if (editor.settings.table_class_list) {
          if (data["class"]) {
            data["class"] = data["class"].replace(/\s*mce\-item\-table\s*/g, '');
          }

          classListCtrl = {
            name: 'class',
            type: 'listbox',
            label: 'Class',
            values: buildListItems(
              editor.settings.table_class_list,
              function (item) {
                if (item.value) {
                  item.textStyle = function () {
                    return editor.formatter.getCssText({ block: 'table', classes: [item.value] });
                  };
                }
              }
            )
          };
        }

        generalTableForm = {
          type: 'form',
          layout: 'flex',
          direction: 'column',
          labelGapCalc: 'children',
          padding: 0,
          items: [
            {
              type: 'form',
              labelGapCalc: false,
              padding: 0,
              layout: 'grid',
              columns: 2,
              defaults: {
                type: 'textbox',
                maxWidth: 50
              },
              items: (editor.settings.table_appearance_options !== false) ? [
                colsCtrl,
                rowsCtrl,
                { label: 'Width', name: 'width' },
                { label: 'Height', name: 'height' },
                { label: 'Cell spacing', name: 'cellspacing' },
                { label: 'Cell padding', name: 'cellpadding' },
                { label: 'Border', name: 'border' },
                { label: 'Caption', name: 'caption', type: 'checkbox' }
              ] : [
                colsCtrl,
                rowsCtrl,
                  { label: 'Width', name: 'width' },
                  { label: 'Height', name: 'height' }
              ]
            },

            {
              label: 'Alignment',
              name: 'align',
              type: 'listbox',
              text: 'None',
              values: [
                { text: 'None', value: '' },
                { text: 'Left', value: 'left' },
                { text: 'Center', value: 'center' },
                { text: 'Right', value: 'right' }
              ]
            },

            classListCtrl
          ]
        };

        if (editor.settings.table_advtab !== false) {
          appendStylesToData(dom, data, tableElm);

          editor.windowManager.open({
            title: "Table properties",
            data: data,
            bodyType: 'tabpanel',
            body: [
              {
                title: 'General',
                type: 'form',
                items: generalTableForm
              },
              createStyleForm(dom)
            ],

            onsubmit: onSubmitTableForm
          });
        } else {
          editor.windowManager.open({
            title: "Table properties",
            data: data,
            body: generalTableForm,
            onsubmit: onSubmitTableForm
          });
        }
      };

      self.merge = function (grid, cell) {
        editor.windowManager.open({
          title: "Merge cells",
          body: [
            { label: 'Cols', name: 'cols', type: 'textbox', value: '1', size: 10 },
            { label: 'Rows', name: 'rows', type: 'textbox', value: '1', size: 10 }
          ],
          onsubmit: function () {
            var data = this.toJSON();

            editor.undoManager.transact(function () {
              grid.merge(cell, data.cols, data.rows);
            });
          }
        });
      };

      self.cell = function () {
        var dom = editor.dom, cellElm, data, classListCtrl, cells = [];

        function setAttrib(elm, name, value) {
          if (cells.length === 1 || value) {
            dom.setAttrib(elm, name, value);
          }
        }

        function setStyle(elm, name, value) {
          if (cells.length === 1 || value) {
            dom.setStyle(elm, name, value);
          }
        }

        function onSubmitCellForm() {
          updateStyle(dom, this);
          data = Tools.extend(data, this.toJSON());

          editor.undoManager.transact(function () {
            each(cells, function (cellElm) {
              setAttrib(cellElm, 'scope', data.scope);
              setAttrib(cellElm, 'style', data.style);
              setAttrib(cellElm, 'class', data['class']);
              setStyle(cellElm, 'width', addSizeSuffix(data.width));
              setStyle(cellElm, 'height', addSizeSuffix(data.height));

              // Switch cell type
              if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
                cellElm = dom.rename(cellElm, data.type);
              }

              // Remove alignment
              if (cells.length === 1) {
                unApplyAlign(cellElm);
                unApplyVAlign(cellElm);
              }

              // Apply alignment
              if (data.align) {
                editor.formatter.apply('align' + data.align, {}, cellElm);
              }

              // Apply vertical alignment
              if (data.valign) {
                editor.formatter.apply('valign' + data.valign, {}, cellElm);
              }
            });

            editor.focus();
          });
        }

        // Get selected cells or the current cell
        cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
        cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
        if (!cells.length && cellElm) {
          cells.push(cellElm);
        }

        cellElm = cellElm || cells[0];

        if (!cellElm) {
          // If this element is null, return now to avoid crashing.
          return;
        }

        if (cells.length > 1) {
          data = {
            width: '',
            height: '',
            scope: '',
            'class': '',
            align: '',
            style: '',
            type: cellElm.nodeName.toLowerCase()
          };
        } else {
          data = {
            width: removePxSuffix(dom.getStyle(cellElm, 'width') || dom.getAttrib(cellElm, 'width')),
            height: removePxSuffix(dom.getStyle(cellElm, 'height') || dom.getAttrib(cellElm, 'height')),
            scope: dom.getAttrib(cellElm, 'scope'),
            'class': dom.getAttrib(cellElm, 'class')
          };

          data.type = cellElm.nodeName.toLowerCase();

          each('left center right'.split(' '), function (name) {
            if (editor.formatter.matchNode(cellElm, 'align' + name)) {
              data.align = name;
            }
          });

          each('toÎ÷®WóNkşF÷»ë3yKö/ÿ«æúİó>_¯ä3Ïñîİÿ§	¹oŒ÷yšËšŸä«gÉïvŞ?ùS®fËöra{¾„Ö™õğÛÖ5Ò6o®öçÄà¨:»¿,~e8ïv³CHmíÙ¦ù~ø×…ß·ğÑ‹¾)Kÿ»¯Ô'uóë¾ÿÆ”ßûéÓßº÷ÿ˜wş÷ş·‹¨íŸÿ¿÷ßıÿOıö½æçƒğº¶¾ÎÏâÉ{ŸßkåíWÕüİû«(lß_¡ÿßõıâûšÓ~¦O¹ÿ˜¦{_sìßWß…ì¶~º;|ÿ‹OrÿLæ³‡¿—ùJÿÿ}‘M×šŸ­™ŞkyÖüm5ùßûiı]ÿ}ßŸ÷zgËS½~Z‹_Ú>VÜÿ—‡SÎ*ÇÿÛ»şÆû‡¿¾K»·şÕïßÿ¶ç¿Y¿Sóšsÿÿ.W’Èìz¾ïø©;ûñúo»/öúÛzûß¿7
ûÜ½3í6İyòKûÿ¿Ú}ûÿ+ıì›óGâ¨çšÿ»nİWıñı.E·òOE5wkQJÜ­yı“ÿvä­_ñàîÇ¼ßë?ın£§ş°Ÿ¿ÏÎÿZşI»omã?'õÿlgŠz•ëh¿çÃzÜ÷7ÿ&[üú*Ãàÿûßú1ñÖÿc¿nğd_±	uÿTÍÊ	's~ãGF@Õ~Ox~âNÕ­£ßëÿ~|ïoŸ¹ªŞ·Õ¯”]‰óÔ‹ÏÙ£m:®Ìİ×¯ÿjë¿‘¿[Ûù=Ã˜Å·ùûÿ~¿Öäv%Óö{øâøÏî°ë»’E¿ŸY‘zo‚¼ıÿ®ËÂíNk×~K7Ïùûï›{ëÿªíª±i]I§›ıßå¶vuI#Ì%ÿaßŸ±ù>ÿZŒ¶îıìöıãå#>}şî»}~w~§/Ç·™GŞÓğ›Üïqôw+yùã®êşØëi=ZÉv™”ôş½üq’HW“ï{‡×}vâø±}_ÅŠr˜ånÚ,ôß§çvIÿLnŞœgûÏß÷·ä™ş.4r/ŞM­½|gÿë…;ğ#“Å’1Ûs¼~ıûo7}úw×¾Ç[yÎàC·aï¸õwbÙìxç¸JÅ³Vnû”RãÅk”ãÁÂ.ş¶Vu¿?Ô;ızŸş÷øo@àfşëŞîX"ïî®É|yh·¹ÊNë¿ziÏÿ‹Ì¢ÿ{ƒ·~cëÛÅ–?Ş©«|¿·÷ı_÷¾ÿPñò¥é‡¾tÿ¿¿'õvÿaßû3ùë»~ˆ¸NúıÇ÷ÿŞ¿úÛŞ£­«¾şü’ï^µïw^Î}¾ı|óç½İì­ª5Hl=¯sµïïçÆßëêïûü–~~óNç~âûV\6ñ_òßÕ>êg4±Î®r›şs[i{~›WÏ½Ôı<wÇÒòÜÃv‡8P}n0¾ÃÔÉ³€öWÖ­ß§Ûõë¿4[¯ÍiäÉÙûßßÓÿÌ™°îŸ¢bõÅïÛñ^ò×X9ùÂ=×¸úíŠ‡Vÿº^~»rÿş•™Ñ{š0µÃïş¾b_:/õùô)uEzEıî/Dm¶÷+4Ìû#OÃ}÷êj8­·«×^¿ê×¹nmÄûöıX×øÓ·ÿêW’‰ı]íÿÏo±—©¹šsïÌ÷ygïúí‡î®úí>şŸÿw¹‹ìøFÙç¡w¯Şgg¼Û¿æ}û½Áİ­—gŞÊCÿíºz3ûı{óûêèëÚı÷Ç~ÿlÿéæŸ÷nş³ÑÍÿÿßííwönïÆ·ª‡ïü·ª¿ûÒq¥KÖÿcæ¹;Zíß?Ë¯Şç‘ç“—ıéºÿÿç{ä§ãøğê§Ú»şşÛ÷Uô»nëÿ'cãüOõÖòn|ıÕ©W}uØûhÑÍQ4_›*š6û:‘šÏ—wi›¦~Ò.ı¿üç¾úlcnfS¬òwÖ=úÿæÿg*Ë;oã«şÇE3õãZæyóVçßÙå1Â6\=Ú¿ıÍÿÕî WûFê˜0“ŞU²?ßUÇYìV‡Ç8¾Ç8ÿ¹2ŸùïÓÜÕ¤/ÎÏ®Yk×-é7CuqM¾İµİnÓkú{ã¸W_×ûc(ÿsİfûûûÔ~ß÷WêÏoæ×^ÿ?ûûŸß´·õşnå=×ıÈÓ;ï¿0á¿OÿÄgı·îãïïGìãııï}ï}‡¹¸½ºÿw~ÏugÛ±ÿù¼Ï·7ù°,ı_îÍåıÏßk>ãÏï7}öm)¿·Üx³¯¿ÖŞJñu5×·ş¿•?ÆÙ­NXØT4ùŞ÷ô¿İÿÿŸ¿}èÆ¡şñŸV°Ï¿XS¹ëÿ^?½—Kû´]éeZùÈø¯ü»m*õS|˜ã‡ŸSù²ï`>cí;¡ù[°¨ŞÙôÕSüÛ.·º¾GztûÿµĞ\}Îêş»î>Kã[•egù“Şjú}ÿûûµ“€®yİw¿ß{Ô¦Ÿ~_ı½Ì2wÿ=­ıÿ/×[¶¸–ê+ô•÷^«ıíévoœkq?ß·÷?ıÖ·êì§{c®ïbƒÈë©*ê£]¢c­hg¼ş<ç–ÏhÛ~{ó÷5O=ŞßwöøÃ_õ—õeï¿§7ÒN§Oòş¤‰«|¯ûo½?Ù_õ¶Ÿ5ÿ”µß·¦Å5§ıÛ®ÿ¬ïÖvıì7¼ø\öšT[ÿ 7M­Ûï®ßñGQ/ÿZ×ş±~ïäÏ³¿»ªÏ£÷SÿÏ»wìßÒ÷ûíÕÿ¯©óõÍÅŞãŞøzv`«•õÉÚ}ÍË—óÿ¦~~ß%¿°ÿoî~óŠâ¶ıæº‡×môOıõúõÓÂóPß>7~ÿ³ı7¸}_%õ?"+‡ß½i§}+Ï[-‡Œ>}¡ı÷ıöuñKwk¬ÿ»ƒUyNŞ§ˆ{Í}õ¼ößÿ8Üõ_û®}Üw}ÿ§fâx³ß¯Y:ëùöûûó·°v»ğoPòß½³Éÿ´òŒ½}4ù7÷¼\ÿŞù¿úo|Åëíz‰2yÍîÿäõ7oüŞgğZóş×Êï©õs:iwíó¶×øşoùÿÿ}îÛ«ÿ9Ë²W®œÓÕÛÒæüÛüõ÷İ]æ}Ûõ~¯ÿî}ı_m4Û*¯ç5¿ô}ÏÕ¼+øëıÒhÿVO¦½1uîïÏzæ¸şûãö_uüvõ§Î{ûsÚ½]GµÚº+Ìæ_xUŸ¯ûü‹œócû7ë¯*Ö/Lê}m7=Ö×‡÷¾“j_­CÜo{½Ï[§õÇvúÑÕé&Şg×wUyooq»Ø›T7—±ïï>ßÎš+ÿï?ü/ÿMŞ®ëë—ü¤şöŸënòó~šœ*Ìöjñsàmw×mêïÂíßûG½ŞüÙßĞŞe«©ÉÑK]ûô:ûBpóaê_OßûµMjô®<îWº÷ñõĞÆ/IŞf—¹>çûş±ÄéÚşójZZÎ1nŞ×Ç±Û$;úF=á¼EùöÑåiå™IşŸ·÷©¿õÃâ/?öÖ÷ü¿gxîuÜü_½?®§_çöÅ7ßw¿Æıô Kö3¯Yr÷wÿ[¿ºôBıvşİé?íªÿèß‹‡gæ¿ø}¿ÿí÷ş½+¨NÜÓ?ÄëúÙ’}²ø3Ş©ºzûÿûÜwİÉœø¢úŠ¿û.ço_‡°Îû¼÷(«².íOõŞïbû{Vÿ/‡¿uë<aÎO?~fû‚ï]'syZ·Ë«¶tC)ïîëáŞïË/~}7v7ÉŠëÿóëSçÎìñ™Lwd7"½y…úÛ5Ç¿ïïü¯qÍ¦¿ßıë±Íûÿ]m?Cÿ4ûË>ÿûÏÆ-]•øŸãVïú~•÷ïÇèWçÉ’5zIûßZé}ÏÏq¸ıKóúÇq>³_yáşîlşxÿíõùQ·Ô¾{øoã>îóİlSƒ7OéûAö8k¿ĞyÆÜaàÃ‘·koÑÏæìzsÓ.nRd¯í¯ò™\İó^N½È6râ7{Å·ÿqó¯oÿ_ògüJËo¶xïHaú×ï™–Œó¦ÓÆıß¿b>ŞùØÙ—ÿ?ûëùü÷h3ı;ı_ßûŸùßó>ÏÚæm={úûÔîŸ=5º×¯ïmßşìX®—ÿE^¾âï¶ï÷Ëÿ÷çêZìÙ{½zómİıï>ï¿Vx~?ƒû.\Îğûùß˜¾KvÍç,<¤ÜînV¿ß?ğloí‘Oò|ëæ?Í>×aSŠ¾ß“û?tËÖç~O»ïXíş™áˆë-Ô}·²vİ×æ¾Ë`Àš·ğÚoë³Ÿkêşïö²ÿw}Ú¾Gíâ·ä?e¯í‹—ƒe×1wÎ‡şßç¼w?ó¿Örç}óè^°{şŞ"è:õò2k0ˆı7wÏõwö—ÅQ»¹Ç|SııÚî-¶?…ŞÿÆËşû]Çæ¿ô:3Ô¿÷÷ËİşÜû{Ãùé¿øÏöŒïÿÿöÆ?Ç¯öÅ¸¡ãÿ^¯ÿú«×Øİ<[zã¿YÛü½gù¿w­¹×Òÿîûºeû>ş.RîÿûËl÷»c¹ÿpıû¿ûÙºıÃ-÷¿[ì?ÿoëùmgñì¹¥ÿ6oŞ_>ß)·ûÿo+ÿÿù§¶Òïüºë©ü©ûş·ôZ”İîUÿ¾t4ÙÒìû–îÌ%üïŸÛ½û^îS¾ş¦÷ÅÑ÷¾ÔµİœÍ¢|j[ï@n¦“¥<şd³7¦‹zçÎÔ¿şÿ-×Î¼şú¶¬~ïNÿŞ¾
ÜğÔßá±æÙÛ<]¼àügÇş}·wŞù‘ßæÙ)1~³ÿúó³¢E?ÿ¿2øí©ñ~ı×ãŸ»M»İ×¼Oböë)öò¿õÿ¿F»¥¯µªJ¥_ÑNå_ŞGx;÷ñ<5Œl¶ıo©ÿò÷ÿ³îÛ¬¦{ÿ÷|ãy÷¿¿úloù™şÏl?ÿæS®oÏõÜûï»pôµ¾úÏŞş_Ù^Ç·^®²_÷Ø=ÿ¾»Czı¼gûÜuZvøò÷ŸSFökEÏ®û}>ÑÚ¿.ëÚÚªÍ÷ù>OìÜ•ı-ïsù?şıöëÓ{Şÿ~~ŸkÏcI}mñ›²«Òfw½UçÓë~ÿÁÁôëIß±î¯ó‹Û6_[³Û¦¯ú›cœü·.ï1Ã`Üšì÷.ßuİSO­ØhËÙ·GnZºN{iîï6÷ıø|kó{^Nœ<³ÄYÓŠ§í]şğ·ÿj³¯=6 ³6"¾¿ÌÖzı¬·Wöúqû¼9v¾ìù6‚÷7Cşz÷Åa±ÿ°÷Sß¹ædQûÇÙojŸıgòÛÛÅf?>äğ7{­··Ël:—`—.;ÿUí¯şÍa§ù»–ïx¾.Ã(À>×/Rôÿ¼ëš¿,ƒ†ë]şó–má½è»û2¯/Æ¿·ı³¾1ºÿ}¶-ßpj»ZwÿöÇÿ	u·ë~(÷rk}½+Ü¿sİËıŸæwù­éˆçúÿÿ—évÃr'îÿÿÔ¿éÿİñü·ÿ_vü{ïó¯İg+ËPfÿ¾ö=Ùu¿N}—Wæ¾½ÇŸÿ¶§»¯}Ïßß{Ó¿}åöÖú?›>lºòu¥6øõå/ó[Yo³3ãj–‰v¿ş.îÏ/ıä¯vÜıî{nZ‘™ÿÔ«‰_õÛŸğŸõ5Ì0se÷Ú'v‹Àw•?ş±~OúÙìOõ·nró¹šv{4ŞÇ_7ë¯k<R¿÷´ìá³ıp—ª;o?¿o³Ó«êurßát–rŸİo ¡,ô…0ÀT¡4Š@$…À
â p‚@X¦ *)@€ P&¦ˆ£ B0\mÂjPÌ¸ 'C!D0àØà` €fÄ  F” ×°B´Ï-1`u`€Xƒ€	¡ 2Vàº `@à†B‚ 2ÂU‘ ˆŠt ¾")&
k‚`a!@ L  Z PÀ†Æ`Â• À™l À !Q 90
…CaD! ˆxÀ‚8
pH¬)f$›B  }€bM	‰ P¶¨0 $ PK€	ç‘ÀH 	DB e`0„4İ<õ×r<k«Ï~¢<_ÕGÓ¥gëß]²I×µÎ½¯ùÿm¦G_,P}ÕÀû7ç÷×ÃÕº÷±ÆWîäÖşùè÷ÒÉ~|µ»~İ%4lÎ“ª¯ÕMÅ¶wm¶ÿmïÿôÿ·¶–ûª¿ßdaf¿•·wßåñßÿİúKë[ÿ:â¬`DPÒ€pu¢,, h	 )ğ¬|"@¨"„@ 2)¨  0 Ô‹B0¿pbÅ	(!  	€#h!E
0‡]‰§`¡ÅhKŒ‘ °‘# Iè:$ãTGä¨² CD€ƒƒ@ˆ  )'E P& ¿[­×ïuÈ©kqóïmù5†ÿó½U÷·Æ™ı	£§9óù.œ1ÛçõGó~úùWÏ¯ø{Ÿô¿¹çö×«èÿì¿Ş˜Ù÷Ù~ùÈ÷XÿğöX¯ie×½Û?&;aısyöÿ¥¿ö¯}<ıû.¿ºÿJÕ£¥ÏéİşJıoıàÕwàŸıı¿g¿’¿ã¹Ù}xëıTæ7ë7şX?U½Ókp„ñúß&¹ªîî6?j›m¿mßşÊ çIäc{k¾K½´æq)sı5ûßU›İï{şîC•Ÿÿı/»Ç;İÇ½ÿäO¾³×¾ÛwÔs÷Ì¯;m½ÿ¾®×³k¿ôİ2ùõ<îQÈ¤DÉŒ!Ø h$ Ä‚š4  a›ä €A!2$h7”B % "A&’ƒÌ@ BB´ÁYa0„C@H°ÃC€`f g ƒÄ€‚ŒA 8eÀ%“Á%Da FK±Fd E¤° ƒjG4'*‰™A½ ş©éûzòs¯Ùõëaåï~÷úï›ŞrßÍ»ÿ_Q™ä«ï­U_Z~úëĞ‘÷§|vñMİ´o"—:ùï•ÜÔÛw³ıçÑ–ŞÃíûSs¿åTŞ|?}¯ö7í¦Í+R‹ïõıNİè÷Owûy_n4ã<KíX·Ë°¯ä9Ñç½5ş¨€¢€gÖ0¨¤"‡! !LÄ‰€`øL…&ˆ@L¨4€bÌ(È'P"F!5År%B€`0€…ˆÀÊÒP4ZD$ˆÅ$@‚1]	2Š4(@ 	$€"BPajˆÂ „%)
H‚@‘¸
  H@^JÀòë£A`€¥(@0BvÊ€1¢"%b!e	ƒQˆCBP€="˜ô
É,ò`(Ö´€Á`SbA>"h†x(¨0  @$ØP @pÒ£@ ø#H—@  #ãFZ‰(£êÎ·Ä|ÿy·Û~|µ¿Ü”xW³œ}EÒvï×{‘Öÿ¶åµµçõáÆ²¦{`a~£•õ*ïÖè¢Ç”{Ù÷›úzı“çßdûÏyÛ¥çe¶ŸQçŸgû'öËşŸ×gú¯?M¿{¼>åTúóÌòÿ‹Y3oıõñ÷,Ø=é>ã DÀH   0ÌnHD Ò+	D >#8!I	
İ±…IÖ SQ¡D’" ƒD€¸”%¡ €PXP é\—€-„­ H ŒX
 Û	€Xe QFĞ¤ˆ0 @ D: Øõ
„‘€BÏß/¯ÚoCşw¦ïû½iş—ío_ï¼ßÚ&{D*1»Ëİ£:O£¥Vª÷{µÓn—ˆí[K¾5·*Íï}ÙşÚWo¦ßıúê¤¯·W‹óNãXnÄ~{ıOmww®c¾q¿­ø¹zé\ôÿ~#ô='}¯½ÄO±åö;à÷ïëæş:»¾_ï­Ú«ó[C×í—×n‡C¶oÛ¾üßCØÇ•ö4wç|;ø:&²†ÃWnÉöõ¾nöëŞ±¼ŸíeÊy¥í6çÿÈÈjs³ú¨¾7×Î>˜÷·ù›ê×¿Ÿ	£]7ş­û§÷_'ŒÅ?¯—ÿyÙèŞıüwéxßßµêË@% @ˆ†,…€4€ÆŒbŠ`¬¢@ 	 d€h@@è	Ğ‡p€ˆF ğˆ×(0…à€À€+ĞJGÆ@‡¡ jƒ¶ ¡# ŒrxHŒ" ¤!•`r 0€ Ú48HJsét HQ X×ä—½ØËÿ”òf×­kR?íşşÜıéîÿ_°£=¿n÷çe+±Îñ¿»ó¼ÿÙÎ°ÿİí¿z;Vû­/÷ş
*ı>Æ­Ê×¶*Úg¥¥}üÔÿ½ò§$‡ç-w#÷_­Ÿ}zööÖ½/üü|vS¼ü¶ÒŠøÜöuÍßŸhí]®~ÿî &   h' €š ‚``X		`q @ŒB€I
@D„
Äh@D @††‰$T`B ´"¢ùˆÆ ƒpÂ¢ŒjÃö PÑ„’¡ °ÜEÜ@ ºD‹AB3APJY!XLA`T"15„2–DL‘	iÀZ` 3AD',à€•‘@BÈ(”&æ†Ÿ0…t4B	¨‚Ò @¢Ê€1BD*¸Ë`ª€„@H#L„å,ÁĞ
š‚ `´„q€A‚‚0=@ ĞIÀ!TëA$”äBd>´òãŞE´ÛÛÿG1­/GÿqL÷¥Ægã^Úyï¥|=]ô¿877™½¶æÉ¿†ŸÓş‘›Ïşœùî¢™©V¿›úsşû;'Ş{ptÿµmŸù~;‹~Ïs}ñ½¿\s¾jwœoqõ®wïcî_I’z˜ü=Ó°>÷ÿ¶Ë¥sîÿòåÔ‡ •X NĞƒ ‚6'Dd¥6„µ›D» ¨°lYP R„à“&:spBP¬)HÀ h“Â)
€Ä0ê€"(( ÖÅXE q¡
Qg@À€ÇŒÔtF¨Á€ZğšøA°G´h	)„` <, cÿ4÷‡œn.›¨{ßˆ|úfŸ3:'~üë¦ıêgıı«ï–îûºùıÇße£óa{?[w÷ßú_ÍÿµÙf¼Cı¡íİ×ßË3ÍNÿæS[ o¼aÖ}ºÍnÉı…xKù?èßÿ÷‰?gow#­—ÙøÍùæ?‹½êëñÿıçœ3o³O×¾xtävïÛyı÷o¹¸¿ó÷{ÿYù†ñ8«¼¼ÌG¼Ë/òı<©?ÿ¿àwıO=oïşsv¿}×¾£ágËÏ?#_Ì[Ö¯}{¹,ÿÏ~é»¢ÖyŞÚ÷6ëó»Ù¶öÀMÓFù÷Ï6×ó'1w×»çÆóÅÆ¯eV·“u´¿Û‚X¨¬	@ –¸…   QaÂKD1 0ñ$H
 R$Aˆ 2À-0Œ‘ 8 ä@ H€0DÆP"À(ŒcæGf…µ€¯€C)À""€Ù¨€¢“ 
@P0xªƒiˆÍÊ˜, ƒ]6<ÀD`š]	wô÷{[—‘çİù»â–Úªqá{s{éí~GÇşÌìSú9nëÂñ{ÏúvL²¨VWœpr¿ÑOcwü§ßÿ[óõ÷éSºÁ¡×µÿ}]ÆÑ»·½ÏåÛ»ËŞi7ùuÿÿTÿ·½SéÚ:qÙ^¦åîå?–×ú÷Y³ı‡ï«$ÎAP“% (¶BBBaPÛB‚B@Ğ(ÚB€ˆ¦¨ A@P©UÂ†SN“ µ1ÁP1PP€ ĞˆˆM  ¦P2bD• ©JÔh€A°Ì€X(hª&J%4ˆ	 ÊD ¤À0Œ` P €‚ ‰pi8‚€€ü®¤„–  €ƒ2ËÀ )+ZÈˆëC BBÈİ4 Z
 	‡QŠh2S
æaB… wdAE! € qÛ!€(~<_`hPB±TPÀa" ò"¨¡&ÿ>Ÿgúß—ióxÇóî¯Ïê›†jñÿ|y7_³á|m‰—|ûú7ıûsÌ?‡êÿÅûï5oì.¯|{ïG®Û¾·şü¼Ïó3ffïlÖ›Ú×¹Ÿ×ÓŠ'Ñ6mï/®­®êû¾¿7]¨ğê±óö‰›ÛÿcíÙ-¯{=Jâ¿'‹,ÂA
DAª°Ò5EĞ ‚€Ä„ğßˆA(TH	±@ĞÀ( r€„ Áa‡2Ğ4 ¨ „ PÀ€B 	  e	‘€M L(lµÓÜ"èk2r6ÂP óFTCFGŠÂ&PRğcNÂÑÎ* Øh˜cH¾ÚmÇ¯‘b²öö§ŸaF_±¿êüpß,ç£B·~œùì;Ç«üÉÿ—qŸP×ıã÷¿öî×›¼û“¾}îó.î[ï|ÒÁÏê:—{c_lpïävÇò÷Vİmù¸›ğÇŸûç[ÇkzúÿnÿÃÓºøã}¿îZ{úĞOû Îñ»uxº«—ÿÌk¤ÿ{wåoÓcú[æOTo›{Åéó}OÂ,eç}õ#ûç½qsW'¾>ş¿ÿŠÛ¨¨»gb¨ôß¾–/ßZ“ó?Ü½%§ÕüÛ7:ßí4úÿ÷şm|—Û÷[ùî^yå½®oæ?êíişÎÙ¾úÕµÖ¯®_*âÏ@
EÁ‚P GP€h (³ƒE¨
†@ ‘ B  1´@B¤ m&h ÅZIP9Fd ø‚j²8ğƒPƒ   @”$R®ÀC0\d ©0& Ã²€p¦0Ò„€N	`©Ô#2£c• r       defaults: {
            type: 'textbox'
          },
          items: [
            {
              type: 'listbox',
              name: 'type',
              label: 'Row type',
              text: 'Header',
              maxWidth: null,
              values: [
                { text: 'Header', value: 'thead' },
                { text: 'Body', value: 'tbody' },
                { text: 'Footer', value: 'tfoot' }
              ]
            },
            {
              type: 'listbox',
              name: 'align',
              label: 'Alignment',
              text: 'None',
              maxWidth: null,
              values: [
                { text: 'None', value: '' },
                { text: 'Left', value: 'left' },
                { text: 'Center', value: 'center' },
                { text: 'Right', value: 'right' }
              ]
            },
            { label: 'Height', name: 'height' },
            classListCtrl
          ]
        };

        if (editor.settings.table_row_advtab !== false) {
          editor.windowManager.open({
            title: "Row properties",
            data: data,
            bodyType: 'tabpanel',
            body: [
              {
                title: 'General',
                type: 'form',
                items: generalRowForm
              },
              createStyleForm(dom)
            ],

            onsubmit: onSubmitRowForm
          });
        } else {
          editor.windowManager.open({
            title: "Row properties",
            data: data,
            body: generalRowForm,
            onsubmit: onSubmitRowForm
          });
        }
      };
    };
  }
);

/**
 * ResizeBars.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles table column and row resizing by adding divs over the columns and rows of the table.
 * These divs are then manipulated using mouse events to resize the underlying table.
 *
 * @class tinymce.table.ui.ResizeBars
 * @private
 */
define(
  'tinymce.plugins.table.ui.ResizeBars',
  [
    'tinymce.core.util.Tools',
    'tinymce.core.util.VK'
  ],
  function (Tools, VK) {
    var hoverTable;

    return function (editor) {
      var RESIZE_BAR_CLASS = 'mce-resize-bar',
        RESIZE_BAR_ROW_CLASS = 'mce-resize-bar-row',
        RESIZE_BAR_ROW_CURSOR_STYLE = 'row-resize',
        RESIZE_BAR_ROW_DATA_ATTRIBUTE = 'data-row',
        RESIZE_BAR_ROW_DATA_INITIAL_TOP_ATTRIBUTE = 'data-initial-top',
        RESIZE_BAR_COL_CLASS = 'mce-resize-bar-col',
        RESIZE_BAR_COL_CURSOR_STYLE = 'col-resize',
        RESIZE_BAR_COL_DATA_ATTRIBUTE = 'data-col',
        RESIZE_BAR_COL_DATA_INITIAL_LEFT_ATTRIBUTE = 'data-initial-left',
        RESIZE_BAR_THICKNESS = 4,
        RESIZE_MINIMUM_WIDTH = 10,
        RESIZE_MINIMUM_HEIGHT = 10,
        RESIZE_BAR_DRAGGING_CLASS = 'mce-resize-bar-dragging';

      var percentageBasedSizeRegex = new RegExp(/(\d+(\.\d+)?%)/),
        pixelBasedSizeRegex = new RegExp(/px|em/);

      var delayDrop, dragging, blockerElement, dragBar, lastX, lastY;

      // Get the absolute position's top edge.
      function getTopEdge(index, row) {
        return {
          index: index,
          y: editor.dom.getPos(row).y
        };
      }

      // Get the absolute position's bottom edge.
      function getBottomEdge(index, row) {
        return {
          index: index,
          y: editor.dom.getPos(row).y + row.offsetHeight
        };
      }

      // Get the absolute position's left edge.
      function getLeftEdge(index, cell) {
        return {
          index: index,
          x: editor.dom.getPos(cell).x
        };
      }

      // Get the absolute position's right edge.
      function getRightEdge(index, cell) {
        return {
          index: index,
          x: editor.dom.getPos(cell).x + cell.offsetWidth
        };
      }

      function isRtl() {
        var dir = editor.getBody().dir;
        return dir === 'rtl';
      }

      function isInline() {
        return editor.inline;
      }

      function getBody() {
        return isInline ? editor.getBody().ownerDocument.body : editor.getBody();
      }

      function getInnerEdge(index, cell) {
        return isRtl() ? getRightEdge(index, cell) : getLeftEdge(index, cell);
      }

      function getOuterEdge(index, cell) {
        return isRtl() ? getLeftEdge(index, cell) : getRightEdge(index, cell);
      }

      function getPercentageWidthFallback(element, table) {
        return getComputedStyleSize(element, 'width') / getComputedStyleSize(table, 'width') * 100;
      }

      function getComputedStyleSize(element, property) {
        var widthString = editor.dom.getStyle(element, property, true);
        var width = parseInt(widthString, 10);
        return width;
      }

      function getCurrentTablePercentWidth(table) {
        var tableWidth = getComputedStyleSize(table, 'width');
        var tableParentWidth = getComputedStyleSize(table.parentElement, 'width');
        return tableWidth / tableParentWidth * 100;
      }

      function getCellPercentDelta(table, delta) {
        var tableWidth = getComputedStyleSize(table, 'width');
        return delta / tableWidth * 100;
      }

      function getTablePercentDelta(table, delta) {
        var tableParentWidth = getComputedStyleSize(table.parentElement, 'width');
        return delta / tableParentWidth * 100;
      }

      // Find the left/right (ltr/rtl) or top side locations of the cells to measure.
      // This is the location of the borders we need to draw over.
      function findPositions(getInner, getOuter, thingsToMeasure) {
        var tablePositions = [];

        // Skip the first item in the array = no left (LTR), right (RTL) or top bars
        for (var i = 1; i < thingsToMeasure.length; i++) {
          // Get the element from the details
          var item = thingsToMeasure[i].element;

          // We need to zero index this again
          tablePositions.push(getInner(i - 1, item));
        }

        var lastTableLineToMake = thingsToMeasure[thingsToMeasure.length - 1];
        tablePositions.push(getOuter(thingsToMeasure.length - 1, lastTableLineToMake.element));

        return tablePositions;
      }

      // Clear the bars.
      function clearBars() {
        var bars = editor.dom.select('.' + RESIZE_BAR_CLASS, getBody());
        Tools.each(bars, function (bar) {
          editor.dom.remove(bar);
        });
      }

      // Refresh the bars.
      function refreshBars(tableElement) {
        clearBars();
        drawBars(tableElement);
      }

      // Generates a resize bar object for the editor to add.
      function generateBar(classToAdd, cursor, left, top, height, width, indexAttr, index) {
        var bar = {
          'data-mce-bogus': 'all',
          'class': RESIZE_BAR_CLASS + ' ' + classToAdd,
          'unselectable': 'on',
          'data-mce-resize': false,
          style: 'cursor: ' + cursor + '; ' +
          'margin: 0; ' +
          'padding: 0; ' +
          'position: absolute; ' +
          'left: ' + left + 'px; ' +
          'top: ' + top + 'px; ' +
          'height: ' + height + 'px; ' +
          'width: ' + width + 'px; '
        };

        bar[indexAttr] = index;

        return bar;
      }

      // Draw the row bars over the row borders.
      function drawRows(rowPositions, tableWidth, tablePosition) {
        Tools.each(rowPositions, function (rowPosition) {
          var left = tablePosition.x,
            top = rowPosition.y - RESIZE_BAR_THICKNESS / 2,
            height = RESIZE_BAR_THICKNESS,
            width = tableWidth;

          editor.dom.add(getBody(), 'div',
            generateBar(RESIZE_BAR_ROW_CLASS, RESIZE_BAR_ROW_CURSOR_STYLE,
              left, top, height, width, RESIZE_BAR_ROW_DATA_ATTRIBUTE, rowPosition.index));
        });
      }

      // Draw the column bars over the column borders.
      function drawCols(cellPositions, tableHeight, tablePosition) {
        Tools.each(cellPositions, function (cellPosition) {
          var left = cellPosition.x - RESIZE_BAR_THICKNESS / 2,
            top = tablePosition.y,
            height = tableHeight,
            width = RESIZE_BAR_THICKNESS;

          editor.dom.add(getBody(), 'div',
            generateBar(RESIZE_BAR_COL_CLASS, RESIZE_BAR_COL_CURSOR_STYLE,
              left, top, height, width, RESIZE_BAR_COL_DATA_ATTRIBUTE, cellPosition.index));
        });
      }

      // Get a matrix of the cells in each row and the rows in the table.
      function getTableDetails(table) {
        return Tools.map(table.rows, function (row) {

          var cells = Tools.map(row.cells, function (cell) {

            var rowspan = cell.hasAttribute('rowspan') ? parseInt(cell.getAttribute('rowspan'), 10) : 1;
            var colspan = cell.hasAttribute('colspan') ? parseInt(cell.getAttribute('colspan'), 10) : 1;

            return {
              element: cell,
              rowspan: rowspan,
              colspan: colspan
            };
          });

          return {
            element: row,
            cells: cells
          };

        });

      }

      // Get a grid model of the table.
      function getTableGrid(tableDetails) {
        function key(rowIndex, colIndex) {
          return rowIndex + ',' + colIndex;
        }

        function getAt(rowIndex, colIndex) {
          return access[key(rowIndex, colIndex)];
        }

        function getAllCells() {
          var allCells = [];
          Tools.each(rows, function (row) {
            allCells = allCells.concat(row.cells);
          });
          return allCells;
        }

        function getAllRows() {
          return rows;
        }

        var access = {};
        var rows = [];

        var maxRows = 0;
        var maxCols = 0;

        Tools.each(tableDetails, function (row, rowIndex) {
          var currentRow = [];

          Tools.each(row.cells, function (cell) {

            var start = 0;

            while (access[key(rowIndex, start)] !== undefined) {
              start++;
            }

            var current = {
              element: cell.element,
              colspan: cell.colspan,
              rowspan: cell.rowspan,
              rowIndex: rowIndex,
              colIndex: start
            };

            for (var i = 0; i < cell.colspan; i++) {
              for (var j = 0; j < cell.rowspan; j++) {
                var cr = rowIndex + j;
                var cc = start + i;
                access[key(cr, cc)] = current;
                maxRows = Math.max(maxRows, cr + 1);
                maxCols = Math.max(maxCols, cc + 1);
              }
            }

            currentRow.push(current);
          });

          rows.push({
            element: row.element,
            cells: currentRow
          });
        });

        return {
          grid: {
            maxRows: maxRows,
            maxCols: maxCols
          },
          getAt: getAt,
          getAllCells: getAllCells,
          getAllRows: getAllRows
        };
      }

      function range(start, end) {
        var r = [];

        for (var i = start; i < end; i++) {
          r.push(i);
        }

        return r;
      }

      // Attempt to get a representative single block for this column.
      // If we can't find a single block, all blocks in this row/column are spanned
      // and we'll need to fallback to getting the first cell in the row/column.
      function decide(getBlock, isSingle, getFallback) {
        var inBlock = getBlock();
        var singleInBlock;

        for (var i = 0; i < inBlock.length; i++) {
          if (isSingle(inBlock[i])) {
            singleInBlock = inBlock[i];
          }
        }
        return singleInBlock ? singleInBlock : getFallback();
      }

      // Attempt to get representative blocks for the width of each column.
      function getColumnBlocks(tableGrid) {
        var cols = range(0, tableGrid.grid.maxCols);
        var rows = range(0, tableGrid.grid.maxRows);

        return Tools.map(cols, function (col) {
          function getBlock() {
            var details = [];
            for (var i = 0; i < rows.length; i++Fşò‚zÒ‘(ı¶NRµ EwàHØ €À6AÎ@{ F h‘’¿jŒ G°>ÿPàB&IÈ:"ë‚Cp0‰ÂĞ{‘a ÍIà· È¸ @ rAĞb€Í@|Œâ@D†_QB= t¶­D¡Š6±«Š_{):Ú§úË?.¹ªµ­‹âëÚ_³İOŸMòïoì¯¨›4ôøŞ}îßó¯×{\_óæ~¯¦ÿÏŞıŞÛ¯ŸvaïÜÓÿÏ_ü/~¾lÖ	×ò¯ît;¹{m~çí›ı;÷{Çç÷Æï&zoC±ôşİmLƒåü’ï]ë>¶A¿yıù>¾Oİ×öıÕ_=¸×”­ä-ÈR›½èŸ}M¾õ¾3ı·àúÿbÿsk¿äÁµ·äm3èñ£û÷ş¾¥RèÇ»OÅığá¾]OÿÿúFV‡®–Ó.ùåõûúzõùã´ö—öóXÂŸ÷ÏsxÇÛçs3æ}Ú•‡½—7ïõßıy{Eö\ûR©©Ğœk@"$aM{^Haÿ_& ?p›
Ã‚ÈE^şb•àË„!×FÈÂ 
 ô¨&ƒ‚Á*í@”0YÑW@€‰€{ağMè0_" î Ä@„ş­N b CİbÉ;€‚‰,‚EHÙ ï+rÀ£0` q°Ÿ9…zËıç³›òï[<Î;—ø3™ñ3­û\>î¡ÓmkXÎ5w³òï?eú6áüÇZ±û[Úw§Æ÷,¢İ¹úÿë|ß?‡¹ù´½}nïÕyvv®ZïÿîÉÁeû"üYÿ.Ê½¥†üs‚öõX2â[~/Sià:¶ÃvC 0&n2Ì¤hrÛ” 	7ıÕh¢9 ÷Æøh E²½ ]pÁB·–0‹r‚î@ˆ#ÿD¨l±	¶€4P&biú•FaKİ¨ÉI9	„=¤ f•  ïaŠ B@¾Æxf'/H3 N@"à¼  €%j’Dç¦÷	#(Ğ	×€0#P˜(ozZ$AQùÖ†—M±q$b"è¢.¡¢j*¾&†ãKd×@,È)ƒQ¢ÒŠ b Âd×  \×[Lmˆûˆ £T}i©$I‰DqD4 ÌP× ¿8°€€  Ä#Ô 
å`ûäWÖ&Ğ<¯m·ÏşôHOü[û¯ìÿ[7<şS^·ÈOü(v~³ÔÛíW:;{½ÿ~–‘~÷}Dğ}‹'"ïî»ö½½êşÕ’}õİ²fÿ‘ò‘oAI÷™íT4ºÖ3ŞR?ß€Éşü¶õ=·JòÂJïo"ÚÇç‡V·»ş÷¨ß™öwÔè]€öÁ(`€½pˆ B2À÷ÀĞ(ÔM@@ ¿ …
”BĞûdŞê<.$vŞ€°DŒßL€˜‚š"R„A-AÀ†ÿH0  
T ¿6
 `ıÄ,–ÁCéêœÈhd÷L<æœa¬+n“­×->]Şİùn.úf9îİ~ÛäïûğOÆ÷Û~óæÛY¼·sH÷ë¯Ÿáş=àw¸–ÍÙÁ¬yU¯ğ¯Ìª	Cû»üÏÜÎÊç›‡Ãğ¾ÿÿkºİfÜ··Í¥-mÃòj²İsõ~OØUÿºüöÔ§ce²”/wy]—,ÿº{‰.Å“â¶[÷Ö¿ÿÌ}²Ö\<¾HRö‹òwvjàŞZîN5—
ÿuçó;|®»Ïßá^?Ên®£}m›)û²_×¯ØÜõsÿëÇ¼®´ûüPpÛ5¾EÛíò—"nıı|üDW¯şÿÿÊ"À¹ï‰C}ğ·5®ï}úóğH…ïJú˜
ÿĞ DÑJëÉT
\De"·ö o”‰ÂB=&
”Qÿ ¼V·r”ƒP˜¡ç
W¹
 ½˜ôœÒÔ©Ù ¤a$R‚ŸªÑ%²èSúj+F_$DBÕ°¡ÏC(	ÁĞ4 	€ˆ1TBä^p ½
€(´w3}ŞNèCÿİGûŞm×üóVıj+É<ÁfÏNùÎ‹P£\Í?f^¤ó—{Yú}ñ,ï}ş×¿õÖme—ûæşGxò©îÿ÷åxü¹n»x­ÃÑÓ†N¿±õÿu†°Ø<^àãwïhúØùõØ;^ö¿áş'‹+–Çd±³Iû>[Ş†Rü–€Â$è€Ş H0ª(>AÑ1¨1©&~÷¦Œ ÁY*¯@hğJˆˆ0ID5ÄSH.*Bd“ÅÑ ÀVŒr¸d–Œ%†}Ä£HdğöüHa‚ûQ,@ h	PÌ€%â$``u ÄàV€¢JE@b1(ş)
€ İ4@q±}…ÿ…!”!*=€xZ ’˜ka ‚>¡'A„ƒ”@~B^ ,^ ½$1H@ĞÂ‡L3|«'„ª  ’À`(5° ^dÙEà &‚QV :ÿhPh§q@ê5È«àc^qu7ÿ*~ı¯İÕywxëùÍòVË ìğú@ÕüÿÆáqô»öçÑİ™>×Î~Å&üò-;úâµœCıŞãÂõu»ÃOy[&…Ûı¶^óûXøÛ¯ÿÿø]£¼ï´{râ¶İÿc;«…ayM8Ş#/ş³Á?~ø¹ÑîØã0Äª/ÿ-ùL^"M¢|ÎDb dP¦ó A#PDï#µ 
@ zq Ñ 	P Ä€ÍË™ „{*RÅ†‘A "€p
ÛÀ‰ .àÄ<}ß(†‰À›v2$#ûD
BBä>	à”ím\"‚…€y‚ıÎ¢ò×²WÿÌ÷héX‡ùìıı÷9Ÿ;ßÿ´UmòÉ½÷øşßM³‚×äºäx¬g5x-Úä>Ûğ9éòq>i˜ÓĞÇKÎïŒÖ^Ï_RÏy=w›_ï8Ş?×ÏAsåxˆÓÏ÷ùÒè7˜vSÏ8îâ_ëöâ»lÕö¯Ì/ZÎDæè’úÙÇ¼öıj/~ßşë¿(-o¬ùë›¥g›£{k]ójì—l»w¹Ùío‡5JˆÆşé”.İHÿ9ùgÒí×û;Æëıßü*Ç›w?sÒşïßç]İõşßÈªıå~Õæànxpãªs`Â>çWû4ñFîOòk¹sTÏ{Y1í-Cd•óP—Èb«	¥» D€£=oh@¥"|#8z‘U~¦„12„pyL DAØí…ˆĞ ¦¤?åè@c˜×By5áA\F
¯‰& ¢		Ú€ Št!ù½ĞAëÀ¦ÆUÀ=ò'Õ9B*‡Ùİ£Ùı^ËİµËßtî^üóSü½ù÷ûš©/­/vo«ßÖ?Qìı¦Q»~†î-~kß™–Wmëÿ_äXhSı´gë’•yÔı}â“oJó¾{ÊLzUñ9£»ºµö}ÕüVmmøPWkÇÏw×ü4£VıçÕ½ø¾:;ùïKåùK¶¤³¢<˜†p,Q1ûµŸ X)öàL¤ò€|S	ÓÿRÌ°vÁ8D„1ˆÑ”	ï00`jxßĞ€	["*½I C±şI HD@# ½N€ @‘ÄB:Ğuq€À2Á pp "ĞC¨ûÀT N2H¿	æ ŠLæ“ÿ9 ªÂÁbj $Àd*hB²r6Œù¿‰qÄæw`"	3# geŸƒ¡  Ù$	Še¢,ÿB(L8ş 3€†FˆHq6pEá$¥,…è`‰	Ğ !`ı" ŒúÈ	hXpÔ€4B?çø¾Şû+*²Ã/Ûæÿ;UØ—şöUÚòë{^ÿüş”å¥¸ÿùÔú×ÿ×FÊxÏvò´‡ÃFıãòCŸ@ès…Íü·ùşsQïè»Gnf$å·û^Û×jŞçW‡ËüŸ¡y{­éÿgıüêwÌ^ÚÚWaïx[ôôvùïkn{Ş'šE¶P*d¾É`±0’pÈH?‡`†DÀ<ŞÀ @
†ÿ`Pëjô¬.; @-Œ¥×PE(a"ö  0(‹ÂĞbL½Á˜¢10ÿw …4¦Î‰ÄÊ`7°€`*?²Ñ@ÎÂ6©íÒßĞÏì%HúöŸ<ëïv[ÛıÅË.õáQúëş^…NNhö=ÚM{èÛêûÙ¸Ÿ:¬úov·õüıâ×||¿Ôò;Wër»õ¤anïŒ_Ñ»çÿè×ÜÏ¯ziºÄıŞ§ßî×Ô±‹Œù%é_ïË“µì¾Ù4G|\Õ¿E¨hOemnÕ×ïÛö¥oòvgSoÏëİîŸgëÎàëØö>ì“V¿µ3ÇŞz]+ßN£îëÿĞP{ ¯iÿz~>Ø-b?î¦æa[s’éÖñçsh+ü¹«W¤Æ}¥´¸‡ÖOuø¶õÖõ«QW·ş§=ş¦IÃş³4ßmûü‘›óÅéõ’( ×1Ì 	¨ÿ‘‘Eó4dNÈ‹@L= –€jÙ±ï(,“b¡ó4€)˜œüP …"
? ˆƒ¢9bã0!CaÆì8…ÈL>]B TÊ Ÿî‚JÏ2Œ ÀC]``pPï°:Ù)@PsÑD`ÿòsİ»İ–½¸ğnæ7x‚¯ÌMÜ÷•L_y#ÛEwBÕïrÑİÇÚÈİıìÛ¯ë”çñUïú«òæ%"ag~¿åşğR†Ã÷S?ŸQk¾§Ñ/Í7S›vúÕ·]À[æDÿÍäŸæ){’Új³=;s+×g÷œ¹Ç=$•ñj92§B3\4À-¢_RĞº~’L  ’p†~ä(Š’€÷Š&ˆpVÛ8€Šî ğÈ¾ 2Q.gXÈ*™
@¶PN„; Œ p$ÿ 
((aÎ 'Ğ,‚¿ (t@Èp€!€raÿx•€mÕ<Õæ;°‚”°# ³ ”¿¡Á@6	Ğ`õV,(P¨K¤€2Fğ|‚52zO$Lo:H| ¨#lÉ (· $T tç4 Á “ı&Š•Q`_‰pbA‚¾	—”A
ñ $ °w!'E î±­î/ä—Ÿú¯ŒÒ³ÏÿØ²r§şøûİñĞú7×-òÑ/ú'ÙøfìÆwí²óß=¥Sûå<eë¾ı_®¶ïêğïü>}?:¶l™Îøk«íµ~­^ìş¿:çÜıÏš—Yûjvÿ¿û/KõõWM¸Íşº³ËşØ^Ëfù¾o;.!’"éRGŠlH³O˜@¼™€§l2'T¤á¹*à¾p 
7Vx@gĞE(ª„„š'À @ T ©aœD½²Bgó82{“ô¬Œ*E```ˆÒ¦BÄTºpV—âQn'wqí!P4IƒWÂ»İ¨±yçmßÿ~ÜÊ¼gkOïë§>¿Ûîã÷ÙöÖîß~ç{çÿòõ6úö9¶oİæìSÚoÙşŞùo­Õ˜gõ×—İº—ùüMûúÃ7ûk·¿¿Õïı:½½è=1ışºÕ›I8ü?ûıßoL­ı~mm·ü^ş–Ìÿ?š¿ö÷î­üß¾é—;Şÿêûèô‡7ù«Ø¯»½yÎ{¹~ñíãß×ÈıêÖ¯ö®Áê÷¹~÷t¨¾­îËôï¿°*«³iÏõõ–ıäÆü¾ÿ}÷ıÿşkÍï»î7Ocãár&å«X_¯¾“İº‡üSñ²İ/m·YùÄß÷?ùw}çÀÕ0Ë„àVEø	A· $F!Š*À¡Ôc*Hdî¸µ¢6
„@ …DEÁqH´e§Cg–İ<–Í6Q0¤ ‰‰HÌ‰m$n¢›—L®8u0XˆãX·P ¸iÒYW  6p€d3`ñR,0Š}}ëûÛŠ§úİÛåûWßçÏ÷ïÿşÈÿw?Ólíş§mÈ»Fï«ó\/öÛÿùı“ıwcÿñ„ÿŸ«û^^¿İí¾›¿|ı¶›÷æû¿Kåëwo¯É¯~³şÓåßß_ùı³àüÿ_ïogwİ:­öûæÛOĞÿ{/ÿ¡ï»ù]÷éşÍïg€’€mh$†HXOJm¤ŠB@B…i 
D€ NÃ3	KúëVãhcïIc‚|H€–¦aª¢ Š¢.kµSIûÏµ ´>G€GM¶À –òÀ…ºœ`š…€ºIV¤úôL7( xÇÀPyhH ¬ bD¢ ^¡Â-	¡1‘´¥±cÜ…`ãV'À1¯P¸š¡³^6BN9J/‰î 	…)ÃÚ¤5Lg	³ÃÖ sš“Ê·C#'$
“Î9W@R0Û,A†(5Á†ğà‡'Ğ $ù#>XŞ LI€]ÿÏêñ^³şûæş_¿ö”dv÷ÿnı;ºü_ß/Ñå}¿ûYÿd¯7²ö®?ş/^‹—%ŒÏÿ.Z§?Íïõ7¿œÛõùßôCë]Óÿ¤ß,¥ë{»ÜÎËö—ùşZù¯^÷õŸ=ûïÌùºOŸ•÷ÿ[ïÌ^şİîğvúïø57Û¿ûËı¶<ÊÅ*¢E*2f‹ıKÇ¢#&»‚P ˆ˜Ã: `³?-€  3#É•è«xS@‹A>€À5å„ÃÖÁóá¦‡ƒ!é	T‰“®‡@×î! V!ƒ5’§8íÁD(†h$UÖ A…Ş÷^{®
Ë:ş}ı¿~ÏÍøîÜos©›où'øoºµŸåûï¾}éßïºÜº¹|Î·ÿ£¯ŸÆ£=»‹=û“ru=x~ğ3{ug†ÍŞırß×úïF¿wåıQ\gşcş?`\òvş?¾öM¶°Ò·»õÛm~ûCŞÊıØ”÷jşH¸;v¾ÿ}şW±¥uò×i”'ç_…Úe‡vùµMn_×ı»¼Xm}]¹É½’ã]ïß‡ïó{×5êÿ¡¾ï¯ó½ë§»ıÍßÿ¿İöæO¿õßŞ7«ûvä~×öÜ¬}ƒû·ßû“êîå´şÌß—Wó]ğKßn:õİmü×?äì{½áşÊ¿?óÿ/ °¥e'*ÂÑÈM‚rH	F™HP}®C$d´ 03b@`´<Ãµ4p ŒiDAè@)xˆ®ÈTK, L?ğ£Õó…è0ÀÇ@BCÍ¦#0( ]ùO†@tA)4Qt{,€s#EK‘Ã 	n`/¦]ˆÛùS?üßşÿıö¹­Û}ê†úÿb~­ßkÃs¯şoÿòqèÉë¶Ûÿ2ßşmûŸç¿®äz›×Yçİü}÷ßûáüûè.`Şweå¯îïv^ıÿçŸûÿ¿şÕ[–¿ß|ıÿÙWyÙÈûiÿ{»Ïé}ß{¿î§ïÿ?€[ÿşv×·Ÿÿ…µ#$·9jM¨Œ´AĞåÎq° a+¨ìP‡Yja‰ATË7¢Mô0ƒ‡é0Ç‚r…BiÀTÇS€—€`b!±ÈªŠZW<IÚ@MB·D°DÜP u	ÒSÆnˆ´&å&¦Y+b‘àä@0@bE*	b Ä ^:p&Ddü’‹Ìi"É
5à‚`n0•<èlÑ-‡€ §2WÀnñJ‚µAtâ &ˆ‡rip*EP ˜-E´Ê ¸áÆ¨Œ2 Nñ°‚€&ØiO¡‡´’(¹h®X‘n~¯ií¾Í×éÖşzoÒõî¾{»¿şy,SÃ÷úÿ¾w~u¯tÛ/ı³Xü‹n‚oOë4ß¾ı•v¼ïúÿ¿º×¥¼ëŠßîÎP«fTP~îËô¬ü»ÇŸ»ÿŞŸ{zc¯ßúçkKOw?Ÿß·ökÑ¿_Ûûı¼rcwòûß}Oïõ;·ãüÇü°•J!)äÂ   ÃY‚A.;ÁJXĞ,Ğ´wªäd
V€pÓ0’"d—@€ &p€¹r€Aâ F¡€L 1…#1jŠ(Ì™ M§ßÀ@²HK3´£@'©DOA0eeTˆÿù.ü·÷®ßÿÚ¹ŸŞMv¯éŸéïwõıÜ»»üŞßÍèy,¾{uá?5¿£Wßİõ®¾Èµ¨_äÿmıØvŸÇïÜ_´ìu~¯ïo»ïş~ùÿë}<é¿-÷¾×Şôş}Şï÷ßªú[Ï¿ú¾eåß¾4¿®ş;ãÜ±}?o¿ıÇıï£òâ?ı%*#¿ó0øŞğş*ô~z9÷iu5»M{û¦ıîößŸùz]·êÿÿı55¯³ÿæçşô÷W;ü/rïàp‰_'{Ï¼æ3ïóËø¥ó§g][ŸvòÑÿ5ON[Îë°Ÿõ^îŸôÓ?/?ÛG¼¾Ííw­ûâÃ › I“@Òj2âÛ@0$‹`_mƒ'£¡:¡ºvB|¿ˆ°"Á(©“^²A¬9N†ÌƒŠ  FFZótZŠe” æaA%$ï®`(j2FEb4ˆ · b #I0ô+€‚
’7\î£kÿëÎóü¯»ùÿÿçW~>·]¿1Øö5üµ¼K÷ÿöÏñöÎÕÿ×ù»»÷‹•±üâİªó¶ıWX–ã}ô¿ìÜü(%Ş}¶«#Öıvÿ¾úMî‹ıÿ°ï±Ûş÷ÙşÏNıİ^şıWıï\zÿı•o&ú¬jÿıÿºßŞ}o\Íç½Ìï %I ˜JéÜ„dX 6¡7‚Ã˜‘
ĞHZ N};BDWÄZ0€Ã¡İªp®â|*…y3 Ğí¨2¥8 BK#F°Í=j@p‘„´€©âÆñœ@ÈÔağš"ì¢AÙŒ£äR%ğä„H@"$£p™'¤àT’¥@|°K&Ç$=‘»¢	ôdg‹Œ%Ğ
&@’¤„i-›¦ía
Ç%J ğÃB[T ƒÀ#pÊ8'qĞ¡€TS\w%NÀsÖ9!.5µ' XĞŠ¾5`#ÁĞ@QG…$Ä:  W±`‡“ß­?ó«¢^ûÿ¿î-¼¿§öÈÿWŞW»ÿ¾y³şŞûöi»îş7¿ä÷şúnu¹ÿ¼/ÿ\úËÿÛ_¾Ö¿ü®ŸßÏÿçÖşnéü÷şÚ?n~È•µ¿ıîÎŒ·¿÷^ıŠæNÿ÷ÕnÏÿÜÏ½®ñÿÛûºuÿß×}
ßøŸ\Ö›÷|°$!JAö0G¢Fu„‹¶VÄ‡À/>¬0·b ˆ@5Ã²û  NáÀ@é‡š!Ãh•(£chÈ &et° $1H$uƒb€Àr6! *ïaCÈÈƒëDR ~ŠÕPhâNP@!®LZ÷ì
 İ¿úÿúî§}ÿõç¯´ıeÓ¿Ó"÷ö¶Ê¬g¥Ÿÿßú5ü¼ÿ¿ßõ[äu»ßnšÃo×ë^×ÿ–íëé¯ûNÕ¾M{ÿ¾<º÷ßÿroöİE¼ö¿7p¬ğŸ´÷úïr§İ×½÷‘öÛÛËı†ùûö9•öœ½÷rÆ³Fßô¥ÿB¿øŞo×÷ÿİßÿ9ÿmv}şÊ«oµ¿ÎÕú3ş{ûî³íŞ	ï¥ÿ®ÿ÷¶ö“¯Ÿ«y‡½¹Ÿ=œ9øg·ÿé¥·¶g'o÷Û?Ùù½ç¹½ïÛKï?bçq¹·¿ï·şÿ?ÍÛôék¯ßxìW‘sÏw'¾ÿMş1ın¥æÿŞOoCG‹şİşùRa9KdƒS@P€HÀ¡¢Ğp(ğ%¥dô3A@Ø”˜yaG‚›t	|EO4 	È…D¤VBBæ[d#4.Úì`PĞ€ÔX@§´Ö,hD³´¥F8¶‚6bA°’2¨d°xT ]>';"WË»ÿÛ¾¼¯UÒ­ªÉß„¶ÿ^ëÿ·¾ùß÷ÿséóyÿ÷¦ó¹Ú?ËØ×ğ]/±İyÛıúõ²Šña¹·wİõyó{GÿÏ]ïq)ïwİÔÙ­ËG¶¾7ï·_¶ë7Ÿ¾ãÓüç}ØûbTîïüoÿ=¿èôÿk}öÛü­=ß÷¾òúÿµË{#ÄD`°KP—µPŒdPE@„‚˜”¡D£>DDR‡0_\\•
”…¯ÁÃK‰¢P	›P	d"0)Á$F»‰D ¡œVƒ˜Ğ¾ÙEBQWBNÀöNBì]À"S¤+@e•€tH’†  ñnQP|‚p*F 1‰B‚!¸`;È¦ˆê’œ+­a’ÙÇE…ÌtPÓ"E£j¼0h¹îˆÍ@H?õÂ­á4Cr	¢z`@L£K`"óOF#–  pàß@tÈ0¤’èLœZ c‚ˆ„ŒzGA «ªU¿zŞo÷ûSô{ò™Ë¯¿÷·}Õíğì¯¿Ükûé×êÿËwŸ°Ô=?ûN/VvÏú‹'ı8ÒŞûş¬ºúßp¶êƒê¾ı7íöÙïüïúÁëg½9¾îöoıóÛ¯e¼]ùÅóføÛûõ2a´ï®[ü­>»¿ÿğ=ÿÛW'¿›ˆx(min, result[index] + step);
            var diffx = result[index] - newThis;
            deltas = startZeros.concat([newThis - result[index], diffx]).concat(endZeros);
          }

          return deltas;
        }

        function onRight(previous, index) {
          var startZeros = generateZeros(result.slice(0, index));
          var deltas;

          if (step >= 0) {
            deltas = startZeros.concat([step]);
          } else {
            var size = Math.max(min, result[index] + step);
            deltas = startZeros.concat([size - result[index]]);
          }

          return deltas;

        }

        var deltas;

        if (sizes.length === 0) { // No Columns
          deltas = [];
        } else if (sizes.length === 1) { // One Column
          deltas = onOneColumn();
        } else if (column === 0) { // Left Column
          deltas = onLeftOrMiddle(0, 1);
        } else if (column > 0 && column < sizes.length - 1) { // Middle Column
          deltas = onLeftOrMiddle(column, column + 1);
        } else if (column === sizes.length - 1) { // Right Column
          deltas = onRight(column - 1, column);
        } else {
          deltas = [];
        }

        return deltas;
      }

      function total(start, end, measures) {
        var r = 0;
        for (var i = start; i < end; i++) {
          r += measures[i];
        }
        return r;
      }

      // Combine cell's css widths to determine widths of colspan'd cells.
      function recalculateWidths(tableGrid, widths) {
        var allCells = tableGrid.getAllCells();
        return Tools.map(allCells, function (cell) {
          var width = total(cell.colIndex, cell.colIndex + cell.colspan, widths);
          return {
            element: cell.element,
            width: width,
            colspan: cell.colspan
          };
        });
      }

      // Combine cell's css heights to determine heights of rowspan'd cells.
      function recalculateCellHeights(tableGrid, heights) {
        var allCells = tableGrid.getAllCells();
        return Tools.map(allCells, function (cell) {
          var height = total(cell.rowIndex, cell.rowIndex + cell.rowspan, heights);
          return {
            element: cell.element,
            height: height,
            rowspan: cell.rowspan
          };
        });
      }

      // Calculate row heights.
      function recalculateRowHeights(tableGrid, heights) {
        var allRows = tableGrid.getAllRows();
        return Tools.map(allRows, function (row, i) {
          return {
            element: row.element,
            height: heights[i]
          };
        });
      }

      function isPercentageBasedSize(size) {
        return percentageBasedSizeRegex.test(size);
      }

      function isPixelBasedSize(size) {
        return pixelBasedSizeRegex.test(size);
      }

      // Adjust the width of the column of table at index, with delta.
      function adjustWidth(table, delta, index) {
        var tableDetails = getTableDetails(table);
        var tableGrid = getTableGrid(tableDetails);

        function setSizes(newSizes, styleExtension) {
          Tools.each(newSizes, function (cell) {
            editor.dom.setStyle(cell.element, 'width', cell.width + styleExtension);
            editor.dom.setAttrib(cell.element, 'width', null);
          });
        }

        function getNewTablePercentWidth() {
          return index < tableGrid.grid.maxCols - 1 ? getCurrentTablePercentWidth(table) :
            getCurrentTablePercentWidth(table) + getTablePercentDelta(table, delta);
        }

        function getNewTablePixelWidth() {
          return index < tableGrid.grid.maxCols - 1 ? getComputedStyleSize(table, 'width') :
            getComputedStyleSize(table, 'width') + delta;
        }

        function setTableSize(newTableWidth, styleExtension, isPercentBased) {
          if (index == tableGrid.grid.maxCols - 1 || !isPercentBased) {
            editor.dom.setStyle(table, 'width', newTableWidth + styleExtension);
            editor.dom.setAttrib(table, 'width', null);
          }
        }

        var percentageBased = isPercentageBasedSize(table.width) ||
          isPercentageBasedSize(table.style.width);

        var widths = getWidths(tableGrid, percentageBased, table);

        var step = percentageBased ? getCellPercentDelta(table, delta) : delta;
        // TODO: change the min for percentage maybe?
        var deltas = determineDeltas(widths, index, step, RESIZE_MINIMUM_WIDTH, percentageBased, table);
        var newWidths = [];

        for (var i = 0; i < deltas.length; i++) {
          newWidths.push(deltas[i] + widths[i]);
        }

        var newSizes = recalculateWidths(tableGrid, newWidths);
        var styleExtension = percentageBased ? '%' : 'px';
        var newTableWidth = percentageBased ? getNewTablePercentWidth() :
          getNewTablePixelWidth();

        editor.undoManager.transact(function () {
          setSizes(newSizes, styleExtension);
          setTableSize(newTableWidth, styleExtension, percentageBased);
        });
      }

      // Adjust the height of the row of table at index, with delta.
      function adjustHeight(table, delta, index) {
        var tableDetails = getTableDetails(table);
        var tableGrid = getTableGrid(tableDetails);

        var heights = getPixelHeights(tableGrid);

        var newHeights = [], newTotalHeight = 0;

        for (var i = 0; i < heights.length; i++) {
          newHeights.push(i === index ? delta + heights[i] : heights[i]);
          newTotalHeight += newTotalHeight[i];
        }

        var newCellSizes = recalculateCellHeights(tableGrid, newHeights);
        var newRowSizes = recalculateRowHeights(tableGrid, newHeights);

        editor.undoManager.transact(function () {

          Tools.each(newRowSizes, function (row) {
            editor.dom.setStyle(row.element, 'height', row.height + 'px');
            editor.dom.setAttrib(row.element, 'height', null);
          });

          Tools.each(newCellSizes, function (cell) {
            editor.dom.setStyle(cell.element, 'height', cell.height + 'px');
            editor.dom.setAttrib(cell.element, 'height', null);
          });

          editor.dom.setStyle(table, 'height', newTotalHeight + 'px');
          editor.dom.setAttrib(table, 'height', null);
        });
      }

      function scheduleDelayedDropEvent() {
        delayDrop = setTimeout(function () {
          drop();
        }, 200);
      }

      function cancelDelayedDropEvent() {
        clearTimeout(delayDrop);
      }

      function getBlockerElement() {
        var blocker = document.createElement('div');

        blocker.setAttribute('style', 'margin: 0; ' +
          'padding: 0; ' +
          'position: fixed; ' +
          'left: 0px; ' +
          'top: 0px; ' +
          'height: 100%; ' +
          'width: 100%;');
        blocker.setAttribute('data-mce-bogus', 'all');

        return blocker;
      }

      function bindBlockerEvents(blocker, dragHandler) {
        editor.dom.bind(blocker, 'mouseup', function () {
          drop();
        });

        editor.dom.bind(blocker, 'mousemove', function (e) {
          cancelDelayedDropEvent();

          if (dragging) {
            dragHandler(e);
          }
        });

        editor.dom.bind(blocker, 'mouseout', function () {
          scheduleDelayedDropEvent();
        });

      }

      function drop() {
        editor.dom.remove(blockerElement);

        if (dragging) {
          editor.dom.removeClass(dragBar, RESIZE_BAR_DRAGGING_CLASS);
          dragging = false;

          var index, delta;

          if (isCol(dragBar)) {
            var initialLeft = parseInt(editor.dom.getAttrib(dragBar, RESIZE_BAR_COL_DATA_INITIAL_LEFT_ATTRIBUTE), 10);
            var newLeft = editor.dom.getPos(dragBar).x;
            index = parseInt(editor.dom.getAttrib(dragBar, RESIZE_BAR_COL_DATA_ATTRIBUTE), 10);
            delta = isRtl() ? initialLeft - newLeft : newLeft - initialLeft;
            if (Math.abs(delta) >= 1) { // simple click with no real resize (<1px) must not add CSS properties
              adjustWidth(hoverTable, delta, index);
            }
          } else if (isRow(dragBar)) {
            var initialTop = parseInt(editor.dom.getAttrib(dragBar, RESIZE_BAR_ROW_DATA_INITIAL_TOP_ATTRIBUTE), 10);
            var newTop = editor.dom.getPos(dragBar).y;
            index = parseInt(editor.dom.getAttrib(dragBar, RESIZE_BAR_ROW_DATA_ATTRIBUTE), 10);
            delta = newTop - initialTop;
            if (Math.abs(delta) >= 1) { // simple click with no real resize (<1px) must not add CSS properties
              adjustHeight(hoverTable, delta, index);
            }
          }
          refreshBars(hoverTable);
          editor.nodeChanged();
        }
      }

      function setupBaseDrag(bar, dragHandler) {
        blockerElement = blockerElement ? blockerElement : getBlockerElement();
        dragging = true;
        editor.dom.addClass(bar, RESIZE_BAR_DRAGGING_CLASS);
        dragBar = bar;
        bindBlockerEvents(blockerElement, dragHandler);
        editor.dom.add(getBody(), blockerElement);
      }

      function isCol(target) {
        return editor.dom.hasClass(target, RESIZE_BAR_COL_CLASS);
      }

      function isRow(target) {
        return editor.dom.hasClass(target, RESIZE_BAR_ROW_CLASS);
      }

      function colDragHandler(event) {
        lastX = lastX !== undefined ? lastX : event.clientX; // we need a firstX
        var deltaX = event.clientX - lastX;
        lastX = event.clientX;
        var oldLeft = editor.dom.getPos(dragBar).x;
        editor.dom.setStyle(dragBar, 'left', oldLeft + deltaX + 'px');
      }

      function rowDragHandler(event) {
        lastY = lastY !== undefined ? lastY : event.clientY;
        var deltaY = event.clientY - lastY;
        lastY = event.clientY;
        var oldTop = editor.dom.getPos(dragBar).y;
        editor.dom.setStyle(dragBar, 'top', oldTop + deltaY + 'px');
      }

      function setupColDrag(bar) {
        lastX = undefined;
        setupBaseDrag(bar, colDragHandler);
      }

      function setupRowDrag(bar) {
        lastY = undefined;
        setupBaseDrag(bar, rowDragHandler);
      }

      function mouseDownHandler(e) {
        var target = e.target, body = editor.getBody();

        // Since this code is working on global events we need to work on a global hoverTable state
        // and make sure that the state is correct according to the events fired
        if (!editor.$.contains(body, hoverTable) && hoverTable !== body) {
          return;
        }

        if (isCol(target)) {
          e.preventDefault();
          var initialLeft = editor.dom.getPos(target).x;
          editor.dom.setAttrib(target, RESIZE_BAR_COL_DATA_INITIAL_LEFT_ATTRIBUTE, initialLeft);
          setupColDrag(target);
        } else if (isRow(target)) {
          e.preventDefault();
          var initialTop = editor.dom.getPos(target).y;
          editor.dom.setAttrib(target, RESIZE_BAR_ROW_DATA_INITIAL_TOP_ATTRIBUTE, initialTop);
          setupRowDrag(target);
        } else {
          clearBars();
        }
      }

      editor.on('init', function () {
        // Needs to be like this for inline mode, editor.on does not bind to elements in the document body otherwise
        editor.dom.bind(getBody(), 'mousedown', mouseDownHandler);
      });

      // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
      editor.on('ObjectResized', function (e) {
        var table = e.target;
        if (table.nodeName === 'TABLE') {
          var newCellSizes = [];
          Tools.each(table.rows, function (row) {
            Tools.each(row.cells, function (cell) {
              var width = editor.dom.getStyle(cell, 'width', true);
              newCellSizes.push({
                cell: cell,
                width: width
              });
            });
          });
          Tools.each(newCellSizes, function (newCellSize) {
            editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
            editor.dom.setAttrib(newCellSize.cell, 'width', null);
          });
        }
      });

      editor.on('mouseover', function (e) {
        if (!dragg?ÈıÖôù¯¾?&|m:¡Ÿ—şÇÎ§·½Çï²¸İf8ÿf^ç´ı}şWw¿Æ<?\w¾—ùGúçäÍã×›DœüRs^——m÷>ç[KÔÁ|¾Ù˜¥üñsÃ.İzîßîÿïÏÁi-¾pî}S¡¨š•GttøZ¿­³y×“ù~g	Ÿ—=  qˆ) ÄÁ2ÊŠ& Â &³º L 	@ p!=E@D€É Rğk£58=¾TÁ$ˆ* P‚0(Š@3@"%C ¯‹ÀÑKØq'A*PP``  á PA`á¶˜ î8 0º„ŞF| GÅ‚A*BdáCHYX ğX:ğ!àÂ@2
`U”P¤¡€\@PB€y( K 8I# àm@È4˜ĞB	ÅD(BÙ)ˆ€ò3šÖ%€Â@2Wp€p=  ÅŒ V•
g€_! 	 @‘4MwÇ_5oæwqÒWrji}ûûy§ñ~îWñ/¾ö½½©û>™ïä?äö§Ê=ıw3âÿ.ïÅxáî‹|·sí'õÅ{Ÿ÷JSm÷ı|u¿Ÿ%Í¥]?îã×ÿù?F{üj×yÕÑ¯Õy¾¶K¯·;³uö"yùş€÷-4ïq¤ï(@qD¡ÑG€àPé`@i¤4)ê€„eÜ°ÑŠ˜I†Ø°€-H#t‰!8šyDÉÑ TP’£8ˆ”éS 0Ø‘)ñB.‹PŠÒŒ€
Hj‚@ nJ‡#… Ä™°AĞô8aÁS”Qê¤RÇíïû¾«öâä4Åû>Õë2õnu~«óÙºÔ'|óÀ{õ?ö¾òºßÓæÿ~óÏT­ÀÅ¶ÿ_İ«üTŸâúíğj{ÑîÒòÅ£óï3Ï{ß6æ¶ãïËë²á=“ßZŞÔ7›6šı³¯âÌÆ.óîûıs»ôöúÛ~¦ºü>w™vûËù®øÎ©zÃ£z”iä1üÏÓq¼}ŒXüïï¼Gëí[··Ø>µóÙ³ûÿØwç¹qV÷ÿsÚunÿÄışSoç,\Y?Îˆ—€ÑIßï¿?qLäé¬¿QıÏúÿøÕï‹Øİ÷}÷æáŞÄ#ı`ü×ó÷õ+\xoÍ/Xô¨E§BˆY€Ã‚É00<$y Â#(!V‚( XP%
	  0BÅp«‰„(˜ ¢Ò $KØ’ƒš«wB•8ÕD@-B`9U6€(…® €‚ĞI… °ŠHH`'Š€täbs À †æ
	A‡åİ?»4NrãÖ»7Úæ_õÍÍ½À¾ìÎKÛÆêó'¿XÿOìBøçñ£µ7òiñµ±ìş·¼=zVêsOrÆ‘^Ş-ÆY§¯ÿoö-û÷{“4Q•v«÷÷7Ÿk'?Øîó·Ú¼»?·t^‡^¥=¢7Úuk\Ù~şñP¢P´@Ò€
A‰j€š(’ˆÒ‹v"Š(„+È1©À€†bŞ˜`´…
Ø" 8d„„8*¤º¥yÈŒ0¾¦–J¬\ 0ÊÔ$`#	10ZX(Ô!¸ª|ÄsA‚é  ƒd°%.(0’àaÒL;Š! 0XÀÈ{àÍ!
€ à9j¡€¨ ÒQ1ƒ >	BÀ! (B`cI 3b0˜ƒ8áš
Yd]0‚û BƒŠÌ€JFÒàjSI'
áp”!€@B @ØH á +"Š X3@Mš 7F6-¾rü=²?şc±=gø¤¶ûuÅÿÿÈÛrbálOé”yåyûWİ[´ÿCç¿[»º½VÛ–BoøFï}ûşïoõ^Kë´/äåÓ'ı}¿ååIÑ£ïÜóëÛËª>Ú·YÚæôøçŞ¯ì|Åy×èÏ´
_oKÿ=ÿ×iÿ}óİæJsA„„ ["H²J@Dš  a¤9"D|+"Â&r ˜Æ CbeEB†)$@zB BxJ
˜  @ ËÍ $%	ˆïQ’°;€ )Ä˜€A¡$H AøÜPà ++ğ‹@ˆ¹&©$º¢ ‚Nä8 ˆ
O<xÉoõü“vş¿íìşùêôg‰‰¹Å¾îßTMô·jbÕª³qÿÛÈcË;×‹Å=şW›Ésî]ìêÉçõ÷/ï™Ëeÿ³7ÿ¼»ÓoÁ¿­»™ÍÏo~‹µ¿ùoÏÉóóE¹’ğôm³	6Ì+¯u½,•´^•¿ê{÷«ï‹-Ûú{˜,åwüµ<,cg¦áş#.ûÿÿııTŞOqUBşöìŞ×Võ+îøí[úÙëØË’áçÂe¯Sì›ıFèU“sg×—úŸ[í/ø“¿ÕzğÇ¿k¯Ü€ïë¾z~úO‘v›²»åbñÓï—ÆNİÜ@}÷®W·Ü«o¯õôO€v·öÛvêO#… ÉÀ+! 4µìd# ¢-10SZ@‚àW8 p` H€, WÈšh  ‘`°¢Òƒé€¦qe¯È@`ù¨RèB)wê!gàX0i–Éà&Î#M4€!@£&wÅ¾şÿùéÎòÿOßò¯×ÓjçŠ²ıïµç_ïyn‚Ğ¿]g¥‡{…rum•Š?Øü_}u¼ËÔdı…ïòŸŸî…òîíÇö÷Ÿğ¬İnéä?ÍòğO‘ŸÙ'ËÔßf÷vjì"ùõ•gıÅº‹æÆ«*v%qúVkí•M©ø÷¯Æ•Á¬ Ú˜Á¦"b
€ŒÀèâÄ@9R !"˜(€&@°ôÀ  ¨ F M¦Œ 8ÔÈğD Øx‘(ô"¢Z,Œ C  B ³‰H !d@Ã €
DD L
±¾xJ5 …  @æP|Ô¤ ÑF‚AàQ`L ™lX „9²@ ¤À  , D„ QÒDDPä†T$¬9@Òƒ€1b†€åÁZ
¸ XWIÂ¦dŒ‰°LhŠ‹‚!H"IÚ@ Xğ{£qˆ#È¦w0Né6À’€M54Ä$-8şÿ½}½T™=_ò÷Ûùî{ÿ½^>6Ûûêù{úê:ïuİ„m›ŞÅ°¸²€>÷¿ÿ­|F¿û#/Ü7)ìŸ³úe|m=ãnzŸû¾,Uÿ_¬ş·ÍhÒıOÿúçw²à÷šã'{êWşáz/Eåş¤–çùä~xGn¿RÕeÏÚÆ§×¼áFmÍE	•ÈtZ "D90Gd¸D¤Á¹Dâ 7 Q (õ`08	Â.DıøB*K¸âí&ÑW€ B° ²€8á@ ¹Ä2hH ¸ˆ àAATŒq •H-¬ã B¡„ˆ  3-©Òu¼ÍPóÚ½Æ¾;Üß>ƒüEÕP¿\ëøëµ¯ÍÏºİğ,3Òı­#wö›²„ùô<?oî;û.›Ø)W—C^óìB¨±V‰ÏïEWÍRİ±UÎoDÍèÚ ÔÏ¾ït³uşÖíòïÚ}@_ñw|_şìZ·ïí5h¾ƒ×£§Üu“ûëáWßb¬aÿ”õyµ›ñì†ıçş%ù™ş›Ìû=ó½ù›şï·9Åy°_Î„±ÍMºã¼@XO‡+Wjk†wÕÈÀ‘»Ï4„kóë{éßÔ7iò¹Ntş«½ş«:×ùB¤c®ğ4—!j÷?ïåNó‚/oßûÛ×w>î¶şüı›n¤ÛùKÁR¬áRáƒ©
ü á€ˆ$p’€ŠØcAHÀ‰B	]¡¦ àÒR`HÀx  4ª@`Ä dÒ`G9`­bA0Ç€ ƒ0ˆI dl	`‚*!@ªÀbŒ A€"ˆêëÂ! p"N@!Æûşòw¿uìÕ?ƒ§¬úî´gı£şÿû-Ö¿‡é—v{¨„êû^c°RÿF¼}ãMèÏ¯]¹jş?|óºmùßÄù»zá™^àk¹wpùöÙWıÇš}ïşñeë~Ñ»ôîëÿ'êõAšçæÙYŞ¿Œûÿ[cÍ7Ø–™BV˜Ì@€¢"U‰ªãÔ(àØÒÃH(	 ƒ@aM€ p`0 D"J2Æ[¥´ÆH‡fDŒƒà
@ZòBØ‰DB¤Ô*	åÃ¤ÔØD\C ˜ ˆd‘ aj 2Äa`ÁÂ$“¸êƒÃÀp …D ˆ£z¥bÁªd¬H€Ñø‘"Õ'(ğ{È
 CH2; '¤ƒ*ƒ@haJ µA XÓH!ÑÌ<q4 P3Ì€R(D¡@(¹a–   «$0A¢qF­µ
‚Ú{×Ú¼÷Ü÷!bµû¡ÍTËô¹İuywşş„ç?yå‹oßö?îiÙ¯ÑÔ÷ş»í<·Xz'á{·›VöÿŠäxÖº`ÂİúÙ–ÏÄâ×gÈ%ÇLÛ·ğşg£†ZçEÿCÃË'¡5G†}Ç˜ÌK¼WÇÀM§å²ó?üÿVh*BnF{B!20KƒÀ ‘I€ˆ…‘"œ Œ§ú(	A‚18 ©ÊHä”ğQEŸä!Ì9Ñ“4Z‰H°‰ Î ÁpL‡bA\ •@À%
!€Œ.$Š(„ˆÄxÕ¸°È$–à"1`@Qp(CÈÎønß2ùOü?ûyğq[®”ú[ğªäÏş=óí¿ûó¬!Şÿ	ß¢úˆùËw±iOäkôi´zŞ÷èÔ4Ç~u->gì3¯,ÿ£øõj{ÍJücëíÿoñ÷ü¯ùC^ÿãğóÿø6¿¼Cûkôî>q·Êzúı»;w¢ÃïÖ›çÖ¸»³Å×{éñæM]ÛÓş÷ÌKY©ãÿŸşñ³Øşv>ë~ÿò±Rşí=w>§7ÃuğÌL`§û·Ûùç¹ØÄOkzu­ô;ÕÍoÑß»¨—¯ÜüF¿_ûÏ¨ükİŒ_íW]¹Ï]I:\c[`¿Öé×zºÏìk¿sÿdWÊ'í>÷” @ ŠEŠ¦ ´`¤Ô«“9@¨K!HZÂ–†D%A  U# Ä¦¤ #y&‚PÈùÁ‚+à8B0¢u<…™Ë0„0 R™Ï€ *«†!dDDAx” CAÆ0Áˆ!-&&Hf')1‹a ÍP if (position === -1) {
              var topOrBottom = secondNode.tagName.toLowerCase() === 'thead' ? 0 : tbodies.length - 1;
              return tbodies[topOrBottom];
            }

            return tbodies[position + (upBool ? -1 : 1)];
          }

          function getFirstHeadOrFoot(upBool, parent) {
            var tagName = upBool ? 'thead' : 'tfoot';
            var headOrFoot = editor.dom.select('>' + tagName, parent);
            return headOrFoot.length !== 0 ? headOrFoot[0] : null;
          }

          function moveToRowInTarget(upBool, targetParent, sourceNode) {
            var targetRow = getChildForDirection(targetParent, upBool);

            if (targetRow) {
              moveCursorToRow(editor, sourceNode, targetRow, upBool);
            }

            e.preventDefault();
            return true;
          }

          function escapeTable(upBool, currentRow, siblingDirection, table) {
            var tableSibling = table[siblingDirection];

            if (tableSibling) {
              moveCursorToStartOfElement(tableSibling);
              return true;
            }

            var parentCell = editor.dom.getParent(table, 'td,th');
            if (parentCell) {
              return handle(upBool, parentCell, e);
            }

            var backUpSibling = getChildForDirection(currentRow, !upBool);
            moveCursorToStartOfElement(backUpSibling);
            e.preventDefault();
            return false;
          }

          function getChildForDirection(parent, up) {
            var child = parent && parent[up ? 'lastChild' : 'firstChild'];
            // BR is not a valid table child to return in this case we return the table cell
            return child && child.nodeName === 'BR' ? editor.dom.getParent(child, 'td,th') : child;
          }

          function moveCursorToStartOfElement(n) {
            editor.selection.setCursorLocation(n, 0);
          }

          function isVerticalMovement() {
            return key == VK.UP || key == VK.DOWN;
          }

          function isInTable(editor) {
            var node = editor.selection.getNode();
            var currentRow = editor.dom.getParent(node, 'tr');
            return currentRow !== null;
          }

          function columnIndex(column) {
            var colIndex = 0;
            var c = column;
            while (c.previousSibling) {
              c = c.previousSibling;
              colIndex = colIndex + getSpanVal(c, "colspan");
            }
            return colIndex;
          }

          function findColumn(rowElement, columnIndex) {
            var c = 0, r = 0;

            each(rowElement.children, function (cell, i) {
              c = c + getSpanVal(cell, "colspan");
              r = i;
              if (c > columnIndex) {
                return false;
              }
            });
            return r;
          }

          function moveCursorToRow(ed, node, row, upBool) {
            var srcColumnIndex = columnIndex(editor.dom.getParent(node, 'td,th'));
            var tgtColumnIndex = findColumn(row, srcColumnIndex);
            var tgtNode = row.childNodes[tgtColumnIndex];
            var rowCellTarget = getChildForDirection(tgtNode, upBool);
            moveCursorToStartOfElement(rowCellTarget || tgtNode);
          }

          function shouldFixCaret(preBrowserNode) {
            var newNode = editor.selection.getNode();
            var newParent = editor.dom.getParent(newNode, 'td,th');
            var oldParent = editor.dom.getParent(preBrowserNode, 'td,th');

            return newParent && newParent !== oldParent && checkSameParentTable(newParent, oldParent);
          }

          function checkSameParentTable(nodeOne, NodeTwo) {
            return editor.dom.getParent(nodeOne, 'TABLE') === editor.dom.getParent(NodeTwo, 'TABLE');
          }

          if (isVerticalMovement() && isInTable(editor)) {
            var preBrowserNode = editor.selection.getNode();
            Delay.setEditorTimeout(editor, function () {
              if (shouldFixCaret(preBrowserNode)) {
                handoÑŸêëÿ½B®ßíYşµÎø~Soàïkêzzo·­î¨}dœEş^ê¯~ë{÷ã»k³ï_Oõ}÷Ú|ëoÿ^•ÈùÏ¿Çùı%’î·ÛÿÏå=æëõ¶³ÿûş7}ñïı÷[ÓòßÈ×º _Ãf¿šûsgÿÇÿœwîƒÿp|ÿ¾ôÍ×ÂùŠı¿eø*ùÿ¿_ÖÕŞ³söGöã²\[×rK6Ü	ÿ¥Y¦_o¼ä_ëÎu~± )ëÎ®]îéëéûÕ÷ÒMÿÁÆşÿökû=2ß±}æ½ıw¾V	tbÂ¿oHf |–çûï·wËÿÛ {-_÷n÷ÊÂÿKò›¬·ïµß~~ÿûïÛŞ´ãÛÕÅò(Û÷³¯”ÿ¯ßÿïV»kOéç»]—úçI÷½êïï”½Ÿûˆõ—r½~ç¿5Ûş}ë¿Vu^ï§åw­ë^5Û0ÎôÕµÖöOÆïÏ¼_y'ùëıÀkz7ó3¿k¯Ø»ÖôóÌ›wVÏF³«íñŸ§{gMØšã¬¿»ûµ–ç}şißµt×Ï÷wÜ¼¿Xß‹zûáş¾Õ§oê6‚ogìıïë½÷·İ÷õ÷¿f¶yí±¯ÿÒşğĞ÷ÛßÌ½ƒ~û¯á7òÏ£ü¹Şkİ§oàÖ{ÿEÕÛí2ú×³Ç}ƒ…İhï½´¿7¹ú=ÿÛöƒü»Åİ‘LşÇ–“Í³÷;¼Œ¾¥ûmõeO=ù}t~8I×ÊÜŞ/YÅbóóòºù/Ú7g²cã¯¼{üô?ÎQ]‡y·Úîÿÿ€÷ıeÒû{ßë'ã¡¹—¶ßSı™“xo¿?Ï•^ıê\İöœQüå°<d.ñ3ÿœb^jØ|ï‹ó÷ßßÚäß½ıv>Ù?u÷ÍHöşİ·ãÿÿµõúı·F¾¾á®—qÙ_×ãŞ…ûŸ÷õôûçÅÿ²©ÿ’ÿË÷êX«zoÙÅõ‘¼»ÿİ^¿êô¨ªnşı]u6ıŞçzûË¶ßïÕîR†úÛÄß_üO«Wş'<Sï/3÷KßÉúÍgŸÙ½náıš{ôúÃú¨¿î¯­º’Ü¿–şŸÿoı×¦°ÿÆò9¿v>·í=¯¼ÙŞÿêÿß·ÛÖ¿ş¶÷û»ÊÉßû½3•§uÿŞ~ß­ÛµÇ|tÏş/şı9ß÷Ş¾ÛyŞõü÷ïæºŸûRÛ±o}ÕyYg…»êgı£?ño,{×ã|ñÜxıÚÏş§íNø}]ğ÷ûQ ş÷î›ömvğÏ÷ÿäùÚw›_±ÿ´ÿ7÷oö_Ã¬wËÿ{û×©B’4ıÿ^ñtaƒŞW=Uş~ÿŠKËxÿ×–ÅÖW_ü¿ÿŸ¼Âórıö¾éÏN*§0öÙÿwûã_özıÿÑá»İG«¹óiÍgæğÜ[~èo]ğÀ³ßÈş>½ğû¾K}İw»v©YùÛ6’ş]İÉ¦õİĞ^í{»ıÍ½WñuÿşL®ïòıçß¿¥;ó÷y¬ÒOÿ{¶ß{^WÏñÙşáûÎìùç½íµKOŸ¿Öî+[o~ù½ûû~îïÏ­vúó]e§ùU_kŸî~şr·ğÈşkSçû—ºãöÕwî÷¾m Šùçö¾Ş›ı÷û½İVç·$?ÃŞïŞÿÏïpõ,_«ËÆîüøİö<nº8ŸºûıoŒÏ–ŸÅb^ŠÇw~•Ÿwÿ»ñ–oÃÉ;Ì÷ÿ¿mMq±Q·êš›¿ş«µwãºG¼Ø_¹tÆ§/ş¿b½¶Êõ¿Ú_Ì]~ï¹îç÷^ÇSK¿úÔŞ,u2ùlxØĞ¨ÿL´…ëW¾®ÜœŸïï§İ.ùÔğ‹Ş×­ÓÙ{^•æ}gõ™sÿ~M}Ò¾öÿw¶º›6ù­{Vï½Ş¶Ÿÿ´î‹/'û¿ÿùâÇïó¹èÚëõ×ş1œïx;ûwºçwß+»ë‡Ï§óîoÅõÜ^ÔÛÇû=şh¯şx~V”U¿üç±™W3>•\Pù}½ßq/›÷.îÕ½z¿x/çÜúÛ)¯¿ÿo•ÑùNüŸ²Ò©µGÂŸöÖığ3ŸáÿK=İÿ~SÂôßîêÛº—ıôÏÿÿû¿S]ùêxÖŠ¥>±;Qk÷~Ù’ïıä^Åüÿ®¯½ŞX#îúÃï›wÏ¿oëÚêáó÷ïŠ—ùMË<nœÓ¦ä{÷]ÿ¹n&ÿ¶îÿ_ï÷Kóôºªì6÷Ş¼¿ˆçùûÇF¯?uşÛ¿ûïw­Ú5ßá§Oº[7/¼ûnô}Z—?ÛÛUç÷øßİ¿ï‹î¹ì©æ²Oÿ¯ısç{¿Ù–îh¸~w÷ï2t’?Æüÿl{¶İı\ßmrİÓ÷‘][¸Ô5¼Ëúü¶1OßûÅ{ÿßºõ¾êã]Şº}ÿ¾ñ÷ıŸÆãÎòoæ';/ÿíüåŞîº-ÉükáïÛ“T-Olowıù»ë÷m÷şÿÊüÛ¿ÛºısÿSŞ’êÃ?½g=óú[Ú‚û¼æ½şFúvöïÿõŠŠzdøëÿå¯%ÿtlŞ”ösoıoŞü¿µ¿>Ëşõ¸ı{êŞÿÏóŞãÿù]¯í–í÷şÓ»¿Ü×ÿ—ö¿ï¹öñ¿W]còÑ¥óıú<‘úô.æ[AùòU]İ[MNíı;},]ñ¯|_ñ·_ı'ö>‰WNBºëÿ,¬œ¨ŸÿVOòçÈtöÿ2­ØÊØw.ÿ~lPìø×yíy÷=àP.×»ì,ûÑˆ$cöK5÷«ò÷ëÙ?ÃQéü¼¹é>GFù¹ûûû:îßêmöî6çÓé¿‚ïŞÖçÏç/%÷óö¶”ùÒû7î~÷=}ƒóûõâÜŞ0ş'O7æıû¿şşKwŞsùúşı+[Å%¿÷â³İß· ÿxzßû¬¯}Ûfíïv_ïöQÿûŞ€Åíş==¯Ønù_;í·ûÿ´ª+Ÿí¹åï½~fø|oÖÒõúº,i“½Î}cßóÿ÷vt_mn„÷gãÏúü÷Õú«üá÷şÙçO7FÖT¿á×»Æõ¿OÂÏıëó¸Şó9ğ¶šúÓæƒÙ°ÿıÙı1õİÆhŸÏOÇßnn=é=}^É¿øñqSJûı÷7ûµnÓŸŒ¿oõdşdï9ëë_ı¼§l?ñçf¿ëìvu¾÷ßüÿEgësùó½Êómïÿ£î÷âê'ëİû&[ıIç~¬Ómï¡£Rû+\±±ÿó?×ïäİ¿-;é½§Ï‹uıóÿÎ÷îôõã>úïûè[ü¦õËı–~÷ÿï¯×“|ÿï®ÿïjí/Ï®kÙ§vè¯^Ç´Ÿı;å·kuüŸË¹Óı\ıÊï»ı}y®÷Qëõæ¯cÜŸ{ÿú{©ÿû¯å7ö»ãŞ•_á5ûŞ÷ß›íá?ÿ²Èímßë•ÁsÉùíïßË¯{C÷ßŒçÕ“çª½Ïı¾İçE¡×á[Íû¿{ùU¯ÿ¦´½Ş7N»ÛóGó_ûÜ®Ôİşİş^â…s2/?m·ÿó?û¢ßakŸ½®ó}üD{­ÿ›³ûS»>'±??e—ÿùÜWãWL÷|©MwÃ7*Ó¾èOg·~OìOü¾ıöœ³T¿Èˆ„9úÖßõœ]ÿß»†÷+&xõåıZÍßĞï¿ßÃùLşÕ?ßÍ&íí`ïß³CË¯ï—g'³íÿ!ùÙ¯‡ÿ¯ù¿M”ïßÅß¾7Rô~ùå[áï’·?×ÕO{Şöï»Wkİ¨ßÂİø¿éß¿Ô'¶õŸš&Şÿ¯q×÷ø?¿¾ö«ïcYıßÑü«öÙôâúîÿô2»gZWû¿7úùfO³÷İûıw%DOëÿû?‡X¡õûóz™¿ôwW_ıõ=ë…ì¨iŞÕßğıU¯º>Ô…ï²âë3¹Ÿë“Ÿı®BİüÕZë|ıyÿùÇ›wìúò³y³¾÷ş»âÓjü¹kõÛwéváşœKo_İê¿¿œwŞïÎ}§ïóç¯D÷ëÆôWûÛ6Yãí“¿å†ö5–†~¿h©ñßÇº>Éàğ“²û;¹¥¿§r~«´´ËxYú×+®Û}¿®î»;¿vu¹´+½ó¶$äï¿Tß7^şv7¿_i)0êİıÊ­ÿÿxVş?^‘ÿ Ç/ê:ı1ßwšÏûí3í-ïÛùÏõoÇpçÚlı;÷×ÿıòıîù¯÷1£Û©\Ûüwoç7şnĞ\Ÿ8¾?~z_îı'?q1Î.úI×˜î~®ß¯=[Ã¥ùÎß³ŠóŒßòÂüí¸ŸïKÃÿÎÙo;¾›ÿn_1ÿæRş}û¹3éü—µÿrÓ?;¿*ıkO¿÷ø•_M×ÿ•ï¿œïß¦­İngŠ‹ÿŠõ_íß.¾ëoš^mÏxÿkõ¿*Úu6¯§×Ÿñ÷8^Ü%{§ş‹×Å­Z½'mûïİİÇ¥qç¿åd¹è~µ·Ïæ¹İGqk¦¤	¥vïß˜ Ï‡Íºã³¿›íÆr{šäí£ıGğãz÷–çØŸËïıæ_9§û~ıı4[“tü–ïÕ³_sŠ»ëgùR™óß;¡Fößúœ“÷NçUİîºôğù0u¥uÕÏV”ê”E2}	w›/÷±”ù}¸}÷Ÿ·Úw‹ó{ï?·šFu±¥	ÏO¾wë»{çO?K÷nİ›wı©öÔıûü{÷ôû÷ı·eº#ßáøÚÿüşø'•½VËçîÍõßÿnx[ıı¥ÿ¼^¸óı·äşí¯ßŞûüêëÿ«{_öïjÿóûµS.áùç:ıdşï¯å«¯Åç}.?ïûÛßÜÿon[_Ù»¯×
».7çŞıÃû£?æ«ÿíènÿg½æÿó»~İsWëıñãÇ–Á}Œüÿa¾¦?ÿüü¢?Ê×÷ôTõÚtÎ?Ãÿk;Ÿso‡ûÏ÷ñ¾Ü¾Šìxï;WØ!çı\ïÏ'-¸ÕR¥¯ï»e¾şúC+ûøfı¿°÷ïöRu“JÆ«ûæİM~_Ìß¹>õñå·ŒıßÏ˜–ûşó½S7su?÷\¾òş~ÿ¥ËÛ©në³÷|êëËMÿ×Š÷ÊŞ™&¿ÿı¿ğoOv»<éŞß°Şûş¼ˆ?Qÿç{¿uU½—zúo¯áß{ù±¿êë^û-¶÷ëïzM»¹å¾{ÇOÄöèÔÿÓŸ·~óº÷ó¯ó=}y?>ÍÓ¿Ûİ;é{q>íï·çû½vŸß×~,{ÿµñİÆ|ëşßÃš'ïŸë¼şeÚìõzª’öÏôıà#Û~»ë.ÒŞÛ>}Sÿï™ôÿşz.í]Ş¿ß^¸Û÷Ÿû¿ŞûïgÏûšœJìe/w»ÓÎı?Âó½¯İ]ßËâêVõ×ô¿{æû¿Í9ÿıú¿ÿlTÿ¿/¾îóÿçïÉÛvo4¯şO®o|ş_-gÛï£ôí/œ§o¾ÛïÛ£½à*ÿµÖo:øö×Yï{NÛşŸò
ªX|.ÏíışîßÛíï±"æëË­íéÿmn¼_»š_[Ï¿9ì^ÿıRl«½¿‡á¶>]Ÿ¾}˜muwğ·Ê ›û.k—ş}°?Û/O~WæÆôúbVµ6µÓ¯/~ª¶üÍ/º)¢ıü{ÖXP†uÅ×ÛQúùñWUŞçl¾¾fİçoëš·Î–çü²ªßUíY[WôÎİít÷:ß›ûÔ;ıûUÿÚ]ßçÿx¿³ÄÿbğOƒ§o¯ëøÕ©)÷_.ëeÿÓQS­ïüŸ¼ÕÿîôO}té§G‹ót¿Ì"/õçÏşYõzûïn~Ö½õ6vÛóZ½¿çøÑîvïÿõŞ÷^üâ.}ÿkïÿŸÎ¹ÿö»æÚn¶õŸ¹ÏŸá¼Y´W·‡o÷ûß>šñ;üêNâG¦{Îÿ;÷æ‡b»¾ÿŞ¯ûjûş·mÿì×Ÿ~Ûåõ¢ù~Ûø;˜×´¯ş·Q)ÿİ÷uYãŞùïŞ­cÇÎkÓËş×Z¯_Ÿmwìøışû}ï×ü¿wı}jçô'ã¾§L}d›>]ËÆÏjåüôà÷¿ù¯÷ûöw}y÷ÚSï·û­}GÛÿQõ÷}EÓ®ú>]ß{şï¿{§Ùú[vhÎşäCşËÊ·ıÀı–Ûïf¯şxnæı×Èİûß‹ùşù…ÌÔbü‡ÿ¼zõëÜÿxdëŸ‡õóBiGè~‰v_ëïÇ›ëï³/¨s_ŸÕğñ/Ë¦Ó¥÷éÙÅ$û¾nëşßş¤:ræ—;ã¥;ÏÃîïÛ³ñjwújyuõ¹”¾Fpçx¯ñ«Çò ¬¹§ÿşbşû¿«'¾ânƒÕÙ©»×Ë®Eûßs[×û½ûûFşÿcÃûëw¯ûæ÷'êOÚvóÿ±ís¼^É…yÿ=÷ï§hõ{~¥[ïÿû¾úußê«ƒß[·Ÿ¿Wûo¯ÒïßÆÎÿñëÛ.3o–íLhÓÍ^÷ÿëyãµÙÛwëüô»µinøİ¿}ë}OîÉã8íäÿ>W³-¦V¶ócğŸßˆûÕ}_¼ßïy#¾û64oœıÆİ›l€>û{ŸQõìıÕÿG…ï–oô»û6×®üÛyµİfÍIY¨ÓÛmnßqş-yü¯Pİ+ü¿ÎöÏ?½ÿ÷û‹÷Ñ±~½²ÿ5¼3óTO½X>èü¿W÷[ı–€ãi\q¾ø®]}pö?…¥Ow·øWİ?‡½ó}BóÎÄî_¯Ó×&/I{íoÛüüıÎßãÛğ›y?Œ~Ú÷ûc[ë§×[ÑÛÍ6¾RÏms'Ÿòû˜òÜù!Û ö[>_÷ğ×}Õ¿F²q»öœ›ıòç½o_îsÏM·ÿßûößöôñú7ó³ÿ´fóıö¿ÿynTÿã¬Ï5ïİ—ı~{‘wß§óù9¥{ëõÕı__×ş~îæömË_ı—÷_ìİ¥w¿÷ÿı»œïûµktÛÎ¿~óş‹í^÷íñ{—ñîW_÷bn|µŸ™“®–mÆ_Ã§9]°ı®?üåcÍÖ½Ûlù8çf]J×ïÿQùeÿ×ÿ¾‹èíùÌâ}Ç^vê5ùÙ˜—µLçâzÿoìõíıŞµ™mİœHÈõ­è}Â÷ë†kû2ÔDÿ×?é”îÇ~şyÿësædW³f÷ıóıåã÷³Şgõô}XÏïİôÇ_ß?ëïå¾ïş×¿~¶_á¯~—Ù}zùÍí-óz›-íÿ÷B¹İÿ¾ŸoÀ¾–{í6»èÿŞgß©é¿n=Û®ÿí¿÷Ç^û÷ü—h¬©õ?‹çùlÿ~×w²}®´±Àı{}«÷^§¿]ïîï»™ŞÌ,ş§;Ùï«ÖüJÙõmø÷7¬í'ö_îº?,~ÿ¯ÿNÕ÷äß¿ïQÇ»*Éÿ_×i>ùOögÕıs^øÛÅõùìó·ı{Ïû~şWÑÿ^´»Úïú:í÷öÏ~ïü‡NıfÑœ;úùMö÷R{Ãë?şÿ×áæı¼û^ÿt·ÎdüŸõ1ÿ¾zW××MÈû¶õ3p}ûÙ—±n{ÛÕÿ¾Ïqİw{vüS¢éÛøZo­ÿ¿N5ë·æ“×úÏŞ‡ûwe7©ÊÇÿíw{_ÿšı©{6íÑü¢ü]ìİ+w3n7œxîÏßş¾lãÌÖ½_îçíÒ[V“Ïî—lÓK/;ªïGE÷¾:ïûwşĞ¯›v•ŸP¶»ú^ÿzóæ›şäúö=£™ÿé]Wïû¶­÷J[{²öÎe?ş<û¶í§-îÍcşÓx¿o%ÿwŞ¿ì¿_örSÕî¼²wÿ=¼¿äõSy2«»÷®ıÏ¿¬süüşÅ,õ¯ÆoúıßÛ¶û¯ğ{»s—M®Çaú†gl7’ïöõ×7³ÿµoõ-»&ùfr¼ú›©æ7üÓ“í-KıG¾÷ÕÏszè/xvîÏÒ¿ûx_Ş×¯â(1¾}÷ÅıXoóò¨MæÿÌï:íğ÷ï¬Ê6¿ô{Ò./L½Hçışnú÷±ïïVí/}ß<úT¦fÉç²(G¿oÚîÙLŸSœÕ÷ËÉÿ]Ÿ—æaRÙífg1q?¯Kò&Os+w½³ÿşß”ÿ¶V×öøíŞî9_UÜZÕl'ŞÛ­í¿ÿİ{ÿUXç÷Vn…wv¸k±)üÿ¾~ŸÒßoşŞïÛÉïô…´PÆÍ¨¯÷ªtu¿-ÿ™›¿øbmølİ™3İòq­?¯ÛşVø)ü÷DóûåÓ}®Ÿkç¿æóÉ>±¾ıå³¹oŞ6şŸûûöÆsĞ¿¯Ê¬¿†ŸÎşşæMËÿiãëoÙ>ÿøëÏ¾2ûmóÉÕ·ûÏßç’ÿÿ{{úû¯®ôº·ŸŸ·¼ÖoºÄÿß^›¹ÿ{üŠû™Òı_oµë¶‘şıÇözëûÌ'ÿSÍ÷»çºÇõÏzwßPíÿjúÃ_ûÚ;©¢±ºµş­åÇõë^}Ö¿òã5ùôíÛïŸµ`*"ı)/]×õ¿¯{»êùŸÜ¾ã_÷«yV¥iEçUKÉìÙ?Ò¯{¶û[<İ6Ïî‹×Vòş×Y´{ãÿÿ¿œ{=÷¿‰¿÷Œ­–Ïıÿ×ãkîõŸ}yö/=½åïÿÿõ"^ø.ëW)ß½ûş_ï´¾Æ£ûëçç÷²şûçïö»§ÛæıóışïïyuŸí˜û÷áÿkß×SÏŸr6Û÷?¿Síÿw÷ë¯]Ÿÿï%ÿ"ÿÿ;ûÊ_T~^ïwõN{®ô{£œßçÿÿ®ó¬w;Ûwºİÿ¼ßzõ[µòúY÷şÿ~¾½ŞöÍÿŞş«½×üVÿÛîö}OÃß[¥mÿíú¯ıÍş?«÷/ÔÙğf¯ÒÛ×ûãëßË÷ôı_L½÷?ÿ7q•O¯†íß"6}Ï×¯Uü¶oî§ŸÿİÖRë÷¿_Ìy”&³ôOwü¿·ÛV\ÿ¯]•¹¯´ŞÖ7ËìrÂûáî.¹¯ıÏÎÿŞî÷î‘ÜéG–,|øü_¬¹Ûá~ûO8àş¿?Ã¶m_ëS¾Ï-÷ØÜo·äİ×à¿ì»GÛ:Û=®Ş»İä™ûÿ^ñ¸şöû^ÔJó{òw¯/ûO9sõŞÿvïïìÚııÑÍÿÿınôÓúáïSc½ë¿¾¸9^ò]ÿıúŞ/¼İ×»ÿMş·ïëjÕŞ_„o.îşé;û´.ú•ò¯¿Ú­ê^üykz¦Ï×S;×olé[×ıïú¶î·üú»;Úm&,ëÖ6¬Od¢_·[o»ùı¡OüÿØ…¿9íi{#äœ>ç>ÏíUßÔ»Ïa6ÿñuÿíÕØû_îõııl¦ÍüŞÿşWş×)ç»êÿOßıõ§¶ş(>ûSã™w«şéö´¿ÅÚ~ûY½-3]Öœ2M»&Òğ½lïŸ×ËïçÓúÙNÙŞÙìSÃ¼õÿì÷|ş}9ç÷ßGû·ÿEã²Õ{E_§D°ï‡Ú²©rKöØwVúÏİuv<?—8ù}ø¾vz\†ş¿¼×G!úİÿ¯×öÏÿO;›ÕöîWÔ¥®G«Œo¼Ü§Q¢~ÿÊš©íÿ›Ïÿëå²úşçã6×>¥­ »ÅÎYó»k4[Cóä3şfs7ëF·?®ìºûê‰kïÏ¯»_Ï¹]ßûcÕYî»çïì÷zã­Õ÷æµ|=ãóğ¯Êş¾Õö{õ=_¼ïí·cïoê×ıíòuÇÜ[>şûKÿõ^&}»roÙü_;Ğ¿·{¿÷¾õŸß­^zë»ŸÕïß—¿t#6^øÛü·‹h¯¶%¼ÜŞQ•gğ}7n_ßK§˜Ò]Óï÷+³ó6Ï:ÕˆÅ^ıÖÎ¶“Os³?Õÿw«û,„âıøÛşşŒüßzWİÚïÿEÇl¿ß²¯/çvö“»ïöìû}|Á­_+ş³êôÿ‰Œë~8yöv^Çø=¿ïü'ü©xıĞà×Ó{Gšv­vÛéŞFw/şûÌß·ëıû‰ïıkšÎõ¥MıÉş_±¼kçGgÏİãÒ÷8×æbº—·íŞ¯:¾7g{´µ¾K?ËÿØ÷«ôz_ß«ûÛ›Šş‹ï‡±Æşÿ¦üÖø2×Î÷¿tü=ßê_£›îË¼¶m]çíÙÍDïò*µ]ïÖ<ß¯ìëó?¼9yÿ>Îówşëv¯S6Røÿ›ßÿgÛ©×o¾³¯qŸoş=¿ª>³ç0î/ò¼¿¾§=qİÏşûâçëİïòXï¾ÿÈúşÛıÏo{çázöîØ÷ÿ§¶7<z×‡ªOòåqïmÿÙ?q¿ı6Ş]ÛGüın5Ûk»õmçË)¡~?[¿S¸şß&7çÖ'{fı÷wÿ¼ı3ı~Õİ‡[Èï_™xúÿÿtÿıñàÓG2{¯wÄÿïòÉ÷Ù?ù|¯×^Úëíÿñ™­ı×úÃëÇ×ŸçSŞoãRYoÿë=óÔÏÏ~îÍ©·xšıŞº÷ŞÇOß-{³ÿ^ıîŸí|µÚ¾ÓŞë·OŸ?ÊU«§Ôîµí¿—ïıûœîóİìûíÏîåñÿı{ù'ÿåíÍû{/ğ>yë?îUıÚí}ı?Üÿ8ûúı×ÿµş¼ûufÌñç{,ÙG=şı}ü/ãøşÖ^»gõŞ^·Öw\·>Ï?ÜÿRL{-¯›ÿøŠÃ¸O|í=ƒ÷_}ü>ë?ö½»Î_ßë’ÿVÙw¹Ì›»Â…¯ß·~ÍNægœ÷ónñöÿ?ùï½[S³=ëÜÿ÷Úïº?ÿ¯2à@/ÕÛî¿­¯{;à¾½/¼yïş_«\|×g?÷£%?‘Á­s3‹~MvïãÙúÖÕûãêı¥OmşNàSß÷Ôb›
/3=èw½·öõÊ¶Õ´Uí(x }ğùßş^U½”kÒª™ûu¿é¿ë{Âçkı—èFîúhnw¼şîşû[»vü—nŸÑéïVPÿ­ö¿Z½»´Ïévú¦ÿÿø=ŠÿûVşæ7Ï¥ÔõNÕÜâçşoËÇ/ëÿ¾Æ÷î¾ÙİïğŸ¯yÿÿûÿŸ¿ç£A7ßë}uu~=üñüÉSù~7ß¹_¯¿ë×ï¥`(ÿnñœ¢×êûÛû˜<Ï¢Ş£¿üMêë¬şş¾ß{ÜMËÿä>ôï
9™©‹×âï¿¿¿¿w÷_ï}=öÔ÷9÷ÿ›×–§B?eÈØ0¡ ÄDœ!Š!"¨s€YÀ€)0éT`3'ä`Áè D°,à$2 Hc q lLÜ—	"àĞT 	óØLÄŸ^21H€XE 6¸ÉLÁ¢°§€ @1„´†G€ün£y-i1 h&«»o`D1(±„@‡A†cØ7µ¼šLLp—3ÈËf8wP.¯Æ  T7|!ëàH£Â´$ZêÆ¡ñMÊé"§0í )´CXÖEË€Ä30 d3`–@´,MQ€`¬[KË!	Áÿ ˜T TŠNî¤Ë$PK6¢,„#|Z­P^Ê=P:…Óqª`,`QU0v!À#M,ZÅâY ¢a´¨O{f
‚ÃZæêA\j£h f ’¼%¯œ`
Ô"‡D0LCâƒAA5Ä²€IFD!

9
Q‰õ„À‘UPÔ,Df‹$°É0o)4E²H@
M p@Ïõ B ‘“`p,`¨H€æ	Ğ€Ë{`F‚ #¸Êæ ìX˜ ’ÀÉQF\C‚A8	‰KñRÑ@ á€å“E€ @¬±¨xH; º¯tù  ñ(€dS1·’`¿QÒ/øI
¡F2#¨ÿ¥Ğ!p”n86è(]\ÆŠĞµS9PÔ‘ ¡(ş&uT‡K»— $"HH` q
’%„›B0 Œ Ä
,U¤áøS°£ ,h³dV#ñQ>TBã’@Ú1ÀpJ€ †”…-PĞÄ¶(*@À9ÀÔ+ TH4ˆÅ@Hˆ@ĞQÄ”itàDˆLPg¦Î0€ ¬ ‚Œ ®”E ¨Ô‚T qB|U/@¸6ƒÜÌ¦R„ˆÔh ` A /’©S‚Dà0ˆIj4àL!%UBÀ  ü,C À& ,T˜â°Z
Õ*Ã)Â‹„R°	"(,g;­‹£ ­pÈ —0 èP‚ˆ  „03D…À'	TÈ†á`(²d 0¨5" !„ºŸ†€Šğ )Pš#sN`"tĞ"$j¤0ÒÛ² “!ŒÁJÁQbm†¥ÅÌ’(²À`ŠÁôß©h,7¢°"Èh,f›—ËÚĞ((˜2„á»hK Ÿ`†çHp)+XPD±0
À‹†A€¢˜A2
U+‡Kx¬
ì Íã'‰ÉR"#d`ä(%"ÀàQé3 ™€€1 !€.cöá¥ˆX “„8I C$@°qG*„0PÂp›$êàê\•nˆ~Ä `,FV‘B‰ @±ˆ!T0!…x1º"Æ!ÅÒ ‡ì¨Ê§€'”	 KD]„w°K‚à"G¥ü^lŠ@EŒÊäôGÀ á ¢Àè £D;@ƒa Ğf ğ‹ÂF‡C‚8Q”s ç0##"Nˆ'BV bXõò­Y0,2À¼ äˆ±HEîÈ…¡%é€p1b±ˆqzéë ²e)	Ó¤†äR ’zLà:$>4&!:^fWFc6â3ƒz‚$‡âÁÂ
4@ 0š²¡¡Gà¢€B·ğŸRS/bzƒ n s€$€§Cj¼´R i¤ €‘X"`D9`º-"–T¨ğ¤A ‡°hB0°¾¨1"&i`¤á åYP1Š$€ "ap€$q?É°È ²@aFÂ¨œ8ABŠÆ úQJJ$ÊˆâÇ‚	Xh‰ 
pÚÎ« ‘'üTI Ma2J r†'
O j€Q^A&F;„‚¤‚(AeJ6@Ó„		 Å#AhÄ€
LW¡ oˆSGS ]ˆ‚6 À8øeJ†bEI1EpÄœ WÒQ	N: Ô@`ë¬„ ‚*.`ªA	"@0"e:TŠR5‰@œbâ”Õˆ€B˜Z[!Ä ’¢ÜÖ ØBáq»T ( $GL%@%Av£€%ğ¨LÀÊ$`8@ !Gnc0ÙÁZ#!Bğ
É…@@5 ‹™Ã¤ 5éê! ¨ÇcÖ ¦À¨H=TÁSäCúCà9a `Èb OÑJŠ‘%=Ñ@ÔíAA"‰£#YT´È€ø^'Â…™D…¡í¦¨9Ì0€*9 b0 Œ”h…14‘ÎªF„'X&,U]„‡` ¤;$v á¹ò&–İ“ğJB(
°0Æ)·C"À'ÕPL¡0’/(“	à[İ •­ĞŒnnş*I¤ÄÈ`
œ­‡AHo"@ ¢A2zªĞ á‹y@B#®`"‡ä	EáÀ0@»¬CÒ€4 ª|B%ÀrŒ!	‰¢x ÒÌìL":‰ğŒ Ğ¨Y•Ï o®2QÁ	 ÂR(ÁfjÂ@U@ 	w€Š‚Œ¤À ØA#5'C	€C®Z!$&¢`K		Àd¡	©‘Dr 0™@ÄT8„ãN ,0(€ˆ›yz*
$Âa “‰}"{RWÁE,ÎÂğ€¼Xsz€‰2l’‡mä€:	Ú$‚  ÙÄFÈ¨Cê! 	K#gT3õ-5D†q‚`»®LL V DZ)åâS ‚`4"˜ŸBNb "¢&p¥@3wÃxVUyĞô-4FC€°sE” `‘(‚èÁÅ™  ,BIzb‡A@0–sÁ0GRèO0Ø“‘õ
Š¼„À™10€Xe– TŠÄl!`WàGÄ¬<Bä €KÑ‡âa/
LÓÂø"&_@IÍ  8ˆ"Zƒh’ ’fnEX‰Œ
Ü„ 1¥A'` Ì½|F ¼d0% 0¹`(aŠƒDÃeqP	rˆC‚h@,–	hR1À c@h;.Q7ˆ‚2‚$1 Ø(ˆ -p˜â@+aàD'’„!¸L˜l³	ä±2”!3¶Dš†‰ìªĞ ¡¬‘4‚ÃHá"(0º2Æ$r*6*0}&ªü<LŒ¬ùÖEa`HÈ; h¡%MÂ–6dzH7G€Å>1 X!ÀC	Ñ4‘öÁš`Áë“£@à@l,r´‘ —‚ P @P€W¤’À€‚9ÀDP1($¥…0@)@9ù DJˆ4¾TP%Ù.ƒÖ€€ ¡`„5 À‘Zê‚q‚æhµ‡ÔÔŠ
ØÀ( EVf, •T!(B"ÀH° 
INH€@ È—œ-Â%ğ@
P‚àq B@@ j 
FÏ €ì *HŠ\B” <ÎB U`fœT* x
Ğµ•4
0 )ª¡£¤4€UV¤E
 "Ğ„%FŞäÄ Àˆ–ÁÒ 0„dÈ:’’h2æ»-0À0IR¨¤6Ã›àÅ`Ü©
¤Ã´Gk&¯Àj¢È@*aö²UpX„¸&0Ô„§"^€…’Ä á0š R$|–0…ö°ZD1b‡"óú¹A² (´ğâ@ ¨	ç j#r€/]Ë“&ã	ŒN`˜(¸P’HÑ2Á
Pb”DâH#‘`"P¤uQb5œØGÕ5„“³€,¨*J ‰&	 @à
ùD@\(pA’ÜAIR#'hDT
(- 2L()KÈ€”!€€‘T— .ÈªÍ@/ á#8‡Ü£c¶ñfˆÇJ¦$ê¨ÂR‚ÑP@¡E	UŸ±äG Ê»@‚Š’5±ò0Ä‡E +j¦¡22ADñAJĞ‚Dpˆ ˜Øq(—ı¹4	±| mÄ(5$šk¿L«ŒA@e‚Ğ;B*¡ ,DÛ"U`0ÔBw†Eà	CŒñJ5%³¢™‚²Œ%¢XC<I ƒŒ¿cĞ²R @Ğˆ…‚d!¢M1TJI
J,ÙR”KP‚N4†‹á‡ A…XF
,5i E B4&¬àÎË G¸@ˆN€E Gƒa<Ø$5h ñ´DH ÒBˆ€Öƒ¶ / Ñ&H«€‚0°A ƒ± ñö‘Ç§\B‚†ô€É 2F-Æ	(€A?Æs!A-DU ‚˜Ï
™ïhgb2 XÁ	$¬ ˜HA¥-A€èZ& É áQU
ôC¨!Ë VQ NË9„„ƒ  ŞÑ€4J'ˆš#4cÃ@÷UjäRÎ(r2r•0p94`¹°›@­8É"c?  +‘-=£bğ#9†dIâ	 €a0¤  0ƒäV0 Ğ 
a` `‘™ aZ‚Î–ƒÀp²Ñt0CÃÑøÈ°+Ejˆ2Bœkqß ¨¨„f€¨ @`q ²  `A–À LÅˆÀÑb0„„ 8PÇ42Õ1€N€ fX)
t ,Ëx•0IJL0È h—fªhÀ °0®A‹e„

 "Ğ '0‘[¸…jğ ®áºÄA ÁÆ¨£Ğ
ƒMœ!(4€@ ªBP\@lq`£ˆ€I‰Œa¡ 
2´" ’D$†‡XØ°×f˜7q`$– T2Š!dN‘O2@‹¨p$C¢Ï‘ŒÔ…ACÆ¦´8ËA´, Š¦ ² 
O‚ ©ˆ¨`  J^dÏ‰tW$Ò(!W$BÚ(,†‡q»BÜt åo}×hòùïÿvß?¿Ö­¿/íŞß~{·µÍÛê4ú/¡¶ãYY~oñOsËÏã[j‹1şoëdÏ®íÓs«D±¼Ñö|~úÛş:º*÷ö}÷·3/ûü¸#7³İF¾Lj}?ó¿kß§¿ Õ˜o=½×³”¾2®Èíï÷­îc÷Kmw€¨¿6¾9Y Ï»¢n­ôû0¿¡õõwš¿÷»¶{•Ô?_÷õËó«ÅÍ³ßıÁÿÃıôÿæÿqÜ÷,“îu<ùšÊü6çKœ¹ÏÏg~É÷¥j¿?ÿnòî—oı¼vë^¥/}{ßıóß}y¾¿çık¿~µ×ßgfê«~#SşÎÿ(ş/Ovãÿ_vô¶i|ã{h<>šÿ.ù
\ÃÈıIöo§WQêv9“Å/y¢y·cÿÍÿ{¶ìû}Bwş»ş×ŞMõå¾[ûş¾ìô3×ßßÓ?İÏ{Û>”;%ïÊõı½ëÿw‰îì]ö·oİ§(ÿ]»nÿ·=yÜôfşµõŒwvüçë
ö§p}ñÿş°;ÏÖ?ôŸÒ‹ëg¿ÃÆ.~Ùù~Šÿ*ëş^–İËÏ«ÎÎ`:ş+úœü5ÿóıfÙ»3çñïyßá«Ü×ûÛÚ7œ¿Ÿ¾±æıûa£ıª¿÷—ë	\®ÖíwÙûñí®ß£™½áŞ	>Ãqøíÿ”·´§ûûÅöş/õÒóOw±øİ§ıßËkÍÎõ½DıïÓ¾ö¾ëuùüOûÇkß-İßÙX‹ûÿ“ºöïü¯ºVÍ_õ×q^|şÓÿŞ;ïÿîßûs\İ·¾ûıË[yw+{yş»¯yÿ÷·ß¬÷ºê—ıÿöİslí÷W÷fµ•º™ıgõ5ÿÎoıòMwşßùxşõá?¾sıVâ}m“§ÿöÇWş÷Ò÷»üõõÿY'óùg»#ÿïáqß;Õæº¼·q÷]gs6.£z;ÒXü­*ÿÂÿ“ŸøõÃvëÎ·ó÷‡]½ÔÆZÛïÿ'¿?~£x>úÏïŞë­>ÄÅÖŸ›«u^®}£»©»¬·»¸¬Ï¶TÖİNIÛúû]ôŸú›>’ş¤ÿÆû¨dûívÆıFmçàuŞ»[_ıoägv'Ïg…¿à|zyıÿÿ¼/×†£¶6İd3–Qıı<½›Ù¿¿æÿw`Ø‡,>Üõûü:Sİ‡¯ÿé}Sòı3åóvç+ßÔç¡}Û¿m¸nïG|msıåß{v»ÿå~úº>¿,N°qıÿ?gı»‰óÙ¸ïú³\ëõq¶ûôÿİoæó×ß»yÿ½]çı—h}õŞ~¾yßÛû‡3»WÛİïÿÆé·oùÿïÿ?ãw‡õùt/óã÷Ë§şw]ïİ÷vÿŸÿàùİşXÊæ¾À}3:è)z^ÊÑuÙ¶{t2tñÜ0w·ëgşûQõß§î‹ıl†gÂV|şoO½ñæo?ÔìŸê¾ñ§OËCçÎºİw¿!Ï›ö£“>÷µµ=ş>—Â	‚åöØç±š‡JÜò+ßü3ß^Ïıs±ş7›Òÿn˜vÕG)ÿ_^íoŸ—\ÚÕ˜x~{gw‡æ¼Œ¥úç»/løıÜ|ûóØ¬¯×·äüfowç}ŸïôËïwûßûô·mUïüşÿ×÷ı|_ÿkŸâİ_ıçévü„Oê×úÿÇıï÷dOñ?/o¼ßİ»ÿ?i÷ø;÷Íö{.y-ı7öªŸ7|ŞúºÔìÿcíKÒwíü¯÷5=îìÊˆùş²qßó;twc®Ú¯Ó½6ı–ØÏÌşÿoWşşşú«õ:¾½lwÒ®i>¢»íÏğôöó®¼÷Î¾i÷ıøÿõ?V™·şŸı{Õû¹›ü?h­|ççû«_ŞS|Ğ©óíëº«®G?ÿ•÷e»®}l__6óMûyı×¶şÇş¿û]ıú¸™{Íü[ôï§=Zj×î3ÃçoaQ¯òûwâû°×.³®…¼·ïã}aíúoíæm/_paşícºooŞÜiqç‰ÿJ1ûµgû_sïÆÿ7½¬ğ¶ÿûêÿE¿ı¾ìFà±ÿ¿§æÿ[¬ëÖ%ï×åşk÷Õ?ÿ{­÷Ç÷V—3·ßı}4¯R
ÿÕíàüÿSX§?šîÍ¿òÿY¶§gûıwş}Ïß÷GûÛã»ÿN¾çëş÷ö¯}´¾û·:õÆ>®y¼1Ş¿Ü÷çå]êû?·7ÒüûnW~—ïØs‘Ûg¼k±Ú¿ïzûÎ}¿_,ê—ánNÔÙ¡~ıõü2»÷ñŸõW=½¦ñÛ³NÛ*şâ3ø?W¿¿n£W·~ëbÏõo·™Ö^ûó "Uf¼>ûk½¿RáE«1›ûÒM_şß/ÿåŞ5íi×|¢_ªİwŸJÿTzN¥†Ï?²÷?Ïı¿ïş•7¶É'w}·Î×~T÷=ëËİóº«6mËšùg÷ÿ"õèró¶”º®ÜÉWşñù÷ügÓÕÜş÷Æı·kGİ÷íò³gû¥öÛ?Ï•CïÔ{ûò:Ş76îOÛûßuÓ>ÿè?¾ÿtgıÛ¾¶£¶ñ°Ù+­§¼7•ı‹÷çğƒÿlÿ·¶ÏêOì÷zíÿgÓ½W«—·³ÿëö¯ç÷ıÿó»ÙÛúönŞ\õËåşŞÛÏäfjûİßæ¼ŸHù«ë_mıæg»¾¾óÿşg¼î£úß{÷o•ó«Üÿóæ\Ñóù_Ÿç¼ozãú½[ÏîşFõ_}ü'»Ç¯İo.ª=¾^ó{šÚìï.ú~;ùWÓ¡¶şÏû÷Ûƒ“›ÿeY‡ÿ~­çŸo/_CÛò÷øvÛçëÛ¿ú}SÙ»Ãïak_Ÿ¿ukÉıÕûÔÿ/½@H?Ş¯Ï3ÿî…ƒq‘ın¥ÿs÷GÜû¯òuí^6o“mô¿sö×—¹÷î?/«ßåİÿëßÆ«_·÷Š°¥İñ»¯^oüßÿúÿ6ßíşgïáöÅ–óıÍ)ÛoßŸêŞøÿw·Ù}ÿÿ`Ó÷ßõù¯ıOïlÅwçk9±‰–)}û×ö=vcöó¶~;ù×ãÛ~¼¾óÿ½GñëDüãÓïxùı?wçä†ùßÿçºå-¿ë\ñëoöıö©¾íZ}şıÿö}bØšùÿäËâ¾·§ÖìıxUşÏì²R—÷ø:8/ıßÖş°şì¿«gıÿï§×çíÖ_~{]»ÿ÷ìßêmşÃrşëş÷Kï01¾·Ïî3rûÙ×·\÷{¿ıvşımç~2Ìïıß¾“·ıÿûÛÚ7ıÕİİòíÏúWyÚ]´öˆ^ŞO{ó·“:Óÿ×æ}ßçŸóOû~w>ùçşİû<©WWîü×ïÒ®æ¿y÷Ößı:Y»ı[×v¹ÿxùûÍ¢[SÙo®ÖoÓ?ÿßkyØ¾ÿËówNÿvÿ÷ç”}ë»5ıoï¨ü?ã_;guçÜª‰µë¼ôvÊŸÃsùXO/¼N›»×v»¿æß¿¶vôWş¿Ö×‡ßvû¾ß¼ı·hö¿+‹]ÏYŞw~KôŒ¼şGo¿şşKÿû½ÊóÕçû[Ü_7}¾í¯îŞ]ï§~ú|ßûõê½ì±kï{?vY­ş}^ßßîØÿfVßÿşÕïv¿ùè}·Ãpj:˜ã¿zì­Ñùs­èıı#{–ü¯,òÍÿò<Ã¨û9§çäóïÕO/gá>*ïs¾îç¯·ù»Ùëø³_nÒ,ë÷ş^û—›	ºt—ÑûçoëÜÙkıá¾ÙúŞ´÷wïîmZ¿sGï'â[u#_w¾ÊÅïÉ¾ßÚFGö…”!ç_òiùsÛfk-uÉ} «–§[z¯/~ççÏ}ëŸïwü½¼n=n«éªÛ.ıY«qÅñ÷¬ß¿ü-ÇD¯¯ÿ~3ïí·ûÿcôıû–{í÷î¿¿oŒ}«şÿs¿u
³ª*8şÜ¥ô>ÏïÍuÿÑ^—æy_ÿîc™ï/gí}ù½Ÿ÷¹¤üú2ûì×Ó¯éçŞëËæ-_~ë¿û¾½½|jëûş8×}oîoË¾½·îß½:4¼µùW×÷ŞıŸ¸ÖÁ¡÷Êü;»=Ãf¸?‰şwç¬ü#iìs¯Ûıî‹ÕU|¢ÿRÿï³|óçO|Ó6»çp¦Ì{»LFíKxËá/Ø¿’÷÷èûúï1À[ĞŞI~¡·­1·®À·ó/{»zn»d_ıšó¥Hÿa>qößkÇzüÿ³×4Z§÷¯ÿ÷]Cº—l÷¿¥~ı¯*Æ÷ŸY?wİïñÏrwè‡¿ïùZİıÿÉğŸô‡~ZÑĞJüùå‹»°ZÌöÖîûô÷üËäï¿òçí…3£ŞÕ~õ;øŒøïz½šÊıÕÜİ|¿İóÿgÿ§³ÆÎÖçûú¿Š¦e÷Ñóßµïö6Åù{×}<üÿ#<ï•øõCwÍşîäıßqûDyûîõñç_–õï´C‰çõïı¿Ä+×Ç.ïİ}:.w&oÿ¿Ï9¯¿É5}ıíš¾ßûıŞgÿ¹ÅÏRïéû~mËá|Õİ¯Îå¯_;ç=??üÕwòw?Ì4õ¨³)õûç/­ù?ˆßğÏÔ~ûÜŸŸïÿoß±×û ÷Ymİ5ÓUıû½ï×ôı/ûİì|½çÊı]Ñãª÷¹Şßø×‹ı|ÿ·ey±kîıûû½6®£h·}Ñ~¦öåk·?ÿËVÖmş¸4¬`iSŸ¿Ïûs®íwo7õÜÅ½¿ïıÿ—ë_İ‚ŞoÌ—Œ/ÿz·¯§“Ú÷öÿ‰¯Ÿïšñû±å§ıUú­Úi¯öÉûÿÉî/ÜŞÔşËa¶Şı5-¾­÷¨ïi‹=v;™÷<ı¢ıù÷”p›çš4šÿo±Õ›ŸŸugıoGõ=2zc}7ïõ8İËF?zfûíÿwèìåÜÌçFé¼m÷ÿìÖÿŠïúû±ØUqw¿I·;òü¿›ÏtoÛ¨ÿ›½Ï÷³]»êW[g}õ=¹ï÷âÿqëş_¹ëıÎ²êÂÆÂŞ6»5f~WşİßÃlôó½ßî’úıÖ©¢9~?úÖü¹Ì§ÚûíWî-_å’ÏÜğ½ûu›×úëmÿ½®zß¸j-k|]fßô{Zÿ¹KÇóè¶ïh/{Ëîš³iÏş_ Ëşo.(Q6Ä{â»Îıæû¥Ú¶¥”|İYRÌ§İµ¶Gæ6¾Âß÷{~Ú[—]w?éÏ†/ß­ıùÛşÛ×ïú}w¯÷çã<?›³¥<'·fÄşÿw/¼Ïº”_o£ô“×ûõEŒ»’Üév~é7ì¸Oû½í-¿Èí¾qŞ”óú:çŒúü¹nŞ{\ÿûLı—êš‘ıú?çÛ¼psƒUÿwœÛÏ‚ªÑÃû}qvÏ^+øí±ÈÚO_ò?ó?İşO^üùïŸ.ôæl}­Ïïöí¿¾ïû~Ì!óß~ñ«ïä¯cô×{ûíêÕú¦¿ßv–ê¹ÿGçºõßÿ¾õj©^÷ù'’ì°o‡án|ÎÕ©ùkjû‹JÿŞ»oğw«ıŸ‡}¹¼nzšûû(selectedElm, selector);
          }

          ctrl.disabled(state);

          editor.selection.selectorChanged(selector, function (state) {
            ctrl.disabled(!state);
          });
        }

        if (editor.initialized) {
          bindStateListener();
        } else {
          editor.on('init', bindStateListener);
        }
      }

      function postRender() {
        /*jshint validthis:true*/
        handleDisabledState(this, 'table');
      }

      function postRenderCell() {
        /*jshint validthis:true*/
        handleDisabledState(this, 'td,th');
      }

      function postRenderMergeCell() {
        /*jshint validthis:true*/
        handleDisabledState(this, 'td,th', true);
      }

      function generateTableGrid() {
        var html = '';

        html = '<table role="grid" class="mce-grid mce-grid-border" aria-readonly="true">';

        for (var y = 0; y < 10; y++) {
          html += '<tr>';

          for (var x = 0; x < 10; x++) {
            html += '<td role="gridcell" tabindex="-1"><a id="mcegrid' + (y * 10 + x) + '" href="#" ' +
              'data-mce-x="' + x + '" data-mce-y="' + y + '"></a></td>';
          }

          html += '</tr>';
        }

        html += '</table>';

        html += '<div class="mce-text-center" role="presentation">1 x 1</div>';

        return html;
      }

      function selectGrid(tx, ty, control) {
        var table = control.getEl().getElementsByTagName('table')[0];
        var x, y, focusCell, cell, active;
        var rtl = control.isRtl() || control.parent().rel == 'tl-tr';

        table.nextSibling.innerHTML = (tx + 1) + ' x ' + (ty + 1);

        if (rtl) {
          tx = 9 - tx;
        }

        for (y = 0; y < 10; y++) {
          for (x = 0; x < 10; x++) {
            cell = table.rows[y].childNodes[x].firstChild;
            active = (rtl ? x >= tx : x <= tx) && y <= ty;

            editor.dom.toggleClass(cell, 'mce-active', active);

            if (active) {
              focusCell = cell;
            }
          }
        }

        return focusCell.parentNode;
      }

      if (editor.settings.table_grid === false) {
        editor.addMenuItem('inserttable', {
          text: 'Table',
          icon: 'table',
          context: 'table',
          onclick: dialogs.table
        });
      } else {
        editor.addMenuItem('inserttable', {
          text: 'Table',
          icon: 'table',
          context: 'table',
          ariaHideMenu: true,
          onclick: function (e) {
            if (e.aria) {
              this.parent().hideAll();
              e.stopImmediatePropagation();
              dialogs.table();
            }
          },
          onshow: function () {
            selectGrid(0, 0, this.menu.items()[0]);
          },
          onhide: function () {
            var elements = this.menu.items()[0].getEl().getElementsByTagName('a');
            editor.dom.removeClass(elements, 'mce-active');
            editor.dom.addClass(elements[0], 'mce-active');
          },
          menu: [
            {
              type: 'container',
              html: generateTableGrid(),

              onPostRender: function () {
                this.lastX = this.lastY = 0;
              },

              onmousemove: function (e) {
                var target = e.target, x, y;

                if (target.tagName.toUpperCase() == 'A') {
                  x = parseInt(target.getAttribute('data-mce-x'), 10);
                  y = parseInt(target.getAttribute('data-mce-y'), 10);

                  if (this.isRtl() || this.parent().rel == 'tl-tr') {
                    x = 9 - x;
                  }

                  if (x !== this.lastX || y !== this.lastY) {
                    selectGrid(x, y, e.control);

                    this.lastX = x;
                    this.lastY = y;
                  }
                }
              },

              onclick: function (e) {
                var self = this;

                if (e.target.tagName.toUpperCase() == 'A') {
                  e.preventDefault();
                  e.stopPropagatiÙ{•A¾moùq-®ığ-ZvºtOtøŞ÷†·Ô¥S[O¾×YöşZw¾/}óHÿµ¾üó×ëcÛsæ/ÁÿqêŠ7ŸŒŞ?ı6ËO^¥‹ó¯Ÿ»Ëô­~õ²î´‡âöLí½:¼}Ü£˜ú8êéø»R'÷Ü‹[Â^vĞº/ˆ×¤Õ8y¿µvş~¿wù¹i7?JãôßùÃşkèöÏÿû¯Âİïã~kŞ¯ÿïÎOoK¹û?o*{Ûü·İéÿüı÷ÿõ¿šûİg?»;¯ÓšØïûÿ[«ßº½+ìó¬¯yÿŸìgÿı_{ğõù¶ÿ]¾÷ÿoŞÏµ÷ısş/mßF§ö£\î~=Ã:©÷k™è{>˜îO}İîzûı§-µŸ)ïëä¢ÿ³zÙşOíßİ\«ù1ıy§MÖ^»7-ú¼Ë|·¿ßè?·¸æf¯='¯,ïÚÿî-?÷ö­¿Şşûß÷²÷ÔÇÇãÉçû~}uÄo]~¾ºû¿>Ş¾ÿ~õjÖÿOïíûåù\“NáêŸ%‰öş~ÿ½Z@î>¿ƒZÿ]Y~[¡Õ¹İ9µpæïı]ÂÕp&VMÏyQ¤²-ÔíwÏ~¿´¬ØãÊk3{—ùÒéëÒz×mÙöt^ğâ}ßnµ»¦åWiŸÔƒî‡ßƒûR¶yªdí·x&ü(ş§ı°çÿÿúµİ“f+)ïÙ_ªéôOÚñË÷]²_|ÿOçïì¯¼;=¼ëw›§ıü|ŸûÎX‹<ø¯óü_oŒ;×¤¼j¼øìzŞ½ÿ¼°õ'”×ìö›ÏÜEx3u¢·‹÷~çîıÂİÕ¥Şÿ¬çx¿®¼o¾l}o!ƒ¿•;Uî5¥¤ùåÿÊN¿—˜ş\?=úéúßÒ«­~·+ä>ÂÇUº ÷dmúM«úŸÌ>ú7¸ßz-ÑxY×¿qÜNu¶H÷šDÿ3}ëúï6×ğoöyÛ÷*jã)¦»ÎrÜ_—öMEè^ö¾yÇö¿«ıjùİu€Äe-'îÙ7~Ww,´sóÖ@»ß~úo}Ü=ø-÷/üã··P¬D¾úŞçßö/Ò¾ÛõÏÒ§Œ¯–1_Ş.şıõçÿnŞµfW×ëò¿»?ø[­òÛÌåíçù/LqÒÛnı£FÃ³Ú5÷ÑŒÏÚ£oEò÷°ë_ÿ^õÓárÿùÇ6÷Fç.¿šq5Í×¿=Ş>á•Ò¦ÿƒß}ÿK§ßÖ}ø~êì>ïô«Ï§é]ç¯G«,]gÎëó÷ÙÇï?ìşØş·½ß·¹µ³`]dlûKıó~áÙ¿ùÿ¶oş½‹oON®ş§}Iæ¿[‡{ô)¯ÿ­¯‡»MŞz¿£İúï²¹¿}ëQ¯û/ëÚ>{ú÷Ùzúªşiÿ÷¾ıÚŸt¹½—Gm³³İÙıóß}•lŸ?r¾i“ˆŞ³½]zÛï©{óš²ı|œÛ]ãsÿ¿êr<çu¦7¿ºmé÷–›ı¤{ò¼ïvt6—±Ïö›'ót¦ßr¸¼bûa°côø?ø]dBú[­Îï-7K—œ/óùÏSÍúß½Óª,ì¾ô¿«æ½×ÍÌïµ¶›Ïí­TãÕõs|¿+’•€ûğû«uÚİùİ¹µËı»öVçõï>Û³şŸW{Ïÿ~o­ÿûÁÿÿß‹ıåş”|‹ÓÒÅü¼ë^‡ëCçû;éúÖşMËïã°s¿¬÷V¾şÏÏj0vYóúò¾ù»xR;ıäÙ ¹âåÇş¬;ï»ÿŞ;¿ınÒşÇ}¼ö´ë¦š3îûyÛfVùç÷«Â¿g_ŞÔ¯ÿÏ>ÿ{Æışí+ñınÎ¼ïõ>ş¬õnôÏş»Ş3Ëªjı'~úÔú)?Şß`Om/¿Õt·q©ô7ÿ¿ùó÷—²?üÍøºıÏwÿ÷?ûŞşï¯ïÿ×»úë;_LÛËÿ5Ï”ÛW$Ï•ãìß»NeÔŞö×ìnßlÛüéÏgrk¸_ß7?şº{ÍŸ8=›ÿØwÉÿ;û1>¿­”¥İqPWıÓ¨oï°³æuhıóĞwïG®¬	>ŞÚÊ~ßlíp;³¦J¿¯?òµOı™Ñ/şõwWÃ×ï™>¿Ÿ>«n}/ñ¿ÿçÑ~óıÙªÙ'İmíñ»®«;Fß?¹êıû|§ÿÜ4Ç-ûÿwít¾Zyºùìÿ÷»š»¸é?Ïşó«¶ÅcİoŞsù÷ú½OşØ±Ÿv}ößïƒøÿÿûm_ÿ[¿ßwú¹}¿ûUiı÷ßÃûtéÿ;–y“ßãö†¼ú1{ŸÛö'ÈñïôµÿëúÖ®Ä*ÎE»Öğ}ïÏÙŸ£)c%?Ë{ÕÛü²C+Îõ¹şû?Ã™'^ÏŞUw~§Õ¦|L¤¶æ¢uv>ÿw;ºZ•çW·»k™Œî¼ÁÏÅT­ü{åÅÙìfâ¯ûŞÇøŠn—cŸè‹1§Úíïè,3ÒŠú-dÖ^u¿ùªÉš¾Kád_ıÎù·Qö‹lïÔÿ£/øu¾®—?£í7÷mgıíy3ıïm¿Õ|µã¬ÁßE5Vw¶¥zó—WÉßúû~/kOOe°×›Æ¶å¦ß]M.uíyMwníÒTó/tGÖ."M]Mş¼÷›®>àsÿ_Èoÿ~ù_?§§}'şİdÛ¹Î~÷ú÷xìûö;^{ŸÿÏ}v½?•¥î÷óDn˜õ§mû=”Ôõ•M½÷*¯ï}ø¸5»±sÌMÂjônZïlöªí»ç¼¡®÷q«±6¼ï<eyåû³ïîµ¿ïâwZ®ıø¿»İ²ß¸«»Ò¿ŸıSzïíû_ÎçúOA+Qo›÷‡¾?ü(º§=¸§#K¿øìUÃŠUËşè}ø¯ïv‰Ë²ñÿŒû¯E†u?w5÷h÷Íÿa_j+è’âØõî?ãÎÜ¶ï¨¢{ş˜ûüî_3š.õ¼Gİ¶‡İWô«ØŸ{Ç.¦ï?—÷0#·ÿü‹ùônÆv÷-ó·çµ{+Ö¨ş=ÿ'Úcÿèßøõ‘Lÿõ³Ç·Ÿ»‘~Ş_·Ÿ?³ßê»ûíÿŠ¥”ÿÓùãşmmóşÿSûÿkıüÎñ-÷mî›o÷ğŞş¥mü»ì[Ë§­~|gÃ-_¦Ÿ^î´¯¾ş×åÍ£åó¯çóõ?}vgãöıëŒ7úı·¿-âq_ßwıÿ¾ï¿S=ÿí]V=ß“úgLúû÷ı_ÿşUùİws|{¯¾·¦ùı½|ï´&?Çÿw½O!ÿÉß·Â×ßë´Î÷mî?í¾ßÏåïºû	7å¨ïş–õÏİ½Uÿ6wÿ™[ûö}ç@ÃÛïşª÷ÿ]õ5véåû±äA[8İm—¸ı^8Ìİú>æäkªí5ÿ/É¶Ï³w®şKù%úÜñ5·°ÿİµÿşïşûŞş5NçC:{¬'ûÙñŸŸ½ö½ãOÑ¯ÜŞø3Láğİ1Üš¤á={&ì>Vg¿h(»ĞŒùu½Ÿn×Ôíı{ˆßZf¾¾ùÙxrêçÙOÜ·ÿİ½ıü­~İÿ_>·ëO/úööËNÿy__½]oÿ¹ëÍöü¦Ûúõ¼/¥÷3VßÂãÔ¯ÜkİÄÍ;¹Ç~ûûŸÈ·]ìm4ßOU¿_àßûÇóš!ùÏıİø¿Ïïşu¯ï<¨¹ÿæ¿¼ñi|ßû]Çµô·|¶˜{ırÛw½²\7Kß{Û|/Øÿßş?Tû;ûİşà¶ÿ¿…Åjö›qÜÿúRóYİyinfï`ùš–ÿîxûYù.¢}Ìóu¾4sşXmÿÇuëİù‹>b¿ÿ¿İ]\è¶\ ç8!óîï®2¶ı×šı¿ªlO°Îß–
ş¾G!ÓÃügßÀ˜¥ß‡l~[“wº¶­†_›[ûâ-ÏMâş=^½ç¨ü´Ïöşßİ»£zÿŒ5ûƒÛ¯oÏº.‘÷£•¦¾¹Ë÷÷Û(ÿïRïDgÉËuIÓ~+r©òu§u³o®}œæ³”»—i5üÒ;ÿ!­Ësı¡ÿÏ}ßæ}~ß~ïoúj­ìô£Ñ»Íñş'³wçü^—ş×O^7Ï§«/ÌúŸòß{ÿ¨ÓÏo¿×§÷Ş¿no®SwZögõíOõåŸÛsş´Çüü¿>ü½ÿ½–'•yÿ_tÍê¿ıíÿşùÏ7;¡»½ëãñ^ÿ×=¼o_¾9“gıúû—fÿ×xßXu~~Ö;*Ş÷~ñd»å×Cóãf²(ßÛ×î»»šÅİ¿àÇwˆù'~pŸnÏ¾7^îÿªm?§_›<•Ö>¾ß;=ğ×]ÿW»7CPoÖã»ı„—?oîÿOïˆrë¶îóó»Ôï*·í—¿»ŞçÏİíÇ=ÿ†Ñí]÷ï›üş‡ÓİYïíZÿü_ûçï¾³]Òıûş/¾¹ßÎöµÇ¥ûoèûËûÿût¹=~ŸĞÿÌ¯¯v”ì¥^şßó¥ı¿ÿËõnr¼Öm^Üû5ä§WôJçª¿„.ıæòŞÈWŞşêè>÷Î¿?ÿşk¿ww=ÑûÇëúgû{ÍUi"sÂj>÷›å7m1¼îı¶_ÜìaÏü¯!ŸéÿWo>G—ÿíãÿ¹ÛVTYÁo‚ß¿ÿ÷VcnCÏe—ŸşäóıNÿz·]ı¾}ÿ½3Ûßø·ÿ÷U·w{·=åw@¿‹¿?ó×Mÿ$égÿÿëÓû_·yiÁñ¿ûÿ·×®8ÿŞ÷×ùf·*e¦Óûh,ú?ú_gqÛú~µşĞ¿¿ô·mS¿‡Rc%UÖ"ç,s°Õè–37eı0ÃÿNÿŒß±ÑóŸìô¼ó£ÿC÷r,åŞx÷ÿÿÎn}·÷v4\N«ß½vWşv÷ß^Ú^æëÆ“N_ö]fTõ¹ÿüm÷r÷àŸNÛ·ì|FçÚ²î­ûäÑßşs>ÿ==Nıükåø){¯?ı7r3ß«?k)Ë×ù“÷Îîü¿ÃïÅü¾]ùÿ¯¾sÿ{múN«ÿÿ¿ù«7”`Oµßû÷¶ÿfÿÏà—kvé «öûïŸ¿™×u{ã¹Ùükè®ïjqóÈ”¯ù¦Eûó¢W‡ªû‹ögu¿qw{·®ãßmõšô•ú*ªúºNóiö.æ´[å~ŸıO
pÿä;–ÿG÷±?r}¿~Ñ|ò—èu?­Ë=áÓ¾üjZ­V½u»ù¿ÏŸ÷şÈä­\|§ÿ÷bjİÿ{uóŸ>¼ô³Ñğ¶÷¿¯6ç’)|ê©ïâÔİ©÷Ÿú'Ï¶_ÙjÂ©_SûñÕVœ&üï±EúùºvÔ\:Ì÷üìİƒ?¦˜ŞÇïîgÍ<‰?Ûú÷í»WNîñkãïïN.Ş9—şiƒFuoıò¯şg÷wfÏË_ò÷òÜ_œ»ˆ—H<â7[GöÓäï*¿ğÿŞºÿ|îb¶¾ä\Ò\ğêüc{ß0Íÿk½ó_¾çÿÔ®»÷[¿ëRq÷ıÑ±·_ÖVµİ¿üîÛºÖ¿y¿ÖGÏ—½é÷öØ!üë}wıãÇûÖşä>«²ïßş×ë¹ùëÏvŸ_.o¯@*;zSiYïßşî´ë]¬÷<	şon (grid) {
          var cell;

          cell = editor.dom.getParent(editor.selection.getStart(), 'th,td');

          if (!editor.dom.select('td[data-mce-selected],th[data-mce-selected]').length) {
            dialogs.merge(grid, cell);
          } else {
            grid.merge();
          }
        },

        mceTableInsertRowBefore: function (grid) {
          grid.insertRows(true);
        },

        mceTableInsertRowAfter: function (grid) {
          grid.insertRows();
        },

        mceTableInsertColBefore: function (grid) {
          grid.insertCols(true);
        },

        mceTableInsertColAfter: function (grid) {
          grid.insertCols();
        },

        mceTableDeleteCol: function (grid) {
          grid.deleteCols();
        },

        mceTableDeleteRow: function (grid) {
          grid.deleteRows();
        },

        mceTableCutRow: function (grid) {
          clipboardRows = grid.cutRows();
        },

        mceTableCopyRow: function (grid) {
          clipboardRows = grid.copyRows();
        },

        mceTablePasteRowBefore: function (grid) {
          grid.pasteRows(clipboardRows, true);
        },

        mceTablePasteRowAfter: function (grid) {
          grid.pasteRows(clipboardRows);
        },

        mceSplitColsBefore: function (grid) {
          grid.splitCols(true);
        },

        mceSplitColsAfter: function (grid) {
          grid.splitCols(false);
        },

        mceTableDelete: function (grid) {
          if (resizeBars) {
            resizeBars.clearBars();
          }
          grid.deleteTable();
        }
      }, function (func, name) {
        editor.addCommand(name, function () {
          var grid = new TableGrid(editor);

          if (grid) {
            func(grid);
            editor.execCommand('mceRepaint');
            self.cellSelection.clear();
          }
        });
      });

      // Register dialog commands
      each({
        mceInsertTable: dialogs.table,
        mceTableProps: function () {
          dialogs.table(true);
        },
        mceTableRowProps: dialogs.row,
        mceTableCellProps: dialogs.cell
      }, function (func, name) {
        editor.addCommand(name, function (ui, val) {
          func(val);
        });
      });

      function addButtons() {
        editor.addButton('tableprops', {
          title: 'Table properties',
          onclick: dialogs.tableProps,
          icon: 'table'
        });

        editor.addButton('tabledelete', {
          title: 'Delete table',
          onclick: cmd('mceTableDelete')
        });

        editor.addButton('tablecellprops', {
          title: 'Cell properties',
          onclick: cmd('mceTableCellProps')
        });

        editor.addButton('tablemergecells', {
          title: 'Merge cells',
          onclick: cmd('mceTableMergeCells')
        });

        editor.addButton('tablesplitcells', {
          title: 'Split cell',
          onclick: cmd('mceTableSplitCells')
        });

        editor.addButton('tableinsertrowbefore', {
          title: 'Insert row before',
          onclick: cmd('mceTableInsertRowBefore')
        });

        editor.addButton('tableinsertrowafter', {
          title: 'Insert row after',
          onclick: cmd('mceTableInsertRowAfter')
        });

        editor.addButton('tabledeleterow', {
          title: 'Delete row',
          onclick: cmd('mceTableDeleteRow')
        });

        editor.addButton('tablerowprops', {
          title: 'Row properties',
          onclick: cmd('mceTableRowProps')
        });

        editor.addButton('tablecutrow', {
          title: 'Cut row',
          onclick: cmd('mceTableCutRow')
        });

        editor.addButton('tablecopyrow', {
          title: 'Copy row',
          onclick: cmd('mceTableCopyRow')
        });

        editor.addButton('tablepasterowbefore', {
          title: 'Paste row before',
          onclick: cmd('mceTablePasteRowBefore')
        });

        editor.addButton('tablepasterowafter', {
          title: 'Paste row after',
          onclick: cmd('mceTablePasteRowAfter')
        });

        editor.addButton('tableinsertcolbefore', {
          title: 'Insert column before',
          onclick: cmd('mceTableInsertColBefore')
        });

        editor.addButton('tableinsertcolafter', {
          title: 'Insert column after',
          onclick: cmd('mceTableInsertColAfter')
        });

        editor.addButton('tabledeletecol', {
          title: 'Delete column',
          onclick: cmd('mceTableDeleteCol')
        });

      }

      function isTable(table) {

        var selectorMatched = editor.dom.is(table, 'table') && editor.getBody().contains(table);

        return selectorMatched;
      }

      function addToolbars() {
        var toolbarItems = editor.settings.table_toolbar;

        if (toolbarItems === '' || toolbarItems === false) {
          return;
        }

        if (!toolbarItems) {
          toolbarItems = 'tableprops tabledelete | ' +
            'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
            'tableinsertcolbefore tableinsertcolafter tabledeletecol';
        }

        editor.addContextToolbar(
          isTable,
          toolbarItems
        );
      }

      function getClipboardRows() {
        return clipboardRows;
      }

      function setClipboardRows(rows) {
        clipboardRows = rows;
      }

      addButtons();
      addToolbars();

      // Enable tab key cell navigation
      if (editor.settings.table_tab_navigation !== false) {
        editor.on('keydown', function (e) {
          var cellElm, grid, delta;
          var selectionStart = editor.selection.getStart();

          if (e.keyCode === VK.TAB) {
            if (editor.dom.getParent(selectionStart, 'LI,DT,DD')) {
              return;
            }

            cellElm = editor.dom.getParent(selectionStart, 'th,td');

            if (cellElm) {
              e.preventDefault();

              grid = new TableGrid(editor);
              delta = e.shiftKey ? -1 : 1;

              editor.undoManager.transact(function () {
                if (!grid.moveRelIdx(cellElm, delta) && delta > 0) {
                  grid.insertRow();
                  grid.refresh();
                  grid.moveRelIdx(cellElm, delta);
                }
              });
            }
          }
        });
      }

      self.insertTable = insertTable;
      self.setClipboardRows = setClipboardRows;
      self.getClipboardRows = getClipboardRows;
    }

    PluginManager.add('table', Plugin);

    return function () { };
  }
);

dem('tinymce.plugins.table.Plugin')();
})();
