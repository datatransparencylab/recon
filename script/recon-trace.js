/****** HELPER FUNCTIONS *********/
/* Trace all apps */
function traceAllApps(appList) {
  console.log("\n***** List of all the apps that send leaks *****");
  appList.forEach(function(app){
    traceApp(app);
  });
}

/* Print on console the details of an app */
function traceApp(myApp){
  console.log("\n  - Application #" + myApp.aid + ": " + myApp.appName + " for " + myApp.platform);
  console.log("      with popularity: " + myApp.popularity + " score: " +
              myApp.score + " leaks the following information:"); 

  for (var categoryID in myApp.categories) {
    console.log("        * " + categoryID + " to the domains: ");
    for (var domain in myApp.categories[categoryID]) {
      console.log("          - " + domain)
    }
  }
}

/* Print on console the list of domains that received leaks and the categories
 * of data they receive  */
function traceDomains(domains) {
  console.log("\n***** List of all the domains that receive leaks *****");
  for (var domain in domains) {
    console.log("\n  Domain " + domain + " is receiving the following info: ")
    for (var categoryID in domains[domain]) {
      console.log("    " + categoryID + "   (from the following apps:)");
      for (var appID in domains[domain][categoryID]) {
        console.log("      #" + appID + ": " + domains[domain][categoryID][appID].appName);
      }
    }
  }
  console.log("\n****************************************************");
}

/* Print on console the list of categories */
function traceCategories(allCategories) {
  console.log("\n****************************************************");
  console.log("\n   List of all the leak categories detected: ID (Description)\n")
  for (var categoryID in allCategories)
    console.log("   - " + categoryID + " (" +  allCategories[categoryID] +")");
  console.log("\n****************************************************");
}

