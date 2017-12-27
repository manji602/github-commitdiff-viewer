// ==UserScript==
// @name           Github CommitDiff Viewer
// @author         Jun Hashimoto
// @description    Add diff link for github commit list page.
// @include        https://github.com/*
// @version        1.0.4
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function() {
  'use strict';

  class CommitDiffUIManager {
    // repositoryUrl: https://github.com/xxx/yyy
    constructor(repositoryUrl) {
      this.repositoryUrl = repositoryUrl;
    }

    static get UI_CONSTANTS() {
      return {
        selector: {
          commitArea: '.commit-links-cell',
          commitLink: 'div.BtnGroup .zeroclipboard-button:first',
          headerButtonArea: '.pagehead-actions',
          radioInput: 'input.commitHash',
          commitDiffButton: 'li#showDiffButton'
        },
        attribute: {
          commitHash: 'data-clipboard-text'
        },
        dom: {
          radioInputPrefix: '<span class="commitHash BtnGroup-item btn btn-outline"><input type="radio" name=',
          commitDiffButton: '<li id="showDiffButton"><a href="#" class="btn btn-sm showDiffLink">Show Diff</a></li>'
        }
      };
    }

    // Build UI
    buildUI(currentUrl) {
      if (currentUrl.match(/\/commits\//)) {
        if (!$(CommitDiffUIManager.UI_CONSTANTS['selector']['radioInput']).length) {
          this.createRadioInputs();
        }
        if (!$(CommitDiffUIManager.UI_CONSTANTS['selector']['commitDiffButton']).length) {
          this.createCommitDiffButton();
        }
      }
    }

    createRadioInputs() {
      let that = this;

      $(CommitDiffUIManager.UI_CONSTANTS['selector']['commitArea']).each(function() {
        let commitLink = $(this).find(CommitDiffUIManager.UI_CONSTANTS['selector']['commitLink']);
        let commitHash = commitLink.attr(CommitDiffUIManager.UI_CONSTANTS['attribute']['commitHash']);

        let fromRadioButton = that.createRadioInput('commitFrom', 'from', commitHash);
        let toRadioButton   = that.createRadioInput('commitTo', 'to', commitHash);

        commitLink.before(fromRadioButton);
        commitLink.before(toRadioButton);
    });

    }
    createRadioInput(propertyName, textName, commitHash) {
      return $(CommitDiffUIManager.UI_CONSTANTS['dom']['radioInputPrefix'] + propertyName + ' value=' + commitHash + '> ' + textName + '</span>');
    }

    createCommitDiffButton() {
      let diffButton = $(CommitDiffUIManager.UI_CONSTANTS['dom']['commitDiffButton']);
      diffButton.bind('click', this.showCommitCompareUrl());

      $(CommitDiffUIManager.UI_CONSTANTS['selector']['headerButtonArea']).append(diffButton);
    }

    // Show commit compare URL
    showCommitCompareUrl() {
      const func = () => {
        let commitCompareUrl = this.createCommitCompareUrl();

        if (commitCompareUrl) {
          location.href = commitCompareUrl;
        }
      };

      return func;
    }

    createCommitCompareUrl() {
      let fromCommit = this.getCommitHash('commitFrom');
      let toCommit   = this.getCommitHash('commitTo');

      if (fromCommit && toCommit) {
        return this.repositoryUrl + '/compare/' + fromCommit + '...' + toCommit;
      } else {
        return undefined;
      }
    }

    getCommitHash(className) {
      let radioButtonSelector = 'input[name=' + className + ']:checked';
      return $(radioButtonSelector).attr('value');
    }
  }

  // execute UserScript on browser, and export NGWordManager class on test
  if (typeof window === 'object') {
    const repositoryUrlRegExp = /https:\/\/github.com\/[^/]+\/[^/]+/;

    let runUserScript = () => {
      let match = location.href.match(repositoryUrlRegExp);
      if (match) {
        let repositoryUrl = match[0];
        let commitDiffUIManager = new CommitDiffUIManager(repositoryUrl);

        commitDiffUIManager.buildUI(location.href);

        $(document).on('pjax:end', () => {
          commitDiffUIManager.buildUI(location.href);
        });
      }
    };

    runUserScript();
  } else {
    module.exports = CommitDiffUIManager;
  }
})();

/*
var buttonArea = $('.pagehead-actions');

var makeDiffButton = function() {
    var diffButton = $('<li id="showDiffButton"><a href="#" class="btn btn-sm showDiffLink">Show Diff</a></li>');
    diffButton.bind("click", showDiffLink);
    $('.pagehead-actions').append(diffButton);
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

unsafeWindow.$(unsafeWindow.document).on('pjax:end', function(){
    main();
});

$(document).ready(function() {
    main();
});
*/
