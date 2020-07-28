import { PageHelper } from '../page-helper.po';

const pages = {
  index: { url: '#/osd', id: 'cd-osd-list' },
  create: { url: '#/osd/create', id: 'cd-osd-form' }
};

export class OSDsPageHelper extends PageHelper {
  pages = pages;

  @PageHelper.restrictTo(pages.create.url)
  create(deviceType: 'hdd'|'ssd') {
    // Click Primary devices Add button
    cy.get('cd-osd-devices-selection-groups[name="Primary"]').as('primaryGroups');
    cy.get('@primaryGroups').find('button').click();

    // Select all devices with `deviceType`
    cy.get('cd-osd-devices-selection-modal').within(() => {
      cy.get('.modal-footer .tc_submitButton').as('addButton').should('be.disabled');
      this.filterTable('Type', deviceType);
      this.filterTable('Size', '10 GiB');
      cy.get('@addButton').click();
    });

    cy.get('@primaryGroups').within(()=> {
      this.getTableTotalCount().as('newOSDCount')
    });

    cy.get(`${pages.create.id} .card-footer .tc_submitButton`).click();
    cy.get(`cd-osd-creation-preview-modal .modal-footer .tc_submitButton`).click();
  }

  @PageHelper.restrictTo(pages.index.url)
  deleteByIDs(osdIds: number[], replace?: boolean) {
    this.getTableRows().each(($el) => {
      const rowOSD = Number($el.find('datatable-body-cell .datatable-body-cell-label').get(3).textContent);
      if (osdIds.includes(rowOSD)) {
        cy.wrap($el).click();
      }
    });

    cy.get('.table-actions button.dropdown-toggle').first().click(); // open submenu
    cy.get('button.delete').click(); // click on "delete" menu item
    if (replace) {
      cy.get('cd-modal label[for="preserve"]').click();
    }
    cy.get('cd-modal label[for="confirmation"]').click();
    cy.contains('cd-modal button', 'Delete').click();
    cy.get('cd-modal').should('not.exist');
  }
}
