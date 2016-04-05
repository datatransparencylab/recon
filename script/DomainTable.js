function DomainTable(container, query){
  DataTable.call(this, container, query);
  this.limitDomains = 5;
}

DomainTable.prototype = Object.create(DataTable.prototype);
DomainTable.constructor = DomainTable;

DomainTable.numberFormatter = function(value, row) {
  var color = value==0 ? "grey" : value > this.limitDomains ? '#f70101' : 'normal';
  var fontWeight = value > this.limitDomains ? 'bold' : 'normal';
  return ('<div  style="color: ' + color + '; font-weight: ' + fontWeight + 
          '">' + value + '</div>');
};

DomainTable.prototype.createTable = function(){
  this.createBasicTableHeader();

  $('#' + this.container + ' table')
    .attr("data-sort-name", "APPS_" + this.myQuery.platform);
  $('#' + this.container + ' table').attr("data-sort-order", "desc");

  var columns = this.getDomainsColumns(this.myQuery);

  // Add theader
  $('#' + this.container + ' table').append('<thead/>' );
  $('#' + this.container + ' table thead').append('<tr id="first-header"/>');
  if (this.myQuery.domains && this.myQuery.trackers) {
    $('#' + this.container + ' table thead tr')
      .append('<th data-align="center" colspan=2> Data-receiving Domain Info </th>');
  }
  else {
    $('#' + this.container + ' table thead tr')
      .append('<th data-align="center" colspan=1> Data-receiving Domain Info </th>');
  }

  $('#' + this.container + ' table thead tr')
    .append('<th data-align="center" colspan=' + 
            (1 + ((this.myQuery.platform == "All") ? 3:0)) + 
            '> Number Apps sending Info to the domain</th>');
  
  if (this.myQuery.details) {
    $('#' + this.container + ' table thead tr')
      .append('<th data-align="' + 'center" colspan=' + 
              (1 + ((this.myQuery.platform == "All") ? 3:0)) + 
              '> List of Apps sending Info to the domain</th>');
  }
 
  if (this.myQuery.summary) {
    $('#' + this.container + ' table thead tr')
      .append('<th data-align="center" colspan=' + 
              (data.CAT_GROUPS.length) + 
              '> Number of Apps by Type of Information Sent </th>');
    if (this.myQuery.details) {
      $('#' + this.container + ' table thead tr')
        .append('<th data-align="center" colspan=' + 
                (data.CAT_GROUPS.length) + 
                '> List of Apps by Type of Information Sent </th>');
    }
  } else {
    $('#' + this.container + ' table thead tr')
      .append('<th data-align="center" colspan=' + (data.CATS.length) +
      '> Number of Apps by Type of Information Sent </th>');
    if (this.myQuery.details) {
      $('#' + this.container + ' table thead tr')
        .append('<th data-align="center" colspan=' + (data.CATS.length) +
        '> List of Apps by Type of Information Sent </th>');
    }
  }
    
  $('#' + this.container + ' table thead').append('<tr id="second-header"/>');

  for(i=0;i<columns.length;i++){
    $("#second-header").append('<th data-field="' + columns[i].key  + 
                               '" data-halign="' + columns[i].halign +
                               '" data-align="' + columns[i].align + 
                               '" data-sortable="' + columns[i].sortable +
                               '" data-visible="' + columns[i].visible +
                               '" data-switchable="' + columns[i].switchable +
                               '" data-formatter="' + columns[i].formatter +
                               '">' + columns[i].label + '</th>' );
  }
  $('#' + this.container + ' table')
    .bootstrapTable({data: this.getDomainTableData()});
}

DomainTable.prototype.getDomainsColumns = function() {
  var columns = [
    { label: "URL", key: "URL", width: 100, halign: "center", align: "center",
      sortable: true, visible: true, switchable: false, formatter: "%s"}];

  if (this.myQuery.domains && this.myQuery.trackers){
    columns.push({ label: "Tracker", key: "TRACKER", halign: "center", 
                 align: "center", width: 200, sortable: true, visible: true, 
                 switchable: false,
                 formatter: "DataTable.trackerFormatter"
                });
  }

  columns.push({ label: this.myQuery.platform, 
                 key: "APPS_" + this.myQuery.platform, halign: "center",
                 align: "center", width: 200, sortable: true, visible: true,
                 switchable: false, formatter: "DomainTable.numberFormatter"});

  if (this.myQuery.platform == "All" ) {
    counterKeys = data.oss.slice(1,4);
    for (var i=0; i<counterKeys.length; i++) {
      columns.push({ label: counterKeys[i], key: "APPS_" + counterKeys[i],
                     halign: "center", align: "center", width: 200, 
                     sortable: true, visible: true, switchable: false,
                     formatter: "DomainTable.numberFormatter"});
    }
  }

  if (this.myQuery.details) {
    columns.push({ key: "LIST_APPS_" + this.myQuery.platform, 
                  label: this.myQuery.platform, halign: "center", 
                  align: "center", width: 200, sortable: false, 
                  visible: true, switchable: true,
                 formatter: "DataTable.arrayFormatter"});
    if (this.myQuery.platform == "All" ) {
      counterKeys = data.oss.slice(1,4);
      for (var i=0; i<counterKeys.length; i++) {
        columns.push({label: counterKeys[i], key: "LIST_APPS_" + counterKeys[i],
                      halign: "center", align: "center", width: 200, 
                      visible: true, switchable: false, 
                      formatter: "DataTable.arrayFormatter"});
      }
    }
  }

  if (this.myQuery.summary) {
    for (var categoryGroup in data.CAT_GROUPS) {
      columns.push({ label: data.CAT_GROUPS[categoryGroup],
                     key: "CATGROUP_" + data.CAT_GROUPS[categoryGroup] +
                          "_APPS_" + this.myQuery.platform, 
                     halign: "center", align: "center", width: 200, 
                     sortable: false, visible: true, switchable: true, 
                     formatter: "%s"});
    }
    if (this.myQuery.details) {
      for (var categoryGroup in data.CAT_GROUPS) {
        columns.push({ label: data.CAT_GROUPS[categoryGroup],
                       key: "CATGROUP_" + data.CAT_GROUPS[categoryGroup] +
                            "_LIST_APPS_" + this.myQuery.platform,
                       halign: "center", align: "center", width: 200,
                       sortable: false, visible: true, switchable: true,
                       formatter: "DataTable.arrayFormatter"});
      }
    }
  }

  if (!this.myQuery.summary) {
    for (var category in data.categories) {
      columns.push({ key: category + "_APPS_" + this.myQuery.platform,
                     label: category, halign: "center", align: "center",
                     width: 200, sortable: true, visible: true, switchable: true,
                     formatter: "DomainTable.numberFormatter"});
    }
    if (this.myQuery.details) {
      for (var category in data.categories) {
        columns.push({key: category + "_LIST_APPS_" + this.myQuery.platform,
                      label: category, halign: "center", align: "center",
                      width: 200, sortable: false, visible: true, 
                      switchable: true, formatter: "DataTable.arrayFormatter"});
      }
    }
  }
  return columns;
}

DomainTable.prototype.getDomainTableData = function() {
  var tableDomains = [];
  if (this.myQuery.trackers) {
    tableDomains = tableDomains.concat(this.processDomains(true, this.myQuery));
  }
  if (this.myQuery.domains) {
    tableDomains = tableDomains.concat(this.processDomains(false, this.myQuery));
  }
  return tableDomains;
}

DomainTable.prototype.processDomains = function(onlyTrackerList) {
  var tableDomains = [];

  if (onlyTrackerList)
    trackerList = data.trackers;
  else
    trackerList = data.nonTrackers;

  for (var domain in trackerList) {
    var dom = {"URL": domain};

    // Now let's initialize the result array for this category
    for (var cat in data.categories) {
      for (var i=0; i<data.oss.length; i++) {
        dom[data.categories[cat].ID + "_APPS_" + data.oss[i]] = 0;
        dom[data.categories[cat].ID + "_LIST_APPS_" + data.oss[i]] = "";
      }
    }

    for (var cg in data.CAT_GROUPS) {
      catName = data.CAT_GROUPS[cg];
      for (var i=0; i<data.oss.length; i++) {
        dom["CATGROUP_" + catName + "_APPS_" + data.oss[i]] = 0;
        dom["CATGROUP_" + catName + "_LIST_APPS_" + data.oss[i]] = [];
      }
    }

    categoriesCount = [0, 0, 0, 0];
    categoryGroupsList = [[], [], [], []];
    categoryGroupsCount = [0, 0, 0, 0];
    allAppsCount = [0, 0, 0, 0];
    allAppsList = [[], [], [], []];

    for(var category in data.domains[domain]) {
      var categoryItem = data.domains[domain][category];
      categoryGroup = data.CAT_VS_GROUP[category.toUpperCase().replace(/-/g,"")];
      appCount = [0, 0, 0, 0];
      appList = [[], [], [], []];

      for (var app in categoryItem) {
        var appItem = categoryItem[app]
        appCount[0]++;
        appList[0].push(appItem.appName);
        appCount[data.oss.indexOf(appItem.platform)]++;
        appList[data.oss.indexOf(appItem.platform)].push(appItem.appName);

        if (categoryGroupsList[0].indexOf(categoryGroup)  == -1) {
          categoryGroupsList[0].push(categoryGroup);
          categoryGroupsCount[0]++;
        }
      }

      // We have finished processing the category info for the domain
      for (var i=0; i<data.oss.length; i++) {
        // Let's aggregate the global counters
        for (appElement in appList[i]) {
          if (allAppsList[i].indexOf(appList[i][appElement]) == -1) {
            allAppsList[i].push(appList[i][appElement]);
          }
        }
        
        if (appCount[i] > 0)
          categoriesCount[i]++;

        // Now let's fill-in the array for this category
        dom[category + "_APPS_" + data.oss[i]] = appCount[i];
        dom[category + "_LIST_APPS_" + data.oss[i]] = appList[i];

        for (appElement in appList[i]) {
          if (dom["CATGROUP_" + categoryGroup + "_LIST_APPS_" + 
                  data.oss[i]].indexOf(appList[i][appElement]) == -1) {
            dom["CATGROUP_" + categoryGroup + "_LIST_APPS_" + 
              data.oss[i]].push(appList[i][appElement]);
          }
        }

        dom["CATGROUP_" + categoryGroup + "_APPS_" + data.oss[i]] = 
           dom["CATGROUP_" + categoryGroup + "_LIST_APPS_" + data.oss[i]].length;
      }
    } // End domain processing

    dom["TRACKER"] = trackerList[domain].tracker;
    for (var i=0; i<data.oss.length; i++) {
      dom["CATEGORIES_" + data.oss[i]] = categoriesCount[i];
      dom["CATEGORY_GROUPS_" + data.oss[i]] = categoryGroupsCount[i];
      dom["APPS_" + data.oss[i]] = allAppsList[i].length;
      dom["LIST_APPS_" + data.oss[i]] = allAppsList[i];
    }

    if (dom["APPS_" + this.myQuery.platform] > 0)
      tableDomains.push(dom);
  }
  return tableDomains;
}
