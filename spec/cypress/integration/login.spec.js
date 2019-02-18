context('Login action', () => {
  beforeEach(() => {
    // cy.exec('RAILS_ENV=cypress rails db:schema:load db:seed')
    cy.visit('localhost:3000')
  })

  it('expects to load page succesfully', () => {
    cy.contains('Sign in')
  })

  it('expects to render validation errors', () => {
    cy.get('[name="user[email]"]').type('asd@example.com')
    cy.get('[name="user[password]"]').type('invalid')
    cy.get('button').contains('Sign in').click()

    cy.contains('Invalid Email or password.')
  })
  
  it('expects to login sucessfully', () => {
    cy.get('[name="user[email]"]').type('user@example.com')
    cy.get('[name="user[password]"]').type('password')
    cy.get('button').contains('Sign in').click()

    cy.contains('Projects')
  })
})