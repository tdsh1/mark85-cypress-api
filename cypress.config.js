const { defineConfig } = require("cypress");
require('dotenv').config()
const { connect } = require('./cypress/support/mongo')
const allureWriter = require('@shelex/cypress-allure-plugin/writer')


module.exports = defineConfig({
  e2e: {
    async setupNodeEvents(on, config) {
      allureWriter(on, config)
      // implement node event listeners here
      const db = await connect()

      on('task', {
        async removeUser(email) {
          const users = db.collection('users')
          await users.deleteMany({ email: email })
          return null
        },
        async removeTask(taskName, emailUser) {
          const users = db.collection('users')
          const user = users.findOne({ email: emailUser })
          const tasks = db.collection('tasks')
          await tasks.deleteMany({ name: taskName, user: user._id })
          return null
        },
        async removeTasksLike(key) {
          const tasks = db.collection('tasks')
          await tasks.deleteMany({ name: { $regex: key}})
          return null
        }
      })

      return config;      

    },

    baseUrl: process.env.BASE_URL,
    video: false,
    screenshotOnRunFailure: false,
    env: {
      amqpHost: process.env.AMQP_HOST,
      amqpQueue: process.env.AMQP_QUEUE,
      amqpToken: process.env.AMQP_TOKEN,
      allure: true
    }
  },
});
