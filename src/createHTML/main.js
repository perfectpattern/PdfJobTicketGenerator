const page_ = require('./Page');
const colors_ = require('./Colors');
const products_ = require('./Products');
const printPlan = require('./printPlan');
const preview = require('./preview');
const createHTML = require('create-html');
const fs = require('fs');
global.tools = require('./tools').get();

//create a generic data table for "data" input
var createDataTable = function(data){
    var table = $('<table></table>');
    table.addClass("table-data");
    data.forEach(row => {
        var tr = $('<tr></tr>');
        table.append(tr);

        row.forEach(element => {
            var td = $('<td></td>');
            td.html(element);
            tr.append(td);
        });
    });
    return table;
}

//create specific data table: print data
var createTablePrintData = function(gangJobEventJSON, colorsString){
    let gangJobEvent = gangJobEventJSON["gangJobEvent-Root"];
    let gangJob = gangJobEvent.gangJob;        
    var data = [];
    data.push(["Maschine", "Druckart", "Farben", "Dauer"]);
    
    data.push([
        gangJob.printingDevice.label,
        gangJob.workStyle,
        colorsString,
        tools.durationInMSToString(gangJobEvent.plannedDuration)
    ]);
    return data;
}

exports.getHTML = function(gangJobEventJSON){
    return new Promise(function(resolve, reject){

        //Read files
        fs.readFile("./src/createHTML/css/main.css", "utf8", function(err, stylesString) {

            if(err){
                console.log(err);
                reject();
            }
    
            tools.getTimeStamp();
            //create new page, colors, products
            const page = new page_.Page();
            const colors = new colors_.Colors(gangJobEventJSON);
            const products = new products_.Products(gangJobEventJSON, colors);

            //set page content
            page.setTitle("Druckjob 2019-" + gangJobEventJSON["gangJobEvent-Root"].label);
            page.setSubTitle("[id: " + gangJobEventJSON["gangJobEvent-Root"].id + "]");
            page.setTablePrint(createDataTable(createTablePrintData(gangJobEventJSON, colors.getFormColorsString())));
            page.setTablePrintLegend(colors.getSpotLegend());
            page.setPrintPlan(printPlan.create(gangJobEventJSON));
            page.addTopRightPile("Termin", tools.msToDateString(products.getFormDuedate()), "duedate");
            page.addTopRightPile("Auflage", tools.thousandSep(gangJobEventJSON["gangJobEvent-Root"].gangJob.quantity));
            page.setPreview(preview.create(gangJobEventJSON, 500, 300, products));
            page.setPaperType(gangJobEventJSON["gangJobEvent-Root"].gangJob.media.label);
            page.setTableProducts(createDataTable(products.getProductsTableData()));

            html = createHTML({
                title: 'Laufzettel',
                lang: 'de',
                head: '<meta name="description" content="example"><style>' + stylesString + '</style>',
                body: page.getPage()[0].outerHTML,
            })
    
          resolve(html);
        })
    })
}