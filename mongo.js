const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb://admin:${password}@SG-boiled-stag-9635-61061.servers.mongodirector.com:27017/phonebook?authSource=admin`
mongoose.set('strictQuery',false)
mongoose.connect(url)
mongoose.connection.useDb('phonebook')

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(p => {
          console.log(`${p.name} ${p.number}`)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length == 5) {
    const person = new Person({
        id: Math.floor(Math.random() * 1e7),
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    mongoose.connection.close()
}