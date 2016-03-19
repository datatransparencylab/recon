var DataTable = function (container, query) {
  this.myQuery = query ? query: window.query;
  this.container= container;
};

DataTable.detailFormatter = function(index, row) {
  var html = [];
  $.each(row, function (key, value) {
            html.push('<p><b>' + key + ':</b> ' + value + '</p>');
         });
  return html.join('');
}

DataTable.trackerFormatter = function(value, row) {
  return (value ? "tracker" : "non-tracker");
}

DataTable.arrayFormatter = function(value, row) {
  // TODO: Add ellipsis to reduce real state used
  var fill = "";
  for (var i=0; i < value.length; i++)
    fill += '<div> * ' + value[i] + '</div>';
  fill += "";
  return fill;
}

DataTable.prototype.createBasicTableHeader = function() {
  $('#' + this.container).append('<table width=90% />' );
  $('#' + this.container + ' table').attr("data-toggle", "table");
  $('#' + this.container + ' table').attr("data-show-columns", true);
  $('#' + this.container + ' table').attr("data-id-field", "ID");
  $('#' + this.container + ' table').attr("data-detail-view", true);
  $('#' + this.container + ' table').attr("data-detail-formatter", "DataTable.detailFormatter");
}

DataTable.exportTableToCSV = function($table, filename) {
  var $rows = $table.find('tr:has(td)'),

  // Temporary delimiter characters unlikely to be typed by keyboard
  // This is to avoid accidentally splitting the actual contents
  tmpColDelim = String.fromCharCode(11), // vertical tab character
  tmpRowDelim = String.fromCharCode(0), // null character

  // actual delimiter characters for CSV format
  colDelim = '","',
  rowDelim = '"\r\n"',

  // Grab text from table into CSV formatted string
  csv = '"' + $rows.map(function (i, row) {
    var $row = $(row),
    $cols = $row.find('td');

    return $cols.map(function (j, col) {
      var $col = $(col),
      text = $col.text();

      return text.replace(/"/g, '""'); // escape double quotes
    }).get().join(tmpColDelim);
  }).get().join(tmpRowDelim)
  .split(tmpRowDelim).join(rowDelim)
  .split(tmpColDelim).join(colDelim) + '"',

  // Data URI
  csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

