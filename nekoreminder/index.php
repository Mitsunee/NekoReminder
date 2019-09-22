<!DOCTYPE html>
<html>
<head>
    <title>Neko Reminder</title>
    <meta charset="utf-8">
    <link rel="shortcut icon" href="favicon.ico">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="The accurate browser-based Reminder tool built on custom time-keeping code.">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Neko Reminder">
    <meta name="twitter:description" content="The accurate browser-based Reminder tool built on custom time-keeping code.">
    <meta name="twitter:image" content="favicon.png">
    <meta name="twitter:creator" content="@Mitsunee">
    <meta property="og:title" content="Neko Reminder">
    <meta property="og:image" content="favicon.png">
    <meta property="og:description" content="The accurate browser-based Reminder tool built on custom time-keeping code.">
    <link rel="stylesheet" href="assets/css/toastr-2.1.3.min.css">
    <link rel="stylesheet" href="assets/css/main.css?_<?php echo filemtime("assets/css/main.css");?>">
    <script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
    <script src="assets/js/nekoreminder.min.js?_<?php echo filemtime("assets/js/nekoreminder.min.js");?>"></script>
</head>
<body>
    <noscript>This site relies on javascript. It appears your browser is blocking javascript or does not support it.</noscript>
    <section id="settings" style="display:none;">
        <button onclick="$(this.parentElement).hide(200);">X</button>
        <h1>Settings</h1>
        <form onsubmit="return false;" oninput="neko.updateStorage();">
            <h3>Cookies & Storage</h3>
            <label for="reminder-allow-cookie"><input type="checkbox" id="reminder-allow-cookie"> Allow Neko Reminder to save cookies</label>
            <p>Allowing cookies enables Neko Reminder to save your timers and settings on your machine so they don't get lost when you close this page!</p>
            <h3>Blurmode</h3>
            <label for="reminder-onblur-setting"><input type="checkbox" id="reminder-onblur-setting"> Lower Tickrate when tab not active</label>
            <p>Blurmode interval: <input type="number" value="5" id="reminder-blurmode-interval"> seconds.</p>
            <h3>Darkmode</h3>
            <label for="reminder-darkmode-setting"><input type="checkbox" id="reminder-darkmode-setting"> Enable Darkmode</label>
        </form>
    </section>
    <section id="form">
        <p style="display:none;">The accurate browser-based Reminder tool built on custom time-keeping code.</p>
        <h1>New Reminder</h1>
        <table>
            <tr>
                <td>Remind in:</td>
                <td><div class="tags-input" id="reminder-number" title="Tip: You can use the following units: h, hr, m, min, s, sec and seperate multiple using a Comma or Space"><input type="text" placeholder="Time"></div></td>
            </tr>
            <tr>
                <td>Note:</td>
                <td><input type="text" id="reminder-note" placeholder="Timer title"></td>
            </tr>
        </table>
        <button id="reminder-submit">Start Reminder</button><button onclick="$('#settings').show(200);">Settings</button>
    </section>
    <section id="timer-area"></section>
    <footer>&copy;2019 Mitsunee</footer>
</body>
</html>
