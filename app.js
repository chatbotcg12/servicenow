/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

/**set port using env variable for server */
 var port = process.env.PORT || 3000;
	app.listen(port, "0.0.0.0", function () {
		console.log("Listening on --- Port 3000");
});

/**set port using env variable  for local*/
 /* 
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})*/

/**pass incoming webhook to send messege to slack from azure */
var MY_SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

/** start connection  from servicenow*/
const sn = require('servicenow-rest-api');
const ServiceNow = new sn('dev49606', 'admin', '10Service@321');
/** end connection  from servicenow*/



///////////////////////////////////////////
//     API for connection servicenow  //
///////////////////////////////////////////
app.post('/service', function (req, response) {
		console.log("Display name ", req.body.queryResult.intent.displayName);
        switch (req.body.queryResult.intent.displayName) {			
           
		/**Getting ticket details from service now */
        case "getServiceNowTkt":
            response.setHeader('Content-Type', 'application/json');
            const fields = [
                'number',
                'short_description',
                'assignment_group',
                'priority',
                'incident_state'
            ];
            const filters = [
                'number=' + req.body.queryResult.parameters.tktnumber
            ];
            ServiceNow.getTableData(fields, filters, 'incident', res => {
		
                console.log(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " status is " + res[0].incident_state + " and description : " + res[0].short_description }));
                response.send(JSON.stringify({ "fulfillmentText": "Ticketnumber:  " + res[0].number + " status is " + res[0].incident_state + " and description : " + res[0].short_description }));
            });
            break;
			/**Getting ticket urgency from service now */
			 case "geturgencyofticket":
				response.setHeader('Content-Type', 'application/json');
				const fieldsarray = [
					'number',
					'urgency'             
				];
				const filtersarray = [
					'number=' + req.body.queryResult.parameters.ticketnumber
				];
            ServiceNow.getTableData(fieldsarray, filtersarray, 'incident', res => {
                console.log("data is here", res);
                var result = res[0].urgency;
                var data = result.split("-", -1);
                var urgencydata = data[1];
                console.log(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " urgeny is " +urgencydata }));
                response.send(JSON.stringify({ "fulfillmentText": "Ticketnumber: " + res[0].number + " urgeny is " +urgencydata }));
            });
            break;
			    break;
        /**Update ticket status in service now */
        case "updateservicenowticket":
            var status = (req.body.queryResult.parameters.ticket_status).toString();
		     var ticketnuber = (req.body.queryResult.parameters.ticket_number).toString();			  
            /**change status in first charater in uppercase */
            function toTitleCase(str) {
                return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            }
			
            var newstatus = toTitleCase(status);
				console.log("hii",newstatus)
            const updatedata = {
                'incident_state': newstatus
            };
            ServiceNow.UpdateTask('incident',ticketnuber,updatedata, res => {
                response.setHeader("Content-Type", "application/json");
				response.send(JSON.stringify({ "fulfillmentText": "Your ticket number: " + ticketnuber + " is updated successfully with status " + newstatus }));
			
            });
            break;
	
        }   
});
