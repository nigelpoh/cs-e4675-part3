const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

var morgan = require('morgan')
morgan.token('body', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())

const Person = require('./models/person')

app.get('/api/persons', (_, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/info', (_, response) => {
  Person.find({}).then(result => {
    const currentDate = new Date()
    response.send(`Phonebook has info for ${result.length} people <br/><br/> ${currentDate.toString()}`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.deleteOne({ '_id': request.params.id }).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = structuredClone(request.body)
  Person.find({}).then(result => {
    if ((!Object.keys(person).includes('name') || !Object.keys(person).includes('number')) || (person.name === null || person.number === null || person.name === '' || person.number === '')){
      const e = new Error('Missing Number/Name')
      e.name = 'MissingNameNumber'
      return next(e)
    } else if (result.filter(p => p.name === person.name).length > 0) {
      const e = new Error('Non Unique Number/Name')
      e.name = 'NonUniqueNN'
      return next(e)
    }
    const personToSave = new Person({
      name: person.name,
      number: person.number
    })
    personToSave.save().then(result => {
      response.json(result)
    }).catch(error => next(error))
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson === null) {
        const e = Error('Person does not exist')
        e.name = 'DoesNotExistError'
        throw e
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'MissingNameNumber') {
    return response.status(400).send({ error: 'missing name or number' })
  } else if (error.name === 'NonUniqueNN') {
    return response.status(400).send({ error: 'name must be unique' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ type: 'valErr', error: error.message })
  } else if (error.name === 'DoesNotExistError') {
    return response.status(404).json({ error: 'person requested does not exist' })
  }

  next(error)
}
app.use(errorHandler)