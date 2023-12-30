const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Banner = require('../models/banner');
const Slider = require('../models/slider');

// Get list of sliders
router.get('/all-sliders', async (req, res) => {
  const allSliders = await Slider.find();
  return res.send(allSliders);
});
// Create Slider
router.post('/slider', async (req, res) => {
  const data = req.body;
  const newSlider = await new Slider(data).save();
  return res.send(newSlider);
});

// Show Slider
router.get('/slider/:id', async (req, res) => {
  const sliderId = req.params.id;
  if (!sliderId || !mongoose.isValidObjectId(sliderId)) {
    return res.status(404).send({});
  }
  const slider = await Slider.findById(sliderId);
  return res.send(slider);
});

// Update Slider
router.post('/slider/:id', async (req, res) => {
  const sliderData = req.body;
  const sliderId = req.params.id;
  if (!sliderId || !mongoose.isValidObjectId(sliderId)) {
    return res.status(404).send({});
  }
  sliderData.updatedDate = new Date();
  const updatedSlider = await Slider.findOneAndUpdate({_id: sliderId}, sliderData, {new: true});
  return res.send(updatedBaner);
});
// Delete Slider
router.delete('/slider/:id', async (req, res) => {
  const sliderId = req.params.id;
  if (!sliderId || !mongoose.isValidObjectId(sliderId)) {
    return res.status(404).send({});
  }

  try {
    await Slider.deleteOne({_id: sliderId});
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.status(200).send();
});

// Get list of banners
router.get('/all-banners', async (req, res) => {
    const allBanners = await Banner.find();
    return res.send(allBanners);
  });

  // Get list of main banners
  router.get('/all-main-banners', async (req, res) => {
    const allBanners = await Banner.find({'isMain': true, 'isActive': true});
    return res.send(allBanners);
  });

  // Get list of main banners
  router.get('/all-single-banners', async (req, res) => {
    const allBanners = await Banner.find({'isSingle': true,'isActive': true});
    return res.send(allBanners);
  });

  // Create Banner
  router.post('/banner', async (req, res) => {
    const data = req.body;
    const newBanner = await new Banner(data).save();
    return res.send(newBanner);
  });
  
  // Show Banner
  router.get('/banner/:id', async (req, res) => {
    const bannerId = req.params.id;
    if (!bannerId || !mongoose.isValidObjectId(bannerId)) {
      return res.status(404).send({});
    }
    const banner = await Banner.findById(bannerId);
    return res.send(banner);
  });
  
  // Update Banner
  router.post('/banner/:id', async (req, res) => {
    const bannerData = req.body;
    const bannerId = req.params.id;
    if (!bannerId || !mongoose.isValidObjectId(bannerId)) {
      return res.status(404).send({});
    }
    bannerData.updatedDate = new Date();
    const updatedBanner = await Banner.findOneAndUpdate({_id: bannerId}, bannerData, {new: true});
    return res.send(updatedBaner);
  });
  // Delete Banner
  router.delete('/banner/:id', async (req, res) => {
    const bannerId = req.params.id;
    if (!bannerId || !mongoose.isValidObjectId(bannerId)) {
      return res.status(404).send({});
    }
  
    try {
      await Banner.deleteOne({_id: bannerId});
    } catch (e) {
      return res.status(500).send(e);
    }
    return res.status(200).send();
  });

module.exports = router;
