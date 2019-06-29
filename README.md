# Neko Reminder
![version](https://img.shields.io/badge/stable--release-1.4.1-green.svg) [![Link](https://img.shields.io/badge/https://-www.mitsunee.com-555555.svg?colorA=55DD88)](https://www.mitsunee.com/nekoreminder) ![GitHub repo size](https://img.shields.io/github/repo-size/Mitsunee/NekoReminder.svg) ![GitHub issues](https://img.shields.io/github/issues-raw/Mitsunee/NekoReminder.svg)

The most(ly) accurate browser-based Reminder tool built on custom time-keeping code.

# Contents

- [Usage](#usage)
- [NekoReminderApp](#app)
- [Built using](#built-using)

<a name="usage"></a>
# Usage
## Creating a reminder
To make a reminder simply input your timer length in units seperated by spaces or comma into the “Remind in” field. The following units are supported:
- Hours: h, hr
- Minutes: m, min
- Seconds: s, sec

Unsupported units will be ignored, numbers without units will be assumed to be seconds.
You can give your reminder a title in the “Note” field.

![New Reminder](https://raw.githubusercontent.com/Mitsunee/NekoReminder/master/.guide_images/guide_new_reminder.png)

## (Re)moving a reminder
If you hover a reminder with your mouse cursor three buttons will appear.

![hover buttons](https://raw.githubusercontent.com/Mitsunee/NekoReminder/master/.guide_images/guide_hover_butons.png)

These allow you to change the order of timers as well as delete a timer. Should a timer still be running a prompt will appear asking if you really want to delete the timer.

![deletion prompt](https://raw.githubusercontent.com/Mitsunee/NekoReminder/master/.guide_images/guide_deletion_prompt.png)

## Settings
Pressing the Settings button next to “Start Reminder” will open the settings window above. Here you can allow Neko Reminder to store your settings and timers on your system. Blurmode changes how often the timers get updated should the tab or window of Neko Reminder not be active. 

![settings](https://raw.githubusercontent.com/Mitsunee/NekoReminder/master/.guide_images/guide_settings.png)

<a name="app"></a>
# NekoReminderApp
If you prefer having Neko Reminder in its own program check out [NekoReminderApp](https://github.com/Mitsunee/NekoReminderApp).

<a name="built-using"></a>
# Built using:

- [jquery](https://jquery.com/)
- [EnhancedJS](https://github.com/Mitsunee/EnhancedJS)
- [toastr](https://codeseven.github.io/toastr/)
