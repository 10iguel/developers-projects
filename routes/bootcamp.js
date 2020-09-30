const express = require('express')

const {getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')


// Include other resource routers
const courseRoute = require('./courses')

const router = express.Router()

const {protect}= require('../middleware/auth')

//Re-Route into other resource router
router.use('/:bootcampId/courses',courseRoute)

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius)

router.route('/:id/photo').put(protect,bootcampPhotoUpload)

router
    .route('/')
    .get(advancedResults(Bootcamp,'courses'),getBootcamps)
    .post(protect,createBootcamp)

router.route('/:id').get(getBootcamp).put(protect,updateBootcamp).delete(protect,deleteBootcamp)

module.exports = router

