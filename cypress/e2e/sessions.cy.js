describe('POST /sessions', () => {

    beforeEach( function()  {
        cy.fixture('users').then(function (users) {
            //contexto que recebe a massa de teste que armazena dentro de uma variavel de contexto da suite
            //o uso de fixture dessa forma só funciona com funções convencionais {(}function ()} 
            this.users = users
            
        })
    })

    it('user session', () => {
        cy.fixture('users').then(function(users){
            const userData = this.users.login
    
            cy.task('removeUser', userData.email)
    
            cy.postUser(userData)
    
            cy.postSession(userData)
                .then(response => {
                    expect(response.status).to.eq(200)
    
                    const {user, token} = response.body
    
                    expect(user.name).to.eq(userData.name)
                    expect(user.email).to.eq(userData.email)
                    expect(token).not.to.be.empty
                })
        })
    })

    it('invalid password', function() {

        const user = this.users.inv_pass

        cy.postSession(user)
            .then(response => {
                expect(response.status).to.eq(401)
            })

    })

    it('email not found', function() {

        const user = this.users.email_404

        cy.postSession(user)
            .then(response => {
                expect(response.status).to.eq(401)
            })

    })
})