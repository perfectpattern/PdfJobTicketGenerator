exports.Colors = function(gangJobEventJSON){

    let spotCount = 0;
    let spotMap = {};

    var mapSpotColors = function(spotColors){
        spotColors.forEach(spotColor => {
            if(!spotMap.hasOwnProperty(spotColor)){
                spotCount++;
                spotMap[spotColor] = "S" + spotCount;
            }
        });
    }

    var extractDefaultColors = function(colorsArray){
        var euroColors = ["cyan", "magenta", "yellow", "black"];
        var defaultColors = [];
        var spotColors = [];

        colorsArray.forEach(color => {
            if(euroColors.includes(color.toLowerCase())){
                defaultColors.push(color.toLowerCase());
            }else{
                spotColors.push(color);
            }
        });

        //sort default colors
        let sortedDefaultColors = [];
        euroColors.forEach(euroColor => {
            if(defaultColors.includes(euroColor)) sortedDefaultColors.push(euroColor);
        });
                      

        return {
            'defaultColors' : sortedDefaultColors,
            'spotColors' : spotColors
        }
    }

    var createSpotLegend = function(){
        let string = "";
        for(var spotColor in spotMap){
            string += spotMap[spotColor] + ": " + spotColor + ", "
        }
        if(string.length > 0) return "* " + string.slice(0, -2);
        return null;
    }

    var createColorString = function(colorsFront, colorsBack){

        var createStringForDefaultColors = function(colors){
            //can only get lower case colors
            let euroColors = {
                cyan : "C",
                magenta : "M",
                yellow : "Y",
                black : "K"
            };
            let string = "";
            colors.forEach(color => {
                string += euroColors[color];
            });
            return string;
        };

        var createStringForSpotColors = function(colors){
            let string = "";
            for(var mappedSpotColor in spotMap){
                colors.forEach(color => {
                    if(color == mappedSpotColor){
                        string += spotMap[mappedSpotColor] + ",";
                    }
                    
                });
            }
                
            if(string.length > 0) string = string.slice(0, -1);

            //handle wrong colors: add to string
            colors.forEach(color => {
                if(!spotMap.hasOwnProperty(color)) string += "UNKNOWNCOLOR";
            });
            return string;
        }

        let colorArraysFront = extractDefaultColors(colorsFront);
        //console.log(colorArraysFront);
        let colorArraysBack = extractDefaultColors(colorsBack);
        //console.log(colorArraysBack);

        var colorStringFront = "";
        colorStringFront += createStringForDefaultColors(colorArraysFront.defaultColors);
        if(colorArraysFront.spotColors.length > 0) colorStringFront += (colorStringFront.length > 0 ? "+" : "") + createStringForSpotColors(colorArraysFront.spotColors);
        if(colorStringFront.length == 0) colorStringFront = "-";

        var colorStringBack = "";
        colorStringBack += createStringForDefaultColors(colorArraysBack.defaultColors);
        if(colorArraysBack.spotColors.length > 0) colorStringBack += (colorStringBack.length > 0 ? "+" : "") + createStringForSpotColors(colorArraysBack.spotColors);
        if(colorStringBack.length == 0) colorStringBack = "-";

        if(colorArraysFront.spotColors.length > 0 || colorArraysBack.spotColors.length > 0) colorStringBack += " *";

        return colorStringFront + " / " + colorStringBack;
    }

    //---------CONSTRUCTOR---------
    let gangJob = gangJobEventJSON["gangJobEvent-Root"].gangJob;   
    let colorsFront = gangJob.form.frontPage.colors.color;
    let colorsBack = gangJob.form.backPage.colors.color;
    mapSpotColors(extractDefaultColors(colorsFront).spotColors);
    mapSpotColors(extractDefaultColors(colorsBack).spotColors);
  
    let formColorString = createColorString(colorsFront, colorsBack);
    let spotLegend = createSpotLegend();


    //--------INTERFACE----------
    this.getFormColorsString = function(){
        return formColorString;
    }

    this.getSpotLegend = function(){
        return spotLegend;
    }

    this.getColorString = function(colorsFront, colorsBack){
        return createColorString(colorsFront, colorsBack);
    }
}