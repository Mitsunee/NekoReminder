// SETUP GLOBAL VARS
var neko = {
    'data': {
        'timers': [],
        'settings': {}
    }
};

// RUN INIT ON LOAD
$(function(){neko.init();});

// INIT FUNCTION
neko.init = function() {
    $("#reminder-submit").on("click", neko.submit);

    //NOTIFICATIONS
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }

    // SETUP TICKER
    neko.ticker = new interval(neko.tick, 100);

    // WINDOW EVENTS
    window.addEventListener('blur', function() {
        if ($("#reminder-onblur-setting").prop('checked') && neko.ticker.running) {
            neko.ticker.end();
            neko.ticker.time = Number($("#reminder-blurmode-interval").val())*1000;
            neko.ticker.start();
        }
    });
    window.addEventListener('focus', function() {
        if (neko.ticker.time != 100) {
            neko.ticker.end();
            neko.ticker.time = 100;
            if (neko.data.timers.length > 0) neko.ticker.start();
        }
    });

    //LOCALSTORAGE
    neko.loadStorage();
}

// SUBMIT BUTTON FUNCTION
neko.submit = function() {
    let targetInput = tagsInputRead($("#reminder-number")[0]),
        target = 0,
        note = $("#reminder-note").val().replace('<', '&lt;').replace('>', '&gt;'),
        now = Date.now();

    // convert target to milliseconds
    if (targetInput.length < 1) return;// if empty quit;
    for(let i in targetInput) {
        if (/^([0-9]+)(h|hr|m|min|s|sec)$/g.test(targetInput[i])) {
            target += interval.prototype.convert(targetInput[i]);
        } else if (/^[0-9]+$/g.test(targetInput[i])) {
            target += interval.prototype.convert(targetInput[i]+"s");
        }
    }

    if (target == 0) return;
    target += now;

    neko.createTimer({target: target, note: note, startedAt: now});
    toastr["success"]("Created Timer &quot;" + (note || "Untitled Timer") + "&quot;", "Created Timer");
    neko.ticker.start();
}

neko.createTimer = function(newTimer) {
    let now = newTimer.startedAt,
        targetTime;

    // Set data
    targetTime = new Date(newTimer.target);
    if (newTimer.note === undefined || newTimer.note === "") newTimer.note = "Untitled Timer";
    if (newTimer.lastTick === undefined) newTimer.lastTick = now;
    if (newTimer.id === undefined) newTimer.id = now.toString(16);
    newTimer.status = 'running';

    // Create UI
    el = $("<div>", {
        'id': newTimer.id,
        'class': 'timer'
    });
    // Controls div
    let timerControls = $("<div>", {'class': 'timer-controls'});
    el.append($(timerControls));
    // Move Right Button
    timerControls.append($("<button>", {class: 'right'}).html(">").on("click", function(){
        let thisTimerUI = $(this).parent().parent();
        if (thisTimerUI.next().length == 0) return;
        thisTimerUI.insertAfter(thisTimerUI.next());
    }));
    // Close Button
    timerControls.append($("<button>", {'class': 'close'}).html("X").on("click",function(){//Close function
        // find this timer in global array
        let thisTimer = neko.data[newTimer.id],
            thisTimerUI = $("#"+thisTimer.id);

        // if timer is running create confirmBox instead
        if (thisTimer.status == 'running') {
            if (thisTimerUI.find('.confirm-box').length > 0) return;

            // create confirmBox
            let confirmBox = $("<div/>",{'class': 'confirm-box'});
            confirmBox.html('Do you really want to delete &quot;'+thisTimer.note+"&quot;?<br><br>")
                .append($("<button/>").html("Yes").on("click", function(){
                    neko.removeTimer($(this).parent().parent().attr("id"));
                }))
                .append($("<button/>").html("No").on("click", function(){
                    $(this).parent().remove();
                }));
            thisTimerUI.append(confirmBox);
            return;
        }
        // remove timer
        neko.removeTimer(thisTimer.id);
    }.bind(newTimer)));
    // Move Left Button
    timerControls.append($("<button>", {class: 'left'}).html("<").on("click", function(){
        let thisTimerUI = $(this).parent().parent();
        if (thisTimerUI.prev().length == 0) return;
        thisTimerUI.insertBefore(thisTimerUI.prev());
    }));
    /** Edit Title Button
    timerControls.append($("<button>", {class: 'edit'}).html("?").on("click", function(){
        let thisTimerUI = $(this).parent().parent();
        thisTimerUI.addClass("editing");
    }));**/
    // Title
    el.append($("<h2>", {'title': newTimer.note}).html(newTimer.note));
    // ProgressBar
    el.append(
        $("<div>", {'class': 'progress'})
            .append($("<div>", {'class': 'progress-value'})
                .css("width", "0%")
                .html("0%")
            )
    );
    // Text output
    el.append(
        $("<span>", {'class': 'small'})
            .html('Ends in <span>' + neko.timeFromMilliseconds(newTimer.target - newTimer.lastTick) + '</span> (at ' + targetTime.toLocaleTimeString() + ')')
    );

    // Submit timer
    $("#timer-area").append(el);
    neko.data.timers.push(newTimer.id);
    neko.data[newTimer.id] = newTimer;
    neko.updateStorage();
}

neko.removeTimer = function(timer) {
    let note = neko.data[timer].note;
    neko.data.timers.splice(neko.data.timers.indexOf(timer), 1);
    delete neko.data[timer];
    $("#"+timer).remove();
    toastr["success"]("Deleted Timer &quot;" + (note || "Untitled Timer") + "&quot;", "Deleted Timer");
    neko.updateStorage();
}

// TICK FUNCTION
neko.tick = function() {
    if (neko.data.timers.length < 1) {
        neko.ticker.end();
        return;
    }
    if (neko.data.timers.map(x => neko.data[x].status === "finished").every((x) => x === true)) {
        neko.ticker.end();
    }
    let timers = $("#timer-area").find(".timer"),
        timerIds = [];
    for (let timer of timers) {
        let timerData = neko.data[timer.id];
        timerIds.push(timer.id);
        if (timerData.status != "running") continue;
        let now = Date.now(),
            progress = ((now - timerData.startedAt) / (timerData.target - timerData.startedAt)) * 100,
            progressBar = $("#"+timer.id).find(".progress-value"),
            diff = now - timer.lastTick;

        neko.data[timer.id].lastTick = now;
        // Update UI
        $("#"+timer.id).find("span.small > span").html(neko.timeFromMilliseconds(timerData.target - now));
        if (progress >= 100) {
            progressBar.css("width", "100%").html('100%').addClass("progress-finished");
            timerData.status = "finished";
            new Notification('Your Timer "' + timerData.note + '" ended!');
            toastr["info"]("Timer &quot;" + timerData.note + "&quot; ended", "Timer ended");
            return;
        }
        progressBar.css("width", progress.toString()+"%").html((0|progress).toString()+"%");
    }
    neko.data.timers = timerIds;
    neko.updateStorage();
}

neko.timeFromMilliseconds = function(stamp) {
    let i = Math.ceil(Number(stamp)/1000),
        hasHours = false,
        retval = "";

    if (i < 0) i = 0;

    // Hours
    if (i >= 3600) {
        let hours = 0| (i/3600);
        i = i - (hours*3600);
        retval += (hours < 10 ? "0" : "") + hours.toString() +":";
        hasHours = true;
    }
    // Minutes
    if (hasHours || i >= 60) {
        let minutes = 0| (i/60);
        i = i - (minutes*60);
        retval += (minutes < 10 ? "0" : "") + minutes.toString() +":";
    } else {
        retval += "00:"
    }
    // Seconds
    retval += (i < 10 ? "0" : "") + i.toString();

    return retval;
}

neko.updateStorage = function(ev) {
    if ($("#reminder-allow-cookie")[0].checked) {
        neko.data.settings.cookieEnabled = "enabled";
        neko.data.settings.blurModeEnabled = ($("#reminder-onblur-setting").prop('checked') ? 'enabled' : 'disabled');
        neko.data.settings.blurModeInterval = Number($("#reminder-blurmode-interval").val());
        localStorage.setItem('nekoreminder', JSON.stringify(neko.data));
    } else {
        localStorage.removeItem('nekoreminder');
    }
}

neko.loadStorage = function() {
    let storage = localStorage.getItem('nekoreminder');
    if(storage === null) return false;

    storage = JSON.parse(storage);
    $("#reminder-allow-cookie").prop('checked', true);
    if (storage.settings.blurModeEnabled === "enabled") $("#reminder-onblur-setting").prop('checked', true);
    $("#reminder-blurmode-interval").val(storage.settings.blurModeInterval);
    let timerData = storage,
        timers = timerData.timers;

    for (let timer of timers) {
        let data = timerData[timer];
        neko.createTimer(data);
        toastr["success"]("Loaded Timer &quot;" + data.note + "&quot; from cookies.", "Loaded Timer");
    }

    if(timers.length > 0) neko.ticker.start();
}

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}