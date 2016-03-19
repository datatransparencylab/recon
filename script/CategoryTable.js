function CategoryTable(container, query){
  DataTable.call(this, container, query);
  this.limitCats = 20;
}

CategoryTable.prototype = Object.create(DataTable.prototype);
CategoryTable.constructor = CategoryTable;

CategoryTable.numberFormatter = function(value, row) {
  var color = value==0 ? "grey" : value > this.limitCats ? '#f70101':'normal';
  var fontWeight = value > this.limitCats ? 'bold' : 'normal';
  return ('<div  style="color: ' + color + '; font-weight: ' + fontWeight + 
          '">' + value + '</div>');
}

CategoryTable.prototype.createTable = function (){
  this.createBasicTableHeader();

  $('#' + this.container + ' table').attr("data-sort-name", "categoryGroup");
  $('#' + this.container + ' table').attr("data-sort-order", "asc");

  var columns = this.getColumns();

  // Add first header
  $('#' + this.container + ' table').append('<thead/>');
  $('#' + this.container + ' table thead').append('<tr id="first-header"/>');

  // Add firts header content
  // Firt three columns for category info
  $('#' + this.container + ' table thead tr').append('<th data-align="center"' +
                                      ' colspan=3> Category Information </th>');

  if (!this.myQuery.noData) { // this is just to allow showing only static data
    // We always show 4 columns with the apps (1 all + 3 iOS/And/Wp)
    $('#' + this.container + ' table thead tr').append('<th ' + 
      'data-align="center" colspan=4> Number of Apps sending that info</th>');
    if (this.myQuery.details) { // 4 more with the apps if we show details
      $('#' + this.container + ' table thead tr').append('<th ' +
        'data-align="center" colspan=4> List of Apps sending that info</th>');
    }
    if (this.myQuery.trackers) { // domain information, 4 per domain type + 4 URLs
      $('#' + this.container + ' table thead tr').append('<th ' + 
        'data-align="center" colspan=4> Number of unique trackers receiving ' +
        'that info</th>');
      if (this.myQuery.details) {
        $('#' + this.container + ' table thead tr').append('<th ' + 
                   'data-align="center" colspan=4> List of Tracker URLs </th>');
      }
    }
    if (this.myQuery.domains) { // domain information, 4 per domain type + 4 URLs
      $('#' + this.container + ' table thead tr').append('<th ' + 
        'data-align="center" colspan=4> Number of unique non-trackers ' +
        'receiving that Information</th>');
      if (this.myQuery.details) {
        $('#' + this.container + ' table thead tr').append('<th ' + 
          'data-align="center" colspan=4> List of Non-Tracker URLs</th>');
      }
    }
  }

  $('#' + this.container + ' table thead').append('<tr id="second-header"/>');

  // Secondary header with the title for every column
  for(i=0;i<columns.length;i++){
    $('#second-header').append('<th data-field="' + columns[i].key  + 
                               '" data-halign="' + columns[i].halign +
                               '" data-align="' + columns[i].align + 
                               '" data-sortable="' + columns[i].sortable +
                               '" data-visible="' + columns[i].visible +
                               '" data-switchable="' + columns[i].switchable +
                               '" data-formatter="' + columns[i].formatter +
                               '">' + columns[i].label + '</th>' );
  }

  $('#' + this.container + ' table')
  .bootstrapTable({data: this.getData()});
}

CategoryTable.prototype.getColumns = function (){
  var columns = [];

  if (this.myQuery.summary) {
    columns.push(
     { label: "Category Group ID", key: "categoryGroup", width: 100, 
       halign: "center", align: "center", sortable: true, visible: true, 
       switchable: false, formatter: "%s"},
     { label: "Category IDs", key: "ID", width: 100, halign: "center", 
       align: "center", sortable: true, visible: true, switchable: false,
       formatter: "DataTable.arrayFormatter"},
     { label: "Category Group Description", key: "description", halign:
       "center", align: "center", width: 200, sortable: false, visible: true,
       switchable: true, formatter: "%s"});
  }
  else {
    columns.push(
     { label: "Category Group ID ", key: "categoryGroup", width: 100, 
       halign: "center", align: "center", sortable: true, visible: true, 
       switchable: false, formatter: "%s"},
     { label: "Category ID", key: "ID", width: 100, halign: "center", 
       align: "center", sortable: true, visible: true, switchable: false, 
       formatter: "%s"},
     { label: "Category Description", key: "description", halign: "center",
       align: "center", width: 200, sortable: false, visible: true, 
       switchable: true, formatter: "%s"});
  }

  // Just for showing the list of categories
  if (this.myQuery.noData)
    return columns;

  for (var i=0; i<data.oss.length; i++) {
    columns.push({ key: "nApps" + data.oss[i], label: data.oss[i], halign: "center",
                   align: "center", width: 100, sortable: true, visible: true,
                   switchable: false, 
                   formatter: "CategoryTable.numberFormatter"});
  }

  if (this.myQuery.details) {
    for (var i=0; i<data.oss.length; i++) {
      columns.push({ key: "listApps" + data.oss[i], label: data.oss[i], halign: "center",
                     align: "center", width: 200, sortable: false, 
                     visible: true, switchable: true, 
                     formatter: "DataTable.arrayFormatter"});
    }
  }
  if (this.myQuery.trackers) {
    for (var i=0; i<data.oss.length; i++) {
      columns.push({ key: "nTrackers"+data.oss[i], label: data.oss[i], halign: "center",
                     align: "center", width: 100, sortable: true, visible: true,
                     switchable: true, 
                     formatter: "CategoryTable.numberFormatter"});
    }

    if (this.myQuery.details) {
      for (var i=0; i<data.oss.length; i++) {
        columns.push({ key: "listTrackers"+data.oss[i], label: data.oss[i], 
                       halign: "center", align: "center", width: 200, 
                       sortable: false, visible: true, switchable: true,
                       formatter: "DataTable.arrayFormatter"});
      }
    }
  }
  if (this.myQuery.domains) {
    for (var i=0; i<data.oss.length; i++) {
      columns.push({ key: "nNonTrackers" + data.oss[i], label: data.oss[i],
                     halign: "center", align: "center", width: 100, 
                     sortable: true, visible: true, switchable: true, 
                     formatter: "CategoryTable.numberFormatter"});
    }
    if (this.myQuery.details) {
      for (var i=0; i<data.oss.length; i++) {
        columns.push({ key: "listNonTrackers" + data.oss[i], label: data.oss[i], 
                       halign: "center", align: "center", width: 200, 
                       sortable: false, visible: true, switchable: true, 
                       formatter: "DataTable.arrayFormatter"});
      }
    }
  }
  return columns;
}

CategoryTable.prototype.getData = function (){
  var categoryGroups = [];
  var categories = [];
  var _this = this;

  for (category in data.categories) {
    var catDetails = data.categories[category];
    var catGroup = catDetails.categoryGroup;

    if (((_this.myQuery.trackers) && (catDetails.arrayTrackers[_this.myQuery.platform].length > 0)) ||
        ((_this.myQuery.domains) && (catDetails.arrayNonTrackers[_this.myQuery.platform].length > 0))) {

      if (!_this.myQuery.summary) {
        var catItem = {
          "categoryGroup": catDetails.categoryGroup,
          "description": catDetails.description,
          "ID": catDetails.ID};

        for (var i=0; i<data.oss.length; i++) {
          catItem["nApps"+data.oss[i]] = catDetails.arrayApps[data.oss[i]].length;
          catItem["nTrackers"+data.oss[i]] = catDetails.arrayTrackers[data.oss[i]].length;
          catItem["nNonTrackers"+data.oss[i]] = catDetails.arrayNonTrackers[data.oss[i]].length;
          catItem["listApps"+data.oss[i]] = catDetails.arrayApps[data.oss[i]];
          catItem["listTrackers"+data.oss[i]] = catDetails.arrayTrackers[data.oss[i]];
          catItem["listNonTrackers"+data.oss[i]] = catDetails.arrayNonTrackers[data.oss[i]];
        }
     
        categories.push(catItem);

      } else {
        if (categoryGroups[catGroup] == null) {
          categoryGroups[catGroup] = 
            {"categoryGroup": catGroup,
             "ID": [],
             "description": "",
             "arrayApps": [],
             "arrayTrackers": [],
             "arrayNonTrackers": catDetails.arrayNonTrackers
          }
          for (var os=0; os < data.oss.length; os++){
            categoryGroups[catGroup].arrayApps[data.oss[os]] = [];
            categoryGroups[catGroup].arrayTrackers[data.oss[os]] = [];
            categoryGroups[catGroup].arrayNonTrackers[data.oss[os]] = [];
          }
        }

        // For every OS we add the arrayApps, arrayTrackers, arrayNonTrackers
        for (var i=0; i<data.oss.length; i++) {
          for(app in catDetails.arrayApps[data.oss[i]]) {
            if (categoryGroups[catGroup].arrayApps[data.oss[i]].indexOf(catDetails.arrayApps[data.oss[i]][app]) == -1) {
              categoryGroups[catGroup].arrayApps[data.oss[i]].push(catDetails.arrayApps[data.oss[i]][app]);
            }
          }


          for(t in catDetails.arrayTrackers[data.oss[i]]) {
            if (categoryGroups[catGroup].arrayTrackers[data.oss[i]].indexOf(catDetails.arrayTrackers[data.oss[i]][t]) == -1) {
              categoryGroups[catGroup].arrayTrackers[data.oss[i]].push(catDetails.arrayTrackers[data.oss[i]][t]);
            }
          }
          for(nt in catDetails.arrayNonTrackers[data.oss[i]]) {
            if (categoryGroups[catGroup].arrayNonTrackers[data.oss[i]].indexOf(catDetails.arrayNonTrackers[data.oss[i]][nt]) == -1) {
              categoryGroups[catGroup].arrayNonTrackers[data.oss[i]].push(catDetails.arrayNonTrackers[data.oss[i]][nt]);
            }
          }
        }

        categoryGroups[catGroup].ID.push(catDetails.ID);
        categoryGroups[catGroup].description = data.CAT_GROUP_DESC[catGroup];
      }
    }
  }

  // Create the list to be returned
  if (this.myQuery.summary) {
    var group = [];
    for (var catgroup in categoryGroups) {
      gDetails = categoryGroups[catgroup];

      var groupItem = {
          "categoryGroup": gDetails.categoryGroup,
          "description": gDetails.description,
          "ID": gDetails.ID
      };

      for (var i=0; i<data.oss.length; i++) {
        groupItem["nApps"+data.oss[i]] = gDetails.arrayApps[data.oss[i]].length;
        groupItem["nTrackers"+data.oss[i]] = gDetails.arrayTrackers[data.oss[i]].length;
        groupItem["nNonTrackers"+data.oss[i]] = gDetails.arrayNonTrackers[data.oss[i]].length;
        groupItem["listApps"+data.oss[i]] = gDetails.arrayApps[data.oss[i]];
        groupItem["listTrackers"+data.oss[i]] = gDetails.arrayTrackers[data.oss[i]];
        groupItem["listNonTrackers"+data.oss[i]] = gDetails.arrayNonTrackers[data.oss[i]];
      }

      group.push(groupItem);
    }
    return group;
  }
  else {
    return categories;
  }
}

