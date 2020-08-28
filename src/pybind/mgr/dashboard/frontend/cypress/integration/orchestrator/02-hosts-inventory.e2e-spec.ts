import { HostsPageHelper } from '../cluster/hosts.po';

describe('Hosts page', () => {
  const hosts = new HostsPageHelper();

  beforeEach(() => {
    cy.login();
    hosts.navigateTo();
  });

  describe('when Orchestrator is available', () => {
    beforeEach(function () {
      cy.fixture('orchestrator/inventory.json').as('hosts');
    });

    it('should display correct inventory', function () {
      for (const host of this.hosts) {
        hosts.clickHostTab(host.name, 'Inventory');
        cy.get('cd-host-details').within(() => {
          hosts.getTableTotalCount().should('be.eq', host.devices.length);
        });
      }
    });
  });
});
