// ==UserScript==
// @name           Github CommitDiff Viewer
// @author         Jun Hashimoto
// @description    Add diff link for github commit list page.
// @include        https://github.com/*
// @version        1.0.4
// @require        http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

var buttonArea = $('.pagehead-actions:first');

var makeDiffButton = function() {
    var diffButton = $('<li id="showDiffButton"><a href="#" class="btn btn-sm showDiffLink">Show Diff</a></li>');
    diffButton.bind("click", showDiffLink);
    buttonArea.append(diffButton);
};

var removeDiffButton = function() {
    if ($('li#showDiffButton')) {
        $('li#showDiffButton').remove();
    }
};

var makeRadioButtons = function() {
    var commitAreas = $('.commit-links-cell');
    commitAreas.each(function(){
        $(this).css('width', '350px');
        var commitLink = $(this).find('.zeroclipboard-button:first');
        var commitHash = commitLink.attr('data-clipboard-text');
        var fromRadioButton = makeRadioButton('commitFrom', 'from', commitHash);
        var toRadioButton   = makeRadioButton('commitTo', 'to', commitHash);
        $(this).append(fromRadioButton);
        $(this).append(toRadioButton);
    });
};

var makeRadioButton = function(propertyName, textName, commitHash){
    return $('<span><input type="radio" name=' + propertyName + ' value=' + commitHash + '></input>' + textName + '</span>');
};

var showDiffLink = function() {
    var fromCommit = getCommitHash('commitFrom');
    var toCommit   = getCommitHash('commitTo');
    if (fromCommit && toCommit) {
        var currentUrl      = location.href;
        var commitUrlHeader = getCommitUrl(currentUrl);
        var commitUrl       = commitUrlHeader + fromCommit + '...' + toCommit;
        location.href       = commitUrl;
    }
};

var getCommitHash = function(className) {
    var radioButtonAttribute = 'input[name=' + className + ']:checked';
    return $(radioButtonAttribute).attr('value');
};

var getCommitUrl = function(currentUrl) {
    return currentUrl.replace(/commits\/(\S+)/, 'compare/');
};

// main function
var main = function() {
    if( location.pathname.match(/\/commits\//) ) {
        makeDiffButton();
        makeRadioButtons();
    } else {
        removeDiffButton();
    }
};

unsafeWindow.$(unsafeWindow.document).on('pjax:success', function(){
    main();
});

$(document).ready(function() {
    main();
});
