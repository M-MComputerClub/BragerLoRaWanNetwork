describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:5173');

    // Kliknij przycisk Admin
    cy.get('h1').contains('Admin').click();

    // Wprowadź hasło "admin"
    cy.get('input[type="password"]').type('admin');

    // Naciśnij klawisz Enter
    cy.get('input[type="password"]').type('{enter}');

    // Sprawdź, czy test został zakończony po potwierdzeniu hasła
    cy.get('input[type="password"]').should('not.exist'); // Możesz wybrać dowolny selektor, który wskazuje, że panel admina jest widoczny
  });
});