//create the print form preview
exports.create = function(gangJobEventJSON, width, height, products){
    
    var draw = function(){

        //original sheet format of the form
        let formWidth = config.media.format.width;
        let formHeight = config.media.format.height;

        config.unit = config.multiplier * Math.min((height-2) / formHeight, (width-2) / formWidth);
        config.sheetElement = $('<div></div>');
        config.sheetElement.addClass("sheet");
        config.sheetElement.css({
            "width" : Math.floor(formWidth * config.unit + 2) + 'px',
            "height": Math.floor(formHeight * config.unit + 2) + 'px'
        });

        formViewParent.append(config.sheetElement);   
        
        drawMountedMediaRectangles(config.mountedMedia.placementZone.startConstraintRectangles.startConstraintRectangle, drawStartConstraintRectangle);
        drawMountedMediaRectangles(config.mountedMedia.placementZone.templateRectangles.templateRectangle, drawTemplateRectangle);
        
        config.form.placementZone.binderySignaturePlacements.binderySignaturePlacement.forEach(function(placement){
            drawBinderySignaturePlacement(placement);
        });

        config.form.placementZone.reservedSpacePlacements.reservedSpacePlacement.forEach(function(placement){
            drawReservedSpacePlacement(placement);
        });
        
        config.form.cloneZones.cloneZone.forEach(function(cloneZone){
            cloneZone.binderySignaturePlacements.binderySignaturePlacement.forEach(function(placement){
                drawBinderySignaturePlacement(placement);
            });

            cloneZone.reservedSpacePlacements.reservedSpacePlacement.forEach(function(placement){
                drawReservedSpacePlacement(placement);
            });
        });         
    };

    var convertToPixels = function(value) {
        return Math.round(value * config.unit);
    };

    var convertToPixelsWithoutBorder = function(value, border) {
        var result = Math.round(value * config.unit - border);
        return result > 0 ? result : 0;
    };

    var drawRectangle = function(rectangleSpecs, cls, el) {
        el = el || config.sheetElement;

        let left = convertToPixels(rectangleSpecs.offset.x);
        let bottom = convertToPixels(rectangleSpecs.offset.y);

        let rectangle = $('<div></div>');
        rectangle.addClass(cls);
        rectangle.css({
            "left"  : left + 'px',
            "bottom": bottom + 'px',
            "width" : convertToPixels(rectangleSpecs.offset.x + rectangleSpecs.format.width) - left + 'px',
            "height": convertToPixels(rectangleSpecs.format.height + rectangleSpecs.offset.y) - bottom + 'px'
        });

        el.append(rectangle);
        return rectangle;
    };
    
    var drawBinderySignaturePlacement = function(placement) {
        let bleedFormat = getBleedFormat(placement);
        let bleedOffset = getBleedOffset(placement);
        let placementRectangle = {
            format : bleedFormat,
            offset : bleedOffset
        };

        let el = drawRectangle(placementRectangle, 'binderySignaturePlacement');
        el.addClass(config.rotationClasses[placement.rotation]);

        let format = placement.format;
        let bleed = placement.bleed;
        let trim = placement.trim

        el.css({
            'clip' : 'rect(' + convertToPixels(bleed.top - trim.top) + 'px, ' + convertToPixels(bleed.left + format.width + trim.right) + 'px, ' + convertToPixels(bleed.top + format.height + trim.bottom) + 'px, ' + convertToPixels(bleed.left - trim.left) + 'px)'
        });

        let bs = config.binderySignatures.find(function(bs) {
            return (bs.id ==  placement.binderySignatureRef.id);
        });

        let bsBleedFormat = getBSBleedFormat(bs); 
        let bsBleed = bs.bleed;

        let printDataPage = !placement.flipped ? placement.selectedPrintData.frontPage : placement.selectedPrintData.backPage;

        let bsEl = $('<div></div>');
        bsEl.addClass('binderySignature');
        bsEl.css({
            'width' : convertToPixelsWithoutBorder(bsBleedFormat.width,2)+ 'px',
            'height' : convertToPixelsWithoutBorder(bsBleedFormat.height, 2)+ 'px'
        });
        el.append(bsEl);

        //THUMBNAIL
        let image = printDataPage.jpgImage;
        if (image || 0 !== image.length) {
            let parseRotationAngle = (rotation) => {
                if (rotation == "ZERO") {
                    return 0;
                }
                let angle = /CC(\d*)+(_FLIP)*/.exec(rotation);
                if (angle) {
                    return parseInt(angle[1]);
                } else
                    return 0;
            };
    
            let imageRotationAngle = parseRotationAngle(printDataPage.jpgRotation);
    
            let imgEl = $('<div></div>');
            imgEl.addClass('thumbnail ' + config.rotationClasses[printDataPage.jpgRotation]);
            imgEl.css({
                'backgroundImage' : 'url("data:image/jpeg;base64,' + image + '")',
                'width' : ((imageRotationAngle / 90) % 2 == 0 ? bsEl.width() : bsEl.height()) + 'px',
                'height' : ((imageRotationAngle / 90) % 2 == 0 ? bsEl.height() : bsEl.width()) + 'px'
            });
            bsEl.append(imgEl);
        }

        let bsTrimFormatEl = $('<div></div>');
        bsTrimFormatEl.addClass('binderySignatureTrimFormat');
        bsTrimFormatEl.css({
            'top' : convertToPixels(bsBleed.top) + 'px',
            'right' : convertToPixels(bsBleed.right) + 'px',
            'bottom' : convertToPixels(bsBleed.bottom) + 'px',
            'left' : convertToPixels(bsBleed.left) + 'px'
        });
        bsEl.append(bsTrimFormatEl);
        
        //addRotMarkThicknessClass
        let bsTrimFormatElRotMark = $('<div></div>');
        bsTrimFormatElRotMark.addClass('rotationMarker');
        bsTrimFormatEl.append(bsTrimFormatElRotMark);
        
        var rotated = ['CC90', 'CC270', 'CC90_FLIP', 'CC270_FLIP'];
        var realHeight = Math.round((rotated.includes(placement.rotation) ? placement.format.width : placement.format.height) * config.unit);
        var realWidth = Math.round((rotated.includes(placement.rotation) ? placement.format.height : placement.format.width) * config.unit);

        var ready = false;
        config.rotationMarkerThicknessThresholds.forEach(function(t) {
            if(realHeight <= t[0] && !ready){
                bsTrimFormatElRotMark.css("height", t[1] + "px");
                ready = true;
            }
        });
        if(!ready) bsTrimFormatElRotMark.css("height", config.rotationMarkerThicknessThresholds[config.rotationMarkerThicknessThresholds.length - 1][1] + "px");

        let bsTrimFormatElLabelingWrapper= $('<div></div>');
        bsTrimFormatElLabelingWrapper.addClass("labelingWrapper");
        bsTrimFormatEl.append(bsTrimFormatElLabelingWrapper);

        let bsTrimFormatElNumber= $('<div></div>');
        bsTrimFormatElNumber.addClass('number');
        bsTrimFormatElNumber.html('' + products.getBinderySignatureNumber(placement.binderySignatureRef.id));
        bsTrimFormatElLabelingWrapper.append(bsTrimFormatElNumber);

        let bsTrimFormatElId= $('<div></div>');
        bsTrimFormatElId.addClass('id');
        bsTrimFormatElId.html("[" + placement.binderySignatureRef.id + "]");
        if(realWidth > 40) bsTrimFormatElLabelingWrapper.append(bsTrimFormatElId);
        
        let fontSize = 0;
        var ready = false;
        config.labelFontSizeThresholds.forEach(function(t) {
            if(realHeight <= t[0] && !ready){
                fontSize = t[1];
                ready = true;
            }
        });
        if(!ready) fontSize = config.labelFontSizeThresholds[config.labelFontSizeThresholds.length - 1][1];            

        bsTrimFormatElNumber.css({ 'fontSize' : fontSize + 'px'  });
        bsTrimFormatElId.css({ 'fontSize' : (fontSize - 2) + 'px' });

        let bsTrimFormatElBottomRightMarker = $('<div></div>');
        bsTrimFormatElBottomRightMarker.addClass('bottomRightMarker');
        bsTrimFormatEl.append(bsTrimFormatElBottomRightMarker);
            

        let bottomRightMarkerSize = 0;
        var ready = false;
        config.bottomRightMarkerSizeThresholds.forEach(function(t) {
            if(realHeight <= t[0] && !ready){
                bottomRightMarkerSize = t[1];
                ready = true;
            }
        });
        if(!ready) bottomRightMarkerSize = config.bottomRightMarkerSizeThresholds[config.bottomRightMarkerSizeThresholds.length - 1][1];

        bsTrimFormatElBottomRightMarker.css({
            'width' : bottomRightMarkerSize + "px",
            'height' : bottomRightMarkerSize + "px",
        });  

        let placementArray = config.binderySignaturePlacements[placement.binderySignatureRef.id] = config.binderySignaturePlacements[placement.binderySignatureRef.id] || [];
        placementArray.push(el);

        bs.requirementConstraintRectangles.requirementConstraintRectangle.forEach(function(requirementConstraintRectangle){
            drawRectangle(requirementConstraintRectangle, 'requirementConstraintRectangle', bsTrimFormatEl);
        });

        bs.overlappingConstraintRectangles.overlappingConstraintRectangle.forEach(function(overlappingConstraintRectangle){
            drawRectangle(overlappingConstraintRectangle, 'overlappingConstraintRectangle', bsTrimFormatEl);
        });
    };    

    var drawReservedSpacePlacement = function(placement) {
        drawRectangle(placement, 'reservedSpacePlacement');
    };

    var drawStartConstraintRectangle = function(rectangle) {
        drawRectangle(rectangle, 'startConstraintRectangle ' + rectangle._type);
    };

    var drawTemplateRectangle = function(rectangle) {
        drawRectangle(rectangle, 'templateRectangle');
    }; 

    var drawMountedMediaRectangles = function(rectangles, drawRectangleFn) {

        let formWidth = config.media.format.width;
        let formHeight = config.media.format.height;

        rectangles.forEach(function(rectangle){
            drawRectangleFn(rectangle);

            let cloneGeometry = config.mountedMedia.cloneGeometry;
            let cloneZones = cloneGeometry.cloneZones;
            let direction = cloneGeometry.direction;
            let zoneWidth = direction == 'X' ? formWidth / (cloneZones.length + 1) : formWidth;
            let zoneHeight = direction == 'Y' ? formHeight / (cloneZones.length + 1) : formHeight;    


            cloneZones.forEach(function(cloneZone){
                let copiedRectangle = rectangle.clone();
                if (direction == 'X') {
                    copiedRectangle.offset = {
                        x : cloneZone.transformation != 'FLIP_Y' ? (1 + index) * zoneWidth + rectangle.offset.x : (2 + index) * zoneWidth - rectangle.offset.x - rectangle.format.width,
                        y : cloneZone.transformation != 'FLIP_X' ? rectangle.offset.y : zoneHeight - rectangle.offset.y - rectangle.format.height
                    };
                } else if (direction == 'Y') {
                    copiedRectangle.offset = {
                        x : cloneZone.transformation != 'FLIP_Y' ? rectangle.offset.x : zoneWidth - rectangle.offset.x - rectangle.format.width,
                        y : cloneZone.transformation != 'FLIP_X' ? (1 + index) * zoneHeight + rectangle.offset.y : (2 + index) * zoneHeight - rectangle.offset.y - rectangle.format.height
                    };
                }

                drawRectangleFn(copiedRectangle);                    
            });
        });
    };

    var getBleedFormat = function(bsp) {
        let format = bsp.format;
        let bleed = bsp.bleed;
        return {
            width : format.width + bleed.left + bleed.right,
            height : format.height + bleed.top + bleed.bottom
        }
    };

    var getBSBleedFormat = function(bs) {
        let format = bs.trimFormat;
        let bleed = bs.bleed;
        return {
            width : format.width + bleed.left + bleed.right,
            height : format.height + bleed.top + bleed.bottom
        }
    };

    var getBleedOffset = function(bsp) {
        let offset = bsp.offset;
        let bleed = bsp.bleed;
        return {
            x : offset.x - bleed.left,
            y : offset.y - bleed.bottom
        }
    };      

    //-----------------INIT---------------
    var formViewParent = $('<div></div>');
    formViewParent.addClass('schedule_gangJobInfo_FormViewer');
    formViewParent.css({
        "width": width + "px",
        "height": height + "px"
    });

    let gangJob = gangJobEventJSON["gangJobEvent-Root"].gangJob;

    var config = {
        unit : 1,
        multiplier : 1,
        form : gangJob.form,
        media : gangJob.media,
        mountedMedia : gangJob.mountedMedia,
        binderySignatures : gangJob.binderySignatures.binderySignature,
        binderySignaturePlacements : {},
        placementBorder : 1,
        rotationClasses : {
            ZERO : 'rotation_zero',
            CC90 : 'rotation_cc90',
            CC180 : 'rotation_cc180',
            CC270 : 'rotation_cc270',
            ZERO_FLIP : 'rotation_zero rotation_flip',
            CC90_FLIP : 'rotation_cc90 rotation_flip',
            CC180_FLIP : 'rotation_cc180 rotation_flip',
            CC270_FLIP : 'rotation_cc270 rotation_flip'
        },
        maxLabelFontSize : 15,
        sheetElement: undefined,
        rotationMarkerThicknessThresholds : [
            [50, '5'], //[up to height in px, height of rotMarker in px]
            [150, '7'],
            [200, '9'] //last value is taken if bigger
        ],
        bottomRightMarkerSizeThresholds : [
            [50, '10'], 
            [150, '20']
        ],
        labelFontSizeThresholds : [
            [50, '10'],
            [100, '12'], 
            [150, '15']
        ]                         
    };            

    draw();
    return formViewParent;
};