const express = require('express')

const {getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius
} = require('../controllers/bootcamps')

// Include other resource routers
const courseRoute = require('./courses')

const router = express.Router()

//Re-Route into other resource router
router.use('/:bootcampId/courses',courseRoute)

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)
router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router

