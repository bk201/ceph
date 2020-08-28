import { PageHelper } from '../page-helper.po';

const pages = {
  index: { url: '#/osd', id: 'cd-osd-list' },
  create: { url: '#/osd/create', id: 'cd-osd-form' }
};

export class OSDsPageHelper extends PageHelper {
  pages = pages;

  columnIndex = {
    id: 4,
    status: 5
  };

  @PageHelper.restrictTo(pages.create.url)
  create(deviceType: 'hdd' | 'ssd') {
    // Click Primary devices Add button
    cy.get('cd-osd-devices-selection-groups[name="Primary"]').as('primaryGroups');
    cy.get('@primaryGroups').find('button').click();

    // Select all devices with `deviceType`
    cy.get('cd-osd-devices-selection-modal').within(() => {
      cy.get('.modal-footer .tc_submitButton').as('addButton').should('be.disabled');
      this.filterTable('Type', deviceType);
      cy.get('@addButton').click();
    });

    cy.get('@primaryGroups').within(() => {
      this.getTableTotalCount().as('newOSDCount');
    });

    cy.get(`${pages.create.id} .card-footer .tc_submitButton`).click();
    cy.get(`cd-osd-creation-preview-modal .modal-footer .tc_submitButton`).click();
  }

  getRowByID(id: number) {
    return this.getTableCell(this.columnIndex.id, `${id}`).parent();
  }

  @PageHelper.restrictTo(pages.index.url)
  checkStatus(id: number, status: string[]) {
    this.getRowByID(id)
      .find(`datatable-body-cell:nth-child(${this.columnIndex.status}) .badge`)
      .should(($ele) => {
        const allStatus = $ele.toArray().map((v) => v.innerText);
        for (const s of status) {
          expect(allStatus).to.include(s);
        }
      });
  }

  @PageHelper.restrictTo(pages.index.url)
  ensureNoOsd(id: number) {
    cy.get(`datatable-body-row datatable-body-cell:nth-child(${this.columnIndex.id})`).should(
      ($ele) => {
        const osdIds = $ele.toArray().map((v) => v.innerText);
        expect(osdIds).to.not.include(`${id}`);
      }
    );
  }

  @PageHelper.restrictTo(pages.index.url)
  deleteByIDs(osdIds: number[], replace?: boolean) {
    this.getTableRows().each(($el) => {
      const rowOSD = Number(
        $el.find('datatable-body-cell .datatable-body-cell-label').get(this.columnIndex.id - 1)
          .textContent
      );
      if (osdIds.includes(rowOSD)) {
        cy.wrap($el).click();
      }
    });
    this.clickActionButton('delete');
    if (replace) {
      cy.get('cd-modal label[for="preserve"]').click();
    }
    cy.get('cd-modal label[for="confirmation"]').click();
    cy.contains('cd-modal button', 'Delete').click();
    cy.get('cd-modal').should('not.exist');
  }
}
