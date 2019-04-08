// SETUP GLOBAL VARS
var timerArea, reminderNumTemp, reminderNote, reminderSubmit,
    timers = [],
    userTimezone = "",
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
        //Notification.requestPermission();
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
    el.append($("<button>").html("X").on("click",function(){//Close function
        $("#"+newTimer.id).remove();
        let thisTimer = timers.findIndex(function(i){
            return i.id === newTimer.id;
        }.bind(newTimer));
        timers[thisTimer].status = "deleted";
    }.bind(newTimer)));
    el.append($("<h2>").html(newTimer.note));
    el.append($("<progress>", {
        'value': "0",
        'max': "100"
    }));
    el.append($("<span>",{
        'class': 'small'
    }).html('Ends at ' + targetTime.toLocaleTimeString()));
    timerArea.append(el);
    timers.push(newTimer);
}
// TICK FUNCTION
neko.tick = function() {
    if (timers.length < 1) return;
    for (timer of timers) {
        if (timer.status != "running") continue;
        let now = Date.now(),
            diff = now - timer.lastTick,
            progress = 0| (((now - timer.startedAt) / (timer.target - timer.startedAt)) * 100);

        timer.lastTick = now;
        if (progress > 100) progress = 100;

        if (now >= timer.target) {
            timer.status = "finished";
            new Notification("Your Timer "+timer.note+" ended!");
        }

        $("#"+timer.id).find("progress").prop("value", progress);
    }
}