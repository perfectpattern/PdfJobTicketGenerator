//some useful functions
exports.get = function(){
    return {
        msToDateString : function(ms){
            var dates = {
                1 : "Jan",
                2 : "Feb",
                3 : "Mär",
                4 : "Apr",
                5 : "Mai",
                6 : "Jun",
                7 : "Jul",
                8 : "Aug",
                9 : "Sep",
                10 : "Okt",
                11 : "Nov",
                12 : "Dez"
            }
            if(ms >= 9007199254740991) return "nodate";
            var d = new Date(ms);
            var dateString = tools.twoDigits(d.getDate()) + "." + dates[d.getMonth() + 1] + " " + tools.twoDigits(d.getHours())  + ":" + tools.twoDigits(d.getMinutes());            
            return dateString;
        },

        durationInMSToString : function(duration){
            let durInMinutes = duration / 1000 / 60;
            let remainderInMinutes = Math.round(durInMinutes % 60) > 9 ? Math.round(durInMinutes % 60) : "0" + Math.round(durInMinutes % 60);
            let durationString = Math.floor(durInMinutes / 60) + ":" + remainderInMinutes;
            return durationString;
        },

        twoDigits : function(number){
            if(number.toString().length == 1) return "0" + number.toString();
            return number.toString();
        },

        thousandSep : function(number){
            return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        },

        getTimeStamp : function(){
            var d = new Date();
            var dateString = tools.twoDigits(d.getDate()) + "." + (tools.twoDigits(d.getMonth() + 1)) + "." + d.getFullYear() + " " + tools.twoDigits(d.getHours()) + ":" + tools.twoDigits(d.getMinutes()) + " Uhr";            
            return dateString;
        },

        sort_by : function(field, reverse, primer){
            var key = primer ? 
                function(x) {return primer(x[field])} : 
                function(x) {return x[field]};
            
            reverse = !reverse ? 1 : -1;
            
            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                } 
        },

        jsonToArraySortedByValue : function(json, field, reverse, primer){
            var arr = [];
            for(var key in json){
                arr.push(json[key]);
            }
            return arr.sort(tools.sort_by(field, reverse, primer));
        }
    }
}