function AppTable(container, query){
  DataTable.call(this, container, query);
  this.limitApps = 5;
}

AppTable.prototype = Object.create(DataTable.prototype);
AppTable.constructor = AppTable;

AppTable.numberFormatter = function(value, row) {
  var color = value==0 ? "grey" : value > this.limitApps ? '#f70101' : 'normal';
  var fontWeight = value > this.limitApps ? 'bold' : 'normal';
  return ('<div  style="color: ' + color + '; font-weight: ' + fontWeight + 
          '">' + value + '</div>');
}

AppTable.prototype.createTable = function() {
  this.createBasicTableHeader(this.container);

  $('#' + this.container + ' table').attr("data-sort-name", "NAME");
  $('#' + this.container + ' table').attr("data-sort-order", "asc");

  var columns = this.getColumns();

  // Add first header for col groups
  $('#' + this.container + ' table').append('<thead/>');
  
  $('#' + this.container + ' table thead').append('<tr id="first-header"/>');
  $('#' + this.container + ' table thead tr').append('<th data-align="center"' +
    ' colspan=' + (2+((this.myQuery.platform == "All")?1:0)) + '> Application Details </th>');
  if (!this.myQuery.noData) {
    $('#' + this.container + ' table thead tr').append('<th data-align="center"' + 
      ' colspan=' +  (this.myQuery.trackers + this.myQuery.domains) + '> Total Number' + 
      ' of Domains Receiving Info</th>');
    if (this.myQuery.details) {
      $('#' + this.container + ' table thead tr').append('<th data-align=' + 
        '"center" colspan=' +  (this.myQuery.trackers + this.myQuery.domains) + 
        '> URLs of Domains Receiving Info</th>');
    }
    if (this.myQuery.trackers) {
      $('#' + this.container +  ' table thead tr').append('<th data-align=' + 
        '"center" colspan=' + 
        (this.myQuery.summary ? data.CAT_GROUPS.length : data.CATS.length) + 
        '> Number of Trackers per Information type</th>');
    }
    if (this.myQuery.domains) {
      $('#' + this.container +  ' table thead tr').append('<th data-align=' + 
        '"center" colspan=' + 
        (this.myQuery.summary ? data.CAT_GROUPS.length : data.CATS.length) + 
        '> Number of Non-Trackers per Information type</th>');
    }
    if (this.myQuery.details) {
      if (this.myQuery.trackers) {
        $('#' + this.container +  ' table thead tr').append('<th data-align="' + 
          'center" colspan=' + 
          (this.myQuery.summary ? data.CAT_GROUPS.length : data.CATS.length) + 
          '> Tracker URLs per Information type</th>');
      }
      if (this.myQuery.domains) {
        $('#' + this.container +  ' table thead tr').append('<th data-align=' + 
          '"center" colspan=' + 
          (this.myQuery.summary ? data.CAT_GROUPS.length : data.CATS.length) + 
          '> Non-Tracker URLs per Information type</th>');
      }
    }
  }
    
  $('#' + this.container + ' table thead').append(  '<tr id="second-header"/>' );

  for(i=0;i<columns.length;i++) {
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
  .bootstrapTable({data: this.getData(this.myQuery)});
}

AppTable.prototype.getColumns = function() {
  var columns = [
   { label: "Name", key: "NAME", width: 100, halign: "center", align: "center",
     sortable: true, visible: true, switchable: false, formatter: "%s"}]

  if (this.myQuery.platform == "All")
    columns.push({label: "OS", key: "PLATFORM", halign: "center",
                  align: "center", width: 200, sortable: true, visible: true, 
                  switchable: false, formatter: "%s"});

  columns.push({label: "Popularity", key: "POPULARITY", halign: "center",
               align: "center", width: 200, sortable: true, visible: true,
               switchable: true, formatter: "%s"})

  if(this.myQuery.noData)
    return columns;

  if (this.myQuery.trackers) {
    columns.push({key: "TRACKER_COUNT", label: "Trackers", halign: "center",
                 align: "center", width: 100, sortable: true, visible: true,
                 switchable: true, formatter: "AppTable.numberFormatter"});
  }

  if (this.myQuery.domains) {
    columns.push({key: "DOMAIN_COUNT", label: "Non-Trackers", halign: "center",
                 align: "center", width: 100, sortable: true, visible: true, 
                 switchable: true, formatter: "AppTable.numberFormatter"});
  }

  if (this.myQuery.details) {
    if (this.myQuery.trackers) {
      columns.push({key: "TRACKER_LIST", label: "Trackers", halign: "center",
                   align: "center", width: 200, sortable: false, visible: true,
                   switchable: true, formatter: "DataTable.arrayFormatter"});
    }
    if (this.myQuery.domains) {
      columns.push({key: "DOMAIN_LIST", label: "Non-Trackers", halign: "center",
                   align: "center", width: 200, sortable: false, visible: true,
                   switchable: true, formatter: "DataTable.arrayFormatter"});
    }
  }


  if (this.myQuery.summary) {
    for (var gid in data.CAT_GROUPS) {
      var group = data.CAT_GROUPS[gid];
      if (this.myQuery.trackers) {
        columns.push({key: "GROUP_" + group + "_TRACKER_COUNT", label: group,
                     halign: "center", align: "center", width: 100, 
                     sortable: true, visible: true, switchable: true, 
                     formatter: "AppTable.numberFormatter"});
      }
    }
    for (var gid in data.CAT_GROUPS) {
      var group = data.CAT_GROUPS[gid];
      if (this.myQuery.domains) {
        columns.push({key: "GROUP_" + group + "_DOMAIN_COUNT", label: group,
                     halign: "center", align: "center", width: 100,
                     sortable: true, visible: true, switchable: true,
                     formatter: "AppTable.numberFormatter"});
      }
    }
    if (this.myQuery.details) {
      for (var gid in data.CAT_GROUPS) {
        var group = data.CAT_GROUPS[gid];
        if (this.myQuery.trackers) {
          columns.push({key: "GROUP_" + group + "_TRACKER_LIST", label: group,
                       halign: "center", align: "center", width: 100,
                       sortable: true, visible: true, switchable: true,
                       formatter: "DataTable.arrayFormatter"});
        }
      }
      for (var gid in data.CAT_GROUPS) {
        var group = data.CAT_GROUPS[gid];
        if (this.myQuery.domains) {
          columns.push({key: "GROUP_" + group + "_DOMAIN_LIST", label: group,
                       halign: "center", align: "center", width: 100,
                       sortable: true, visible: true, switchable: true, 
                       formatter: "DataTable.arrayFormatter"});
        }
      }
    }
  }

  if (!this.myQuery.summary) {
    // TODO - Any idea to hide those columns that don't have any result?.
    if (this.myQuery.trackers) {
      for (var categoryID in data.categories) {
        columns.push({key: categoryID + "_TRACKER_COUNT", label: categoryID,
                      halign: "center", align: "center", width: 100, 
                      sortable: true, visible: true, switchable: true, 
                      formatter: "AppTable.numberFormatter"});
      }
    }
    if (this.myQuery.domains) {
      for (var categoryID in data.categories) {
        columns.push({key: categoryID + "_DOMAIN_COUNT", label: categoryID,
                      halign: "center", align: "center", width: 100, 
                      sortable: true, visible: true, switchable: true, 
                      formatter: "AppTable.numberFormatter"});
      }
    }

    if (this.myQuery.details) {
      if (this.myQuery.trackers) {
        for (var categoryID in data.categories) {
          columns.push({key: categoryID + "_TRACKER_LIST", label: categoryID,
                        halign: "center", align: "center", width: 200, 
                        sortable: false, visible: true, switchable: true, 
                        formatter: "DataTable.arrayFormatter"});
        }
      }
      if (this.myQuery.domains) {
        for (var categoryID in data.categories) {
          columns.push({key: categoryID + "_DOMAIN_LIST", label: categoryID, 
                        halign: "center", align: "center", width: 200, 
                        sortable: false, visible: true, switchable: true, 
                        formatter: "DataTable.arrayFormatter"});
        }
      }
    }
  }
  return columns;
}

AppTable.prototype.getData = function() {
  var tableApps = [];
  _this = this;

  data.apps.forEach(function(app) {
    // Ideally I would love to count always so the data is full and filter later
    // on when showing the results, but I've not found a way to do it with
    if ((_this.myQuery.platform == "All") || 
        (((_this.myQuery.platform == "ios") && (app.platform == "ios")) ||
         ((_this.myQuery.platform == "android") && (app.platform == "android")) ||
           ((_this.myQuery.platform == "windows") && (app.platform == "windows")))) {
      var domainList = [];
      var trackerList = [];
      var domainCount = 0;
      var trackerCount = 0;

      for(var domain in app.domains) {
        if (app.domains[domain].tracker) {
          trackerCount++;
          trackerList.push(domain);
        } else {
          domainList.push(domain);
          domainCount++;
        }
      }

      newApp = {
        "ID": app.aid,
        "NAME": app.appName,
        "PLATFORM": app.platform,
        "POPULARITY": app.popularity,
        "SCORE": app.score,
        "DOMAIN_COUNT": domainCount,
        "DOMAIN_LIST": domainList,
        "TRACKER_COUNT": trackerCount,
        "TRACKER_LIST": trackerList
      }

      var groupDomainCount = []; 
      var groupTrackerCount = []; 
      var groupDomainList = []; 
      var groupTrackerList = []; 

      for (var group in data.CAT_GROUPS) {
        groupDomainCount[data.CAT_GROUPS[group]] = 0; 
        groupTrackerCount[data.CAT_GROUPS[group]] = 0; 
        groupTrackerList[data.CAT_GROUPS[group]] = []; 
        groupDomainList[data.CAT_GROUPS[group]] = []; 
      }

      for (var categoryID in data.categories) {
        var catDomainList = [];
        var catTrackerList = [];
        var catDomainCount = 0;
        var catTrackerCount = 0;
        for (var domain in app.categories[categoryID]) {
          if (app.categories[categoryID][domain].tracker) {
            catTrackerCount++;
            catTrackerList.push(domain);
          } else {
            catDomainCount++;
            catDomainList.push(domain);
          }
        }

        newApp[categoryID + "_DOMAIN_COUNT"] = catDomainCount; 
        newApp[categoryID + "_DOMAIN_LIST"] = catDomainList; 
        newApp[categoryID + "_TRACKER_COUNT"] = catTrackerCount; 
        newApp[categoryID + "_TRACKER_LIST"] = catTrackerList; 

        var group = data.CAT_VS_GROUP[categoryID];

        for (var k=0; k<catTrackerList.length; k++){
          if (groupTrackerList[group].indexOf(catTrackerList[k]) == -1) {
            groupTrackerList[group].push(catTrackerList[k]);
            groupTrackerCount[group]++;
          }
        }

        for (var k=0; k < catDomainList.length; k++){
          if (groupDomainList[group].indexOf(catDomainList[k]) == -1) {
            groupDomainList[group].push(catDomainList[k]);
            groupDomainCount[group]++;
          }
        }
      }

      for (var idx =0; idx < data.CAT_GROUPS.length; idx++) {
        group = data.CAT_GROUPS[idx];
        newApp["GROUP_" + group + "_TRACKER_COUNT"] = groupTrackerCount[group];
        newApp["GROUP_" + group + "_DOMAIN_COUNT"] = groupDomainCount[group];
        newApp["GROUP_" + group + "_DOMAIN_LIST"] = groupDomainList[group];
        newApp["GROUP_" + group + "_TRACKER_LIST"] = groupTrackerList[group];
      }

      if (((_this.myQuery.trackers) && (newApp["TRACKER_COUNT"] > 0)) ||
          ((_this.myQuery.domains) && (newApp["DOMAIN_COUNT"] > 0)))
        tableApps.push(newApp);
    }
  });
  return tableApps;
} 
