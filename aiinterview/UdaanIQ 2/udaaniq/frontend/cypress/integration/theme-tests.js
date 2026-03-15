// Visual Regression Tests for Theme Functionality

describe('Theme Functionality Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Light Mode', () => {
    beforeEach(() => {
      // Ensure we're in light mode
      cy.get('body').then(($body) => {
        if ($body.attr('data-theme') === 'dark') {
          cy.get('[data-testid="theme-toggle"]').click();
        }
      });
    });

    it('displays home dashboard correctly in light mode', () => {
      cy.get('[data-testid="dashboard"]').should('be.visible');
      cy.matchImageSnapshot('home-dashboard-light');
    });

    it('displays expanded sidebar correctly in light mode', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.matchImageSnapshot('sidebar-expanded-light');
    });

    it('displays footer correctly in light mode', () => {
      cy.get('footer').should('be.visible');
      cy.matchImageSnapshot('footer-light');
    });

    it('displays card hover effect correctly in light mode', () => {
      cy.get('[data-testid="dashboard-card"]')
        .first()
        .trigger('mouseover')
        .matchImageSnapshot('card-hover-light');
    });
  });

  context('Dark Mode', () => {
    beforeEach(() => {
      // Ensure we're in dark mode
      cy.get('body').then(($body) => {
        if ($body.attr('data-theme') !== 'dark') {
          cy.get('[data-testid="theme-toggle"]').click();
        }
      });
    });

    it('displays home dashboard correctly in dark mode', () => {
      cy.get('[data-testid="dashboard"]').should('be.visible');
      cy.matchImageSnapshot('home-dashboard-dark');
    });

    it('displays expanded sidebar correctly in dark mode', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.matchImageSnapshot('sidebar-expanded-dark');
    });

    it('displays footer correctly in dark mode', () => {
      cy.get('footer').should('be.visible');
      cy.matchImageSnapshot('footer-dark');
    });

    it('displays card hover effect correctly in dark mode', () => {
      cy.get('[data-testid="dashboard-card"]')
        .first()
        .trigger('mouseover')
        .matchImageSnapshot('card-hover-dark');
    });
  });

  context('Theme Toggle', () => {
    it('switches between light and dark mode correctly', () => {
      // Start in light mode
      cy.get('body').should('have.attr', 'data-theme', 'light');
      
      // Toggle to dark mode
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('body').should('have.attr', 'data-theme', 'dark');
      cy.matchImageSnapshot('theme-toggle-dark');
      
      // Toggle back to light mode
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('body').should('have.attr', 'data-theme', 'light');
      cy.matchImageSnapshot('theme-toggle-light');
    });
  });

  context('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });

    it('displays mobile sidebar correctly in light mode', () => {
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
      cy.matchImageSnapshot('mobile-sidebar-light');
    });

    it('displays mobile sidebar correctly in dark mode', () => {
      // Switch to dark mode
      cy.get('[data-testid="theme-toggle"]').click();
      
      // Open mobile sidebar
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
      cy.matchImageSnapshot('mobile-sidebar-dark');
    });
  });
});