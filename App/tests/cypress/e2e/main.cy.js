describe('Map interaction spec', () => {
    it('passes', () => {
        cy.visit('http://localhost:5173');

        // Click on all yellow icons on the map and check if their content appears
        cy.get('.leaflet-marker-icon-yellow').each(($icon) => {
            cy.wrap($icon).invoke('show').click({ force: true });
            cy.get('.leaflet-popup-content').should('be.visible');
        });

        // Click on all green icons on the map and check if their content appears
        cy.get('.leaflet-marker-icon-green').each(($icon) => {
            cy.wrap($icon).invoke('show').click({ force: true });
            cy.get('.leaflet-popup-content').should('be.visible');
        });

        // Open the admin panel
        cy.get('h1').contains('Admin').click();

        // Enter the password "admin"
        cy.get('input[type="password"]').type('admin');

        // Press the Enter key
        cy.get('input[type="password"]').type('{enter}');
        
        // Ensure that the admin panel is not open
        cy.get('input[type="password"]').should('not.exist').then(() => {
            // Click on all buttons
            cy.get('button').each(($button) => {
                cy.wrap($button).click();
            });
        });
    });
});