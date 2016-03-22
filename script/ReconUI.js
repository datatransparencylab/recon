var ReconUI = function() {
}

ReconUI.prototype.registerButtons = function() {
  this.registerButtonResult();
  this.registerButtonCsv();
  this.registerDropdownSelector();
  this.registerDropdownType();
  this.registerDropdownPlatform();
  this.registerDropdownTrackers();
  this.registerDropdownDetails();
  this.registerDropdownCategories();
  this.registerDropdownCategoryGroups();
  this.showSome(["type", "platform", "details", "trackers"]);
  this.hideSome(["categories", "groupcategories"]);
  $('#download-csv').hide();
}

ReconUI.prototype.registerButtonCsv = function() {
  $('#download-csv').on('click', {that: this}, function(e) {
    var _that = e.data.that;
    DataTable.exportTableToCSV($('#table-container'), _that.csvFile());
  });
}


ReconUI.prototype.registerButtonResult = function() {
  $('#get-results').on('click', {that: this}, function(e) {
    var _that = e.data.that;
    _that.cleanUI();
    _that.showTitle();

    if (query.type == "AppTable") {
      var appTable = new AppTable("table-container");
      appTable.createTable();
      $("#download-csv").show();
    }
    else if (query.type == "Bipartite") {
      if (window.bp != null)
        window.bp.destroy();
      window.bp = new Bipartite("table-container");
      window.bp.draw();
    }
    else if (query.type == "DomainTable") {
      var domainTable = new DomainTable("table-container");
      domainTable.createTable();
      $("#download-csv").show();
    }
    else {
      var catTable = new CategoryTable("table-container");
      catTable.createTable();
      $("#download-csv").show();
    }
    query.getUrlFromQuery();
  });
}

ReconUI.prototype.csvFile = function() {
  var selectorTitles = ["Apps", "Domains", "Categories"];
  var selectorValues = ["AppTable", "DomainTable", "Categories"];
  var selectorString = selectorTitles[selectorValues.indexOf(query.type)];

  var platformString = (query.type == "Categories") ? "" : "-OS_" + query.platform;
  var trackersString = (query.type == "Categories") ? "" : (query.trackers && query.domains) ? "-AllDomain " : query.trackers ? "-Trackers" : "-NonTrackers";
  var summaryString = ((query.type == "Bipartite") || (query.type == "Categories")) ? "" : query.summary ? "-CategoriesAggregated" : "CategoriesSplit";
  var detailsString = ((query.type == "Bipartite") || (query.type == "Categories")) ? "" : query.details ? "-Detailed" : "";

  return (selectorString + platformString + trackersString + summaryString + detailsString + ".csv");
}

ReconUI.prototype.showTitle = function() {
  var selectorTitles = ["Table of Applications that leak PI", 
                "Table of Domains that receive PI",
                "List of PI Categories",
                "Graph of Applications leaking PI vs. receiving Domains"];
  var selectorValues = ["AppTable", "DomainTable", "Categories", "Bipartite"];
  var selectorString = selectorTitles[selectorValues.indexOf(query.type)] + ". ";

  var platformString = (query.type == "Categories") ? "" : "Operating System: " + query.platform + ". ";
  var trackersString = (query.trackers && query.domains) ? "All the domains (trackers & non-trackers). " : query.trackers ? "Only Trackers. " : "Only non-trackers. ";
  var summaryString = ((query.type == "Bipartite")) ? "" : query.summary ? "PI Categories Aggregated in Groups. " : "PI Categories split. ";
  var detailsString = ((query.type == "Bipartite")) ? "" : query.details ? "Includes detailed information about URLs/Apps." : "";
  var categoriesString = query.type != "Bipartite" ? "" : query.category == "All" ? "All Categories." : "Category: " + query.category;

  $("#report-title").text(selectorString);
  $("#report-subtitle").text(platformString + trackersString + summaryString + detailsString + categoriesString);
}

ReconUI.prototype.updateDropdowns = function() {
  switch (query.type) {
    case "AppTable":
      $("#selector-button-group").find('.selection').text("Applications that leak PI");
      this.applicationMenu();
      this.platformMenu();
      this.typeMenu();
      this.trackersMenu();
      this.detailsMenu("URLs");
      break;
    case "DomainTable":
      $("#selector-button-group").find('.selection').text("Domains that receive PI");
      this.domainsMenu();
      this.platformMenu();
      this.typeMenu();
      this.trackersMenu();
      this.detailsMenu("Apps");
      break;
    case "Categories":
      $("#selector-button-group").find('.selection').text("PI Categories");
      this.categoriesMenu();
      this.typeMenu();
      this.trackersMenu();
      this.detailsMenu("Apps");
      break;
    case "Bipartite":
      $("#selector-button-group").find('.selection').text("Applications vs. Domains");
      this.bipartiteMenu();
      this.platformMenu();
      this.typeMenu();
      this.trackersMenu();
      this.categoryMenu();
      break;
  }
}

ReconUI.prototype.registerDropdownSelector = function() {
  var _this = this;
  $('#selector-button-dropdown li').on('click', {that: this}, function(e) {
    var _that = e.data.that;

     if (($(this).text()) == "Applications that leak PI") {
       if (query.type != "AppTable") {
         _that.cleanUI();
         query.type = "AppTable";
         _that.updateDropdowns();
       }
     }
     else if (($(this).text()) == "Domains that receive PI") {
       if (query.type != "DomainTable") {
         _that.cleanUI();
         query.type = "DomainTable";
         _that.updateDropdowns();
       }
     }
     else if (($(this).text()) == "PI Categories") {
       if (query.type != "Categories") {
         _that.cleanUI();
         query.type = "Categories";
         _that.updateDropdowns();
       }
     } else {
       if (query.type != "Bipartite") {
         _that.cleanUI();
         query.type = "Bipartite";
         _that.updateDropdowns();
       }
     }
     $(this).parents("#selector-button-group").find('.selection').text($(this).text());
     $(this).parents("#selector-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.applicationMenu = function() {
  $("#details-button-group").find('.selection').text("Hide URLs");
  this.showAll();
  this.showSome(["type", "platform", "details", "trackers"]);
  this.hideSome(["categories", "groupcategories"]);
  $("#details-button-dropdown").html('<li><a href="#">Show URLs</a></li><li><a href="#">Hide URLs</a></li>');
  this.registerDropdownDetails();
}

ReconUI.prototype.domainsMenu = function() {
  $("#details-button-group").find('.selection').text("Hide Apps");
  this.showSome(["type", "platform", "details", "trackers"]);
  this.hideSome(["categories", "groupcategories"]);
  $("#details-button-dropdown").html('<li><a href="#">Show Apps</a></li><li><a href="#">Hide Apps</a></li>');
  this.registerDropdownDetails();
}

ReconUI.prototype.categoriesMenu = function() {
  this.showSome(["trackers", "details", "type"]);
  this.hideSome(["platform", "categories", "groupcategories"]);
}

ReconUI.prototype.bipartiteMenu = function() {
  this.showSome(["platform", "trackers", "categories", "groupcategories"]);
  this.hideSome(["details", "type"]);
}

ReconUI.prototype.platformMenu = function() {
  if(query.platform == "All")
    $("#platform-button-group").find('.selection').text("All OS");
  else
    $("#platform-button-group").find('.selection').text(query.platform);
}

ReconUI.prototype.typeMenu = function() {
  if(query.summary)
    $("#type-button-group").find('.selection').text("Summary");
  else
    $("#type-button-group").find('.selection').text("Detailed per category");
}

ReconUI.prototype.detailsMenu = function(detailType) {
  if(query.details)
    $("#details-button-group").find('.selection').text("Show " + detailType);
  else
    $("#details-button-group").find('.selection').text("Hide " + detailType);
}

ReconUI.prototype.categoryMenu = function() {
  if(query.category == "All")
    $("#categories-button-group").find('.selection').text("All Categories");
  else
    $("#categories-button-group").find('.selection').text(query.category);
}

ReconUI.prototype.trackersMenu = function() {
  if(query.trackers && query.domains)
    $("#trackers-button-group").find('.selection').text("All Domains");
  else if(query.trackers)
    $("#trackers-button-group").find('.selection').text("Only Trackers");
  else
    $("#trackers-button-group").find('.selection').text("Only Non-Trackers");
}

ReconUI.prototype.registerDropdownType = function() {
  $('#type-button-dropdown li').on('click', function(){
     if (($(this).text()) == "Summary") {
       query.summary = true;
     }
     else {
       if (($(this).text()) == "Detailed per category group") {
         query.summary = true;
       }
       else {
         query.summary = false;
       }
     }
     $(this).parents("#type-button-group").find('.selection').text($(this).text());
     $(this).parents("#type-button-group").find('.selection').val($(this).text());
  });
}


ReconUI.prototype.registerDropdownPlatform = function() {
  $('#platform-button-dropdown li').on('click', function(){
     if ($(this).text() == "All OS")
       query.platform = "All"
     else
       query.platform = $(this).text();
     $(this).parents("#platform-button-group").find('.selection').text($(this).text());
     $(this).parents("#platform-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.registerDropdownTrackers = function() {
  $('#trackers-button-dropdown li').on('click', function(){
     if (($(this).text()) == "All Domains") {
       query.trackers = true;
       query.domains = true;
     }
     else if (($(this).text()) == "Only Trackers") {
       query.trackers = true;
       query.domains = false;
     } else {
       query.trackers = false;
       query.domains = true;
     } 
     $(this).parents("#trackers-button-group").find('.selection').text($(this).text());
     $(this).parents("#trackers-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.registerDropdownDetails = function() {
  $('#details-button-dropdown li').on('click', function(){
     if (($(this).text()).startsWith("Show"))
       query.details = true;
     else
       query.details = false;
     $(this).parents("#details-button-group").find('.selection').text($(this).text());
     $(this).parents("#details-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.registerDropdownCategories = function() {
  $('#categories-button-dropdown li').on('click', function(){
     if (($(this).text()).startsWith("All"))
       query.category = "All";
     else
       query.category = $(this).text();
     $(this).parents("#categories-button-group").find('.selection').text($(this).text());
     $(this).parents("#categories-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.registerDropdownCategoryGroups = function() {
  $('#groupcategories-button-dropdown li').on('click', function(){
     if (($(this).text()).startsWith("All"))
       query.groupcategory = "All";
     else
       query.groupcategory = $(this).text();
     $(this).parents("#groupcategories-button-group").find('.selection').text($(this).text());
     $(this).parents("#groupcategories-button-group").find('.selection').val($(this).text());
  });
}

ReconUI.prototype.addCategoriesToDropdown = function() {
  for (category in data.categories) {
    $('#categories-button-dropdown').append('<li><a href="#">' + category + '</a></li>')
  }
  this.registerDropdownCategories();
  for (categoryGroup in data.CAT_GROUPS) {
    $('#groupcategories-button-dropdown').append('<li><a href="#">' + data.CAT_GROUPS[categoryGroup] + '</a></li>')
  }
  this.registerDropdownCategoryGroups();
}

ReconUI.prototype.showSome = function(fields) {
  for (item in fields) {
    $("#" + fields[item] + "-button-group").show();
    $("#" + fields[item] + "-label").show();
  }
}

ReconUI.prototype.hideSome = function(fields) {
  for (item in fields) {
    $("#" + fields[item] + "-button-group").hide();
    $("#" + fields[item] + "-label").hide();
  }
}

ReconUI.prototype.showAll = function() {
  this.showSome(["type", "platform", "details", "trackers", "categories", "groupcategories"]);
}

ReconUI.prototype.hideAll = function() {
  this.hideSome(["type", "platform", "details", "trackers", "categories", "groupcategories"]);
}

ReconUI.prototype.cleanUI = function() {
  $("#download-csv").hide();
  $("#report-title").text("");
  $("#report-subtitle").text("");
  $("svg").remove(); // Remove svg graph in case it existed before
  $(".bootstrap-table").remove(); // Remove table in case it existed before
  $("#table-container table").remove(); // Remove table in case it existed before
  if ((window.bp) && (window.bp.tip)) window.bp.tip.hide();
}
