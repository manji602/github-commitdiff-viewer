let path  = require('path');
let jsdom = require('jsdom');

let CommitDiffUIManager = require(path.join(__dirname, '..', 'github.commitdiff.user.js'));
const { JSDOM } = jsdom;

// define window after require user.js
const dom = new JSDOM(`
<span><input type="radio" name="commitFrom" checked="checked" value="abcdef0123456789"> from</span>
<span><input type="radio" name="commitTo" checked="checked" value="9876543210fedcba"> to</span>
`);

global.window   = dom.window;
global.document = dom.window.document;

// setup chai
let chai    = require('chai');
let should  = chai.should();

chai.use(require('chai-dom'));

describe('CommitDiffUIManager', () => {
  let commitDiffUIManager;
  let repositoryUrl = 'https://github.com/ghost/sample';

  beforeEach(() => {
    commitDiffUIManager = new CommitDiffUIManager(repositoryUrl);
  });

  describe('createRadioInput', () => {
    it('should return radio input DOM', () => {
      let propertyName = 'commitFrom';
      let textName     = 'from';
      let commitHash   = 'abcdef0123456789';

      let subject  = commitDiffUIManager.createRadioInput(propertyName, textName, commitHash);
      let expected = '<span class="commitHash BtnGroup-item btn btn-outline"><input type="radio" name="commitFrom" value="abcdef0123456789"> from</span>';

      subject.should.equal(expected);
    });
  });

  describe('createCommitCompareUrl', () => {
    it('should return commit compare url', () => {
      let subject  = commitDiffUIManager.createCommitCompareUrl();
      let expected = 'https://github.com/ghost/sample/compare/abcdef0123456789...9876543210fedcba';

      subject.should.equal(expected);
    });
  });

  describe('getCommitHash', () => {
    context('commitFrom', () => {
      it('should return commit hash', () => {
        let subject  = commitDiffUIManager.getCommitHash('commitFrom');
        let expected = 'abcdef0123456789';

        subject.should.equal(expected);
      });
    });

    context('commitTo', () => {
      it('should return commit hash', () => {
        let subject  = commitDiffUIManager.getCommitHash('commitTo');
        let expected = '9876543210fedcba';

        subject.should.equal(expected);
      });
    });
  });
});
