const express = require("express");
const app = express();
const cors = require("cors");
var JiraClient = require("jira-connector");
const { apikey, password } = require("./settings");
var axios = require('axios');

app.use(cors());
app.use((req, res, next) => {
  res.append('Authorization', "Basic " + apikey);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  res.append("Content-Type", "application/json");
  res.append("Cookie", "atlassian.xsrf.token=6a8987f4-5a8a-4cd7-baf1-e16e286bfac9_d913ebb2aae5befcf7dbf6cefc83b51402d58f35_lin");
  next();
});

var jira = new JiraClient({
  host: "orangebg.atlassian.net",
  basic_auth: {
    username: "moniaros.orange@gmail.com",
    password: password,
  },
  strictSSL: false
})

app.get("/assets", async (req, res) => {
  console.log("*************************");
  console.log('GET Request: assets');

  var config = {
    method: 'get',
    url: 'https://orangebg.atlassian.net/rest/api/2/search?jql=issuetype=10027%26project=AMF%26status=Open&maxResults=1000',
    headers: {
      'Authorization': 'Basic ' + apikey,
      'Cookie': 'atlassian.xsrf.token=6a8987f4-5a8a-4cd7-baf1-e16e286bfac9_071232a93e03c73b62e413e0212b4ec730098496_lin'
    }
  };

  axios(config)
    .then(function (response) {
      // console.log(response.data);
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error);
    });
})

app.get("/asset", async (req, res) => {
  console.log("*************************");
  console.log('GET Request: asset');
  console.log("assetid is set to " + req.query.assetid);

  // GET ISSUE
  const issue = await jira.issue.getIssue({ issueId: req.query.assetid });

  if (issue) {
    res.send(issue);
  } else {
    console.log(error);
    res.send(error);
  }
})

app.get("/assetRequestsByAssetId", async (req, res) => {
  console.log("*************************");
  console.log('GET Request: assetRequestsByAssetId')
  console.log("assetid is set to " + req.query.assetid);

  var config = {
    method: 'get',
    url: `https://orangebg.atlassian.net/rest/api/2/search?jql=issuetype=10028%26project=AMF%26status!=Closed%26"Select Asset"~"${req.query.assetid}"&maxResults=1000`,
    headers: {
      'Authorization': 'Basic bW9uaWFyb3Mub3JhbmdlQGdtYWlsLmNvbTpDaWt4UDQ3SExEQUZkMHRIWFd2WjQxNzQ=',
      'Cookie': 'atlassian.xsrf.token=6a8987f4-5a8a-4cd7-baf1-e16e286bfac9_071232a93e03c73b62e413e0212b4ec730098496_lin'
    }
  };

  axios(config)
    .then(function (response) {
      console.log('Request assets', response.data);
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error);
    });
})

app.get("/assetRequestsByAssetIdAndDate", async (req, res) => {
  console.log("*************************");
  console.log('GET Request: assetRequestsByAssetIdAndDate')
  console.log("assetid: " + req.query.assetid);
  console.log("revenue filter: " + req.query.revenuefilter);

  switch (req.query.revenuefilter) {
    case "Today": revenueFilterString = `%26("End Date/Time">=startOfDay()AND"Start Date/Time"<now())`; break;
    case "Week": revenueFilterString = `%26("End Date/Time">=startOfWeek()AND"Start Date/Time"<now())`; break;
    case "Month": revenueFilterString = `%26("End Date/Time">=startOfMonth()AND"Start Date/Time"<now())`; break;
    case "Year": revenueFilterString = `%26("End Date/Time">=startOfYear()AND"Start Date/Time"<now())`; break;
    case "All": revenueFilterString = `%26"Start Date/Time"<now()`; break;
    default:
      break;
  }

  const url = `https://orangebg.atlassian.net/rest/api/2/search?jql=issuetype=10028%26project=AMF${revenueFilterString}%26status!=Closed%26"Select Asset"~"${req.query.assetid}"&maxResults=1000`;

  var config = {
    method: 'get',
    url: url,
    headers: {
      'Authorization': 'Basic bW9uaWFyb3Mub3JhbmdlQGdtYWlsLmNvbTpDaWt4UDQ3SExEQUZkMHRIWFd2WjQxNzQ=',
      'Cookie': 'atlassian.xsrf.token=6a8987f4-5a8a-4cd7-baf1-e16e286bfac9_071232a93e03c73b62e413e0212b4ec730098496_lin'
    }
  };

  axios(config)
    .then(function (response) {
      res.send(response.data)
    })
    .catch(function (error) {
      console.log(error);
      res.send(error);
    });
})

app.listen(5000, () => console.log("listening on port 5000"));

// url: `https://orangebg.atlassian.net/rest/api/2/search?jql=issuetype=10028%26project=AMF${revenueFilterString}%26"Select Asset"~"${req.query.assetid}"&maxResults=1000`,
