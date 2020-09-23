const express = require('express')

const {getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

// Include other resource routers
const courseRoute = require('./courses')

const router = express.Router()

//Re-Route into other resource router
router.use('/:bootcampId/courses',courseRoute)

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

router.route('/:id/photo').put(bootcampPhotoUpload)

router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamp)

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp)

module.exports = router

