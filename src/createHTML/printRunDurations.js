//calculates all print run durations
exports.get = function(gangJob){
    var durations = [];
    var cumulativeDuration = 0;

    let workStyleIsPaired;
    switch (gangJob.workStyle) {
        case 'PERFECTING':
        workStyleIsPaired = false;
        break;
        case 'SIMPLEX':
        workStyleIsPaired = false;
        break;
        case 'WORK_AND_BACK':
        workStyleIsPaired = false;
        break;
        case 'WORK_AND_TUMBLE':
        workStyleIsPaired = true;
        break;
        case 'WORK_AND_TURN':
        workStyleIsPaired = true;
        break;
        default:
        console.log("Error: No allowed workStyle found -> " + gangJob.workStyle);
    }
            
    let frontColorCount = gangJob.form.frontPage.colors.color.length;
    let backColorCount = gangJob.form.backPage.colors.color.length;
    let totalColorCount = frontColorCount + backColorCount;

    let lastState = null;
    
    //get setup for one print run (= one printDeviceState)
    var getSetupDurationPerPrintRun = function(printDeviceState, lastState, printingDeviceType, performance){
        let activeManualTurningUnitCount = 0;
        let activeManualTumblingUnitCount = 0; 

        let manualTurningUnitStateChangeCount = 0;
        let manualTumblingUnitStateChangeCount = 0;
        let automaticTurningUnitStateChangeCount = 0;
        let automaticTumblingUnitStateChangeCount = 0;

        printDeviceState.unitStates.unitState.forEach(deviceUnitState => {
            let thisUnitStateIndex = deviceUnitState.index;

            let lastUnitStateActivity = (lastState == null ? false : lastState.unitStates.unitState[thisUnitStateIndex].active);
            let activityChanged = lastUnitStateActivity == deviceUnitState.active;

            if(deviceUnitState['_type'] == "FlippingUnitState"){
                let deviceUnit = printingDeviceType.units.unit[thisUnitStateIndex]; //link deviceUnitState with deviceUnit

                if(deviceUnit.isManual){
                    switch (deviceUnit.flippingStyle) {
                        case 'TUMBLE':
                            if (deviceUnitState.active) {
                                activeManualTumblingUnitCount++;
                            }
                            if (activityChanged) {
                                manualTumblingUnitStateChangeCount++;
                            }
                            break;
                        
                        case 'TURN':
                            if (deviceUnitState.active) {
                                activeManualTurningUnitCount++;
                            }
                            if (activityChanged) {
                                manualTurningUnitStateChangeCount++;
                            }
                            break;
                        
                        default:
                            console.log("Error: Found not allowed flippingStyle " + deviceUnit.flippingStyle);
                    }                       
                }

                else{
                    switch (deviceUnit.flippingStyle) {
                        case 'TUMBLE':
                            if (activityChanged) {
                                automaticTumblingUnitStateChangeCount++;
                            }
                            break;
                        
                        case 'TURN':
                            if (activityChanged) {
                                automaticTurningUnitStateChangeCount++;
                            }
                            break;
                        
                        default:
                            console.log("Error: Found not allowed flippingStyle " + deviceUnit.flippingStyle);
                    }                       
                }
            }

            else if(deviceUnitState['_type'] == "PrintingUnitState"){
                //nothing to do here
            }

            else{
                console.log("Error: found not allowed unit state: " + unitStat['_type']);
            }

        });

        //Evaluation
        let setupDuration = 0;
        setupDuration += performance.prePrintRun.duration;
        setupDuration += (printDeviceState.index == 0 ? 0 : performance.interPrintRun.duration); //all except index 0
        setupDuration += (printDeviceState.index == 0 ? 0 : performance.postPrintRun.duration); //all except index 0
        setupDuration += performance.prePrintRun_changePrintingUnitState.duration * (workStyleIsPaired ? frontColorCount : totalColorCount);
        setupDuration += performance.prePrintRun_changeManualFlippingUnitState.duration * (manualTumblingUnitStateChangeCount + manualTurningUnitStateChangeCount);
        setupDuration += performance.prePrintRun_changeAutomaticFlippingUnitState.duration * (automaticTurningUnitStateChangeCount + automaticTumblingUnitStateChangeCount);
        setupDuration += performance.printRun_manualTurn.duration * activeManualTurningUnitCount;
        setupDuration += performance.printRun_manualTumble.duration * activeManualTumblingUnitCount;

        return setupDuration;
    }

    var getRunningDurationPerPrintRunPerSheet = function(printDeviceState, printingDeviceType, performance){
        let activeAutomaticTumblingUnitCount = 0;
        let activeAutomaticTurningUnitCount = 0;
        
        printDeviceState.unitStates.unitState.forEach(deviceUnitState => {
            let thisUnitStateIndex = deviceUnitState.index;
            if(deviceUnitState['_type'] == "FlippingUnitState"){
                let deviceUnit = printingDeviceType.units.unit[thisUnitStateIndex]; //link deviceUnitState with deviceUnit

                if(deviceUnit.isManual){
                    switch (deviceUnit.flippingStyle) {
                        case 'TUMBLE':
                            if (deviceUnitState.active) {
                                activeAutomaticTumblingUnitCount++;
                            }
                            break;
                        
                        case 'TURN':
                            if (deviceUnitState.active) {
                                activeAutomaticTurningUnitCount++;
                            }
                            break;
                        
                        default:
                            console.log("Error: Found not allowed flippingStyle " + deviceUnit.flippingStyle);
                    }                       
                }
            }

            else if(deviceUnitState['_type'] == "PrintingUnitState"){
                //nothing to do here
            }

            else{
                console.log("Error: found not allowed unit state: " + unitStat['_type']);
            }                
        });

        runDurationPerUnit = 0;
        runDurationPerUnit += performance.gangJob_perSheet.duration;
        runDurationPerUnit += performance.printRun_perSheet.duration;
        runDurationPerUnit += performance.printRun_perColor.duration * totalColorCount;
        runDurationPerUnit += performance.printRun_automaticTurnPerSheet.duration * activeAutomaticTurningUnitCount;
        runDurationPerUnit += performance.printRun_automaticTumblePerSheet.duration * activeAutomaticTumblingUnitCount;
        return runDurationPerUnit;
    }

    gangJob.printDeviceStates.printDeviceState.forEach(printDeviceState => {
        
        let printrun = {};

        let setupDuration = getSetupDurationPerPrintRun(
            printDeviceState, 
            lastState, 
            gangJob.printingDeviceType, 
            gangJob.mountedMedia.performance
        );

        cumulativeDuration += setupDuration;

        printrun['setup'] = {
            'type' : 'setup',
            'duration' : setupDuration,
            'endsAfter' : cumulativeDuration
        };

        let runningDuration = getRunningDurationPerPrintRunPerSheet(
            printDeviceState,
            gangJob.printingDeviceType,
            gangJob.mountedMedia.performance,
            gangJob.quantity
        );

        cumulativeDuration += runningDuration * gangJob.quantity;
        var speed = tools.thousandSep(Math.round(1/runningDuration * 1000 * 3600));

        printrun['running'] = {
            'type' : 'running',
            'duration' : runningDuration * gangJob.quantity,
            'endsAfter' : cumulativeDuration,
            'speed' : speed
        };

        printrun['total'] = printrun.setup.duration + printrun.running.duration;

        durations.push(printrun);

        lastState = printDeviceState;
    });        
    return durations;
}