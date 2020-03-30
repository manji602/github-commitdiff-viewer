// ==UserScript==
// @name           Github CommitDiff Viewer
// @author         Jun Hashimoto
// @description    Add diff link for github commit list page.
// @include        https://github.com/*
// @version        1.1.3
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
          commitArea: '.commit-links-group',
          commitLink: 'div.BtnGroup clipboard-copy.btn-outline',
          headerButtonArea: 'pagehead-actions',
          commitHash: 'commitHash',
          commitDiffButton: 'showDiffButton'
        },
        attribute: {
          commitHash: 'value'
        },
        dom: {
          radioInputPrefix: '<span class="commitHash BtnGroup-item btn btn-outline"><input type="radio" name="',
          commitDiffButton: '<li id="showDiffButton"><a href="#" class="btn btn-sm showDiffLink">Show Diff</a></li>'
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
        let commitHash = commitLink.getAttribute(CommitDiffUIManager.UI_CONSTANTS['attribute']['commitHash']);

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
