// ==UserScript==
// @name           Github CommitDiff Viewer
// @author         Jun Hashimoto
// @description    Add diff link for github commit list page.
// @include        https://github.com/*
// @version        1.1.4
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
          commitArea: 'li.list-view-item',
          commitLink: 'div.d-flex span[aria-label="View commit details"]',
          headerButtonArea: 'AppHeader-actions',
          commitHash: 'commitHash',
          commitDiffButton: 'showDiffButton'
        },
        dom: {
          radioInputPrefix: '<span class="Button--secondary Button--small Button text-mono f6"><input type="radio" name="',
          commitDiffButton: '<div data-view-component="true" class="Button-withTooltip" id="showDiffButton"><a href="javascript:void(0);" class="Button Button--secondary Button--medium AppHeader-button color-fg-muted">Show Diff</a></div>'
        }
      };
    }

    // Build UI
    buildUI(currentUrl) {
      if (currentUrl.match(/\/commits\//)) {
        if (!document.getElementsByClassName(CommitDiffUIManager.UI_CONSTANTS['selector']['commitHash']).length) {
          this.createRadioInputs();
        }
        if (!document.getElementById(CommitDiffUIManager.UI_CONSTANTS['selector']['commitDiffButton'])) {
          this.createCommitDiffButton();
        }
      }
    }

    createRadioInputs() {
      let that = this;

      let commitAreas = document.querySelectorAll(CommitDiffUIManager.UI_CONSTANTS['selector']['commitArea']);
      Array.prototype.forEach.call(commitAreas, function(commitArea, i){
        let commitLink = commitArea.querySelector(CommitDiffUIManager.UI_CONSTANTS['selector']['commitLink']);
        let commitHash = commitLink.textContent.match(/[0-9a-f]+/)[0];

        let fromRadioButton = that.createRadioInput('commitFrom', 'from', commitHash);
        let toRadioButton   = that.createRadioInput('commitTo', 'to', commitHash);

        commitLink.insertAdjacentHTML('beforebegin', fromRadioButton);
        commitLink.insertAdjacentHTML('beforebegin', toRadioButton);
      });
    }

    createRadioInput(propertyName, textName, commitHash) {
      return CommitDiffUIManager.UI_CONSTANTS['dom']['radioInputPrefix'] + propertyName + '" value="' + commitHash + '"> ' + textName + '</span>';
    }

    createCommitDiffButton() {
      let diffButton       = CommitDiffUIManager.UI_CONSTANTS['dom']['commitDiffButton'];
      let headerButtonArea = document.getElementsByClassName(CommitDiffUIManager.UI_CONSTANTS['selector']['headerButtonArea'])[0];

      headerButtonArea.insertAdjacentHTML("beforeend", diffButton);
      document.getElementById(CommitDiffUIManager.UI_CONSTANTS['selector']['commitDiffButton']).addEventListener('click', this.showCommitCompareUrl());
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
      return document.querySelector(radioButtonSelector).getAttribute('value');
    }
  }

  // execute UserScript on browser, and export CommitDiffUIManager class on test
  if (typeof window === 'object') {
    const repositoryUrlRegExp = /https:\/\/github.com\/[^/]+\/[^/]+/;

    let match = location.href.match(repositoryUrlRegExp);
    if (match) {
      let repositoryUrl = match[0];
      let commitDiffUIManager = new CommitDiffUIManager(repositoryUrl);

      commitDiffUIManager.buildUI(location.href);

      document.addEventListener('pjax:end', () => {
        commitDiffUIManager.buildUI(location.href);
      });
    }
  } else {
    module.exports = CommitDiffUIManager;
  }
})();
