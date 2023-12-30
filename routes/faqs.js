const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Faqs = require('../models/faqs');

router.get('/getFaqs', async (req, res) => {
    // TODO: get only activated shops
    const faqs = await Faqs.find();
    return res.send(faqs);
  });
  
  router.post('/faqs', async (req, res) => {
    const data = req.body;
    const faqs = await new Faqs(data).save();
    return res.send(faqs);
  });
  
 router.post('/faqs/:id', async (req, res) => {
    const faqsData = req.body;
    const id = req.params.id;
    if (!id || !mongoose.isValidObjectId(id)) {
      // TODO: send not found
      return res.status(404).send({});
    }
    faqsData.updatedDate = new Date();
    const updated = await Faqs.findOneAndUpdate({ _id: id }, faqsData, { new: true });
    return res.send(updated);
  });
  
  router.get('/faqs/social-network-goal', async (req,res) => {
    const faqs = await Faqs.find();
    ans = {
      socialNetwork: faqs[0].socialNetwork,
      goal: faqs[0].goal
    }
    return res.send(ans);

  });

  router.get('/faqs/admin', async (req,res) => {
    const faqs = await Faqs.find();
    ans = {
      admin: faqs[0].admin
    }
    return res.send(ans);
  });

  router.get('/faqs/about', async (req,res) => {
    const faqs = await Faqs.find();
    ans = faqs[0].about
    return res.send(ans);
  });

  router.get('/faqs/userAgreement', async (req,res) => {
    const faqs = await Faqs.find();
    ans = faqs[0].userAgreement;
    return res.send(ans);
  });

  router.delete('/faqs/:id', async (req, res) => {
    const shopId = req.params.id;
    if (!shopId || !mongoose.isValidObjectId(shopId)) {
      // TODO: send not found
      return res.status(404).send({});
    }
  
    try {
      await Faqs.deleteOne({ _id: shopId });
    } catch (e) {
      return res.status(500).send(e);
    }
    return res.status(200).send();
  });
    
  module.exports = router;
  