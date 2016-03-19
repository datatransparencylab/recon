var urlParams;
var data;
var query;
var parser;
var ui;

(window.onpopstate = function () {
  var match,
      pl     = /\+/g,  // Regex for replacing addition symbol with a space
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = window.location.search.substring(1);

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
    window.history.pushState("", "", "test.html" + querystring);
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

var ReconData = function () {
  this.categories = [];
  this.apps = [];
  this.domains = [];
  this.trackers = [];
  this.nonTrackers = [];
  this.links = [];

  // List of Operating System to be assessed - TODO: are we using it in all the objects?
  this.oss = ["All", "iOS", "Android", "Windows"];

  // List of Category Groups and Categories
  this.CAT_GROUPS = ["LOCATION", "IDENTIFIERS", "PERSONAL_INFO"];
  this.CATS = [ "LOCATION", "X_WP_DEVICE_ID", "MUID", "X_WP_ANID", "LASTNAME",
    "ADVERTISERID", "ANDROIDID", "MACADDR", "SERIALNUMBER", "FIRSTNAME", "IMEI",
    "GENDER", "ZIPCODE", "USERNAME", "PASSWORD", "EMAIL", "CONTACTNAME", "IDFA",
    "DEVICENAME", "CONTACTNUMBER", "FULLNAME", "ADDRESS", "MEID", "DOB", "PSWD",
    "PROFILE", "RELATIONSHIP"];

  // Description of the Category Groups
  this.CAT_GROUP_DESC = { 
    "LOCATION": "LOCATION", 
    "IDENTIFIERS": "IDENTIFIERS", 
    "PERSONAL_INFO": "PERSONAL_INFO"};

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
}


var ReconParser = function (file) {
  this.jsonFile = file ? file : "recon-app-leaks-ok.json";
  this.ready = false;
};

ReconParser.prototype.readJSON = function() {
  $.getJSON(this.jsonFile, function(apps) {
    for(var i = 0; i< apps.length; i++) {
      var myApp = {
        aid: apps[i].aid,
        appName: apps[i].appName,
        score: apps[i].score,
        popularity: apps[i].popularity,
        platform: apps[i].platform,
        categories: [], // still a placeholder 
        categoryGroups: [], // still a placeholder 
        domains: [] // placeholder too
      }; // store for the app being read

      // These below require a bit of processing
      var categories = apps[i].categories; // array
      // should be an array, but it's comma separated list so we did this trick!!!
      var categoryLabels = apps[i].c_text.split(","); 
      var domains = apps[i].domains; // array

      // As we don't have a list of categories we build a global one by storing all the
      // categories detected in all the apps in allCategories
      for (var catIdx in categories) { // categories for this app
        // the category IDs come with the nice surprise of hyphens, let's change it with _
        cleanCatID = (categories[catIdx]).toUpperCase().replace(/-/g,"_");

        if (data.categories[cleanCatID] == null) {
            data.categories[cleanCatID] = {
            "description": categoryLabels[catIdx].trim(),
            "ID": cleanCatID,
            "categoryGroup": data.CAT_VS_GROUP[cleanCatID],
            "arrayApps": [],
            "arrayTrackers": [],
            "arrayNonTrackers": []
          };
          for (pk=0; pk < data.oss.length; pk++) {
            os = data.oss[pk];
            data.categories[cleanCatID].arrayApps[os] = [];
            data.categories[cleanCatID].arrayTrackers[os]= [];
            data.categories[cleanCatID].arrayNonTrackers[os] = [];
          }
        }

        if (data.categories[cleanCatID].arrayApps[myApp.platform]
            .indexOf(myApp.appName) == -1) {
          data.categories[cleanCatID].arrayApps[myApp.platform]
            .push(myApp.appName);
          data.categories[cleanCatID].arrayApps["All"]
            .push(myApp.appName + "(" + myApp.platform +")" );
        }
      }
      
      var domainInfo = []

      // The information in  the detil field is formatted with an HTML list that
      // includes some fields separated by an arrow -> other by commas, others
      // include the keyword tracking as free text. So all this magic is to
      // convert that presentation ready info to something properly structured 
      html = $.parseHTML(apps[i].detail)
      $("li", html).each(function (i, elem) {
        // Format is domain -> categry, category, category
        var splittedText = $(this).text().split("->");
        domainCategories = splittedText[0].split(","); // array of categories
        domainUrl = splittedText[1].trim(); // This is the domain

        // Structure to store the details of a domain, by default every one
        // is a third party and not a tracker
        var domainDetails = {
          primary: false,
          tracker: false,
          domainUrl: domainUrl
        };

        // If a domain is tracker is defined by including the word tracker
        // together with the URL, so we check for it and if it's found
        // we change tracker to true and remove the string from the domain
        var index = domainDetails.domainUrl.indexOf("Tracker");

        if(index != -1) {
          domainUrl = domainUrl.replace("Tracker","").trim(); 
          domainDetails.domainUrl = domainUrl;
          domainDetails.tracker = true;
        }

        // For the list of domains per app
        domainInfo[domainUrl] = domainDetails;

        // links
        link = {
          "app": myApp.appName,
          "domain": domainDetails.domainUrl,
          "platform": myApp.platform,
          "tracker": domainDetails.tracker,
          "categories": [],
          "categoryGroups": []
        }

        if(link.app.length > 30)
          link.app = link.app.substring(0,28)+"...";
        link.app = link.app + " (" + link.platform + ")";

        if (domainDetails.tracker) 
          data.trackers[domainDetails.domainUrl] = domainDetails;
        else
          data.nonTrackers[domainDetails.domainUrl] = domainDetails;

        // To make the things a bit more complicated, the categories we 
        // obtained from the detail field are the description not the IDs
        // so we need to get first the ID linked to the description and 
        // only afterwards build our 2-d array:
        domainCategories.forEach(function(category){

          // Check categoryID based on the description
          var categoryID = Object.keys(data.categories).filter(function(key) {return data.categories[key].description === category.trim()})[0];

          if (categoryID == undefined){
            categoryID = Object.keys(data.categories).filter(function(key) {return data.categories[key].description.toLowerCase() === category.trim().toLowerCase()})[0];
            // even worse, some descriptions are not consistent because of the use of caps:
            // ZipCode, zipcode, UserName, username
          }

          link.categories.push(categoryID);

          if (link.categoryGroups.indexOf(data.CAT_VS_GROUP[categoryID]) == -1)
            link.categoryGroups.push(data.CAT_VS_GROUP[categoryID]);

          // Now with the ID we can add it
          if (myApp.categories[categoryID] == null) 
            myApp.categories[categoryID] = [];
          myApp.categories[categoryID][domainUrl] = domainDetails;

          // The remaining is to build the global 3D array that stores all the
          // information per-domain rather than per-app, is kind of duplication
          // but would make building visual staff easier. 
      
          // Firstly we check for the existence of the structure and create it 
          if (data.domains[domainUrl] == null) {
              data.domains[domainUrl] = []; 
              data.domains[domainUrl][categoryID] = [];
          } else if (data.domains[domainUrl][categoryID] == null) { 
            // The domain existed but not for this info, add
            data.domains[domainUrl][categoryID] = [];
          }

          // And then we fill-in the array 
          data.domains[domainUrl][categoryID][myApp.aid] = {
            aid : myApp.aid,
            appName : myApp.appName,
            score : myApp.score,
            popularity : myApp.popularity,
            platform : myApp.platform,
            tracker : myApp.tracker,
            url : domainUrl,
            categoryGroup : data.CAT_VS_GROUP[categoryID]
          };

          if (data.categories[categoryID] != null) {
            if (domainDetails.tracker) {
              if (data.categories[categoryID].arrayTrackers[myApp.platform].indexOf(domainUrl) == -1)
                data.categories[categoryID].arrayTrackers[myApp.platform].push(domainUrl);
              if (data.categories[categoryID].arrayTrackers["All"].indexOf(domainUrl) == -1)
                data.categories[categoryID].arrayTrackers["All"].push(domainUrl);
            } else {
              if (data.categories[categoryID].arrayNonTrackers[myApp.platform].indexOf(domainUrl) == -1)
                data.categories[categoryID].arrayNonTrackers[myApp.platform].push(domainUrl);
              if (data.categories[categoryID].arrayNonTrackers["All"].indexOf(domainUrl) == -1)
                data.categories[categoryID].arrayNonTrackers["All"].push(domainUrl);
            }
          }

        });
        data.links.push(link);
      }) // Finished processing the detail field

      myApp.domains = domainInfo;
      data.apps[myApp.aid] = myApp;
    }

    ReconParser.ready = true;
    ui.addCategoriesToDropdown();
    getExampleVisualizations();

    if (query.getQueryFromUrl()) {
      ui.updateDropdowns();
      $("#get-results").click();
    }
  });
}

function getExampleVisualizations() {
  if (page == "app-details"){
    exampleQ = { trackers: true , domains: true , details: false , summary: false , platform: "All" , type: "AppTable", noData: false};
    var table = new AppTable();
    table.createTable("table-app-details", exampleQ);
  } else if (page == "summary"){
    exampleQ = { trackers: true , domains: true , details: false , summary: false , platform: "All" , type: "CategoryTable", noData: true};
    var tableCat = new CategoryTable("summary-table-categories", exampleQ);
    tableCat.createTable();
    exampleQ.summary = true;
    var appTable = new AppTable("summary-table-apps", exampleQ);
    appTable.createTable();
  } else if (page == "domains"){
      exampleQ = { trackers: true , domains: false , details: false , summary: true , platform: "All" , type: "domainTable", noData: true, groupcategory: "All", category: "All"};
      var tableDom = new DomainTable("domain-table", exampleQ);
      tableDom.createTable();
    } else if (page == "categories"){
      exampleQ = { trackers: true , domains: false , details: false , summary: false , platform: "All" , type: "domainTable", noData: false, groupcategory: "All", category: "All"};
      var tableC = new CategoryTable("categories-table", exampleQ);
      tableC.createTable();
    } else if (page == "iOS") {
      exampleQ = { trackers: true , domains: true , details: false , summary: false , platform: "iOS" , type: "Bipartite", noData: true, groupcategory: "All", category: "All"};
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

      exampleQ = { trackers: true , domains: true , details: false , summary: true , platform: "iOS" , type: "AppTable", noData: false  };
      var tableApp = new AppTable("iOS-table-apps", exampleQ);
      tableApp.createTable();
    }
}
