    const printRunDurations = require('./printRunDurations');
    //create the print plan
    exports.create = function(gangJobEventJSON){
        
        let gangJobEvent = gangJobEventJSON["gangJobEvent-Root"];
        let gangJob = gangJobEvent.gangJob;
        let performance = gangJob.mountedMedia.performance;
        
        let durations = printRunDurations.get(gangJob);
        let total = 0;
        durations.forEach(element => {
            total += element.total;
        });

        //let startDate = new Date();
        let startDateString = tools.msToDateString(gangJobEvent.startTime);
        let endDateString = tools.msToDateString(gangJobEvent.startTime + gangJobEvent.plannedDuration);
        var table = $('<table></table>');
        table.addClass('print-plan');
        var line1 = $('<tr></tr>');
        var line2 = $('<tr></tr>');
        var line3 = $('<tr></tr>');
        var line4 = $('<tr></tr>');
        table.append(line1).append(line2).append(line3).append(line4);

        //start pile
        var td = $('<td></td>');
        line1.append(td);
        td.attr("rowspan", "4");
        td.addClass("pile-container");

        var pileDiv = $('<div></div>');
        td.append(pileDiv);
        pileDiv.addClass("pile").addClass("left");

        var valueDiv = $('<div></div>');
        pileDiv.append(valueDiv);
        valueDiv.addClass("value");
        valueDiv.html(startDateString);

        var keyDiv = $('<div></div>');
        pileDiv.append(keyDiv);
        keyDiv.addClass("key");
        keyDiv.html("START");        

        var td = $('<td></td>');
        line1.append(td);
        td.attr("rowspan", "4");
        td.addClass("arrow-container");      
        
        var outerArrowDiv = $('<div></div>');
        td.append(outerArrowDiv);
        outerArrowDiv.addClass("arrow-right");    
        
        var innerArrowDiv = $('<div></div>');
        outerArrowDiv.append(innerArrowDiv);
        innerArrowDiv.addClass("arrow-right-inner");          

        var td = $('<td></td>');
        line1.append(td);
        td.attr("rowspan", "4");
        td.addClass("offset"); 
        td.html("&nbsp;");

        var td = $('<td></td>');
        line1.append(td);
        td.addClass("time"); 
        td.html("<div>0:00</div>");

        var index = 1;
        durations.forEach(printrun => {
            let setup = printrun.setup;
            let running = printrun.running;
            let createdPrintRun = false;
            if(setup.duration > 0){
                //line1
                var td = $('<td></td>');
                line1.append(td);
                td.addClass("time"); 
                td.html("<div>" + tools.durationInMSToString(setup.endsAfter) + "</div>");

                //line2
                var td = $('<td></td>');
                line2.append(td);
                td.addClass("step-left").addClass("line"); 
                td.html("RÜSTEN");

                //line4
                line4.append("<td>&nbsp;</td>");
            }

            if(running.duration > 0){
                 //line1
                 var td = $('<td></td>');
                 line1.append(td);
                 td.addClass("time"); 
                 td.html("<div>" + tools.durationInMSToString(running.endsAfter) + "</div>");
 
                 //line2
                 var td = $('<td></td>');
                 line2.append(td);
                 td.addClass("step-left").addClass("line"); 
                 td.html("GUT ("+ running.speed + " / Std).");
 
                 //line4
                 line4.append("<td>&nbsp;</td>");               
            }

            //line 3
            if(createdPrintRun == false){
                var td = $('<td></td>');
                line3.append(td);
                td.attr("colspan", "2");
                td.addClass("step-left").addClass("printrun"); 
                td.html(index + ". DRUCKLAUF");         
                createdPrintRun = true;         
            }

            index++;
        });

        //End pile, line1
        line1.find('td.last-child').addClass("offset"); 

        var td = $('<td></td>');
        line1.append(td);
        td.attr("rowspan", "4");
        td.addClass("arrow-container");      
        
        var outerArrowDiv = $('<div></div>');
        td.append(outerArrowDiv);
        outerArrowDiv.addClass("arrow-left");    
        
        var innerArrowDiv = $('<div></div>');
        outerArrowDiv.append(innerArrowDiv);
        innerArrowDiv.addClass("arrow-left-inner");        

        var td = $('<td></td>');
        line1.append(td);
        td.attr("rowspan", "4");
        td.addClass("pile-container");

        var pileDiv = $('<div></div>');
        td.append(pileDiv);
        pileDiv.addClass("pile").addClass("right");

        var valueDiv = $('<div></div>');
        pileDiv.append(valueDiv);
        valueDiv.addClass("value");
        valueDiv.html(endDateString);

        var keyDiv = $('<div></div>');
        pileDiv.append(keyDiv);
        keyDiv.addClass("key");
        keyDiv.html("ENDE");       
        
        line2.append('<td rowspan="2" class="step-left offset nopadding">&nbsp;</td>');
        //line3.append('<td>&nbsp;</td>');
        line4.append('<td class="offset">&nbsp;</td>');

        return table;
    }