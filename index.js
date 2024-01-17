const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

var morgan = require('morgan')
morgan.token('body', function (req, res) { 
    if (req.method == "POST") {
        return JSON.stringify(req.body)
    }
    return ""
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())

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

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  Person.find({}).then(result => {
    mongoose.connection.close()
    const currentDate = new Date(); 
    response.send(`Phonebook has info for ${result.length} people <br/><br/> ${currentDate.toString()}`)
  })
})

app.get('/api/persons/:id', (request, response) => {
    Person.find({ id: request.params.id }).then(result => {
      if (result.length > 1) {
        response.json(person[0])
      } else {
          response.status(404).end()
      }
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const person = structuredClone(request.body)
    if ((!Object.keys(person).includes("name") || !Object.keys(person).includes("number")) || (person.name == null || person.number == null || person.name == "" || person.number == "")){
        return response.status(400).json({ 
            error: 'missing name or number' 
        })
    } else if (persons.filter(p => p.name == person.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const personToSave = new Person({
      id: Math.floor(Math.random() * 1e7),
      name: person.name,
      number: person.number
    })
    personToSave.save().then(result => {
        mongoose.connection.close()
        response.json(personToSave)
    })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})