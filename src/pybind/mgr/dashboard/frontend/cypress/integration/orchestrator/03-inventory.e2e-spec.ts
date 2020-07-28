import { InventoryPageHelper } from '../cluster/inventory.po';

describe('Inventory page', () => {
  const inventory = new InventoryPageHelper();

  before(function () {
    if (!Cypress.env('WITH_ORCHESTRATOR')) {
      this.skip();
    }
  });

  beforeEach(() => {
    cy.login();
    inventory.navigateTo();
  });

  it('should have correct devices', () => {
    cy.fixture('orchestrator/inventory.json').then((hosts) => {
      const totalDiskCount = Cypress._.sumBy(hosts, 'devices.length');
      inventory.getTableTotalCount().should('be.eq', totalDiskCount);
      for (const host of hosts) {
        inventory.filterTable('Hostname', host['name']);
        inventory.getTableFoundCount().should('be.eq', host.devices.length);
      }
    });
  });

  it('should identify device', () => {
    inventory.identify();
  });
});
