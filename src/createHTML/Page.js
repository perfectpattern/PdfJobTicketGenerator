const logoData = require('./resources/logo').get();

//this class is building the page itself offering 
//an interface to insert content (see end)
exports.Page = function(){
    var page = $('<div></div>');
    page.attr("id","page");
    
    var title = $('<p></p>');
    title.addClass("title");
    page.append(title);

    var subTitle = $('<p></p>');
    subTitle.addClass("subtitle");
    page.append(subTitle); 
    
    var pilesWrapper = $('<div></div>');
    page.append(pilesWrapper);
    pilesWrapper.addClass("top-right-piles-wrapper");
    page.append(pilesWrapper);   

    var chapter = $('<div></div>');
    chapter.addClass("chapter");
    page.append(chapter);
    chapter.html("DRUCKPLAN");       

    var tableWrapperPrint = $('<div></div>');
    tableWrapperPrint.addClass("tableWrapper");
    page.append(tableWrapperPrint);        

    var tablePrintLegend = $('<div></div>');
    tablePrintLegend.addClass("table-legend");
    page.append(tablePrintLegend);

    page.append($('<br>'));
    
    var printPlanWrapper = $('<div></div>');
    printPlanWrapper.addClass('printPlanWrapper');
    page.append(printPlanWrapper);

    var chapter = $('<div></div>');
    chapter.addClass("chapter");
    page.append(chapter);
    chapter.html("DRUCKBOGEN");    

    var previewWrapper = $('<div></div>');
    previewWrapper.addClass("previewWrapper");
    page.append(previewWrapper);

    var paperType = $('<div></div>');
    paperType.addClass('paperType-wrapper');
    page.append(paperType);

    var chapter = $('<div></div>');
    chapter.addClass("chapter");
    page.append(chapter);
    chapter.html("PRODUKTE");    

    var tableWrapperProducts = $('<div></div>');
    tableWrapperProducts.addClass("tableWrapper").addClass("products");
    page.append(tableWrapperProducts);      

    
    //-----------INTERFACE-------------
    this.getPage = function(){
        return page;
    }

    this.setTitle = function(text){
        title.html(text);
        return;
    }

    this.setSubTitle = function(text){
        subTitle.html(text);
        return;
    }        

    this.setTablePrint = function(table){
        tableWrapperPrint.append(table);
    }

    this.setTableProducts = function(table){
        tableWrapperProducts.append(table);
    }        

    this.setTablePrintLegend = function(text){
        tablePrintLegend.html(text);
    }

    this.addTopRightPile = function(keyText, valueText, styleClass){
        var pile = $('<div></div>');
        pilesWrapper.append(pile);
        pile.addClass("pile").addClass("top-right")
        if(styleClass) pile.addClass(styleClass);

        var value = $('<div></div>');
        pile.append(value);
        value.addClass("value");
        value.html(valueText);

        var key = $('<div></div>');
        pile.append(key);
        key.addClass("key");
        key.html(keyText);
    }
    
    this.setPreview = function(preview){
        //previewWrapper.empty();
        previewWrapper.append(preview);
    }

    this.setPrintPlan = function(printplan){
        printPlanWrapper.append(printplan);
    }

    this.setPaperType = function(text){
        paperType.html(text);
    }  

    this.getHeight = function(){
        return page.height();
    }

    this.getTableWrapperProducts = function(){
        return tableWrapperProducts;
    }

    this.addFooter = function(pagenumber, left, centered, right){
        var footer = $('<div></div>');
        footer.addClass("footer").addClass("page" + pagenumber);
        page.append(footer);
        footer.append(left).append(centered).append(right);
    }
}

//handling finishing the page: page breaks, logo.
var finishPage = function(page, products){
    if(page.getPage().height() <= pageSize.height){
        var logo = $('<img alt="created by sPrint One" class="logo centered">');
        logo.attr("src", logoData);
        page.addFooter(
            1,
            $('<div class="left">Druckjob erstellt am ' + tools.getTimeStamp() + '</div>'),
            logo,
            $('<div class="right">Seite 1 von 1</div>')
        ); 
    }

    else{
        let i = 0;
        let tableWrapperProducts = page.getTableWrapperProducts();
        while(page.getHeight() > pageSize.height){
            tableWrapperProducts.find('table tr:last-child').remove();
            i++;
            if(i > 500 ) break; //just to not run into infinity
        }
        tableWrapperProducts.find('table tr:last-child').remove();
        tableWrapperProducts.append("...");
        let removedRows = i + 1;
        var logo1 = $('<img alt="created by sPrint One" class="logo centered">');
        logo1.attr("src", logoData);
        var logo2 = $('<img alt="created by sPrint One" class="logo centered">');
        logo2.attr("src", logoData);

        page.addFooter(
            1,
            $('<div class="left">Druckjob erstellt am ' + tools.getTimeStamp() + '</div>'),
            logo1,
            $('<div class="right">Seite 1 von 2</div>')
        ); 

        page.getPage().css('height', (2*pageSize.height) + "px");
        page.addFooter(
            2,
            $('<div class="left">Druckjob erstellt am ' + tools.getTimeStamp() + '</div>'),
            logo2,
            $('<div class="right">Seite 2 von 2</div>')
        ); 

        var chapter2 = $('<div></div>');
        chapter2.addClass("chapter");
        page.getPage().append(chapter2);
        chapter2.html("PRODUKTE");    

        var tableWrapperProducts2 = $('<div></div>');
        tableWrapperProducts2.addClass("tableWrapper").addClass("products");
        page.getPage().append(tableWrapperProducts2);  

        let offset = products.getNumberOfBindSigs() - removedRows;
        tableWrapperProducts2.append(createDataTable(products.getProductsTableData(offset)));
    }
}