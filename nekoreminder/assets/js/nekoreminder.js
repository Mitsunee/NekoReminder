// SETUP GLOBAL VARS
var neko = {
        'timers': [],
        'timerData': {}
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
            neko.ticker.time = 5000;
            neko.ticker.start();
        }
    });
    window.addEventListener('focus', function() {
        if (neko.ticker.time != 100) {
            let wasRunning = neko.ticker.running;
            if (wasRunning) neko.ticker.end();
            neko.ticker.time = 100;
            if (wasRunning) neko.ticker.start();
        }
    });

    //SORTABLE
    $("#timer-area").sortable({
        'containment': '#timer-area'
    });
}

// SUBMIT BUTTON FUNCTION
neko.submit = function() {
    let targetInput = tagsInputRead($("#reminder-number")[0]),
        target = 0,
        note = $("#reminder-note").val().replace('<', '&lt;').replace('>', '&gt;');

    if (targetInput.length < 1) return;// if empty quit;
    for(let i in targetInput) {
        if (/^([0-9]+)(h|hr|m|min|s|sec)$/g.test(targetInput[i])) {
            target += interval.prototype.convert(targetInput[i]);
        } else if (/^[0-9]+$/g.test(targetInput[i])) {
            target += interval.prototype.convert(targetInput[i]+"s");
        }
    }
    if (target == 0) return;
    target = 0| (target / 1000);// convert units to milliseconds and divide by 1000 rounding down.

    neko.createTimer(target, note);
}

neko.createTimer = function(target, note) {
    let newTimer = {},
        now = Date.now(),
        targetTime,
        el;

    // Set data
    targetTime = new Date(now + (target * 1000));
    newTimer.target = now + (target * 1000);
    newTimer.note = note || "Untitled Timer";
    newTimer.lastTick = now;
    newTimer.startedAt = now;
    newTimer.id = now.toString(16);
    newTimer.status = 'running';

    // Create UI
    el = $("<div>", {
        'id': newTimer.id,
        'class': 'timer'
    });
    // Close Button
    el.append($("<button>").html("X").on("click",function(){//Close function
        // find this timer in global array
        let thisTimer = neko.timerData[newTimer.id],
            thisTimerUI = $("#"+thisTimer.id);

        // if timer is running create confirmBox instead
        if (thisTimer.status == 'running') {
            if (thisTimerUI.find('.confirm-box').length > 0) return;

            // create confirmBox
            let confirmBox = $("<div>",{'class': 'confirm-box'});
            confirmBox.html('Do you really want to delete &quot;'+thisTimer.note+"&quot;?<br><br>")
                .append(
                    $("<button>").html("Yes").on("click", function(){
                        thisTimerUI.remove();
                        toastr["success"]("Removed Timer &quot;" + thisTimer.note + "&quot;","Removed Timer");
                        neko.timers.splice(neko.timers.indexOf(thisTimer.id), 1);
                    }.bind(thisTimer, thisTimerUI))
                )
                .append(
                    $("<button>").html("No").on("click", function(){
                        $(this).parent().remove();
                    })
                );
            thisTimerUI.append(confirmBox);
            return;
        }
        // remove timer
        thisTimerUI.remove();
        toastr["success"]("Removed Timer &quot;" + thisTimer.note + "&quot;","Removed Timer");
        neko.timers.splice(neko.timers.indexOf(newTimer.id), 1);
    }.bind(newTimer)));
    // Title
    el.append($("<h2>").html(newTimer.note));
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
            .html('Ends in <span>' + neko.timeFromMilliseconds(target*1000) + '</span> (at ' + targetTime.toLocaleTimeString() + ')')
    );

    // Submit timer
    $("#timer-area").append(el);
    neko.timers.push(newTimer.id);
    neko.timerData[newTimer.id] = newTimer;
    neko.ticker.start();
    toastr["success"]("Created Timer &quot;" + newTimer.note + "&quot;", "Created Timer");
}

// TICK FUNCTION
neko.tick = function() {
    if (neko.timers.length < 1) {
        neko.ticker.end();
        return;
    }
    for (let timerId of neko.timers) {
        let timer = neko.timerData[timerId];
        if (timer.status != "running") continue;
        let now = Date.now(),
            progress = ((now - timer.startedAt) / (timer.target - timer.startedAt)) * 100,
            progressBar = $("#"+timerId).find(".progress-value"),
            diff = now - timer.lastTick;

        timer.lastTick = now;
        // Update UI
        $("#"+timerId).find("span.small > span").html(neko.timeFromMilliseconds(timer.target - now));
        if (progress >= 100) {
            progressBar.css("width", "100%").html('100%').addClass("progress-finished");
            timer.status = "finished";
            new Notification('Your Timer "' + timer.note + '" ended!');
            toastr["info"]("Timer &quot;" + timer.note + "&quot; ended", "Timer ended");
            return;
        }
        progressBar.css("width", progress.toString()+"%").html((0|progress).toString()+"%");
    }
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