const Property = require('../Models/propertyModel');
const APIFeatures = require('../utils/APIFeatures');

// ✅ GET: Single Property by ID
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: property,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// ✅ POST: Create a New Property
exports.createProperty = async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.user.id, // assumed middleware adds user
    };

    const newProperty = await Property.create(data);

    res.status(200).json({
      status: 'success',
      data: {
        data: newProperty,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// ✅ GET: All Properties (with search, filter, paginate)
exports.getProperties = async (req, res) => {
  try {
    console.log('Query parameters received:', req.query); // Debug log
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .paginate();

    const allProperties = await Property.find();
    const filteredProperties = await features.query;
    
    console.log('Filtered properties count:', filteredProperties.length); // Debug log
    console.log('All properties count:', allProperties.length); // Debug log

    res.status(200).json({
      status: 'success',
      no_of_responses: filteredProperties.length,
      all_properties: allProperties.length,
      data: filteredProperties,
    });
  } catch (err) {
    console.error('Error searching properties:', err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// ✅ GET: All Properties of a User (by userId)
exports.getUsersProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProperties = await Property.find({ userId });

    res.status(200).json({
      status: 'success',
      data_length: userProperties.length,
      data: userProperties,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// ADD this method at the end of propertyController.js
exports.getMyAccommodation = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user._id });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: properties
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};
