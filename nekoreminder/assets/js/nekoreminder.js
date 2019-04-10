// SETUP GLOBAL VARS
var timerArea, reminderNumTemp, reminderNote, reminderSubmit,
    timers = [],
    neko = {};

// EXECUTE INIT
$(function(){
    neko.init();
});

// INIT FUNCTION
neko.init = function() {
    timerArea = $("#timer-area");
    reminderNumTemp = $("#temp-reminder-number");
    reminderNote = $("#reminder-note");
    reminderSubmit = $("#reminder-submit");

    reminderSubmit.on("click", neko.submit);

    //NOTIFICATIONS
    if (Notification.permission === "default") {
        Notification.requestPermission();
    }

    // SETUP TICKER
    neko.ticker = new interval(neko.tick, 100);
    neko.ticker.start();

    // WINDOW EVENTS
    window.addEventListener('blur', function() {
        if ($("#reminder-onblur-setting").prop('checked')) {
            neko.ticker.end();
            neko.ticker.time = 5000;
            neko.ticker.start();
        }
    });
    window.addEventListener('focus', function() {
        if (neko.ticker.time != 100) {
            neko.ticker.end();
            neko.ticker.time = 100;
            neko.ticker.start();
        }
    });
}
// SUBMIT BUTTON FUNCTION
neko.submit = function() {
    let newTimer = {},
        now = Date.now(),
        target = reminderNumTemp[0].valueAsNumber,
        targetTime = new Date(now + (target * 1000)),
        el;

    if (isNaN(target)) return;

    // Set data
    newTimer.target = now + (target * 1000);
    newTimer.note = reminderNote.val().replace('<', '&lt;').replace('>', '&gt;') || "Untitled Timer";
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
        let thisIndex = timers.findIndex(function(i){
                return i.id === newTimer.id;
            }.bind(newTimer)),
            thisTimer = timers[thisIndex],
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
                        timers[thisIndex].status = "deleted";
                    }.bind(thisIndex, thisTimerUI))
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
        timers[thisIndex].status = "deleted";
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
    timerArea.append(el);
    timers.push(newTimer);
}
// TICK FUNCTION
neko.tick = function() {
    if (timers.length < 1) return;
    for (timer of timers) {
        if (timer.status != "running") continue;
        let now = Date.now(),
            progress = ((now - timer.startedAt) / (timer.target - timer.startedAt)) * 100,
            progressBar = $("#"+timer.id).find(".progress-value"),
            diff = now - timer.lastTick;

        timer.lastTick = now;
        // Update UI
        if (progress >= 100) {
            progressBar.css("width", "100%").html('100%').addClass("progress-finished");
        } else {
            progressBar.css("width", progress.toString()+"%").html((0|progress).toString()+"%");
        }
        $("#"+timer.id).find("span.small > span").html(neko.timeFromMilliseconds(timer.target - now));

        if (now >= timer.target) {
            timer.status = "finished";
            new Notification("Your Timer "+timer.note+" ended!");
        }
    }
}

neko.timeFromMilliseconds = function(stamp) {
    let i = Math.ceil(Number(stamp)/1000),
        hasHours = false,
        retval = "";

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