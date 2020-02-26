//this class is handling bindery signatures/products
//See its interface at the end of the class
exports.Products = function(gangJobEventJSON, colors){
    let gangJobEvent = gangJobEventJSON["gangJobEvent-Root"];
    let gangJob = gangJobEvent.gangJob;    
    let products = {};

    let bindSigsArr = gangJob.binderySignatures.binderySignature;

    let getUps = function(id, includeClonezone){
        let count = 0;
        gangJob.form.placementZone.binderySignaturePlacements.binderySignaturePlacement.forEach(placement => {
            if(placement.binderySignatureRef.id == id) count++;
        });
        if(includeClonezone && includeClonezone == true){
            if(gangJob.form.cloneZones.cloneZone[0]){
                gangJob.form.cloneZones.cloneZone[0].binderySignaturePlacements.binderySignaturePlacement.forEach(placement => {
                    if(placement.binderySignatureRef.id == id) count++;
                });
            }
        }
        return count;
    }

    let getOverage = function(bindSig){
        let ups = getUps(bindSig.id, true);
        let producedQuantity = gangJob.quantity * ups;
        let overage = producedQuantity - bindSig.mustDemand;
        return overage;
    }

    //---------CONSTRUCTOR---------
    let index = 1;
    let formDuedate = bindSigsArr[0].latestEndTime;

    let sortedBindSigsArr = bindSigsArr.sort(tools.sort_by('id', false));
    sortedBindSigsArr.forEach(bindSig => {
        let colorsFront = [];
        bindSig.frontPage.colorUses.colorUse.forEach(colorEl => {
            colorsFront.push(colorEl.color);
        });

        let colorsBack = [];
        bindSig.backPage.colorUses.colorUse.forEach(colorEl => {
            colorsBack.push(colorEl.color);
        });      

        //get latest duedate of bindSigs to be duedate of form
        if(bindSig.latestEndTime < formDuedate) formDuedate = bindSig.latestEndTime;

        products[bindSig.id] = {
            'index' : index,
            'id'    : bindSig.id,
            'label' : bindSig.label,
            'color' : colors.getColorString(colorsFront, colorsBack),
            'quantity' : tools.thousandSep(bindSig.mustDemand),
            'overage' : tools.thousandSep(getOverage(bindSig)),
            'ups' : getUps(bindSig.id),
            'format' : bindSig.trimFormat.width/1000 + " x " + bindSig.trimFormat.height/1000,
            'priority' : bindSig.priority
        };
        index++;
    });
    
    //----------INTERFACE----------
    this.getBinderySignatureNumber = function(id){
        return products[id].index;
    }

    this.getNumberOfBindSigs = function(){
        var keys = [];
        for(var k in products) keys.push(k);
        return keys.length;
    }

    this.getProductsTableData = function(offsetIn){
        let offset = offsetIn || 0;
        var data = [];
        data.push(["Nr.", "Id", "Bezeichnung", "Farben", "Bestellmenge", "Überschuss", "BxH [mm]", "Priorität", "Nutzen"]);
        
        let sortedProducts = tools.jsonToArraySortedByValue(products, 'index', false);

        let index = 0;
        sortedProducts.forEach(product => {
            if(index >= offset){
                data.push([
                    product.index,
                    product.id,
                    product.label,
                    product.color,
                    product.quantity,
                    product.overage,
                    product.format,
                    product.priority,
                    product.ups
                ]); 
            } 
            index++;
        });

        //testing
        for(var i = 0; i < 0; i++){
            data.push([
                "X",
                "id",
                "label",
                "color",
                "quantity",
                "overage",
                "format",
                "priority",
                "ups"
            ]); 
        }
        return data;
    }

    this.getFormDuedate = function(){
        return formDuedate;
    }
}