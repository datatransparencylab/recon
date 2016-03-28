var urlParams;
var data;
var query;
var parser;
var ui;

// Helper functions //
(window.onpopstate = function() {
  var match,
    pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function(s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
})();

$(document).ready(function() {
  query = new ReconQuery();
  parser = new ReconParser();
  data = new ReconData();
  ui = new ReconUI();
  ui.registerButtons();
  parser.readJSON();
});


// ReconQuery descripes a Recon query //
var ReconQuery = function() {
  this.trackers = true;
  this.domains = false;
  this.details = false;
  this.summary = true;
  this.platform = "All";
  this.type = "AppTable";
  this.category = "All";
  this.groupcategory = "All";
  this.nodata = false;
}

ReconQuery.prototype.getUrlFromQuery = function() {
  querystring = "?type=" + this.type;
  querystring += "&platform=" + this.platform;
  querystring += "&summary=" + this.summary;
  querystring += "&trackers=" + this.trackers;
  querystring += "&domains=" + this.domains;
  querystring += "&details=" + this.details;
  querystring += "&category=" + this.category;
  querystring += "&groupcategory=" + this.groupcategory;
  window.history.pushState("", "", "tool.html" + querystring);
}

ReconQuery.prototype.getQueryFromUrl = function() {
  var validQuery = false;
  if (urlParams["type"] != undefined) {
    this.type = urlParams["type"];
    if ((this.type == "AppTable") ||
      (this.type == "DomainTable") ||
      (this.type == "Categories") ||
      (this.type == "Bipartite")) {
      validQuery = true;

      this.summary = (urlParams["summary"] == "false") ? false : true;
      this.platform = (urlParams["platform"]) ? urlParams["platform"] : "All";
      this.trackers = (urlParams["trackers"] == "false") ? false : true;
      this.domains = (urlParams["domains"] == "true") ? true : false;
      this.details = (urlParams["details"] == "true") ? true : false;
      this.category = (urlParams["category"]) ? urlParams["category"] : "All";
      this.groupcategory = (urlParams["groupcategory"]) ? urlParams["groupcategory"] : "All";
    }
  }
  return validQuery;
}

// end of ReconQuery //

// Placeholder for all the data information //

var ReconData = function() {
  this.categories = [];
  this.apps = [];
  this.domains = [];
  this.trackers = [];
  this.nonTrackers = [];
  this.links = [];

  // List of Operating System to be assessed - TODO: are we using it in all the objects?
  this.oss = ["All", "ios", "android", "windows"];

  // List of Categories
  this.CATS = ["LOCATION", "X_WP_DEVICE_ID", "MUID", "X_WP_ANID", "LASTNAME",
    "ADVERTISERID", "ANDROIDID", "MACADDR", "SERIALNUMBER", "FIRSTNAME", "IMEI",
    "GENDER", "ZIPCODE", "USERNAME", "PASSWORD", "EMAIL", "CONTACTNAME", "IDFA",
    "DEVICENAME", "CONTACTNUMBER", "FULLNAME", "ADDRESS", "MEID", "DOB", "PSWD",
    "PROFILE", "RELATIONSHIP"];

  // Mapping bewtween category and category group
  this.CAT_VS_GROUP = {
    "LOCATION": "LOCATION",
    "X_WP_DEVICE_ID": "IDENTIFIERS",
    "MUID": "IDENTIFIERS",
    "X_WP_ANID": "IDENTIFIERS",
    "LASTNAME": "PERSONAL_INFO",
    "ADVERTISERID": "IDENTIFIERS",
    "ANDROIDID": "IDENTIFIERS",
    "MACADDR": "IDENTIFIERS",
    "SERIALNUMBER": "IDENTIFIERS",
    "FIRSTNAME": "PERSONAL_INFO",
    "IMEI": "IDENTIFIERS",
    "GENDER": "PERSONAL_INFO",
    "ZIPCODE": "PERSONAL_INFO",
    "USERNAME": "PERSONAL_INFO",
    "PASSWORD": "PERSONAL_INFO",
    "EMAIL": "PERSONAL_INFO",
    "CONTACTNAME": "PERSONAL_INFO",
    "IDFA": "IDENTIFIERS",
    "DEVICENAME": "IDENTIFIERS",
    "CONTACTNUMBER": "PERSONAL_INFO",
    "FULLNAME": "PERSONAL_INFO",
    "ADDRESS": "PERSONAL_INFO",
    "MEID": "IDENTIFIERS",
    "DOB": "PERSONAL_INFO",
    "PSWD": "PERSONAL_INFO",
    "PROFILE": "PERSONAL_INFO",
    "RELATIONSHIP": "PERSONAL_INFO"
  };
  
  // List of Category Groups
  this.CAT_GROUPS = ["LOCATION", "IDENTIFIERS", "PERSONAL_INFO"];

  // Description of the Category Groups
  this.CAT_GROUP_DESC = { 
    "LOCATION": "Information about the user loation",
    "IDENTIFIERS": "Hardware or Software Identifiers to uniquely identify a user/device",
    "PERSONAL_INFO": "Any Personal Information about the user"
  };
  
};

// RECON PARSER
var ReconParser = function(file) {
  this.jsonFile = file ? file : "http://recon.meddle.mobi/json/data.json";
  this.ready = false;
};

ReconParser.prototype.readJSON = function() {
  _this = this;

  $.getJSON(this.jsonFile, function(jsonp) {

    apps = jsonp.data; 

    for (var i = 0; i < apps.length; i++) { // We analyse every App 
      myApp = _this.createApp(apps[i]); // Creates the app with the basic info

      // Build a global list of categories aggregating the ones we find in apps
      _this.addAppCategoriesToGlobalList(apps[i]);

      // The information in the detail field is formatted with an HTML list 
      // need to convert that presentation ready info to something structured
      html = $.parseHTML(apps[i].detail);
      // Array of domains that we need to complete for all the app info  
      var domainInfo = []

      $("li", html).each(function(i, elem) { // For every domain entry in th app
        // Format is domain -> categry, category, category
        var splittedText = $(this).text().split("->");
        domainCategories = splittedText[0].split(","); // array of categories
        domainUrl = splittedText[1].trim(); // This is the domain

        var domainDetails = _this.createDomainDetails(domainUrl);

        // For the list of domains per app
        domainInfo[domainDetails.domainUrl] = domainDetails;
        _this.addDomainDetailsToGlobalList(domainDetails);

        var link = _this.createLink(myApp, domainDetails);

        // for every category for this domain
        domainCategories.forEach(function(category) { 
          // Get the category ID for the description provided
          var categoryID = _this.getCategoryIDFromDesc(category);

          // Complete the list of categories with the domain info
          _this.addDomainInfoToCategoryList(categoryID, domainDetails, myApp);

          // Add the category and category group to the app-domain link
          link.categories.push(categoryID);
          if (link.categoryGroups.indexOf(data.CAT_VS_GROUP[categoryID]) == -1)
            link.categoryGroups.push(data.CAT_VS_GROUP[categoryID]);

          // Now with the ID we can complete myApp information 
          if (myApp.categories[categoryID] == null)
            myApp.categories[categoryID] = [];
          myApp.categories[categoryID][domainDetails.domainUrl] = domainDetails;

          // Build the global 3D array that stores all the information perdomain
          // 1 - We check for the existence of the structure and create it
          _this.initDomainCategory(domainDetails.domainUrl, categoryID);
          // 2 - We fill-in the array 
          data.domains[domainDetails.domainUrl][categoryID][myApp.aid] = 
           _this.createAppPerDomain(myApp, domainDetails.domainUrl, categoryID);
        }); // Finished processing a category, for a domain, for an application
        data.links.push(link);
      }) // Finished processing a domain for an application 

      myApp.domains = domainInfo;
      data.apps[myApp.aid] = myApp;
    } // end of application parsing

    _this.readyToShow();
  });
}

ReconParser.prototype.readyToShow = function() {
  ReconParser.ready = true;
  ui.addCategoriesToDropdown();
  getExampleVisualizations();

  if (query.getQueryFromUrl()) {
    ui.updateDropdowns();
    $("#get-results").click();
  }
}

ReconParser.prototype.createApp = function(app) {
  return myApp = {
    aid: app.aid,
    appName: app.appName,
    score: app.score,
    popularity: app.popularity,
    platform: app.platform.toLowerCase(), // some versions of the json used caps
    categories: [], // still a placeholder 
    categoryGroups: [], // still a placeholder 
    domains: [] // placeholder too
  }; // store for the app being read
}


ReconParser.prototype.addAppCategoriesToGlobalList = function(app) {
  var categories = app.categories; // array
  var labels = app.c_text.split(","); // create array of category labels

  for (var i in categories) { // categories for this app
    // the category IDs come with the nice surprise of hyphens, let's change it with _
    categoryID = _this.normalizeCategory(categories[i]);

    if (data.categories[categoryID] == null) {
      data.categories[categoryID] = _this.createCategory(categoryID, labels[i]);
      for (pk = 0; pk < data.oss.length; pk++) {
        os = data.oss[pk];
        data.categories[categoryID].arrayApps[os] = [];
        data.categories[categoryID].arrayTrackers[os] = [];
        data.categories[categoryID].arrayNonTrackers[os] = [];
      }
    }
    
    if (data.categories[categoryID].arrayApps[app.platform.toLowerCase()].indexOf(app.appName) == -1) {
        data.categories[categoryID].arrayApps[app.platform.toLowerCase()].push(app.appName);
        data.categories[categoryID].arrayApps["All"].push(app.appName + "(" + app.platform.toLowerCase() + ")");
     }
  }
}


ReconParser.prototype.normalizeCategory = function(category) {
  return category.toUpperCase().replace(/-/g, "_");
}

ReconParser.prototype.createCategory = function(id, label) {
  return category = {
            "description": label.trim(),
            "ID": id,
            "categoryGroup": data.CAT_VS_GROUP[id],
            "arrayApps": [],
            "arrayTrackers": [],
            "arrayNonTrackers": []
          };
}

ReconParser.prototype.createDomainDetails = function(domainUrl) {
  // Structure to store the details of a domain, by default every one
  // is a third party and not a tracker
  return domainDetails = {
    tracker: (domainUrl.indexOf("Tracker") != -1) ? true : false,
    domainUrl: domainUrl.replace("Tracker", "").trim()
  };
}

ReconParser.prototype.createLink = function(app, domain) {
  var link = { "app": app.appName,
               "domain": domain.domainUrl,
               "platform": app.platform.toLowerCase(),
               "tracker": domain.tracker,
               "categories": [],
               "categoryGroups": []
             };

  if (link.app.length > 30)
    link.app = link.app.substring(0, 28) + "...";

  link.app = link.app + " (" + link.platform + ")";

  return link;
};

ReconParser.prototype.getCategoryIDFromDesc = function(description) {
  // Check categoryID based on the description
  var categoryID = Object.keys(data.categories).filter(function(key) {
    return data.categories[key].description === description.trim()
  })[0];

  if (categoryID == undefined) {
    categoryID = Object.keys(data.categories).filter(function(key) {
     return data.categories[key].description.toLowerCase() === description.trim().toLowerCase()
    })[0];
    // even worse, some descriptions are not consistent because of the use of caps:
    // ZipCode, zipcode, UserName, username
  }
  return categoryID;
}

ReconParser.prototype.addDomainDetailsToGlobalList = function(domainDetails) {
  if (domainDetails.tracker)
    data.trackers[domainDetails.domainUrl] = domainDetails;
  else
    data.nonTrackers[domainDetails.domainUrl] = domainDetails;
}

ReconParser.prototype.createAppPerDomain = function(app, domainUrl, categoryID) {
  return detailInfo = { aid: app.aid,
                 appName: app.appName,
                 score: app.score,
                 popularity: app.popularity,
                 platform: app.platform.toLowerCase(),
                 tracker: app.tracker,
                 url: domainUrl,
                 categoryGroup: data.CAT_VS_GROUP[categoryID]
               };
};

ReconParser.prototype.initDomainCategory = function(domainUrl, categoryID) {
  // Firstly we check for the existence of the structure and create it 
  if (data.domains[domainUrl] == null) {
    data.domains[domainUrl] = [];
    data.domains[domainUrl][categoryID] = [];
  } else if (data.domains[domainUrl][categoryID] == null) {
    // The domain existed but not for this info, add
    data.domains[domainUrl][categoryID] = [];
  }
}

ReconParser.prototype.addDomainInfoToCategoryList = function(categoryID, domainDetails, myApp) {
  if (data.categories[categoryID] != null) {
    if (domainDetails.tracker) {
      if ($.inArray(domainDetails.domainUrl, data.categories[categoryID].arrayTrackers[myApp.platform]) == -1)
        data.categories[categoryID].arrayTrackers[myApp.platform].push(domainDetails.domainUrl);
      if ($.inArray(domainDetails.domainUrl, data.categories[categoryID].arrayTrackers["All"]) == -1)
        data.categories[categoryID].arrayTrackers["All"].push(domainDetails.domainUrl);
    } else {
      if ($.inArray(domainDetails.domainUrl, data.categories[categoryID].arrayNonTrackers[myApp.platform]) == -1)
        data.categories[categoryID].arrayNonTrackers[myApp.platform].push(domainDetails.domainUrl);
      if ($.inArray(domainDetails.domainUrl, data.categories[categoryID].arrayNonTrackers["All"]) == -1)
        data.categories[categoryID].arrayNonTrackers["All"].push(domainDetails.domainUrl);
    }
  }
};


function getExampleVisualizations() {
  if (page == "app-details") {
    exampleQ = {
      trackers: true,
      domains: true,
      details: false,
      summary: false,
      platform: "All",
      type: "AppTable",
      noData: false
    };
    var table = new AppTable();
    table.createTable("table-app-details", exampleQ);
  } else if (page == "summary") {
    exampleQ = {
      trackers: true,
      domains: true,
      details: false,
      summary: false,
      platform: "All",
      type: "CategoryTable",
      noData: true
    };
    var tableCat = new CategoryTable("summary-table-categories", exampleQ);
    tableCat.createTable();
    exampleQ.summary = true;
    var appTable = new AppTable("summary-table-apps", exampleQ);
    appTable.createTable();
  } else if (page == "domains") {
    exampleQ = {
      trackers: true,
      domains: false,
      details: false,
      summary: true,
      platform: "All",
      type: "domainTable",
      noData: true,
      groupcategory: "All",
      category: "All"
    };
    var tableDom = new DomainTable("domain-table", exampleQ);
    tableDom.createTable();
  } else if (page == "categories") {
    exampleQ = {
      trackers: true,
      domains: false,
      details: false,
      summary: false,
      platform: "All",
      type: "domainTable",
      noData: false,
      groupcategory: "All",
      category: "All"
    };
    var tableC = new CategoryTable("categories-table", exampleQ);
    tableC.createTable();
  } else if (page == "iOS") {
    exampleQ = {
      trackers: true,
      domains: true,
      details: false,
      summary: false,
      platform: "ios",
      type: "Bipartite",
      noData: true,
      groupcategory: "All",
      category: "All"
    };
    var bp = new Bipartite("iOS-bipartite-all", exampleQ);
    bp.draw();

    exampleQ.groupcategory = "IDENTIFIERS";
    exampleQ.category = "All";
    var bp2 = new Bipartite("iOS-bipartite-id", exampleQ);
    bp2.draw();

    exampleQ.groupcategory = "PERSONAL_INFO";
    exampleQ.category = "All";
    var bp3 = new Bipartite("iOS-bipartite-pi", exampleQ);
    bp3.draw();

    exampleQ.groupcategory = "LOCATION";
    exampleQ.category = "All";
    var bp4 = new Bipartite("iOS-bipartite-location", exampleQ);
    bp4.draw();

    exampleQ = {
      trackers: true,
      domains: true,
      details: false,
      summary: true,
      platform: "ios",
      type: "AppTable",
      noData: false
    };
    var tableApp = new AppTable("iOS-table-apps", exampleQ);
    tableApp.createTable();
  }
}
