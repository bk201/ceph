import { OSDsPageHelper } from './osds.po';
import { DashboardPageHelper } from '../ui/dashboard.po';

describe('OSDs page', () => {
  const osds = new OSDsPageHelper();
  const dashboard = new DashboardPageHelper();

  beforeEach(() => {
    cy.login();
    osds.navigateTo();
  });

  describe('breadcrumb and tab tests', () => {
    it('should open and show breadcrumb', () => {
      osds.expectBreadcrumbText('OSDs');
    });

    it('should show two tabs', () => {
      osds.getTabsCount().should('eq', 2);
      osds.getTabText(0).should('eq', 'OSDs List');
      osds.getTabText(1).should('eq', 'Overall Performance');
    });
  });

  describe('check existence of fields on OSD page', () => {
    it('should check that number of rows and count in footer match', () => {
      osds.getTableTotalCount().then((text) => {
        osds.setPageSize(text.toString());
        osds.getTableRows().its('length').should('equal', text);
        osds.setPageSize('10');
      });
    });

    it('should verify that buttons exist', () => {
      cy.contains('button', 'Create');
      cy.contains('button', 'Cluster-wide configuration');
    });

    describe('by selecting one row in OSDs List', () => {
      beforeEach(() => {
        osds.getExpandCollapseElement().click();
      });

      it('should verify that selected footer increases', () => {
        osds.getTableSelectedCount().should('equal', 1);
      });

      it('should show the correct text for the tab labels', () => {
        cy.get('#tabset-osd-details > li > a').then(($tabs) => {
          const tabHeadings = $tabs.map((_i, e) => e.textContent).get();

          expect(tabHeadings).to.eql([
            'Devices',
            'Attributes (OSD map)',
            'Metadata',
            'Device health',
            'Performance counter',
            'Histogram',
            'Performance Details'
          ]);
        });
      });
    });
  });

  describe('when Orchestrator is available', () => {
    before(function () {
      if (!Cypress.env('WITH_ORCHESTRATOR')) {
        this.skip();
      }
    });

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
          osds.deleteByIDs([Number(oldCount)], false);
          // Replace the second OSD we created
          osds.navigateTo();
          osds.deleteByIDs([Number(oldCount)+1], true);
        });
      });
    });
  });
});
