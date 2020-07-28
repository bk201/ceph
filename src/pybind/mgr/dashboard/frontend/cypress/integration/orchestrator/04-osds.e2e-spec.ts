import { OSDsPageHelper } from '../cluster/osds.po';
import { DashboardPageHelper } from '../ui/dashboard.po';

describe('OSDs page', () => {
  const osds = new OSDsPageHelper();
  const dashboard = new DashboardPageHelper();

  before(function () {
    if (!Cypress.env('WITH_ORCHESTRATOR')) {
      this.skip();
    }
  });

  beforeEach(() => {
    cy.login();
    osds.navigateTo();
  });

  describe('when Orchestrator is available', () => {
    it('should create and delete OSDs', () => {
      osds.getTableTotalCount().as('initOSDCount');
      osds.navigateTo('create');
      osds.create('hdd');

      cy.get('@newOSDCount').then((newCount) => {
        cy.get('@initOSDCount').then((oldCount) => {
          const expectedCount = Number(oldCount) + Number(newCount);

          // check total rows
          osds.waitTableCount('total', expectedCount);

          // landing page is easier to check OSD status
          dashboard.navigateTo();
          dashboard.infoCardBody('OSDs').should('contain.text', `${expectedCount} total`);
          dashboard.infoCardBody('OSDs').should('contain.text', `${expectedCount} up`);
          dashboard.infoCardBody('OSDs').should('contain.text', `${expectedCount} in`);

          expect(Number(newCount)).to.be.gte(2);
          // Delete the first OSD we created
          osds.navigateTo();
          const deleteOsdId = Number(oldCount);
          osds.deleteByIDs([deleteOsdId], false);
          osds.ensureNoOsd(deleteOsdId);

          // Replace the second OSD we created
          const replaceID = Number(oldCount) + 1;
          osds.deleteByIDs([replaceID], true);
          // deleting OSDs doesn't work in cephadm right now, skip checking
          osds.checkStatus(replaceID, ['destroyed']);
        });
      });
    });
  });
});
