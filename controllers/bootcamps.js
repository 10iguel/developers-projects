//Controllers , exports
const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @desc            Get all bootcamps
// @route           GET /api/v1/bootcamps
// @access          Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

// @desc            Get single bootcamp
// @route           GET /api/v/bootcamp/:id
// @access          Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    await res.status(200).json({success: true, data: bootcamp})
})

// @desc            Create new bootcamp
// @route           POST /api/v/bootcamps
// @access          Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
    //TODO: Add user to body.user
    req.body.user = req.user

    //TODO: Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

    //TODO: If the user is not and admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body);
    await res.status(201).json({
        success: true,
        data: bootcamp
    })
})

// @desc            Update bootcamp
// @route           PUT /api/v/bootcamps/:id
// @access          Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401))
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({success: true, data: bootcamp})
})

// @desc             Delete bootcamps
// @route           DELETE /api/v/bootcamps/:id
// @access          Pritave

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401))
    }

    bootcamp.remove()

    res.status(200).json({success: true, data: {}})
})

// @desc             Get bootcamps withina radius
// @route           DELETE /api/v/bootcamps/radius/:zipcode/:distance
// @access          Pritave

exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params
    //Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude
    // Calc radius using radians
    //Divide dist by radius of earth
    //Earth Radius = 3,963 mi / 6.378
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
        location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps

    })
})

// @desc            Upload photo for bootcamp
// @route           PUT /api/v/bootcamps/:id/photo
// @access          Pritave

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401))
    }

    if (!req.files) {
        return next(
            new ErrorResponse(`Please upload a file`, 400))
    }
    const file = req.files.file

    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(
            new ErrorResponse(`Please upload an image file`, 400))
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.log(err)
            return next(
                new ErrorResponse(`Problem with file upload`, 500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})

        res.status(200).json({
            success: true,
            data: file.name
        })
    })
})
