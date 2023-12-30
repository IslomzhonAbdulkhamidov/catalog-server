const envs = require('dotenv').config()
const path = require('path');
const Receipe = require('../../models/Receipe');
const resFormat = require('../../helpers/responseFormat');
const constants = require('../../config/constants');
const got = require("got");
const sharp = require('sharp');
const { uploadS3 } = require("../../helpers/s3Async");

const getCurrentUrl = (id) => {
  const env = envs.parsed.ENV.toUpperCase()
  let url = 'https://app.myka.ai/recipe?id=' + id
  switch (env) {
    case 'PROD':
      break
    case 'STAGE':
      url = 'https://app-stage.myka.ai/recipe?id=' + id
      break
    case 'DEV':
      url = 'https://app-dev.myka.ai/recipe?id=' + id
  }
  return url
}

module.exports.handleShareLink = async (req, res) => {
  const {id} = req.query
  try {
    const recipe = await Receipe.findById(id);
    if (!recipe) {
      return res.status(404).send(resFormat.rError('Recipe not found'))
    }
    const fileUrl = constants.s3Details.url + "/" + constants.s3Details.receipePath + recipe.defaultImage;
    let imageSize = null;
    const bb = await got(fileUrl).buffer();
    imageSize = Buffer.byteLength(bb) / 1000;
    if (imageSize > 300) {
      const data = await sharp(bb).jpeg({ quality: 20 }).toBuffer();
      const newimage = await uploadS3(recipe.defaultImage, data);
    }
    res.render(path.join("share-link", "share-link.pug"), {
      title: `Myka |\u00A0${recipe.title}`,
      description: "Shared recipe: " + recipe.title,
      imgUrl: fileUrl,
      itemUrl: getCurrentUrl(recipe._id),
    });
    
  } catch (e) {
    res.send(resFormat.rError('Recipe not found'))
  }  
}
