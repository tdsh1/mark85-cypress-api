describe('POST /tasks', () => {
    beforeEach(function () {
        cy.fixture('tasks/post').then(function (tasks) {
            this.tasks = tasks
        })
    })

    context('register a new task', function () {
        before(function () {
            //purge
            cy.purgeQueueMessages()
                .then(response => {
                    expect(response.status).to.eq(204)
                })
        })

        it('post task', function () {

            const { user, task } = this.tasks.create

            cy.task('removeUser', user.email)
            cy.postUser(user)

            cy.postSession(user)
                .then(userResp => {

                    cy.task('removeTask', task.name, user.email)

                    cy.postTask(task, userResp.body.token)
                        .then(response => {
                            expect(response.status).to.eq(201)
                            expect(response.body.name).to.eq(task.name)
                            //eql não se preocupa com a tipagem dos dados, só com o conteudo
                            expect(response.body.tags).to.eql(task.tags)
                            expect(response.body.is_done).to.be.false
                            expect(response.body.user).to.eq(userResp.body.user._id)
                            expect(response.body._id.length).to.eq(24)
                        })
                })
        })



        after(function () {
            const { user, task } = this.tasks.create
            //get message
            cy.wait(2000)
            cy.getMessageQueue()
                .then(response => {
                    expect(response.status).to.eq(200)
                    //descomentar quando RabbitMQ desbugar kkk
                    cy.log(JSON.stringify(response.body))
                    expect(response.body[0].payload).to.include(user.name.split(' ')[0])
                    expect(response.body[0].payload).to.include(task.name)
                    expect(response.body[0].payload).to.include(user.email)
                })



        })

        it('duplicate task', function () {

            const { user, task } = this.tasks.dup

            cy.task('removeUser', user.email)
            cy.postUser(user)

            cy.postSession(user)
                .then(userResp => {

                    cy.task('removeTask', task.name, user.email)

                    cy.postTask(task, userResp.body.token)

                    cy.postTask(task, userResp.body.token)
                        .then(response => {
                            expect(response.status).to.eq(409)
                            expect(response.body.message).to.eq('Duplicated task!')

                        })
                })
        })

    })
})